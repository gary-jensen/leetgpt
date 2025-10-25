import {
	getAlgoProblems,
	getAlgoLessons,
	getAlgoProblem,
	getAlgoLesson,
	getAllTopics,
	getDifficultyLevels,
} from "../index";
import { algoProblems } from "../algoProblems";
import { algoLessons } from "../algoLessons";

// Mock the data files
jest.mock("../algoProblems", () => ({
	algoProblems: [
		{
			id: "two-sum",
			slug: "two-sum",
			title: "Two Sum",
			topics: ["arrays", "hashmap"],
			difficulty: "easy",
			languages: ["javascript"],
			statementMd: "Given an array...",
			rubric: { optimal_time: "O(n)", acceptable_time: ["O(n log n)"] },
			tests: [{ input: [[2, 7, 11, 15], 9], output: [0, 1] }],
			startingCode: { javascript: "function twoSum(nums, target) {}" },
		},
		{
			id: "valid-palindrome",
			slug: "valid-palindrome",
			title: "Valid Palindrome",
			topics: ["strings", "two-pointers"],
			difficulty: "easy",
			languages: ["javascript"],
			statementMd: "A phrase is a palindrome...",
			rubric: { optimal_time: "O(n)", acceptable_time: ["O(n)"] },
			tests: [
				{ input: ["A man, a plan, a canal: Panama"], output: true },
			],
			startingCode: { javascript: "function isPalindrome(s) {}" },
		},
	],
}));

jest.mock("../algoLessons", () => ({
	algoLessons: [
		{
			id: "hashmap-basics",
			slug: "hashmap-basics",
			title: "Hash Maps: The O(1) Lookup",
			summary: "Learn how hash maps provide constant-time lookups",
			topics: ["hashmap", "arrays"],
			difficulty: "easy",
			readingMinutes: 3,
			bodyMd: "# Hash Maps...",
		},
	],
}));

describe("Algorithm Data Functions", () => {
	describe("getAlgoProblems", () => {
		it("should return all problems when no filters applied", () => {
			const problems = getAlgoProblems();
			expect(problems).toHaveLength(2);
			expect(problems[0].title).toBe("Two Sum");
		});

		it("should filter by topic", () => {
			const problems = getAlgoProblems({ topic: "hashmap" });
			expect(problems).toHaveLength(1);
			expect(problems[0].title).toBe("Two Sum");
		});

		it("should filter by difficulty", () => {
			const problems = getAlgoProblems({ difficulty: "easy" });
			expect(problems).toHaveLength(2);
		});

		it("should filter by search term", () => {
			const problems = getAlgoProblems({ search: "palindrome" });
			expect(problems).toHaveLength(1);
			expect(problems[0].title).toBe("Valid Palindrome");
		});

		it("should return empty array when no matches", () => {
			const problems = getAlgoProblems({ topic: "nonexistent" });
			expect(problems).toHaveLength(0);
		});

		it("should combine multiple filters", () => {
			const problems = getAlgoProblems({
				topic: "arrays",
				difficulty: "easy",
			});
			expect(problems).toHaveLength(1);
			expect(problems[0].title).toBe("Two Sum");
		});
	});

	describe("getAlgoLessons", () => {
		it("should return all lessons when no filters applied", () => {
			const lessons = getAlgoLessons();
			expect(lessons).toHaveLength(1);
			expect(lessons[0].title).toBe("Hash Maps: The O(1) Lookup");
		});

		it("should filter by topic", () => {
			const lessons = getAlgoLessons({ topic: "hashmap" });
			expect(lessons).toHaveLength(1);
		});

		it("should filter by search term", () => {
			const lessons = getAlgoLessons({ search: "hash" });
			expect(lessons).toHaveLength(1);
		});
	});

	describe("getAlgoProblem", () => {
		it("should return problem by id", () => {
			const problem = getAlgoProblem("two-sum");
			expect(problem).toBeTruthy();
			expect(problem?.title).toBe("Two Sum");
		});

		it("should return null for non-existent problem", () => {
			const problem = getAlgoProblem("non-existent");
			expect(problem).toBeNull();
		});
	});

	describe("getAlgoLesson", () => {
		it("should return lesson by id", () => {
			const lesson = getAlgoLesson("hashmap-basics");
			expect(lesson).toBeTruthy();
			expect(lesson?.title).toBe("Hash Maps: The O(1) Lookup");
		});

		it("should return null for non-existent lesson", () => {
			const lesson = getAlgoLesson("non-existent");
			expect(lesson).toBeNull();
		});
	});

	describe("getAllTopics", () => {
		it("should return unique topics from problems and lessons", () => {
			const topics = getAllTopics();
			expect(topics).toContain("arrays");
			expect(topics).toContain("hashmap");
			expect(topics).toContain("strings");
			expect(topics).toContain("two-pointers");
		});

		it("should return sorted topics", () => {
			const topics = getAllTopics();
			const sortedTopics = [...topics].sort();
			expect(topics).toEqual(sortedTopics);
		});
	});

	describe("getDifficultyLevels", () => {
		it("should return all difficulty levels", () => {
			const levels = getDifficultyLevels();
			expect(levels).toEqual(["easy", "medium", "hard"]);
		});
	});
});
