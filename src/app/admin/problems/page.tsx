import { getAllAlgoProblems } from "@/lib/actions/adminAlgoActions";
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
import { ProblemsTableRow } from "@/features/algorithms/components/ProblemsTableRow";

export default async function AdminProblemsPage() {
	const problems = await getAllAlgoProblems();

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-3xl font-bold">Problems</h2>
				<div className="flex gap-2">
					<Link href="/admin/problems/test">
						<Button variant="outline">Test All Problems</Button>
					</Link>
					<Link href="/admin/problems/secondary-code">
						<Button variant="outline">
							Generate Secondary Code
						</Button>
					</Link>
					<Link href="/admin/problems/new">
						<Button>Create New Problem</Button>
					</Link>
				</div>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Difficulty</TableHead>
							<TableHead>Topics</TableHead>
							<TableHead>Languages</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{problems?.map((problem) => (
							<ProblemsTableRow
								key={problem.id}
								problem={problem}
							/>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
