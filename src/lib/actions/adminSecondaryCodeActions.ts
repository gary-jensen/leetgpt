"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAlgoProblem } from "@/features/algorithms/data";
import { executeAlgoTests } from "@/lib/execution/algoTestExecutor";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export interface ProblemQueueItem {
	id: string;
	slug: string;
	title: string;
	hasSecondaryCode: boolean;
}

/**
 * Get all problems that need secondary passing code
 */
export async function getProblemsNeedingSecondaryCode(): Promise<
	ProblemQueueItem[]
> {
	requireAdmin();

	try {
		const problems = await prisma.algoProblem.findMany({
			select: {
				id: true,
				slug: true,
				title: true,
				secondaryPassingCode: true,
			},
			orderBy: { order: "asc" },
		});

		return problems.map((problem) => ({
			id: problem.id,
			slug: problem.slug,
			title: problem.title,
			hasSecondaryCode:
				!!problem.secondaryPassingCode &&
				typeof problem.secondaryPassingCode === "object" &&
				Object.keys(problem.secondaryPassingCode as object).length > 0,
		}));
	} catch (error) {
		console.error("Error fetching problems:", error);
		return [];
	}
}

/**
 * Generate secondary passing code for a problem using AI
 * This should be a non-optimal but passing solution (e.g., O(n^2) instead of O(n))
 */
export async function generateSecondaryPassingCode(
	problemId: string
): Promise<{
	success: boolean;
	secondaryCode?: { [language: string]: string };
	error?: string;
}> {
	requireAdmin();

	try {
		const problem = await getAlgoProblem(problemId);
		if (!problem) {
			return { success: false, error: "Problem not found" };
		}

		// Build prompt for AI
		const prompt = buildSecondaryCodePrompt(problem);

		// Call OpenAI API
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content: `You are an expert at writing algorithm solutions. Generate a non-optimal but correct solution that passes all test cases. The solution should be intentionally suboptimal (e.g., O(n^2) instead of O(n), or using brute force instead of a more elegant approach).`,
				},
				{
					role: "user",
					content: `${prompt}\n\nReturn JSON in this exact format:
{
  "javascript": "function name() { /* non-optimal but correct solution */ }"
}

CRITICAL RULES:
- The code must be valid, executable JavaScript with NO syntax errors
- The code must pass ALL test cases for this problem
- The code should be intentionally non-optimal (worse time/space complexity than the optimal solution)
- Include the full function code, not just a snippet
- Use the exact function name and parameter names from the problem
- Ensure all brackets, parentheses, and braces are properly closed
- Do NOT include markdown formatting, code blocks, or comments outside the function
- Return ONLY the JSON object, no markdown, no code blocks, no explanations outside the JSON
- The JavaScript code must be a complete, runnable function that can be executed directly`,
				},
			],
			temperature: 0.3, // Lower temperature for more consistent code
		});

		const aiResponse = completion.choices[0]?.message?.content;
		if (!aiResponse) {
			return { success: false, error: "No response from AI" };
		}

		// Parse JSON (remove markdown code blocks if present)
		let secondaryCode: { [language: string]: string };
		try {
			let cleanedResponse = aiResponse.trim();
			// Remove markdown code blocks if present
			if (cleanedResponse.startsWith("```")) {
				cleanedResponse = cleanedResponse.replace(/^```(?:json)?\n?/, "");
				cleanedResponse = cleanedResponse.replace(/\n?```$/, "");
			}
			const parsed = JSON.parse(cleanedResponse);
			
			if (!parsed.javascript || typeof parsed.javascript !== "string") {
				return {
					success: false,
					error: "AI response must include 'javascript' field with string value",
				};
			}

			secondaryCode = parsed;
		} catch (error) {
			console.error("AI Response that failed validation:", aiResponse);
			return {
				success: false,
				error: `Invalid JSON response: ${
					error instanceof Error ? error.message : "Unknown error"
				}. Raw response logged to console.`,
			};
		}

		// Validate the code syntax before testing
		try {
			// Try to parse the code to check for syntax errors
			new Function(secondaryCode.javascript);
		} catch (syntaxError) {
			console.error("Generated code has syntax errors:", secondaryCode.javascript);
			return {
				success: false,
				error: `Generated code has syntax errors: ${
					syntaxError instanceof Error ? syntaxError.message : "Unknown syntax error"
				}. Code logged to console.`,
			};
		}

		// Validate that the secondary code actually passes all tests
		const testResult = await executeAlgoTests(
			problem,
			secondaryCode.javascript,
			"javascript"
		);

		if (testResult.status === "error") {
			console.error("Generated code execution error:", testResult.message);
			console.error("Generated code:", secondaryCode.javascript);
			return {
				success: false,
				error: `Generated code has execution errors: ${testResult.message}. Code logged to console.`,
			};
		}

		const allPassed = testResult.results.every((r) => r.passed);
		if (!allPassed) {
			// If it doesn't pass all tests, that indicates the test cases may be too strict
			// We should still save the code so the validation can show this issue
			const failedCount = testResult.results.filter(r => !r.passed).length;
			console.warn(
				`Warning: Generated secondary code failed ${failedCount} out of ${testResult.results.length} test cases for problem ${problemId}. This may indicate test cases are too strict. Code will be saved for validation.`
			);
			console.warn("Generated code:", secondaryCode.javascript);
			// Still return success - the validation in the test runner will show this
			return { success: true, secondaryCode };
		}

		return { success: true, secondaryCode };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Save secondary passing code to a problem
 */
export async function saveSecondaryPassingCode(
	problemId: string,
	secondaryCode: { [language: string]: string }
): Promise<{ success: boolean; error?: string }> {
	requireAdmin();

	try {
		await prisma.algoProblem.update({
			where: { id: problemId },
			data: {
				secondaryPassingCode: secondaryCode,
			},
		});

		revalidatePath("/admin/problems");
		revalidatePath("/admin/problems/secondary-code");

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Build prompt for generating secondary passing code
 */
function buildSecondaryCodePrompt(problem: any): string {
	let prompt = `Problem: ${problem.title}\n\n`;
	prompt += `Problem Statement:\n${problem.statementMd}\n\n`;

	if (problem.examplesAndConstraintsMd) {
		prompt += `Examples and Constraints:\n${problem.examplesAndConstraintsMd}\n\n`;
	}

	prompt += `Optimal Solution (for reference - DO NOT use this approach):\n`;
	prompt += `${problem.passingCode?.javascript || "N/A"}\n\n`;

	prompt += `Test Cases (${problem.tests.length} total):\n`;
	// Show first 3 test cases as examples
	problem.tests.slice(0, 3).forEach((test: any, i: number) => {
		prompt += `Test ${i + 1}: Input: ${JSON.stringify(test.input)}, Expected Output: ${JSON.stringify(test.output)}\n`;
	});
	prompt += `... (${problem.tests.length - 3} more test cases)\n\n`;

	prompt += `Requirements:\n`;
	prompt += `- Generate a NON-OPTIMAL but CORRECT solution\n`;
	prompt += `- The solution should pass all test cases\n`;
	prompt += `- Use a suboptimal approach (e.g., O(n^2) instead of O(n), brute force instead of elegant solution)\n`;
	prompt += `- Use the function name and parameter names from the starting code\n`;
	prompt += `- The code must be syntactically correct and runnable\n`;

	return prompt;
}
