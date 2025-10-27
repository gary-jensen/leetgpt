import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { DeleteLessonButton } from "./DeleteLessonButton";

interface LessonsTableRowProps {
	lesson: {
		id: string;
		title: string;
		difficulty: string;
		topics: string[];
		readingMinutes: number;
	};
}

export function LessonsTableRow({ lesson }: LessonsTableRowProps) {
	return (
		<TableRow>
			<TableCell className="font-medium">{lesson.title}</TableCell>
			<TableCell>
				<span
					className={`px-2 py-1 text-xs rounded-full ${
						lesson.difficulty === "easy"
							? "bg-green-100 text-green-800"
							: lesson.difficulty === "medium"
							? "bg-yellow-100 text-yellow-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					{lesson.difficulty.toUpperCase()}
				</span>
			</TableCell>
			<TableCell>{lesson.topics.slice(0, 2).join(", ")}</TableCell>
			<TableCell>{lesson.readingMinutes} min</TableCell>
			<TableCell>
				<div className="flex gap-2">
					<Link href={`/admin/lessons/${lesson.id}`}>
						<Button variant="outline" size="sm">
							Edit
						</Button>
					</Link>
					<DeleteLessonButton lessonId={lesson.id} />
				</div>
			</TableCell>
		</TableRow>
	);
}

