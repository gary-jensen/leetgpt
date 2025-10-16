/**
 * Lesson validation utilities
 * Validates that lesson IDs exist in the lesson database
 */

import { mockLessons } from "@/features/Workspace/mock-lessons";

// Export lesson metadata for use in other modules
export const lessonMetadata = mockLessons.map((lesson) => ({
	id: lesson.id,
	skillNodeId: lesson.skillNodeId,
}));

// Create set of valid lesson IDs for O(1) lookup
export const validLessonIds = new Set(mockLessons.map((l) => l.id));

// Create set of valid skill node IDs
export const validSkillNodeIds = new Set(mockLessons.map((l) => l.skillNodeId));

/**
 * Validate that a single lesson ID exists
 */
export function validateLessonId(lessonId: string): boolean {
	if (!lessonId || typeof lessonId !== "string") {
		return false;
	}

	return validLessonIds.has(lessonId);
}

/**
 * Validate an array of lesson IDs and return only valid ones
 */
export function validateLessonIds(lessonIds: string[]): {
	valid: string[];
	invalid: string[];
	allValid: boolean;
} {
	if (!Array.isArray(lessonIds)) {
		return { valid: [], invalid: [], allValid: false };
	}

	// Limit array size to prevent abuse
	const limitedIds = lessonIds.slice(0, 1000);

	const valid: string[] = [];
	const invalid: string[] = [];

	for (const id of limitedIds) {
		if (validateLessonId(id)) {
			// Prevent duplicates
			if (!valid.includes(id)) {
				valid.push(id);
			}
		} else {
			invalid.push(id);
		}
	}

	return {
		valid,
		invalid,
		allValid: invalid.length === 0,
	};
}

/**
 * Validate skill node ID
 */
export function validateSkillNodeId(skillNodeId: string): boolean {
	if (!skillNodeId || typeof skillNodeId !== "string") {
		return false;
	}

	return validSkillNodeIds.has(skillNodeId);
}

/**
 * Get lesson by ID
 */
export function getLessonById(lessonId: string) {
	if (!validateLessonId(lessonId)) {
		return null;
	}

	return mockLessons.find((lesson) => lesson.id === lessonId) || null;
}

/**
 * Get all lessons for a skill node
 */
export function getLessonsBySkillNode(skillNodeId: string) {
	if (!validateSkillNodeId(skillNodeId)) {
		return [];
	}

	return mockLessons.filter((lesson) => lesson.skillNodeId === skillNodeId);
}

/**
 * Get lesson count for validation
 */
export function getTotalLessonCount(): number {
	return mockLessons.length;
}

/**
 * Check if lesson array is within reasonable limits
 */
export function validateLessonArraySize(lessonIds: string[]): boolean {
	if (!Array.isArray(lessonIds)) {
		return false;
	}

	// Allow up to 1000 lessons (reasonable upper bound)
	return lessonIds.length <= 1000;
}

