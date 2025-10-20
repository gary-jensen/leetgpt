"use server";

import OpenAI from "openai";
import { TestResult } from "@/features/Workspace/lesson-data/lesson-types";
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
import { getSession } from "../auth";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Safely convert a pattern (string or RegExp) to a string for display
 */
function safePatternToString(pattern: string | RegExp): string {
	// Since patterns are converted to strings before reaching the server,
	// this should always be a string, but we'll handle both cases for safety
	if (typeof pattern === "string") {
		return pattern;
	} else if (pattern && typeof pattern === "object") {
		try {
			// Check if it's a RegExp-like object (fallback for safety)
			if ("source" in pattern && typeof pattern.source === "string") {
				const flags = "flags" in pattern ? pattern.flags : "";
				return `/${pattern.source}/${flags}`;
			} else {
				// Try to extract from object properties
				const patternObj = pattern as any;
				if (patternObj.source) {
					return `/${patternObj.source}/${patternObj.flags || ""}`;
				} else if (patternObj.pattern) {
					return patternObj.pattern;
				} else if (
					patternObj.toString &&
					typeof patternObj.toString === "function"
				) {
					return patternObj.toString();
				} else {
					return JSON.stringify(pattern);
				}
			}
		} catch (error) {
			// Last resort - show what we can
			try {
				return `[Pattern: ${JSON.stringify(pattern)}]`;
			} catch (jsonError) {
				return `[Pattern object: ${Object.keys(pattern).join(", ")}]`;
			}
		}
	} else {
		// For primitive types, convert safely
		return String(pattern);
	}
}

interface AIFeedbackRequest {
	stepContent: string;
	testResults: TestResult[];
	userCode: string;
	isDemo?: boolean; // Flag to identify demo requests
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

		const session = await getSession();
		const userId = session?.user?.id;
		const clientIP = await getClientIP();

		// Determine if this is a demo request
		const isDemoRequest = request.isDemo || false;

		// Use different rate limits for demo vs production
		const rateLimitType = isDemoRequest
			? "demo_ai_feedback"
			: "ai_feedback";
		const userLimit = isDemoRequest
			? RATE_LIMITS.DEMO_AI_FEEDBACK
			: RATE_LIMITS.AI_FEEDBACK;
		const ipLimit = isDemoRequest
			? RATE_LIMITS.DEMO_AI_FEEDBACK_IP
			: RATE_LIMITS.AI_FEEDBACK_IP;

		// Rate limiting - user/guest based
		const userKey = getRateLimitKey(userId || null, null, rateLimitType);
		const userRateLimit = await checkRateLimit(
			userKey,
			userLimit.limit,
			userLimit.windowMs
		);

		if (!userRateLimit.allowed) {
			const timeRemaining = Math.ceil(
				(userRateLimit.resetTime - Date.now()) / 1000
			);
			const timeUnit = isDemoRequest
				? timeRemaining > 60
					? "minutes"
					: "seconds"
				: "seconds";
			const timeValue = isDemoRequest
				? timeRemaining > 60
					? Math.ceil(timeRemaining / 60)
					: timeRemaining
				: timeRemaining;

			return {
				feedback: `Rate limit exceeded. Please try again in ${timeValue} ${timeUnit}.`,
			};
		}

