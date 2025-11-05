import {
	AlgoLesson,
	AlgoProblemMeta,
	AlgoProblemDetail,
} from "@/types/algorithm-types";
import { algoLessons } from "./algoLessons";
import { algoProblems } from "./problems/algoProblems";
import { prisma } from "@/lib/prisma";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";

export interface FilterOptions {
	topic?: string;
	difficulty?: string;
	search?: string;
}

export const getAlgoLessons = nextCache(
	async (filters?: FilterOptions): Promise<AlgoLesson[]> => {
		const dbLessons = (await prisma.algoLesson.findMany({
			orderBy: { createdAt: "desc" },
		})) as AlgoLesson[];

		let filtered = dbLessons.map((lesson) => ({
			id: lesson.id,
			slug: lesson.slug,
			title: lesson.title,
			summary: lesson.summary,
			topics: lesson.topics,
			difficulty: lesson.difficulty as "easy" | "medium" | "hard",
			readingMinutes: lesson.readingMinutes,
			bodyMd: lesson.bodyMd,
		}));

		if (filters?.topic) {
			filtered = filtered.filter((lesson) =>
				lesson.topics.includes(filters.topic!)
			);
		}

		if (filters?.difficulty) {
			filtered = filtered.filter(
				(lesson) => lesson.difficulty === filters.difficulty
			);
		}

		if (filters?.search) {
			const searchTerm = filters.search.toLowerCase();
			filtered = filtered.filter(
				(lesson) =>
					lesson.title.toLowerCase().includes(searchTerm) ||
					lesson.summary.toLowerCase().includes(searchTerm) ||
					lesson.topics.some((topic) =>
						topic.toLowerCase().includes(searchTerm)
					)
			);
		}

		return filtered;
	},
	["algo:lessons:list:v1"],
	{ tags: ["algo:lessons"] }
);

export const getAlgoProblems = nextCache(
	async (filters?: FilterOptions): Promise<AlgoProblemMeta[]> => {
		const dbProblems = await prisma.algoProblem.findMany({
			orderBy: { createdAt: "desc" },
			// selecting order if it exists in schema; safe even if not
		});

		let filtered = dbProblems.map((problem, idx) => ({
			id: problem.id,
			slug: problem.slug,
			title: problem.title,
			topics: problem.topics,
			difficulty: problem.difficulty as "easy" | "medium" | "hard",
			languages: problem.languages,
			order: (problem as any).order ?? idx + 1,
		}));

		if (filters?.topic) {
			filtered = filtered.filter((problem) =>
				problem.topics.includes(filters.topic!)
			);
		}

		if (filters?.difficulty) {
			filtered = filtered.filter(
				(problem) => problem.difficulty === filters.difficulty
			);
		}

		if (filters?.search) {
			const searchTerm = filters.search.toLowerCase();
			filtered = filtered.filter(
				(problem) =>
					problem.title.toLowerCase().includes(searchTerm) ||
					problem.topics.some((topic) =>
						topic.toLowerCase().includes(searchTerm)
					)
			);
		}

		return filtered;
	},
	["algo:problems:list:v1"],
	{ tags: ["algo:problems"] }
);

export async function getAlgoProblem(
	problemId: string
): Promise<AlgoProblemDetail | null> {
	const dbProblem = await prisma.algoProblem.findUnique({
		where: { id: problemId },
	});

	if (!dbProblem) {
		return null;
	}

	return {
		id: dbProblem.id,
		slug: dbProblem.slug,
		title: dbProblem.title,
		topics: dbProblem.topics,
		difficulty: dbProblem.difficulty as "easy" | "medium" | "hard",
		languages: dbProblem.languages,
		order: dbProblem.order,
		statementMd: dbProblem.statementMd,
		statementHtml: dbProblem.statementHtml || null,
		examplesAndConstraintsMd:
			(dbProblem as any).examplesAndConstraintsMd || null,
		examplesAndConstraintsHtml:
			(dbProblem as any).examplesAndConstraintsHtml || null,
		rubric: dbProblem.rubric as {
			optimal_time: string;
			acceptable_time: string[];
		},
		tests: dbProblem.tests as { input: any[]; output: any }[],
		parameterNames: dbProblem.parameterNames,
		startingCode: dbProblem.startingCode as {
			[key: string]: string;
		},
		passingCode: dbProblem.passingCode as { [key: string]: string },
		secondaryPassingCode: (dbProblem as any).secondaryPassingCode
			? ((dbProblem as any).secondaryPassingCode as {
					[key: string]: string;
			  })
			: undefined,
		systemCode: (dbProblem as any).systemCode
			? ((dbProblem as any).systemCode as { [key: string]: string })
			: undefined,
		outputOrderMatters: (dbProblem as any).outputOrderMatters ?? true,
	};
}

