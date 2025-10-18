"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { validateUUID } from "@/lib/validation";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rateLimit";
import {
	validateLessonIds,
	validateLessonProgress,
} from "@/lib/lessonValidation";
import {
	UserProgress as UserProgressType,
	buildSkillTreeFromLessons,
	recalculateSkillNodes,
	calculateCurrentSkillNodeId,
} from "@/lib/progressionSystem";

export async function saveUserProgress(
	userId: string,
	progress: UserProgressType
) {
	try {
		// Verify ownership - user can only save their own progress
		const session = await requireAuth();
		if (session.id !== userId) {
			return { success: false, error: "Unauthorized" };
		}

		// Validate userId format
		if (!validateUUID(userId)) {
			return { success: false, error: "Invalid user ID" };
		}

		// Rate limiting - 10 saves per minute per user
		const rateLimitKey = getRateLimitKey(userId, null, "progress_save");
		const rateLimit = checkRateLimit(
			rateLimitKey,
			RATE_LIMITS.PROGRESS_SAVE.limit,
			RATE_LIMITS.PROGRESS_SAVE.windowMs
		);

		if (!rateLimit.allowed) {
			return {
				success: false,
				error: `Rate limit exceeded. Please try again in ${Math.ceil(
					(rateLimit.resetTime - Date.now()) / 1000
				)} seconds.`,
			};
		}

		// Validate lessonProgress structure
		const lessonValidation = validateLessonProgress(
			progress.lessonProgress
		);

		if (!lessonValidation.allValid) {
			console.warn(
				`Invalid lesson progress filtered out:`,
				lessonValidation.invalid
			);
		}

		// Only save xp, level, and validated lessonProgress
		// skillNodes and currentSkillNodeId will be calculated on load
		await prisma.userProgress.upsert({
			where: { userId },
			update: {
				xp: progress.xp,
				level: progress.level,
				lessonProgress: lessonValidation.valid,
			},
			create: {
				userId,
				xp: progress.xp,
				level: progress.level,
				lessonProgress: lessonValidation.valid,
			},
		});

		return {
			success: true,
			filteredProgress:
				lessonValidation.invalid.length > 0
					? {
							invalid: lessonValidation.invalid,
							valid: Object.keys(lessonValidation.valid).length,
					  }
					: undefined,
		};
	} catch (error) {
		// console.error("Failed to save user progress:", error);
		return { success: false, error: "Failed to save progress" };
	}
}

export async function loadUserProgress(
	userId: string,
	lessonMetadata: { id: string; skillNodeId: string }[]
): Promise<UserProgressType | null> {
	try {
		// Verify ownership - user can only load their own progress
		const session = await requireAuth();
		if (session.id !== userId) {
			throw new Error("Unauthorized");
		}

		// Validate userId format
		if (!validateUUID(userId)) {
			throw new Error("Invalid user ID");
		}

		const progress = await prisma.userProgress.findUnique({
			where: { userId },
		});

		if (!progress) {
			return null;
		}

		const lessonProgress = progress.lessonProgress as unknown as Record<
			string,
			{ currentStep: number; completed: boolean }
		>;

		// Validate and filter lesson progress from loaded data
		const lessonValidation = validateLessonProgress(lessonProgress);
		const validLessonProgress = lessonValidation.valid;

		// Calculate current skill node from validated lesson progress
		const currentSkillNodeId = calculateCurrentSkillNodeId(
			validLessonProgress,
			lessonMetadata
		);

		// Build skill tree from lesson metadata and calculate progress
		const skillNodes = buildSkillTreeFromLessons(lessonMetadata);
		const calculatedSkillNodes = recalculateSkillNodes(
			skillNodes,
			validLessonProgress
		);

		return {
			xp: progress.xp,
			level: progress.level,
			currentSkillNodeId,
			lessonProgress: validLessonProgress,
			skillNodes: calculatedSkillNodes,
		};
	} catch (error) {
		// console.error("Failed to load user progress:", error);
		return null;
	}
}

/**
 * Migrate and merge localStorage (guest) data with user's database progress
 *
 * This function intelligently merges guest progress with existing user progress:
 * - For NEW users: Creates database record with guest data
 * - For EXISTING users: Merges by taking the most advanced progress:
 *   - XP: Takes the higher value
 *   - Level: Takes the higher value
 *   - Completed Lessons: Merges both arrays (union of all completed lessons)
 *
 * This ensures users never lose progress when switching between guest and logged-in modes
 */
