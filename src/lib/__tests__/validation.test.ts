/**
 * Tests for validation utilities
 */

import {
	validateEventCategory,
	validateEventAction,
	validateEventLabel,
	validateCodeLength,
	validateLessonIdFormat,
	validateSkillNodeIdFormat,
	validateUUID,
	validateGuestId,
	validateSessionId,
	ALLOWED_EVENT_CATEGORIES,
	ALLOWED_EVENT_ACTIONS,
	STRING_LIMITS,
} from "../validation";

describe("Validation Utilities", () => {
	describe("validateEventCategory", () => {
		it("should validate allowed categories", () => {
			expect(validateEventCategory("Session")).toBe(true);
			expect(validateEventCategory("Lesson")).toBe(true);
			expect(validateEventCategory("Step")).toBe(true);
			expect(validateEventCategory("Code")).toBe(true);
			expect(validateEventCategory("Progress")).toBe(true);
			expect(validateEventCategory("Auth")).toBe(true);
		});

		it("should reject invalid categories", () => {
			expect(validateEventCategory("InvalidCategory")).toBe(false);
			expect(validateEventCategory("malicious-script")).toBe(false);
			expect(validateEventCategory("")).toBe(false);
			expect(validateEventCategory("session")).toBe(false); // case sensitive
		});

		it("should reject categories that are too long", () => {
			const longCategory = "A".repeat(STRING_LIMITS.EVENT_CATEGORY + 1);
			expect(validateEventCategory(longCategory)).toBe(false);
		});

		it("should reject non-string inputs", () => {
			expect(validateEventCategory(null as any)).toBe(false);
			expect(validateEventCategory(undefined as any)).toBe(false);
			expect(validateEventCategory(123 as any)).toBe(false);
		});
	});

	describe("validateEventAction", () => {
		it("should validate allowed actions for each category", () => {
			expect(validateEventAction("session_start", "Session")).toBe(true);
			expect(validateEventAction("session_end", "Session")).toBe(true);
			expect(validateEventAction("lesson_start", "Lesson")).toBe(true);
			expect(validateEventAction("lesson_complete", "Lesson")).toBe(true);
			expect(validateEventAction("step_complete", "Step")).toBe(true);
			expect(validateEventAction("code_run", "Code")).toBe(true);
			expect(validateEventAction("code_submit_correct", "Code")).toBe(
				true
			);
			expect(validateEventAction("code_submit_incorrect", "Code")).toBe(
				true
			);
			expect(validateEventAction("level_up", "Progress")).toBe(true);
			expect(validateEventAction("skill_node_complete", "Progress")).toBe(
				true
			);
			expect(validateEventAction("xp_gain", "Progress")).toBe(true);
			expect(validateEventAction("auth_signin", "Auth")).toBe(true);
			expect(validateEventAction("auth_signout", "Auth")).toBe(true);
		});

		it("should reject invalid actions", () => {
			expect(validateEventAction("invalid_action", "Session")).toBe(
				false
			);
			expect(
				validateEventAction("session_start", "InvalidCategory")
			).toBe(false);
			expect(validateEventAction("malicious_script", "Code")).toBe(false);
		});

		it("should reject actions that are too long", () => {
			const longAction = "A".repeat(STRING_LIMITS.EVENT_ACTION + 1);
			expect(validateEventAction(longAction, "Session")).toBe(false);
		});

		it("should reject non-string inputs", () => {
			expect(validateEventAction(null as any, "Session")).toBe(false);
			expect(validateEventAction(undefined as any, "Session")).toBe(
				false
			);
			expect(validateEventAction(123 as any, "Session")).toBe(false);
		});
	});

	describe("validateEventLabel", () => {
		it("should allow valid labels", () => {
			expect(validateEventLabel("Valid label")).toBe(true);
			expect(
				validateEventLabel("A".repeat(STRING_LIMITS.EVENT_LABEL))
			).toBe(true);
			expect(validateEventLabel(null)).toBe(true);
			expect(validateEventLabel(undefined)).toBe(true);
		});

		it("should reject labels that are too long", () => {
			const longLabel = "A".repeat(STRING_LIMITS.EVENT_LABEL + 1);
			expect(validateEventLabel(longLabel)).toBe(false);
		});

		it("should reject non-string inputs (except null/undefined)", () => {
			expect(validateEventLabel(123 as any)).toBe(false);
			expect(validateEventLabel({} as any)).toBe(false);
		});
	});

	describe("validateCodeLength", () => {
		it("should allow code within limit", () => {
			const shortCode = 'console.log("Hello");';
			expect(validateCodeLength(shortCode)).toBe(true);
			expect(validateCodeLength(shortCode, 100)).toBe(true);
		});

		it("should reject code over limit", () => {
			const longCode = "A".repeat(STRING_LIMITS.CODE + 1);
			expect(validateCodeLength(longCode)).toBe(false);
		});

		it("should use custom limit when provided", () => {
			const code = "A".repeat(10);
			expect(validateCodeLength(code, 5)).toBe(false);
			expect(validateCodeLength(code, 15)).toBe(true);
		});

		it("should reject non-string inputs", () => {
			expect(validateCodeLength(null as any)).toBe(false);
			expect(validateCodeLength(undefined as any)).toBe(false);
			expect(validateCodeLength(123 as any)).toBe(false);
		});
	});

	describe("validateLessonIdFormat", () => {
		it("should validate correct lesson ID formats", () => {
			expect(validateLessonIdFormat("lesson-1")).toBe(true);
			expect(validateLessonIdFormat("lesson_2")).toBe(true);
			expect(validateLessonIdFormat("lesson123")).toBe(true);
			expect(validateLessonIdFormat("a-b-c_123")).toBe(true);
		});

		it("should reject invalid lesson ID formats", () => {
			expect(validateLessonIdFormat("lesson@1")).toBe(false);
			expect(validateLessonIdFormat("lesson 1")).toBe(false);
			expect(validateLessonIdFormat("lesson.1")).toBe(false);
			expect(validateLessonIdFormat("lesson#1")).toBe(false);
		});

		it("should reject IDs that are too long", () => {
			const longId = "A".repeat(STRING_LIMITS.LESSON_ID + 1);
			expect(validateLessonIdFormat(longId)).toBe(false);
		});
	});

	describe("validateSkillNodeIdFormat", () => {
		it("should validate correct skill node ID formats", () => {
			expect(validateSkillNodeIdFormat("variables")).toBe(true);
			expect(validateSkillNodeIdFormat("skill_node")).toBe(true);
			expect(validateSkillNodeIdFormat("skill123")).toBe(true);
		});

		it("should reject invalid skill node ID formats", () => {
			expect(validateSkillNodeIdFormat("skill@node")).toBe(false);
			expect(validateSkillNodeIdFormat("skill node")).toBe(false);
			expect(validateSkillNodeIdFormat("skill.node")).toBe(false);
		});

		it("should reject IDs that are too long", () => {
			const longId = "A".repeat(STRING_LIMITS.SKILL_NODE_ID + 1);
			expect(validateSkillNodeIdFormat(longId)).toBe(false);
		});
	});

	describe("validateUUID", () => {
		it("should validate correct UUIDs", () => {
			expect(validateUUID("123e4567-e89b-12d3-a456-426614174000")).toBe(
				true
			);
			expect(validateUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(
				true
			);
		});

		it("should reject invalid UUIDs", () => {
			expect(validateUUID("not-a-uuid")).toBe(false);
			expect(validateUUID("123e4567-e89b-12d3-a456-42661417400")).toBe(
				false
			); // too short
			expect(validateUUID("123e4567-e89b-12d3-a456-4266141740000")).toBe(
				false
			); // too long
			expect(validateUUID("")).toBe(false);
		});
	});

	describe("validateGuestId", () => {
		it("should validate UUID guest IDs", () => {
			expect(
				validateGuestId("123e4567-e89b-12d3-a456-426614174000")
			).toBe(true);
		});

		it("should validate custom guest ID format", () => {
			expect(validateGuestId("guest_1234567890_abc123")).toBe(true);
			expect(validateGuestId("guest_9999999999_xyz789")).toBe(true);
		});

		it("should reject invalid guest IDs", () => {
			expect(validateGuestId("invalid-guest-id")).toBe(false);
			expect(validateGuestId("guest_invalid")).toBe(false);
			expect(validateGuestId("guest_123_")).toBe(false);
			expect(validateGuestId("")).toBe(false);
		});
	});

	describe("validateSessionId", () => {
		it("should validate correct session IDs (UUIDs)", () => {
			expect(
				validateSessionId("123e4567-e89b-12d3-a456-426614174000")
			).toBe(true);
		});

		it("should reject invalid session IDs", () => {
			expect(validateSessionId("not-a-uuid")).toBe(false);
			expect(validateSessionId("")).toBe(false);
		});
	});

	describe("Constants", () => {
		it("should have correct ALLOWED_EVENT_CATEGORIES", () => {
			expect(ALLOWED_EVENT_CATEGORIES).toEqual([
				"Session",
				"Lesson",
				"Step",
				"Code",
				"Progress",
				"Auth",
				"Demo",
				"Landing",
			]);
		});

		it("should have correct ALLOWED_EVENT_ACTIONS mapping", () => {
			expect(ALLOWED_EVENT_ACTIONS.get("Session")).toEqual([
				"session_start",
				"session_end",
			]);
			expect(ALLOWED_EVENT_ACTIONS.get("Lesson")).toEqual([
				"lesson_start",
				"lesson_complete",
			]);
			expect(ALLOWED_EVENT_ACTIONS.get("Step")).toEqual([
				"step_complete",
			]);
			expect(ALLOWED_EVENT_ACTIONS.get("Code")).toEqual([
				"code_run",
				"code_submit_correct",
				"code_submit_incorrect",
			]);
			expect(ALLOWED_EVENT_ACTIONS.get("Progress")).toEqual([
				"level_up",
				"skill_node_complete",
				"xp_gain",
			]);
			expect(ALLOWED_EVENT_ACTIONS.get("Auth")).toEqual([
				"auth_signin",
				"auth_signout",
			]);
		});

		it("should have correct STRING_LIMITS", () => {
			expect(STRING_LIMITS.EVENT_CATEGORY).toBe(50);
			expect(STRING_LIMITS.EVENT_ACTION).toBe(50);
			expect(STRING_LIMITS.EVENT_LABEL).toBe(200);
			expect(STRING_LIMITS.CODE).toBe(5000);
			expect(STRING_LIMITS.LESSON_ID).toBe(100);
			expect(STRING_LIMITS.SKILL_NODE_ID).toBe(50);
		});
	});
});
