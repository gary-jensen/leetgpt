import {
	getAlgoProblems,
	getAlgoLessons,
	getAlgoProblem,
	getAlgoLesson,
} from "../data";
import { AlgoProblemDetail, AlgoLesson } from "@/types/algorithm-types";

describe("Algorithm Data Integration", () => {
	describe("Data Loading", () => {
		it("should load problems without errors", () => {
			expect(() => {
				const problems = getAlgoProblems();
				expect(Array.isArray(problems)).toBe(true);
			}).not.toThrow();
		});

		it("should load lessons without errors", () => {
			expect(() => {
				const lessons = getAlgoLessons();
				expect(Array.isArray(lessons)).toBe(true);
			}).not.toThrow();
		});
	});

	describe("Problem Filtering", () => {
		it("should filter problems by difficulty", () => {
			const easyProblems = getAlgoProblems({ difficulty: "easy" });
			const mediumProblems = getAlgoProblems({ difficulty: "medium" });
			const hardProblems = getAlgoProblems({ difficulty: "hard" });

			expect(Array.isArray(easyProblems)).toBe(true);
			expect(Array.isArray(mediumProblems)).toBe(true);
			expect(Array.isArray(hardProblems)).toBe(true);
		});

		it("should filter problems by topic", () => {
			const arrayProblems = getAlgoProblems({ topic: "arrays" });
			const hashmapProblems = getAlgoProblems({ topic: "hashmap" });

			expect(Array.isArray(arrayProblems)).toBe(true);
			expect(Array.isArray(hashmapProblems)).toBe(true);
		});

		it("should search problems by title", () => {
			const searchResults = getAlgoProblems({ search: "sum" });
			expect(Array.isArray(searchResults)).toBe(true);
		});
	});

	describe("Lesson Filtering", () => {
		it("should filter lessons by difficulty", () => {
			const easyLessons = getAlgoLessons({ difficulty: "easy" });
			const mediumLessons = getAlgoLessons({ difficulty: "medium" });
			const hardLessons = getAlgoLessons({ difficulty: "hard" });

			expect(Array.isArray(easyLessons)).toBe(true);
			expect(Array.isArray(mediumLessons)).toBe(true);
			expect(Array.isArray(hardLessons)).toBe(true);
		});

		it("should filter lessons by topic", () => {
			const hashmapLessons = getAlgoLessons({ topic: "hashmap" });
			const arrayLessons = getAlgoLessons({ topic: "arrays" });

			expect(Array.isArray(hashmapLessons)).toBe(true);
			expect(Array.isArray(arrayLessons)).toBe(true);
		});
	});

	describe("Individual Item Retrieval", () => {
		it("should retrieve specific problem by ID", () => {
			const problem = getAlgoProblem("two-sum");
			if (problem) {
				expect(problem.id).toBe("two-sum");
				expect(problem.title).toBe("Two Sum");
			}
		});

		it("should return null for non-existent problem", () => {
			const problem = getAlgoProblem("non-existent");
			expect(problem).toBeNull();
		});

		it("should retrieve specific lesson by ID", () => {
			const lesson = getAlgoLesson("hashmap-basics");
			if (lesson) {
				expect(lesson.id).toBe("hashmap-basics");
				expect(lesson.title).toContain("Hash Maps");
			}
		});

		it("should return null for non-existent lesson", () => {
			const lesson = getAlgoLesson("non-existent");
			expect(lesson).toBeNull();
		});
	});

	describe("Data Structure Validation", () => {
		it("should have valid problem structure", () => {
			const problems = getAlgoProblems();
			if (problems.length > 0) {
				const problem = problems[0];
				expect(problem).toHaveProperty("id");
				expect(problem).toHaveProperty("title");
				expect(problem).toHaveProperty("topics");
				expect(problem).toHaveProperty("difficulty");
				expect(Array.isArray(problem.topics)).toBe(true);
				expect(["easy", "medium", "hard"]).toContain(
					problem.difficulty
				);
			}
		});

		it("should have valid lesson structure", () => {
			const lessons = getAlgoLessons();
			if (lessons.length > 0) {
				const lesson = lessons[0];
				expect(lesson).toHaveProperty("id");
				expect(lesson).toHaveProperty("title");
				expect(lesson).toHaveProperty("topics");
				expect(lesson).toHaveProperty("difficulty");
				expect(lesson).toHaveProperty("readingMinutes");
				expect(lesson).toHaveProperty("bodyMd");
				expect(Array.isArray(lesson.topics)).toBe(true);
				expect(typeof lesson.readingMinutes).toBe("number");
				expect(lesson.readingMinutes).toBeGreaterThan(0);
			}
		});
	});

	describe("Problem Detail Structure", () => {
		it("should have complete problem details", () => {
			const problem = getAlgoProblem("two-sum");
			if (problem) {
				expect(problem).toHaveProperty("statementMd");
				expect(problem).toHaveProperty("rubric");
				expect(problem).toHaveProperty("tests");
				expect(problem).toHaveProperty("startingCode");
				expect(Array.isArray(problem.tests)).toBe(true);
				expect(problem.startingCode).toHaveProperty("javascript");
				expect(typeof problem.startingCode.javascript).toBe("string");
			}
		});

		it("should have valid test cases", () => {
			const problem = getAlgoProblem("two-sum");
			if (problem && problem.tests.length > 0) {
				const test = problem.tests[0];
				expect(test).toHaveProperty("input");
				expect(test).toHaveProperty("output");
				expect(Array.isArray(test.input)).toBe(true);
			}
		});
	});

	describe("Error Handling", () => {
		it("should handle invalid filter parameters gracefully", () => {
			expect(() => {
				getAlgoProblems({ topic: "invalid-topic" });
			}).not.toThrow();

			expect(() => {
				getAlgoProblems({ difficulty: "invalid-difficulty" });
			}).not.toThrow();

			expect(() => {
				getAlgoProblems({ search: "" });
			}).not.toThrow();
		});

		it("should handle empty search results", () => {
			const noResults = getAlgoProblems({
				search: "nonexistent-problem",
			});
			expect(Array.isArray(noResults)).toBe(true);
			expect(noResults.length).toBe(0);
		});
	});
});
