import { getHint, reviewOptimality } from "../algoCoach";
import { getAlgoProblem } from "@/features/algorithms/data";

// Mock the data function
jest.mock("@/features/algorithms/data", () => ({
	getAlgoProblem: jest.fn(),
}));

const mockProblem = {
	id: "two-sum",
	title: "Two Sum",
	statementMd: "Given an array of integers...",
	topics: ["hashmap", "arrays"],
	difficulty: "easy",
	rubric: { optimal_time: "O(n)", acceptable_time: ["O(n log n)"] },
};

describe("AlgoCoach Actions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(getAlgoProblem as jest.Mock).mockReturnValue(mockProblem);
	});

	describe("getHint", () => {
		it("should return hint for hashmap problem", async () => {
			const result = await getHint("two-sum");

			expect(result).toHaveProperty("message");
			expect(result).toHaveProperty("followUpQuestion");
			expect(result.message).toContain("hash map");
		});

		it("should return different hint based on failure summary", async () => {
			const result = await getHint(
				"two-sum",
				undefined,
				undefined,
				"undefined variable error"
			);

			expect(result.message).toContain("undefined");
		});

		it("should throw error for non-existent problem", async () => {
			(getAlgoProblem as jest.Mock).mockReturnValue(null);

			await expect(getHint("non-existent")).rejects.toThrow(
				"Problem not found"
			);
		});

		it("should return topic-based hint for different topics", async () => {
			const twoPointersProblem = {
				...mockProblem,
				topics: ["two-pointers"],
			};
			(getAlgoProblem as jest.Mock).mockReturnValue(twoPointersProblem);

			const result = await getHint("two-pointers-problem");

			expect(result.message).toContain("two pointers");
		});

		it("should handle sliding window problems", async () => {
			const slidingWindowProblem = {
				...mockProblem,
				topics: ["sliding-window"],
			};
			(getAlgoProblem as jest.Mock).mockReturnValue(slidingWindowProblem);

			const result = await getHint("sliding-window-problem");

			expect(result.message).toContain("window");
		});

		it("should provide generic hint for unknown topics", async () => {
			const unknownTopicProblem = {
				...mockProblem,
				topics: ["unknown-topic"],
			};
			(getAlgoProblem as jest.Mock).mockReturnValue(unknownTopicProblem);

			const result = await getHint("unknown-topic-problem");

			expect(result.message).toContain("step by step");
		});
	});

	describe("reviewOptimality", () => {
		it("should identify optimal O(n) solution with hash map", async () => {
			const optimalCode = `
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

			const result = await reviewOptimality(
				"two-sum",
				optimalCode,
				"javascript"
			);

			expect(result.isOptimal).toBe(true);
			expect(result.summary).toContain("O(n)");
		});

		it("should identify non-optimal O(n²) solution", async () => {
			const nonOptimalCode = `
        function twoSum(nums, target) {
          for (let i = 0; i < nums.length; i++) {
            for (let j = i + 1; j < nums.length; j++) {
              if (nums[i] + nums[j] === target) {
                return [i, j];
              }
            }
          }
        }
      `;

			const result = await reviewOptimality(
				"two-sum",
				nonOptimalCode,
				"javascript"
			);

			expect(result.isOptimal).toBe(false);
			expect(result.summary).toContain("O(n²)");
			expect(result.suggestion).toContain("hash map");
		});

		it("should identify two pointers solution", async () => {
			const twoPointersProblem = {
				...mockProblem,
				topics: ["two-pointers"],
				rubric: { optimal_time: "O(n)", acceptable_time: ["O(n)"] },
			};
			(getAlgoProblem as jest.Mock).mockReturnValue(twoPointersProblem);

			const twoPointersCode = `
        function twoSum(nums, target) {
          let left = 0;
          let right = nums.length - 1;
          while (left < right) {
            const sum = nums[left] + nums[right];
            if (sum === target) return [left, right];
            if (sum < target) left++;
            else right--;
          }
        }
      `;

			const result = await reviewOptimality(
				"two-pointers-problem",
				twoPointersCode,
				"javascript"
			);

			expect(result.isOptimal).toBe(true);
			expect(result.summary).toContain("two pointers");
		});

		it("should handle O(n log n) solutions", async () => {
			const sortingProblem = {
				...mockProblem,
				rubric: {
					optimal_time: "O(n log n)",
					acceptable_time: ["O(n log n)"],
				},
			};
			(getAlgoProblem as jest.Mock).mockReturnValue(sortingProblem);

			const sortingCode = `
        function twoSum(nums, target) {
          const sorted = nums.map((val, idx) => [val, idx]).sort((a, b) => a[0] - b[0]);
          // ... rest of implementation
        }
      `;

			const result = await reviewOptimality(
				"sorting-problem",
				sortingCode,
				"javascript"
			);

			expect(result.isOptimal).toBe(true);
			expect(result.summary).toContain("O(n log n)");
		});

		it("should throw error for non-existent problem", async () => {
			(getAlgoProblem as jest.Mock).mockReturnValue(null);

			await expect(
				reviewOptimality("non-existent", "some code", "javascript")
			).rejects.toThrow("Problem not found");
		});
	});
});
