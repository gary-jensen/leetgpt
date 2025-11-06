/**
 * Script to update test cases for "Remove Element" problem
 * Changes output from number (k) to array of elements not equal to val
 * 
 * Example:
 * Input: [[3,2,2,3], 3]
 * Old output: 2
 * New output: [2, 2]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateRemoveElementTestCases() {
	try {
		// Find the problem by slug
		const problem = await prisma.algoProblem.findUnique({
			where: { slug: "remove-element" },
		});

		if (!problem) {
			console.error('Problem with slug "remove-element" not found');
			process.exit(1);
		}

		console.log(`Found problem: ${problem.title} (ID: ${problem.id})`);

		// Get current test cases
		const tests = problem.tests as { input: any[]; output: any }[];
		console.log(`Found ${tests.length} test cases`);

		// Update each test case
		const updatedTests = tests.map((testCase, index) => {
			const [nums, val] = testCase.input;

			// Validate input format
			if (!Array.isArray(nums) || typeof val !== "number") {
				console.warn(
					`Test case ${index + 1} has invalid input format:`,
					testCase.input
				);
				return testCase; // Keep original if invalid
			}

			// Filter out all elements equal to val
			const filteredArray = nums.filter((num) => num !== val);

			console.log(
				`Test case ${index + 1}:`,
				`Input: [${nums.join(", ")}, ${val}]`,
				`Old output: ${testCase.output}`,
				`New output: [${filteredArray.join(", ")}]`
			);

			return {
				input: testCase.input,
				output: filteredArray,
			};
		});

		// Update the problem in the database
		await prisma.algoProblem.update({
			where: { id: problem.id },
			data: {
				tests: updatedTests as any,
			},
		});

		console.log(`\n✅ Successfully updated ${updatedTests.length} test cases`);
		console.log(
			`Updated problem: ${problem.title} (slug: ${problem.slug})`
		);
	} catch (error) {
		console.error("Error updating test cases:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// Run the script
updateRemoveElementTestCases();
