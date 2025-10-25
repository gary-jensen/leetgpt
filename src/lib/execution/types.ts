// Core types for the new console system

export interface ExecutionResult {
	success: boolean;
	result?: any;
	logs: string[];
	error?: string;
	tracked?: TrackedData;
	cancelled?: boolean;
	__bs_tracked?: { name: string; value: any }[]; // Old system compatibility
	__bs_calls?: { name: string; args: any[] }[]; // Old system compatibility
}

export interface TrackedData {
	variables: { [key: string]: any };
	variableTrace?: { [key: string]: any[] }; // Track variable changes over time
	functions?: {
		[key: string]: { name: string; type: string; toString: string };
	}; // Track declared functions (serialized)
	functionCalls?: { name: string; args: any[] }[];
}

export interface TestResult {
	passed: boolean;
	testType: string;
	expected?: any;
	actual?: any;
	message?: string;
}

export interface QuestionData {
	id: string;
	prompt: string;
	tests: Test[];
	hints: string[];
	startingCode?: string;
	passingCode?: string; // Code that should make all tests pass
}

// Test types (ported from old system)
export interface VariableTraceTest {
	type: "variableTrace";
	variableName: string;
	expectedSequence: any[]; // Array of values the variable should have over time
}

export interface ConsoleTest {
	type: "console";
	expectedOutput: string[];
	negated?: boolean; // If true, these outputs should NOT appear
}

export interface FunctionTest {
	type: "function";
	functionName: string;
	testCases: {
		input: any[];
		output?: any; // Expected exact console output
		outputPattern?: string; // Regex pattern for console output validation
		return?: any; // Expected return value
		description?: string; // Description of what this test case validates
		negatedOutput?: string[]; // Console output that should NOT appear during function execution
	}[];
}

export interface FunctionCallTest {
	type: "functionCall";
	functionName: string;
	expectedCount?: number;
	expectedArgs?: any[][];
}

export interface FunctionDeclarationTest {
	type: "functionDeclaration";
	functionName: string;
	parameters: string[];
	functionType?: "arrow" | "regular"; // Optional: specify arrow vs regular function
}

export interface CodeContainsTest {
	type: "codeContains";
	pattern: string;
	caseSensitive?: boolean;
}

export type Test =
	| VariableTraceTest
	| ConsoleTest
	| FunctionTest
	| FunctionCallTest
	| FunctionDeclarationTest
	| CodeContainsTest;
