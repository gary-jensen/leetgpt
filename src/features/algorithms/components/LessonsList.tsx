"use client";

import { useState, useMemo } from "react";
import { AlgoLesson } from "@/types/algorithm-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Clock, BookOpen, ArrowUpDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface LessonsListProps {
	lessons: AlgoLesson[];
	allTopics: string[];
}

export function LessonsList({ lessons, allTopics }: LessonsListProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
	const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
		[]
	);
	const [sortBy, setSortBy] = useState<
		"difficulty" | "title" | "readingMinutes"
	>("difficulty");
	const [filterSearch, setFilterSearch] = useState("");

	const difficultyLevels = ["easy", "medium", "hard"];

	const filteredLessons = useMemo(() => {
		let filtered = [...lessons];

		// Apply filters
		if (selectedTopics.length > 0) {
			filtered = filtered.filter((lesson) =>
				lesson.topics.some((t) => selectedTopics.includes(t))
			);
		}

		if (selectedDifficulties.length > 0) {
			filtered = filtered.filter((lesson) =>
				selectedDifficulties.includes(lesson.difficulty)
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
	}, [lessons, searchTerm, selectedTopics, selectedDifficulties, sortBy]);

	return (
		<div className="min-hf-screen bg-background rounded-2xl border-[#2f2f2f] border-1">
			<div className="container mx-auto px-4 py-4">
				{/* Controls Row */}
				<div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-start gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							placeholder="Search lessons..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>
					<div className="flex items-center gap-2">
						{/* Unified Filter Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									aria-label="Filters"
								>
									<Filter className="w-4 h-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								className="w-[420px] p-2"
							>
								{/* Search inside filter */}
								<div className="relative mb-2">
									<Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<Input
										value={filterSearch}
										onChange={(e) =>
											setFilterSearch(e.target.value)
										}
										placeholder="search"
										className="pl-8 h-8"
									/>
								</div>
								<DropdownMenuLabel className="px-0">
									Topics
								</DropdownMenuLabel>
								<div className="flex flex-wrap gap-2 mb-2 max-h-40 overflow-auto pr-1">
									{allTopics
										.filter((t) =>
											t
												.toLowerCase()
												.includes(
													filterSearch.toLowerCase()
												)
										)
										.map((topic) => {
											const active =
												selectedTopics.includes(topic);
											return (
												<Button
													key={topic}
													size="sm"
													variant={
														active
															? "default"
															: "secondary"
													}
													className={
														active
															? "bg-white/20"
															: ""
													}
													onClick={() => {
														setSelectedTopics(
															(prev) =>
																prev.includes(
																	topic
																)
																	? prev.filter(
																			(
																				t
																			) =>
																				t !==
																				topic
																	  )
																	: [
																			...prev,
																			topic,
																	  ]
														);
													}}
												>
													{topic}
												</Button>
											);
										})}
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuLabel className="px-0">
									Difficulty
								</DropdownMenuLabel>
								<div className="flex flex-wrap gap-2 mb-2">
									{difficultyLevels.map((level) => {
										const active =
											selectedDifficulties.includes(
												level
											);
										return (
											<Button
												key={level}
												size="sm"
												variant={
													active
														? "default"
														: "secondary"
												}
												className="capitalize"
												onClick={() => {
													setSelectedDifficulties(
														(prev) =>
															prev.includes(level)
																? prev.filter(
																		(l) =>
																			l !==
																			level
																  )
																: [
																		...prev,
																		level,
																  ]
													);
												}}
											>
												{level}
											</Button>
										);
									})}
								</div>
								<div className="flex items-center justify-end gap-2 pt-2 border-t border-border mt-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setSelectedTopics([]);
											setSelectedDifficulties([]);
											setFilterSearch("");
										}}
									>
										Reset
									</Button>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Sort Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									aria-label="Sort"
								>
									<ArrowUpDown className="w-4 h-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								<DropdownMenuLabel>Sort By</DropdownMenuLabel>
								<DropdownMenuRadioGroup
									value={sortBy}
									onValueChange={(v) => setSortBy(v as any)}
								>
									<DropdownMenuRadioItem value="difficulty">
										Difficulty
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="title">
										Title
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="readingMinutes">
										Reading Time
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
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
								setSelectedTopics([]);
								setSelectedDifficulties([]);
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
