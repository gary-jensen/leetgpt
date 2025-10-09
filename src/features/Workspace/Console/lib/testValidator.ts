// import { TestResult, ExecutionResult } from "./types";
// import { Test } from "../../types/test-types";

// export class TestValidator {
// 	// Deep equality checking utility (similar to old console system)
// 	private deepEqual(a: any, b: any): boolean {
// 		if (a === undefined && b === undefined) return true;
// 		if (a === null && b === null) return true;
// 		if (a === b) return true;

// 		if (Array.isArray(a) && Array.isArray(b)) {
// 			if (a.length !== b.length) return false;
// 			return a.every((v, i) => this.deepEqual(v, b[i]));
// 		}

// 		if (a && b && typeof a === "object" && typeof b === "object") {
// 			const keysA = Object.keys(a);
// 			const keysB = Object.keys(b);
// 			if (keysA.length !== keysB.length) return false;
// 			return keysA.every((k) => this.deepEqual(a[k], b[k]));
// 		}

// 		return false;
// 	}

// 	validateTests(
// 		tests: Test[],
// 		executionResult: ExecutionResult,
// 		code: string
// 	): TestResult[] {
// 		return tests.map((test) =>
// 			this.validateSingleTest(test, executionResult, code)
// 		);
// 	}

// 	private validateSingleTest(
// 		test: Test,
// 		executionResult: ExecutionResult,
// 		code: string
// 	): TestResult {
// 		switch (test.type) {
// 			case "consoleLogs":
// 				return this.validateConsoleTest(test, executionResult);

// 			case "function":
// 				return this.validateFunctionTest(test, executionResult);

// 			case "functionCall":
// 				return this.validateFunctionCallTest(test, executionResult);

// 			case "functionDeclaration":
// 				return this.validateFunctionDeclarationTest(test, code);

// 			case "codeContains":
// 				return this.validateCodeContainsTest(test, code);

// 			default:
// 				return {
// 					passed: false,
// 					testType: "unknown",
// 					message: `Unknown test type: ${(test as any).type}`,
// 				};
// 		}
// 	}

// 	private validateConsoleTest(
// 		test: Test & { type: "console" },
// 		result: ExecutionResult
// 	): TestResult {
// 		const logs = result.logs;
// 		const expectedOutputs = test.expectedOutput;
// 		const isNegated = test.negated || false;

// 		if (isNegated) {
// 			// For negated tests, ensure none of the expected outputs appear
// 			const foundForbiddenOutputs = expectedOutputs.filter((forbidden) =>
// 				logs.some((log) => log.includes(forbidden))
// 			);

// 			if (foundForbiddenOutputs.length > 0) {
// 				return {
// 					passed: false,
// 					testType: "console",
// 					expected: `None of: ${expectedOutputs.join(", ")}`,
// 					actual: logs,
// 					message: `Found forbidden output. Should not contain: ${foundForbiddenOutputs.join(
// 						", "
// 					)}, Got: ${logs.join(", ")}`,
// 				};
// 			}

// 			return {
// 				passed: true,
// 				testType: "console",
// 				expected: `None of: ${expectedOutputs.join(", ")}`,
// 				actual: logs,
// 				message: "No forbidden console outputs found",
// 			};
// 		} else {
// 			// Regular console test - check if all expected outputs are present
// 			const allFound = expectedOutputs.every((expected) =>
// 				logs.some((log) => log.includes(expected))
// 			);

// 			return {
// 				passed: allFound,
// 				testType: "console",
// 				expected: expectedOutputs,
// 				actual: logs,
// 				message: allFound
// 					? "All expected console outputs found"
// 					: `Missing expected output. Expected: ${expectedOutputs.join(
// 							", "
// 					  )}, Got: ${logs.join(", ")}`,
// 			};
// 		}
// 	}

// 	private validateFunctionTest(
// 		test: Test & { type: "function" },
// 		result: ExecutionResult
// 	): TestResult {
// 		try {
// 			// Get the function from tracked functions
// 			const trackedFunctions = result.tracked?.functions || {};
// 			const serializedFunction = trackedFunctions[test.functionName];

// 			if (!serializedFunction) {
// 				return {
// 					passed: false,
// 					testType: "function",
// 					expected: `Function ${test.functionName} to be declared`,
// 					actual: "Function not found",
// 					message: `Function '${test.functionName}' was not found. Make sure it's declared and available in global scope.`,
// 				};
// 			}

// 			// Recreate the function from the serialized format
// 			let targetFunction;
// 			try {
// 				if (serializedFunction.toString) {
// 					// Create function from string representation
// 					targetFunction = eval(`(${serializedFunction.toString})`);
// 				} else {
// 					// Fallback if it's already a function (shouldn't happen with new format)
// 					targetFunction = serializedFunction;
// 				}
// 			} catch (e) {
// 				return {
// 					passed: false,
// 					testType: "function",
// 					expected: `Function ${test.functionName} to be executable`,
// 					actual: "Function could not be recreated",
// 					message: `Function '${test.functionName}' could not be recreated from serialized format: ${e}`,
// 				};
// 			}

