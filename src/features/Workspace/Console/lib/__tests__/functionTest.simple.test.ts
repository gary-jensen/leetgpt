/**
 * Simple unit test for FunctionTest execution logic
 * Run with: npm test -- functionTest.simple.test.ts
 */

import { questionTestDetailed } from "../questionTest";
import { testFunctionTest } from "./functionTest.test";

describe("FunctionTest Simple Unit Tests", () => {
	test("should validate function test structure", () => {
		// Test that our test data is properly structured
		expect(testFunctionTest.type).toBe("function");
		expect(testFunctionTest.functionName).toBe("add");
		expect(testFunctionTest.testCases).toHaveLength(3);
		expect(testFunctionTest.testCases[0].input).toEqual([2, 3]);
		expect(testFunctionTest.testCases[0].output).toBe(5);
	});

	test("should handle function test validation with mock data", () => {
		// Mock the old system result format
		const mockOldSystemResult: [
			any[],
			{ name: string; value: any }[],
			any[],
			any?
		] = [
			[
				// Mock function test results - simulating successful execution
				[
					{ result: 5, logs: [] }, // First test case: add(2, 3) = 5
					{ result: 5, logs: [] }, // Second test case: add(10, -5) = 5
					{ result: 0, logs: [] }, // Third test case: add(0, 0) = 0
				],
			],
			[], // tracked
			[], // calls
			{}, // newTracked
		];

		// Run the test validation
		const testResults = questionTestDetailed(
			[testFunctionTest],
			"function add(a, b) { return a + b; }",
			mockOldSystemResult,
			[]
		);

		// Verify all tests passed
		expect(testResults).toHaveLength(1);
		expect(testResults[0].passed).toBe(true);
		expect(testResults[0].test.type).toBe("function");
	});

	test("should handle function not found case", () => {
		// Mock the old system result format with function not found
		const mockOldSystemResult: [
			any[],
			{ name: string; value: any }[],
			any[],
			any?
		] = [
			[
				// Mock function test results - simulating function not found
				[
					{
						result: {
							__functionNotFound: true,
							functionName: "add",
						},
						logs: [],
					},
					{
						result: {
							__functionNotFound: true,
							functionName: "add",
						},
						logs: [],
					},
					{
						result: {
							__functionNotFound: true,
							functionName: "add",
						},
						logs: [],
					},
				],
			],
			[], // tracked
			[], // calls
			{}, // newTracked
		];

		// Run the test validation
		const testResults = questionTestDetailed(
			[testFunctionTest],
			"const x = 5;", // Code without the function
			mockOldSystemResult,
			[]
		);

		// Verify test failed due to function not found
		expect(testResults).toHaveLength(1);
		expect(testResults[0].passed).toBe(false);
		expect(testResults[0].test.type).toBe("function");
	});

	test("should handle console output validation", () => {
		const functionTestWithConsole = {
			type: "function" as const,
			functionName: "debugFunction",
			testCases: [
				{
					input: [5],
					output: 25,
					consoleTest: {
						expectedOutput: [
							"Input: 5",
							"Calculating...",
							"Result: 25",
						],
					},
				},
			],
		};

		// Mock the old system result format with console output
		const mockOldSystemResult: [
			any[],
			{ name: string; value: any }[],
			any[],
			any?
		] = [
			[
				// Mock function test results with console output
				[
					{
						result: 25,
						logs: ["Input: 5", "Calculating...", "Result: 25"],
					},
				],
			],
			[], // tracked
			[], // calls
			{}, // newTracked
		];

		// Run the test validation
		const testResults = questionTestDetailed(
			[functionTestWithConsole],
			"function debugFunction(x) { console.log('Input:', x); console.log('Calculating...'); const result = x * x; console.log('Result:', result); return result; }",
			mockOldSystemResult,
			[]
		);

		// Verify test passed with console output validation
		expect(testResults).toHaveLength(1);
		expect(testResults[0].passed).toBe(true);
		expect(testResults[0].test.type).toBe("function");
	});
});
