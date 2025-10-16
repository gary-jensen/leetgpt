"use server";

import { prisma } from "@/lib/prisma";
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
		// Only save xp, level, and completedLessons
		// skillNodes and currentSkillNodeId will be calculated on load
		await prisma.userProgress.upsert({
			where: { userId },
			update: {
				xp: progress.xp,
				level: progress.level,
				completedLessons: progress.completedLessons as any,
			},
			create: {
				userId,
				xp: progress.xp,
				level: progress.level,
				completedLessons: progress.completedLessons as any,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to save user progress:", error);
		return { success: false, error: "Failed to save progress" };
	}
}

export async function loadUserProgress(
	userId: string,
	lessonMetadata: { id: string; skillNodeId: string }[]
): Promise<UserProgressType | null> {
	try {
		const progress = await prisma.userProgress.findUnique({
			where: { userId },
		});

		if (!progress) {
			return null;
		}

		const completedLessons =
			progress.completedLessons as unknown as string[];

		// Calculate current skill node from completed lessons
		const currentSkillNodeId = calculateCurrentSkillNodeId(
			completedLessons,
			lessonMetadata
		);

		// Build skill tree from lesson metadata and calculate progress
		const skillNodes = buildSkillTreeFromLessons(lessonMetadata);
		const calculatedSkillNodes = recalculateSkillNodes(
			skillNodes,
			completedLessons
		);

		return {
			xp: progress.xp,
			level: progress.level,
			currentSkillNodeId,
			completedLessons,
			skillNodes: calculatedSkillNodes,
		};
	} catch (error) {
		console.error("Failed to load user progress:", error);
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
		// Ensure user exists in database first
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			console.error(
				"User not found in database during migration:",
				userId
			);
			return { success: false, error: "User not found" };
		}

		// Check if user already has progress in the database
		const existingProgress = await prisma.userProgress.findUnique({
			where: { userId },
		});

		// NEW USER: Create database record with guest data
		if (!existingProgress) {
			await prisma.userProgress.create({
				data: {
					userId,
					xp: localProgress.xp,
					level: localProgress.level,
					completedLessons: localProgress.completedLessons as any,
				},
			});

			return { success: true, migrated: true };
		}

		// EXISTING USER: Merge guest data with database data
		// Take the most advanced progress from both sources
		const mergedProgress = {
			xp: Math.max(existingProgress.xp, localProgress.xp),
			level: Math.max(existingProgress.level, localProgress.level),
			// Merge completed lessons (union of both arrays)
			completedLessons: Array.from(
				new Set([
					...(existingProgress.completedLessons as unknown as string[]),
					...localProgress.completedLessons,
				])
			) as any,
		};

		await prisma.userProgress.update({
			where: { userId },
			data: mergedProgress,
		});

		return { success: true, migrated: true, merged: true };
	} catch (error) {
		console.error("Failed to migrate localStorage data:", error);
		return { success: false, error: "Failed to migrate data" };
	}
}