export async function migrateLocalStorageData(
	userId: string,
	localProgress: UserProgressType
) {
	try {
		// Verify ownership - user can only migrate their own data
		const session = await requireAuth();
		if (session.id !== userId) {
			return { success: false, error: "Unauthorized" };
		}

		// Validate userId format
		if (!validateUUID(userId)) {
			return { success: false, error: "Invalid user ID" };
		}

		// Rate limiting - 5 migrations per minute per user
		const rateLimitKey = getRateLimitKey(
			userId,
			null,
			"progress_migration"
		);
		const rateLimit = checkRateLimit(
			rateLimitKey,
			RATE_LIMITS.PROGRESS_MIGRATION.limit,
			RATE_LIMITS.PROGRESS_MIGRATION.windowMs
		);

		if (!rateLimit.allowed) {
			return {
				success: false,
				error: `Rate limit exceeded. Please try again in ${Math.ceil(
					(rateLimit.resetTime - Date.now()) / 1000
				)} seconds.`,
			};
		}

		// Validate lesson progress in local progress
		const localLessonValidation = validateLessonProgress(
			localProgress.lessonProgress
		);

		// Use transaction to prevent race conditions
		const result = await prisma.$transaction(async (tx) => {
			// Ensure user exists in database first
			const user = await tx.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				throw new Error("User not found");
			}

			// Check if user already has progress in the database
			const existingProgress = await tx.userProgress.findUnique({
				where: { userId },
			});

			// NEW USER: Create database record with validated guest data
			if (!existingProgress) {
				await tx.userProgress.create({
					data: {
						userId,
						xp: localProgress.xp,
						level: localProgress.level,
						lessonProgress: localLessonValidation.valid,
					},
				});

				return {
					success: true,
					migrated: true,
					filteredProgress:
						localLessonValidation.invalid.length > 0
							? {
									invalid: localLessonValidation.invalid,
									valid: Object.keys(
										localLessonValidation.valid
									).length,
							  }
							: undefined,
				};
			}

			// EXISTING USER: Merge guest data with database data
			const existingLessonProgress =
				existingProgress.lessonProgress as unknown as Record<
					string,
					{ currentStep: number; completed: boolean }
				>;
			const existingLessonValidation = validateLessonProgress(
				existingLessonProgress
			);

			// Merge lesson progress intelligently
			const mergedLessonProgress = { ...existingLessonValidation.valid };

			// For each lesson in local progress, take the more advanced state
			Object.entries(localLessonValidation.valid).forEach(
				([lessonId, localProgress]: [
					string,
					{ currentStep: number; completed: boolean }
				]) => {
					const existing = mergedLessonProgress[lessonId];

					if (!existing) {
						// Lesson only exists in local progress
						mergedLessonProgress[lessonId] = localProgress;
					} else {
						// Lesson exists in both - take the more advanced state
						if (localProgress.completed && !existing.completed) {
							// Local is completed, existing is not
							mergedLessonProgress[lessonId] = localProgress;
						} else if (
							!localProgress.completed &&
							!existing.completed
						) {
							// Both in progress - take higher step
							mergedLessonProgress[lessonId] = {
								currentStep: Math.max(
									localProgress.currentStep,
									existing.currentStep
								),
								completed: false,
							};
						}
						// If existing is completed, keep it (don't downgrade)
					}
				}
			);

			// Take the most advanced progress from both sources
			const mergedProgress = {
				xp: Math.max(existingProgress.xp, localProgress.xp),
				level: Math.max(existingProgress.level, localProgress.level),
				lessonProgress: mergedLessonProgress,
			};

			await tx.userProgress.update({
				where: { userId },
				data: mergedProgress,
			});

			return {
				success: true,
				migrated: true,
				merged: true,
				filteredProgress:
					localLessonValidation.invalid.length > 0 ||
					existingLessonValidation.invalid.length > 0
						? {
								localInvalid: localLessonValidation.invalid,
								existingInvalid:
									existingLessonValidation.invalid,
								valid: Object.keys(mergedLessonProgress).length,
						  }
						: undefined,
			};
		});

		return result;
	} catch (error) {
		// console.error("Failed to migrate localStorage data:", error);
		return { success: false, error: "Failed to migrate data" };
	}
}
