"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { DeleteProblemButton } from "./DeleteProblemButton";
import { updateProblemPublishedStatus } from "@/lib/actions/adminAlgoActions";

interface ProblemsTableRowProps {
	problem: {
		id: string;
		title: string;
		difficulty: string;
		topics: string[];
		languages: string[];
		order?: number;
		tests?: any;
		published?: boolean;
	};
}

export function ProblemsTableRow({ problem }: ProblemsTableRowProps) {
	const [published, setPublished] = useState(problem.published ?? false);
	const [isUpdating, setIsUpdating] = useState(false);

	// Sync state with prop changes
	useEffect(() => {
		setPublished(problem.published ?? false);
	}, [problem.published]);

	const handlePublishedChange = async (checked: boolean) => {
		setIsUpdating(true);
		setPublished(checked); // Optimistic update

		const result = await updateProblemPublishedStatus(problem.id, checked);

		if (!result.success) {
			// Revert on error
			setPublished(!checked);
		}

		setIsUpdating(false);
	};

	return (
		<TableRow>
			<TableCell className="font-medium">
				<div className="flex items-center gap-3">
					{problem.order && (
						<span className="text-sm text-muted-foreground min-w-[2rem]">
							{problem.order}
						</span>
					)}
					<span>{problem.title}</span>
				</div>
			</TableCell>
			<TableCell>
				<span
					className={`px-2 py-1 text-xs rounded-full ${
						problem.difficulty === "easy"
							? "bg-green-100 text-green-800"
							: problem.difficulty === "medium"
							? "bg-yellow-100 text-yellow-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					{problem.difficulty.toUpperCase()}
				</span>
			</TableCell>
			<TableCell>{problem.topics.slice(0, 2).join(", ")}</TableCell>
			<TableCell>{problem.languages.join(", ")}</TableCell>
			<TableCell>
				<span
					className={(() => {
						const count = Array.isArray(problem.tests)
							? problem.tests.length
							: 0;
						if (count <= 5) {
							return "text-red-600 font-medium";
						} else if (count <= 15) {
							return "text-yellow-600 font-medium";
						}
						return "";
					})()}
				>
					{Array.isArray(problem.tests) ? problem.tests.length : 0}
				</span>
			</TableCell>
			<TableCell>
				<Switch
					checked={published}
					onCheckedChange={handlePublishedChange}
					disabled={isUpdating}
				/>
			</TableCell>
			<TableCell>
				<div className="flex gap-2">
					<Link href={`/admin/problems/${problem.id}`}>
						<Button variant="outline" size="sm">
							Edit
						</Button>
					</Link>
					<DeleteProblemButton problemId={problem.id} />
				</div>
			</TableCell>
		</TableRow>
	);
}
