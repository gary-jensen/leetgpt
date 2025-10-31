import { AlgorithmWorkspace } from "@/features/algorithms/components/AlgorithmWorkspace";
import {
	getAlgoProblemBySlug,
	getAlgoProblems,
	getLessonsByTopics,
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

	// Fetch related lessons for this problem's topics
	const relatedLessons = await getLessonsByTopics(problem.topics);

	return (
		<AlgorithmWorkspace problem={problem} relatedLessons={relatedLessons} />
	);
}

// Generate static params for all problems
export async function generateStaticParams() {
	const problems = await getAlgoProblems();

	return problems.map((problem) => ({
		problemSlug: problem.slug,
	}));
}

export const dynamicParams = true;
