import { renderHook, act } from "@testing-library/react";
import { useAlgoProblemExecution } from "../useAlgoProblemExecution";
import { AlgoProblemDetail } from "@/types/algorithm-types";

// Mock the dependencies
jest.mock("@/hooks/workspace/useConsole");
jest.mock("@/lib/execution/questionTest");

const mockProblem: AlgoProblemDetail = {
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

describe("useAlgoProblemExecution", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should initialize with starting code when problem is provided", () => {
		const { result } = renderHook(() =>
			useAlgoProblemExecution(mockProblem)
		);

		expect(result.current.code).toBe(mockProblem.startingCode.javascript);
		expect(result.current.testResults).toEqual([]);
		expect(result.current.isExecuting).toBe(false);
		expect(result.current.buttonVariant).toBe("run");
		expect(result.current.buttonDisabled).toBe(false); // Starting code has content, so not disabled
	});

	it("should handle null problem gracefully", () => {
		const { result } = renderHook(() => useAlgoProblemExecution(null));

		expect(result.current.code).toBe("");
		expect(result.current.testResults).toEqual([]);
		expect(result.current.isExecuting).toBe(false);
	});

	it("should update code when setCode is called", () => {
		const { result } = renderHook(() =>
			useAlgoProblemExecution(mockProblem)
		);

		act(() => {
			result.current.setCode(
				"function twoSum(nums, target) { return [0, 1]; }"
			);
		});

		expect(result.current.code).toBe(
			"function twoSum(nums, target) { return [0, 1]; }"
		);
		expect(result.current.buttonDisabled).toBe(false);
	});

	it("should reset code to starting code when resetCode is called", () => {
		const { result } = renderHook(() =>
			useAlgoProblemExecution(mockProblem)
		);

		// First change the code
		act(() => {
			result.current.setCode("modified code");
		});

		expect(result.current.code).toBe("modified code");

		// Then reset it
		act(() => {
			result.current.resetCode();
		});

		expect(result.current.code).toBe(mockProblem.startingCode.javascript);
		expect(result.current.testResults).toEqual([]);
	});

	it("should not execute code when problem is null", async () => {
		const { result } = renderHook(() => useAlgoProblemExecution(null));

		await act(async () => {
			await result.current.executeCode();
		});

		expect(result.current.testResults).toEqual([]);
		expect(result.current.isExecuting).toBe(false);
	});

	it("should not execute code when code is empty", async () => {
		const { result } = renderHook(() =>
			useAlgoProblemExecution(mockProblem)
		);

		// Set empty code
		act(() => {
			result.current.setCode("");
		});

		await act(async () => {
			await result.current.executeCode();
		});

		expect(result.current.testResults).toEqual([]);
		expect(result.current.isExecuting).toBe(false);
	});

	it("should update button variant based on test results", () => {
		const { result } = renderHook(() =>
			useAlgoProblemExecution(mockProblem)
		);

		// Initially should be "run"
		expect(result.current.buttonVariant).toBe("run");

		// Simulate test results
		act(() => {
			result.current.setCode(
				"function twoSum(nums, target) { return [0, 1]; }"
			);
		});

		// After setting code, should still be "run" until tests are executed
		expect(result.current.buttonVariant).toBe("run");
	});

	it("should provide all required properties", () => {
		const { result } = renderHook(() =>
			useAlgoProblemExecution(mockProblem)
		);

		expect(result.current).toHaveProperty("code");
		expect(result.current).toHaveProperty("setCode");
		expect(result.current).toHaveProperty("testResults");
		expect(result.current).toHaveProperty("isExecuting");
		expect(result.current).toHaveProperty("iframeRef");
		expect(result.current).toHaveProperty("executeCode");
		expect(result.current).toHaveProperty("resetCode");
		expect(result.current).toHaveProperty("buttonVariant");
		expect(result.current).toHaveProperty("buttonDisabled");
		expect(result.current).toHaveProperty("allTestsPassed");
	});
});
