import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { DeleteProblemButton } from "./DeleteProblemButton";

interface ProblemsTableRowProps {
	problem: {
		id: string;
		title: string;
		difficulty: string;
		topics: string[];
		languages: string[];
	};
}

export function ProblemsTableRow({ problem }: ProblemsTableRowProps) {
	return (
		<TableRow>
			<TableCell className="font-medium">{problem.title}</TableCell>
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