		// Rate limiting - IP based
		if (clientIP) {
			const ipKey = getIPRateLimitKey(clientIP, rateLimitType);
			const ipRateLimit = await checkRateLimit(
				ipKey,
				ipLimit.limit,
				ipLimit.windowMs
			);

			if (!ipRateLimit.allowed) {
				const timeRemaining = Math.ceil(
					(ipRateLimit.resetTime - Date.now()) / 1000
				);
				const timeUnit = isDemoRequest
					? timeRemaining > 60
						? "minutes"
						: "seconds"
					: "seconds";
				const timeValue = isDemoRequest
					? timeRemaining > 60
						? Math.ceil(timeRemaining / 60)
						: timeRemaining
					: timeRemaining;

				return {
					feedback: `Rate limit exceeded. Please try again in ${timeValue} ${timeUnit}.`,
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
		const hasSyntaxError = testResults.some((result) =>
			result.actualLogs?.some((log) => log.includes("Error:"))
		);

		// Create a prompt based on error type
		let prompt;
		if (hasSyntaxError) {
			// Find the first error message
			const errorResult = testResults.find((result) =>
				result.actualLogs?.some((log) => log.includes("Error:"))
			);
			const errorMessage =
				errorResult?.actualLogs?.find((log) =>
					log.includes("Error:")
				) || "Unknown syntax error";

			prompt = `STEP CONTEXT:
${stepContent}

Code: ${sanitizedCode}
Error: ${errorMessage}

Give one sentence hint about the error`;
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
Actual logs: ${actualVarLogsStr.length > 0 ? actualVarLogsStr : "No logs"}
Variable: ${test.variableName || "a variable"}

ANALYSIS: Check if the user is missing a console.log() statement for the variable ${
							test.variableName || "correctly"
						}, or if they're logging something else instead. The expected output "${
							test.expectedOutput
						}" should come from logging the variable, not hardcoding the value.`;
						break;
					case "consoleLogPattern":
						const actualLogs = failedTest.actualLogs || [];
						const actualPatternLogsStr = actualLogs.join(", ");

						// Handle pattern conversion more robustly
						let patternStr;
						if (typeof test.pattern === "string") {
							patternStr = test.pattern;
						} else if (
							test.pattern &&
							typeof test.pattern === "object"
						) {
							// Handle RegExp or other objects safely
							try {
								// Check if it's a RegExp-like object
								if (
									test.pattern.source &&
									typeof test.pattern.source === "string"
								) {
									patternStr = `/${test.pattern.source}/${
										test.pattern.flags || ""
									}`;
								} else {
									// Try to extract from object properties
									const patternObj = test.pattern as any;
									patternStr =
										patternObj.source ||
										patternObj.pattern ||
										JSON.stringify(test.pattern);
								}
							} catch (error) {
								// If any conversion fails, use a safe fallback
								patternStr =
									"regex pattern (unable to display)";
							}
						} else {
							// For primitive types, convert safely
							try {
								patternStr = String(test.pattern);
							} catch (error) {
								patternStr = "pattern (unable to display)";
							}
						}

						// Final fallback
						if (
							patternStr === "[object Object]" ||
							patternStr === "{}" ||
							!patternStr
						) {
							patternStr = "regex pattern (unable to display)";
						}

						testInfo = `Test Type: Console Log and Regex Pattern
TWO SEPARATE CHECKS:
1. PATTERN vs CODE: The pattern ${patternStr} must match the console.log() expression in the user's code: ${failedTest.code}
2. EXPECTED vs LOGS: The expected output "${test.expectedOutput}" must match the actual logged output: ${actualPatternLogsStr}

IMPORTANT: The pattern ${patternStr} shows the regex pattern should be INSIDE the console.log() parentheses, not what should be logged. expectedOutput is what should be logged. If the pattern is not matching, break down the pattern and find what is wrong


Break down the regex pattern into what it is actually checking, as the arguments in their console.log() statement. Do not tell the user the pattern, or say the words pattern or regex. They don't know what that is`;
						break;
					case "variableReassignment":
						testInfo = `Test Type: Variable Reassignment
Variable: ${test.variable}
Expected final value: ${JSON.stringify(test.expectedValue)}${
							test.method?.operator
								? `\nShould use operator: ${
										test.method.operator
								  } ${
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
						codeContainsDetails.push(
							`Test Type: Code Regex Pattern`
						);
						codeContainsDetails.push(
							`Regex Pattern: The code should contain the regex pattern ${safePatternToString(
								test.pattern
							)}`
						);

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
							`IMPORTANT: Use regex pattern matching to check if the pattern exists in the user's code. The pattern is a regular expression that must match the code structure. Please understand how regex works before answering. Do not tell the user the pattern, or say the words pattern or regex. They don't know what that is`
						);

						testInfo = codeContainsDetails.join("\n");
						break;
					case "ifStatement":
						const ifStatementDetails = [];
						ifStatementDetails.push(
							`Test Type: If Statement Regex Pattern`
						);
						ifStatementDetails.push(
							`Main condition regex pattern: ${safePatternToString(
								test.pattern
							)}`
						);

						if (test.bodyPattern) {
							ifStatementDetails.push(
								`Expected body regex pattern: ${safePatternToString(
									test.bodyPattern
								)}`
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
									`  ${
										index + 1
									}. Condition regex pattern: ${safePatternToString(
										elseIf.condition
									)}`
								);
								if (elseIf.body) {
									ifStatementDetails.push(
										`     Body regex pattern: ${safePatternToString(
											elseIf.body
										)}`
									);
								}
							});
						}

						if (test.elsePattern !== undefined) {
							if (test.elsePattern) {
								ifStatementDetails.push(
									`Expected else body regex pattern: ${safePatternToString(
										test.elsePattern
									)}`
								);
							} else {
								ifStatementDetails.push(
									`Expected else block (no specific body regex pattern)`
								);
							}
						}

						ifStatementDetails.push(
							`User's code: ${failedTest.code}`
						);
						ifStatementDetails.push(
							`IMPORTANT: This test validates the complete if-else-if-else structure using regex patterns. Check that the condition syntax, braces, and overall structure match the expected patterns. Please understand how regex works before answering. Do not tell the user the pattern, or say the words pattern or regex. They don't know what that is`
						);

						testInfo = ifStatementDetails.join("\n");
						break;
					case "forLoop":
						const forLoopDetails = [];
						forLoopDetails.push(
							`Test Type: For Loop Regex Pattern`
						);
						forLoopDetails.push(
							`Loop regex pattern: ${safePatternToString(
								test.pattern
							)}`
						);
						forLoopDetails.push(`User's code: ${failedTest.code}`);
						forLoopDetails.push(
							`IMPORTANT: Use regex pattern matching to validate the for loop structure. Check that the loop condition, initialization, and increment match the expected pattern. Please understand how regex works before answering. Do not tell the user the pattern, or say the words pattern or regex. They don't know what that is`
						);

						testInfo = forLoopDetails.join("\n");
						break;
					default:
						testInfo = `Test failed. Review the requirements.`;
				}
			}

			prompt = `${testInfo}

STEP CONTEXT:
${stepContent}${
				test?.hintAdvice
					? `

HINT ADVICE: ${test.hintAdvice}

`
					: ""
			}User Code:
${sanitizedCode}

ALL TEST RESULTS:
${JSON.stringify(
	testResults.map((test) => ({ test: test.test, passed: test.passed })),
	null,
	2
)}

IMPORTANT ANALYSIS RULES:
1. Look at ALL test results (both passed and failed) to understand what the user has done correctly vs what's missing
2. If a test is PASSED, the user's code is correct for that requirement - don't suggest changing it
3. If a test is FAILED, identify what's missing or incorrect

Give one sentence hint about what needs to be fixed to pass the first failed test. Only worry about one test at a time. All code, numbers, data, etc should be wrapped in a backtick \` for markdown formatting`;
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
		// console.error("Error processing AI feedback request:", error);
		return {
			feedback:
				"I'm sorry, I encountered an error while processing your request. Please try again.",
		};
	}
}
