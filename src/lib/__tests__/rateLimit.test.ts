/**
 * Tests for rate limiting functionality
 */

import {
	checkRateLimit,
	getRateLimitKey,
	getIPRateLimitKey,
	RATE_LIMITS,
	clearRateLimitData,
	getRateLimitStatus,
} from "../rateLimit";

// Clear rate limit data before each test
beforeEach(() => {
	clearRateLimitData();
});

describe("Rate Limiting", () => {
	describe("checkRateLimit", () => {
		it("should allow requests within limit", async () => {
			const key = "test:user:123:analytics_single";
			const limit = 5;
			const windowMs = 60000; // 1 minute

			// First 5 requests should be allowed
			for (let i = 0; i < 5; i++) {
				const result = await checkRateLimit(key, limit, windowMs);
				expect(result.allowed).toBe(true);
				expect(result.remaining).toBe(4 - i);
			}
		});

		it("should block requests exceeding limit", async () => {
			const key = `test:user:${Date.now()}:analytics_single`;
			const limit = 3;
			const windowMs = 60000;

			// First 3 requests should be allowed
			for (let i = 0; i < 3; i++) {
				const result = await checkRateLimit(key, limit, windowMs);
				expect(result.allowed).toBe(true);
				// Add small delay to ensure timestamps are different
				await new Promise((resolve) => setTimeout(resolve, 50));
			}

			// 4th request should be blocked
			const result = await checkRateLimit(key, limit, windowMs);
			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
		});

		it("should reset after window expires", async () => {
			const key = "test:user:123:analytics_single";
			const limit = 2;
			const windowMs = 100; // Very short window for testing

			// Use up the limit
			await checkRateLimit(key, limit, windowMs);
			await checkRateLimit(key, limit, windowMs);

			// Should be blocked
			const blockedResult = await checkRateLimit(key, limit, windowMs);
			expect(blockedResult.allowed).toBe(false);

			// Wait for window to expire
			await new Promise((resolve) => setTimeout(resolve, 150));
			const allowedResult = await checkRateLimit(key, limit, windowMs);
			expect(allowedResult.allowed).toBe(true);
		});

		it("should calculate reset time correctly", async () => {
			const key = "test:user:123:analytics_single";
			const limit = 1;
			const windowMs = 60000;

			const result = await checkRateLimit(key, limit, windowMs);
			expect(result.resetTime).toBeGreaterThan(Date.now());
			expect(result.resetTime).toBeLessThanOrEqual(Date.now() + windowMs);
		});
	});

	describe("getRateLimitKey", () => {
		it("should generate user key for authenticated user", () => {
			const key = getRateLimitKey("user123", null, "analytics_single");
			expect(key).toBe("user:user123:analytics_single");
		});

		it("should generate guest key for guest user", () => {
			const key = getRateLimitKey(null, "guest456", "analytics_single");
			expect(key).toBe("guest:guest456:analytics_single");
		});

		it("should generate anonymous key for no user/guest", () => {
			const key = getRateLimitKey(null, null, "analytics_single");
			expect(key).toBe("anonymous:analytics_single");
		});
	});

	describe("getIPRateLimitKey", () => {
		it("should generate IP-based key", () => {
			const key = getIPRateLimitKey("192.168.1.1", "analytics_single");
			expect(key).toBe("ip:192.168.1.1:analytics_single");
		});
	});

	describe("RATE_LIMITS configuration", () => {
		it("should have correct limits for analytics single", () => {
			expect(RATE_LIMITS.ANALYTICS_SINGLE.limit).toBe(100);
			expect(RATE_LIMITS.ANALYTICS_SINGLE.windowMs).toBe(60000);
		});

		it("should have correct limits for analytics batch", () => {
			expect(RATE_LIMITS.ANALYTICS_BATCH.limit).toBe(10);
			expect(RATE_LIMITS.ANALYTICS_BATCH.windowMs).toBe(60000);
		});

		it("should have correct limits for progress save", () => {
			expect(RATE_LIMITS.PROGRESS_SAVE.limit).toBe(10);
			expect(RATE_LIMITS.PROGRESS_SAVE.windowMs).toBe(60000);
		});

		it("should have correct limits for AI feedback", () => {
			expect(RATE_LIMITS.AI_FEEDBACK.limit).toBe(20);
			expect(RATE_LIMITS.AI_FEEDBACK.windowMs).toBe(60000);
		});
	});

	describe("getRateLimitStatus", () => {
		it("should return null for non-existent key", async () => {
			const status = await getRateLimitStatus("nonexistent");
			expect(status).toBeNull();
		});

		it("should return status for existing key", async () => {
			const key = `test:user:${Date.now()}:analytics_single`;
			await checkRateLimit(key, 5, 60000);
			// Add small delay to ensure the request is processed
			await new Promise((resolve) => setTimeout(resolve, 10));

			const status = await getRateLimitStatus(key);
			expect(status).not.toBeNull();
			expect(status?.key).toBe(key);
			expect(status?.count).toBe(1);
			expect(status?.timestamps).toHaveLength(1);
		});
	});
});
