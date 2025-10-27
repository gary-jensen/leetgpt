import {
	AlgoLesson,
	AlgoProblemMeta,
	AlgoProblemDetail,
} from "@/types/algorithm-types";
import { algoLessons } from "./algoLessons";
import { algoProblems } from "./algoProblems";
import { prisma } from "@/lib/prisma";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";

export interface FilterOptions {
	topic?: string;
	difficulty?: string;
	search?: string;
}

export async function getAlgoLessons(
	filters?: FilterOptions
): Promise<AlgoLesson[]> {
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
}

export async function getAlgoProblems(
	filters?: FilterOptions
): Promise<AlgoProblemMeta[]> {
	const dbProblems = await prisma.algoProblem.findMany({
		orderBy: { createdAt: "desc" },
	});

	let filtered = dbProblems.map((problem) => ({
		id: problem.id,
		slug: problem.slug,
		title: problem.title,
		topics: problem.topics,
		difficulty: problem.difficulty as "easy" | "medium" | "hard",
		languages: problem.languages,
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
}

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
		statementMd: dbProblem.statementMd,
		statementHtml: dbProblem.statementHtml || null,
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

export async function getAllTopics(): Promise<string[]> {
	const dbProblems = (await prisma.algoProblem.findMany({
		select: { topics: true },
	})) as AlgoProblemDetail[];
	const dbLessons = (await prisma.algoLesson.findMany({
		select: { topics: true },
	})) as AlgoLesson[];

	const problemTopics = new Set(dbProblems.flatMap((p) => p.topics));
	const lessonTopics = new Set(dbLessons.flatMap((l) => l.topics));

	return Array.from(new Set([...problemTopics, ...lessonTopics])).sort();
}

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
		statementMd: dbProblem.statementMd,
		statementHtml: dbProblem.statementHtml || null,
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

// Export the raw data for direct access if needed
export { algoLessons, algoProblems };
