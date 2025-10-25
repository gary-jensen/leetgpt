import { renderHook, act } from "@testing-library/react";
import { useAlgoProblemExecution } from "../hooks/useAlgoProblemExecution";
import { algoProblems } from "../data/algoProblems";

describe("Show Solution Feature", () => {
	it("should set code to passingCode when showSolution is called", () => {
		const problem = algoProblems.find((p) => p.id === "two-sum");
		expect(problem).toBeDefined();

		if (problem) {
			const { result } = renderHook(() =>
				useAlgoProblemExecution(problem)
			);

			// Initially should have starting code
			expect(result.current.code).toBe(problem.startingCode.javascript);

			// Call showSolution
			act(() => {
				result.current.showSolution();
			});

			// Should now have passingCode
			expect(result.current.code).toBe(problem.passingCode.javascript);
		}
	});

	it("should clear test results when showSolution is called", () => {
		const problem = algoProblems.find((p) => p.id === "two-sum");
		expect(problem).toBeDefined();

		if (problem) {
			const { result } = renderHook(() =>
				useAlgoProblemExecution(problem)
			);

			// Manually set some test results to simulate having run tests
			act(() => {
				result.current.setCode("function twoSum() { return [0, 1]; }");
			});

			// Call showSolution
			act(() => {
				result.current.showSolution();
			});

			// Test results should be cleared
			expect(result.current.testResults).toHaveLength(0);
		}
	});

	it("should handle problem without passingCode gracefully", () => {
		// Create a mock problem without passingCode
		const problemWithoutPassingCode = {
			...algoProblems[0],
			passingCode: { javascript: "" },
		};

		const { result } = renderHook(() =>
			useAlgoProblemExecution(problemWithoutPassingCode)
		);

		// Call showSolution - should not crash
		act(() => {
			result.current.showSolution();
		});

		// Should set to empty string
		expect(result.current.code).toBe("");
	});
});
