import {
	render,
	screen,
	fireEvent,
	waitFor,
	renderHook,
	act,
} from "@testing-library/react";
import { useAlgoProblemExecution } from "../hooks/useAlgoProblemExecution";
import { AlgoProblemDetail } from "@/types/algorithm-types";

// Mock the actual dependencies that the hook uses
jest.mock("@/hooks/workspace/useConsole", () => ({
	__esModule: true,
	default: jest.fn(() => ({
		iframeRef: { current: null },
		handleTest: jest.fn(),
		isExecuting: false,
	})),
}));

jest.mock("@/lib/execution/questionTest", () => ({
	questionTestDetailed: jest.fn(),
}));

const realProblem: AlgoProblemDetail = {
	id: "two-sum",
	slug: "two-sum",
	title: "Two Sum",
	statementMd: "Given an array of integers...",
	topics: ["arrays", "hashmap"],
	difficulty: "easy",
	languages: ["javascript"],
	rubric: { optimal_time: "O(n)", acceptable_time: ["O(n log n)"] },
	tests: [
		{ input: [[2, 7, 11, 15], 9], output: [0, 1] },
		{ input: [[3, 2, 4], 6], output: [1, 2] },
	],
	startingCode: {
		javascript: "function twoSum(nums, target) {\n  // Your code here\n}",
	},
};

describe("Real Algorithm Execution", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should initialize with real problem data", () => {
		const { result } = renderHook(() =>
			useAlgoProblemExecution(realProblem)
		);

		expect(result.current.code).toBe(realProblem.startingCode.javascript);
		expect(result.current.testResults).toEqual([]);
		expect(result.current.isExecuting).toBe(false);
	});

	it("should handle code execution with real test framework", async () => {
		const { questionTestDetailed } = jest.requireMock(
			"@/lib/execution/questionTest"
		);

		// Mock the test framework to return real results
		questionTestDetailed.mockReturnValue([
			{
				passed: true,
				actualLogs: ["[0, 1]"],
				error: null,
			},
			{
				passed: false,
				actualLogs: ["[0, 1]"],
				error: "Expected [1, 2] but got [0, 1]",
			},
		]);

		const { result } = renderHook(() =>
			useAlgoProblemExecution(realProblem)
		);

		// Set some code
		act(() => {
			result.current.setCode(`
        function twoSum(nums, target) {
          return [0, 1]; // This will fail the second test
        }
      `);
		});

		// Execute the code
		await act(async () => {
			await result.current.executeCode();
		});

		// Check that we have test results (the new executor doesn't use questionTestDetailed)
		// expect(questionTestDetailed).toHaveBeenCalled();

		// Check that we have test results
		expect(result.current.testResults.length).toBeGreaterThan(0);
	});

	it("should handle execution errors gracefully", async () => {
		// The new executor handles errors internally, so we don't need to mock it
		// const {
		// 	questionTestDetailed,
		// } = require("@/lib/execution/questionTest");

		// Mock the test framework to throw an error
		// questionTestDetailed.mockImplementation(() => {
		// 	throw new Error("Execution failed");
		// });

		const { result } = renderHook(() =>
			useAlgoProblemExecution(realProblem)
		);

		// Set some code
		act(() => {
			result.current.setCode(`
        function twoSum(nums, target) {
          throw new Error('Syntax error');
        }
      `);
		});

		// Execute the code
		await act(async () => {
			await result.current.executeCode();
		});

		// Should have error results
		expect(result.current.testResults.length).toBeGreaterThan(0);
		expect(result.current.testResults[0].error).toBeDefined();
	});

	it("should update button state based on real test results", async () => {
		const { questionTestDetailed } = jest.requireMock(
			"@/lib/execution/questionTest"
		);

		// Mock all tests passing
		questionTestDetailed.mockReturnValue([
			{ passed: true, actualLogs: ["[0, 1]"], error: null },
			{ passed: true, actualLogs: ["[1, 2]"], error: null },
		]);

		const { result } = renderHook(() =>
			useAlgoProblemExecution(realProblem)
		);

		// Set correct code
		act(() => {
			result.current.setCode(`
        function twoSum(nums, target) {
          const map = new Map();
          for (let i = 0; i < nums.length; i++) {
            const complement = target - nums[i];
            if (map.has(complement)) {
              return [map.get(complement), i];
            }
            map.set(nums[i], i);
          }
        }
      `);
		});

		// Execute the code
		await act(async () => {
			await result.current.executeCode();
		});

		// Button should show correct state
		expect(result.current.buttonVariant).toBe("correct");
		expect(result.current.allTestsPassed).toBe(true);
	});
});
