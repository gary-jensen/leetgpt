"use client";

import { useState, useMemo } from "react";
import { AlgoLesson } from "@/types/algorithm-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Clock, BookOpen } from "lucide-react";
import Link from "next/link";

interface LessonsListProps {
	lessons: AlgoLesson[];
	allTopics: string[];
}

export function LessonsList({ lessons, allTopics }: LessonsListProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTopic, setSelectedTopic] = useState<string>("");
	const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
	const [sortBy, setSortBy] = useState<
		"difficulty" | "title" | "readingMinutes"
	>("difficulty");

	const difficultyLevels = ["easy", "medium", "hard"];

	const filteredLessons = useMemo(() => {
		let filtered = [...lessons];

		// Apply filters
		if (selectedTopic) {
			filtered = filtered.filter((lesson) =>
				lesson.topics.includes(selectedTopic)
			);
		}

		if (selectedDifficulty) {
			filtered = filtered.filter(
				(lesson) => lesson.difficulty === selectedDifficulty
			);
		}

		if (searchTerm) {
			const searchLower = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(lesson) =>
					lesson.title.toLowerCase().includes(searchLower) ||
					lesson.summary.toLowerCase().includes(searchLower) ||
					lesson.topics.some((topic) =>
						topic.toLowerCase().includes(searchLower)
					)
			);
		}

		// Sort lessons
		filtered.sort((a, b) => {
			if (sortBy === "difficulty") {
				const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
				return (
					difficultyOrder[a.difficulty] -
					difficultyOrder[b.difficulty]
				);
			} else if (sortBy === "readingMinutes") {
				return a.readingMinutes - b.readingMinutes;
			} else {
				return a.title.localeCompare(b.title);
			}
		});

		return filtered;
	}, [lessons, searchTerm, selectedTopic, selectedDifficulty, sortBy]);

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b border-border bg-background">
				<div className="container mx-auto px-4 py-6">
					<h1 className="text-3xl font-bold mb-2">
						Algorithm Lessons
					</h1>
					<p className="text-muted-foreground">
						Learn core algorithmic concepts and patterns
					</p>
				</div>
			</div>

			<div className="container mx-auto px-4 py-6">
				{/* Filters */}
				<div className="mb-6 space-y-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							placeholder="Search lessons..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Filter Controls */}
					<div className="flex flex-wrap gap-4">
						{/* Topic Filter */}
						<div className="flex items-center gap-2">
							<Filter className="w-4 h-4 text-muted-foreground" />
							<select
								value={selectedTopic}
								onChange={(e) =>
									setSelectedTopic(e.target.value)
								}
								className="px-3 py-2 border border-border rounded-md bg-background"
							>
								<option value="">All Topics</option>
								{allTopics.map((topic) => (
									<option key={topic} value={topic}>
										{topic.charAt(0).toUpperCase() +
											topic.slice(1)}
									</option>
								))}
							</select>
						</div>

						{/* Difficulty Filter */}
						<select
							value={selectedDifficulty}
							onChange={(e) =>
								setSelectedDifficulty(e.target.value)
							}
							className="px-3 py-2 border border-border rounded-md bg-background"
						>
							<option value="">All Difficulties</option>
							{difficultyLevels.map((level) => (
								<option key={level} value={level}>
									{level.charAt(0).toUpperCase() +
										level.slice(1)}
								</option>
							))}
						</select>

						{/* Sort */}
						<select
							value={sortBy}
							onChange={(e) =>
								setSortBy(
									e.target.value as
										| "difficulty"
										| "title"
										| "readingMinutes"
								)
							}
							className="px-3 py-2 border border-border rounded-md bg-background"
						>
							<option value="difficulty">
								Sort by Difficulty
							</option>
							<option value="title">Sort by Title</option>
							<option value="readingMinutes">
								Sort by Reading Time
							</option>
						</select>
					</div>
				</div>

				{/* Lessons Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredLessons.map((lesson) => (
						<LessonCard key={lesson.id} lesson={lesson} />
					))}
				</div>

				{filteredLessons.length === 0 && (
					<div className="text-center py-12">
						<BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
						<h3 className="text-lg font-medium mb-2">
							No lessons found
						</h3>
						<p className="text-muted-foreground mb-4">
							Try adjusting your search or filter criteria
						</p>
						<Button
							onClick={() => {
								setSearchTerm("");
								setSelectedTopic("");
								setSelectedDifficulty("");
							}}
							variant="outline"
						>
							Clear Filters
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

function LessonCard({ lesson }: { lesson: AlgoLesson }) {
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
		<Link href={`/algorithms/lessons/${lesson.slug}`}>
			<div className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer bg-background">
				<div className="flex items-start justify-between mb-4">
					<h3 className="font-semibold text-xl">{lesson.title}</h3>
					<Badge className={getDifficultyColor(lesson.difficulty)}>
						{lesson.difficulty}
					</Badge>
				</div>

				<p className="text-muted-foreground mb-4 line-clamp-3">
					{lesson.summary}
				</p>

				<div className="flex flex-wrap gap-2 mb-4">
					{lesson.topics.map((topic) => (
						<Badge
							key={topic}
							variant="secondary"
							className="text-xs"
						>
							{topic}
						</Badge>
					))}
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock className="w-4 h-4" />
						<span>{lesson.readingMinutes} min read</span>
					</div>

					<Button size="sm" className="flex items-center gap-2">
						<BookOpen className="w-4 h-4" />
						Read Lesson
					</Button>
				</div>
			</div>
		</Link>
	);
}
