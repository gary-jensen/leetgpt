"use server";

import { prisma } from "@/lib/prisma";
import {
	AlgoProblemProgress,
	AlgoLessonProgress,
	AlgoProblemSubmission,
	ChatMessage,
	ChatSession,
} from "@/types/algorithm-types";
import { JsonValue } from "@prisma/client/runtime/library";

// Helper function to safely parse chat history from Prisma JSON
function parseChatHistory(value: JsonValue): ChatSession[] {
	if (!value) return [];
	if (!Array.isArray(value)) return [];

	return value
		.map((item) => {
			if (typeof item !== "object" || item === null) return null;
			const obj = item as Record<string, any>;
			return {
				id: typeof obj.id === "string" ? obj.id : "",
				createdAt: obj.createdAt ? new Date(obj.createdAt) : new Date(),
				messages: Array.isArray(obj.messages)
					? obj.messages.map((msg: any) => ({
							id: typeof msg.id === "string" ? msg.id : "",
							role:
								msg.role === "user" || msg.role === "assistant"
									? msg.role
									: "user",
							content:
								typeof msg.content === "string"
									? msg.content
									: "",
							timestamp: msg.timestamp
								? new Date(msg.timestamp)
								: new Date(),
					  }))
					: [],
			} as ChatSession;
		})
		.filter((session): session is ChatSession => session !== null);
}

export async function getAlgoProgress(userId: string): Promise<{
	problemProgress: AlgoProblemProgress[];
	lessonProgress: AlgoLessonProgress[];
	submissions: AlgoProblemSubmission[];
}> {
	const [problemProgress, lessonProgress, submissions] = await Promise.all([
		prisma.algoProblemProgress.findMany({
			where: { userId },
			orderBy: { updatedAt: "desc" },
			select: { id: true, status: true, problemId: true, language: true },
		}),
		prisma.algoLessonProgress.findMany({
			where: { userId },
			orderBy: { updatedAt: "desc" },
			select: {
				id: true,
				// lessonId: true,
				status: true,
				// completedAt: true,
				// createdAt: true,
				// updatedAt: true,
			},
		}),
		// prisma.algoProblemSubmission.findMany({
		// 	where: { userId },
		// 	orderBy: { submittedAt: "desc" },
		// 	take: 100, // Limit to last 100 submissions for performance
		// }),
		[],
	]);

	return {
		problemProgress: problemProgress.map(
			(p: any): AlgoProblemProgress => ({
				...p,
				language: p.language as "javascript",
				status: p.status as "not_started" | "in_progress" | "completed",
				chatHistory: parseChatHistory(p.chatHistory),
				completedAt: p.completedAt || undefined,
				createdAt: p.createdAt,
				updatedAt: p.updatedAt,
			})
		),
		lessonProgress: lessonProgress.map(
			(l: any): AlgoLessonProgress => ({
				...l,
				status: l.status as "not_started" | "in_progress" | "completed",
				completedAt: l.completedAt || undefined,
				createdAt: l.createdAt,
				updatedAt: l.updatedAt,
			})
		),
		submissions: submissions.map(
			(s: any): AlgoProblemSubmission => ({
				...s,
				runtime: s.runtime || undefined,
				submittedAt: s.submittedAt,
			})
		),
	};
}

export async function getAlgoProblemProgress(
	userId: string,
	problemId: string,
	language: "javascript"
): Promise<{
	status: "not_started" | "in_progress" | "completed";
	currentCode: string;
	chatHistory: ChatSession[];
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

	// Parse chatHistory from JSON
	const chatHistory = parseChatHistory(progress.chatHistory);

	return {
		status: progress.status as "not_started" | "in_progress" | "completed",
		currentCode: progress.currentCode,
		chatHistory,
		completedAt: progress.completedAt || undefined,
	};
}

