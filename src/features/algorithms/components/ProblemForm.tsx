"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ProblemFormProps {
	onSubmit: (data: any) => Promise<any>;
	initialData?: {
		slug: string;
		title: string;
		statementMd: string;
		examplesAndConstraintsMd?: string | null;
		topics: string[];
		difficulty: string;
		languages: string[];
		rubric: any;
		parameters?: { name: string; type: string }[];
		returnType?: string;
		functionName?: string;
		judge?: any;
		tests: any[];
		startingCode: any;
		passingCode: any;
		order: number;
	};
}

export function ProblemForm({ onSubmit, initialData }: ProblemFormProps) {
	const [slug, setSlug] = useState(initialData?.slug || "");
	const [title, setTitle] = useState(initialData?.title || "");
	const [statementMd, setStatementMd] = useState(
		initialData?.statementMd || ""
	);
	const [examplesAndConstraintsMd, setExamplesAndConstraintsMd] = useState(
		initialData?.examplesAndConstraintsMd || ""
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
	const [parameters, setParameters] = useState(
		JSON.stringify(initialData?.parameters || [], null, 2)
	);
	const [returnType, setReturnType] = useState(
		initialData?.returnType || ""
	);
	const [functionName, setFunctionName] = useState(
		initialData?.functionName || ""
	);
	const [judge, setJudge] = useState(
		JSON.stringify(initialData?.judge || null, null, 2)
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
	const [order, setOrder] = useState(initialData?.order?.toString() || "1");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [testsOpen, setTestsOpen] = useState(false);

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
				examplesAndConstraintsMd: examplesAndConstraintsMd || null,
				topics: topics.split(",").map((t) => t.trim()),
				difficulty,
				languages: languages.split(",").map((l) => l.trim()),
				rubric: JSON.parse(rubric),
				parameters: parameters ? JSON.parse(parameters) : undefined,
				returnType: returnType || undefined,
				functionName: functionName || undefined,
				judge: judge && judge.trim() !== "null" ? JSON.parse(judge) : undefined,
				tests: JSON.parse(tests),
				startingCode: JSON.parse(startingCode),
				passingCode: JSON.parse(passingCode),
				order: parseInt(order, 10) || 1,
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

			<div className="grid grid-cols-3 gap-4">
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

				<div>
					<Label htmlFor="order">Order</Label>
					<Input
						id="order"
						type="number"
						value={order}
						onChange={(e) => setOrder(e.target.value)}
						required
						min="1"
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

			<div>
				<Label htmlFor="examplesAndConstraintsMd">
					Examples and Constraints (Markdown)
				</Label>
				<Textarea
					id="examplesAndConstraintsMd"
					value={examplesAndConstraintsMd}
					onChange={(e) => setExamplesAndConstraintsMd(e.target.value)}
					rows={10}
					placeholder="Enter examples and constraints in markdown format..."
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
				<Label htmlFor="parameters">
					Parameters (JSON) - Array of {`{name, type}`} objects
				</Label>
				<Textarea
					id="parameters"
					value={parameters}
					onChange={(e) => setParameters(e.target.value)}
					rows={6}
					placeholder='[{"name": "head", "type": "ListNode"}, {"name": "k", "type": "number"}]'
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<Label htmlFor="returnType">Return Type</Label>
					<Input
						id="returnType"
						value={returnType}
						onChange={(e) => setReturnType(e.target.value)}
						placeholder="ListNode, number[], boolean, etc."
					/>
				</div>

				<div>
					<Label htmlFor="functionName">Function Name</Label>
					<Input
						id="functionName"
						value={functionName}
						onChange={(e) => setFunctionName(e.target.value)}
						placeholder="deleteDuplicates, twoSum, etc."
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="judge">
					Judge Configuration (JSON) - Optional, for custom validation logic
				</Label>
				<Textarea
					id="judge"
					value={judge}
					onChange={(e) => setJudge(e.target.value)}
					rows={8}
					placeholder='{"kind": "mutating-array-with-k", "arrayParamIndex": 0, "kIsReturnValue": true, "ignoreOrder": false}'
				/>
				<p className="text-sm text-muted-foreground mt-1">
					Judge types: &quot;return-value&quot; (default), &quot;mutating-array-with-k&quot;, or
					&quot;custom-script&quot;. Leave empty/null for default behavior.
				</p>
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

			<Collapsible open={testsOpen} onOpenChange={setTestsOpen}>
				<div className="flex items-center justify-between">
					<Label htmlFor="tests">Tests (JSON)</Label>
					<CollapsibleTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
						>
							{testsOpen ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</Button>
					</CollapsibleTrigger>
				</div>
				<CollapsibleContent>
					<div className="mt-2">
						<Textarea
							id="tests"
							value={tests}
							onChange={(e) => setTests(e.target.value)}
							rows={10}
							required
						/>
					</div>
				</CollapsibleContent>
			</Collapsible>

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
