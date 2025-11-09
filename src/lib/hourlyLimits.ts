/**
 * Hourly limit checking utility for algorithm workspace
 * Provides role-based limits (BASIC vs PRO) using the existing rate limit infrastructure
 */

import { checkRateLimit, getRateLimitKey } from "./rateLimit";

// 1 hour in milliseconds
const HOUR_MS = 60 * 60 * 1000;

// Limit configurations by role
const HOURLY_LIMITS = {
	BASIC: {
		"hint-chat": 10, // Combined hints and chat messages
		submission: 10, // Submission responses
	},
	PRO: {
		"hint-chat": 60, // Combined hints and chat messages
		submission: 100, // Submission responses
	},
	ADMIN: {
		"hint-chat": 1000, // Effectively unlimited
		submission: 1000, // Effectively unlimited
	},
} as const;

type LimitType = "hint-chat" | "submission";
type Role = "BASIC" | "PRO" | "ADMIN";

/**
 * Check if a request is within hourly limits based on user role
 */
export async function checkHourlyLimit(
	userId: string | null,
	limitType: LimitType,
	userRole: Role = "BASIC"
): Promise<{
	allowed: boolean;
	remaining: number;
	resetTime: number;
	limit: number;
}> {
	// Get the limit for this role and type
	const limit = HOURLY_LIMITS[userRole][limitType];

	// Generate rate limit key
	const rateLimitKey = getRateLimitKey(
		userId,
		null,
		`algo-coach-${limitType}`
	);

	// Check rate limit with 1-hour window
	const result = await checkRateLimit(rateLimitKey, limit, HOUR_MS);

	return {
		...result,
		limit,
	};
}

/**
 * Get the hourly limit for a specific role and type (without checking/consuming)
 */
export function getHourlyLimit(
	limitType: LimitType,
	userRole: Role = "BASIC"
): number {
	return HOURLY_LIMITS[userRole][limitType];
}
