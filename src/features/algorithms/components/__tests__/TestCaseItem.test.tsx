import { render, screen, fireEvent } from "@testing-library/react";
import { TestCaseItem } from "../TestCaseItem";
import { TestResult } from "../TestResultsDisplay";

const mockPassedResult: TestResult = {
	case: 1,
	passed: true,
	input: [[2, 7, 11, 15], 9],
	expected: [0, 1],
	actual: [0, 1],
};

const mockFailedResult: TestResult = {
	case: 2,
	passed: false,
	input: [[3, 2, 4], 6],
	expected: [1, 2],
	actual: [0, 1],
	error: "Wrong indices returned",
};

describe("TestCaseItem", () => {
	it("should render test case header with correct status", () => {
		render(<TestCaseItem result={mockPassedResult} />);

		expect(screen.getByText("Test Case 1")).toBeInTheDocument();
		expect(screen.getByText("PASSED")).toBeInTheDocument();
	});

	it("should show failed status for failed test", () => {
		render(<TestCaseItem result={mockFailedResult} />);

		expect(screen.getByText("Test Case 2")).toBeInTheDocument();
		expect(screen.getByText("FAILED")).toBeInTheDocument();
	});

	it("should expand when clicked", () => {
		render(<TestCaseItem result={mockPassedResult} />);

		const header = screen.getByText("Test Case 1").closest("div");
		expect(header).toBeInTheDocument();

		fireEvent.click(header!);

		// Should show expanded content
		expect(screen.getByText("Input:")).toBeInTheDocument();
		expect(screen.getByText("Expected:")).toBeInTheDocument();
	});

	it("should display input and expected values when expanded", () => {
		render(<TestCaseItem result={mockPassedResult} isExpanded={true} />);

		expect(screen.getByText("Input:")).toBeInTheDocument();
		expect(screen.getByText("Expected:")).toBeInTheDocument();
		expect(screen.getByText("Actual:")).toBeInTheDocument();
	});

	it("should display error message for failed tests", () => {
		render(<TestCaseItem result={mockFailedResult} isExpanded={true} />);

		expect(screen.getByText("Error:")).toBeInTheDocument();
		expect(screen.getByText("Wrong indices returned")).toBeInTheDocument();
	});

	it("should format values correctly", () => {
		render(<TestCaseItem result={mockPassedResult} isExpanded={true} />);

		// Check that arrays are formatted properly
		expect(screen.getByText(/\[2, 7, 11, 15\]/)).toBeInTheDocument();
		expect(screen.getAllByText(/\[0, 1\]/)).toHaveLength(2); // Expected and actual both show [0, 1]
	});

	it("should show test case number in footer", () => {
		render(<TestCaseItem result={mockPassedResult} isExpanded={true} />);

		expect(screen.getByText("Test Case #1")).toBeInTheDocument();
		expect(screen.getByText("✓ Passed")).toBeInTheDocument();
	});

	it("should show failed status in footer for failed tests", () => {
		render(<TestCaseItem result={mockFailedResult} isExpanded={true} />);

		expect(screen.getByText("Test Case #2")).toBeInTheDocument();
		expect(screen.getByText("✗ Failed")).toBeInTheDocument();
	});

	it("should be collapsed by default", () => {
		render(<TestCaseItem result={mockPassedResult} />);

		// Expanded content should not be visible
		expect(screen.queryByText("Input:")).not.toBeInTheDocument();
	});

	it("should be expanded when isExpanded is true", () => {
		render(<TestCaseItem result={mockPassedResult} isExpanded={true} />);

		// Expanded content should be visible
		expect(screen.getByText("Input:")).toBeInTheDocument();
	});
});
