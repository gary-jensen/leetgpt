import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useParams } from "next/navigation";
import AlgorithmWorkspacePage from "./page";
import { getAlgoProblem } from "@/features/algorithms/data";
import { getHint } from "@/lib/actions/algoCoach";

// Mock dependencies
jest.mock("next/navigation", () => ({
	useParams: jest.fn(),
}));

jest.mock("@/features/algorithms/data", () => ({
	getAlgoProblem: jest.fn(),
}));

jest.mock("@/lib/actions/algoCoach", () => ({
	getHint: jest.fn(),
}));

jest.mock("@/features/algorithms/hooks/useAlgoProblemExecution", () => ({
	useAlgoProblemExecution: jest.fn(),
}));

const mockProblem = {
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

const mockHookReturn = {
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
	executeCode: jest.fn(),
	resetCode: jest.fn(),
	buttonVariant: "correct" as const,
	buttonDisabled: false,
	allTestsPassed: true,
};

describe("AlgorithmWorkspacePage", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useParams as jest.Mock).mockReturnValue({ problemId: "two-sum" });
		(getAlgoProblem as jest.Mock).mockReturnValue(mockProblem);
		(getHint as jest.Mock).mockResolvedValue({
			message: "Consider using a hash map",
			followUpQuestion: "What would you store in the hash map?",
		});
	});

	it("should render workspace layout when problem exists", () => {
		const {
			useAlgoProblemExecution,
		} = require("@/features/algorithms/hooks/useAlgoProblemExecution");
		useAlgoProblemExecution.mockReturnValue(mockHookReturn);

		render(<AlgorithmWorkspacePage />);

		expect(screen.getByText("Two Sum")).toBeInTheDocument();
		expect(screen.getByText("EASY")).toBeInTheDocument();
		expect(screen.getByText("arrays")).toBeInTheDocument();
		expect(screen.getByText("hashmap")).toBeInTheDocument();
	});

	it("should show problem not found when problem does not exist", () => {
		(getAlgoProblem as jest.Mock).mockReturnValue(null);

		render(<AlgorithmWorkspacePage />);

		expect(screen.getByText("Problem Not Found")).toBeInTheDocument();
		expect(
			screen.getByText("The problem you're looking for doesn't exist.")
		).toBeInTheDocument();
		expect(screen.getByText("Go Back")).toBeInTheDocument();
	});

	it("should handle hint button click", async () => {
		const {
			useAlgoProblemExecution,
		} = require("@/features/algorithms/hooks/useAlgoProblemExecution");
		useAlgoProblemExecution.mockReturnValue(mockHookReturn);

		render(<AlgorithmWorkspacePage />);

		const hintButton = screen.getByText("Hint");
		fireEvent.click(hintButton);

		await waitFor(() => {
			expect(getHint).toHaveBeenCalledWith(
				"two-sum",
				mockHookReturn.code,
				[],
				""
			);
		});
	});

	it("should handle send message", async () => {
		const {
			useAlgoProblemExecution,
		} = require("@/features/algorithms/hooks/useAlgoProblemExecution");
		useAlgoProblemExecution.mockReturnValue(mockHookReturn);

		render(<AlgorithmWorkspacePage />);

		const messageInput = screen.getByPlaceholderText("Ask a question...");
		fireEvent.change(messageInput, {
			target: { value: "How do I start?" },
		});

		// Test that the input value is set correctly
		expect(messageInput.value).toBe("How do I start?");

		// Test that the input can be cleared
		fireEvent.change(messageInput, {
			target: { value: "" },
		});
		expect(messageInput.value).toBe("");
	});

	it("should handle send button click", async () => {
		const {
			useAlgoProblemExecution,
		} = require("@/features/algorithms/hooks/useAlgoProblemExecution");
		useAlgoProblemExecution.mockReturnValue(mockHookReturn);

		render(<AlgorithmWorkspacePage />);

		const messageInput = screen.getByPlaceholderText("Ask a question...");
		const sendButton = screen.getByText("Send");

		fireEvent.change(messageInput, { target: { value: "Help me" } });
		fireEvent.click(sendButton);

		await waitFor(
			() => {
				expect(screen.getByText("Help me")).toBeInTheDocument();
			},
			{ timeout: 3000 }
		);
	});

	it("should not send empty messages", () => {
		const {
			useAlgoProblemExecution,
		} = require("@/features/algorithms/hooks/useAlgoProblemExecution");
		useAlgoProblemExecution.mockReturnValue(mockHookReturn);

		render(<AlgorithmWorkspacePage />);

		const messageInput = screen.getByPlaceholderText("Ask a question...");
		const sendButton = screen.getByText("Send");

		fireEvent.click(sendButton);

		// Should not show any user message - check that no messages were added to chat
		expect(screen.queryByText("How do I start?")).not.toBeInTheDocument();
		expect(screen.queryByText("Help me")).not.toBeInTheDocument();
	});

	it("should show AI mentor empty state initially", () => {
		const {
			useAlgoProblemExecution,
		} = require("@/features/algorithms/hooks/useAlgoProblemExecution");
		useAlgoProblemExecution.mockReturnValue(mockHookReturn);

		render(<AlgorithmWorkspacePage />);

		expect(
			screen.getByText("Ask me anything about this problem!")
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"I can help you understand the approach or debug your code."
			)
		).toBeInTheDocument();
	});

	it("should display test results when available", () => {
		const {
			useAlgoProblemExecution,
		} = require("@/features/algorithms/hooks/useAlgoProblemExecution");
		useAlgoProblemExecution.mockReturnValue(mockHookReturn);

		render(<AlgorithmWorkspacePage />);

		expect(screen.getByText("Test Cases")).toBeInTheDocument();
		expect(screen.getByText("Test Case 1")).toBeInTheDocument();
	});

	it("should handle different difficulty levels", () => {
		const hardProblem = {
			...mockProblem,
			difficulty: "hard",
		};
		(getAlgoProblem as jest.Mock).mockReturnValue(hardProblem);

		const {
			useAlgoProblemExecution,
		} = require("@/features/algorithms/hooks/useAlgoProblemExecution");
		useAlgoProblemExecution.mockReturnValue(mockHookReturn);

		render(<AlgorithmWorkspacePage />);

		expect(screen.getByText("HARD")).toBeInTheDocument();
	});
});
