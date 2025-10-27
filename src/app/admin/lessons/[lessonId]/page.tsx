import { notFound } from "next/navigation";
import { updateAlgoLesson } from "@/lib/actions/adminAlgoActions";
import { LessonForm } from "@/features/algorithms/components/LessonForm";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface EditLessonPageProps {
	params: Promise<{
		lessonId: string;
	}>;
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
	const { lessonId } = await params;
	const lesson = await prisma.algoLesson.findUnique({
		where: { id: lessonId },
	});

	if (!lesson) {
		notFound();
	}

	async function handleSubmit(data: any) {
		"use server";
		const result = await updateAlgoLesson(lessonId, data);
		if (result.success) {
			redirect("/admin/lessons");
		}
		return result;
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-3xl font-bold">Edit Lesson</h2>
			</div>
			<LessonForm
				onSubmit={handleSubmit}
				initialData={{
					slug: lesson.slug,
					title: lesson.title,
					summary: lesson.summary,
					topics: lesson.topics,
					difficulty: lesson.difficulty,
					readingMinutes: lesson.readingMinutes,
					bodyMd: lesson.bodyMd,
				}}
			/>
		</div>
	);
}
