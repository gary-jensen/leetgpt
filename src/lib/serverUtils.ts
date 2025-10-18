/**
 * Server utility functions
 */

import { headers } from "next/headers";

/**
 * Extract client IP address from Next.js headers
 * Handles various proxy configurations (Cloudflare, Fastly, etc.)
 */
export async function getClientIP(): Promise<string | null> {
	try {
		const headersList = await headers();

		// Check common IP headers (in order of preference)
		const ip =
			headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			headersList.get("x-real-ip")?.trim() ||
			headersList.get("cf-connecting-ip")?.trim() || // Cloudflare
			headersList.get("fastly-client-ip")?.trim() || // Fastly
			headersList.get("x-client-ip")?.trim() ||
			headersList.get("x-cluster-client-ip")?.trim() ||
			null;

		// Basic IP validation (IPv4 and IPv6)
		if (ip && isValidIP(ip)) {
			return ip;
		}

		return null;
	} catch (error) {
		// console.error("Failed to extract client IP:", error);
		return null;
	}
}

/**
 * Basic IP address validation
 */
function isValidIP(ip: string): boolean {
	// IPv4 pattern
	const ipv4Pattern =
		/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

	// IPv6 pattern (simplified)
	const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

	// IPv6 compressed pattern
	const ipv6CompressedPattern =
		/^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;

	return (
		ipv4Pattern.test(ip) ||
		ipv6Pattern.test(ip) ||
		ipv6CompressedPattern.test(ip)
	);
}

/**
 * Get user agent from headers
 */
export async function getUserAgent(): Promise<string | null> {
	try {
		const headersList = await headers();
		return headersList.get("user-agent");
	} catch (error) {
		// console.error("Failed to extract user agent:", error);
		return null;
	}
}

/**
 * Get referer from headers
 */
export async function getReferer(): Promise<string | null> {
	try {
		const headersList = await headers();
		return headersList.get("referer");
	} catch (error) {
		// console.error("Failed to extract referer:", error);
		return null;
	}
}
