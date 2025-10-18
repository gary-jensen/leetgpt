"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
	sanitizeMetadata,
	validateGuestId,
	validateEventCategory,
	validateEventAction,
	validateEventLabel,
} from "@/lib/validation";
import {
	checkRateLimit,
	getRateLimitKey,
	getIPRateLimitKey,
	RATE_LIMITS,
} from "@/lib/rateLimit";
import { getClientIP } from "@/lib/serverUtils";
import { collectDeviceData } from "@/lib/deviceDetection";

export interface AnalyticsEventData {
	eventCategory: string;
	eventAction: string;
	eventLabel?: string;
	eventValue?: number;
	metadata?: Record<string, any>;
	sessionId?: string;
	guestId?: string;
	isDev?: boolean;
}

/**
 * Save a single analytics event to the database
 */
export async function saveAnalyticsEvent(eventData: AnalyticsEventData) {
	try {
		const session = await getSession();
		const userId = session?.user?.id;
		const clientIP = await getClientIP();

		// Rate limiting - user/guest based
		const userKey = getRateLimitKey(
			userId || null,
			eventData.guestId || null,
			"analytics_single"
		);
		const userRateLimit = checkRateLimit(
			userKey,
			RATE_LIMITS.ANALYTICS_SINGLE.limit,
			RATE_LIMITS.ANALYTICS_SINGLE.windowMs
		);

		if (!userRateLimit.allowed) {
			return {
				success: false,
				error: `Rate limit exceeded. Please try again in ${Math.ceil(
					(userRateLimit.resetTime - Date.now()) / 1000
				)} seconds.`,
			};
		}

		// Rate limiting - IP based
		if (clientIP) {
			const ipKey = getIPRateLimitKey(clientIP, "analytics_single");
			const ipRateLimit = checkRateLimit(
				ipKey,
				RATE_LIMITS.ANALYTICS_IP.limit,
				RATE_LIMITS.ANALYTICS_IP.windowMs
			);

			if (!ipRateLimit.allowed) {
				return {
					success: false,
					error: `Rate limit exceeded. Please try again in ${Math.ceil(
						(ipRateLimit.resetTime - Date.now()) / 1000
					)} seconds.`,
				};
			}
		}

		// Validate event data
		if (!validateEventCategory(eventData.eventCategory)) {
			return {
				success: false,
				error: `Invalid event category: '${eventData.eventCategory}'. Allowed: Session, Lesson, Step, Code, Progress, Auth`,
			};
		}

		if (
			!validateEventAction(eventData.eventAction, eventData.eventCategory)
		) {
			return {
				success: false,
				error: `Invalid event action: '${eventData.eventAction}' for category '${eventData.eventCategory}'`,
			};
		}

		if (!validateEventLabel(eventData.eventLabel)) {
			return {
				success: false,
				error: "Event label too long. Maximum 200 characters allowed.",
			};
		}

		// Validate guest ID if provided
		if (eventData.guestId && !validateGuestId(eventData.guestId)) {
			return { success: false, error: "Invalid guest ID" };
		}

		// Sanitize metadata
		const sanitizedMetadata = eventData.metadata
			? sanitizeMetadata(eventData.metadata)
			: null;

		// Collect device data (with error handling)
		let deviceData = null;
		try {
			deviceData = await collectDeviceData();
		} catch (error) {
			// Continue without device data rather than failing the entire request
		}

		await prisma.analyticsEvent.create({
			data: {
				userId: userId || null,
				// Only save guestId for unauthenticated users
				guestId: userId ? null : eventData.guestId || null,
				eventCategory: eventData.eventCategory,
				eventAction: eventData.eventAction,
				eventLabel: eventData.eventLabel || null,
				eventValue: eventData.eventValue || null,
				metadata: sanitizedMetadata
					? (sanitizedMetadata as any)
					: undefined,
				sessionId: eventData.sessionId || null,
				isDev: eventData.isDev ?? false,
				deviceData: deviceData ? (deviceData as any) : undefined,
			},
		});

		return { success: true };
	} catch (error) {
		// console.error("Failed to save analytics event:", error);
		// Don't throw - we don't want analytics failures to break the app
		return { success: false, error: "Failed to save analytics event" };
	}
}

/**
 * Save multiple analytics events in a batch for efficiency
 */
