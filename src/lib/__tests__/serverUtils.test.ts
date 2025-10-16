/**
 * Tests for server utilities
 */

import { getClientIP, getUserAgent, getReferer } from "../serverUtils";

// Mock Next.js headers
const mockHeaders = jest.fn();
jest.mock("next/headers", () => ({
	headers: () => mockHeaders(),
}));

describe("Server Utilities", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getClientIP", () => {
		it("should extract IP from x-forwarded-for header", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "x-forwarded-for")
						return "192.168.1.1, 10.0.0.1";
					return null;
				},
			});

			const ip = await getClientIP();
			expect(ip).toBe("192.168.1.1");
		});

		it("should extract IP from x-real-ip header", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "x-real-ip") return "192.168.1.1";
					return null;
				},
			});

			const ip = await getClientIP();
			expect(ip).toBe("192.168.1.1");
		});

		it("should extract IP from cf-connecting-ip header (Cloudflare)", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "cf-connecting-ip") return "192.168.1.1";
					return null;
				},
			});

			const ip = await getClientIP();
			expect(ip).toBe("192.168.1.1");
		});

		it("should extract IP from fastly-client-ip header", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "fastly-client-ip") return "192.168.1.1";
					return null;
				},
			});

			const ip = await getClientIP();
			expect(ip).toBe("192.168.1.1");
		});

		it("should validate IPv4 addresses", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "x-forwarded-for") return "192.168.1.1";
					return null;
				},
			});

			const ip = await getClientIP();
			expect(ip).toBe("192.168.1.1");
		});

		it("should validate IPv6 addresses", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "x-forwarded-for")
						return "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
					return null;
				},
			});

			const ip = await getClientIP();
			expect(ip).toBe("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
		});

		it("should reject invalid IP addresses", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "x-forwarded-for") return "invalid-ip";
					return null;
				},
			});

			const ip = await getClientIP();
			expect(ip).toBeNull();
		});

		it("should return null when no valid IP found", async () => {
			mockHeaders.mockReturnValue({
				get: () => null,
			});

			const ip = await getClientIP();
			expect(ip).toBeNull();
		});

		it("should handle errors gracefully", async () => {
			mockHeaders.mockImplementation(() => {
				throw new Error("Headers error");
			});

			const ip = await getClientIP();
			expect(ip).toBeNull();
		});

		it("should trim whitespace from IP addresses", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "x-forwarded-for") return "  192.168.1.1  ";
					return null;
				},
			});

			const ip = await getClientIP();
			expect(ip).toBe("192.168.1.1");
		});
	});

	describe("getUserAgent", () => {
		it("should extract user agent from headers", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "user-agent")
						return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
					return null;
				},
			});

			const userAgent = await getUserAgent();
			expect(userAgent).toBe(
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
			);
		});

		it("should return null when user agent not found", async () => {
			mockHeaders.mockReturnValue({
				get: () => null,
			});

			const userAgent = await getUserAgent();
			expect(userAgent).toBeNull();
		});

		it("should handle errors gracefully", async () => {
			mockHeaders.mockImplementation(() => {
				throw new Error("Headers error");
			});

			const userAgent = await getUserAgent();
			expect(userAgent).toBeNull();
		});
	});

	describe("getReferer", () => {
		it("should extract referer from headers", async () => {
			mockHeaders.mockReturnValue({
				get: (header: string) => {
					if (header === "referer") return "https://example.com/page";
					return null;
				},
			});

			const referer = await getReferer();
			expect(referer).toBe("https://example.com/page");
		});

		it("should return null when referer not found", async () => {
			mockHeaders.mockReturnValue({
				get: () => null,
			});

			const referer = await getReferer();
			expect(referer).toBeNull();
		});

		it("should handle errors gracefully", async () => {
			mockHeaders.mockImplementation(() => {
				throw new Error("Headers error");
			});

			const referer = await getReferer();
			expect(referer).toBeNull();
		});
	});
});

