import { AlgoProblemDetail } from "@/types/algorithm-types";

export interface AlgoTestResult {
	case: number;
	passed: boolean;
	input: any[];
	expected: any;
	actual?: any;
	error?: string;
	runtime?: number; // Runtime in milliseconds for this specific test case
}

export interface AlgoExecutionResult {
	status: "ok" | "error";
	results: AlgoTestResult[];
	runMs?: number;
	message?: string;
}

/**
 * Execute algorithm problem tests against user code
 */
export async function executeAlgoTests(
	problem: AlgoProblemDetail,
	code: string,
	language: string = "javascript"
): Promise<AlgoExecutionResult> {
	const startTime = Date.now();

	try {
		// Create a function from the user's code
		const userFunction = createFunctionFromCode(code, problem);

		if (!userFunction) {
			return {
				status: "error",
				results: [],
				message: "Could not extract function from code",
			};
		}

		// Run all test cases
		const results: AlgoTestResult[] = [];

		for (let i = 0; i < problem.tests.length; i++) {
			const testCase = problem.tests[i];
			const result = await runSingleTest(userFunction, testCase, i + 1);
			results.push(result);
		}

		const runMs = Date.now() - startTime;

		return {
			status: "ok",
			results,
			runMs,
		};
	} catch (error) {
		const runMs = Date.now() - startTime;

		return {
			status: "error",
			results: [],
			runMs,
			message: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Create a function from user code by extracting the main function
 */
function createFunctionFromCode(
	code: string,
	problem: AlgoProblemDetail
): ((...args: any[]) => any) | null {
	try {
		// Try to extract the main function from the code
		const functionName = getMainFunctionName(problem);

		// Create a wrapper that includes the user's code and returns the function
		const wrappedCode =
			code +
			`
			
			// Return the main function
			if (typeof ${functionName} === 'function') {
				return ${functionName};
			}
			
			// If no function found, return null
			return null;
		`;

		// Use Function constructor to create the function
		const func = new Function(wrappedCode);
		return func();
	} catch (error) {
		console.error("Error creating function from code:", error);
		return null;
	}
}

/**
 * Get the main function name from the problem
 * This is a simple heuristic - in a real implementation, you might want to be more sophisticated
 */
function getMainFunctionName(problem: AlgoProblemDetail): string {
	// Try to extract function name from starting code
	const startingCode = problem.startingCode.javascript || "";
	const functionMatch = startingCode.match(/function\s+(\w+)/);
	if (functionMatch) {
		return functionMatch[1];
	}

	// Try arrow function
	const arrowMatch = startingCode.match(/(?:const|let|var)\s+(\w+)\s*=/);
	if (arrowMatch) {
		return arrowMatch[1];
	}

	// Fallback to a common pattern
	return "solution";
}

/**
 * Run a single test case
 */
async function runSingleTest(
	userFunction: (...args: any[]) => any,
	testCase: { input: any[]; output: any },
	caseNumber: number
): Promise<AlgoTestResult> {
	const startTime = Date.now();

	try {
		// Call the user's function with the test input
		const actual = userFunction(...testCase.input);

		// Compare actual vs expected
		const passed = deepEqual(actual, testCase.output);
		const runtime = Date.now() - startTime;

		return {
			case: caseNumber,
			passed,
			input: testCase.input,
			expected: testCase.output,
			actual: actual,
			runtime,
		};
	} catch (error) {
		const runtime = Date.now() - startTime;

		return {
			case: caseNumber,
			passed: false,
			input: testCase.input,
			expected: testCase.output,
			error: error instanceof Error ? error.message : String(error),
			runtime,
		};
	}
}

/**
 * Deep equality comparison for test results
 */
function deepEqual(a: any, b: any): boolean {
	if (a === b) return true;

	if (a == null || b == null) return a === b;

	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((val, index) => deepEqual(val, b[index]));
	}

	if (typeof a === "object" && typeof b === "object") {
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);

		if (keysA.length !== keysB.length) return false;

		return keysA.every((key) => deepEqual(a[key], b[key]));
	}

	return false;
}
