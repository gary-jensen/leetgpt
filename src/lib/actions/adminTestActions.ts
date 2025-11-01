"use server";

import { requireAdmin } from "@/lib/auth";
import { getAllAlgoProblems } from "./adminAlgoActions";
import { validatePassingCodeDetailed } from "@/lib/execution/adminTestUtils";
import { AlgoProblemDetail } from "@/types/algorithm-types";

export interface TestProblemResult {
	problemId: string;
	problemTitle: string;
	problemSlug: string;
	languages: {
		language: string;
		passed: boolean;
		error?: string;
		failedTestCasesCount: number;
		failedTestCases?: Array<{
			case: number;
			input: any[];
			expected: any;
			actual?: any;
			error?: string;
		}>;
	}[];
}

export interface TestAllProblemsResult {
	results: TestProblemResult[];
	totalProblems: number;
	passedProblems: number;
	failedProblems: number;
}

/**
 * Test all problems from the database
 */
export async function testAllProblems(): Promise<TestAllProblemsResult> {
	requireAdmin();

	const dbProblems = await getAllAlgoProblems();

	if (!dbProblems || dbProblems.length === 0) {
		return {
			results: [],
			totalProblems: 0,
			passedProblems: 0,
			failedProblems: 0,
		};
	}

	// Convert database problems to AlgoProblemDetail format
	const problems: AlgoProblemDetail[] = dbProblems.map((dbProblem) => ({
		id: dbProblem.id,
		slug: dbProblem.slug,
		title: dbProblem.title,
		topics: dbProblem.topics,
		difficulty: dbProblem.difficulty as "easy" | "medium" | "hard",
		languages: dbProblem.languages,
		order: (dbProblem as any).order ?? 0,
		statementMd: (dbProblem as any).statementMd || "",
		statementHtml: (dbProblem as any).statementHtml || null,
		rubric: (dbProblem as any).rubric || {
			optimal_time: "",
			acceptable_time: [],
		},
		tests: (dbProblem as any).tests || [],
		parameterNames: (dbProblem as any).parameterNames || [],
		startingCode: (dbProblem as any).startingCode || {},
		passingCode: (dbProblem as any).passingCode || {},
	}));

	// Test each problem
	const testResults: TestProblemResult[] = [];
	let passedCount = 0;
	let failedCount = 0;

	for (const problem of problems) {
		const validation = await validatePassingCodeDetailed(problem);

		const languages = validation.results.map((result) => ({
			language: result.language,
			passed: result.passed,
			error: result.error,
			failedTestCasesCount: result.failedTestCases?.length || 0,
			failedTestCases: result.failedTestCases?.map((tc) => ({
				case: tc.case,
				input: tc.input,
				expected: tc.expected,
				actual: tc.actual,
				error: tc.error,
			})),
		}));

		const allLanguagesPassed = languages.every((lang) => lang.passed);

		if (allLanguagesPassed) {
			passedCount++;
		} else {
			failedCount++;
		}

		testResults.push({
			problemId: problem.id,
			problemTitle: problem.title,
			problemSlug: problem.slug,
			languages,
		});
	}

	return {
		results: testResults,
		totalProblems: problems.length,
		passedProblems: passedCount,
		failedProblems: failedCount,
	};
}

