/**
 * Core function test logic without external dependencies
 * Run with: npm test -- functionTest.core.test.ts
 */

import { questionTestDetailed } from "../questionTest";
import { testFunctionTest } from "./functionTest.test";

// Mock the function execution logic that would be in useConsole.tsx
const executeFunctionTest = (
	functionName: string,
	testCases: any[],
	mockFunction: Function
) => {
	return testCases.map((testCase) => {
		const testLogs: string[] = [];
		const originalLog = console.log;

		// Override console.log to capture output
		console.log = function (...args: any[]) {
			const msg = args
				.map((arg) => (arg === undefined ? "undefined" : arg))
				.join(" ");
			testLogs.push(msg);
		};

		let testResult: any;
		try {
			// Execute the function with test inputs
			testResult = mockFunction.apply(null, testCase.input);
		} finally {
			// Restore original console.log
			console.log = originalLog;
		}

		return { result: testResult, logs: testLogs };
	});
};

describe("FunctionTest Core Logic", () => {
	test("should execute function with test cases and validate results", () => {
		// Mock the add function
		const mockAddFunction = (a: number, b: number) => a + b;

		// Execute function tests
		const testResults = executeFunctionTest(
			"add",
			testFunctionTest.testCases,
			mockAddFunction
		);

		// Verify results match expected outputs
		expect(testResults).toHaveLength(3);
		expect(testResults[0].result).toBe(5); // 2 + 3
		expect(testResults[1].result).toBe(5); // 10 + (-5)
		expect(testResults[2].result).toBe(0); // 0 + 0

		// Create old system result format
		const oldSystemResult: [
			any[],
			{ name: string; value: any }[],
			any[],
			any?
		] = [
			[testResults],
			[], // tracked
			[], // calls
			{}, // newTracked
		];

		// Run the test validation
		const validationResults = questionTestDetailed(
			[testFunctionTest],
			"function add(a, b) { return a + b; }",
			oldSystemResult,
			[]
		);

		// Verify all tests passed
		expect(validationResults).toHaveLength(1);
		expect(validationResults[0].passed).toBe(true);
		expect(validationResults[0].test.type).toBe("function");
	});

	test("should handle console output during function execution", () => {
		// Mock function with console output
		const mockDebugFunction = (x: number) => {
			console.log("Input:", x);
			console.log("Calculating...");
			const result = x * x;
			console.log("Result:", result);
			return result;
		};

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

		// Execute function tests
		const testResults = executeFunctionTest(
			"debugFunction",
			functionTestWithConsole.testCases,
			mockDebugFunction
		);

		// Verify console output was captured
		expect(testResults[0].logs).toEqual([
			"Input: 5",
			"Calculating...",
			"Result: 25",
		]);
		expect(testResults[0].result).toBe(25);

		// Create old system result format
		const oldSystemResult: [
			any[],
			{ name: string; value: any }[],
			any[],
			any?
		] = [
			[testResults],
			[], // tracked
			[], // calls
			{}, // newTracked
		];

		// Run the test validation
		const validationResults = questionTestDetailed(
			[functionTestWithConsole],
			"function debugFunction(x) { console.log('Input:', x); console.log('Calculating...'); const result = x * x; console.log('Result:', result); return result; }",
			oldSystemResult,
			[]
		);

		// Verify test passed with console output validation
		expect(validationResults).toHaveLength(1);
		expect(validationResults[0].passed).toBe(true);
	});

	test("should handle function not found scenario", () => {
		// Simulate function not found
		const testResults = [
			{
				result: { __functionNotFound: true, functionName: "add" },
				logs: [],
			},
		];

		// Create old system result format
		const oldSystemResult: [
			any[],
			{ name: string; value: any }[],
			any[],
			any?
		] = [
			[testResults],
			[], // tracked
			[], // calls
			{}, // newTracked
		];

		// Run the test validation
		const validationResults = questionTestDetailed(
			[testFunctionTest],
			"const x = 5;", // Code without the function
			oldSystemResult,
			[]
		);

		// Verify test failed due to function not found
		expect(validationResults).toHaveLength(1);
		expect(validationResults[0].passed).toBe(false);
	});

	test("should support multiple parameters", () => {
		// Mock function with multiple parameters
		const mockCalculateArea = (length: number, width: number) =>
			length * width;

		const multiParamTest = {
			type: "function" as const,
			functionName: "calculateArea",
			testCases: [
				{ input: [5, 10], output: 50 },
				{ input: [3.5, 7.2], output: 25.2 },
				{ input: [0, 100], output: 0 },
			],
		};

		// Execute function tests
		const testResults = executeFunctionTest(
			"calculateArea",
			multiParamTest.testCases,
			mockCalculateArea
		);

		// Verify results
		expect(testResults).toHaveLength(3);
		expect(testResults[0].result).toBe(50);
		expect(testResults[1].result).toBeCloseTo(25.2);
		expect(testResults[2].result).toBe(0);

		// Create old system result format
		const oldSystemResult: [
			any[],
			{ name: string; value: any }[],
			any[],
			any?
		] = [
			[testResults],
			[], // tracked
			[], // calls
			{}, // newTracked
		];

		// Run the test validation
		const validationResults = questionTestDetailed(
			[multiParamTest],
			"function calculateArea(length, width) { return length * width; }",
			oldSystemResult,
			[]
		);

		// Verify all tests passed
		expect(validationResults).toHaveLength(1);
		expect(validationResults[0].passed).toBe(true);
	});
});
