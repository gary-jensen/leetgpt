import {
	getAlgoLessons,
	getAllTopics,
	getAlgoProblems,
} from "@/features/algorithms/data";
import { LessonsList } from "@/features/algorithms/components/LessonsList";
import { AlgoNavbar } from "@/features/algorithms/components/AlgoNavbar";
import { AlgoSidebar } from "@/features/algorithms/components/AlgoSidebar";

export default async function LessonsListPage() {
	const [lessons, allTopics, problems] = await Promise.all([
		getAlgoLessons(),
		getAllTopics(),
		getAlgoProblems(),
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
		<div className="min-h-screen bg-background-4">
			<AlgoNavbar />
			<AlgoSidebar
				problems={problems.map((p) => ({
					id: p.id,
					difficulty: p.difficulty as "easy" | "medium" | "hard",
				}))}
				lessonsTotal={lessonsTotal}
			/>
			<div className="max-w-7xl pt-20 mx-auto px-4 py-4">
				<LessonsList lessons={lessons} allTopics={allTopics} />
			</div>
		</div>
	);
}
