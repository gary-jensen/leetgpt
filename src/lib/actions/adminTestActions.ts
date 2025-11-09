"use server";

import { requireAdmin } from "@/lib/auth";
import { getAllAlgoProblems } from "./adminAlgoActions";
import {
	validatePassingCodeDetailed,
	validateSecondaryPassingCode,
} from "@/lib/execution/adminTestUtils";
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
		secondaryValidation?: {
			passed: boolean; // true if secondaryPassingCode passes all tests (which is what we want)
			error?: string;
			failedTestCasesCount: number; // Test cases that secondary code failed (bad - means test cases reject valid solutions)
			failedTestCases?: Array<{
				case: number;
				input: any[];
				expected: any;
				actual?: any;
				error?: string;
			}>;
		};
	}[];
}

export interface TestAllProblemsResult {
	results: TestProblemResult[];
	totalProblems: number;
	passedProblems: number;
	failedProblems: number;
}

/**
 * Get all problems formatted as AlgoProblemDetail for client-side testing
 * This is used when tests need to run client-side with CodeExecutor
 */
export async function getAllProblemsFormatted(): Promise<AlgoProblemDetail[]> {
	requireAdmin();

	const dbProblems = await getAllAlgoProblems();

	if (!dbProblems || dbProblems.length === 0) {
		return [];
	}

	// Convert database problems to AlgoProblemDetail format
	// Import type inference for backward compatibility
	const { inferParameterTypes } = await import("@/lib/utils/typeInference");

	const problems: AlgoProblemDetail[] = await Promise.all(
		dbProblems.map(async (dbProblem) => {
			// Get parameters and returnType (new fields), infer if missing (backward compatibility)
			let parameters = (dbProblem as any).parameters
				? ((dbProblem as any).parameters as {
						name: string;
						type: string;
				  }[])
				: undefined;
			let returnType = (dbProblem as any).returnType
				? ((dbProblem as any).returnType as string)
				: undefined;
			const functionName = (dbProblem as any).functionName
				? ((dbProblem as any).functionName as string)
				: undefined;

			// If parameters missing, build temporary problem object to infer types
			if (!parameters || parameters.length === 0) {
				const tempProblem: AlgoProblemDetail = {
					id: dbProblem.id,
					slug: dbProblem.slug,
					title: dbProblem.title,
					topics: dbProblem.topics,
					difficulty: dbProblem.difficulty as
						| "easy"
						| "medium"
						| "hard",
					languages: dbProblem.languages,
					order: (dbProblem as any).order ?? 0,
					statementMd: (dbProblem as any).statementMd || "",
					statementHtml: (dbProblem as any).statementHtml || null,
					examplesAndConstraintsMd:
						(dbProblem as any).examplesAndConstraintsMd || null,
					examplesAndConstraintsHtml:
						(dbProblem as any).examplesAndConstraintsHtml || null,
					rubric: (dbProblem as any).rubric || {
						optimal_time: "",
						acceptable_time: [],
					},
					tests: (dbProblem as any).tests || [],
					parameters: [],
					startingCode: (dbProblem as any).startingCode || {},
					passingCode: (dbProblem as any).passingCode || {},
					secondaryPassingCode: (dbProblem as any)
						.secondaryPassingCode
						? ((dbProblem as any).secondaryPassingCode as {
								[key: string]: string;
						  })
						: undefined,
					outputOrderMatters:
						(dbProblem as any).outputOrderMatters ?? true,
				};
				const inference = inferParameterTypes(tempProblem);
				parameters = inference.parameters;
				returnType = returnType || inference.returnType || "void";
			}

			return {
				id: dbProblem.id,
				slug: dbProblem.slug,
				title: dbProblem.title,
				topics: dbProblem.topics,
				difficulty: dbProblem.difficulty as "easy" | "medium" | "hard",
				languages: dbProblem.languages,
				order: (dbProblem as any).order ?? 0,
				statementMd: (dbProblem as any).statementMd || "",
				statementHtml: (dbProblem as any).statementHtml || null,
				examplesAndConstraintsMd:
					(dbProblem as any).examplesAndConstraintsMd || null,
				examplesAndConstraintsHtml:
					(dbProblem as any).examplesAndConstraintsHtml || null,
				rubric: (dbProblem as any).rubric || {
					optimal_time: "",
					acceptable_time: [],
				},
				tests: (dbProblem as any).tests || [],
				parameters: parameters || [],
				returnType: returnType || "void",
				functionName: functionName,
				startingCode: (dbProblem as any).startingCode || {},
				passingCode: (dbProblem as any).passingCode || {},
				secondaryPassingCode: (dbProblem as any).secondaryPassingCode
					? ((dbProblem as any).secondaryPassingCode as {
							[key: string]: string;
					  })
					: undefined,
				outputOrderMatters:
					(dbProblem as any).outputOrderMatters ?? true,
				judge: (dbProblem as any).judge || undefined,
			};
		})
	);

	return problems;
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
	// Import type inference for backward compatibility
	const { inferParameterTypes } = await import("@/lib/utils/typeInference");

	const problems: AlgoProblemDetail[] = await Promise.all(
		dbProblems.map(async (dbProblem) => {
			// Get parameters and returnType (new fields), infer if missing (backward compatibility)
			let parameters = (dbProblem as any).parameters
				? ((dbProblem as any).parameters as {
						name: string;
						type: string;
				  }[])
				: undefined;
			let returnType = (dbProblem as any).returnType
				? ((dbProblem as any).returnType as string)
				: undefined;
			const functionName = (dbProblem as any).functionName
				? ((dbProblem as any).functionName as string)
				: undefined;

			// If parameters missing, build temporary problem object to infer types
			if (!parameters || parameters.length === 0) {
				const tempProblem: AlgoProblemDetail = {
					id: dbProblem.id,
					slug: dbProblem.slug,
					title: dbProblem.title,
					topics: dbProblem.topics,
					difficulty: dbProblem.difficulty as
						| "easy"
						| "medium"
						| "hard",
					languages: dbProblem.languages,
					order: (dbProblem as any).order ?? 0,
					statementMd: (dbProblem as any).statementMd || "",
					statementHtml: (dbProblem as any).statementHtml || null,
					examplesAndConstraintsMd:
						(dbProblem as any).examplesAndConstraintsMd || null,
					examplesAndConstraintsHtml:
						(dbProblem as any).examplesAndConstraintsHtml || null,
					rubric: (dbProblem as any).rubric || {
						optimal_time: "",
						acceptable_time: [],
					},
					tests: (dbProblem as any).tests || [],
					parameters: [],
					startingCode: (dbProblem as any).startingCode || {},
					passingCode: (dbProblem as any).passingCode || {},
					secondaryPassingCode: (dbProblem as any)
						.secondaryPassingCode
						? ((dbProblem as any).secondaryPassingCode as {
								[key: string]: string;
						  })
						: undefined,
					outputOrderMatters:
						(dbProblem as any).outputOrderMatters ?? true,
				};
				const inference = inferParameterTypes(tempProblem);
				parameters = inference.parameters;
				returnType = returnType || inference.returnType || "void";
			}

			return {
				id: dbProblem.id,
				slug: dbProblem.slug,
				title: dbProblem.title,
				topics: dbProblem.topics,
				difficulty: dbProblem.difficulty as "easy" | "medium" | "hard",
				languages: dbProblem.languages,
				order: (dbProblem as any).order ?? 0,
				statementMd: (dbProblem as any).statementMd || "",
				statementHtml: (dbProblem as any).statementHtml || null,
				examplesAndConstraintsMd:
					(dbProblem as any).examplesAndConstraintsMd || null,
				examplesAndConstraintsHtml:
					(dbProblem as any).examplesAndConstraintsHtml || null,
				rubric: (dbProblem as any).rubric || {
					optimal_time: "",
					acceptable_time: [],
				},
				tests: (dbProblem as any).tests || [],
				parameters: parameters || [],
				returnType: returnType || "void",
				functionName: functionName,
				startingCode: (dbProblem as any).startingCode || {},
				passingCode: (dbProblem as any).passingCode || {},
				secondaryPassingCode: (dbProblem as any).secondaryPassingCode
					? ((dbProblem as any).secondaryPassingCode as {
							[key: string]: string;
					  })
					: undefined,
				outputOrderMatters:
					(dbProblem as any).outputOrderMatters ?? true,
				judge: (dbProblem as any).judge || undefined,
			};
		})
	);

	// Test each problem
	const testResults: TestProblemResult[] = [];
	let passedCount = 0;
	let failedCount = 0;

	for (const problem of problems) {
		const validation = await validatePassingCodeDetailed(problem);
		const secondaryValidation = await validateSecondaryPassingCode(problem);

		const languages = validation.results.map((result) => {
			const secondaryResult = secondaryValidation.results.find(
				(r) => r.language === result.language
			);
			return {
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
				secondaryValidation: secondaryResult
					? {
							passed: secondaryResult.passed,
							error: secondaryResult.error,
							failedTestCasesCount:
								secondaryResult.failedTestCases?.length || 0,
							failedTestCases:
								secondaryResult.failedTestCases?.map((tc) => ({
									case: tc.case,
									input: tc.input,
									expected: tc.expected,
									actual: tc.actual,
									error: tc.error,
								})),
					  }
					: undefined,
			};
		});

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

/**
 * Test a single problem by ID
 */
export async function testSingleProblem(
	problemId: string
): Promise<TestProblemResult | null> {
	requireAdmin();

	const dbProblems = await getAllAlgoProblems();

	if (!dbProblems || dbProblems.length === 0) {
		return null;
	}

	const dbProblem = dbProblems.find((p) => p.id === problemId);

	if (!dbProblem) {
		return null;
	}

	// Convert database problem to AlgoProblemDetail format
	// Import type inference for backward compatibility
	const { inferParameterTypes } = await import("@/lib/utils/typeInference");

	// Get parameters and returnType (new fields), infer if missing (backward compatibility)
	let parameters = (dbProblem as any).parameters
		? ((dbProblem as any).parameters as { name: string; type: string }[])
		: undefined;
	let returnType = (dbProblem as any).returnType
		? ((dbProblem as any).returnType as string)
		: undefined;
	let functionName = (dbProblem as any).functionName
		? ((dbProblem as any).functionName as string)
		: undefined;

	// If parameters missing, build temporary problem object to infer types
	if (!parameters || parameters.length === 0) {
		const tempProblem: AlgoProblemDetail = {
			id: dbProblem.id,
			slug: dbProblem.slug,
			title: dbProblem.title,
			topics: dbProblem.topics,
			difficulty: dbProblem.difficulty as "easy" | "medium" | "hard",
			languages: dbProblem.languages,
			order: (dbProblem as any).order ?? 0,
			statementMd: (dbProblem as any).statementMd || "",
			statementHtml: (dbProblem as any).statementHtml || null,
			examplesAndConstraintsMd:
				(dbProblem as any).examplesAndConstraintsMd || null,
			examplesAndConstraintsHtml:
				(dbProblem as any).examplesAndConstraintsHtml || null,
			rubric: (dbProblem as any).rubric || {
				optimal_time: "",
				acceptable_time: [],
			},
			tests: (dbProblem as any).tests || [],
			parameters: [],
			startingCode: (dbProblem as any).startingCode || {},
			passingCode: (dbProblem as any).passingCode || {},
			secondaryPassingCode: (dbProblem as any).secondaryPassingCode
				? ((dbProblem as any).secondaryPassingCode as {
						[key: string]: string;
				  })
				: undefined,
			outputOrderMatters: (dbProblem as any).outputOrderMatters ?? true,
		};
		const inference = inferParameterTypes(tempProblem);
		parameters = inference.parameters;
		returnType = returnType || inference.returnType || "void";
	}

	const problem: AlgoProblemDetail = {
		id: dbProblem.id,
		slug: dbProblem.slug,
		title: dbProblem.title,
		topics: dbProblem.topics,
		difficulty: dbProblem.difficulty as "easy" | "medium" | "hard",
		languages: dbProblem.languages,
		order: (dbProblem as any).order ?? 0,
		statementMd: (dbProblem as any).statementMd || "",
		statementHtml: (dbProblem as any).statementHtml || null,
		examplesAndConstraintsMd:
			(dbProblem as any).examplesAndConstraintsMd || null,
		examplesAndConstraintsHtml:
			(dbProblem as any).examplesAndConstraintsHtml || null,
		rubric: (dbProblem as any).rubric || {
			optimal_time: "",
			acceptable_time: [],
		},
		tests: (dbProblem as any).tests || [],
		parameters: parameters || [],
		returnType: returnType || "void",
		functionName: functionName,
		startingCode: (dbProblem as any).startingCode || {},
		passingCode: (dbProblem as any).passingCode || {},
		secondaryPassingCode: (dbProblem as any).secondaryPassingCode
			? ((dbProblem as any).secondaryPassingCode as {
					[key: string]: string;
			  })
			: undefined,
		outputOrderMatters: (dbProblem as any).outputOrderMatters ?? true,
		judge: (dbProblem as any).judge || undefined,
	};

	const validation = await validatePassingCodeDetailed(problem);
	const secondaryValidation = await validateSecondaryPassingCode(problem);

	const languages = validation.results.map((result) => {
		const secondaryResult = secondaryValidation.results.find(
			(r) => r.language === result.language
		);
		return {
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
			secondaryValidation: secondaryResult
				? {
						passed: secondaryResult.passed,
						error: secondaryResult.error,
						failedTestCasesCount:
							secondaryResult.failedTestCases?.length || 0,
						failedTestCases: secondaryResult.failedTestCases?.map(
							(tc) => ({
								case: tc.case,
								input: tc.input,
								expected: tc.expected,
								actual: tc.actual,
								error: tc.error,
							})
						),
				  }
				: undefined,
		};
	});

	return {
		problemId: problem.id,
		problemTitle: problem.title,
		problemSlug: problem.slug,
		languages,
	};
}
