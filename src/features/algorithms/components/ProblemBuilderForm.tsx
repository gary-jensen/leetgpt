"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { startMultipleBuilders } from "@/lib/actions/adminProblemBuilderActions";

interface ProblemBuilderFormProps {
	onStartBuilders: (builderIds: string[]) => void;
}

export function ProblemBuilderForm({
	onStartBuilders,
}: ProblemBuilderFormProps) {
	const [problemNames, setProblemNames] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const problemNamesArray = problemNames
		.split("\n")
		.map((name) => name.trim())
		.filter((name) => name.length > 0);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (problemNamesArray.length === 0) {
			setError("Please enter at least one problem name");
			return;
		}

		if (problemNamesArray.length > 5) {
			setError("Maximum 5 problems can be built at once");
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await startMultipleBuilders(problemNamesArray);
			if (!result.success || !result.builderIds) {
				setError(result.error || "Failed to start builders");
				return;
			}

			onStartBuilders(result.builderIds);
			setProblemNames(""); // Clear form on success
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>AI Problem Builder</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="problem-names" className="text-sm font-medium">
							Problem Names (one per line)
						</label>
						<Textarea
							id="problem-names"
							placeholder="Two Sum&#10;Add Two Numbers&#10;Longest Substring Without Repeating Characters"
							value={problemNames}
							onChange={(e) => setProblemNames(e.target.value)}
							rows={6}
							disabled={isSubmitting}
						/>
						<div className="flex items-center gap-2">
							<Badge variant="secondary">
								{problemNamesArray.length} problem
								{problemNamesArray.length !== 1 ? "s" : ""} entered
							</Badge>
							{problemNamesArray.length > 5 && (
								<span className="text-sm text-destructive">
									Maximum 5 problems allowed
								</span>
							)}
						</div>
					</div>

					{error && (
						<div className="text-sm text-destructive">{error}</div>
					)}

					<Button
						type="submit"
						disabled={
							isSubmitting ||
							problemNamesArray.length === 0 ||
							problemNamesArray.length > 5
						}
					>
						{isSubmitting ? "Starting..." : "Start Building"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

