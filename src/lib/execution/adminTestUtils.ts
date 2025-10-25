import { AlgoProblemDetail } from "@/types/algorithm-types";
import { executeAlgoTests } from "./algoTestExecutor";

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
			const testResult = await executeAlgoTests(problem, passingCode, language);
			
			if (testResult.status === "error") {
				results.push({
					language,
					passed: false,
					error: testResult.message || "Unknown error",
				});
			} else {
				const allPassed = testResult.results.every(result => result.passed);
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
	
	const isValid = results.every(result => result.passed);
	
	return {
		isValid,
		results,
	};
}

/**
 * Admin utility to validate all problems' passingCode
 */
export async function validateAllPassingCodes(problems: AlgoProblemDetail[]): Promise<{
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
