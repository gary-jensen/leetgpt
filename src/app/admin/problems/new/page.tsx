import { redirect } from "next/navigation";
import { createAlgoProblem } from "@/lib/actions/adminAlgoActions";
import { ProblemForm } from "@/features/algorithms/components/ProblemForm";

export default function NewProblemPage() {
	async function handleSubmit(data: any) {
		"use server";
		const result = await createAlgoProblem(data);
		if (result.success) {
			redirect("/admin/problems");
		}
		return result;
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-3xl font-bold">Create New Problem</h2>
			</div>
			<ProblemForm onSubmit={handleSubmit} />
		</div>
	);
}
