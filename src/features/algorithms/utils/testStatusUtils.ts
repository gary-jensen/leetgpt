import { TestResult } from "../components/TestResultsDisplay";

export function getTestStatus(testResults: TestResult[], index: number) {
	if (testResults.length === 0) return "pending";
	return testResults[index]?.passed ? "passed" : "failed";
}

export function getOverallStatus(testResults: TestResult[]) {
	if (testResults.length === 0) return "pending";
	const allPassed = testResults.every((r) => r.passed);
	return allPassed ? "accepted" : "wrong";
}
