import { notFound } from "next/navigation";
import {
	getAlgoLessonBySlug,
	getAlgoLessons,
} from "@/features/algorithms/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

interface LessonPageProps {
	params: Promise<{
		lessonSlug: string;
	}>;
}

export default async function LessonPage({ params }: LessonPageProps) {
	const { lessonSlug } = await params;
	const lesson = await getAlgoLessonBySlug(lessonSlug);

	if (!lesson) {
		notFound();
	}

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "easy":
				return "bg-green-100 text-green-800";
			case "medium":
				return "bg-yellow-100 text-yellow-800";
			case "hard":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b border-border bg-background">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center gap-4 mb-4">
						<Link href="/algorithms/lessons">
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Lessons
							</Button>
						</Link>
					</div>

					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-4xl font-bold mb-4">
								{lesson.title}
							</h1>
							<p className="text-xl text-muted-foreground mb-6 max-w-3xl">
								{lesson.summary}
							</p>

							<div className="flex items-center gap-4">
								<Badge
									className={getDifficultyColor(
										lesson.difficulty
									)}
								>
									{lesson.difficulty}
								</Badge>

								<div className="flex items-center gap-2 text-muted-foreground">
									<Clock className="w-4 h-4" />
									<span>
										{lesson.readingMinutes} min read
									</span>
								</div>

								<div className="flex gap-2">
									{lesson.topics.map((topic) => (
										<Badge key={topic} variant="secondary">
											{topic}
										</Badge>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="prose prose-lg max-w-none">
						<div
							dangerouslySetInnerHTML={{
								__html: lesson.bodyMd.replace(/\n/g, "<br>"),
							}}
						/>
					</div>

					{/* CTA Section */}
					<div className="mt-12 p-6 bg-muted rounded-lg">
						<h3 className="text-xl font-semibold mb-4">
							Ready to Practice?
						</h3>
						<p className="text-muted-foreground mb-6">
							Now that you&apos;ve learned the concepts, try
							solving some problems that use these techniques.
						</p>

						<div className="flex gap-4">
							<Link href="/algorithms/problems">
								<Button className="flex items-center gap-2">
									<ExternalLink className="w-4 h-4" />
									View Problems
								</Button>
							</Link>

							<Link href="/algorithms/lessons">
								<Button variant="outline">More Lessons</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Generate static params for all lessons
export async function generateStaticParams() {
	const lessons = await getAlgoLessons();

	return lessons.map((lesson) => ({
		lessonSlug: lesson.slug,
	}));
}

export const dynamicParams = true;
