import { AlgoProblemDetail } from "@/types/algorithm-types";
import { executeAlgoTests, AlgoTestResult } from "./algoTestExecutor";

/**
 * Admin utility to test if the passingCode for a problem actually passes all test cases
 * This is useful for debugging and ensuring the reference solutions are correct
 */
export async function validatePassingCode(problem: AlgoProblemDetail): Promise<{
	isValid: boolean;
	results: {
		language: string;
		passed: boolean;
		error?: string;
	}[];
}> {
	const results = [];

	for (const language of problem.languages) {
		const passingCode = problem.passingCode[language];

		if (!passingCode) {
			results.push({
				language,
				passed: false,
				error: `No passingCode found for language: ${language}`,
			});
			continue;
		}

		try {
			const testResult = await executeAlgoTests(
				problem,
				passingCode,
				language
			);

			if (testResult.status === "error") {
				results.push({
					language,
					passed: false,
					error: testResult.message || "Unknown error",
				});
			} else {
				const allPassed = testResult.results.every(
					(result) => result.passed
				);
				results.push({
					language,
					passed: allPassed,
					error: allPassed ? undefined : "Some test cases failed",
				});
			}
		} catch (error) {
			results.push({
				language,
				passed: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	const isValid = results.every((result) => result.passed);

	return {
		isValid,
		results,
	};
}

/**
 * Admin utility to validate all problems' passingCode
 */
export async function validateAllPassingCodes(
	problems: AlgoProblemDetail[]
): Promise<{
	validProblems: string[];
	invalidProblems: {
		problemId: string;
		results: {
			language: string;
			passed: boolean;
			error?: string;
		}[];
	}[];
}> {
	const validProblems: string[] = [];
	const invalidProblems: {
		problemId: string;
		results: {
			language: string;
			passed: boolean;
			error?: string;
		}[];
	}[] = [];

	for (const problem of problems) {
		const validation = await validatePassingCode(problem);

		if (validation.isValid) {
			validProblems.push(problem.id);
		} else {
			invalidProblems.push({
				problemId: problem.id,
				results: validation.results,
			});
		}
	}

	return {
		validProblems,
		invalidProblems,
	};
}

/**
 * Enhanced validation that returns detailed test case results
 */
export async function validatePassingCodeDetailed(
	problem: AlgoProblemDetail
): Promise<{
	isValid: boolean;
	results: {
		language: string;
		passed: boolean;
		error?: string;
		failedTestCases?: AlgoTestResult[];
		allTestResults?: AlgoTestResult[];
	}[];
}> {
	const results = [];

	for (const language of problem.languages) {
		const passingCode = problem.passingCode[language];

		if (!passingCode) {
			results.push({
				language,
				passed: false,
				error: `No passingCode found for language: ${language}`,
				failedTestCases: [],
				allTestResults: [],
			});
			continue;
		}

		try {
			const testResult = await executeAlgoTests(
				problem,
				passingCode,
				language
			);

			if (testResult.status === "error") {
				results.push({
					language,
					passed: false,
					error: testResult.message || "Unknown error",
					failedTestCases: [],
					allTestResults: testResult.results,
				});
			} else {
				const failedTestCases = testResult.results.filter(
					(result) => !result.passed
				);
				const allPassed = failedTestCases.length === 0;

				results.push({
					language,
					passed: allPassed,
					error: allPassed
						? undefined
						: `${failedTestCases.length} test case(s) failed`,
					failedTestCases,
					allTestResults: testResult.results,
				});
			}
		} catch (error) {
			results.push({
				language,
				passed: false,
				error: error instanceof Error ? error.message : "Unknown error",
				failedTestCases: [],
				allTestResults: [],
			});
		}
	}

	const isValid = results.every((result) => result.passed);

	return {
		isValid,
		results,
	};
}

/**
 * Validate that secondaryPassingCode (non-optimal but correct solution) passes all test cases
 * This ensures test cases correctly accept valid solutions, even if they're not optimal
 */
export async function validateSecondaryPassingCode(
	problem: AlgoProblemDetail
): Promise<{
	isValid: boolean;
	results: {
		language: string;
		passed: boolean; // true if secondaryPassingCode passes all tests (which is what we want)
		error?: string;
		failedTestCases?: AlgoTestResult[]; // Test cases that the secondary code failed (bad - means test cases reject valid solutions)
		passedTestCases?: AlgoTestResult[]; // Test cases that the secondary code passed (good)
		allTestResults?: AlgoTestResult[];
	}[];
}> {
	const results = [];

	for (const language of problem.languages) {
		const secondaryPassingCode = problem.secondaryPassingCode?.[language];

		// If no secondaryPassingCode is provided, skip validation
		if (!secondaryPassingCode) {
			results.push({
				language,
				passed: true, // Not required, so we consider it valid
				error: undefined,
				failedTestCases: [],
				passedTestCases: [],
				allTestResults: [],
			});
			continue;
		}

		try {
			const testResult = await executeAlgoTests(
				problem,
				secondaryPassingCode,
				language
			);

			if (testResult.status === "error") {
				// If secondary code errors out, that's bad - it should pass
				results.push({
					language,
					passed: false,
					error: `Secondary code has errors: ${
						testResult.message || "Unknown error"
					}`,
					failedTestCases: [],
					passedTestCases: [],
					allTestResults: [],
				});
			} else {
				const passedTestCases = testResult.results.filter(
					(result) => result.passed
				);
				const failedTestCases = testResult.results.filter(
					(result) => !result.passed
				);

				// We want secondaryPassingCode to PASS all tests
				// If it fails any tests, that means our test cases reject valid solutions
				const isValid = failedTestCases.length === 0;

				results.push({
					language,
					passed: isValid,
					error: isValid
						? undefined
						: `Secondary passing code failed ${failedTestCases.length} out of ${testResult.results.length} test cases. Test cases may be too strict - they should accept valid solutions.`,
					failedTestCases,
					passedTestCases,
					allTestResults: testResult.results,
				});
			}
		} catch (error) {
			results.push({
				language,
				passed: false,
				error: error instanceof Error ? error.message : "Unknown error",
				failedTestCases: [],
				passedTestCases: [],
				allTestResults: [],
			});
		}
	}

	const isValid = results.every((result) => result.passed);

	return {
		isValid,
		results,
	};
}

/**
 * Format failed test cases as minimal copy-pasteable text
 */
export function formatFailedTestCases(
	problem: AlgoProblemDetail,
	failedTestCases: AlgoTestResult[]
): string {
	if (failedTestCases.length === 0) {
		return "";
	}

	const lines: string[] = [];

	for (const testCase of failedTestCases) {
		lines.push(`Problem: ${problem.id} - ${problem.title}`);
		lines.push(`Test Case ${testCase.case}:`);
		lines.push(`Input: ${JSON.stringify(testCase.input)}`);
		lines.push(`Expected: ${JSON.stringify(testCase.expected)}`);
		if (testCase.error) {
			lines.push(`Error: ${testCase.error}`);
		} else {
			lines.push(`Actual: ${JSON.stringify(testCase.actual)}`);
		}
		lines.push(""); // Empty line between test cases
	}

	return lines.join("\n");
}
