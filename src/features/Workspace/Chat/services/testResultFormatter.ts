import { TestResult } from "../../temp-types";

export interface FormattedTestInfo {
	testType: string;
	description: string;
	expected: string;
	actual: string;
}

/**
 * Formats a test result into human-readable information for AI feedback
 */
export const formatTestResultForAI = (
	testResult: TestResult
): FormattedTestInfo => {
	const test = testResult.test;

	switch (test.type) {
		case "consoleLogs":
			return {
				testType: "Console Output",
				description: test.negated
					? "Code should NOT log these patterns"
					: "Code should log specific outputs",
				expected: `Expected logs: ${JSON.stringify(
					test.expectedOutput
				)}`,
				actual: `Check console output in user code`,
			};

		case "consoleLogVariable":
			return {
				testType: "Console Log Variable",
				description: `Should log the variable ${
					test.variableName || "a variable"
				}`,
				expected: `Expected output: "${test.expectedOutput}"`,
				actual: `Variable should be logged, not hardcoded`,
			};

		case "consoleLogPattern":
			return {
				testType: "Console Log Pattern",
				description: "Specific console.log pattern required",
				expected: `Expected output: "${test.expectedOutput}" with pattern: ${test.pattern}`,
				actual: `Check the expression being logged`,
			};

		case "variableAssignment":
			return {
				testType: "Variable Assignment",
				description: `Variable '${test.variableName}' should have correct value`,
				expected: `Expected value: ${JSON.stringify(
					test.expectedValue.expected
				)}`,
				actual: `Check the initial assignment of '${test.variableName}'`,
			};

		case "variableReassignment":
			return {
				testType: "Variable Reassignment",
				description: `Variable '${test.variable}' should be reassigned`,
				expected: `Expected final value: ${JSON.stringify(
					test.expectedValue
				)}${
					test.method
						? ` using ${test.method.operator}${
								test.method.operand
									? ` ${test.method.operand}`
									: ""
						  }`
						: ""
				}`,
				actual: `Check how '${test.variable}' is modified`,
			};

		case "function":
			return {
				testType: "Function Test",
				description: `Function '${test.functionName}' should work correctly`,
				expected: `Function should pass all test cases with correct output`,
				actual: `Check function logic and return values`,
			};

		case "functionCall":
			return {
				testType: "Function Call",
				description: `Function '${test.functionName}' should be called`,
				expected: `Expected ${test.expectedCount || "some"} call(s)${
					test.expectedArgs
						? ` with args: ${JSON.stringify(test.expectedArgs)}`
						: ""
				}`,
				actual: `Check if function is being called correctly`,
			};

		case "functionDeclaration":
			return {
				testType: "Function Declaration",
				description: `Function '${test.functionName}' should be declared`,
				expected: `Parameters: [${test.parameters.join(", ")}]${
					test.functionType ? ` as ${test.functionType} function` : ""
				}`,
				actual: `Check function declaration syntax`,
			};

		case "codeContains":
			return {
				testType: "Code Pattern",
				description: test.negated
					? "Code should NOT contain this pattern"
					: "Code should contain specific syntax",
				expected: `Pattern: ${test.pattern}`,
				actual: test.negated
					? `Remove the forbidden pattern`
					: `Add the required pattern to your code`,
			};

		case "ifStatement":
			return {
				testType: "If Statement",
				description: "If statement structure validation",
				expected: `Condition pattern: ${test.pattern}${
					test.bodyPattern ? `, body: ${test.bodyPattern}` : ""
				}`,
				actual: `Check if statement condition and body`,
			};

		case "forLoop":
			return {
				testType: "For Loop",
				description: "For loop structure validation",
				expected: `Loop pattern: ${test.pattern}`,
				actual: `Check for loop syntax and condition`,
			};

		default:
			return {
				testType: "Unknown",
				description: "Test validation",
				expected: "Check test requirements",
				actual: "Review your code",
			};
	}
};

/**
 * Creates a comprehensive prompt for the AI based on test results
 */
export const createAIPrompt = (
	testResult: TestResult,
	userCode: string
): string => {
	const formatted = formatTestResultForAI(testResult);

	return `Test Type: ${formatted.testType}
Description: ${formatted.description}
${formatted.expected}
${formatted.actual}

User Code:
${userCode}

Give one sentence hint about what needs to be fixed.`;
};
