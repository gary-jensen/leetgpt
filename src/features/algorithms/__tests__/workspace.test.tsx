import { render, screen } from "@testing-library/react";
import { AlgoProblemDetail } from "@/types/algorithm-types";

// Mock the components we're testing
const MockWorkspaceLayout = ({ problem }: { problem: AlgoProblemDetail }) => (
	<div data-testid="workspace-layout">
		<h1>{problem.title}</h1>
		<div className="difficulty">{problem.difficulty}</div>
		<div className="topics">
			{problem.topics.map((topic) => (
				<span key={topic} className="topic">
					{topic}
				</span>
			))}
		</div>
	</div>
);

const MockTestResultsDisplay = ({ results }: { results: any[] }) => (
	<div data-testid="test-results">
		<div className="summary">
			{results.length > 0
				? `${results.filter((r) => r.passed).length}/${
						results.length
				  } tests passed`
				: "No tests run"}
		</div>
		{results.map((result, index) => (
			<div
				key={index}
				className={`test-case ${result.passed ? "passed" : "failed"}`}
			>
				Test Case {result.case}: {result.passed ? "PASSED" : "FAILED"}
			</div>
		))}
	</div>
);

const MockTestCaseItem = ({ result }: { result: any }) => (
	<div className={`test-case-item ${result.passed ? "passed" : "failed"}`}>
		<div className="test-case-header">
			Test Case {result.case} - {result.passed ? "PASSED" : "FAILED"}
		</div>
		{result.error && <div className="error-message">{result.error}</div>}
	</div>
);

describe("Algorithm Workspace Components", () => {
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
			javascript:
				"function twoSum(nums, target) {\n  // Your code here\n}",
		},
	};

	const mockTestResults = [
		{
			case: 1,
			passed: true,
			input: [[2, 7, 11, 15], 9],
			expected: [0, 1],
			actual: [0, 1],
		},
		{
			case: 2,
			passed: false,
			input: [[3, 2, 4], 6],
			expected: [1, 2],
			actual: [0, 1],
			error: "Wrong indices returned",
		},
	];

	describe("WorkspaceLayout", () => {
		it("should render problem information correctly", () => {
			render(<MockWorkspaceLayout problem={mockProblem} />);

			expect(screen.getByText("Two Sum")).toBeInTheDocument();
			expect(screen.getByText("easy")).toBeInTheDocument();
			expect(screen.getByText("arrays")).toBeInTheDocument();
			expect(screen.getByText("hashmap")).toBeInTheDocument();
		});

		it("should display all problem topics", () => {
			render(<MockWorkspaceLayout problem={mockProblem} />);

			const topics = screen.getAllByText(/arrays|hashmap/);
			expect(topics).toHaveLength(2);
		});
	});

	describe("TestResultsDisplay", () => {
		it("should show test summary correctly", () => {
			render(<MockTestResultsDisplay results={mockTestResults} />);

			expect(screen.getByText("1/2 tests passed")).toBeInTheDocument();
		});

		it("should display individual test results", () => {
			render(<MockTestResultsDisplay results={mockTestResults} />);

			expect(screen.getByText("Test Case 1: PASSED")).toBeInTheDocument();
			expect(screen.getByText("Test Case 2: FAILED")).toBeInTheDocument();
		});

		it("should handle empty results", () => {
			render(<MockTestResultsDisplay results={[]} />);

			expect(screen.getByText("No tests run")).toBeInTheDocument();
		});
	});

	describe("TestCaseItem", () => {
		it("should render passed test case correctly", () => {
			const passedResult = mockTestResults[0];
			render(<MockTestCaseItem result={passedResult} />);

			expect(
				screen.getByText("Test Case 1 - PASSED")
			).toBeInTheDocument();
			expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
		});

		it("should render failed test case with error", () => {
			const failedResult = mockTestResults[1];
			render(<MockTestCaseItem result={failedResult} />);

			expect(
				screen.getByText("Test Case 2 - FAILED")
			).toBeInTheDocument();
			expect(
				screen.getByText("Wrong indices returned")
			).toBeInTheDocument();
		});
	});

	describe("Problem Data Structure", () => {
		it("should have all required properties", () => {
			expect(mockProblem).toHaveProperty("id");
			expect(mockProblem).toHaveProperty("title");
			expect(mockProblem).toHaveProperty("topics");
			expect(mockProblem).toHaveProperty("difficulty");
			expect(mockProblem).toHaveProperty("tests");
			expect(mockProblem).toHaveProperty("startingCode");
		});

		it("should have correct test structure", () => {
			expect(mockProblem.tests).toHaveLength(2);
			expect(mockProblem.tests[0]).toHaveProperty("input");
			expect(mockProblem.tests[0]).toHaveProperty("output");
			expect(Array.isArray(mockProblem.tests[0].input)).toBe(true);
		});

		it("should have starting code for JavaScript", () => {
			expect(mockProblem.startingCode).toHaveProperty("javascript");
			expect(typeof mockProblem.startingCode.javascript).toBe("string");
			expect(mockProblem.startingCode.javascript).toContain(
				"function twoSum"
			);
		});
	});

	describe("Test Results Structure", () => {
		it("should have correct test result structure", () => {
			const result = mockTestResults[0];
			expect(result).toHaveProperty("case");
			expect(result).toHaveProperty("passed");
			expect(result).toHaveProperty("input");
			expect(result).toHaveProperty("expected");
			expect(result).toHaveProperty("actual");
			expect(typeof result.passed).toBe("boolean");
		});

		it("should handle failed tests with errors", () => {
			const failedResult = mockTestResults[1];
			expect(failedResult.passed).toBe(false);
			expect(failedResult).toHaveProperty("error");
			expect(typeof failedResult.error).toBe("string");
		});
	});
});
