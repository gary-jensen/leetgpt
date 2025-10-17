/**
 * Client-side device data collection for analytics
 *
 * This runs in the browser to collect screen size, viewport, and other
 * client-specific data that can't be obtained server-side.
 */

import { collectClientDeviceData, DeviceData } from "./deviceDetection";

/**
 * Collect device data on the client side
 */
export function getClientDeviceData(): Partial<DeviceData> {
	return collectClientDeviceData();
}

/**
 * Send analytics event with device data
 */
export async function trackEventWithDeviceData(eventData: {
	eventCategory: string;
	eventAction: string;
	eventLabel?: string;
	eventValue?: number;
	metadata?: Record<string, any>;
	sessionId?: string;
	guestId?: string;
	isDev?: boolean;
}) {
	try {
		// Collect client-side device data
		const clientDeviceData = getClientDeviceData();

		// Add device data to metadata
		const enhancedMetadata = {
			...eventData.metadata,
			deviceData: clientDeviceData,
		};

		// Import analytics function dynamically to avoid SSR issues
		const { saveAnalyticsEvent } = await import("@/lib/actions/analytics");

		return await saveAnalyticsEvent({
			...eventData,
			metadata: enhancedMetadata,
		});
	} catch (error) {
		console.error("Failed to track event with device data:", error);
		return { success: false, error: "Failed to track event" };
	}
}

/**
 * Track page view with device data
 */
export async function trackPageView(
	page: string,
	additionalData?: {
		sessionId?: string;
		guestId?: string;
		metadata?: Record<string, any>;
	}
) {
	return trackEventWithDeviceData({
		eventCategory: "Session",
		eventAction: "page_view",
		eventLabel: page,
		...additionalData,
	});
}

/**
 * Track lesson interaction with device data
 */
export async function trackLessonEvent(
	action: "lesson_start" | "lesson_complete" | "lesson_skip",
	lessonId: string,
	additionalData?: {
		sessionId?: string;
		guestId?: string;
		metadata?: Record<string, any>;
	}
) {
	return trackEventWithDeviceData({
		eventCategory: "Lesson",
		eventAction: action,
		eventLabel: lessonId,
		...additionalData,
	});
}

/**
 * Track code execution with device data
 */
export async function trackCodeEvent(
	action: "code_run" | "code_submit_correct" | "code_submit_incorrect",
	additionalData?: {
		sessionId?: string;
		guestId?: string;
		metadata?: Record<string, any>;
	}
) {
	return trackEventWithDeviceData({
		eventCategory: "Code",
		eventAction: action,
		...additionalData,
	});
}

/**
 * Track progress events with device data
 */
export async function trackProgressEvent(
	action: "level_up" | "skill_node_complete" | "xp_gain",
	additionalData?: {
		sessionId?: string;
		guestId?: string;
		metadata?: Record<string, any>;
	}
) {
	return trackEventWithDeviceData({
		eventCategory: "Progress",
		eventAction: action,
		...additionalData,
	});
}