// 			const testResults = test.testCases.map((testCase, index) => {
// 				try {
// 					// Actually execute the function with the test inputs
// 					const actualResult = targetFunction.apply(
// 						null,
// 						testCase.input
// 					);

// 					// For regex pattern matching
// 					if (testCase.outputPattern) {
// 						try {
// 							const pattern = new RegExp(testCase.outputPattern);
// 							const actualString = String(actualResult);
// 							const matches = pattern.test(actualString);

// 							return {
// 								passed: matches,
// 								input: testCase.input,
// 								expected: testCase.outputPattern,
// 								actual: actualString,
// 								description:
// 									testCase.description ||
// 									`Test case ${index + 1}`,
// 							};
// 						} catch (e) {
// 							return {
// 								passed: false,
// 								input: testCase.input,
// 								expected: testCase.outputPattern,
// 								actual: "Invalid regex pattern",
// 								description:
// 									testCase.description ||
// 									`Test case ${index + 1}`,
// 							};
// 						}
// 					}

// 					// Check for negated output (console output that should NOT appear)
// 					if (
// 						testCase.negatedOutput &&
// 						testCase.negatedOutput.length > 0
// 					) {
// 						// For negated output, we need to capture console output during function execution
// 						// This is a simplified check - in a full implementation, we'd need to capture
// 						// console output specifically during this function call
// 						const logs = result.logs || [];
// 						const foundForbiddenOutput =
// 							testCase.negatedOutput.some((forbidden) =>
// 								logs.some((log) => log.includes(forbidden))
// 							);

// 						if (foundForbiddenOutput) {
// 							return {
// 								passed: false,
// 								input: testCase.input,
// 								expected: `No console output containing: ${testCase.negatedOutput.join(
// 									", "
// 								)}`,
// 								actual: `Found forbidden output in: ${logs.join(
// 									", "
// 								)}`,
// 								description:
// 									testCase.description ||
// 									`Test case ${index + 1} (negated output)`,
// 							};
// 						}
// 					}

// 					// Handle 'output' as console output and 'return' as return value
// 					if (testCase.output !== undefined) {
// 						// 'output' property checks console output during function execution
// 						const logs = result.logs || [];
// 						const expectedOutput = testCase.output;
// 						const outputFound = logs.some((log) =>
// 							log.includes(expectedOutput)
// 						);

// 						return {
// 							passed: outputFound,
// 							input: testCase.input,
// 							expected: `Console output containing: ${expectedOutput}`,
// 							actual: `Console logs: ${logs.join(", ")}`,
// 							description:
// 								testCase.description ||
// 								`Test case ${index + 1}`,
// 						};
// 					}

// 					// Handle 'return' property as return value
// 					if (testCase.return !== undefined) {
// 						const matches = this.deepEqual(
// 							actualResult,
// 							testCase.return
// 						);
// 						return {
// 							passed: matches,
// 							input: testCase.input,
// 							expected: testCase.return,
// 							actual: actualResult,
// 							description:
// 								testCase.description ||
// 								`Test case ${index + 1}`,
// 						};
// 					}

// 					// If we have negated output but no other criteria, pass if no forbidden output found
// 					if (
// 						testCase.negatedOutput &&
// 						testCase.negatedOutput.length > 0
// 					) {
// 						return {
// 							passed: true,
// 							input: testCase.input,
// 							expected: `No console output containing: ${testCase.negatedOutput.join(
// 								", "
// 							)}`,
// 							actual: actualResult,
// 							description:
// 								testCase.description ||
// 								`Test case ${index + 1} (negated output only)`,
// 						};
// 					}

// 					return {
// 						passed: false,
// 						input: testCase.input,
// 						expected: "No output criteria specified",
// 						actual: actualResult,
// 						description:
// 							testCase.description || `Test case ${index + 1}`,
// 					};
// 				} catch (executionError) {
// 					const expectedValue =
// 						testCase.output !== undefined
// 							? testCase.output
// 							: testCase.return;
// 					return {
// 						passed: false,
// 						input: testCase.input,
// 						expected: expectedValue || testCase.outputPattern,
// 						actual: `Error: ${executionError}`,
// 						description:
// 							testCase.description || `Test case ${index + 1}`,
// 					};
// 				}
// 			});

// 			const allPassed = testResults.every((tr) => tr.passed);
// 			const failedTests = testResults.filter((tr) => !tr.passed);

