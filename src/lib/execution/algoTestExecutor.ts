import { AlgoProblemDetail } from "@/types/algorithm-types";
import { roundTo5Decimals } from "@/utils/numberUtils";

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
			const result = await runSingleTest(
				userFunction,
				testCase,
				i + 1,
				problem
			);
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
 * Deep clone a value (handles arrays, objects, primitives)
 */
function deepClone(value: any): any {
	if (value === null || value === undefined) {
		return value;
	}
	if (typeof value === "function") {
		return value; // Functions can't be cloned, return as-is
	}
	if (typeof value !== "object") {
		return value; // Primitives don't need cloning
	}
	if (Array.isArray(value)) {
		return value.map(deepClone);
	}
	// Regular object
	const cloned: any = {};
	for (const key in value) {
		if (Object.prototype.hasOwnProperty.call(value, key)) {
			cloned[key] = deepClone(value[key]);
		}
	}
	return cloned;
}

/**
 * Run a single test case
 */
async function runSingleTest(
	userFunction: (...args: any[]) => any,
	testCase: { input: any[]; output: any },
	caseNumber: number,
	problem?: AlgoProblemDetail
): Promise<AlgoTestResult> {
	const startTime = Date.now();

	try {
		// Round test case input to 5 decimal places
		const roundedInput = roundTo5Decimals(testCase.input);

		// Deep clone the input to prevent in-place modifications from affecting the original
		const clonedInput = deepClone(roundedInput);

		// Call the user's function with the cloned input
		const returnValue = userFunction(...clonedInput);

		// Round expected output to 5 decimal places
		const roundedExpected = roundTo5Decimals(testCase.output);

		// Determine what to compare:
		// - If function returns undefined/null AND the first argument is an array/object,
		//   it likely modifies in-place. Compare the modified first argument with expected.
		// - Otherwise, compare the return value with expected
		let actual: any;
		let passed: boolean;

		const firstArg = clonedInput.length > 0 ? clonedInput[0] : null;
		const isFirstArgArrayOrObject =
			firstArg !== null &&
			firstArg !== undefined &&
			(Array.isArray(firstArg) || typeof firstArg === "object");

		if (
			(returnValue === undefined || returnValue === null) &&
			isFirstArgArrayOrObject
		) {
			// Likely in-place modification: compare the modified first argument with expected
			// Round the modified input after function execution
			const roundedModifiedInput = roundTo5Decimals(clonedInput);
			// If there's only one argument, compare that argument directly
			// Otherwise, compare the entire input array
			actual =
				roundedInput.length === 1
					? roundedModifiedInput[0]
					: roundedModifiedInput;
		} else {
			// Normal return value: compare return value with expected
			actual = roundTo5Decimals(returnValue);
		}

		// Compare actual vs expected (both already rounded)
		// Use outputOrderMatters from problem if available, default to true
		const outputOrderMatters = problem?.outputOrderMatters ?? true;
		passed = deepEqual(actual, roundedExpected, outputOrderMatters);
		const runtime = Date.now() - startTime;

		return {
			case: caseNumber,
			passed,
			input: roundedInput,
			expected: roundedExpected,
			actual: actual,
			runtime,
		};
	} catch (error) {
		const runtime = Date.now() - startTime;

		// Round input and expected even in error case
		const roundedInput = roundTo5Decimals(testCase.input);
		const roundedExpected = roundTo5Decimals(testCase.output);

		return {
			case: caseNumber,
			passed: false,
			input: roundedInput,
			expected: roundedExpected,
			error: error instanceof Error ? error.message : String(error),
			runtime,
		};
	}
}

/**
 * Normalize arrays for order-independent comparison
 * - Arrays of arrays: sorts each sub-array, then sorts the outer array lexicographically
 * - Arrays of primitives/strings: sorts the array
 * - Handles nested structures recursively
 */
