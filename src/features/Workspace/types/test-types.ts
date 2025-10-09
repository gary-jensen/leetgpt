export interface TestCase {
	input: any;
	output?: any; // Made optional to support console-only tests
	consoleTest?: {
		expectedOutput: string[];
		negated?: boolean; // If true, ensures the patterns are NOT found in the logs
	};
}

export interface MockSubmission {
	code: string;
	shouldPass: boolean;
}

/**
 * Tests a function's behavior by calling it with various inputs and checking outputs.
 * Can also verify console output during function execution using consoleTest.
 * @example
 * {
 *   type: "function",
 *   functionName: "add",
 *   testCases: [{ input: [2, 3], output: 5 }]
 * }
 */
export interface FunctionTest {
	type: "function";
	functionName: string;
	testCases: TestCase[];
}

/**
 * Checks if a variable has a specific value at its initial assignment/declaration.
 * Tests the FIRST value assigned to the variable, not the final value.
 * Auto-generates hints based on the variable name and expected value.
 * @example
 * {
 *   type: "variableAssignment",
 *   variableName: "result",
 *   expectedValue: { expected: 42 },
 *   hint: "Make sure to calculate the total correctly"
 * }
 */
export interface VariableTest {
	type: "variableAssignment";
	variableName: string;
	expectedValue: { expected: any }; // Use object for easy Database integration
	// hint?: string; // Optional custom hint
}

/**
 * Checks console output against an array of regex patterns.
 * Each pattern must be found in the output (or NOT found if negated).
 * This is the recommended test type for all console output validation.
 * @example
 * {
 *   type: "consoleLogs",
 *   expectedOutput: ["Hello", "World"],
 *   hint: "Make sure to log both greetings"
 * }
 */
export interface ConsoleLogsTest {
	type: "consoleLogs";
	expectedOutput: string[];
	negated?: boolean; // If true, ensures the patterns are NOT found in the logs
	// hint?: string; // Optional manual hint
}

/**
 * Dual validation: checks both console output AND that a specific pattern
 * exists in the code. Uses index-based matching: the nth consoleLog test
 * matches the nth console.log call in the code.
 * More restrictive than consoleLogs.
 * @example
 * {
 *   type: "consoleLog",
 *   expectedOutput: "42",
 *   pattern: "answer",
 *   hint: "Log the answer variable"
 * }
 */
export interface ConsoleLogPatternTest {
	type: "consoleLogPattern";
	expectedOutput: string;
	pattern: string | RegExp;
	// hint: string; // Manual hint required
}

/**
 * Ensures that a variable (not a hardcoded value) is logged to console.
 * Uses index-based matching: the nth consoleLogVariable test matches the
 * nth console.log call in the code.
 * Useful for teaching students to log dynamic values.
 * Auto-generates hints based on variable name and expected output.
 * @example
 * {
 *   type: "consoleLogVariable",
 *   expectedOutput: "15",
 *   variableName: "sum"
 * }
 */
export interface ConsoleLogVariableTest {
	type: "consoleLogVariable";
	expectedOutput: string;
	variableName?: string; // Optional variable name
}

/**
 * Verifies that a function is called a specific number of times
 * with specific arguments. Does not check the function's output.
 * @example
 * {
 *   type: "functionCall",
 *   functionName: "greet",
 *   expectedCount: 2,
 *   expectedArgs: [["Alice"], ["Bob"]]
 * }
 */
export interface FunctionCallTest {
	type: "functionCall";
	functionName: string;
	expectedCount?: number;
	expectedArgs?: any[][];
}

/**
 * Checks if a regex pattern exists (or doesn't exist) in the student's code.
 * Useful for enforcing coding standards or specific syntax usage.
 * REQUIRES a manual hint to guide students.
 * @example
 * {
 *   type: "codeContains",
 *   pattern: "\\blet\\b",
 *   hint: "Use the 'let' keyword to declare variables"
 * }
 */
export interface CodeContainsTest {
	type: "codeContains";
	pattern: string;
	caseSensitive?: boolean;
	negated?: boolean;
	// hint?: string; // Optional for backward compatibility, will fallback to empty string
}

/**
 * Validates the structure of if statements using regex patterns.
 * Can check for specific conditions or general if statement presence.
 * Optionally validates the body content and else/else-if chains.
 * REQUIRES a manual hint.
 * @example
 * {
 *   type: "ifStatement",
 *   pattern: "score\\s*>\\s*90",
 *   bodyPattern: "console\\.log\\(.*A.*\\)",
 *   elseIfPatterns: [
 *     { condition: "score\\s*>\\s*80", body: "console\\.log\\(.*B.*\\)" }
 *   ],
 *   elsePattern: "console\\.log\\(.*F.*\\)",
 *   hint: "Use if-else-if-else to assign letter grades"
 * }
 */
export interface IfStatementTest {
	type: "ifStatement";
	pattern: string; // Main if condition pattern
	bodyPattern?: string; // Optional pattern to match inside the if block
	elseIfPatterns?: Array<{
		condition: string; // else-if condition pattern
		body?: string; // optional else-if body pattern
	}>;
	elsePattern?: string; // Optional pattern to match inside the final else block
	// hint: string; // Manual hint required
}

/**
 * Validates the structure of for loops using regex patterns.
 * Can check for specific loop conditions or general loop presence.
 * REQUIRES a manual hint.
 * @example
 * {
 *   type: "forLoop",
 *   pattern: "i\\s*<\\s*10",
 *   hint: "Create a loop that runs 10 times"
 * }
 */
export interface ForLoopTest {
	type: "forLoop";
	pattern: string;
	// hint: string; // Manual hint required
}

/**
 * Checks if a variable is reassigned to a specific value, optionally
 * verifying the assignment method (+=, -=, etc.).
 * Auto-generates hints based on the variable and method.
 * @example
 * {
 *   type: "variableReassignment",
 *   variable: "count",
 *   expectedValue: 8,
 *   method: { operator: "+=", operand: 3 }
 * }
 */
export interface VariableReassignmentTest {
	type: "variableReassignment";
	variable: string;
	expectedValue: any; // Can be any type (number, string, boolean, array, object, etc.)
	method?: {
		operator: "+=" | "-=" | "*=" | "/=" | "++" | "--" | "=";
		operand?: number | string;
	};
	// hint?: string; // Optional custom hint
}

/**
 * Verifies that a function is declared with the correct name and parameters.
 * Can optionally check if it's an arrow function or regular function.
 * Uses regex to match function structure.
 * @example
 * {
 *   type: "functionDeclaration",
 *   functionName: "calculateArea",
 *   parameters: ["length", "width"],
 *   functionType: "regular"
 * }
 */
export interface FunctionDeclarationTest {
	type: "functionDeclaration";
	functionName: string;
	parameters: string[];
	functionType?: "arrow" | "regular";
}

export type Test =
	| VariableTest
	| VariableReassignmentTest
	| ConsoleLogsTest
	| ConsoleLogPatternTest
	| ConsoleLogVariableTest
	| FunctionTest
	| FunctionDeclarationTest
	| FunctionCallTest
	| CodeContainsTest
	| IfStatementTest
	| ForLoopTest;
