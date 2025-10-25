"use server";

import { prisma } from "@/lib/prisma";
import {
	AlgoProblemProgress,
	AlgoLessonProgress,
	ChatMessage,
} from "@/types/algorithm-types";

export async function getAlgoProgress(userId: string): Promise<{
	problemProgress: AlgoProblemProgress[];
	lessonProgress: AlgoLessonProgress[];
}> {
	const [problemProgress, lessonProgress] = await Promise.all([
		prisma.algoProblemProgress.findMany({
			where: { userId },
			orderBy: { updatedAt: "desc" },
		}),
		prisma.algoLessonProgress.findMany({
			where: { userId },
			orderBy: { updatedAt: "desc" },
		}),
	]);

	return {
		problemProgress: problemProgress.map((p) => ({
			...p,
			language: p.language as "javascript",
			status: p.status as "not_started" | "in_progress" | "completed",
			chatHistory: p.chatHistory as unknown as ChatMessage[],
			completedAt: p.completedAt || undefined,
			createdAt: p.createdAt,
			updatedAt: p.updatedAt,
		})),
		lessonProgress: lessonProgress.map((l) => ({
			...l,
			status: l.status as "not_started" | "in_progress" | "completed",
			completedAt: l.completedAt || undefined,
			createdAt: l.createdAt,
			updatedAt: l.updatedAt,
		})),
	};
}

export async function getAlgoProblemProgress(
	userId: string,
	problemId: string,
	language: "javascript"
): Promise<{
	status: "not_started" | "in_progress" | "completed";
	currentCode: string;
	chatHistory: ChatMessage[];
	completedAt?: Date;
} | null> {
	const progress = await prisma.algoProblemProgress.findUnique({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
	});

	if (!progress) {
		return null;
	}

	return {
		status: progress.status as "not_started" | "in_progress" | "completed",
		currentCode: progress.currentCode,
		chatHistory: progress.chatHistory as unknown as ChatMessage[],
		completedAt: progress.completedAt || undefined,
	};
}

export async function updateAlgoProblemProgress(
	userId: string,
	problemId: string,
	language: "javascript",
	code: string,
	chatHistory: ChatMessage[],
	status?: "not_started" | "in_progress" | "completed"
): Promise<void> {
	// Escape code to prevent injection
	const escapedCode = escapeHtml(code);

	// Additional validation
	if (code.length > 10000) {
		// 10KB limit
		throw new Error("Code too long");
	}

	await prisma.algoProblemProgress.upsert({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
		update: {
			currentCode: escapedCode,
			chatHistory: chatHistory as any,
			status: status || "in_progress",
			updatedAt: new Date(),
		},
		create: {
			userId,
			problemId,
			language,
			currentCode: escapedCode,
			chatHistory: chatHistory as any,
			status: status || "in_progress",
		},
	});
}

export async function updateAlgoLessonProgress(
	userId: string,
	lessonId: string,
	status: "not_started" | "in_progress" | "completed"
): Promise<void> {
	await prisma.algoLessonProgress.upsert({
		where: {
			userId_lessonId: {
				userId,
				lessonId,
			},
		},
		update: {
			status,
			completedAt: status === "completed" ? new Date() : null,
			updatedAt: new Date(),
		},
		create: {
			userId,
			lessonId,
			status,
			completedAt: status === "completed" ? new Date() : null,
		},
	});
}

export async function addChatMessage(
	userId: string,
	problemId: string,
	language: "javascript",
	message: ChatMessage
): Promise<void> {
	const progress = await prisma.algoProblemProgress.findUnique({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
	});

	if (!progress) {
		throw new Error("Problem progress not found");
	}

	const chatHistory = progress.chatHistory as unknown as ChatMessage[];
	const updatedChatHistory = [...chatHistory, message];

	await prisma.algoProblemProgress.update({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
		data: {
			chatHistory: updatedChatHistory as any,
			updatedAt: new Date(),
		},
	});
}

export async function markProblemCompleted(
	userId: string,
	problemId: string,
	language: "javascript"
): Promise<void> {
	await prisma.algoProblemProgress.update({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
		data: {
			status: "completed",
			completedAt: new Date(),
			updatedAt: new Date(),
		},
	});
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
	const map: { [key: string]: string } = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#039;",
	};

	return text.replace(/[&<>"']/g, (m) => map[m]);
}
