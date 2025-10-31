"use client";

import { AlgoLesson } from "@/types/algorithm-types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LessonModal } from "./LessonModal";
import { useProgress } from "@/contexts/ProgressContext";
import { BookOpen, Check } from "lucide-react";

interface RelatedLessonsModalProps {
	lessons: AlgoLesson[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function RelatedLessonsModal({
	lessons,
	open,
	onOpenChange,
}: RelatedLessonsModalProps) {
	const progress = useProgress();

	const getLessonStatus = (lessonId: string) => {
		if (!progress.getAlgoLessonProgress) return "not_started";
		const lessonProgress = progress.getAlgoLessonProgress(lessonId);
		return lessonProgress?.status || "not_started";
	};

	if (lessons.length === 0) {
		return null;
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogTitle>Related Lessons</DialogTitle>
				<DialogDescription>
					Review these lessons to better understand the concepts needed for
					this problem.
				</DialogDescription>

				<div className="space-y-2 mt-4">
					{lessons.map((lesson) => {
						const status = getLessonStatus(lesson.id);
						const isCompleted = status === "completed";

						return (
							<div
								key={lesson.id}
								className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors"
							>
								<div className="flex items-center gap-3 flex-1">
									<BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm">
												{lesson.title}
											</span>
											{isCompleted && (
												<Check className="w-4 h-4 text-green-600 flex-shrink-0" />
											)}
										</div>
										<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
											{lesson.summary}
										</p>
									</div>
								</div>
								<LessonModal lesson={lesson}>
									<Button size="sm" variant="outline" className="ml-2">
										{isCompleted ? "Review" : "Open Lesson"}
									</Button>
								</LessonModal>
							</div>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}