export async function getAlgoLesson(
	lessonId: string
): Promise<AlgoLesson | null> {
	const dbLesson = await prisma.algoLesson.findUnique({
		where: { id: lessonId },
	});

	if (!dbLesson) {
		return null;
	}

	return {
		id: dbLesson.id,
		slug: dbLesson.slug,
		title: dbLesson.title,
		summary: dbLesson.summary,
		topics: dbLesson.topics,
		difficulty: dbLesson.difficulty as "easy" | "medium" | "hard",
		readingMinutes: dbLesson.readingMinutes,
		bodyMd: dbLesson.bodyMd,
	};
}

export const getAllTopics = nextCache(
	async (): Promise<string[]> => {
		const dbProblems = (await prisma.algoProblem.findMany({
			select: { topics: true },
		})) as AlgoProblemDetail[];
		const dbLessons = (await prisma.algoLesson.findMany({
			select: { topics: true },
		})) as AlgoLesson[];

		const problemTopics = new Set(dbProblems.flatMap((p) => p.topics));
		const lessonTopics = new Set(dbLessons.flatMap((l) => l.topics));

		return Array.from(new Set([...problemTopics, ...lessonTopics])).sort();
	},
	["algo:topics:list:v1"],
	{ tags: ["algo:topics"] }
);

export function getDifficultyLevels(): string[] {
	return ["easy", "medium", "hard"];
}

// Note: Client-side sync functions have been removed.
// All data now comes from the database.

// Helper function to get problem by slug
export async function getAlgoProblemBySlug(
	slug: string
): Promise<AlgoProblemDetail | null> {
	const dbProblem = await prisma.algoProblem.findUnique({
		where: { slug },
	});

	if (!dbProblem) {
		return null;
	}

	return {
		id: dbProblem.id,
		slug: dbProblem.slug,
		title: dbProblem.title,
		topics: dbProblem.topics,
		difficulty: dbProblem.difficulty as "easy" | "medium" | "hard",
		languages: dbProblem.languages,
		order: dbProblem.order,
		statementMd: dbProblem.statementMd,
		statementHtml: dbProblem.statementHtml || null,
		examplesAndConstraintsMd:
			(dbProblem as any).examplesAndConstraintsMd || null,
		examplesAndConstraintsHtml:
			(dbProblem as any).examplesAndConstraintsHtml || null,
		rubric: dbProblem.rubric as {
			optimal_time: string;
			acceptable_time: string[];
		},
		tests: dbProblem.tests as { input: any[]; output: any }[],
		parameterNames: dbProblem.parameterNames,
		startingCode: dbProblem.startingCode as {
			[key: string]: string;
		},
		passingCode: dbProblem.passingCode as { [key: string]: string },
		secondaryPassingCode: (dbProblem as any).secondaryPassingCode
			? ((dbProblem as any).secondaryPassingCode as {
					[key: string]: string;
			  })
			: undefined,
		systemCode: (dbProblem as any).systemCode
			? ((dbProblem as any).systemCode as { [key: string]: string })
			: undefined,
		outputOrderMatters: (dbProblem as any).outputOrderMatters ?? true,
	};
}

// Helper function to get lesson by slug
export async function getAlgoLessonBySlug(
	slug: string
): Promise<AlgoLesson | null> {
	const dbLesson = await prisma.algoLesson.findUnique({
		where: { slug },
	});

	if (!dbLesson) {
		return null;
	}

	return {
		id: dbLesson.id,
		slug: dbLesson.slug,
		title: dbLesson.title,
		summary: dbLesson.summary,
		topics: dbLesson.topics,
		difficulty: dbLesson.difficulty as "easy" | "medium" | "hard",
		readingMinutes: dbLesson.readingMinutes,
		bodyMd: dbLesson.bodyMd,
	};
}

// Helper function to get lessons by multiple topics (OR logic - matches any topic)
export async function getLessonsByTopics(
	topics: string[]
): Promise<AlgoLesson[]> {
	if (!topics || topics.length === 0) {
		return [];
	}

	const dbLessons = (await prisma.algoLesson.findMany({
		orderBy: { createdAt: "desc" },
	})) as AlgoLesson[];

	// Filter lessons where lesson.topics intersects with any of the input topics
	const filtered = dbLessons
		.map((lesson) => ({
			id: lesson.id,
			slug: lesson.slug,
			title: lesson.title,
			summary: lesson.summary,
			topics: lesson.topics,
			difficulty: lesson.difficulty as "easy" | "medium" | "hard",
			readingMinutes: lesson.readingMinutes,
			bodyMd: lesson.bodyMd,
		}))
		.filter((lesson) =>
			// Check if lesson has at least one topic in common with input topics
			lesson.topics.some((lessonTopic) => topics.includes(lessonTopic))
		);

	return filtered;
}

// Export the raw data for direct access if needed
export { algoLessons, algoProblems };
