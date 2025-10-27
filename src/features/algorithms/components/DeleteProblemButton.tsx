"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteAlgoProblem } from "@/lib/actions/adminAlgoActions";

interface DeleteProblemButtonProps {
	problemId: string;
}

export function DeleteProblemButton({ problemId }: DeleteProblemButtonProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this problem?")) {
			return;
		}

		setIsDeleting(true);
		try {
			const result = await deleteAlgoProblem(problemId);
			if (result.success) {
				router.refresh();
			} else {
				alert(result.error || "Failed to delete problem");
			}
		} catch (error) {
			alert("Failed to delete problem");
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

