import { AlgorithmWorkspace } from "@/features/algorithms/components/AlgorithmWorkspace";
import {
	getAlgoProblemBySlug,
	getAlgoProblems,
} from "@/features/algorithms/data";
import { redirect } from "next/navigation";

interface AlgorithmWorkspacePageProps {
	params: Promise<{
		problemSlug: string;
	}>;
}

export default async function AlgorithmWorkspacePage({
	params,
}: AlgorithmWorkspacePageProps) {
	const { problemSlug } = await params;
	const problem = await getAlgoProblemBySlug(problemSlug);

	if (!problem) {
		console.error("Problem not found");
		redirect("/algorithms/problems");
	}

	console.log(
		"🟢 Server - problem.statementHtml:",
		problem.statementHtml
			? `✅ EXISTS (${problem.statementHtml.length} chars)`
			: "❌ NULL"
	);
	console.log("🟢 Server - problem.id:", problem.id);
	console.log("🟢 Server - problem.slug:", problem.slug);

	return <AlgorithmWorkspace problem={problem} />;
}

// Generate static params for all problems
export async function generateStaticParams() {
	const problems = await getAlgoProblems();

	return problems.map((problem) => ({
		problemSlug: problem.slug,
	}));
}

export const dynamicParams = true;
