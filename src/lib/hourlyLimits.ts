/**
 * Hourly limit checking utility for algorithm workspace
 * Provides subscription-based limits (TRIAL, PRO, EXPERT) using the existing rate limit infrastructure
 */

import { checkRateLimit, getRateLimitKey } from "./rateLimit";
import { isExpertPrice } from "./stripeConfig";
import { SubscriptionStatusValue } from "@/lib/actions/billing";

// 1 hour in milliseconds
const HOUR_MS = 60 * 60 * 1000;

// Limit configurations by subscription tier
const HOURLY_LIMITS = {
	CANCELED: {
		"hint-chat": 0, // No access
		submission: 0, // No access
	},
	TRIAL: {
		"hint-chat": 10, // Combined hints and chat messages
		submission: 10, // Submission responses
	},
	PRO: {
		"hint-chat": 60, // Combined hints and chat messages
		submission: 100, // Submission responses
	},
	EXPERT: {
		"hint-chat": 120, // Combined hints and chat messages (double PRO)
		submission: 200, // Submission responses (double PRO)
	},
	ADMIN: {
		"hint-chat": 1000, // Effectively unlimited
		submission: 1000, // Effectively unlimited
	},
} as const;

type LimitType = "hint-chat" | "submission";
type SubscriptionTier = "CANCELED" | "TRIAL" | "PRO" | "EXPERT" | "ADMIN";

/**
 * Determine subscription tier from user data
 */
export function getSubscriptionTier(
	role: string | null | undefined,
	subscriptionStatus: SubscriptionStatusValue,
	stripePriceId: string | null | undefined
): SubscriptionTier {
	// Admin always gets admin limits
	if (role === "ADMIN") {
		return "ADMIN";
	}

	// Expired trial users (subscriptionStatus === "expired") have no access
	if (subscriptionStatus === "expired") {
		return "CANCELED";
	}

	// Canceled users (BASIC role or null subscriptionStatus) have no access
	if (role === "BASIC" || subscriptionStatus === null) {
		return "CANCELED";
	}

	// Trial users (app-managed or Stripe-managed)
	if (subscriptionStatus === "app_trialing" || subscriptionStatus === "stripe_trialing") {
		return "TRIAL";
	}

	// Active subscribers - check price ID to determine PRO vs EXPERT
	if (subscriptionStatus === "active" && stripePriceId) {
		return isExpertPrice(stripePriceId) ? "EXPERT" : "PRO";
	}

	// Default to PRO for active subscriptions without price ID
	if (subscriptionStatus === "active") {
		return "PRO";
	}

	// Default to CANCELED for any other status
	return "CANCELED";
}

/**
 * Check if a request is within hourly limits based on subscription tier
 */
export async function checkHourlyLimit(
	userId: string | null,
	limitType: LimitType,
	subscriptionTier: SubscriptionTier
): Promise<{
	allowed: boolean;
	remaining: number;
	resetTime: number;
	limit: number;
}> {
	// Get the limit for this tier and type
	const limit = HOURLY_LIMITS[subscriptionTier][limitType];

	// If limit is 0, user has no access
	if (limit === 0) {
		return {
			allowed: false,
			remaining: 0,
			resetTime: Date.now() + HOUR_MS,
			limit: 0,
		};
	}

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
 * Get the hourly limit for a specific subscription tier and type (without checking/consuming)
 */
export function getHourlyLimit(
	limitType: LimitType,
	subscriptionTier: SubscriptionTier
): number {
	return HOURLY_LIMITS[subscriptionTier][limitType];
}
