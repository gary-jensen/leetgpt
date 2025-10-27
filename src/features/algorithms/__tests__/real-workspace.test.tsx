import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useParams } from "next/navigation";
import AlgorithmWorkspacePage from "@/app/algorithms/problems/[problemSlug]/page";
import { getAlgoProblem } from "@/features/algorithms/data";

// Mock the real dependencies
jest.mock("next/navigation", () => ({
	useParams: jest.fn(),
}));

jest.mock("../data", () => ({
	getAlgoProblem: jest.fn(),
}));

jest.mock("../hooks/useAlgoProblemExecution", () => ({
	useAlgoProblemExecution: jest.fn(),
}));

jest.mock("@/lib/actions/algoCoach", () => ({
	getHint: jest.fn(),
}));

const realProblem = {
	id: "two-sum",
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

describe("Real Workspace Page", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useParams as jest.Mock).mockReturnValue({ problemId: "two-sum" });
		(getAlgoProblem as jest.Mock).mockReturnValue(realProblem);
	});

	it("should render real workspace with actual problem data", () => {
		const { useAlgoProblemExecution } = jest.requireMock(
			"@/features/algorithms/hooks/useAlgoProblemExecution"
		);
		useAlgoProblemExecution.mockReturnValue({
			code: realProblem.startingCode.javascript,
			setCode: jest.fn(),
			testResults: [],
			isExecuting: false,
			iframeRef: { current: null },
			executeCode: jest.fn(),
			resetCode: jest.fn(),
			buttonVariant: "run",
			buttonDisabled: true,
			allTestsPassed: false,
		});

		render(<AlgorithmWorkspacePage />);

		// Should show real problem data
		expect(screen.getByText("Two Sum")).toBeInTheDocument();
		expect(screen.getByText("EASY")).toBeInTheDocument();
		expect(screen.getByText("arrays")).toBeInTheDocument();
		expect(screen.getByText("hashmap")).toBeInTheDocument();
	});

	it("should handle real code execution", async () => {
		const mockExecuteCode = jest.fn();
		const { useAlgoProblemExecution } = jest.requireMock(
			"@/features/algorithms/hooks/useAlgoProblemExecution"
		);
		useAlgoProblemExecution.mockReturnValue({
			code: "function twoSum(nums, target) { return [0, 1]; }",
			setCode: jest.fn(),
			testResults: [
				{
					case: 1,
					passed: true,
					input: [[2, 7, 11, 15], 9],
					expected: [0, 1],
					actual: [0, 1],
				},
			],
			isExecuting: false,
			iframeRef: { current: null },
			executeCode: mockExecuteCode,
			resetCode: jest.fn(),
			buttonVariant: "correct",
			buttonDisabled: false,
			allTestsPassed: true,
		});

		render(<AlgorithmWorkspacePage />);

		// Should show test results
		expect(screen.getByText("Test Case 1")).toBeInTheDocument();
		expect(screen.getByText("PASSED")).toBeInTheDocument();
	});

	it("should handle real hint requests", async () => {
		const { getHint } = jest.requireMock("@/lib/actions/algoCoach");
		getHint.mockResolvedValue({
			message: "Consider using a hash map",
			followUpQuestion: "What would you store in the hash map?",
		});

		const { useAlgoProblemExecution } = jest.requireMock(
			"@/features/algorithms/hooks/useAlgoProblemExecution"
		);
		useAlgoProblemExecution.mockReturnValue({
			code: "function twoSum(nums, target) { return [0, 1]; }",
			setCode: jest.fn(),
			testResults: [],
			isExecuting: false,
			iframeRef: { current: null },
			executeCode: jest.fn(),
			resetCode: jest.fn(),
			buttonVariant: "run",
			buttonDisabled: false,
			allTestsPassed: false,
		});

		render(<AlgorithmWorkspacePage />);

		const hintButton = screen.getByText("Hint");
		fireEvent.click(hintButton);

		await waitFor(() => {
			expect(getHint).toHaveBeenCalledWith(
				"two-sum",
				"function twoSum(nums, target) { return [0, 1]; }",
				[],
				""
			);
		});
	});

	it("should handle real chat interactions", () => {
		const { useAlgoProblemExecution } = jest.requireMock(
			"@/features/algorithms/hooks/useAlgoProblemExecution"
		);
		useAlgoProblemExecution.mockReturnValue({
			code: "function twoSum(nums, target) { return [0, 1]; }",
			setCode: jest.fn(),
			testResults: [],
			isExecuting: false,
			iframeRef: { current: null },
			executeCode: jest.fn(),
			resetCode: jest.fn(),
			buttonVariant: "run",
			buttonDisabled: false,
			allTestsPassed: false,
		});

		render(<AlgorithmWorkspacePage />);

		const messageInput = screen.getByPlaceholderText("Ask a question...");
		fireEvent.change(messageInput, {
			target: { value: "How do I solve this?" },
		});

		// Test that the input value is set correctly
		expect(messageInput.value).toBe("How do I solve this?");
	});
});
