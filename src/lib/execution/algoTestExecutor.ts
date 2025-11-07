import { AlgoProblemDetail } from "@/types/algorithm-types";
import { roundTo5Decimals } from "@/utils/numberUtils";
import {
	convertInput,
	convertOutput,
	getTypeDefinitionsCode,
} from "@/lib/utils/typeConverters";
import { executeJudge } from "./judges";

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
 * @param cancellationCheck - Optional function that returns true if execution should be cancelled
 */
export async function executeAlgoTests(
	problem: AlgoProblemDetail,
	code: string,
	language: string = "javascript",
	cancellationCheck?: () => boolean
): Promise<AlgoExecutionResult> {
	const startTime = Date.now();

	try {
		// Check for cancellation before starting
		if (cancellationCheck && cancellationCheck()) {
			return {
				status: "error",
				results: [],
				message: "Execution was cancelled",
			};
		}

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
			// Check for cancellation before each test case
			if (cancellationCheck && cancellationCheck()) {
				return {
					status: "error",
					results,
					message: "Execution was cancelled",
				};
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

			// Yield to event loop every 10 tests to prevent blocking (only for long test suites)
			if (i > 0 && i % 10 === 0) {
				await new Promise((resolve) => setTimeout(resolve, 0));
				// Check again after yielding
				if (cancellationCheck && cancellationCheck()) {
					return {
						status: "error",
						results,
						message: "Execution was cancelled",
					};
				}
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
 * Injects ListNode/TreeNode definitions if problem uses them
 */
export function createFunctionFromCode(
	code: string,
	problem: AlgoProblemDetail
): ((...args: any[]) => any) | null {
	try {
		// Priority 1: Use explicit functionName from problem metadata (most reliable)
		// Priority 2: Extract from user's code
		// Priority 3: Fall back to starting code or default
		const functionName =
			problem.functionName ||
			extractFunctionNameFromCode(code) ||
			getMainFunctionName(problem);

		// Check if we need to inject ListNode/TreeNode
		// Priority 1: If problem has parameters with ListNode/TreeNode types
		// Priority 2: Check if problem needs data structures
		// Priority 3: If topics suggest Linked List/Tree
		const needsDataStructures =
			problem.parameters?.some(
				(p) =>
					p.type === "ListNode" ||
					p.type === "TreeNode" ||
					p.type === "_Node"
			) ||
			problem.returnType === "ListNode" ||
			problem.returnType === "TreeNode" ||
			problem.returnType === "_Node" ||
			problem.topics.some(
				(t) =>
					t.includes("Linked List") ||
					t.includes("Tree") ||
					t.includes("Binary")
			);

		// Get utility functions if needed (use new type definitions)
		const utilities = needsDataStructures ? getTypeDefinitionsCode() : "";

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
		// console.error("Error creating function from code:", error);
		return null;
	}
}

/**
 * Extract function name directly from user code
 * Excludes system-defined names like ListNode, TreeNode, etc.
 */
function extractFunctionNameFromCode(code: string): string | null {
	// System-defined names to exclude
	const excludedNames = new Set([
		"ListNode",
		"TreeNode",
		"arrayToListNode",
		"listNodeToArray",
		"arrayToTreeNode",
		"treeNodeToArray",
		"convertInput",
		"convertOutput",
	]);

	// Try function declaration: function name(...)
	const functionMatch = code.match(/function\s+(\w+)\s*\(/);
	if (functionMatch && !excludedNames.has(functionMatch[1])) {
		return functionMatch[1];
	}

	// Try arrow function: const name = (...) => or const name = function(...)
	const arrowMatch = code.match(
		/(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)/
	);
	if (arrowMatch && !excludedNames.has(arrowMatch[1])) {
		return arrowMatch[1];
	}

	return null;
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
 * Uses type converters if parameters/returnType are available, otherwise falls back to direct execution
 */
async function runSingleTest(
	userFunction: (...args: any[]) => any,
	testCase: { input: any[]; output: any },
	caseNumber: number,
	problem?: AlgoProblemDetail,
	userCode?: string
): Promise<AlgoTestResult> {
	const startTime = Date.now();

	// Round test case input to 5 decimal places
	const roundedInput = roundTo5Decimals(testCase.input);

	// Deep clone the input to prevent in-place modifications from affecting the original
	const clonedInput = deepClone(roundedInput);

	try {
		let actual: any;
		let convertedInputsUsed: any[] | null = null; // Store converted inputs for judge

		// Priority 1: Use new parameters + returnType system (preferred)
		// Also check if returnType is set - if so, we need to use type converters even if parameters aren't set
		if (
			(problem?.parameters && problem.parameters.length > 0) ||
			problem?.returnType
		) {
			// We need to capture the converted inputs that were actually used
			// because they get modified in-place by the function
			// IMPORTANT: Use clonedInput (already deep cloned) to prevent shared state between test cases
			const convertedInputs = clonedInput.map(
				(value: any, index: number) => {
					const param = problem.parameters?.[index];
					if (param) {
						return convertInput(value, param.type);
					}
					return value; // No type conversion needed
				}
			);
			convertedInputsUsed = convertedInputs;

			// Call user function with converted inputs
			actual = userFunction(...convertedInputs);

			// Convert output if needed
			if (problem.returnType) {
				const converted = convertOutput(actual, problem.returnType);
				if (converted !== undefined) {
					actual = converted;
				}
			}

			// Handle in-place modifications (void return type)
			if (
				(actual === undefined || actual === null) &&
				convertedInputs.length > 0 &&
				(Array.isArray(convertedInputs[0]) ||
					typeof convertedInputs[0] === "object")
			) {
				// For void return types, check the first parameter's type, not returnType
				const firstParam = problem.parameters?.[0];
				if (firstParam && problem.returnType === "void") {
					// Convert based on first parameter type (TreeNode/ListNode/_Node need conversion)
					actual = convertOutput(convertedInputs[0], firstParam.type);
				} else {
					// For non-void return types, use returnType
					actual = convertOutput(
						convertedInputs[0],
						problem.returnType
					);
				}
			}
		}
		// Priority 2: Direct execution (no type conversion needed)
		else {
			actual = executeDirectly(userFunction, clonedInput);
		}

		// Ensure output is converted if returnType is set (double-check for safety)
		if (
			problem?.returnType &&
			!Array.isArray(actual) &&
			typeof actual === "object" &&
			actual !== null
		) {
			// If returnType is ListNode/TreeNode but result is still an object, try converting again
			if (
				problem.returnType === "ListNode" ||
				problem.returnType === "TreeNode"
			) {
				const reconverted = convertOutput(actual, problem.returnType);
				if (Array.isArray(reconverted)) {
					actual = reconverted;
				}
			}
		}

		// Use judge system if configured, otherwise fall back to auto-detection
		const judgeConfig = problem?.judge;
		const outputOrderMatters = problem?.outputOrderMatters ?? true;

		let judgeResult: {
			pass: boolean;
			actual: any;
			expected: any;
			debug?: any;
		};

		// If judge config exists, use it
		if (judgeConfig) {
			// Get the runtime arguments that were actually used (and modified) by the function
			let runtimeArgs: any[];
			if (convertedInputsUsed !== null) {
				// Use the converted inputs that were actually passed to the function
				// These have been modified in-place by the function
				runtimeArgs = convertedInputsUsed;
			} else {
				// No type conversion - use clonedInput directly (already modified in-place)
				runtimeArgs = clonedInput;
			}

			judgeResult = executeJudge(
				judgeConfig,
				runtimeArgs,
				actual,
				testCase,
				outputOrderMatters
			);
		} else {
			// Fallback: Auto-detect pattern (backward compatibility)
			const roundedExpected = roundTo5Decimals(testCase.output);
			const isCountAndArrayPattern =
				typeof actual === "number" &&
				Array.isArray(roundedExpected) &&
				clonedInput.length > 0 &&
				Array.isArray(clonedInput[0]);

			if (isCountAndArrayPattern) {
				// Auto-detect: mutating-array-with-k pattern
				const k = actual;
				const expectedLength = roundedExpected.length;
				const modifiedArray = clonedInput[0];
				const firstKElements = modifiedArray.slice(0, k);

				const returnValueMatches = k === expectedLength;
				const arrayMatches = deepEqual(
					roundTo5Decimals(firstKElements),
					roundedExpected,
					outputOrderMatters
				);

				judgeResult = {
					pass: returnValueMatches && arrayMatches,
					actual: {
						returnValue: k,
						array: roundTo5Decimals(firstKElements),
					},
					expected: {
						returnValue: expectedLength,
						array: roundedExpected,
					},
				};
			} else {
				// Normal comparison: just check return value
				actual = roundTo5Decimals(actual);
				judgeResult = {
					pass: deepEqual(
						actual,
						roundedExpected,
						outputOrderMatters
					),
					actual,
					expected: roundedExpected,
				};
			}
		}

		const runtime = Date.now() - startTime;

		return {
			case: caseNumber,
			passed: judgeResult.pass,
			input: roundedInput,
			expected: judgeResult.expected,
			actual: judgeResult.actual,
			runtime,
		};
	} catch (error) {
		const runtime = Date.now() - startTime;

		// Round expected even in error case
		const roundedExpected = roundTo5Decimals(testCase.output);

		// Format expected based on judge config or auto-detection
		let finalExpected = roundedExpected;
		if (problem?.judge?.kind === "mutating-array-with-k") {
			if (Array.isArray(roundedExpected)) {
				finalExpected = {
					returnValue: roundedExpected.length,
					array: roundedExpected,
				};
			}
		} else if (!problem?.judge) {
			// Auto-detect for backward compatibility
			const isCountAndArrayPattern =
				Array.isArray(roundedExpected) &&
				clonedInput.length > 0 &&
				Array.isArray(clonedInput[0]);

			if (isCountAndArrayPattern) {
				finalExpected = {
					returnValue: roundedExpected.length,
					array: roundedExpected,
				};
			}
		}

		return {
			case: caseNumber,
			passed: false,
			input: roundedInput,
			expected: finalExpected,
			error: error instanceof Error ? error.message : String(error),
			runtime,
		};
	}
}

/**
 * Execute test case using new centralized type conversion system
 * Uses parameters and returnType to convert inputs/outputs automatically
 */
function executeWithTypeConverters(
	userFunction: (...args: any[]) => any,
	testCase: { input: any[]; output: any },
	problem: AlgoProblemDetail,
	userCode?: string
): any {
	try {
		// Convert inputs based on parameter types
		const convertedInputs = testCase.input.map((value, index) => {
			const param = problem.parameters?.[index];
			if (param) {
				return convertInput(value, param.type);
			}
			return value; // No type info, use as-is
		});

		// Call user function with converted inputs
		const result = userFunction(...convertedInputs);

		// Check if val is itself a ListNode (indicates incorrect wrapping)
		if (
			result &&
			typeof result === "object" &&
			"val" in result &&
			result.val !== null &&
			result.val !== undefined &&
			typeof result.val === "object" &&
			"val" in result.val &&
			(problem.returnType === "ListNode" ||
				problem.returnType === "TreeNode")
		) {
			const functionName =
				problem.functionName || getMainFunctionName(problem);
			// console.error(
			// 	`[TypeConverter] CRITICAL: Function "${functionName}" returned ListNode where val is a ListNode!`,
			// 	`This indicates incorrect wrapping. The function likely does: return new ListNode(head) instead of: return head`
			// );
		}

		// Convert output based on return type
		if (problem.returnType) {
			const converted = convertOutput(result, problem.returnType);

			// Safety check: if returnType is ListNode/TreeNode, ensure we return an array
			if (
				(problem.returnType === "ListNode" ||
					problem.returnType === "TreeNode") &&
				!Array.isArray(converted)
			) {
				// console.error(
				// 	`[TypeConverter] CRITICAL: Expected array for ${problem.returnType} but got:`,
				// 	typeof converted
				// );
			}
			return converted;
		}

		// Handle in-place modifications (function returns undefined/null but modifies first arg)
		if (
			(result === undefined || result === null) &&
			convertedInputs.length > 0 &&
			(Array.isArray(convertedInputs[0]) ||
				typeof convertedInputs[0] === "object")
		) {
			// For void return types, check the first parameter's type, not returnType
			const firstParam = problem.parameters?.[0];
			if (firstParam && problem.returnType === "void") {
				// Convert based on first parameter type (TreeNode/ListNode/_Node need conversion)
				return convertOutput(convertedInputs[0], firstParam.type);
			} else {
				// For non-void return types, use returnType
				return convertOutput(convertedInputs[0], problem.returnType);
			}
		}

		return result;
	} catch (error) {
		// console.error("Error executing with type converters:", error);
		throw error;
	}
}

/**
 * Execute test case directly (for problems without type conversion)
 */
function executeDirectly(
	userFunction: (...args: any[]) => any,
	clonedInput: any[]
): any {
	// Call the user's function with the cloned input
	const returnValue = userFunction(...clonedInput);

	// Determine what to return:
	// - If function returns undefined/null AND the first argument is an array/object,
	//   it likely modifies in-place. Return the modified first argument (not all parameters).
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
		// Likely in-place modification: return the modified first argument only
		// This handles both single-parameter and multi-parameter functions
		// (e.g., merge(nums1, m, nums2, n) modifies nums1, so return nums1)
		return clonedInput[0];
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
