/**
 * Admin AI Fix Prompts
 *
 * These prompts are used by admins to automatically fix algorithm problems
 * when test cases fail or code has bugs. The AI analyzes the problem and
 * determines what needs to be fixed (test cases, passing code, or both).
 */

import { AlgoProblemDetail } from "@/types/algorithm-types";

/**
 * System prompt for AI fix generation
 * Instructs the AI on how to analyze and fix problems
 */
export function getAIFixSystemPrompt(): string {
	return `You are an expert at fixing algorithm test cases and code. Analyze the problem and failed test cases, then determine what needs to be fixed. 

CRITICAL: Every test case must have exactly ONE correct answer. When fixing test cases, ensure the expected output is unique and unambiguous. If a test case could have multiple valid outputs, you must fix it to specify a single correct answer.

Return valid JSON.`;
}

/**
 * Build the user prompt for AI fix generation
 *
 * @param fixPrompt - The detailed fix analysis prompt
 * @returns Complete user prompt with JSON format instructions
 */
export function buildAIFixUserPrompt(fixPrompt: string): string {
	return `${fixPrompt}\n\nReturn JSON in this exact format:
{
  "fixType": "testCases" | "passingCode" | "secondaryPassingCode" | "both" | "bothCodes",
  "fixes": {
    "testCases": {
      "updates": [
        {"testIndex": 0, "input": [...], "output": ...}
      ]
    },
    "passingCode": {
      "javascript": "function name() { ... }"
    },
    "secondaryPassingCode": {
      "javascript": "function name() { ... }"
    }
  },
  "explanation": "Brief explanation of what was wrong and why"
}

CRITICAL RULES:
- If fixType is "testCases": MUST include "testCases" in fixes object
- If fixType is "passingCode": MUST include "passingCode" with "javascript" key in fixes object
- If fixType is "secondaryPassingCode": MUST include "secondaryPassingCode" with "javascript" key in fixes object
- If fixType is "both": MUST include BOTH "testCases" and "passingCode" in fixes object
- If fixType is "bothCodes": MUST include BOTH "passingCode" and "secondaryPassingCode" in fixes object
- testIndex is 0-based (first test case is 0)
- If fixing testCases, only include testIndex fields you're updating
- When fixing testCases, ensure each test case has EXACTLY ONE correct answer - no ambiguous expected outputs
- passingCode.javascript must be valid JavaScript code for the function
- Return ONLY the JSON object, no markdown, no code blocks, no explanations outside the JSON`;
}

/**
 * Build the detailed fix analysis prompt
 *
 * @param problem - The algorithm problem details
 * @param language - Programming language (e.g., "javascript")
 * @param failedTestCases - Array of failed test cases for primary code
 * @param secondaryFailedTestCases - Optional array of failed test cases for secondary code
 * @returns Detailed prompt for AI to analyze and fix
 */
export function buildFixPrompt(
	problem: AlgoProblemDetail,
	language: string,
	failedTestCases: Array<{
		case: number;
		input: any[];
		expected: any;
		actual?: any;
		error?: string;
	}>,
	secondaryFailedTestCases?: Array<{
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
	prompt += `Parameters: ${
		problem.parameters?.map((p) => `${p.name}: ${p.type}`).join(", ") ||
		"N/A"
	}\n\n`;

	prompt += `Current Passing Code (${language}) - PRIMARY:\n\`\`\`javascript\n${
		problem.passingCode[language] || "N/A"
	}\n\`\`\`\n\n`;

	if (problem.secondaryPassingCode?.[language]) {
		prompt += `Current Secondary Passing Code (${language}) - SECONDARY:\n\`\`\`javascript\n${problem.secondaryPassingCode[language]}\n\`\`\`\n\n`;
	}

	prompt += `All Test Cases (${problem.tests.length} total):\n`;
	problem.tests.forEach((test, index) => {
		prompt += `Test ${index}: Input=${JSON.stringify(
			test.input
		)}, Expected=${JSON.stringify(test.output)}\n`;
	});

	if (failedTestCases.length > 0) {
		prompt += `\nPRIMARY CODE Failed Test Cases (${failedTestCases.length} failures):\n`;
		failedTestCases.forEach((failed) => {
			prompt += `Test ${failed.case - 1} (0-indexed: ${
				failed.case - 1
			}):\n`;
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
	}

	if (secondaryFailedTestCases && secondaryFailedTestCases.length > 0) {
		prompt += `\nSECONDARY CODE Failed Test Cases (${secondaryFailedTestCases.length} failures):\n`;
		prompt += `NOTE: Secondary code is supposed to be a non-optimal but correct solution that PASSES all tests.\n`;
		prompt += `If secondary code fails tests, it means the test cases are too strict and reject valid solutions.\n\n`;
		secondaryFailedTestCases.forEach((failed) => {
			prompt += `Test ${failed.case - 1} (0-indexed: ${
				failed.case - 1
			}):\n`;
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
	}

	prompt += `\nTask: Analyze these failures and determine what needs to be fixed.
- If test cases are wrong (wrong expected output for valid inputs), fix the testCases
- If the PRIMARY passingCode has bugs, fix the passingCode
- If the SECONDARY passingCode has bugs or fails tests, fix the secondaryPassingCode
- If both primary and secondary codes have issues, fix bothCodes
- If test cases AND code have issues, fix both

CRITICAL REQUIREMENT: Test cases must have UNIQUE expected outputs.
- Each test case input must have exactly ONE correct answer
- If a test case could have multiple valid outputs, you MUST fix it to have a single unambiguous expected output
- When fixing test cases, verify that the expected output is the ONLY correct answer for that input
- Consider edge cases: arrays/objects should have specific ordering, numerical results should be precise, etc.

Most commonly, the issue is with test cases having incorrect expected outputs or ambiguous expected outputs.
Return JSON with the fixes.`;

	return prompt;
}
