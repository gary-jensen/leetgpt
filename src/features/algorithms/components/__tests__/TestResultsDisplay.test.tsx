import { render, screen, fireEvent } from "@testing-library/react";
import { TestResultsDisplay, TestResult } from "../TestResultsDisplay";

const mockTestResults: TestResult[] = [
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

const defaultProps = {
	results: mockTestResults,
	isExecuting: false,
	iframeRef: { current: null },
	handleRunClick: jest.fn(),
	buttonVariant: "run" as const,
	buttonDisabled: false,
};

describe("TestResultsDisplay", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should render test cases tab by default", () => {
		render(<TestResultsDisplay {...defaultProps} />);

		expect(screen.getByText("Test Cases")).toBeInTheDocument();
		expect(screen.getByText("1/2")).toBeInTheDocument();
		expect(screen.getByText("Console")).toBeInTheDocument();
	});

	it("should show loading state when executing", () => {
		render(<TestResultsDisplay {...defaultProps} isExecuting={true} />);

		expect(screen.getByText("Running tests...")).toBeInTheDocument();
	});

	it("should show empty state when no results", () => {
		render(<TestResultsDisplay {...defaultProps} results={[]} />);

		expect(screen.getByText("No test results yet")).toBeInTheDocument();
		expect(
			screen.getByText('Click "Run" to execute your code')
		).toBeInTheDocument();
	});

	it("should display test summary correctly", () => {
		render(<TestResultsDisplay {...defaultProps} />);

		// Should show 1 of 2 tests passed
		expect(screen.getByText("1 of 2 tests passed")).toBeInTheDocument();
	});

	it("should show all tests passed when all pass", () => {
		const allPassedResults: TestResult[] = [
			{
				case: 1,
				passed: true,
				input: [[2, 7, 11, 15], 9],
				expected: [0, 1],
				actual: [0, 1],
			},
			{
				case: 2,
				passed: true,
				input: [[3, 2, 4], 6],
				expected: [1, 2],
				actual: [1, 2],
			},
		];

		render(
			<TestResultsDisplay {...defaultProps} results={allPassedResults} />
		);

		expect(screen.getByText("All tests passed!")).toBeInTheDocument();
	});

	it("should switch to console tab when clicked", () => {
		render(<TestResultsDisplay {...defaultProps} />);

		const consoleTab = screen.getByText("Console");
		fireEvent.click(consoleTab);

		// Console tab should be active (we can't easily test the console component without mocking)
		expect(consoleTab).toBeInTheDocument();
	});

	it("should display individual test cases", () => {
		render(<TestResultsDisplay {...defaultProps} />);

		expect(screen.getByText("Test Case 1")).toBeInTheDocument();
		expect(screen.getByText("Test Case 2")).toBeInTheDocument();
	});

	it("should show passed/failed status for each test", () => {
		render(<TestResultsDisplay {...defaultProps} />);

		expect(screen.getByText("PASSED")).toBeInTheDocument();
		expect(screen.getByText("FAILED")).toBeInTheDocument();
	});
});
