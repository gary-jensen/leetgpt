"use server";

import OpenAI from "openai";
import { TestResult } from "@/features/Workspace/temp-types";
import {
	validateJsonPayloadSize,
	sanitizeUserCode,
	validateCodeLength,
} from "@/lib/validation";
import {
	checkRateLimit,
	getRateLimitKey,
	getIPRateLimitKey,
	RATE_LIMITS,
} from "@/lib/rateLimit";
import { getClientIP } from "@/lib/serverUtils";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

interface AIFeedbackRequest {
	stepContent: string;
	testResults: TestResult[];
	userCode: string;
}

interface AIFeedbackResponse {
	feedback: string;
}

/**
 * Get AI feedback for user code based on test results
 * Allows both authenticated users and guests
 */
export async function getAIFeedback(
	request: AIFeedbackRequest
): Promise<AIFeedbackResponse> {
	try {
		// Rate limiting - get user info for rate limiting
		const { getSession } = await import("@/lib/auth");
		const session = await getSession();
		const userId = session?.user?.id;
		const clientIP = await getClientIP();

		// Rate limiting - user/guest based
		const userKey = getRateLimitKey(userId || null, null, "ai_feedback");
		const userRateLimit = checkRateLimit(
			userKey,
			RATE_LIMITS.AI_FEEDBACK.limit,
			RATE_LIMITS.AI_FEEDBACK.windowMs
		);

		if (!userRateLimit.allowed) {
			return {
				feedback: `Rate limit exceeded. Please try again in ${Math.ceil(
					(userRateLimit.resetTime - Date.now()) / 1000
				)} seconds.`,
			};
		}

		// Rate limiting - IP based
		if (clientIP) {
			const ipKey = getIPRateLimitKey(clientIP, "ai_feedback");
			const ipRateLimit = checkRateLimit(
				ipKey,
				RATE_LIMITS.AI_FEEDBACK_IP.limit,
				RATE_LIMITS.AI_FEEDBACK_IP.windowMs
			);

			if (!ipRateLimit.allowed) {
				return {
					feedback: `Rate limit exceeded. Please try again in ${Math.ceil(
						(ipRateLimit.resetTime - Date.now()) / 1000
					)} seconds.`,
				};
			}
		}

		// Check if code exists
		if (!request.userCode) {
			return {
				feedback:
					"No code provided. Please check the editor and try again!",
			};
		}

		// Validate code length
		if (!validateCodeLength(request.userCode)) {
			return {
				feedback:
					"Code is too long. Please keep it under 5000 characters.",
			};
		}

		// Validate payload size
		const payload = JSON.stringify(request);
		if (!validateJsonPayloadSize(payload)) {
			return {
				feedback: "Request too large. Please try with shorter code.",
			};
		}

		// Sanitize user code
		const sanitizedCode = sanitizeUserCode(request.userCode);
		if (!sanitizedCode) {
			return {
				feedback: "Invalid code provided. Please check your input.",
			};
		}

		const { stepContent, testResults } = request;

		// Check if there's a syntax error
		const hasSyntaxError =
			testResults[0]?.error &&
			testResults[0].error.includes("SyntaxError");

		// Create a prompt based on error type
		let prompt;
		if (hasSyntaxError) {
			prompt = `Code: ${sanitizedCode}
Error: ${testResults[0]?.error}

Give one sentence hint about the syntax error`;
		} else {
			// Format test information for better AI understanding
			const failedTest = testResults.find((test) => !test.passed);
			const test = failedTest?.test;

			// Create test-type-specific prompts
			let testInfo = "";
			if (test) {
				switch (test.type) {
					case "consoleLogs":
						const consoleLogs = failedTest.actualLogs || [];
						const expectedLogsStr = test.expectedOutput.join(", ");
						const actualLogsStr = consoleLogs.join(", ");
						const isNegated = test.negated || false;
						testInfo = `Test Type: Console Output
Expected logs: ${expectedLogsStr}
Actual logs: ${actualLogsStr}
${
	isNegated
		? "These patterns should NOT appear in the console output."
		: "The code should output these exact values to the console."
}`;
						break;
					case "variableAssignment":
						testInfo = `Test Type: Variable Assignment
Variable: ${test.variableName}
Expected value: ${JSON.stringify(test.expectedValue?.expected)}
Check the initial value assigned to this variable. 
(If expected value is __undefined__ means it needs to be declared but not defined, so don't say it's undefined, say it needs to be declared. Don't say anything about undefined.)`;
						break;
					case "consoleLogVariable":
						const consoleLogVarLogs = failedTest.actualLogs || [];
						const actualVarLogsStr = consoleLogVarLogs.join(", ");
						testInfo = `Test Type: Console Log Variable
Expected output: "${test.expectedOutput}"
Actual logs: ${actualVarLogsStr}
Variable: ${test.variableName || "a variable"}

The user should log a variable (not hardcode the value). Check if they're logging the variable ${
							test.variableName || "correctly"
						} or hardcoding "${test.expectedOutput}".`;
						break;
					case "consoleLogPattern":
						const actualLogs = failedTest.actualLogs || [];
						const actualPatternLogsStr = actualLogs.join(", ");

						// Handle pattern conversion more robustly
						let patternStr;
						if (typeof test.pattern === "string") {
							patternStr = test.pattern;
						} else if (test.pattern instanceof RegExp) {
							patternStr = test.pattern.toString();
						} else if (
							test.pattern &&
							typeof test.pattern === "object"
						) {
							// Try to extract from object properties
							const patternObj = test.pattern as any;
							patternStr =
								patternObj.source ||
								patternObj.pattern ||
								JSON.stringify(test.pattern);
						} else {
							patternStr = String(test.pattern);
						}

						// Final fallback
						if (
							patternStr === "[object Object]" ||
							patternStr === "{}"
						) {
							patternStr = "regex pattern (unable to display)";
						}

						testInfo = `Test Type: Console Log Pattern
TWO SEPARATE CHECKS:
1. PATTERN vs CODE: The pattern ${patternStr} must match the console.log() expression in the user's code: ${failedTest.code}
2. EXPECTED vs LOGS: The expected output "${test.expectedOutput}" must match the actual logged output: ${actualPatternLogsStr}

PATTERN ANALYSIS: The pattern ${patternStr} shows the EXACT format required for the console.log() expression.

Break down the pattern:
- (["']) means capture a quote (single or double)
- \\1 means use the same quote type as captured
- \\s*,\\s* means comma with optional spaces around it
- 123 is literal text that must appear

So if the pattern is /(["'])John Doe\\1\\s*,\\s*123/, the console.log() should look like:
console.log("John Doe", 123) or console.log('John Doe', 123)

Tell the user exactly what to change in their console.log() statement. Do not talk about the pattern. The user doesn't know what a pattern is, or what regex is. Give them specific dumbed down instructions only`;
						break;
					case "variableReassignment":
						testInfo = `Test Type: Variable Reassignment
Variable: ${test.variable}
Expected final value: ${JSON.stringify(test.expectedValue)}${
							test.method
								? `\nShould use: ${test.method.operator} ${
										test.method.operand
											? `by ${test.method.operand}. Prefer not to use the expected final value in your feedback (talk about the operator and operand instead).`
											: ""
								  }`
								: ""
						}`;
						break;
					case "function":
						const functionDetails = [];
						functionDetails.push(`Test Type: Function Test`);
						functionDetails.push(
							`Function name: ${test.functionName}`
						);

						if (test.testCases && test.testCases.length > 0) {
							functionDetails.push(`Test cases:`);
							test.testCases.forEach((testCase, index) => {
								functionDetails.push(
									`  ${index + 1}. Input: ${JSON.stringify(
										testCase.input
									)}`
								);
								if (testCase.output !== undefined) {
									functionDetails.push(
										`     Expected output: ${JSON.stringify(
											testCase.output
										)}`
									);
								}
								if (testCase.consoleTest) {
									functionDetails.push(
										`     Expected console output: ${JSON.stringify(
											testCase.consoleTest.expectedOutput
										)}`
									);
									if (testCase.consoleTest.negated) {
										functionDetails.push(
											`     (This output should NOT appear)`
										);
									}
								}
							});
						}

						functionDetails.push(`User's code: ${failedTest.code}`);
						functionDetails.push(
							`IMPORTANT: The function must be called with the test inputs and return the expected outputs. Check function logic, return statements, and console output if required.`
						);

						testInfo = functionDetails.join("\n");
						break;
					case "functionCall":
						const functionCallDetails = [];
						functionCallDetails.push(`Test Type: Function Call`);
						functionCallDetails.push(
							`Function name: ${test.functionName}`
						);

						if (test.expectedCount !== undefined) {
							functionCallDetails.push(
								`Expected number of calls: ${test.expectedCount}`
							);
						}

						if (test.expectedArgs && test.expectedArgs.length > 0) {
							functionCallDetails.push(
								`Expected arguments for each call:`
							);
							test.expectedArgs.forEach((args, index) => {
								functionCallDetails.push(
									`  Call ${index + 1}: ${JSON.stringify(
										args
									)}`
								);
							});
						}

						functionCallDetails.push(
							`User's code: ${failedTest.code}`
						);
						functionCallDetails.push(
							`IMPORTANT: Check that the function is called the correct number of times with the correct arguments. The function calls are tracked during execution.`
						);

						testInfo = functionCallDetails.join("\n");
						break;
					case "functionDeclaration":
						const functionDeclDetails = [];
						functionDeclDetails.push(
							`Test Type: Function Declaration`
						);
						functionDeclDetails.push(
							`Function name: ${test.functionName}`
						);

						if (test.parameters && test.parameters.length > 0) {
							functionDeclDetails.push(
								`Required parameters: [${test.parameters.join(
									", "
								)}]`
							);
						} else {
							functionDeclDetails.push(`No parameters required`);
						}

						if (test.functionType) {
							functionDeclDetails.push(
								`Function type: ${
									test.functionType === "arrow"
										? "Arrow function"
										: "Regular function"
								}`
							);
						}

						functionDeclDetails.push(
							`User's code: ${failedTest.code}`
						);
						functionDeclDetails.push(
							`IMPORTANT: Check that the function is declared with the correct name, parameters, and syntax. Use regex pattern matching to validate the function structure.`
						);

						testInfo = functionDeclDetails.join("\n");
						break;
					case "codeContains":
						const codeContainsDetails = [];
						codeContainsDetails.push(`Test Type: Code Pattern`);
						codeContainsDetails.push(`Pattern: ${test.pattern}`);

						if (test.caseSensitive !== undefined) {
							codeContainsDetails.push(
								`Case sensitive: ${
									test.caseSensitive ? "Yes" : "No"
								}`
							);
						}

						if (test.negated) {
							codeContainsDetails.push(
								`This pattern should NOT be found in the code`
							);
						} else {
							codeContainsDetails.push(
								`This pattern MUST be found in the code`
							);
						}

						codeContainsDetails.push(
							`User's code: ${failedTest.code}`
						);
						codeContainsDetails.push(
							`IMPORTANT: Use regex pattern matching to check if the pattern exists in the user's code. The pattern is a regular expression that must match the code structure.`
						);

						testInfo = codeContainsDetails.join("\n");
						break;
					case "ifStatement":
						const ifStatementDetails = [];
						ifStatementDetails.push(`Test Type: If Statement`);
						ifStatementDetails.push(
							`Main condition pattern: ${test.pattern}`
						);

						if (test.bodyPattern) {
							ifStatementDetails.push(
								`Expected body pattern: ${test.bodyPattern}`
							);
						}

						if (
							test.elseIfPatterns &&
							test.elseIfPatterns.length > 0
						) {
							ifStatementDetails.push(
								`Expected else-if conditions:`
							);
							test.elseIfPatterns.forEach((elseIf, index) => {
								ifStatementDetails.push(
									`  ${index + 1}. Condition: ${
										elseIf.condition
									}`
								);
								if (elseIf.body) {
									ifStatementDetails.push(
										`     Body: ${elseIf.body}`
									);
								}
							});
						}

						if (test.elsePattern !== undefined) {
							if (test.elsePattern) {
								ifStatementDetails.push(
									`Expected else body pattern: ${test.elsePattern}`
								);
							} else {
								ifStatementDetails.push(
									`Expected else block (no specific body pattern)`
								);
							}
						}

						ifStatementDetails.push(
							`User's code: ${failedTest.code}`
						);
						ifStatementDetails.push(
							`IMPORTANT: This test validates the complete if-else-if-else structure using regex patterns. Check that the condition syntax, braces, and overall structure match the expected patterns.`
						);

						testInfo = ifStatementDetails.join("\n");
						break;
					case "forLoop":
						const forLoopDetails = [];
						forLoopDetails.push(`Test Type: For Loop`);
						forLoopDetails.push(`Loop pattern: ${test.pattern}`);
						forLoopDetails.push(`User's code: ${failedTest.code}`);
						forLoopDetails.push(
							`IMPORTANT: Use regex pattern matching to validate the for loop structure. Check that the loop condition, initialization, and increment match the expected pattern.`
						);

						testInfo = forLoopDetails.join("\n");
						break;
					default:
						testInfo = `Test failed. Review the requirements.`;
				}
			}

			prompt = `${testInfo}

User Code:
${sanitizedCode}

Give one sentence hint about what needs to be fixed.`;
		}

		// Check if OpenAI API key is configured
		if (!process.env.OPENAI_API_KEY) {
			return {
				feedback:
					"AI feedback service is not available. Please try again later.",
			};
		}

		// Call OpenAI API with optimizations for speed
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"JavaScript coding tutor. Give specific and brief instructions",
				},
				{
					role: "user",
					content: prompt,
				},
			],
		});

		const aiResponse = completion.choices[0]?.message?.content;

		// Parse the JSON response from AI
		let feedback;
		try {
			const parsed = JSON.parse(aiResponse || "{}");
			feedback =
				parsed.feedback ||
				"Your code needs some adjustments. Try again!";
		} catch (error) {
			// If AI doesn't return valid JSON, use the raw response
			feedback =
				aiResponse || "Your code needs some adjustments. Try again!";
		}

		return { feedback };
	} catch (error) {
		console.error("Error processing AI feedback request:", error);
		return {
			feedback:
				"I'm sorry, I encountered an error while processing your request. Please try again.",
		};
	}
}
