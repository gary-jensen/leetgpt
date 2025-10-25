import {
	AlgoLesson,
	AlgoProblemMeta,
	AlgoProblemDetail,
} from "@/types/algorithm-types";
import { algoLessons } from "./algoLessons";
import { algoProblems } from "./algoProblems";

export interface FilterOptions {
	topic?: string;
	difficulty?: string;
	search?: string;
}

export function getAlgoLessons(filters?: FilterOptions): AlgoLesson[] {
	let filtered = [...algoLessons];

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

export function getAlgoProblems(filters?: FilterOptions): AlgoProblemMeta[] {
	let filtered = algoProblems.map((problem) => ({
		id: problem.id,
		slug: problem.slug,
		title: problem.title,
		topics: problem.topics,
		difficulty: problem.difficulty,
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

export function getAlgoProblem(problemId: string): AlgoProblemDetail | null {
	return algoProblems.find((problem) => problem.id === problemId) || null;
}

export function getAlgoLesson(lessonId: string): AlgoLesson | null {
	return algoLessons.find((lesson) => lesson.id === lessonId) || null;
}

export function getAllTopics(): string[] {
	const problemTopics = new Set(
		algoProblems.flatMap((problem) => problem.topics)
	);
	const lessonTopics = new Set(
		algoLessons.flatMap((lesson) => lesson.topics)
	);

	return Array.from(new Set([...problemTopics, ...lessonTopics])).sort();
}

export function getDifficultyLevels(): string[] {
	return ["easy", "medium", "hard"];
}

// Export the raw data for direct access if needed
export { algoLessons, algoProblems };
