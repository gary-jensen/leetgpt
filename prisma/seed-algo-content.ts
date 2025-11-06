import { PrismaClient } from "@prisma/client";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
// import { algoProblems } from "../src/features/algorithms/data/problems/algoProblems"; // Removed - problems are now in database
import { algoLessons } from "../src/features/algorithms/data/algoLessons";

const prisma = new PrismaClient();

async function seedAlgoContent() {
	console.log("Starting algorithm content migration...");

	// Seed Problems
	// Note: Problems are now managed through the admin interface and database
	// Hardcoded algoProblems files have been removed
	/*
	console.log(`Migrating ${algoProblems.length} problems...`);
	for (const problem of algoProblems) {
		try {
			// Check if already exists
			const existing = await prisma.algoProblem.findUnique({
				where: { slug: problem.slug },
			});

			// Process markdown to HTML
			const statementHtml = await processMarkdown(problem.statementMd);

			if (existing) {
				console.log(`Updating ${problem.slug}...`);
				// Update existing problem
				await prisma.algoProblem.update({
					where: { slug: problem.slug },
					data: {
						id: problem.id, // Use hardcoded ID to match
						slug: problem.slug,
						title: problem.title,
						order: problem.order,
						statementMd: problem.statementMd,
						statementHtml,
						topics: problem.topics,
						difficulty: problem.difficulty,
						languages: problem.languages,
						rubric: problem.rubric,
						tests: problem.tests,
						startingCode: problem.startingCode,
						passingCode: problem.passingCode,
					},
				});
				console.log(`✓ Updated: ${problem.title}`);
				continue;
			}

			// Create in database with the same ID as hardcoded data
			await prisma.algoProblem.create({
				data: {
					id: problem.id, // Use hardcoded ID to match
					slug: problem.slug,
					title: problem.title,
					order: problem.order,
					statementMd: problem.statementMd,
					statementHtml,
					topics: problem.topics,
					difficulty: problem.difficulty,
					languages: problem.languages,
					rubric: problem.rubric,
					tests: problem.tests,
					startingCode: problem.startingCode,
					passingCode: problem.passingCode,
				},
			});

			console.log(`✓ Migrated: ${problem.title}`);
		} catch (error) {
			console.error(`✗ Failed to migrate ${problem.title}:`, error);
		}
	}
	*/

	// Seed Lessons
	console.log(`\nMigrating ${algoLessons.length} lessons...`);
	for (const lesson of algoLessons) {
		try {
			// Check if already exists
			const existing = await prisma.algoLesson.findUnique({
				where: { slug: lesson.slug },
			});

			if (existing) {
				console.log(`Skipping ${lesson.slug} - already exists`);
				continue;
			}

			// Process markdown to HTML
			const bodyHtml = await processMarkdown(lesson.bodyMd);

			// Create in database with the same ID as hardcoded data
			await prisma.algoLesson.create({
				data: {
					id: lesson.id, // Use hardcoded ID to match
					slug: lesson.slug,
					title: lesson.title,
					summary: lesson.summary,
					topics: lesson.topics,
					difficulty: lesson.difficulty,
					readingMinutes: lesson.readingMinutes,
					bodyMd: lesson.bodyMd,
					bodyHtml,
				},
			});

			console.log(`✓ Migrated: ${lesson.title}`);
		} catch (error) {
			console.error(`✗ Failed to migrate ${lesson.title}:`, error);
		}
	}

	console.log("\n✓ Migration complete!");
}

seedAlgoContent()
	.catch((e) => {
		console.error("Error seeding algorithm content:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
