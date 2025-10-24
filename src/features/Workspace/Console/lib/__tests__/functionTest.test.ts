import { FunctionTest } from "../../../types/test-types";

// Test data for function tests
export const testFunctionTest: FunctionTest = {
	type: "function",
	functionName: "add",
	testCases: [
		{
			input: [2, 3],
			output: 5,
		},
		{
			input: [10, -5],
			output: 5,
		},
		{
			input: [0, 0],
			output: 0,
		},
	],
};

export const testFunctionWithConsoleTest: FunctionTest = {
	type: "function",
	functionName: "debugFunction",
	testCases: [
		{
			input: [5],
			output: 25,
			consoleTest: {
				expectedOutput: ["Input: 5", "Calculating...", "Result: 25"],
			},
		},
	],
};

export const testFunctionWithMultipleParams: FunctionTest = {
	type: "function",
	functionName: "calculateArea",
	testCases: [
		{
			input: [5, 10], // length, width
			output: 50,
		},
		{
			input: [3.5, 7.2], // decimal inputs
			output: 25.2,
		},
	],
};

// Sample user code for testing
export const sampleUserCode = `
function add(a, b) {
  return a + b;
}

function debugFunction(x) {
  console.log("Input:", x);
  console.log("Calculating...");
  const result = x * x;
  console.log("Result:", result);
  return result;
}

function calculateArea(length, width) {
  return length * width;
}
`;

// Simple test to make this a valid test file
describe("FunctionTest Data", () => {
	test("should have valid test data structure", () => {
		expect(testFunctionTest.type).toBe("function");
		expect(testFunctionTest.functionName).toBe("add");
		expect(testFunctionTest.testCases).toHaveLength(3);
	});
});
