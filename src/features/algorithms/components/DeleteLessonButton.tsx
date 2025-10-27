"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteAlgoLesson } from "@/lib/actions/adminAlgoActions";

interface DeleteLessonButtonProps {
	lessonId: string;
}

export function DeleteLessonButton({ lessonId }: DeleteLessonButtonProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this lesson?")) {
			return;
		}

		setIsDeleting(true);
		try {
			const result = await deleteAlgoLesson(lessonId);
			if (result.success) {
				router.refresh();
			} else {
				alert(result.error || "Failed to delete lesson");
			}
		} catch (error) {
			alert("Failed to delete lesson");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Button
			variant="destructive"
			size="sm"
			onClick={handleDelete}
			disabled={isDeleting}
		>
			<Trash2 className="w-4 h-4" />
		</Button>
	);
}