// 			return {
// 				passed: allPassed,
// 				testType: "function",
// 				expected: `Function ${test.functionName} to pass all test cases`,
// 				actual: testResults,
// 				message: allPassed
// 					? `Function '${test.functionName}' passed all ${testResults.length} test cases`
// 					: `Function '${test.functionName}' failed ${
// 							failedTests.length
// 					  }/${testResults.length} test cases. Failed: ${failedTests
// 							.map((f) => f.description)
// 							.join(", ")}`,
// 			};
// 		} catch (error) {
// 			return {
// 				passed: false,
// 				testType: "function",
// 				message: `Error testing function: ${error}`,
// 			};
// 		}
// 	}

// 	private validateFunctionCallTest(
// 		test: Test & { type: "functionCall" },
// 		result: ExecutionResult
// 	): TestResult {
// 		try {
// 			const functionCalls = result.tracked?.functionCalls || [];
// 			const matchingCalls = functionCalls.filter(
// 				(call) => call.name === test.functionName
// 			);

// 			// Check expected count
// 			const expectedCount = test.expectedCount ?? 0;
// 			const actualCount = matchingCalls.length;

// 			if (actualCount !== expectedCount) {
// 				return {
// 					passed: false,
// 					testType: "functionCall",
// 					expected: `${test.functionName} to be called ${expectedCount} times`,
// 					actual: `Called ${actualCount} times`,
// 					message: `Function '${test.functionName}' was called ${actualCount} times, expected ${expectedCount}`,
// 				};
// 			}

// 			// Check expected arguments if provided
// 			if (test.expectedArgs && test.expectedArgs.length > 0) {
// 				const allArgsMatch = test.expectedArgs.every(
// 					(expectedCallArgs, index) => {
// 						if (index >= matchingCalls.length) return false;
// 						const actualCallArgs = matchingCalls[index].args;

// 						// Use deep equality to compare argument arrays
// 						return this.deepEqual(actualCallArgs, expectedCallArgs);
// 					}
// 				);

// 				if (!allArgsMatch) {
// 					return {
// 						passed: false,
// 						testType: "functionCall",
// 						expected: `${test.functionName} to be called with specific arguments`,
// 						actual: JSON.stringify(
// 							matchingCalls.map((call) => call.args)
// 						),
// 						message: `Function '${
// 							test.functionName
// 						}' was called with incorrect arguments. Expected: ${JSON.stringify(
// 							test.expectedArgs
// 						)}, Got: ${JSON.stringify(
// 							matchingCalls.map((call) => call.args)
// 						)}`,
// 					};
// 				}
// 			}

// 			return {
// 				passed: true,
// 				testType: "functionCall",
// 				expected: `${test.functionName} called correctly`,
// 				actual: `Called ${actualCount} times with correct arguments`,
// 				message: `Function '${test.functionName}' was called correctly`,
// 			};
// 		} catch (error) {
// 			return {
// 				passed: false,
// 				testType: "functionCall",
// 				message: `Error validating function call: ${error}`,
// 			};
// 		}
// 	}

// 	private validateVariableTraceTest(
// 		test: Test & { type: "variableTrace" },
// 		result: ExecutionResult
// 	): TestResult {
// 		try {
// 			const variableTrace = result.tracked?.variableTrace || {};
// 			const actualSequence = variableTrace[test.variableName] || [];

// 			// Check if the sequence matches expected using deep equality
// 			const sequenceMatches =
// 				actualSequence.length === test.expectedSequence.length &&
// 				actualSequence.every((value, index) =>
// 					this.deepEqual(value, test.expectedSequence[index])
// 				);

// 			return {
// 				passed: sequenceMatches,
// 				testType: "variableTrace",
// 				expected: test.expectedSequence,
// 				actual: actualSequence,
// 				message: sequenceMatches
// 					? `Variable '${
// 							test.variableName
// 					  }' evolved correctly: ${JSON.stringify(
// 							test.expectedSequence
// 					  )}`
// 					: `Variable '${
// 							test.variableName
// 					  }' sequence mismatch. Expected: ${JSON.stringify(
// 							test.expectedSequence
// 					  )}, Got: ${JSON.stringify(actualSequence)}`,
// 			};
// 		} catch (error) {
// 			return {
// 				passed: false,
// 				testType: "variableTrace",
// 				message: `Error checking variable trace: ${error}`,
// 			};
// 		}
// 	}

// 	private validateFunctionDeclarationTest(
// 		test: Test & { type: "functionDeclaration" },
// 		code: string
// 	): TestResult {
// 		try {
// 			const paramList = test.parameters.join("\\s*,\\s*");

