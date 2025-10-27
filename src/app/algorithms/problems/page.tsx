import { getAlgoProblems, getAllTopics } from "@/features/algorithms/data";
import { ProblemsList } from "@/features/algorithms/components/ProblemsList";

export default async function ProblemsListPage() {
	const [problems, allTopics] = await Promise.all([
		getAlgoProblems(),
		getAllTopics(),
	]);

	return <ProblemsList problems={problems} allTopics={allTopics} />;
}
