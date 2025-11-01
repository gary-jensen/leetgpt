"use server";

import OpenAI from "openai";
import { requireAdmin } from "@/lib/auth";
import { getAlgoProblem } from "@/features/algorithms/data";
import { executeAlgoTests } from "@/lib/execution/algoTestExecutor";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AlgoProblemDetail } from "@/types/algorithm-types";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI fix response structure - what the AI should return
 */
export interface AIFixResponse {
	fixType: "testCases" | "passingCode" | "both";
	fixes: {
		testCases?: {
			updates: Array<{
				testIndex: number; // 0-based index
				input?: any[];
				output?: any;
			}>;
		};
		passingCode?: {
			javascript: string;
		};
	};
	explanation: string;
}

/**
 * Result of testing a proposed fix
 */
export interface TestFixResult {
	success: boolean;
	allTestsPass: boolean;
	testResults: Array<{
		case: number;
		passed: boolean;
		input: any[];
		expected: any;
		actual?: any;
		error?: string;
	}>;
	error?: string;
}

/**
 * Generate AI fix for a problem
 */
export async function generateProblemFix(
	problemId: string,
	language: string,
	failedTestCases: Array<{
		case: number;
		input: any[];
		expected: any;
		actual?: any;
		error?: string;
	}>
): Promise<{
	success: boolean;
	fix?: AIFixResponse;
	error?: string;
}> {
	requireAdmin();

	try {
		const problem = await getAlgoProblem(problemId);
		if (!problem) {
			return { success: false, error: "Problem not found" };
		}

		// Build prompt for AI
		const prompt = buildFixPrompt(problem, language, failedTestCases);

		// Call OpenAI API
		const completion = await openai.chat.completions.create({
			model: "gpt-5-mini-2025-08-07",
			messages: [
				{
					role: "system",
					content: `You are an expert at fixing algorithm test cases and code. Analyze the problem and failed test cases, then determine what needs to be fixed. Return valid JSON.`,
				},
				{
					role: "user",
					content: `${prompt}\n\nReturn JSON in this exact format:
{
  "fixType": "testCases" | "passingCode" | "both",
  "fixes": {
    "testCases": {
      "updates": [
        {"testIndex": 0, "input": [...], "output": ...}
      ]
    },
    "passingCode": {
      "javascript": "function name() { ... }"
    }
  },
  "explanation": "Brief explanation of what was wrong and why"
}

CRITICAL RULES:
- If fixType is "testCases": MUST include "testCases" in fixes object
- If fixType is "passingCode": MUST include "passingCode" with "javascript" key in fixes object  
- If fixType is "both": MUST include BOTH "testCases" and "passingCode" in fixes object
- testIndex is 0-based (first test case is 0)
- If fixing testCases, only include testIndex fields you're updating
- passingCode.javascript must be valid JavaScript code for the function
- Return ONLY the JSON object, no markdown, no code blocks, no explanations outside the JSON`,
				},
			],
			// temperature: 0.3, // Lower temperature for more consistent JSON
			// response_format: { type: "json_object" },
		});

		const aiResponse = completion.choices[0]?.message?.content;
		if (!aiResponse) {
			return { success: false, error: "No response from AI" };
		}

		// Parse and validate JSON
		let fix: AIFixResponse;
		try {
			const parsed = JSON.parse(aiResponse);
			fix = validateFixResponse(parsed, problem);
		} catch (error) {
			// Log the actual response for debugging
			console.error("AI Response that failed validation:", aiResponse);
			return {
				success: false,
				error: `Invalid JSON response: ${
					error instanceof Error ? error.message : "Unknown error"
				}. Raw response logged to console.`,
			};
		}

		return { success: true, fix };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Build the prompt for AI to analyze and fix
 */
function buildFixPrompt(
	problem: AlgoProblemDetail,
	language: string,
	failedTestCases: Array<{
		case: number;
		input: any[];
		expected: any;
		actual?: any;
		error?: string;
	}>
): string {
	let prompt = `Problem: ${problem.title}\n`;
	prompt += `ID: ${problem.id}\n\n`;
	prompt += `Problem Statement:\n${problem.statementMd}\n\n`;
	prompt += `Topics: ${problem.topics.join(", ")}\n`;
	prompt += `Difficulty: ${problem.difficulty}\n\n`;
	prompt += `Parameter Names: ${problem.parameterNames.join(", ")}\n\n`;

	prompt += `Current Passing Code (${language}):\n\`\`\`javascript\n${
		problem.passingCode[language] || "N/A"
	}\n\`\`\`\n\n`;

	prompt += `All Test Cases (${problem.tests.length} total):\n`;
	problem.tests.forEach((test, index) => {
		prompt += `Test ${index}: Input=${JSON.stringify(
			test.input
		)}, Expected=${JSON.stringify(test.output)}\n`;
	});

	prompt += `\nFailed Test Cases (${failedTestCases.length} failures):\n`;
	failedTestCases.forEach((failed) => {
		prompt += `Test ${failed.case - 1} (0-indexed: ${failed.case - 1}):\n`;
		prompt += `  Input: ${JSON.stringify(failed.input)}\n`;
		prompt += `  Expected: ${JSON.stringify(failed.expected)}\n`;
		if (failed.actual !== undefined) {
			prompt += `  Got: ${JSON.stringify(failed.actual)}\n`;
		}
		if (failed.error) {
			prompt += `  Error: ${failed.error}\n`;
		}
		prompt += `\n`;
	});

	prompt += `\nTask: Analyze these failures and determine what needs to be fixed.
- If test cases are wrong (wrong expected output for valid inputs), fix the testCases
- If the passingCode has bugs, fix the passingCode
- If both are problematic, fix both

Most commonly, the issue is with test cases having incorrect expected outputs.
Return JSON with the fixes.`;

	return prompt;
}

/**
 * Validate the AI response structure
 */
function validateFixResponse(
	parsed: any,
	problem: AlgoProblemDetail
): AIFixResponse {
	if (!parsed || typeof parsed !== "object") {
		throw new Error("Response must be an object");
	}

	if (!["testCases", "passingCode", "both"].includes(parsed.fixType)) {
		throw new Error(
			'fixType must be "testCases", "passingCode", or "both"'
		);
	}

	if (!parsed.fixes || typeof parsed.fixes !== "object") {
		throw new Error("fixes must be an object");
	}

	const fixType = parsed.fixType as string;

	// Validate testCases fixes if present
	if (fixType === "testCases" || fixType === "both") {
		if (
			!parsed.fixes.testCases ||
			typeof parsed.fixes.testCases !== "object"
		) {
			throw new Error("testCases fixes required for this fixType");
		}
		if (!Array.isArray(parsed.fixes.testCases.updates)) {
			throw new Error("testCases.updates must be an array");
		}

		for (const update of parsed.fixes.testCases.updates) {
			if (typeof update.testIndex !== "number") {
				throw new Error("testIndex must be a number");
			}
			if (
				update.testIndex < 0 ||
				update.testIndex >= problem.tests.length
			) {
				throw new Error(
					`testIndex ${update.testIndex} is out of range (0-${
						problem.tests.length - 1
					})`
				);
			}
			if (update.input !== undefined && !Array.isArray(update.input)) {
				throw new Error("input must be an array");
			}
		}
	}

	// Validate passingCode fixes if present
	if (fixType === "passingCode" || fixType === "both") {
		if (
			!parsed.fixes.passingCode ||
			typeof parsed.fixes.passingCode !== "object"
		) {
			throw new Error(
				`passingCode fixes required for fixType "${fixType}". Received: ${JSON.stringify(
					parsed.fixes.passingCode
				)}`
			);
		}
		// Check for javascript property (case-insensitive check)
		const jsKey =
			Object.keys(parsed.fixes.passingCode).find(
				(k) => k.toLowerCase() === "javascript"
			) || "javascript";

		if (
			!parsed.fixes.passingCode[jsKey] ||
			typeof parsed.fixes.passingCode[jsKey] !== "string"
		) {
			throw new Error(
				`passingCode.javascript must be a string. Received keys: ${Object.keys(
					parsed.fixes.passingCode
				).join(", ")}`
			);
		}
		if (parsed.fixes.passingCode[jsKey].trim().length === 0) {
			throw new Error("passingCode.javascript cannot be empty");
		}
		// Normalize the key to "javascript"
		if (jsKey !== "javascript") {
			parsed.fixes.passingCode.javascript =
				parsed.fixes.passingCode[jsKey];
		}
	}

	if (!parsed.explanation || typeof parsed.explanation !== "string") {
		throw new Error("explanation must be a string");
	}

	return parsed as AIFixResponse;
}

/**
 * Test a proposed fix before applying it
 */
export async function testProposedFix(
	problemId: string,
	fix: AIFixResponse
): Promise<TestFixResult> {
	requireAdmin();

	try {
		const problem = await getAlgoProblem(problemId);
		if (!problem) {
			return {
				success: false,
				allTestsPass: false,
				testResults: [],
				error: "Problem not found",
			};
		}

		// Apply fixes to create a test version
		const testProblem: AlgoProblemDetail = { ...problem };

		// Apply test case fixes
		if (fix.fixType === "testCases" || fix.fixType === "both") {
			if (fix.fixes.testCases) {
				const updatedTests = [...testProblem.tests];
				for (const update of fix.fixes.testCases.updates) {
					const testCase = { ...updatedTests[update.testIndex] };
					if (update.input !== undefined) {
						testCase.input = update.input;
					}
					if (update.output !== undefined) {
						testCase.output = update.output;
					}
					updatedTests[update.testIndex] = testCase;
				}
				testProblem.tests = updatedTests;
			}
		}

		// Apply passingCode fixes
		if (fix.fixType === "passingCode" || fix.fixType === "both") {
			if (fix.fixes.passingCode) {
				testProblem.passingCode = {
					...testProblem.passingCode,
					...fix.fixes.passingCode,
				};
			}
		}

		// Test with all languages that have passingCode
		const testResults: TestFixResult["testResults"] = [];
		let allPass = true;

		for (const language of problem.languages) {
			const passingCode = testProblem.passingCode[language];
			if (!passingCode) {
				continue;
			}

			const executionResult = await executeAlgoTests(
				testProblem,
				passingCode,
				language
			);

			if (executionResult.status === "error") {
				return {
					success: false,
					allTestsPass: false,
					testResults: [],
					error: executionResult.message || "Execution error",
				};
			}

			for (const result of executionResult.results) {
				testResults.push({
					case: result.case,
					passed: result.passed,
					input: result.input,
					expected: result.expected,
					actual: result.actual,
					error: result.error,
				});
				if (!result.passed) {
					allPass = false;
				}
			}
		}

		return {
			success: true,
			allTestsPass: allPass,
			testResults,
		};
	} catch (error) {
		return {
			success: false,
			allTestsPass: false,
			testResults: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Apply an approved fix to the database
 */
export async function applyProblemFix(
	problemId: string,
	fix: AIFixResponse
): Promise<{ success: boolean; error?: string }> {
	requireAdmin();

	try {
		const problem = await getAlgoProblem(problemId);
		if (!problem) {
			return { success: false, error: "Problem not found" };
		}

		// Get current problem from database
		const dbProblem = await prisma.algoProblem.findUnique({
			where: { id: problemId },
		});

		if (!dbProblem) {
			return { success: false, error: "Problem not found in database" };
		}

		// Build updated data
		const updatedData: any = {};

		// Apply test case fixes
		if (fix.fixType === "testCases" || fix.fixType === "both") {
			if (fix.fixes.testCases) {
				const tests = dbProblem.tests as {
					input: any[];
					output: any;
				}[];
				const updatedTests = [...tests];

				for (const update of fix.fixes.testCases.updates) {
					const testCase = { ...updatedTests[update.testIndex] };
					if (update.input !== undefined) {
						testCase.input = update.input;
					}
					if (update.output !== undefined) {
						testCase.output = update.output;
					}
					updatedTests[update.testIndex] = testCase;
				}

				updatedData.tests = updatedTests;
			}
		}

		// Apply passingCode fixes
		if (fix.fixType === "passingCode" || fix.fixType === "both") {
			if (fix.fixes.passingCode) {
				const passingCode = dbProblem.passingCode as {
					[key: string]: string;
				};
				updatedData.passingCode = {
					...passingCode,
					...fix.fixes.passingCode,
				};
			}
		}

		// Update database
		await prisma.algoProblem.update({
			where: { id: problemId },
			data: updatedData,
		});

		// Revalidate pages
		revalidatePath("/algorithms");
		revalidatePath("/algorithms/problems");
		revalidatePath(`/algorithms/problems/${problem.slug}`);
		revalidatePath("/admin/problems");
		revalidatePath("/admin/problems/test");

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