export function normalizeArrayOfArrays(value: any): any {
	if (!Array.isArray(value)) {
		return value;
	}

	// Check if this is an array of arrays (all elements are arrays)
	// Empty array is treated as a regular array (not an array of arrays)
	const isArrayOfArrays =
		value.length > 0 && value.every((item) => Array.isArray(item));

	if (isArrayOfArrays) {
		// Sort each sub-array (normalize recursively in case of nested arrays)
		const sortedSubArrays = value.map((subArray) => {
			// Deep clone and normalize recursively
			const normalized = normalizeArrayOfArrays([...subArray]);
			// Sort the normalized sub-array
			const sorted = normalized.sort((a: any, b: any) => {
				// Handle different types for comparison
				if (typeof a === "number" && typeof b === "number") {
					return a - b;
				}
				if (typeof a === "string" && typeof b === "string") {
					return a.localeCompare(b);
				}
				// For mixed types, objects, or arrays, use JSON string comparison
				// This ensures consistent ordering
				return JSON.stringify(a).localeCompare(JSON.stringify(b));
			});
			return sorted;
		});

		// Sort the outer array lexicographically
		sortedSubArrays.sort((a, b) => {
			// Compare element by element
			const minLength = Math.min(a.length, b.length);
			for (let i = 0; i < minLength; i++) {
				const aVal = a[i];
				const bVal = b[i];

				// Compare values
				if (aVal < bVal) return -1;
				if (aVal > bVal) return 1;

				// If values are equal but might be objects/arrays, compare as JSON
				if (typeof aVal === "object" || typeof bVal === "object") {
					const aStr = JSON.stringify(aVal);
					const bStr = JSON.stringify(bVal);
					if (aStr !== bStr) {
						return aStr.localeCompare(bStr);
					}
				}
			}
			return a.length - b.length;
		});

		return sortedSubArrays;
	}

	// Regular array (array of primitives/strings/objects) - sort it
	// First normalize each element recursively in case it's a nested structure
	const normalized = value.map((item) => normalizeArrayOfArrays(item));
	
	// Sort the array (create a copy to avoid mutating)
	const sorted = [...normalized].sort((a: any, b: any) => {
		// Handle different types for comparison
		if (typeof a === "number" && typeof b === "number") {
			return a - b;
		}
		if (typeof a === "string" && typeof b === "string") {
			return a.localeCompare(b);
		}
		// For mixed types, objects, or arrays, use JSON string comparison
		return JSON.stringify(a).localeCompare(JSON.stringify(b));
	});
	
	return sorted;
}

/**
 * Deep equality comparison for test results
 * Numbers are rounded to 5 decimal places before comparison to avoid floating point issues
 * If outputOrderMatters is false, arrays of arrays are normalized for order-independent comparison
 */
function deepEqual(
	a: any,
	b: any,
	outputOrderMatters: boolean = true
): boolean {
	// Round both values to 5 decimal places before comparison
	const roundedA = roundTo5Decimals(a);
	const roundedB = roundTo5Decimals(b);

	if (roundedA === roundedB) return true;

	if (roundedA == null || roundedB == null) return roundedA === roundedB;

	if (Array.isArray(roundedA) && Array.isArray(roundedB)) {
		if (roundedA.length !== roundedB.length) return false;

		// If order doesn't matter, normalize both arrays before comparison
		if (!outputOrderMatters) {
			const normalizedA = normalizeArrayOfArrays(roundedA);
			const normalizedB = normalizeArrayOfArrays(roundedB);

			// Compare normalized versions using JSON stringify for deep comparison
			// This handles nested arrays of arrays correctly
			return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
		}

		// Default: order matters, compare element by element
		return roundedA.every((val, index) =>
			deepEqual(val, roundedB[index], outputOrderMatters)
		);
	}

	if (typeof roundedA === "object" && typeof roundedB === "object") {
		const keysA = Object.keys(roundedA);
		const keysB = Object.keys(roundedB);

		if (keysA.length !== keysB.length) return false;

		return keysA.every((key) =>
			deepEqual(roundedA[key], roundedB[key], outputOrderMatters)
		);
	}

	return false;
}
