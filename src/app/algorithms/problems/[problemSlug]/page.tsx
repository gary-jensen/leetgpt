import { AlgorithmWorkspace } from "@/features/algorithms/components/AlgorithmWorkspace";
import {
	getAlgoProblemBySlug,
	getAlgoProblemsMeta,
	getLessonsByTopics,
} from "@/features/algorithms/data";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscriptionTier } from "@/lib/hourlyLimits";
import { getSubscriptionStatusFromSession } from "@/lib/utils/subscription";
import { AlgoLesson } from "@/types/algorithm-types";

interface AlgorithmWorkspacePageProps {
	params: Promise<{
		problemSlug: string;
	}>;
}

export async function generateMetadata({
	params,
}: AlgorithmWorkspacePageProps): Promise<Metadata> {
	const { problemSlug } = await params;
	const problem = await getAlgoProblemBySlug(problemSlug);

	if (!problem) {
		return {
			title: `Problem Not Found: ${problemSlug}`,
		};
	}

	// Create description from problem statement (first 160 chars)
	const description = problem.statementMd
		.replace(/[#*`]/g, "")
		.replace(/\n/g, " ")
		.trim()
		.slice(0, 160);

	return {
		title: `${problem.title} - Algorithm Practice | BitSchool`,
		description:
			description ||
			`Practice ${problem.difficulty} algorithm problem: ${problem.title}`,
		keywords: [
			...problem.topics,
			problem.difficulty,
			"algorithm",
			"coding practice",
			"leetcode",
			"interview preparation",
		].join(", "),
		openGraph: {
			title: problem.title,
			description:
				description ||
				`Practice ${problem.difficulty} algorithm problem`,
			type: "website",
		},
		other: {
			"algorithm:difficulty": problem.difficulty,
			"algorithm:topics": problem.topics.join(", "),
		},
	};
}

export default async function AlgorithmWorkspacePage({
	params,
}: AlgorithmWorkspacePageProps) {
	const { problemSlug } = await params;

	// Fetch problem and all problems metadata for navigation (lightweight, only what we need) (also cached)
	const [session, problem, problemsMeta] = await Promise.all([
		getSession(),
		getAlgoProblemBySlug(problemSlug),
		getAlgoProblemsMeta(),
	]);

	if (!problem) {
		redirect("/algorithms/problems");
	}

	// Fetch related lessons for this problem's topics
	// const relatedLessons = await getLessonsByTopics(problem.topics);
	// Temporarily disable related lessons
	const relatedLessons: AlgoLesson[] = [];

	// Get subscription status from session (synchronous, no database calls)
	const subscriptionStatus = getSubscriptionStatusFromSession(session);

	return (
		<AlgorithmWorkspace
			problem={problem}
			relatedLessons={relatedLessons}
			problemsMeta={problemsMeta}
			subscriptionStatus={subscriptionStatus}
		/>
	);
}

// Generate static params for all problems
export async function generateStaticParams() {
	const problems = await getAlgoProblemsMeta();

	return problems.map((problem) => ({
		problemSlug: problem.slug,
	}));
}

export const dynamicParams = true;
