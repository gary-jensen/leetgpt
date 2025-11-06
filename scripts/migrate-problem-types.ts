/**
 * Migration script to infer and populate parameter types for existing problems
 * Run with: npx tsx scripts/migrate-problem-types.ts [--dry-run] [--verbose]
 */

import { PrismaClient } from "@prisma/client";
import { inferParameterTypes } from "../src/lib/utils/typeInference";
import { AlgoProblemDetail } from "../src/types/algorithm-types";

const prisma = new PrismaClient();

interface MigrationResult {
	problemId: string;
	slug: string;
	title: string;
	success: boolean;
	parameters?: any;
	returnType?: string;
	confidence: "high" | "medium" | "low";
	source: string;
	error?: string;
}

async function migrateProblemTypes(dryRun: boolean = true, verbose: boolean = false) {
	console.log(`\n${dryRun ? "DRY RUN: " : ""}Migrating problem types...\n`);

	const problems = await prisma.algoProblem.findMany({
		orderBy: { order: "asc" },
	});

	console.log(`Found ${problems.length} problems to migrate\n`);

	const results: MigrationResult[] = [];
	let successCount = 0;
	let errorCount = 0;
	let highConfidenceCount = 0;
	let mediumConfidenceCount = 0;
	let lowConfidenceCount = 0;

	for (const problem of problems) {
		try {
			// Convert to AlgoProblemDetail format
			const problemDetail: AlgoProblemDetail = {
				id: problem.id,
				slug: problem.slug,
				title: problem.title,
				topics: problem.topics,
				difficulty: problem.difficulty as "easy" | "medium" | "hard",
				languages: problem.languages,
				order: problem.order,
				statementMd: problem.statementMd,
				statementHtml: problem.statementHtml || null,
				examplesAndConstraintsMd:
					(problem as any).examplesAndConstraintsMd || null,
				examplesAndConstraintsHtml:
					(problem as any).examplesAndConstraintsHtml || null,
				rubric: problem.rubric as {
					optimal_time: string;
					acceptable_time: string[];
				},
				tests: problem.tests as { input: any[]; output: any }[],
				parameters: [], // Will be populated
				startingCode: problem.startingCode as {
					[key: string]: string;
				},
				passingCode: problem.passingCode as { [key: string]: string },
				secondaryPassingCode: (problem as any).secondaryPassingCode
					? ((problem as any).secondaryPassingCode as {
							[key: string]: string;
					  })
					: undefined,
				outputOrderMatters: (problem as any).outputOrderMatters ?? true,
			};

			// Infer types
			const inference = inferParameterTypes(problemDetail);

			// Update confidence counters
			if (inference.confidence === "high") highConfidenceCount++;
			else if (inference.confidence === "medium") mediumConfidenceCount++;
			else lowConfidenceCount++;

			if (verbose || inference.confidence === "low") {
				console.log(
					`${problem.slug}: ${inference.confidence} confidence (${inference.source})`
				);
				console.log(
					`  Parameters: ${JSON.stringify(inference.parameters)}`
				);
				if (inference.returnType) {
					console.log(`  Return: ${inference.returnType}`);
				}
			}

			// Update database (unless dry run)
			if (!dryRun) {
				await prisma.algoProblem.update({
					where: { id: problem.id },
					data: {
						parameters: inference.parameters as any,
						returnType: inference.returnType || null,
					},
				});
			}

			results.push({
				problemId: problem.id,
				slug: problem.slug,
				title: problem.title,
				success: true,
				parameters: inference.parameters,
				returnType: inference.returnType,
				confidence: inference.confidence,
				source: inference.source,
			});

			successCount++;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(`Error migrating ${problem.slug}: ${errorMessage}`);

			results.push({
				problemId: problem.id,
				slug: problem.slug,
				title: problem.title,
				success: false,
				confidence: "low",
				source: "error",
				error: errorMessage,
			});

			errorCount++;
		}
	}

	// Print summary
	console.log(`\n=== Migration Summary ===`);
	console.log(`Total problems: ${problems.length}`);
	console.log(`Success: ${successCount}`);
	console.log(`Errors: ${errorCount}`);
	console.log(`\nConfidence breakdown:`);
	console.log(`  High: ${highConfidenceCount} (${((highConfidenceCount / problems.length) * 100).toFixed(1)}%)`);
	console.log(`  Medium: ${mediumConfidenceCount} (${((mediumConfidenceCount / problems.length) * 100).toFixed(1)}%)`);
	console.log(`  Low: ${lowConfidenceCount} (${((lowConfidenceCount / problems.length) * 100).toFixed(1)}%)`);

	// Print low confidence problems for review
	const lowConfidence = results.filter((r) => r.confidence === "low");
	if (lowConfidence.length > 0) {
		console.log(`\n⚠️  Low confidence problems (${lowConfidence.length}) - Review recommended:`);
		lowConfidence.forEach((r) => {
			console.log(`  - ${r.slug}: ${r.source}`);
		});
	}

	// Print errors
	const errors = results.filter((r) => !r.success);
	if (errors.length > 0) {
		console.log(`\n❌ Errors (${errors.length}):`);
		errors.forEach((r) => {
			console.log(`  - ${r.slug}: ${r.error}`);
		});
	}

	return results;
}

// Run migration
const args = process.argv.slice(2);
const dryRun = !args.includes("--execute");
const verbose = args.includes("--verbose");

migrateProblemTypes(dryRun, verbose)
	.then(() => {
		console.log("\n✅ Migration complete");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n❌ Migration failed:", error);
		process.exit(1);
	})
	.finally(() => {
		prisma.$disconnect();
	});

