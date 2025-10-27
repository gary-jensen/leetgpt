"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LessonFormProps {
	onSubmit: (data: any) => Promise<any>;
	initialData?: {
		slug: string;
		title: string;
		summary: string;
		topics: string[];
		difficulty: string;
		readingMinutes: number;
		bodyMd: string;
	};
}

export function LessonForm({ onSubmit, initialData }: LessonFormProps) {
	const [slug, setSlug] = useState(initialData?.slug || "");
	const [title, setTitle] = useState(initialData?.title || "");
	const [summary, setSummary] = useState(initialData?.summary || "");
	const [topics, setTopics] = useState(initialData?.topics?.join(", ") || "");
	const [difficulty, setDifficulty] = useState(
		initialData?.difficulty || "easy"
	);
	const [readingMinutes, setReadingMinutes] = useState(
		initialData?.readingMinutes || 5
	);
	const [bodyMd, setBodyMd] = useState(initialData?.bodyMd || "");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const data = {
				slug,
				title,
				summary,
				topics: topics.split(",").map((t) => t.trim()),
				difficulty,
				readingMinutes: parseInt(readingMinutes.toString(), 10),
				bodyMd,
			};

			const result = await onSubmit(data);
			if (!result.success) {
				setError(result.error || "Failed to save lesson");
			}
		} catch (err: any) {
			setError(err.message || "Failed to save lesson");
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
				<Label htmlFor="summary">Summary</Label>
				<Textarea
					id="summary"
					value={summary}
					onChange={(e) => setSummary(e.target.value)}
					rows={3}
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
					<Label htmlFor="readingMinutes">
						Reading Time (minutes)
					</Label>
					<Input
						id="readingMinutes"
						type="number"
						value={readingMinutes}
						onChange={(e) =>
							setReadingMinutes(parseInt(e.target.value, 10))
						}
						required
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="bodyMd">Body (Markdown)</Label>
				<Textarea
					id="bodyMd"
					value={bodyMd}
					onChange={(e) => setBodyMd(e.target.value)}
					rows={15}
					required
				/>
			</div>

			<div className="flex gap-4">
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : "Save Lesson"}
				</Button>
			</div>
		</form>
	);
}

