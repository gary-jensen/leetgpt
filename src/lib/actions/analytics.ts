"use server";

import { prisma } from "@/lib/prisma";

export async function startUserSession(userId: string) {
	try {
		const session = await prisma.userSession.create({
			data: {
				userId,
			},
		});

		return { success: true, sessionId: session.id };
	} catch (error) {
		console.error("Failed to start user session:", error);
		return { success: false, error: "Failed to start session" };
	}
}

export async function endUserSession(
	sessionId: string,
	durationSeconds: number,
	lessonsCompleted: number
) {
	try {
		await prisma.userSession.update({
			where: { id: sessionId },
			data: {
				sessionEnd: new Date(),
				durationSeconds,
				lessonsCompleted,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to end user session:", error);
		return { success: false, error: "Failed to end session" };
	}
}

export async function getUserSessions(userId: string, limit: number = 10) {
	try {
		const sessions = await prisma.userSession.findMany({
			where: { userId },
			orderBy: { sessionStart: "desc" },
			take: limit,
		});

		return { success: true, sessions };
	} catch (error) {
		console.error("Failed to fetch user sessions:", error);
		return { success: false, error: "Failed to fetch sessions" };
	}
}