export async function saveAnalyticsEventBatch(events: AnalyticsEventData[]) {
	try {
		const session = await getSession();
		const userId = session?.user?.id;
		const clientIP = await getClientIP();

		// Limit batch size to prevent abuse (reduced from 100 to 50)
		if (events.length > 50) {
			return {
				success: false,
				error: "Batch size too large. Maximum 50 events per batch.",
			};
		}

		// Rate limiting - user/guest based
		const userKey = getRateLimitKey(
			userId || null,
			events[0]?.guestId || null,
			"analytics_batch"
		);
		const userRateLimit = checkRateLimit(
			userKey,
			RATE_LIMITS.ANALYTICS_BATCH.limit,
			RATE_LIMITS.ANALYTICS_BATCH.windowMs
		);

		if (!userRateLimit.allowed) {
			return {
				success: false,
				error: `Rate limit exceeded. Please try again in ${Math.ceil(
					(userRateLimit.resetTime - Date.now()) / 1000
				)} seconds.`,
			};
		}

		// Rate limiting - IP based
		if (clientIP) {
			const ipKey = getIPRateLimitKey(clientIP, "analytics_batch");
			const ipRateLimit = checkRateLimit(
				ipKey,
				RATE_LIMITS.ANALYTICS_IP.limit,
				RATE_LIMITS.ANALYTICS_IP.windowMs
			);

			if (!ipRateLimit.allowed) {
				return {
					success: false,
					error: `Rate limit exceeded. Please try again in ${Math.ceil(
						(ipRateLimit.resetTime - Date.now()) / 1000
					)} seconds.`,
				};
			}
		}

		// Validate all events before saving any
		for (const event of events) {
			// Validate event data
			if (!validateEventCategory(event.eventCategory)) {
				return {
					success: false,
					error: `Invalid event category: '${event.eventCategory}'. Allowed: Session, Lesson, Step, Code, Progress, Auth`,
				};
			}

			if (!validateEventAction(event.eventAction, event.eventCategory)) {
				return {
					success: false,
					error: `Invalid event action: '${event.eventAction}' for category '${event.eventCategory}'`,
				};
			}

			if (!validateEventLabel(event.eventLabel)) {
				return {
					success: false,
					error: "Event label too long. Maximum 200 characters allowed.",
				};
			}

			// Validate guest ID if provided
			if (event.guestId && !validateGuestId(event.guestId)) {
				return { success: false, error: "Invalid guest ID in batch" };
			}
		}

		// Collect device data once for the batch (with error handling)
		let deviceData = null;
		try {
			deviceData = await collectDeviceData();
		} catch (error) {
			// Continue without device data rather than failing the entire batch
		}

		// Validate and sanitize all events
		const validatedEvents = events.map((event) => {
			// Sanitize metadata
			const sanitizedMetadata = event.metadata
				? sanitizeMetadata(event.metadata)
				: null;

			return {
				userId: userId || null,
				// Only save guestId for unauthenticated users
				guestId: userId ? null : event.guestId || null,
				eventCategory: event.eventCategory,
				eventAction: event.eventAction,
				eventLabel: event.eventLabel || null,
				eventValue: event.eventValue || null,
				metadata: sanitizedMetadata
					? (sanitizedMetadata as any)
					: undefined,
				sessionId: event.sessionId || null,
				isDev: event.isDev ?? false,
				deviceData: deviceData ? (deviceData as any) : undefined,
			};
		});

		await prisma.analyticsEvent.createMany({
			data: validatedEvents,
			skipDuplicates: true,
		});

		return { success: true, count: events.length };
	} catch (error) {
		// console.error("Failed to save analytics event batch:", error);
		return { success: false, error: "Failed to save analytics events" };
	}
}

/**
 * @deprecated This function has a security vulnerability - it doesn't verify session ownership.
 * Any authenticated user can update any session by knowing/guessing the session ID.
 * This function is not currently used and should be removed or fixed with proper ownership verification.
 *
 * Update session end time and duration
 */
/*
export async function updateSessionEnd(
	sessionId: string,
	durationSeconds: number
) {
	try {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, error: "User not authenticated" };
		}

		await prisma.userSession.update({
			where: { id: sessionId },
			data: {
				sessionEnd: new Date(),
				durationSeconds,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to update session end:", error);
		return { success: false, error: "Failed to update session" };
	}
}
*/
