import { getAlgoLessons, getAllTopics } from "@/features/algorithms/data";
import { LessonsList } from "@/features/algorithms/components/LessonsList";

export default async function LessonsListPage() {
	const [lessons, allTopics] = await Promise.all([
		getAlgoLessons(),
		getAllTopics(),
	]);

	return <LessonsList lessons={lessons} allTopics={allTopics} />;
}
