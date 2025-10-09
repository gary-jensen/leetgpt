// import { Question, HtmlCssTest } from "@/types/course";

import { TestResult } from "../../temp-types";
import { Test } from "../../types/test-types";

const deepEqual = (a: any, b: any): boolean => {
	if (a === undefined && b === undefined) return true;
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return false;
		return a.every((v, i) => deepEqual(v, b[i]));
	}
	if (a && b && typeof a === "object" && typeof b === "object") {
		const keysA = Object.keys(a);
		const keysB = Object.keys(b);
		if (keysA.length !== keysB.length) return false;
		return keysA.every((k) => deepEqual(a[k], b[k]));
	}
	return a === b;
};

// Helper to extract console.log information from code
interface ConsoleLogInfo {
	fullMatch: string;
	expression: string;
	startIndex: number;
}

const extractConsoleLogs = (code: string): ConsoleLogInfo[] => {
	const consoleLogs: ConsoleLogInfo[] = [];
	// Match console.log calls with proper handling of nested parentheses
	const regex = /console\s*\.\s*log\s*\(/g;
	let match;

	while ((match = regex.exec(code)) !== null) {
		const startIndex = match.index;
		let parenCount = 1;
		let i = regex.lastIndex;
		let expressionStart = i;

		// Find the matching closing parenthesis
		while (i < code.length && parenCount > 0) {
			if (code[i] === "(") parenCount++;
			else if (code[i] === ")") parenCount--;
			i++;
		}

		if (parenCount === 0) {
			const expression = code.substring(expressionStart, i - 1).trim();
			consoleLogs.push({
				fullMatch: code.substring(startIndex, i),
				expression,
				startIndex,
			});
		}
	}

	return consoleLogs;
};

// Helper function to check if a value should be treated as undefined
const isUndefinedMarker = (value: any): boolean => {
	return value === "__undefined__";
};

// Helper function to resolve expected value, converting undefined marker to actual undefined
const resolveExpectedValue = (expected: any): any => {
	if (expected === "__undefined__") {
		return undefined;
	}
	return expected;
};

// Helper function to get computed styles from HTML string
const getComputedStyles = (
	htmlString: string
): { [selector: string]: { [property: string]: string } } => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, "text/html");
	const styles: { [selector: string]: { [property: string]: string } } = {};

	// For now, we'll extract inline styles and stylesheet styles
	// In a real implementation, we'd need to compute styles properly
	const allElements = doc.querySelectorAll("*");

	allElements.forEach((element, index) => {
		const selector = `${element.tagName.toLowerCase()}${
			element.id ? `#${element.id}` : ""
		}${
			element.className
				? `.${element.className.split(" ").join(".")}`
				: ""
		}`;
		const computedStyle = (element as HTMLElement).style;
		const styleObj: { [property: string]: string } = {};

		for (let i = 0; i < computedStyle.length; i++) {
			const property = computedStyle[i];
			styleObj[property] = computedStyle.getPropertyValue(property);
		}

		if (Object.keys(styleObj).length > 0) {
			styles[selector] = styleObj;
		}
	});

	return styles;
};

// Helper function to check relative positioning
const checkRelativePosition = (
	doc: Document,
	targetSelector: string,
	relativeToSelector: string,
	position: "before" | "after" | "inside" | "outside"
): boolean => {
	const targetElements = doc.querySelectorAll(targetSelector);
	const relativeElements = doc.querySelectorAll(relativeToSelector);

	if (targetElements.length === 0 || relativeElements.length === 0) {
		return false;
	}

	const target = targetElements[0];
	const relative = relativeElements[0];

	switch (position) {
		case "before":
			return (
				(target.compareDocumentPosition(relative) &
					Node.DOCUMENT_POSITION_PRECEDING) !==
				0
			);
		case "after":
			return (
				(target.compareDocumentPosition(relative) &
					Node.DOCUMENT_POSITION_FOLLOWING) !==
				0
			);
		case "inside":
			return relative.contains(target);
		case "outside":
			return !relative.contains(target);
		default:
			return false;
	}
};

// Helper function to validate a single HTML/CSS test
// const validateSingleHtmlCssTest = (
// 	doc: Document,
// 	test: HtmlCssTest,
// 	htmlString: string
// ): boolean => {
// 	switch (test.type) {
// 		case "elementExists":
// 			const elements = doc.querySelectorAll(test.selector);
// 			if (elements.length === 0) return false;

// 			if (test.relativeTo && test.position) {
// 				return checkRelativePosition(
// 					doc,
// 					test.selector,
// 					test.relativeTo,
// 					test.position
// 				);
// 			}
// 			return true;

// 		case "cssProperty":
// 			const targetElements = doc.querySelectorAll(test.selector);
// 			if (targetElements.length === 0) return false;

// 			const element = targetElements[0] as HTMLElement;
// 			const computedStyle = element.style;
// 			const propertyValue = computedStyle.getPropertyValue(
// 				test.property!
// 			);

// 			if (test.value) {
// 				return propertyValue === test.value;
// 			}
// 			return propertyValue !== "";

// 		case "contentContains":
// 			const contentElements = doc.querySelectorAll(test.selector);
// 			if (contentElements.length === 0) return false;

// 			return Array.from(contentElements).some((element) =>
// 				element.textContent?.includes(test.content!)
// 			);

// 		case "attributeExists":
// 			const attrElements = doc.querySelectorAll(test.selector);
// 			if (attrElements.length === 0) return false;

// 			const attrElement = attrElements[0];
// 			if (test.attributeValue) {
// 				return (
// 					attrElement.getAttribute(test.attribute!) ===
// 					test.attributeValue
// 				);
// 			}
// 			return attrElement.hasAttribute(test.attribute!);

// 		case "relativePosition":
// 			return checkRelativePosition(
// 				doc,
// 				test.selector,
// 				test.relativeTo!,
// 				test.position!
// 			);

// 		default:
// 			return false;
// 	}
// };

// Helper function to validate HTML/CSS tests
// const validateHtmlCssTests = (
// 	htmlString: string,
// 	tests: HtmlCssTest[]
// ): boolean => {
// 	const parser = new DOMParser();
// 	const doc = parser.parseFromString(htmlString, "text/html");
// 	const computedStyles = getComputedStyles(htmlString);

// 	return tests.every((test) => {
// 		return validateSingleHtmlCssTest(doc, test, htmlString);
// 	});
// };

// export interface TestResult {
// 	passed: boolean;
// 	testIndex: number;
// }

export interface QuestionTestResult {
	overallPassed: boolean;
	individualResults: TestResult[];
}

// export const questionTest = (
// 	// question: Question,
// 	currentCode: string,
// 	currentChoice: string,
// 	result: any,
// 	logs: string[]
// ): boolean => {
// 	const detailedResult = questionTestDetailed(
// 		question,
// 		currentCode,
// 		currentChoice,
// 		result,
// 		logs
// 	);
// 	return detailedResult.overallPassed;
// };

export const questionTestDetailed = (
	// question: Question,
	tests: Test[],
	currentCode: string,
	// currentChoice: string,
	result: [any[], { name: string; value: any }[], any[]], // [testResults, tracked, calls]
	logs: string[]
): TestResult[] => {
	// Guard against undefined question
	// if (!question) {
	// 	return { overallPassed: false, individualResults: [] };
	// }

	// if (question.type === "multipleChoice") {
	// 	// Use new answerData structure if available, fallback to legacy answer
	// 	const correctAnswer = question.answerData?.html || question.answer;
	// 	const passed = currentChoice === correctAnswer;
	// 	return {
	// 		overallPassed: passed,
	// 		individualResults: [{ passed, testIndex: 0 }],
	// 	};
	// }

	// if (question.type === "htmlCssQuestion") {
	// 	// Use the HTML code as the currentCode for HTML/CSS questions
	// 	const htmlString = currentCode;

	// 	if (!question.tests || question.tests.length === 0) {
	// 		// If no tests defined, return false (for backward compatibility)
	// 		return { overallPassed: false, individualResults: [] };
	// 	}

	// 	const individualResults: TestResult[] = [];
	// 	const parser = new DOMParser();
	// 	const doc = parser.parseFromString(htmlString, "text/html");

	// 	question.tests.forEach((test, index) => {
	// 		let passed = false;
	// 		try {
	// 			passed = validateSingleHtmlCssTest(doc, test, htmlString);
	// 		} catch (error) {
	// 			console.error("Error validating HTML/CSS test:", error);
	// 			passed = false;
	// 		}
	// 		individualResults.push({ passed, testIndex: index });
	// 	});

	// 	const overallPassed = individualResults.every((r) => r.passed);
	// 	return { overallPassed, individualResults };
	// }

	// if (!Array.isArray(result)) {
	// 	return { overallPassed: false, individualResults: [] };
	// }

	const individualResults: TestResult[] = [];

	// Extract all console.log calls from the code for index-based matching
	const consoleLogs = extractConsoleLogs(currentCode);

	// Track console test indices for index-based matching
	let consoleTestIndex = 0;

	tests?.forEach((test, index) => {
		const testResult = result[0][index]; // First element is the test results array
		let passed = false;

		switch (test.type) {
			case "function":
				if (!Array.isArray(testResult)) {
					passed = false;
					break;
				}

				passed = testResult.every((testCaseResult, i) => {
					const testCase = test.testCases![i];

					// Check if function was not found
					if (
						testCaseResult.result &&
						typeof testCaseResult.result === "object" &&
						testCaseResult.result.__functionNotFound
					) {
						// Function doesn't exist - this test should fail
						return false;
					}

					// Check console tests if present
					let consoleTestPassed = true;
					if (testCase.consoleTest) {
						const logs = testCaseResult.logs || [];
						const expectedOutput =
							testCase.consoleTest.expectedOutput;

						if (testCase.consoleTest.negated) {
							// When negated, ensure NONE of the patterns are found in the logs
							consoleTestPassed = expectedOutput.every(
								(pattern) => {
									const matchFound = logs.some(
										(log: string) => {
											const patternStr = String(pattern);
											const regex = new RegExp(
												patternStr.replace(
													/[.*+?^${}()|[\]\\]/g,
													"\\$&"
												)
											);
											return regex.test(log);
										}
									);
									return !matchFound; // Return true if no match found
								}
							);
						} else {
							// Normal behavior: Each expectedOutput pattern must be found in logs
							consoleTestPassed = expectedOutput.every(
								(pattern) => {
									const matchIndex = logs.findIndex(
										(log: string) => {
											const patternStr = String(pattern);
											const regex = new RegExp(
												patternStr.replace(
													/[.*+?^${}()|[\]\\]/g,
													"\\$&"
												)
											);
											return regex.test(log);
										}
									);
									return matchIndex !== -1; // Return true if match found
								}
							);
						}
					}

					// Check output tests if present
					let outputTestPassed = true;
					if (testCase.output !== undefined) {
						outputTestPassed =
							testCaseResult.result === testCase.output;
					}

					// If neither consoleTest nor output is defined, this is invalid
					if (
						testCase.consoleTest === undefined &&
						testCase.output === undefined
					) {
						return false;
					}

					// Both tests must pass (if both are present)
					return consoleTestPassed && outputTestPassed;
				});
				break;
			case "variableAssignment":
				// Check if we have the marker object
				if (testResult && testResult.__variableAssignmentTest) {
					// Extract tracked array from old system result structure: [testResults, tracked, calls]
					const tracked = result[1];

					// Find the FIRST tracked value for this variable
					const firstAssignment = tracked?.find(
						(t) => t.name === test.variableName
					);

					if (!firstAssignment) {
						// Variable was never assigned
						passed = test.expectedValue!.expected === undefined;
					} else {
						// Check the first assignment value
						let actualValue = firstAssignment.value;

						// Convert serialized values back to actual values
						if (actualValue === "__undefined__") {
							actualValue = undefined;
						} else if (actualValue === "__null__") {
							actualValue = null;
						}

						// Handle special case for checking undefined values
						if (isUndefinedMarker(test.expectedValue!.expected)) {
							passed = actualValue === undefined;
						} else if (test.expectedValue!.expected === "[0-9]+") {
							passed = typeof actualValue === "number";
						} else if (test.expectedValue!.expected === "[^0-9]+") {
							passed = new RegExp(
								test.expectedValue!.expected
							).test(actualValue);
						} else {
							passed = deepEqual(
								actualValue,
								test.expectedValue!.expected
							);
						}
					}
				} else {
					// Fallback to old behavior for backward compatibility
					// Get the specific variable value from the result object
					const variableValue =
						testResult && typeof testResult === "object"
							? (testResult as any)[test.variableName]
							: testResult;

					// Handle special case for checking undefined values
					if (isUndefinedMarker(test.expectedValue!.expected)) {
						passed = variableValue === undefined;
					} else if (test.expectedValue!.expected === "[0-9]+") {
						passed = typeof variableValue === "number";
					} else if (test.expectedValue!.expected === "[^0-9]+") {
						passed = new RegExp(test.expectedValue!.expected).test(
							variableValue
						);
					} else {
						passed = deepEqual(
							variableValue,
							test.expectedValue!.expected
						);
					}
				}
				break;
			case "consoleLogs":
				const logsCopy = [...logs]; // Don't modify original logs
				if (test.negated) {
					// When negated, ensure NONE of the patterns are found in the logs
					passed = test.expectedOutput.every((pattern) => {
						// Check if pattern is NOT found in any log
						const matchFound = logsCopy.some((ans) =>
							new RegExp(pattern).test(ans)
						);
						return !matchFound; // Return true if no match found (which is what we want when negated)
					});
				} else {
					// Normal behavior: Each passed expectedOutput removes that log from logs
					// So can test for multiple occurrences of same log
					passed = test.expectedOutput.every((pattern) => {
						// Find index of first log that matches the pattern
						const matchIndex = logsCopy.findIndex((ans) =>
							new RegExp(pattern).test(ans)
						);
						if (matchIndex === -1) {
							return false; // No match found for this pattern
						}
						// Remove the matched log from logs
						logsCopy.splice(matchIndex, 1);
						return true; // Match found for this pattern
					});
				}
				break;
			case "functionCall":
				const calls = result[result.length - 1] as {
					name: string;
					args: any[];
				}[];

				if (Array.isArray(test.expectedArgs)) {
					const actual = calls
						.filter((c) => c.name === test.functionName)
						.map((c) => c.args);

					const everyArgRight = test.expectedArgs.every((args, i) => {
						const act = actual[i] ?? [];

						// Determine format based on test structure:
						// 1. If expectedArgs.length matches expectedCount, it's likely new format
						//    (each element is an array of arguments for that call)
						// 2. If expectedArgs.length = 1 and expectedCount = 1, check deeper
						// 3. Otherwise, assume legacy format (direct arguments)

						let expectedArgsArray: any[] = [];

						if (
							test.expectedCount &&
							test.expectedArgs &&
							test.expectedArgs.length === test.expectedCount
						) {
							// New format: each element is an argument array for each call
							if (Array.isArray(args)) {
								expectedArgsArray = args;
							} else {
								// Single argument, wrap it
								expectedArgsArray = [args];
							}
						} else if (
							test.expectedCount === 1 &&
							test.expectedArgs &&
							test.expectedArgs.length === 1 &&
							i === 0
						) {
							// Ambiguous case: could be either format
							// Use the legacy behavior for backward compatibility
							if (Array.isArray(args)) {
								// This could be a legacy single array argument OR new format
								// Default to legacy (wrap the array as a single argument)
								expectedArgsArray = [args];
							} else {
								expectedArgsArray = [args];
							}
						} else if (test.expectedArgs) {
							// Legacy format: treat entire expectedArgs as arguments for first call
							if (i === 0) {
								expectedArgsArray = test.expectedArgs;
							} else {
								expectedArgsArray = [];
							}
						}

						const resolvedArgs =
							expectedArgsArray.map(resolveExpectedValue);
						const argsMatch = deepEqual(resolvedArgs, act);
						return argsMatch;
					});

					if (!everyArgRight) {
						passed = false;
						break;
					}
				}
				const count = calls.filter(
					(c) => c.name === test.functionName
				).length;
				passed = count === (test.expectedCount ?? 0);
				break;
			case "codeContains":
				const codeToCheck =
					test.caseSensitive !== false
						? currentCode
						: currentCode.toLowerCase();
				const patternToUse =
					test.caseSensitive !== false
						? test.pattern
						: test.pattern.toLowerCase();

				try {
					const regex = new RegExp(patternToUse);
					const matches = regex.test(codeToCheck);
					passed = test.negated ? !matches : matches;
				} catch (e) {
					// If regex is invalid, fall back to simple string contains
					const contains = codeToCheck.includes(patternToUse);
					passed = test.negated ? !contains : contains;
				}
				break;
			case "functionDeclaration":
				// Check that a function with the specified name and parameters exists
				const paramList = test.parameters.join("\\s*,\\s*");

				// Check function type preference
				if (test.functionType === "arrow") {
					// Only match arrow functions: const name = (params) => { ... }
					const arrowPattern = `\\bconst\\s+${test.functionName}\\s*=\\s*\\(\\s*${paramList}\\s*\\)\\s*=>`;
					try {
						const regex = new RegExp(arrowPattern);
						passed = regex.test(currentCode);
					} catch (e) {
						// Fallback to simple string contains if regex fails
						passed =
							currentCode.includes(`${test.functionName} = (`) &&
							currentCode.includes(`=>`);
					}
				} else if (test.functionType === "regular") {
					// Only match regular functions: function name(params) { ... }
					const regularPattern = `\\bfunction\\s+${test.functionName}\\s*\\(\\s*${paramList}\\s*\\)`;
					try {
						const regex = new RegExp(regularPattern);
						passed = regex.test(currentCode);
					} catch (e) {
						// Fallback to simple string contains if regex fails
						passed = currentCode.includes(
							`function ${test.functionName}(`
						);
					}
				} else {
					// Default: match either arrow or regular function
					const regularPattern = `\\bfunction\\s+${test.functionName}\\s*\\(\\s*${paramList}\\s*\\)`;
					const arrowPattern = `\\bconst\\s+${test.functionName}\\s*=\\s*\\(\\s*${paramList}\\s*\\)\\s*=>`;

					try {
						const regularRegex = new RegExp(regularPattern);
						const arrowRegex = new RegExp(arrowPattern);
						passed =
							regularRegex.test(currentCode) ||
							arrowRegex.test(currentCode);
					} catch (e) {
						// Fallback to simple string contains if regex fails
						passed =
							currentCode.includes(
								`function ${test.functionName}(`
							) ||
							(currentCode.includes(`${test.functionName} = (`) &&
								currentCode.includes(`=>`));
					}
				}
				break;
			case "consoleLogPattern":
				// Index-based matching: match this test to the nth console.log
				const consoleLogForTest = consoleLogs[consoleTestIndex];

				if (!consoleLogForTest) {
					// No console.log at this index
					passed = false;
				} else {
					// Check if the output at this index matches expected
					const outputMatches =
						logs[consoleTestIndex] === test.expectedOutput;

					// Check if the pattern matches (if specified)
					let patternMatches = true;
					if (test.pattern) {
						try {
							const regex = new RegExp(test.pattern);
							patternMatches = regex.test(
								consoleLogForTest.expression
							);
						} catch (e) {
							// Fallback to simple string contains if regex fails
							patternMatches =
								consoleLogForTest.expression.includes(
									String(test.pattern)
								);
						}
					}

					passed = outputMatches && patternMatches;
				}
				consoleTestIndex++;
				break;
			case "consoleLogVariable":
				// Index-based matching: match this test to the nth console.log
				const consoleLogVarForTest = consoleLogs[consoleTestIndex];

				if (!consoleLogVarForTest) {
					// No console.log at this index
					passed = false;
				} else {
					// Check if the output at this index matches expected
					const outputMatches =
						logs[consoleTestIndex] === test.expectedOutput;

					// Check if the variable is used in this console.log
					let variableUsed = true;
					if (test.variableName) {
						// Check if the expression contains the variable name
						// This is a simple check - for more complex expressions we might need better parsing
						variableUsed =
							consoleLogVarForTest.expression ===
								test.variableName ||
							consoleLogVarForTest.expression.includes(
								test.variableName
							);
					}

					passed = outputMatches && variableUsed;
				}
				consoleTestIndex++;
				break;
			case "variableReassignment":
				// Check both the final value and the assignment method
				let valueMatches = false;

				// Check the final value
				if (
					testResult === undefined &&
					test.expectedValue === undefined
				) {
					valueMatches = true;
				} else {
					valueMatches = deepEqual(testResult, test.expectedValue);
				}

				let methodMatches = true; // Default to true if no method specified
				if (test.method?.operator) {
					const { operator, operand } = test.method;
					let methodPattern = "";

					switch (operator) {
						case "+=":
							methodPattern =
								operand !== undefined
									? `${test.variable}\\s*\\+=\\s*${operand}`
									: `${test.variable}\\s*\\+=`;
							break;
						case "-=":
							methodPattern =
								operand !== undefined
									? `${test.variable}\\s*-=\\s*${operand}`
									: `${test.variable}\\s*-=`;
							break;
						case "*=":
							methodPattern =
								operand !== undefined
									? `${test.variable}\\s*\\*=\\s*${operand}`
									: `${test.variable}\\s*\\*=`;
							break;
						case "/=":
							methodPattern =
								operand !== undefined
									? `${test.variable}\\s*/=\\s*${operand}`
									: `${test.variable}\\s*/=`;
							break;
						case "++":
							methodPattern = `(${test.variable}\\s*\\+\\+|\\+\\+\\s*${test.variable})`;
							break;
						case "--":
							methodPattern = `(${test.variable}\\s*--|--\\s*${test.variable})`;
							break;
						case "=":
							methodPattern =
								operand !== undefined
									? `${test.variable}\\s*=\\s*${operand}`
									: `${test.variable}\\s*=\\s*[^=]`; // Match = followed by something that's not another =
							break;
					}

					if (methodPattern) {
						try {
							const methodRegex = new RegExp(methodPattern);
							methodMatches = methodRegex.test(currentCode);
						} catch (e) {
							// Fallback - just check if the variable appears in the code
							methodMatches = currentCode.includes(test.variable);
						}
					}
				}

				passed = valueMatches && methodMatches;
				break;
			case "ifStatement":
				// Pattern-based validation for if statements with optional else/else-if chains
				try {
					// Helper function to adjust backreference numbers in patterns
					const adjustBackreferences = (
						pattern: string,
						offset: number
					): string => {
						// Replace \1, \2, etc. with the correct numbers based on offset
						return pattern.replace(/\\(\d+)/g, (match, num) => {
							const newNum = parseInt(num) + offset;
							return `\\${newNum}`;
						});
					};

					// Helper function to count capturing groups in a pattern
					const countCapturingGroups = (pattern: string): number => {
						// Count non-escaped opening parentheses that aren't followed by ?
						const matches = pattern.match(/(?<!\\)\((?!\?)/g);
						return matches ? matches.length : 0;
					};

					// Build the complete regex pattern
					let fullPattern = `if\\s*\\([^)]*${test.pattern}[^)]*\\)\\s*\\{`;
					let currentGroupCount = countCapturingGroups(test.pattern);

					// Add if body pattern if provided
					if (test.bodyPattern) {
						const adjustedBodyPattern = adjustBackreferences(
							test.bodyPattern,
							currentGroupCount
						);
						fullPattern += `[^}]*${adjustedBodyPattern}[^}]*`;
						currentGroupCount += countCapturingGroups(
							test.bodyPattern
						);
					} else {
						fullPattern += `[^}]*`;
					}
					fullPattern += `\\}`;

					// Add else-if patterns
					if (test.elseIfPatterns && test.elseIfPatterns.length > 0) {
						for (const elseIf of test.elseIfPatterns) {
							const adjustedCondition = adjustBackreferences(
								elseIf.condition,
								currentGroupCount
							);
							fullPattern += `\\s*else\\s+if\\s*\\([^)]*${adjustedCondition}[^)]*\\)\\s*\\{`;
							currentGroupCount += countCapturingGroups(
								elseIf.condition
							);

							if (elseIf.body) {
								const adjustedElseIfBody = adjustBackreferences(
									elseIf.body,
									currentGroupCount
								);
								fullPattern += `[^}]*${adjustedElseIfBody}[^}]*`;
								currentGroupCount += countCapturingGroups(
									elseIf.body
								);
							} else {
								fullPattern += `[^}]*`;
							}
							fullPattern += `\\}`;
						}
					}

					// Add else pattern if provided
					if (test.elsePattern !== undefined) {
						fullPattern += `\\s*else\\s*\\{`;
						if (test.elsePattern) {
							const adjustedElsePattern = adjustBackreferences(
								test.elsePattern,
								currentGroupCount
							);
							fullPattern += `[^}]*${adjustedElsePattern}[^}]*`;
						} else {
							fullPattern += `[^}]*`;
						}
						fullPattern += `\\}`;
					}

					const fullRegex = new RegExp(fullPattern, "ms"); // multiline and dotall flags
					passed = fullRegex.test(currentCode);
				} catch (e) {
					// console.log("❌ ifStatement regex error:", e);
					// console.log("🔄 Falling back to simple 'if' check");
					// Fallback to simple string contains if regex fails
					passed = currentCode.includes("if");
				}
				break;
			case "forLoop":
				// Pattern-based validation for for loops
				try {
					const regex = new RegExp(test.pattern);
					passed = regex.test(currentCode);
				} catch (e) {
					// Fallback to simple string contains if regex fails
					passed = currentCode.includes("for");
				}
				break;
			default:
				passed = false;
		}

		individualResults.push({
			passed,
			test,
			code: currentCode,
			actualLogs: logs,
		});
	});

	return individualResults;
	// const overallPassed = individualResults.every((r) => r.passed);
	// return { overallPassed, individualResults };
};
