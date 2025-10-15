"use server";

import { prisma } from "@/lib/prisma";

export async function saveCodeSubmission(
	userId: string,
	lessonId: string,
	stepId: string,
	code: string,
	isCorrect: boolean,
	lessonData?: any
) {
	try {
		await prisma.codeSubmission.create({
			data: {
				userId,
				lessonId,
				stepId,
				code,
				isCorrect,
				lessonData: lessonData || null,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Failed to save code submission:", error);
		return { success: false, error: "Failed to save submission" };
	}
}

export async function getUserSubmissions(userId: string, lessonId?: string) {
	try {
		const submissions = await prisma.codeSubmission.findMany({
			where: {
				userId,
				...(lessonId && { lessonId }),
			},
			orderBy: {
				submittedAt: "desc",
			},
			take: 50, // Limit to last 50 submissions
		});

		return { success: true, submissions };
	} catch (error) {
		console.error("Failed to fetch user submissions:", error);
		return { success: false, error: "Failed to fetch submissions" };
	}
}
