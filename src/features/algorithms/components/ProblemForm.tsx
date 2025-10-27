"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProblemFormProps {
	onSubmit: (data: any) => Promise<any>;
	initialData?: {
		slug: string;
		title: string;
		statementMd: string;
		topics: string[];
		difficulty: string;
		languages: string[];
		rubric: any;
		parameterNames: string[];
		tests: any[];
		startingCode: any;
		passingCode: any;
	};
}

export function ProblemForm({ onSubmit, initialData }: ProblemFormProps) {
	const [slug, setSlug] = useState(initialData?.slug || "");
	const [title, setTitle] = useState(initialData?.title || "");
	const [statementMd, setStatementMd] = useState(
		initialData?.statementMd || ""
	);
	const [topics, setTopics] = useState(initialData?.topics?.join(", ") || "");
	const [difficulty, setDifficulty] = useState(
		initialData?.difficulty || "easy"
	);
	const [languages, setLanguages] = useState(
		initialData?.languages?.join(", ") || "javascript"
	);
	const [rubric, setRubric] = useState(
		JSON.stringify(initialData?.rubric || {}, null, 2)
	);
	const [parameterNames, setParameterNames] = useState(
		initialData?.parameterNames?.join(", ") || ""
	);
	const [tests, setTests] = useState(
		JSON.stringify(initialData?.tests || [], null, 2)
	);
	const [startingCode, setStartingCode] = useState(
		JSON.stringify(initialData?.startingCode || {}, null, 2)
	);
	const [passingCode, setPassingCode] = useState(
		JSON.stringify(initialData?.passingCode || {}, null, 2)
	);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			// Parse JSON fields
			const data = {
				slug,
				title,
				statementMd,
				topics: topics.split(",").map((t) => t.trim()),
				difficulty,
				languages: languages.split(",").map((l) => l.trim()),
				rubric: JSON.parse(rubric),
				parameterNames: parameterNames.split(",").map((p) => p.trim()),
				tests: JSON.parse(tests),
				startingCode: JSON.parse(startingCode),
				passingCode: JSON.parse(passingCode),
			};

			const result = await onSubmit(data);
			if (!result.success) {
				setError(result.error || "Failed to save problem");
			}
		} catch (err: any) {
			setError(err.message || "Invalid JSON or data format");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="slug">Slug</Label>
					<Input
						id="slug"
						value={slug}
						onChange={(e) => setSlug(e.target.value)}
						required
					/>
				</div>

				<div>
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="statementMd">Statement (Markdown)</Label>
				<Textarea
					id="statementMd"
					value={statementMd}
					onChange={(e) => setStatementMd(e.target.value)}
					rows={10}
					required
				/>
			</div>

			<div className="grid grid-cols-3 gap-4">
				<div>
					<Label htmlFor="topics">Topics (comma-separated)</Label>
					<Input
						id="topics"
						value={topics}
						onChange={(e) => setTopics(e.target.value)}
						required
					/>
				</div>

				<div>
					<Label htmlFor="difficulty">Difficulty</Label>
					<select
						id="difficulty"
						value={difficulty}
						onChange={(e) => setDifficulty(e.target.value)}
						className="w-full px-3 py-2 border rounded-md"
						required
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
				</div>

				<div>
					<Label htmlFor="languages">Languages</Label>
					<Input
						id="languages"
						value={languages}
						onChange={(e) => setLanguages(e.target.value)}
						required
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="parameterNames">
					Parameter Names (comma-separated)
				</Label>
				<Input
					id="parameterNames"
					value={parameterNames}
					onChange={(e) => setParameterNames(e.target.value)}
					required
				/>
			</div>

			<div>
				<Label htmlFor="rubric">Rubric (JSON)</Label>
				<Textarea
					id="rubric"
					value={rubric}
					onChange={(e) => setRubric(e.target.value)}
					rows={6}
					required
				/>
			</div>

			<div>
				<Label htmlFor="tests">Tests (JSON)</Label>
				<Textarea
					id="tests"
					value={tests}
					onChange={(e) => setTests(e.target.value)}
					rows={10}
					required
				/>
			</div>

			<div>
				<Label htmlFor="startingCode">Starting Code (JSON)</Label>
				<Textarea
					id="startingCode"
					value={startingCode}
					onChange={(e) => setStartingCode(e.target.value)}
					rows={6}
					required
				/>
			</div>

			<div>
				<Label htmlFor="passingCode">Passing Code (JSON)</Label>
				<Textarea
					id="passingCode"
					value={passingCode}
					onChange={(e) => setPassingCode(e.target.value)}
					rows={6}
					required
				/>
			</div>

			<div className="flex gap-4">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : "Save Problem"}
				</Button>
			</div>
		</form>
	);
}

