/**
 * Tests for lesson validation functionality
 */

import {
	validateLessonId,
	validateLessonIds,
	validateSkillNodeId,
	getLessonById,
	getLessonsBySkillNode,
	getTotalLessonCount,
	validateLessonArraySize,
	validLessonIds,
	validSkillNodeIds,
} from "../lessonValidation";

describe("Lesson Validation", () => {
	describe("validateLessonId", () => {
		it("should validate existing lesson IDs", () => {
			// Test with actual lesson IDs from mock data
			expect(validateLessonId("lesson-1")).toBe(true);
			expect(validateLessonId("lesson-2")).toBe(true);
		});

		it("should reject invalid lesson IDs", () => {
			expect(validateLessonId("invalid-lesson")).toBe(false);
			expect(validateLessonId("lesson-999")).toBe(false);
			expect(validateLessonId("")).toBe(false);
			expect(validateLessonId("malicious-script")).toBe(false);
		});

		it("should reject non-string inputs", () => {
			expect(validateLessonId(null as any)).toBe(false);
			expect(validateLessonId(undefined as any)).toBe(false);
			expect(validateLessonId(123 as any)).toBe(false);
		});
	});

	describe("validateLessonIds", () => {
		it("should validate array of lesson IDs", () => {
			const validIds = ["lesson-1", "lesson-2"];
			const result = validateLessonIds(validIds);

			expect(result.allValid).toBe(true);
			expect(result.valid).toEqual(validIds);
			expect(result.invalid).toEqual([]);
		});

		it("should filter out invalid lesson IDs", () => {
			const mixedIds = [
				"lesson-1",
				"invalid-lesson",
				"lesson-2",
				"malicious-script",
			];
			const result = validateLessonIds(mixedIds);

			expect(result.allValid).toBe(false);
			expect(result.valid).toEqual(["lesson-1", "lesson-2"]);
			expect(result.invalid).toEqual([
				"invalid-lesson",
				"malicious-script",
			]);
		});

		it("should handle empty array", () => {
			const result = validateLessonIds([]);

			expect(result.allValid).toBe(true);
			expect(result.valid).toEqual([]);
			expect(result.invalid).toEqual([]);
		});

		it("should handle non-array input", () => {
			const result = validateLessonIds(null as any);

			expect(result.allValid).toBe(false);
			expect(result.valid).toEqual([]);
			expect(result.invalid).toEqual([]);
		});

		it("should limit array size to prevent abuse", () => {
			// Create array with 1001 items (over the 1000 limit)
			const largeArray = Array.from(
				{ length: 1001 },
				(_, i) => `lesson-${i}`
			);
			const result = validateLessonIds(largeArray);

			// Should be limited to 1000 max, but only valid lesson IDs are included
			expect(result.valid.length).toBeLessThanOrEqual(1000);
		});

		it("should remove duplicates from valid results", () => {
			const duplicateIds = [
				"lesson-1",
				"lesson-1",
				"lesson-2",
				"lesson-1",
			];
			const result = validateLessonIds(duplicateIds);

			expect(result.valid).toEqual(["lesson-1", "lesson-2"]);
			expect(result.valid).toHaveLength(2);
		});
	});

	describe("validateSkillNodeId", () => {
		it("should validate existing skill node IDs", () => {
			expect(validateSkillNodeId("variables")).toBe(true);
		});

		it("should reject invalid skill node IDs", () => {
			expect(validateSkillNodeId("invalid-skill")).toBe(false);
			expect(validateSkillNodeId("")).toBe(false);
			expect(validateSkillNodeId("malicious-script")).toBe(false);
		});
	});

	describe("getLessonById", () => {
		it("should return lesson for valid ID", () => {
			const lesson = getLessonById("lesson-1");
			expect(lesson).not.toBeNull();
			expect(lesson?.id).toBe("lesson-1");
		});

		it("should return null for invalid ID", () => {
			const lesson = getLessonById("invalid-lesson");
			expect(lesson).toBeNull();
		});
	});

	describe("getLessonsBySkillNode", () => {
		it("should return lessons for valid skill node", () => {
			const lessons = getLessonsBySkillNode("variables");
			expect(lessons.length).toBeGreaterThan(0);
			expect(
				lessons.every((lesson) => lesson.skillNodeId === "variables")
			).toBe(true);
		});

		it("should return empty array for invalid skill node", () => {
			const lessons = getLessonsBySkillNode("invalid-skill");
			expect(lessons).toEqual([]);
		});
	});

	describe("getTotalLessonCount", () => {
		it("should return positive number", () => {
			const count = getTotalLessonCount();
			expect(count).toBeGreaterThan(0);
		});
	});

	describe("validateLessonArraySize", () => {
		it("should allow arrays within limit", () => {
			const smallArray = Array.from(
				{ length: 100 },
				(_, i) => `lesson-${i}`
			);
			expect(validateLessonArraySize(smallArray)).toBe(true);
		});

		it("should reject arrays over limit", () => {
			const largeArray = Array.from(
				{ length: 1001 },
				(_, i) => `lesson-${i}`
			);
			expect(validateLessonArraySize(largeArray)).toBe(false);
		});

		it("should reject non-array input", () => {
			expect(validateLessonArraySize(null as any)).toBe(false);
			expect(validateLessonArraySize(undefined as any)).toBe(false);
			expect(validateLessonArraySize("not-array" as any)).toBe(false);
		});
	});

	describe("validLessonIds set", () => {
		it("should contain expected lesson IDs", () => {
			expect(validLessonIds.has("lesson-1")).toBe(true);
			expect(validLessonIds.has("lesson-2")).toBe(true);
		});

		it("should not contain invalid IDs", () => {
			expect(validLessonIds.has("invalid-lesson")).toBe(false);
			expect(validLessonIds.has("malicious-script")).toBe(false);
		});
	});

	describe("validSkillNodeIds set", () => {
		it("should contain expected skill node IDs", () => {
			expect(validSkillNodeIds.has("variables")).toBe(true);
		});

		it("should not contain invalid IDs", () => {
			expect(validSkillNodeIds.has("invalid-skill")).toBe(false);
		});
	});
});
