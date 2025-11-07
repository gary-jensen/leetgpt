"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { checkExistingProblems } from "@/lib/actions/adminProblemBuilderActions";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ProblemBuilderFormProps {
	onAddToQueue: (problemNames: string[]) => void;
}

export function ProblemBuilderForm({ onAddToQueue }: ProblemBuilderFormProps) {
	const [problemNames, setProblemNames] = useState("");
	const [isChecking, setIsChecking] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [checkResult, setCheckResult] = useState<Record<
		string,
		boolean
	> | null>(null);

	const problemNamesArray = problemNames
		.split("\n")
		.map((name) => name.trim())
		.filter((name) => name.length > 0);

	const handleCheckAndAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setCheckResult(null);

		if (problemNamesArray.length === 0) {
			setError("Please enter at least one problem name");
			return;
		}

		setIsChecking(true);

		try {
			// Check which problems already exist
			const existsMap = await checkExistingProblems(problemNamesArray);
			setCheckResult(existsMap);

			// Filter out existing problems - only add new ones to queue
			const newProblems = problemNamesArray.filter(
				(problemName) => !existsMap[problemName]
			);

			if (newProblems.length === 0) {
				setError("All problems already exist. No new problems to add.");
				return;
			}

			// Add only new problems to queue
			onAddToQueue(newProblems);
			setProblemNames(""); // Clear form on success
			setCheckResult(null); // Clear check result after adding
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsChecking(false);
		}
	};

	const existingCount = checkResult
		? Object.values(checkResult).filter((exists) => exists).length
		: 0;
	const newCount = problemNamesArray.length - existingCount;

	return (
		<Card>
			<CardHeader>
				<CardTitle>AI Problem Builder</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleCheckAndAdd} className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="problem-names"
							className="text-sm font-medium"
						>
							Problem Names (one per line, unlimited)
						</label>
						<Textarea
							id="problem-names"
							placeholder="Problem 1&#10;Problem 2&#10;Problem 3&#10;...&#10;(Enter as many as you want, builds 5 at a time)"
							value={problemNames}
							onChange={(e) => {
								setProblemNames(e.target.value);
								setCheckResult(null); // Clear previous check result
							}}
							rows={10}
							disabled={isChecking}
						/>
						<div className="flex items-center gap-2 flex-wrap">
							<Badge variant="secondary">
								{problemNamesArray.length} problem
								{problemNamesArray.length !== 1 ? "s" : ""}{" "}
								entered
							</Badge>
							{checkResult && (
								<>
									{existingCount > 0 && (
										<Badge
											variant="outline"
											className="text-orange-600"
										>
											<XCircle className="w-3 h-3 mr-1" />
											{existingCount} already exist
										</Badge>
									)}
									{newCount > 0 && (
										<Badge
											variant="default"
											className="bg-green-600"
										>
											<CheckCircle2 className="w-3 h-3 mr-1" />
											{newCount} new
										</Badge>
									)}
								</>
							)}
						</div>
						{checkResult && existingCount > 0 && (
							<div className="text-sm text-orange-600">
								{existingCount} problem
								{existingCount !== 1 ? "s" : ""} already exist
								{existingCount !== 1
									? " and will not be added"
									: " and will not be added"}{" "}
								to the queue.
							</div>
						)}
					</div>

					{error && (
						<div className="text-sm text-destructive">{error}</div>
					)}

					<Button
						type="submit"
						disabled={isChecking || problemNamesArray.length === 0}
					>
						{isChecking ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Checking...
							</>
						) : (
							"Add to Queue"
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
