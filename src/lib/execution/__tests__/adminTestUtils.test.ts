import {
	validatePassingCode,
	validateAllPassingCodes,
} from "../adminTestUtils";
import { algoProblems } from "@/features/algorithms/data/problems/algoProblems";

describe("Admin Test Utils", () => {
	it("should validate passingCode for Two Sum problem", async () => {
		const twoSumProblem = algoProblems.find((p) => p.id === "two-sum");
		expect(twoSumProblem).toBeDefined();

		if (twoSumProblem) {
			const result = await validatePassingCode(twoSumProblem);

			expect(result.isValid).toBe(true);
			expect(result.results).toHaveLength(1);
			expect(result.results[0].language).toBe("javascript");
			expect(result.results[0].passed).toBe(true);
		}
	});

	it("should validate passingCode for Valid Palindrome problem", async () => {
		const palindromeProblem = algoProblems.find(
			(p) => p.id === "valid-palindrome"
		);
		expect(palindromeProblem).toBeDefined();

		if (palindromeProblem) {
			const result = await validatePassingCode(palindromeProblem);

			expect(result.isValid).toBe(true);
			expect(result.results).toHaveLength(1);
			expect(result.results[0].language).toBe("javascript");
			expect(result.results[0].passed).toBe(true);
		}
	});

	it("should validate all problems' passingCode", async () => {
		const result = await validateAllPassingCodes(algoProblems);

		// All problems should have valid passingCode
		expect(result.invalidProblems).toHaveLength(0);
		expect(result.validProblems).toHaveLength(algoProblems.length);

		// Check that all problem IDs are in the valid list
		const expectedIds = algoProblems.map((p) => p.id);
		expect(result.validProblems).toEqual(
			expect.arrayContaining(expectedIds)
		);
	});
});