// 			// Check function type preference
// 			if (test.functionType === "arrow") {
// 				// Only match arrow functions: const name = (params) => { ... }
// 				const arrowPattern = `\\bconst\\s+${test.functionName}\\s*=\\s*\\(\\s*${paramList}\\s*\\)\\s*=>`;
// 				try {
// 					const regex = new RegExp(arrowPattern);
// 					const matches = regex.test(code);
// 					return {
// 						passed: matches,
// 						testType: "functionDeclaration",
// 						expected: `Arrow function ${
// 							test.functionName
// 						}(${test.parameters.join(", ")})`,
// 						actual: code,
// 						message: matches
// 							? `Arrow function '${test.functionName}' declared correctly`
// 							: `Arrow function '${
// 									test.functionName
// 							  }' not found. Expected: const ${
// 									test.functionName
// 							  } = (${test.parameters.join(", ")}) => { ... }`,
// 					};
// 				} catch (e) {
// 					return {
// 						passed: false,
// 						testType: "functionDeclaration",
// 						message: `Error validating arrow function: ${e}`,
// 					};
// 				}
// 			} else if (test.functionType === "regular") {
// 				// Only match regular functions: function name(params) { ... }
// 				const regularPattern = `\\bfunction\\s+${test.functionName}\\s*\\(\\s*${paramList}\\s*\\)`;
// 				try {
// 					const regex = new RegExp(regularPattern);
// 					const matches = regex.test(code);
// 					return {
// 						passed: matches,
// 						testType: "functionDeclaration",
// 						expected: `Regular function ${
// 							test.functionName
// 						}(${test.parameters.join(", ")})`,
// 						actual: code,
// 						message: matches
// 							? `Function '${test.functionName}' declared correctly`
// 							: `Function '${
// 									test.functionName
// 							  }' not found. Expected: function ${
// 									test.functionName
// 							  }(${test.parameters.join(", ")}) { ... }`,
// 					};
// 				} catch (e) {
// 					return {
// 						passed: false,
// 						testType: "functionDeclaration",
// 						message: `Error validating regular function: ${e}`,
// 					};
// 				}
// 			} else {
// 				// Default: match either arrow or regular function
// 				const regularPattern = `\\bfunction\\s+${test.functionName}\\s*\\(\\s*${paramList}\\s*\\)`;
// 				const arrowPattern = `\\bconst\\s+${test.functionName}\\s*=\\s*\\(\\s*${paramList}\\s*\\)\\s*=>`;

// 				try {
// 					const regularRegex = new RegExp(regularPattern);
// 					const arrowRegex = new RegExp(arrowPattern);
// 					const matches =
// 						regularRegex.test(code) || arrowRegex.test(code);

// 					return {
// 						passed: matches,
// 						testType: "functionDeclaration",
// 						expected: `Function ${
// 							test.functionName
// 						}(${test.parameters.join(", ")})`,
// 						actual: code,
// 						message: matches
// 							? `Function '${test.functionName}' declared correctly`
// 							: `Function '${
// 									test.functionName
// 							  }' not found. Expected: function ${
// 									test.functionName
// 							  }(${test.parameters.join(
// 									", "
// 							  )}) { ... } or const ${
// 									test.functionName
// 							  } = (${test.parameters.join(", ")}) => { ... }`,
// 					};
// 				} catch (e) {
// 					return {
// 						passed: false,
// 						testType: "functionDeclaration",
// 						message: `Error validating function declaration: ${e}`,
// 					};
// 				}
// 			}
// 		} catch (error) {
// 			return {
// 				passed: false,
// 				testType: "functionDeclaration",
// 				message: `Error checking function declaration: ${error}`,
// 			};
// 		}
// 	}

// 	private validateCodeContainsTest(
// 		test: Test & { type: "codeContains" },
// 		code: string
// 	): TestResult {
// 		try {
// 			// Create regex with appropriate flags
// 			const flags = test.caseSensitive === false ? "i" : "";
// 			const regex = new RegExp(test.pattern, flags);
// 			const matches = regex.test(code);

// 			return {
// 				passed: matches,
// 				testType: "codeContains",
// 				expected: test.pattern,
// 				actual: code,
// 				message: matches
// 					? `Code contains required pattern: ${test.pattern}`
// 					: `Code missing required pattern: ${test.pattern}`,
// 			};
// 		} catch (error) {
// 			// If regex is invalid, fall back to string contains
// 			const codeToCheck =
// 				test.caseSensitive !== false ? code : code.toLowerCase();
// 			const patternToCheck =
// 				test.caseSensitive !== false
// 					? test.pattern
// 					: test.pattern.toLowerCase();

// 			const contains = codeToCheck.includes(patternToCheck);

// 			return {
// 				passed: contains,
// 				testType: "codeContains",
// 				expected: test.pattern,
// 				actual: code,
// 				message: contains
// 					? `Code contains required pattern: ${test.pattern}`
// 					: `Code missing required pattern: ${test.pattern}`,
// 			};
// 		}
// 	}
// }
