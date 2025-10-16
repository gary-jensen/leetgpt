/**
 * Device Detection and Analytics Data Collection
 *
 * Collects comprehensive device, browser, and location data
 * for analytics tracking in a single JSON object.
 */

export interface DeviceData {
	// User Agent Info
	userAgent: string;
	browser: string;
	browserVersion: string;
	os: string;
	osVersion: string;

	// Device Info
	deviceType: "mobile" | "tablet" | "desktop";
	deviceModel?: string;

	// Network & Location
	ipAddress?: string;
	country?: string;
	region?: string;
	city?: string;
	timezone?: string;

	// Screen & Viewport
	screenWidth?: number;
	screenHeight?: number;
	viewportWidth?: number;
	viewportHeight?: number;
	pixelRatio?: number;

	// Connection
	connectionType?: string;
	connectionSpeed?: string;

	// Additional Context
	referrer?: string;
	language?: string;
	platform?: string;
}

/**
 * Parse user agent string to extract browser and OS information
 */
function parseUserAgent(userAgent: string): {
	browser: string;
	browserVersion: string;
	os: string;
	osVersion: string;
	deviceType: "mobile" | "tablet" | "desktop";
	deviceModel?: string;
} {
	const ua = userAgent.toLowerCase();

	// Browser detection
	let browser = "Unknown";
	let browserVersion = "Unknown";

	if (ua.includes("chrome") && !ua.includes("edg")) {
		browser = "Chrome";
		const match = ua.match(/chrome\/(\d+)/);
		browserVersion = match ? match[1] : "Unknown";
	} else if (ua.includes("firefox")) {
		browser = "Firefox";
		const match = ua.match(/firefox\/(\d+)/);
		browserVersion = match ? match[1] : "Unknown";
	} else if (ua.includes("safari") && !ua.includes("chrome")) {
		browser = "Safari";
		const match = ua.match(/version\/(\d+)/);
		browserVersion = match ? match[1] : "Unknown";
	} else if (ua.includes("edg")) {
		browser = "Edge";
		const match = ua.match(/edg\/(\d+)/);
		browserVersion = match ? match[1] : "Unknown";
	}

	// OS detection
	let os = "Unknown";
	let osVersion = "Unknown";

	if (ua.includes("windows")) {
		os = "Windows";
		if (ua.includes("windows nt 10.0")) osVersion = "10";
		else if (ua.includes("windows nt 6.3")) osVersion = "8.1";
		else if (ua.includes("windows nt 6.2")) osVersion = "8";
		else if (ua.includes("windows nt 6.1")) osVersion = "7";
	} else if (ua.includes("mac os x")) {
		os = "macOS";
		const match = ua.match(/mac os x (\d+[._]\d+)/);
		osVersion = match ? match[1].replace("_", ".") : "Unknown";
	} else if (ua.includes("linux")) {
		os = "Linux";
	} else if (ua.includes("android")) {
		os = "Android";
		const match = ua.match(/android (\d+[._]\d+)/);
		osVersion = match ? match[1] : "Unknown";
	} else if (ua.includes("iphone") || ua.includes("ipad")) {
		os = "iOS";
		const match = ua.match(/os (\d+[._]\d+)/);
		osVersion = match ? match[1].replace("_", ".") : "Unknown";
	}

	// Device type detection
	let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
	let deviceModel: string | undefined;

	if (
		ua.includes("mobile") ||
		ua.includes("android") ||
		ua.includes("iphone")
	) {
		deviceType = "mobile";
	} else if (ua.includes("ipad") || ua.includes("tablet")) {
		deviceType = "tablet";
	}

	// Device model detection
	if (ua.includes("iphone")) {
		const match = ua.match(/iphone os \d+[._]\d+; (iphone\d+,\d+)/);
		deviceModel = match ? match[1] : "iPhone";
	} else if (ua.includes("ipad")) {
		const match = ua.match(
			/ipad; cpu os \d+[._]\d+ like mac os x; (ipad\d+,\d+)/
		);
		deviceModel = match ? match[1] : "iPad";
	}

	return {
		browser,
		browserVersion,
		os,
		osVersion,
		deviceType,
		deviceModel,
	};
}

/**
 * Get client IP address from headers
 */
export async function getClientIP(): Promise<string | null> {
	try {
		const { headers } = await import("next/headers");
		const headersList = await headers();

		// Check common IP headers (in order of preference)
		const ip =
			headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			headersList.get("x-real-ip") ||
			headersList.get("cf-connecting-ip") || // Cloudflare
			headersList.get("fastly-client-ip") || // Fastly
			headersList.get("x-client-ip") ||
			null;

		return ip;
	} catch (error) {
		console.error("Error getting client IP:", error);
		return null;
	}
}

/**
 * Get user agent from headers
 */
export async function getUserAgent(): Promise<string | null> {
	try {
		const { headers } = await import("next/headers");
		const headersList = await headers();
		return headersList.get("user-agent");
	} catch (error) {
		console.error("Error getting user agent:", error);
		return null;
	}
}

/**
 * Get referrer from headers
 */
export async function getReferrer(): Promise<string | null> {
	try {
		const { headers } = await import("next/headers");
		const headersList = await headers();
		return headersList.get("referer");
	} catch (error) {
		console.error("Error getting referrer:", error);
		return null;
	}
}

/**
 * Collect comprehensive device data for analytics
 */
export async function collectDeviceData(): Promise<DeviceData | null> {
	try {
		const [userAgent, ipAddress, referrer] = await Promise.all([
			getUserAgent(),
			getClientIP(),
			getReferrer(),
		]);

		if (!userAgent) {
			console.warn("No user agent found");
			return null;
		}

		const parsed = parseUserAgent(userAgent);

		// Get timezone from client (if available)
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// Get language
		const language =
			typeof navigator !== "undefined" ? navigator.language : "en-US";

		// Get platform
		const platform =
			typeof navigator !== "undefined" ? navigator.platform : parsed.os;

		const deviceData: DeviceData = {
			// User Agent Info
			userAgent,
			browser: parsed.browser,
			browserVersion: parsed.browserVersion,
			os: parsed.os,
			osVersion: parsed.osVersion,

			// Device Info
			deviceType: parsed.deviceType,
			deviceModel: parsed.deviceModel,

			// Network & Location
			ipAddress: ipAddress || undefined,
			timezone: timezone || undefined,

			// Additional Context
			referrer: referrer || undefined,
			language: language || undefined,
			platform: platform || undefined,
		};

		return deviceData;
	} catch (error) {
		console.error("Error collecting device data:", error);
		return null;
	}
}

/**
 * Collect device data with screen/viewport info (client-side only)
 */
export function collectClientDeviceData(): Partial<DeviceData> {
	if (typeof window === "undefined") {
		return {};
	}

	return {
		// Screen & Viewport
		screenWidth: window.screen.width,
		screenHeight: window.screen.height,
		viewportWidth: window.innerWidth,
		viewportHeight: window.innerHeight,
		pixelRatio: window.devicePixelRatio,

		// Connection info (if available)
		connectionType:
			(navigator as any).connection?.effectiveType || undefined,
		connectionSpeed: (navigator as any).connection?.downlink
			? `${(navigator as any).connection.downlink}Mbps`
			: undefined,
	};
}

/**
 * Merge server and client device data
 */
export function mergeDeviceData(
	serverData: DeviceData | null,
	clientData: Partial<DeviceData>
): DeviceData | null {
	if (!serverData) return null;

	return {
		...serverData,
		...clientData,
	};
}
