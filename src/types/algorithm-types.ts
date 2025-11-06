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
	bodyHtml?: string | null;
}

export interface AlgoProblemMeta {
	id: string;
	slug: string;
	title: string;
	topics: string[];
	difficulty: Difficulty;
	languages: string[];
	order: number;
}

// Parameter type definition
export interface Parameter {
	name: string;
	type: string; // "ListNode" | "TreeNode" | "number[]" | "number" | "string" | "boolean" | "number[][]" | etc.
}

export interface AlgoProblemDetail extends AlgoProblemMeta {
	statementMd: string;
	statementHtml?: string | null; // Pre-processed HTML (from database)
	examplesAndConstraintsMd?: string | null; // Examples and constraints markdown
	examplesAndConstraintsHtml?: string | null; // Pre-processed HTML for examples/constraints
	rubric: { optimal_time: string; acceptable_time: string[] };
	tests: { input: any[]; output: any }[];
	parameters?: Parameter[]; // Explicit parameter definitions with types
	returnType?: string; // Return type (e.g., "ListNode", "number[]", "boolean")
	functionName?: string; // Expected function name (e.g., "deleteDuplicates", "twoSum")
	startingCode: { [language: string]: string };
	passingCode: { [language: string]: string }; // Admin debugging and testing purposes
	secondaryPassingCode?: { [language: string]: string }; // Non-optimal passing code for test case validation
	outputOrderMatters?: boolean; // If false, arrays of arrays are compared as sets (order-independent). Default: true
	judge?: JudgeConfig; // Optional judge configuration (stored in database, allows custom validation without code changes)
	// Hints are AI-generated, not stored in hardcoded data
}

export interface ChatSession {
	id: string;
	createdAt: Date;
	messages: ChatMessage[];
}

export interface AlgoProblemProgress {
	id: string;
	userId: string;
	problemId: string;
	language: "javascript"; // MVP: JavaScript only
	status: "not_started" | "in_progress" | "completed";
	currentCode: string;
	chatHistory: ChatSession[];
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

export interface AlgoProblemSubmission {
	id: string;
	userId: string;
	problemId: string;
	language: string;
	code: string;
	passed: boolean;
	runtime?: number;
	testsPassed: number;
	testsTotal: number;
	submittedAt: Date;
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

// Judge configuration types
export type JudgeKind = "return-value" | "mutating-array-with-k" | "custom-script";

export interface JudgeConfig_ReturnValue {
	kind: "return-value";
	// Optional: ignoreOrder, numericTolerance, etc. can be added here
}

export interface JudgeConfig_MutatingArrayWithK {
	kind: "mutating-array-with-k";
	arrayParamIndex: number; // Which parameter is the array (0-indexed)
	kIsReturnValue: boolean; // Whether k is the return value (true) or a separate parameter
	ignoreOrder?: boolean; // Whether to sort before comparing (default: false)
}

export interface JudgeConfig_CustomScript {
	kind: "custom-script";
	script: string; // JavaScript code that implements the judge
	// Script should implement: function judge(args, returnValue, expected) { return { pass, actual, expected }; }
}

export type JudgeConfig =
	| JudgeConfig_ReturnValue
	| JudgeConfig_MutatingArrayWithK
	| JudgeConfig_CustomScript;
