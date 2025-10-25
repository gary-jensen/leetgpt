import { questionTestDetailed } from "@/lib/execution/questionTest";

// Mock the test framework
jest.mock("@/lib/execution/questionTest", () => ({
	questionTestDetailed: jest.fn(),
}));

describe("Real Code Execution", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should execute correct two sum solution", async () => {
		const correctCode = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.has(complement)) {
            return [map.get(complement), i];
          }
          map.set(nums[i], i);
        }
      }
    `;

		const tests = [
			{
				id: "test-1",
				type: "function" as const,
				functionName: "twoSum",
				testCases: [
					{ input: [[2, 7, 11, 15], 9], output: [0, 1] },
					{ input: [[3, 2, 4], 6], output: [1, 2] },
				],
			},
		];

		// Mock successful execution
		(questionTestDetailed as jest.Mock).mockResolvedValue([
			{
				passed: true,
				actualLogs: ["[0, 1]"],
				error: null,
			},
			{
				passed: true,
				actualLogs: ["[1, 2]"],
				error: null,
			},
		]);

		const results = await questionTestDetailed(
			tests,
			correctCode,
			[[], [], [], {}],
			[]
		);

		expect(results).toHaveLength(2);
		expect(results[0].passed).toBe(true);
		expect(results[1].passed).toBe(true);
	});

	it("should fail with incorrect two sum solution", async () => {
		const incorrectCode = `
      function twoSum(nums, target) {
        return [0, 1]; // Always returns the same result
      }
    `;

		const tests = [
			{
				id: "test-1",
				type: "function" as const,
				functionName: "twoSum",
				testCases: [
					{ input: [[2, 7, 11, 15], 9], output: [0, 1] },
					{ input: [[3, 2, 4], 6], output: [1, 2] },
				],
			},
		];

		// Mock failed execution
		(questionTestDetailed as jest.Mock).mockResolvedValue([
			{
				passed: true,
				actualLogs: ["[0, 1]"],
				error: null,
			},
			{
				passed: false,
				actualLogs: ["[0, 1]"],
				error: "Expected [1, 2] but got [0, 1]",
			},
		]);

		const results = await questionTestDetailed(
			tests,
			incorrectCode,
			[[], [], [], {}],
			[]
		);

		expect(results).toHaveLength(2);
		expect(results[0].passed).toBe(true);
		expect(results[1].passed).toBe(false);
		expect(results[1].error).toBe("Expected [1, 2] but got [0, 1]");
	});

	it("should handle syntax errors", async () => {
		const syntaxErrorCode = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.has(complement)) {
            return [map.get(complement), i];
          }
          map.set(nums[i], i);
        }
        // Missing closing brace
    `;

		const tests = [
			{
				id: "test-1",
				type: "function" as const,
				functionName: "twoSum",
				testCases: [{ input: [[2, 7, 11, 15], 9], output: [0, 1] }],
			},
		];

		// Mock syntax error
		(questionTestDetailed as jest.Mock).mockRejectedValue(
			new Error("SyntaxError: Unexpected end of input")
		);

		await expect(
			questionTestDetailed(tests, syntaxErrorCode, [[], [], [], {}], [])
		).rejects.toThrow("SyntaxError: Unexpected end of input");
	});

	it("should handle runtime errors", async () => {
		const runtimeErrorCode = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const complement = target - nums[i];
          if (map.has(complement)) {
            return [map.get(complement), i];
          }
          map.set(nums[i], i);
        }
        throw new Error('No solution found');
      }
    `;

		const tests = [
			{
				id: "test-1",
				type: "function" as const,
				functionName: "twoSum",
				testCases: [{ input: [[2, 7, 11, 15], 9], output: [0, 1] }],
			},
		];

		// Mock runtime error
		(questionTestDetailed as jest.Mock).mockResolvedValue([
			{
				passed: false,
				actualLogs: [],
				error: "Error: No solution found",
			},
		]);

		const results = await questionTestDetailed(
			tests,
			runtimeErrorCode,
			[[], [], [], {}],
			[]
		);

		expect(results[0].passed).toBe(false);
		expect(results[0].error).toBe("Error: No solution found");
	});
});
