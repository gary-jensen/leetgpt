/**
 * Judge system for test case validation
 * Supports multiple judge strategies stored in problem metadata
 * This allows AI-generated problems to have custom validation logic without code changes
 */

import { JudgeConfig } from "@/types/algorithm-types";
import { roundTo5Decimals } from "@/utils/numberUtils";

export interface JudgeResult {
	pass: boolean;
	actual: any;
	expected: any;
	debug?: any;
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

/**
 * Normalize arrays for order-independent comparison
 * - Arrays of arrays: sorts each sub-array, then sorts the outer array lexicographically
 * - Arrays of primitives/strings: sorts the array
 * - Handles nested structures recursively
 */
function normalizeArrayOfArrays(arr: any[]): any[] {
	if (!Array.isArray(arr)) return arr;

	const sorted = arr.map((item) => {
		if (Array.isArray(item)) {
			return normalizeArrayOfArrays(item);
		}
		return item;
	});

	// Sort the array
	sorted.sort((a, b) => {
		if (Array.isArray(a) && Array.isArray(b)) {
			// Compare arrays lexicographically
			const minLen = Math.min(a.length, b.length);
			for (let i = 0; i < minLen; i++) {
				const cmp = compareValues(a[i], b[i]);
				if (cmp !== 0) return cmp;
			}
			return a.length - b.length;
		}
		return compareValues(a, b);
	});

	return sorted;
}

function compareValues(a: any, b: any): number {
	if (typeof a === "number" && typeof b === "number") {
		return a - b;
	}
	if (typeof a === "string" && typeof b === "string") {
		return a.localeCompare(b);
	}
	return JSON.stringify(a).localeCompare(JSON.stringify(b));
}

/**
 * Execute judge based on configuration
 * @param judgeConfig - Judge configuration from problem metadata
 * @param runtimeArgs - Arguments passed to user function (after type conversion)
 * @param returnValue - Value returned by user function
 * @param testCase - Test case with input and expected output
 * @param outputOrderMatters - Whether output order matters for comparison
 */
export function executeJudge(
	judgeConfig: JudgeConfig | undefined,
	runtimeArgs: any[],
	returnValue: any,
	testCase: { input: any[]; output: any },
	outputOrderMatters: boolean = true
): JudgeResult {
	// console.log(
	// 	`[Judge] executeJudge called with kind: ${judgeConfig?.kind || "none"}`
	// );
	// console.log(`[Judge] Return value:`, returnValue);
	// console.log(`[Judge] Runtime args:`, runtimeArgs);
	// console.log(`[Judge] Expected output:`, testCase.output);

	// If no judge config, use default return-value judge
	if (!judgeConfig || judgeConfig.kind === "return-value") {
		// console.log(`[Judge] Using default return-value judge`);
		return judgeReturnValue(
			returnValue,
			testCase.output,
			outputOrderMatters
		);
	}

	// Route to appropriate judge based on kind
	switch (judgeConfig.kind) {
		case "mutating-array-with-k":
			// console.log(`[Judge] Routing to mutating-array-with-k judge`);
			const result = judgeMutatingArrayWithK(
				judgeConfig,
				runtimeArgs,
				returnValue,
				testCase.output,
				outputOrderMatters
			);
			// console.log(`[Judge] Result:`, result);
			return result;
		case "custom-script":
			// console.log(`[Judge] Routing to custom-script judge`);
			return judgeCustomScript(
				judgeConfig,
				runtimeArgs,
				returnValue,
				testCase.output
			);
		default:
			// Fallback to return-value
			// console.log(
			// 	`[Judge] Unknown kind "${
			// 		(judgeConfig as any).kind
			// 	}", falling back to return-value judge`
			// );
			return judgeReturnValue(
				returnValue,
				testCase.output,
				outputOrderMatters
			);
	}
}

/**
 * Default judge: Compare return value with expected output
 */
function judgeReturnValue(
	returnValue: any,
	expected: any,
	outputOrderMatters: boolean
): JudgeResult {
	const roundedActual = roundTo5Decimals(returnValue);
	const roundedExpected = roundTo5Decimals(expected);

	const pass = deepEqual(roundedActual, roundedExpected, outputOrderMatters);

	return {
		pass,
		actual: roundedActual,
		expected: roundedExpected,
	};
}

/**
 * Judge for problems that mutate an array in-place and return a count (k)
 * Examples: Remove Element, Remove Duplicates from Sorted Array, Move Zeros
 */
function judgeMutatingArrayWithK(
	config: Extract<JudgeConfig, { kind: "mutating-array-with-k" }>,
	runtimeArgs: any[],
	returnValue: any,
	expected: any,
	outputOrderMatters: boolean
): JudgeResult {
	// console.log(`[Judge] judgeMutatingArrayWithK - Config:`, config);
	// console.log(
	// 	`[Judge] judgeMutatingArrayWithK - Return value (k):`,
	// 	returnValue
	// );
	// console.log(`[Judge] judgeMutatingArrayWithK - Runtime args:`, runtimeArgs);
	// console.log(
	// 	`[Judge] judgeMutatingArrayWithK - Array param index:`,
	// 	config.arrayParamIndex
	// );

	const k: number = returnValue;
	const arrayParam = runtimeArgs[config.arrayParamIndex] as any[];

	// console.log(`[Judge] judgeMutatingArrayWithK - Array param:`, arrayParam);
	// console.log(`[Judge] judgeMutatingArrayWithK - Expected:`, expected);

	if (!Array.isArray(arrayParam)) {
		return {
			pass: false,
			actual: returnValue,
			expected,
			debug: { error: "Array parameter is not an array" },
		};
	}

	// Handle multiple formats for expected:
	// 1. Expected is an array (preferred) - check both k and the array contents
	// 2. Expected is a number (legacy/backward compatibility) - only check that k matches
	// 3. Expected is an object with expectedNums (custom structure) - extract expectedNums array
	let expectedArray: any[];
	let expectedK: number;

	if (Array.isArray(expected)) {
		// Preferred format: expected is directly the array of first k elements
		expectedArray = expected;
		expectedK = expected.length;
		// console.log(
		// 	`[Judge] judgeMutatingArrayWithK - Expected is an array, checking k and array contents`
		// );
	} else if (typeof expected === "number") {
		// Legacy format: expected is just k (backward compatibility)
		// Only check k, not array contents
		// console.log(
		// 	`[Judge] judgeMutatingArrayWithK - Expected is a number (k only, legacy format), checking k match only`
		// );
		const pass = k === expected;
		// console.log(
		// 	`[Judge] judgeMutatingArrayWithK - k match:`,
		// 	pass,
		// 	`(${k} === ${expected})`
		// );

		// For legacy format (number), return just the array for display
		return {
			pass,
			actual: arrayParam.slice(0, k), // Just the array for cleaner display
			expected: arrayParam.slice(0, k), // Show what the array looks like
			debug: {
				k,
				fullArrayAfter: arrayParam,
				note: "Only k was checked, expected was a number (legacy format). Consider updating test case to use array format.",
			},
		};
	} else if (
		typeof expected === "object" &&
		expected !== null &&
		"expectedNums" in expected
	) {
		// Custom structure format: { expectedNums: [2,2] }
		expectedArray = (expected as any).expectedNums;
		if (!Array.isArray(expectedArray)) {
			return {
				pass: false,
				actual: returnValue,
				expected,
				debug: {
					error: "expected.expectedNums must be an array",
				},
			};
		}
		expectedK = expectedArray.length;
		// console.log(
		// 	`[Judge] judgeMutatingArrayWithK - Expected is custom structure with expectedNums, checking k and array contents`
		// );
	} else {
		return {
			pass: false,
			actual: returnValue,
			expected,
			debug: {
				error: "Expected output must be an array, a number (k), or an object with expectedNums property",
			},
		};
	}

	// Extract first k elements from modified array
	let actualSlice = arrayParam.slice(0, k);

	// If ignoreOrder is true, sort both for comparison
	if (config.ignoreOrder) {
		actualSlice = [...actualSlice].sort();
		const expectedSorted = [...expectedArray].sort();
		const pass =
			k === expectedK &&
			deepEqual(
				roundTo5Decimals(actualSlice),
				roundTo5Decimals(expectedSorted),
				true // Always use order-dependent comparison after sorting
			);

		// console.log(
		// 	`[Judge] judgeMutatingArrayWithK - k matches:`,
		// 	k === expectedK,
		// 	`(${k} === ${expectedK})`
		// );
		// console.log(
		// 	`[Judge] judgeMutatingArrayWithK - Array matches (sorted):`,
		// 	pass && k === expectedK
		// );

		// For display, return just the array (LeetCode-style)
		return {
			pass,
			actual: roundTo5Decimals(actualSlice), // Just the array for cleaner display
			expected: roundTo5Decimals(expectedSorted), // Just the array for cleaner display
			debug: { k, fullArrayAfter: arrayParam },
		};
	}

	// Order matters - compare as-is
	const kMatches = k === expectedK;
	const roundedActualSlice = roundTo5Decimals(actualSlice);
	const roundedExpectedArray = roundTo5Decimals(expectedArray);
	const arrayMatches = deepEqual(
		roundedActualSlice,
		roundedExpectedArray,
		outputOrderMatters
	);
	const pass = kMatches && arrayMatches;

	// console.log(
	// 	`[Judge] judgeMutatingArrayWithK - k matches:`,
	// 	kMatches,
	// 	`(${k} === ${expectedK})`
	// );
	// console.log(
	// 	`[Judge] judgeMutatingArrayWithK - Array matches:`,
	// 	arrayMatches
	// );
	// console.log(
	// 	`[Judge] judgeMutatingArrayWithK - Actual slice:`,
	// 	roundedActualSlice
	// );
	// console.log(
	// 	`[Judge] judgeMutatingArrayWithK - Expected array:`,
	// 	roundedExpectedArray
	// );
	// console.log(`[Judge] judgeMutatingArrayWithK - Final pass:`, pass);

	// For display, return just the array (LeetCode-style)
	// The returnValue (k) is implicit in the array length
	return {
		pass,
		actual: roundedActualSlice, // Just the array for cleaner display
		expected: roundedExpectedArray, // Just the array for cleaner display
		debug: { k, fullArrayAfter: arrayParam, kMatches, arrayMatches },
	};
}

/**
 * Custom script judge - allows arbitrary validation logic
 * Script should implement: function judge(args, returnValue, expected) { return { pass, actual, expected }; }
 */
function judgeCustomScript(
	config: Extract<JudgeConfig, { kind: "custom-script" }>,
	runtimeArgs: any[],
	returnValue: any,
	expected: any
): JudgeResult {
	try {
		// Create a safe execution context
		// Note: In production, you'd want to use vm2 or similar for sandboxing
		const judgeFn = new Function(
			"args",
			"returnValue",
			"expected",
			"roundTo5Decimals",
			"deepEqual",
			`
			${config.script}
			return judge(args, returnValue, expected);
		`
		) as (
			args: any[],
			returnValue: any,
			expected: any,
			roundTo5Decimals: (value: any) => any,
			deepEqual: (a: any, b: any, orderMatters: boolean) => boolean
		) => JudgeResult;

		// Execute the custom judge
		const result = judgeFn(
			runtimeArgs,
			returnValue,
			expected,
			roundTo5Decimals,
			deepEqual
		);

		// Validate result structure
		if (
			typeof result !== "object" ||
			result === null ||
			typeof result.pass !== "boolean"
		) {
			return {
				pass: false,
				actual: returnValue,
				expected,
				debug: {
					error: "Custom judge must return { pass: boolean, actual: any, expected: any }",
				},
			};
		}

		return result;
	} catch (error) {
		return {
			pass: false,
			actual: returnValue,
			expected,
			debug: {
				error:
					error instanceof Error
						? error.message
						: "Unknown error in custom judge",
			},
		};
	}
}
