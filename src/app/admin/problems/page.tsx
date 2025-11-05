import { getAllAlgoProblems } from "@/lib/actions/adminAlgoActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProblemBuilder } from "@/features/algorithms/components/ProblemBuilder";
import { Separator } from "@/components/ui/separator";
import { AdminProblemsTable } from "@/features/algorithms/components/AdminProblemsTable";

export default async function AdminProblemsPage() {
	const problems = await getAllAlgoProblems();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
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

			<Separator />

			{/* AI Problem Builder */}
			<div>
				<ProblemBuilder />
			</div>

			<Separator />

			{/* Problems List */}
			<div>
				<h3 className="text-xl font-semibold mb-4">All Problems</h3>
				<AdminProblemsTable problems={problems || []} />
			</div>
		</div>
	);
}
