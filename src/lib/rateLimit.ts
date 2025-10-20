/**
 * Rate limiting utilities for server functions
 * Uses Redis for persistent storage with sliding window algorithm
 * Falls back to in-memory storage if Redis is not available
 */

import { createClient } from "redis";

interface RateLimitEntry {
	timestamps: number[];
	lastCleanup: number;
}

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Create Redis client only if REDIS_URL is available
const redis = process.env.REDIS_URL
	? createClient({
			url: process.env.REDIS_URL,
	  })
	: null;

// Connect to Redis if client exists
if (redis) {
	redis.on("error", (err) => {
		console.warn("Redis connection error:", err);
	});
}

// Fallback in-memory storage for when Redis is not available
const fallbackStore = new Map<string, RateLimitEntry>();

// Helper functions for Redis operations
async function getRateLimitData(key: string): Promise<RateLimitEntry | null> {
	// If no Redis client, use fallback storage
	if (!redis) {
		return fallbackStore.get(key) || null;
	}

	try {
		// Ensure Redis is connected
		if (!redis.isOpen) {
			await redis.connect();
		}

		const data = await redis.get(key);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.warn(
			"Redis not available, using fallback storage:",
			error instanceof Error ? error.message : String(error)
		);
		// Fallback to in-memory storage
		return fallbackStore.get(key) || null;
	}
}

async function setRateLimitData(
	key: string,
	data: RateLimitEntry
): Promise<void> {
	// If no Redis client, use fallback storage
	if (!redis) {
		fallbackStore.set(key, data);
		return;
	}

	try {
		// Ensure Redis is connected
		if (!redis.isOpen) {
			await redis.connect();
		}

		// Set with 1 hour expiry to prevent indefinite storage
		await redis.setEx(key, 3600, JSON.stringify(data));
	} catch (error) {
		console.warn(
			"Redis not available, using fallback storage:",
			error instanceof Error ? error.message : String(error)
		);
		// Fallback to in-memory storage
		fallbackStore.set(key, data);
	}
}

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

	// Demo AI feedback (stricter limits)
	DEMO_AI_FEEDBACK: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
	DEMO_AI_FEEDBACK_IP: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour per IP

	// General IP rate limiting
	IP_GENERAL: { limit: 1000, windowMs: 60 * 1000 }, // 1000 requests per minute per IP
} as const;

/**
 * Check if a request is within rate limits
 */
export async function checkRateLimit(
	key: string,
	limit: number,
	windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
	const now = Date.now();
	const windowStart = now - windowMs;

	// Get existing rate limit entry from KV
	let entry = await getRateLimitData(key);
	if (!entry) {
		entry = { timestamps: [], lastCleanup: now };
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

		// Save updated entry to KV
		await setRateLimitData(key, entry);
	}

	// Calculate remaining requests and reset time
	const remaining = Math.max(0, limit - currentCount - (allowed ? 1 : 0));
	const resetTime =
		entry.timestamps.length > 0
			? entry.timestamps[0] + windowMs
			: now + windowMs;

	// Periodic cleanup of old entries
	if (now - entry.lastCleanup > CLEANUP_INTERVAL) {
		entry.lastCleanup = now;
		// Note: We don't need to cleanup KV entries as they have TTL
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
 * Get rate limit status for debugging
 */
export async function getRateLimitStatus(key: string): Promise<{
	key: string;
	timestamps: number[];
	count: number;
} | null> {
	const entry = await getRateLimitData(key);
	if (!entry) return null;

	return {
		key,
		timestamps: [...entry.timestamps],
		count: entry.timestamps.length,
	};
}

/**
 * Clear all rate limit data (for testing)
 * Note: This is not easily possible with KV as we don't track all keys
 */
export async function clearRateLimitData(): Promise<void> {
	// Note: With KV, we can't easily clear all data without tracking keys
	// Individual keys will expire automatically with TTL
	console.warn(
		"clearRateLimitData: Cannot clear all KV data without tracking keys"
	);
}
