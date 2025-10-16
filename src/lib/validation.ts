/**
 * Security validation utilities for input sanitization and validation
 */

const MAX_JSON_PAYLOAD_SIZE = 1024 * 1024; // 1MB
const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Event validation whitelists
export const ALLOWED_EVENT_CATEGORIES = [
	"Session",
	"Lesson",
	"Step",
	"Code",
	"Progress",
	"Auth",
] as const;

export const ALLOWED_EVENT_ACTIONS = new Map([
	["Session", ["session_start", "session_end"]],
	["Lesson", ["lesson_start", "lesson_complete"]],
	["Step", ["step_complete"]],
	["Code", ["code_run", "code_submit_correct", "code_submit_incorrect"]],
	["Progress", ["level_up", "skill_node_complete", "xp_gain"]],
	["Auth", ["auth_signin", "auth_signout"]],
]);

// String length limits
export const STRING_LIMITS = {
	EVENT_CATEGORY: 50,
	EVENT_ACTION: 50,
	EVENT_LABEL: 200,
	CODE: 5000,
	LESSON_ID: 100,
	SKILL_NODE_ID: 50,
} as const;

/**
 * Validate JSON payload size to prevent memory exhaustion attacks
 */
export function validateJsonPayloadSize(payload: string): boolean {
	return payload.length <= MAX_JSON_PAYLOAD_SIZE;
}

/**
 * Validate that a string is a valid UUID
 */
export function validateUUID(id: string): boolean {
	return UUID_REGEX.test(id);
}

/**
 * Sanitize and validate analytics metadata
 * Removes potentially dangerous properties and limits size
 */
export function sanitizeMetadata(metadata: any): Record<string, any> | null {
	if (!metadata || typeof metadata !== "object") {
		return null;
	}

	// Convert to plain object and remove functions, symbols, etc.
	const sanitized = JSON.parse(JSON.stringify(metadata));

	// Remove potentially dangerous properties
	const dangerousKeys = [
		"__proto__",
		"constructor",
		"prototype",
		"eval",
		"function",
		"script",
		"javascript",
		"vbscript",
		"onload",
		"onerror",
		"onclick",
		"onmouseover",
		"onfocus",
		"onblur",
		"onchange",
		"onsubmit",
		"onreset",
		"onselect",
		"onkeydown",
		"onkeyup",
		"onkeypress",
		"onmousedown",
		"onmouseup",
		"onmousemove",
		"onmouseout",
		"onmouseover",
		"onmouseenter",
		"onmouseleave",
		"oncontextmenu",
		"ondblclick",
		"ondrag",
		"ondragend",
		"ondragenter",
		"ondragleave",
		"ondragover",
		"ondragstart",
		"ondrop",
		"onscroll",
		"onresize",
		"onabort",
		"onbeforeunload",
		"onerror",
		"onhashchange",
		"onload",
		"onmessage",
		"onoffline",
		"ononline",
		"onpagehide",
		"onpageshow",
		"onpopstate",
		"onresize",
		"onstorage",
		"onunload",
	];

	// Remove dangerous keys recursively
	function removeDangerousKeys(obj: any): any {
		if (obj === null || typeof obj !== "object") {
			return obj;
		}

		if (Array.isArray(obj)) {
			return obj.map(removeDangerousKeys);
		}

		const cleaned: any = {};
		for (const [key, value] of Object.entries(obj)) {
			if (!dangerousKeys.includes(key.toLowerCase())) {
				cleaned[key] = removeDangerousKeys(value);
			}
		}
		return cleaned;
	}

	const cleaned = removeDangerousKeys(sanitized);

	// Limit total size of metadata (10KB max)
	const serialized = JSON.stringify(cleaned);
	if (serialized.length > 10240) {
		return null;
	}

	return cleaned;
}

/**
 * Validate and sanitize user code input
 * Remove potentially dangerous content while preserving legitimate code
 */
export function sanitizeUserCode(code: string): string {
	if (!code || typeof code !== "string") {
		return "";
	}

	// Remove null bytes and control characters except newlines and tabs
	let sanitized = code.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

	// Limit code length (100KB max)
	if (sanitized.length > 102400) {
		sanitized = sanitized.substring(0, 102400);
	}

	return sanitized;
}

/**
 * Validate session ID format
 */
export function validateSessionId(sessionId: string): boolean {
	return validateUUID(sessionId);
}

/**
 * Validate guest ID format
 */
export function validateGuestId(guestId: string): boolean {
	// Guest IDs can be UUIDs or custom format like "guest_1234567890_abc123"
	return validateUUID(guestId) || /^guest_\d+_[a-z0-9]+$/i.test(guestId);
}

/**
 * Validate event category against whitelist
 */
export function validateEventCategory(category: string): boolean {
	if (!category || typeof category !== "string") {
		return false;
	}

	if (category.length > STRING_LIMITS.EVENT_CATEGORY) {
		return false;
	}

	return ALLOWED_EVENT_CATEGORIES.includes(category as any);
}

/**
 * Validate event action against whitelist for given category
 */
export function validateEventAction(action: string, category: string): boolean {
	if (!action || typeof action !== "string") {
		return false;
	}

	if (action.length > STRING_LIMITS.EVENT_ACTION) {
		return false;
	}

	const allowedActions = ALLOWED_EVENT_ACTIONS.get(category);
	if (!allowedActions) {
		return false;
	}

	return allowedActions.includes(action);
}

/**
 * Validate event label length
 */
export function validateEventLabel(label: string | null | undefined): boolean {
	if (label === null || label === undefined) {
		return true; // Optional field
	}

	if (typeof label !== "string") {
		return false;
	}

	return label.length <= STRING_LIMITS.EVENT_LABEL;
}

/**
 * Validate code length
 */
export function validateCodeLength(
	code: string,
	maxLength: number = STRING_LIMITS.CODE
): boolean {
	if (!code || typeof code !== "string") {
		return false;
	}

	return code.length <= maxLength;
}

/**
 * Validate lesson ID format and length
 */
export function validateLessonIdFormat(lessonId: string): boolean {
	if (!lessonId || typeof lessonId !== "string") {
		return false;
	}

	if (lessonId.length > STRING_LIMITS.LESSON_ID) {
		return false;
	}

	// Basic format validation (alphanumeric, hyphens, underscores)
	return /^[a-zA-Z0-9_-]+$/.test(lessonId);
}

/**
 * Validate skill node ID format and length
 */
export function validateSkillNodeIdFormat(skillNodeId: string): boolean {
	if (!skillNodeId || typeof skillNodeId !== "string") {
		return false;
	}

	if (skillNodeId.length > STRING_LIMITS.SKILL_NODE_ID) {
		return false;
	}

	// Basic format validation (alphanumeric, hyphens, underscores)
	return /^[a-zA-Z0-9_-]+$/.test(skillNodeId);
}
