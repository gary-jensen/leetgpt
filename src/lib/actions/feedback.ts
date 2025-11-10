"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function submitProblemFeedback(
	problemId: string,
	issues: string[],
	additionalFeedback?: string
): Promise<{ success: boolean; error?: string }> {
	try {
		// Validate input
		if (!problemId || !Array.isArray(issues) || issues.length === 0) {
			return {
				success: false,
				error: "Problem ID and at least one issue are required",
			};
		}

		// Require authentication
		const session = await getSession();
		if (!session?.user?.id) {
			return {
				success: false,
				error: "You must be logged in to submit feedback",
			};
		}

		// Save feedback to database
		await prisma.algoProblemFeedback.create({
			data: {
				problemId,
				userId: session.user.id,
				issues,
				additionalFeedback: additionalFeedback || null,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error submitting feedback:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to submit feedback. Please try again.",
		};
	}
}

