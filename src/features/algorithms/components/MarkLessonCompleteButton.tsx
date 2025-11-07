"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateAlgoLessonProgress } from "@/lib/actions/algoProgress";
import { useProgress } from "@/contexts/ProgressContext";
import { toast } from "sonner";
import { trackAlgoLessonCompleted } from "@/lib/analytics";

interface MarkLessonCompleteButtonProps {
	lessonId: string;
	lessonTitle?: string;
}

export function MarkLessonCompleteButton({
	lessonId,
	lessonTitle,
}: MarkLessonCompleteButtonProps) {
	const { data: session } = useSession();
	const progress = useProgress();
	const [isCompleting, setIsCompleting] = useState(false);

	// Check if lesson is already completed
	const lessonProgress = progress.getAlgoLessonProgress
		? progress.getAlgoLessonProgress(lessonId)
		: null;
	const isCompleted = lessonProgress?.status === "completed";

	if (!session?.user?.id) {
		return null; // Don't show button for unauthenticated users
	}

	const handleComplete = async () => {
		if (!session?.user?.id) return;

		setIsCompleting(true);
		try {
			await updateAlgoLessonProgress(
				session.user.id,
				lessonId,
				"completed"
			);
			// Track completion
			if (lessonTitle) {
				trackAlgoLessonCompleted(lessonId, lessonTitle);
			}
			toast.success("Lesson marked as complete!");
			// Refresh progress context
			window.location.reload(); // Simple refresh for now
		} catch (error) {
			// console.error("Error marking lesson complete:", error);
			toast.error("Failed to mark lesson as complete");
		} finally {
			setIsCompleting(false);
		}
	};

	if (isCompleted) {
		return (
			<div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
				<CheckCircle2 className="w-5 h-5 text-green-600" />
				<span className="text-green-700 font-medium">Completed</span>
			</div>
		);
	}

	return (
		<Button
			onClick={handleComplete}
			disabled={isCompleting}
			variant="outline"
			className="flex items-center gap-2"
		>
			{isCompleting ? (
				<>
					<Loader2 className="w-4 h-4 animate-spin" />
					Marking...
				</>
			) : (
				<>
					<CheckCircle2 className="w-4 h-4" />
					Mark as Complete
				</>
			)}
		</Button>
	);
}
