/**
 * Secondary Code Generation Prompts
 *
 * These prompts are used to generate non-optimal but correct solutions
 * for algorithm problems. Secondary code is used for validation and
 * to ensure test cases accept multiple valid approaches.
 */

import { AlgoProblemDetail } from "@/types/algorithm-types";

/**
 * System prompt for secondary code generation
 */
export function getSecondaryCodeSystemPrompt(): string {
	return `You are an expert at writing algorithm solutions. Generate a non-optimal but correct solution that passes all test cases. The solution should be intentionally suboptimal (e.g., O(n^2) instead of O(n), or using brute force instead of a more elegant approach).`;
}

/**
 * Build user prompt for secondary code generation
 *
 * @param prompt - The detailed problem prompt
 * @returns Complete user prompt with JSON format instructions
 */
export function buildSecondaryCodeUserPrompt(prompt: string): string {
	return `${prompt}\n\nReturn JSON in this exact format:
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
- The JavaScript code must be a complete, runnable function that can be executed directly`;
}

/**
 * Build the detailed prompt for secondary code generation
 *
 * @param problem - The algorithm problem details
 * @returns Detailed prompt for generating secondary code
 */
export function buildSecondaryCodePrompt(problem: AlgoProblemDetail): string {
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
		prompt += `Test ${i + 1}: Input: ${JSON.stringify(
			test.input
		)}, Expected Output: ${JSON.stringify(test.output)}\n`;
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
