import ProblemsPage from "@/features/algorithms/components/ProblemsPage";
import { getAlgoProblemsMeta, getAllTopics } from "@/features/algorithms/data";

export default async function ProblemsListPage() {
	const [problems, allTopics, lessons] = await Promise.all([
		getAlgoProblemsMeta(),
		getAllTopics(),
		// getAlgoLessons(),
		[],
	]);

	const difficultyTotals = { easy: 0, medium: 0, hard: 0 } as Record<
		string,
		number
	>;
	problems.forEach((p: { difficulty: "easy" | "medium" | "hard" }) => {
		const d = p.difficulty as "easy" | "medium" | "hard";
		difficultyTotals[d] += 1;
	});

	const lessonsTotal = lessons.length;

	return (
		<ProblemsPage
			problems={problems}
			lessonsTotal={lessonsTotal}
			allTopics={allTopics}
		/>
	);
}
