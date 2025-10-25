"use client";

import { useState, useMemo } from "react";
import {
	getAlgoProblems,
	getAllTopics,
	getDifficultyLevels,
} from "@/features/algorithms/data";
import { AlgoProblemMeta } from "@/types/algorithm-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CheckCircle, Clock, Circle } from "lucide-react";
import Link from "next/link";

export default function ProblemsListPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTopic, setSelectedTopic] = useState<string>("");
	const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
	const [sortBy, setSortBy] = useState<"difficulty" | "title">("difficulty");

	const allTopics = getAllTopics();
	const difficultyLevels = getDifficultyLevels();

	const filteredProblems = useMemo(() => {
		const problems = getAlgoProblems({
			search: searchTerm,
			topic: selectedTopic || undefined,
			difficulty: selectedDifficulty || undefined,
		});

		// Sort problems
		problems.sort((a, b) => {
			if (sortBy === "difficulty") {
				const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
				return (
					difficultyOrder[a.difficulty] -
					difficultyOrder[b.difficulty]
				);
			} else {
				return a.title.localeCompare(b.title);
			}
		});

		return problems;
	}, [searchTerm, selectedTopic, selectedDifficulty, sortBy]);

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
					<h1 className="text-3xl font-bold mb-2">
						Algorithm Problems
					</h1>
					<p className="text-muted-foreground">
						Practice coding problems to improve your algorithmic
						thinking
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
							placeholder="Search problems..."
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
									e.target.value as "difficulty" | "title"
								)
							}
							className="px-3 py-2 border border-border rounded-md bg-background"
						>
							<option value="difficulty">
								Sort by Difficulty
							</option>
							<option value="title">Sort by Title</option>
						</select>
					</div>
				</div>

				{/* Problems Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredProblems.map((problem) => (
						<ProblemCard key={problem.id} problem={problem} />
					))}
				</div>

				{filteredProblems.length === 0 && (
					<div className="text-center py-12">
						<Circle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
						<h3 className="text-lg font-medium mb-2">
							No problems found
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

function ProblemCard({ problem }: { problem: AlgoProblemMeta }) {
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
		<Link href={`/algorithms/workspace/${problem.id}`}>
			<div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-background">
				<div className="flex items-start justify-between mb-3">
					<h3 className="font-medium text-lg">{problem.title}</h3>
					<Badge className={getDifficultyColor(problem.difficulty)}>
						{problem.difficulty}
					</Badge>
				</div>

				<div className="flex flex-wrap gap-2 mb-4">
					{problem.topics.map((topic) => (
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
						<span>JavaScript</span>
					</div>

					<Button size="sm" className="flex items-center gap-2">
						<Circle className="w-4 h-4" />
						Start Solving
					</Button>
				</div>
			</div>
		</Link>
	);
}
