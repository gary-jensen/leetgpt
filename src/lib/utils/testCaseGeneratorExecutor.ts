"use client";

import { TestCase } from "@/types/algorithm-types";
import { getTypeDefinitionsCode } from "@/lib/utils/typeConverters";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { createFunctionFromCode } from "@/lib/execution/algoTestExecutor";

/**
 * Execute the generated test case generator function on the client
 * This runs entirely in the browser to prevent server memory issues
 */
export async function executeGeneratorFunctionClient(
	generatorFunctionCode: string,
	options: {
		existingTests: TestCase[];
		constraints: string;
		parameters: { name: string; type: string }[];
		passingCode: string; // Code string, not function
		problem: AlgoProblemDetail; // Need full problem to create function
		problemContext: {
			title: string;
			statement: string;
			judge?: any;
		};
	}
): Promise<TestCase[]> {
	try {
		// Check if we need ListNode/TreeNode utilities
		const needsDataStructures = options.parameters.some(
			(p) => p.type === "ListNode" || p.type === "TreeNode"
		);

		const typeUtilities = needsDataStructures
			? getTypeDefinitionsCode()
			: "";

		// Create the passing code function from code string
		const passingCodeFunction = createFunctionFromCode(
			options.passingCode,
			options.problem
		);

		if (!passingCodeFunction) {
			throw new Error("Failed to create passing code function");
		}

		// Create a safe execution context with type utilities
		// Wrap the function code to ensure it returns the function
		const wrappedCode = `
			${typeUtilities}
			
			// Helper function: arrayToListNode
			function arrayToListNode(arr) {
				if (!arr || arr.length === 0) return null;
				let head = ListNode(arr[0]);
				let current = head;
				for (let i = 1; i < arr.length; i++) {
					current.next = ListNode(arr[i]);
					current = current.next;
				}
				return head;
			}
			
			// Helper function: listNodeToArray (convert ListNode back to array)
			function listNodeToArray(head) {
				if (!head) return [];
				const result = [];
				let current = head;
				while (current) {
					result.push(current.val);
					current = current.next;
				}
				return result;
			}
			
			${generatorFunctionCode}
			
			// If the code just defines the function, return it
			if (typeof generateTestCases === 'function') {
				return generateTestCases;
			}
			
			// If it's an IIFE or expression, evaluate it
			return (${generatorFunctionCode});
		`;

		const generatorFn = new Function(wrappedCode)();

		if (typeof generatorFn !== "function") {
			throw new Error(
				"Generated code did not return a function. Got: " +
					typeof generatorFn
			);
		}

		// Execute the function with the provided options
		console.log("\n[TestCaseGenerator] Executing generator function (client-side)...");
		console.log(
			`[TestCaseGenerator] Parameters: ${JSON.stringify(
				options.parameters.map((p) => `${p.name}: ${p.type}`)
			)}`
		);
		console.log(
			`[TestCaseGenerator] Return type: ${
				options.parameters.some((p) => p.type.includes("ListNode"))
					? "ListNode"
					: "other"
			}`
		);

		// Execute generator with timeout to catch constraint violations
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => {
				reject(
					new Error(
						"Generator function execution timed out after 30 seconds - likely constraint violations causing expensive computations"
					)
				);
			}, 30000);
		});

		const executionPromise = new Promise<TestCase[]>((resolve, reject) => {
			try {
				const result = generatorFn({
					existingTests: options.existingTests,
					constraints: options.constraints,
					parameters: options.parameters,
					passingCode: passingCodeFunction,
					problemContext: options.problemContext,
				});
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});

		const testCases = await Promise.race([
			executionPromise,
			timeoutPromise,
		]);

		console.log(
			`[TestCaseGenerator] Generated ${testCases.length} test cases`
		);

		// Validate the result
		if (!Array.isArray(testCases)) {
			throw new Error(
				"Generator function did not return an array. Got: " +
					typeof testCases
			);
		}

		// Safety check: Limit maximum number of test cases to prevent memory issues
		const MAX_TEST_CASES = 100;
		if (testCases.length > MAX_TEST_CASES) {
			console.warn(
				`[TestCaseGenerator] Generated ${testCases.length} test cases exceeds maximum of ${MAX_TEST_CASES}. Limiting to first ${MAX_TEST_CASES} cases.`
			);
			testCases.splice(MAX_TEST_CASES);
		}

		// Validate each test case structure and log first few
		const samplesToLog = Math.min(3, testCases.length);
		for (let i = 0; i < samplesToLog; i++) {
			const testCase = testCases[i];
			console.log(
				`[TestCaseGenerator] Sample ${i + 1}: Input: ${JSON.stringify(
					testCase.input
				)}, Output: ${JSON.stringify(testCase.output)}`
			);
		}

		// Validate and fix each test case structure
		const returnType = options.problem.returnType;
		for (let i = 0; i < testCases.length; i++) {
			const testCase = testCases[i];
			if (
				!testCase ||
				typeof testCase !== "object" ||
				!Array.isArray(testCase.input)
			) {
				console.error(
					`[TestCaseGenerator] Invalid test case at index ${i}:`,
					testCase
				);
				throw new Error(
					`Invalid test case structure at index ${i}. Expected: {input: any[], output: any}, got: ${JSON.stringify(
						testCase
					)}`
				);
			}

			// Fix missing output for void return types
			if (testCase.output === undefined && returnType === "void") {
				console.warn(
					`[TestCaseGenerator] Test case ${i} missing output for void return type. Generating output from modified first parameter.`
				);
				// For void return types, the output should be the modified first parameter
				// Re-execute to get the modified array
				try {
					const passingCodeFunction = createFunctionFromCode(
						options.passingCode,
						options.problem
					);
					if (passingCodeFunction) {
						// Deep clone the input
						const clonedInput = JSON.parse(JSON.stringify(testCase.input));
						// Convert if needed
						const converted = clonedInput.map((val: any, idx: number) => {
							const param = options.parameters[idx];
							if (param?.type === "ListNode" && Array.isArray(val)) {
								// Would need arrayToListNode here, but for now just use the array
								return val;
							}
							return val;
						});
						// Call the function (modifies array in-place)
						passingCodeFunction(...converted);
						// Output is the modified first parameter
						testCase.output = Array.isArray(converted[0]) ? converted[0] : clonedInput[0];
					} else {
						throw new Error("Failed to create passing code function");
					}
				} catch (error) {
					console.error(
						`[TestCaseGenerator] Failed to fix test case ${i}:`,
						error
					);
					throw new Error(
						`Test case ${i} missing output and could not be fixed. Generator function must return {input: any[], output: any} for all test cases.`
					);
				}
			}

			if (testCase.output === undefined) {
				console.error(
					`[TestCaseGenerator] Invalid test case at index ${i}: missing output`,
					testCase
				);
				throw new Error(
					`Invalid test case structure at index ${i}. Expected: {input: any[], output: any}, got: ${JSON.stringify(
						testCase
					)}`
				);
			}
		}

		console.log(
			`[TestCaseGenerator] All ${testCases.length} test cases validated successfully\n`
		);

		return testCases;
	} catch (error) {
		console.error("Error executing generator function:", error);
		throw new Error(
			`Failed to execute generator function: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
}

