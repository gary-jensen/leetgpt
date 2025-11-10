/**
 * AI Feedback Prompts
 * 
 * These prompts are used to provide AI-powered feedback to students
 * working on JavaScript coding exercises. The feedback is tailored
 * based on the type of test that failed.
 */

import { TestResult } from "@/features/Workspace/lesson-data/lesson-types";

/**
 * System prompt for AI feedback generation
 */
export function getAIFeedbackSystemPrompt(): string {
	return "JavaScript coding tutor. Give specific and brief instructions";
}

/**
 * Safely convert a pattern (string or RegExp) to a string for display
 */
function safePatternToString(pattern: string | RegExp): string {
	if (typeof pattern === "string") {
		return pattern;
	} else if (pattern && typeof pattern === "object") {
		try {
			if ("source" in pattern && typeof pattern.source === "string") {
				const flags = "flags" in pattern ? pattern.flags : "";
				return `/${pattern.source}/${flags}`;
			} else {
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
			try {
				return `[Pattern: ${JSON.stringify(pattern)}]`;
			} catch (jsonError) {
				return `[Pattern object: ${Object.keys(pattern).join(", ")}]`;
			}
		}
	} else {
		return String(pattern);
	}
}

/**
 * Build prompt for syntax error feedback
 * 
 * @param stepContent - The step/lesson content
 * @param sanitizedCode - The user's code (sanitized)
 * @param errorMessage - The error message from execution
 * @returns Formatted prompt for syntax error feedback
 */
export function buildSyntaxErrorPrompt(
	stepContent: string,
	sanitizedCode: string,
	errorMessage: string
): string {
	return `STEP CONTEXT:
${stepContent}

Code: ${sanitizedCode}
Error: ${errorMessage}

Give one sentence hint about the error`;
}

/**
 * Build prompt for test failure feedback
 * 
 * @param stepContent - The step/lesson content
 * @param sanitizedCode - The user's code (sanitized)
 * @param testResults - All test results (passed and failed)
 * @param failedTest - The first failed test result
 * @returns Formatted prompt for test failure feedback
 */
export function buildTestFailurePrompt(
	stepContent: string,
	sanitizedCode: string,
	testResults: TestResult[],
	failedTest: TestResult
): string {
	const test = failedTest.test;

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
					try {
						if (
							test.pattern.source &&
							typeof test.pattern.source === "string"
						) {
							patternStr = `/${test.pattern.source}/${
								test.pattern.flags || ""
							}`;
						} else {
							const patternObj = test.pattern as any;
							patternStr =
								patternObj.source ||
								patternObj.pattern ||
								JSON.stringify(test.pattern);
						}
					} catch (error) {
						patternStr = "regex pattern (unable to display)";
					}
				} else {
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
				functionDetails.push(`Function name: ${test.functionName}`);

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
				functionCallDetails.push(`Function name: ${test.functionName}`);

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
							`  Call ${index + 1}: ${JSON.stringify(args)}`
						);
					});
				}

				functionCallDetails.push(`User's code: ${failedTest.code}`);
				functionCallDetails.push(
					`IMPORTANT: Check that the function is called the correct number of times with the correct arguments. The function calls are tracked during execution.`
				);

				testInfo = functionCallDetails.join("\n");
				break;

			case "functionDeclaration":
				const functionDeclDetails = [];
				functionDeclDetails.push(`Test Type: Function Declaration`);
				functionDeclDetails.push(`Function name: ${test.functionName}`);

				if (test.parameters && test.parameters.length > 0) {
					functionDeclDetails.push(
						`Required parameters: [${test.parameters.join(", ")}]`
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

				functionDeclDetails.push(`User's code: ${failedTest.code}`);
				functionDeclDetails.push(
					`IMPORTANT: Check that the function is declared with the correct name, parameters, and syntax. Use regex pattern matching to validate the function structure.`
				);

				testInfo = functionDeclDetails.join("\n");
				break;

			case "codeContains":
				const codeContainsDetails = [];
				codeContainsDetails.push(`Test Type: Code Regex Pattern`);
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

				codeContainsDetails.push(`User's code: ${failedTest.code}`);
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

				ifStatementDetails.push(`User's code: ${failedTest.code}`);
				ifStatementDetails.push(
					`IMPORTANT: This test validates the complete if-else-if-else structure using regex patterns. Check that the condition syntax, braces, and overall structure match the expected patterns. Please understand how regex works before answering. Do not tell the user the pattern, or say the words pattern or regex. They don't know what that is`
				);

				testInfo = ifStatementDetails.join("\n");
				break;

			case "forLoop":
				const forLoopDetails = [];
				forLoopDetails.push(`Test Type: For Loop Regex Pattern`);
				forLoopDetails.push(
					`Loop regex pattern: ${safePatternToString(test.pattern)}`
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

	return `${testInfo}

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

