import { AlgoProblemDetail } from "@/types/algorithm-types";
import { roundTo5Decimals } from "@/utils/numberUtils";
import { getSystemCodeUtilities } from "@/lib/utils/systemCodeUtils";

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
			// Yield to event loop every 2 tests to prevent blocking
			// Use actual setTimeout delay to ensure event loop can process other requests
			if (i > 0 && i % 2 === 0) {
				await new Promise((resolve) => setTimeout(resolve, 10));
			}

			const testCase = problem.tests[i];
			const result = await runSingleTest(
				userFunction,
				testCase,
				i + 1,
				problem,
				code
			);
			results.push(result);

			// Yield after each test to prevent blocking
			if (i < problem.tests.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 5));
			}
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
 * Injects ListNode/TreeNode if problem uses them (for systemCode or Linked List/Tree topics)
 */
function createFunctionFromCode(
	code: string,
	problem: AlgoProblemDetail
): ((...args: any[]) => any) | null {
	try {
		// Try to extract the main function from the code
		const functionName = getMainFunctionName(problem);

		// Check if we need to inject ListNode/TreeNode (for systemCode or Linked List/Tree problems)
		const needsDataStructures =
			problem.systemCode?.javascript ||
			problem.topics.some(
				(t) =>
					t.includes("Linked List") ||
					t.includes("Tree") ||
					t.includes("Binary")
			);

		// Get utility functions if needed
		const utilities = needsDataStructures ? getSystemCodeUtilities() : "";

		// Create a wrapper that includes utilities, user's code, and returns the function
		const wrappedCode =
			utilities +
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
 * Uses systemCode if available, otherwise falls back to direct execution
 */
async function runSingleTest(
	userFunction: (...args: any[]) => any,
	testCase: { input: any[]; output: any },
	caseNumber: number,
	problem?: AlgoProblemDetail,
	userCode?: string
): Promise<AlgoTestResult> {
	const startTime = Date.now();

	try {
		// Round test case input to 5 decimal places
		const roundedInput = roundTo5Decimals(testCase.input);

		// Deep clone the input to prevent in-place modifications from affecting the original
		const clonedInput = deepClone(roundedInput);

		// Yield before function execution (in case it's CPU-intensive)
		await new Promise((resolve) => setTimeout(resolve, 1));

		let actual: any;

		// Check if problem has systemCode
		if (problem?.systemCode?.javascript) {
			// Use systemCode execution wrapper
			actual = await executeWithSystemCode(
				testCase,
				problem.systemCode.javascript,
				problem,
				userCode || ""
			);
		} else {
			// Fallback to direct execution (backward compatibility)
			actual = await executeDirectly(userFunction, clonedInput);
		}

		// Yield after function execution
		await new Promise((resolve) => setTimeout(resolve, 1));

		// Round expected output to 5 decimal places
		const roundedExpected = roundTo5Decimals(testCase.output);

		// Round actual output
		actual = roundTo5Decimals(actual);

		// Compare actual vs expected (both already rounded)
		// Use outputOrderMatters from problem if available, default to true
		const outputOrderMatters = problem?.outputOrderMatters ?? true;
		const passed = deepEqual(actual, roundedExpected, outputOrderMatters);
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
 * Execute test case using systemCode wrapper
 * Injects user code into systemCode execution context so everything shares the same scope
 */
function executeWithSystemCode(
	testCase: { input: any[]; output: any },
	systemCode: string,
	problem: AlgoProblemDetail,
	userCode: string
): any {
	try {
		// Extract function name from user code (not starting code, which might have ListNode)
		// Try to find function declaration in user code - exclude ListNode, TreeNode, arrayToListNode, etc.
		const excludedNames = [
			"ListNode",
			"TreeNode",
			"arrayToListNode",
			"listNodeToArray",
			"arrayToTreeNode",
			"treeNodeToArray",
			"systemExecute",
		];

		// Find all function declarations in user code
		const functionMatches = [
			...userCode.matchAll(/function\s+(\w+)\s*\(/g),
		];
		const arrowMatches = [
			...userCode.matchAll(
				/(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\([^)]*\)\s*=>)/g
			),
		];

		// Find the first function that's not in the excluded list
		let functionName: string | undefined;

		// Check function declarations first
		for (const match of functionMatches) {
			if (match[1] && !excludedNames.includes(match[1])) {
				functionName = match[1];
				break;
			}
		}

		// If not found, check arrow functions
		if (!functionName) {
			for (const match of arrowMatches) {
				if (match[1] && !excludedNames.includes(match[1])) {
					functionName = match[1];
					break;
				}
			}
		}

		// Fallback to problem's starting code if not found in user code
		if (!functionName) {
			functionName = getMainFunctionName(problem);
		}

		// SystemCode should be completely self-contained
		// It defines its own data structures (ListNode, TreeNode, etc.) and conversion functions
		// We inject user code into the same execution context so the function can access systemCode's ListNode
		const wrappedCode = `
			${systemCode}
			
			// Inject user's code into the same execution context
			${userCode}
			
			// Extract the function from the user's code (now in same scope as systemCode's ListNode)
			const userFunction = typeof ${functionName} === 'function' ? ${functionName} : null;
			
			if (!userFunction) {
				throw new Error('Could not find function ${functionName} in user code.');
			}
			
			// Modify systemExecute to use userFunction from outer scope
			// If systemCode's systemExecute expects userFunction as parameter, we wrap it
			const originalSystemExecute = systemExecute;
			const wrappedSystemExecute = function(testCase) {
				try {
					// Check if original systemExecute expects userFunction parameter
					if (originalSystemExecute.length === 2) {
						// Old signature: systemExecute(userFunction, testCase)
						const result = originalSystemExecute(userFunction, testCase);
						return result;
					} else {
						// New signature: systemExecute(testCase) - userFunction in scope
						return originalSystemExecute(testCase);
					}
				} catch (error) {
					throw error;
				}
			};
			
			// Call the wrapped systemExecute
			return wrappedSystemExecute(testCase);
		`;

		// Create the execution function (no parameters needed - everything is in the code)
		const executeFunc = new Function("testCase", wrappedCode);

		// Execute with systemCode and user code in same context
		const result = executeFunc(testCase);
		return result;
	} catch (error) {
		throw error;
	}
}

/**
 * Execute test case directly (fallback for problems without systemCode)
 */
function executeDirectly(
	userFunction: (...args: any[]) => any,
	clonedInput: any[]
): any {
	// Call the user's function with the cloned input
	const returnValue = userFunction(...clonedInput);

	// Determine what to return:
	// - If function returns undefined/null AND the first argument is an array/object,
	//   it likely modifies in-place. Return the modified first argument.
	// - Otherwise, return the return value
	const firstArg = clonedInput.length > 0 ? clonedInput[0] : null;
	const isFirstArgArrayOrObject =
		firstArg !== null &&
		firstArg !== undefined &&
		(Array.isArray(firstArg) || typeof firstArg === "object");

	if (
		(returnValue === undefined || returnValue === null) &&
		isFirstArgArrayOrObject
	) {
		// Likely in-place modification: return the modified first argument
		return clonedInput.length === 1 ? clonedInput[0] : clonedInput;
	} else {
		// Normal return value
		return returnValue;
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
