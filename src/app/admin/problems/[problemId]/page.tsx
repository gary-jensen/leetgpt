import { notFound } from "next/navigation";
import { updateAlgoProblem } from "@/lib/actions/adminAlgoActions";
import { ProblemForm } from "@/features/algorithms/components/ProblemForm";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface EditProblemPageProps {
	params: Promise<{
		problemId: string;
	}>;
}

export default async function EditProblemPage({
	params,
}: EditProblemPageProps) {
	const { problemId } = await params;
	const problem = await prisma.algoProblem.findUnique({
		where: { id: problemId },
	});

	if (!problem) {
		notFound();
	}

	async function handleSubmit(data: any) {
		"use server";
		const result = await updateAlgoProblem(problemId, data);
		if (result.success) {
			redirect("/admin/problems");
		}
		return result;
	}

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-3xl font-bold">Edit Problem</h2>
			</div>
			<ProblemForm
				onSubmit={handleSubmit}
				initialData={{
					slug: problem.slug,
					title: problem.title,
					statementMd: problem.statementMd,
					examplesAndConstraintsMd: problem.examplesAndConstraintsMd,
					topics: problem.topics,
					difficulty: problem.difficulty,
					languages: problem.languages,
					rubric: problem.rubric as any,
					parameters: (problem as any).parameters
						? ((problem as any).parameters as { name: string; type: string }[])
						: undefined,
					returnType: (problem as any).returnType || undefined,
					functionName: (problem as any).functionName || undefined,
					judge: (problem as any).judge || undefined,
					tests: problem.tests as any,
					startingCode: problem.startingCode as any,
					passingCode: problem.passingCode as any,
					order: problem.order,
				}}
			/>
		</div>
	);
}
