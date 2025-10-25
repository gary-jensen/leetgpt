export type Difficulty = "easy" | "medium" | "hard";

export interface AlgoLesson {
	id: string;
	slug: string;
	title: string;
	summary: string;
	topics: string[];
	difficulty: Difficulty;
	readingMinutes: number;
	bodyMd: string;
}

export interface AlgoProblemMeta {
	id: string;
	slug: string;
	title: string;
	topics: string[];
	difficulty: Difficulty;
	languages: string[];
}

export interface AlgoProblemDetail extends AlgoProblemMeta {
	statementMd: string;
	rubric: { optimal_time: string; acceptable_time: string[] };
	tests: { input: any[]; output: any }[];
	startingCode: { [language: string]: string };
	passingCode: { [language: string]: string }; // Admin debugging and testing purposes
	// Hints are AI-generated, not stored in hardcoded data
}

export interface AlgoProblemProgress {
	id: string;
	userId: string;
	problemId: string;
	language: "javascript"; // MVP: JavaScript only
	status: "not_started" | "in_progress" | "completed";
	currentCode: string;
	chatHistory: ChatMessage[];
	completedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface AlgoLessonProgress {
	id: string;
	userId: string;
	lessonId: string;
	status: "not_started" | "in_progress" | "completed";
	completedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

export interface RunRequest {
	problemId: string;
	language: string;
	code: string;
}

export interface RunResult {
	status: "ok" | "error";
	results?: {
		case: number;
		passed: boolean;
		input?: string;
		expected?: string;
		actual?: string;
	}[];
	runMs?: number;
	memoryKb?: number;
	message?: string;
}

export interface SubmitResult {
	status: "passed" | "failed" | "timeout" | "error";
	smallestFail?: { input: string; expected: string; actual: string };
	runMs?: number;
	memoryKb?: number;
}

export interface HintResponse {
	message: string;
	followUpQuestion?: string;
}

// Test case interface (matches existing FunctionTest structure)
export interface TestCase {
	input: any[]; // Array where each element is a parameter
	output: any; // Expected return value
}