export async function updateAlgoProblemProgress(
	userId: string,
	problemId: string,
	language: "javascript",
	data:
		| string
		| ChatSession[]
		| {
				currentCode?: string;
				chatHistory?: ChatSession[];
				status?: "not_started" | "in_progress" | "completed";
		  },
	chatHistoryOrStatus?:
		| ChatSession[]
		| "not_started"
		| "in_progress"
		| "completed"
): Promise<void> {
	// Support multiple calling patterns
	let updateData: {
		currentCode?: string;
		chatHistory?: ChatSession[];
		status?: "not_started" | "in_progress" | "completed";
	} = {};

	if (typeof data === "string") {
		// Old pattern: (userId, problemId, language, code, chatHistory, status?)
		const escapedCode = escapeHtml(data);
		if (escapedCode.length > 10000) {
			throw new Error("Code too long");
		}
		updateData.currentCode = escapedCode;
		updateData.chatHistory = chatHistoryOrStatus as ChatSession[];
		updateData.status = undefined;
	} else if (Array.isArray(data)) {
		// Pattern with array
		updateData.chatHistory = data;
	} else {
		// New pattern: (userId, problemId, language, { currentCode?, chatHistory?, status? })
		if (data.currentCode) {
			const escapedCode = escapeHtml(data.currentCode);
			if (escapedCode.length > 10000) {
				throw new Error("Code too long");
			}
			updateData.currentCode = escapedCode;
		}
		if (data.chatHistory) {
			updateData.chatHistory = data.chatHistory;
		}
		if (data.status) {
			updateData.status = data.status;
		}
	}

	// Merge with existing progress
	const existing = await prisma.algoProblemProgress.findUnique({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
	});

	// Convert ChatSession[] to JSON-serializable format
	const chatHistoryToSave = updateData.chatHistory
		? updateData.chatHistory.map((session) => ({
				id: session.id,
				createdAt: session.createdAt,
				messages: session.messages.map((msg) => ({
					id: msg.id,
					role: msg.role,
					content: msg.content,
					timestamp: msg.timestamp,
				})),
		  }))
		: existing?.chatHistory
		? parseChatHistory(existing.chatHistory).map((session) => ({
				id: session.id,
				createdAt: session.createdAt,
				messages: session.messages.map((msg) => ({
					id: msg.id,
					role: msg.role,
					content: msg.content,
					timestamp: msg.timestamp,
				})),
		  }))
		: [];

	const finalUpdate = {
		currentCode: updateData.currentCode || existing?.currentCode || "",
		chatHistory: chatHistoryToSave,
		status: updateData.status || existing?.status || "in_progress",
		updatedAt: new Date(),
	};

	await prisma.algoProblemProgress.upsert({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
		update: finalUpdate,
		create: {
			userId,
			problemId,
			language,
			...finalUpdate,
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

	// TODO: Deprecate this function - chat messages now managed via sessions
	// For now, just cast and add to array
	const chatSessions = parseChatHistory(progress.chatHistory);
	// Get last session or create new one
	const lastSession = chatSessions[chatSessions.length - 1];
	if (lastSession) {
		lastSession.messages.push(message);
	}
	await prisma.algoProblemProgress.update({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
		data: {
			chatHistory: chatSessions as any,
			updatedAt: new Date(),
		},
	});
}

export async function markProblemCompleted(
	userId: string,
	problemId: string,
	language: "javascript"
): Promise<void> {
	// Get existing progress if it exists
	const existing = await prisma.algoProblemProgress.findUnique({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
	});

	// Preserve existing data or use defaults
	const chatHistoryToSave = existing?.chatHistory
		? parseChatHistory(existing.chatHistory).map((session) => ({
				id: session.id,
				createdAt: session.createdAt,
				messages: session.messages.map((msg) => ({
					id: msg.id,
					role: msg.role,
					content: msg.content,
					timestamp: msg.timestamp,
				})),
		  }))
		: [];

	await prisma.algoProblemProgress.upsert({
		where: {
			userId_problemId_language: {
				userId,
				problemId,
				language,
			},
		},
		update: {
			status: "completed",
			completedAt: new Date(),
			updatedAt: new Date(),
		},
		create: {
			userId,
			problemId,
			language,
			status: "completed",
			currentCode: existing?.currentCode || "",
			chatHistory: chatHistoryToSave,
			completedAt: new Date(),
		},
	});
}

// Submission tracking
export async function createSubmission(
	userId: string,
	problemId: string,
	language: string,
	code: string,
	passed: boolean,
	runtime: number | undefined,
	testsPassed: number,
	testsTotal: number
): Promise<AlgoProblemSubmission> {
	const submission = await (prisma as any).algoProblemSubmission.create({
		data: {
			userId,
			problemId,
			language,
			code: escapeHtml(code),
			passed,
			runtime,
			testsPassed,
			testsTotal,
		},
	});

	return {
		...submission,
		runtime: submission.runtime || undefined,
		submittedAt: submission.submittedAt,
	};
}

export async function getSubmissionHistory(
	userId: string,
	problemId: string
): Promise<AlgoProblemSubmission[]> {
	const submissions = await (prisma as any).algoProblemSubmission.findMany({
		where: {
			userId,
			problemId,
		},
		orderBy: { submittedAt: "desc" },
		take: 50, // Limit to last 50 submissions per problem
	});

	return submissions.map(
		(s: any): AlgoProblemSubmission => ({
			...s,
			runtime: s.runtime || undefined,
			submittedAt: s.submittedAt,
		})
	);
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
