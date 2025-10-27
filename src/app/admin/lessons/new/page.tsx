import { redirect } from "next/navigation";
import { createAlgoLesson } from "@/lib/actions/adminAlgoActions";
import { LessonForm } from "@/features/algorithms/components/LessonForm";

export default function NewLessonPage() {
	async function handleSubmit(data: any) {
		"use server";
		const result = await createAlgoLesson(data);
		if (result.success) {
			redirect("/admin/lessons");
		}
		return result;
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-3xl font-bold">Create New Lesson</h2>
			</div>
			<LessonForm onSubmit={handleSubmit} />
		</div>
	);
}
