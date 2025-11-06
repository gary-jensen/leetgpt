"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TestCase } from "@/types/algorithm-types";
import { revalidatePath, revalidateTag } from "next/cache";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";

/**
 * Dedicated server action for revalidating paths
 * This is a public server action that can be called from client components
 * to revalidate algorithm-related pages after problem creation/updates
 *
 * This is called from the client after detecting builder completion,
 * ensuring revalidation happens in a separate server action context,
 * not during the builder's execution or during render.
 */
export async function revalidateAlgorithmPaths() {
	requireAdmin();

	revalidatePath("/algorithms");
	revalidatePath("/algorithms/problems");
	revalidateTag("algo:problems");
}

/**
 * Save problem to database
 * This server action handles the database save operation for completed problems
 */
export async function saveProblemToDatabase(
	problemData: {
		slug: string;
		title: string;
		statementMd: string;
		examplesAndConstraintsMd: string | null;
		topics: string[];
		difficulty: "easy" | "medium" | "hard";
		languages: string[];
		rubric: { optimal_time: string; acceptable_time: string[] };
		parameters?: { name: string; type: string }[];
		returnType?: string;
		functionName?: string;
		judge?: any;
		startingCode: { [language: string]: string };
		passingCode: { [language: string]: string };
		secondaryPassingCode: { [language: string]: string };
		outputOrderMatters: boolean;
		order?: number;
	},
	testCases: TestCase[]
): Promise<{
	success: boolean;
	problemId?: string;
	error?: string;
}> {
	requireAdmin();

	try {
		// Use order from problem data if provided, otherwise get max order value
		const finalOrder =
			problemData.order ??
			(await (async () => {
				const maxOrderResult = await prisma.algoProblem.findFirst({
					orderBy: { order: "desc" },
					select: { order: true },
				});
				return (maxOrderResult?.order || 0) + 1;
			})());

		// Process markdown to HTML
		const statementHtml = await processMarkdown(problemData.statementMd);

		const examplesAndConstraintsHtml = problemData.examplesAndConstraintsMd
			? await processMarkdown(problemData.examplesAndConstraintsMd)
			: null;

		// Save to database
		const savedProblem = await prisma.algoProblem.create({
			data: {
				slug: problemData.slug,
				title: problemData.title,
				statementMd: problemData.statementMd,
				statementHtml,
				examplesAndConstraintsMd:
					problemData.examplesAndConstraintsMd || null,
				examplesAndConstraintsHtml,
				topics: problemData.topics,
				difficulty: problemData.difficulty,
				languages: problemData.languages,
				rubric: problemData.rubric,
				parameters: problemData.parameters || undefined,
				returnType: problemData.returnType || undefined,
				functionName: problemData.functionName || undefined,
				tests: testCases as any, // Cast to Prisma Json type
				startingCode: problemData.startingCode,
				passingCode: problemData.passingCode,
				secondaryPassingCode: problemData.secondaryPassingCode,
				outputOrderMatters: problemData.outputOrderMatters,
				judge: problemData.judge || undefined,
				order: finalOrder,
			},
		});

		return {
			success: true,
			problemId: savedProblem.id,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return {
			success: false,
			error: errorMessage,
		};
	}
}
