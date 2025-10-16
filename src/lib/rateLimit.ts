/**
 * Rate limiting utilities for server functions
 * Uses in-memory storage with sliding window algorithm
 */

interface RateLimitEntry {
	timestamps: number[];
	lastCleanup: number;
}

// In-memory storage for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Rate limit configurations
export const RATE_LIMITS = {
	// Analytics events
	ANALYTICS_SINGLE: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute
	ANALYTICS_BATCH: { limit: 10, windowMs: 60 * 1000 }, // 10 batches per minute
	ANALYTICS_IP: { limit: 500, windowMs: 60 * 1000 }, // 500 per minute per IP

	// Progress saves
	PROGRESS_SAVE: { limit: 10, windowMs: 60 * 1000 }, // 10 per minute
	PROGRESS_MIGRATION: { limit: 5, windowMs: 60 * 1000 }, // 5 per minute

	// AI feedback
	AI_FEEDBACK: { limit: 20, windowMs: 60 * 1000 }, // 20 per minute
	AI_FEEDBACK_IP: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute per IP

	// General IP rate limiting
	IP_GENERAL: { limit: 1000, windowMs: 60 * 1000 }, // 1000 requests per minute per IP
} as const;

/**
 * Check if a request is within rate limits
 */
export function checkRateLimit(
	key: string,
	limit: number,
	windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
	const now = Date.now();
	const windowStart = now - windowMs;

	// Get or create entry
	let entry = rateLimitStore.get(key);
	if (!entry) {
		entry = { timestamps: [], lastCleanup: now };
		rateLimitStore.set(key, entry);
	}

	// Clean up old timestamps
	entry.timestamps = entry.timestamps.filter(
		(timestamp) => timestamp > windowStart
	);

	// Check if under limit
	const currentCount = entry.timestamps.length;
	const allowed = currentCount < limit;

	if (allowed) {
		// Add current request timestamp
		entry.timestamps.push(now);
	}

	// Calculate remaining requests and reset time
	const remaining = Math.max(0, limit - currentCount - (allowed ? 1 : 0));
	const resetTime =
		entry.timestamps.length > 0
			? entry.timestamps[0] + windowMs
			: now + windowMs;

	// Periodic cleanup of old entries
	if (now - entry.lastCleanup > CLEANUP_INTERVAL) {
		cleanupOldEntries();
		entry.lastCleanup = now;
	}

	return { allowed, remaining, resetTime };
}

/**
 * Generate rate limit key for user/guest + type
 */
export function getRateLimitKey(
	userId: string | null,
	guestId: string | null,
	type: string
): string {
	if (userId) {
		return `user:${userId}:${type}`;
	} else if (guestId) {
		return `guest:${guestId}:${type}`;
	} else {
		// Fallback to IP-based key (will be set by caller)
		return `anonymous:${type}`;
	}
}

/**
 * Generate IP-based rate limit key
 */
export function getIPRateLimitKey(ip: string, type: string): string {
	return `ip:${ip}:${type}`;
}

/**
 * Clean up old entries from memory
 */
export function cleanupOldEntries(): void {
	const now = Date.now();
	const cutoff = now - 60 * 60 * 1000; // Remove entries older than 1 hour

	for (const [key, entry] of rateLimitStore.entries()) {
		// Remove entries with no recent activity
		if (
			entry.timestamps.length === 0 ||
			entry.timestamps[entry.timestamps.length - 1] < cutoff
		) {
			rateLimitStore.delete(key);
		}
	}
}

/**
 * Get rate limit status for debugging
 */
export function getRateLimitStatus(key: string): {
	key: string;
	timestamps: number[];
	count: number;
} | null {
	const entry = rateLimitStore.get(key);
	if (!entry) return null;

	return {
		key,
		timestamps: [...entry.timestamps],
		count: entry.timestamps.length,
	};
}

/**
 * Clear all rate limit data (for testing)
 */
export function clearRateLimitData(): void {
	rateLimitStore.clear();
}

