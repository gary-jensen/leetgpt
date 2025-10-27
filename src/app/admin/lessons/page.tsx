import { getAllAlgoLessons } from "@/lib/actions/adminAlgoActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { LessonsTableRow } from "@/features/algorithms/components/LessonsTableRow";

export default async function AdminLessonsPage() {
	const lessons = await getAllAlgoLessons();

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-bold">Lessons</h2>
				<Link href="/admin/lessons/new">
					<Button>Create New Lesson</Button>
				</Link>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Difficulty</TableHead>
							<TableHead>Topics</TableHead>
							<TableHead>Reading Time</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{lessons?.map((lesson) => (
							<LessonsTableRow key={lesson.id} lesson={lesson} />
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
