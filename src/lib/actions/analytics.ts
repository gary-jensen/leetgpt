"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

		await prisma.analyticsEvent.create({
			data: {
				userId: userId || null,
				// Only save guestId for unauthenticated users
				guestId: userId ? null : eventData.guestId || null,
				eventCategory: eventData.eventCategory,
				eventAction: eventData.eventAction,
				eventLabel: eventData.eventLabel || null,
				eventValue: eventData.eventValue || null,
				metadata: eventData.metadata
					? (eventData.metadata as any)
					: undefined,
				sessionId: eventData.sessionId || null,
				isDev: eventData.isDev ?? false,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to save analytics event:", error);
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

		await prisma.analyticsEvent.createMany({
			data: events.map((event) => ({
				userId: userId || null,
				// Only save guestId for unauthenticated users
				guestId: userId ? null : event.guestId || null,
				eventCategory: event.eventCategory,
				eventAction: event.eventAction,
				eventLabel: event.eventLabel || null,
				eventValue: event.eventValue || null,
				metadata: event.metadata ? (event.metadata as any) : undefined,
				sessionId: event.sessionId || null,
				isDev: event.isDev ?? false,
			})),
			skipDuplicates: true,
		});

		return { success: true, count: events.length };
	} catch (error) {
		console.error("Failed to save analytics event batch:", error);
		return { success: false, error: "Failed to save analytics events" };
	}
}

/**
 * Update session end time and duration
 */
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
