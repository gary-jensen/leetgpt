"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Get analytics events for a specific user
 */
export async function getUserEvents(
	limit: number = 100,
	offset: number = 0,
	category?: string
) {
	try {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, error: "User not authenticated" };
		}

		const where = {
			userId,
			...(category && { eventCategory: category }),
		};

		const events = await prisma.analyticsEvent.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: limit,
			skip: offset,
		});

		const total = await prisma.analyticsEvent.count({ where });

		return {
			success: true,
			events,
			total,
			hasMore: offset + limit < total,
		};
	} catch (error) {
		console.error("Failed to fetch user events:", error);
		return { success: false, error: "Failed to fetch events" };
	}
}

/**
 * Get events filtered by category and action
 */
export async function getEventsByCategory(
	category: string,
	action?: string,
	limit: number = 100
) {
	try {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, error: "User not authenticated" };
		}

		const events = await prisma.analyticsEvent.findMany({
			where: {
				userId,
				eventCategory: category,
				...(action && { eventAction: action }),
			},
			orderBy: { createdAt: "desc" },
			take: limit,
		});

		return { success: true, events };
	} catch (error) {
		console.error("Failed to fetch events by category:", error);
		return { success: false, error: "Failed to fetch events" };
	}
}

/**
 * Get aggregated statistics for a user
 */
export async function getEventStats(dateFrom?: Date, dateTo?: Date) {
	try {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, error: "User not authenticated" };
		}

		const where = {
			userId,
			...(dateFrom && { createdAt: { gte: dateFrom } }),
			...(dateTo && { createdAt: { lte: dateTo } }),
		};

		// Get total events
		const totalEvents = await prisma.analyticsEvent.count({ where });

		// Get events by category
		const eventsByCategory = await prisma.analyticsEvent.groupBy({
			by: ["eventCategory"],
			where,
			_count: {
				id: true,
			},
		});

		// Get events by action
		const eventsByAction = await prisma.analyticsEvent.groupBy({
			by: ["eventCategory", "eventAction"],
			where,
			_count: {
				id: true,
			},
		});

		// Get total XP gained (from events with eventValue)
		const xpEvents = await prisma.analyticsEvent.findMany({
			where: {
				...where,
				eventCategory: { in: ["Lesson", "Step", "Progress"] },
				eventValue: { not: null },
			},
			select: {
				eventValue: true,
			},
		});

		const totalXP = xpEvents.reduce(
			(sum, event) => sum + (event.eventValue || 0),
			0
		);

		return {
			success: true,
			stats: {
				totalEvents,
				eventsByCategory: eventsByCategory.map((cat) => ({
					category: cat.eventCategory,
					count: cat._count.id,
				})),
				eventsByAction: eventsByAction.map((act) => ({
					category: act.eventCategory,
					action: act.eventAction,
					count: act._count.id,
				})),
				totalXP,
			},
		};
	} catch (error) {
		console.error("Failed to fetch event stats:", error);
		return { success: false, error: "Failed to fetch stats" };
	}
}

/**
 * Get session-based analytics
 */
export async function getSessionAnalytics(sessionId: string) {
	try {
		const session = await getSession();
		const userId = session?.user?.id;

		if (!userId) {
			return { success: false, error: "User not authenticated" };
		}

		const events = await prisma.analyticsEvent.findMany({
			where: {
				userId,
				sessionId,
			},
			orderBy: { createdAt: "asc" },
		});

		const sessionInfo = await prisma.userSession.findUnique({
			where: { id: sessionId },
		});

		return {
			success: true,
			session: sessionInfo,
			events,
			eventCount: events.length,
		};
	} catch (error) {
		console.error("Failed to fetch session analytics:", error);
		return { success: false, error: "Failed to fetch session analytics" };
	}
}

/**
 * Get guest events (for anonymous users)
 */
export async function getGuestEvents(guestId: string, limit: number = 100) {
	try {
		const events = await prisma.analyticsEvent.findMany({
			where: {
				guestId,
				userId: null, // Only get events before they authenticated
			},
			orderBy: { createdAt: "desc" },
			take: limit,
		});

		return { success: true, events };
	} catch (error) {
		console.error("Failed to fetch guest events:", error);
		return { success: false, error: "Failed to fetch guest events" };
	}
}
