"use client";

import { useState, useMemo } from "react";
import { AlgoProblemMeta } from "@/types/algorithm-types";
import { getDifficultyColor } from "../utils/difficultyUtils";
import { useAlgoFilters } from "../hooks/useAlgoFilters";
import type { FilterSortBy } from "../utils/filterStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
	Search,
	Filter,
	Circle,
	Clock,
	ArrowUpDown,
	Check,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useProgress } from "@/contexts/ProgressContext";

interface ProblemsListProps {
	problems: AlgoProblemMeta[];
	allTopics: string[];
}

export function ProblemsList({ problems, allTopics }: ProblemsListProps) {
	const progress = useProgress();
	const filters = useAlgoFilters({ saveOnUnmount: true, autoPersist: false });

	const [filterSearch, setFilterSearch] = useState("");
	const difficultyLevels = ["easy", "medium", "hard"];

	// Calculate active filter types count (topics, difficulty, search)
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (filters.selectedTopics.length > 0) count += 1;
		if (filters.selectedDifficulties.length > 0) count += 1;
		if (filters.searchTerm.trim()) count += 1;
		return count;
	}, [
		filters.selectedTopics,
		filters.selectedDifficulties,
		filters.searchTerm,
	]);

	const filteredProblems = useMemo(() => {
		let filtered = [...problems];

		// Apply filters
		if (filters.selectedTopics.length > 0) {
			filtered = filtered.filter((problem) =>
				problem.topics.some((t) => filters.selectedTopics.includes(t))
			);
		}

		if (filters.selectedDifficulties.length > 0) {
			filtered = filtered.filter((problem) =>
				filters.selectedDifficulties.includes(problem.difficulty)
			);
		}

		if (filters.searchTerm) {
			const searchLower = filters.searchTerm.toLowerCase();
			filtered = filtered.filter(
				(problem) =>
					problem.title.toLowerCase().includes(searchLower) ||
					problem.topics.some((topic) =>
						topic.toLowerCase().includes(searchLower)
					)
			);
		}

		// Sort problems
		filtered.sort((a, b) => {
			if (filters.sortBy === "default") {
				return a.order - b.order;
			} else if (filters.sortBy === "difficulty") {
				const difficultyOrder = {
					easy: 0,
					medium: 1,
					hard: 2,
				} as Record<string, number>;
				return (
					difficultyOrder[a.difficulty] -
					difficultyOrder[b.difficulty]
				);
			} else {
				return a.title.localeCompare(b.title);
			}
		});

		return filtered;
	}, [
		problems,
		filters.searchTerm,
		filters.selectedTopics,
		filters.selectedDifficulties,
		filters.sortBy,
	]);

	return (
		<div className="min-h-screefn p-0 bg-background rounded-2xl border-[#2f2f2f] border-1">
			<div className="max-w-7xl mx-auto px-4 py-4">
				{/* Controls Row */}
				<div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-start gap-3">
					<div className=" relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							placeholder="Search problems..."
							value={filters.searchTerm}
							onChange={(e) => {
								const value = e.target.value;
								filters.setSearchTerm(value);
								filters.persistFilters(value);
							}}
							className="pl-10"
						/>
					</div>
					<div className="flex items-center gap-2">
						{/* Unified Filter Dropdown (topics + difficulty) */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									aria-label="Filters"
									className={
										activeFilterCount > 0
											? "text-blue-500"
											: ""
									}
								>
									<div className="relative">
										<Filter className="w-4 h-4" />
										{activeFilterCount > 0 && (
											<Badge
												variant="default"
												className="absolute -top-1 -right-1 h-3.5 min-w-3.5 flex items-center justify-center px-0.5 text-[8px] bg-blue-500 text-white font-medium"
											>
												{activeFilterCount}
											</Badge>
										)}
									</div>
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
										placeholder="Search..."
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
												filters.selectedTopics.includes(
													topic
												);
											return (
												<Button
													key={topic}
													size="sm"
													variant={
														active
															? "default"
															: "secondary"
													}
													className={cn(
														"capitalize",
														!active && "bg-white/20"
													)}
													onClick={() => {
														const newTopics =
															filters.selectedTopics.includes(
																topic
															)
																? filters.selectedTopics.filter(
																		(t) =>
																			t !==
																			topic
																  )
																: [
																		...filters.selectedTopics,
																		topic,
																  ];
														filters.setSelectedTopics(
															newTopics
														);
														filters.persistFilters(
															undefined,
															newTopics
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
											filters.selectedDifficulties.includes(
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
												className={cn(
													"capitalize",
													!active && "bg-white/20"
												)}
												onClick={() => {
													const newDifficulties =
														filters.selectedDifficulties.includes(
															level
														)
															? filters.selectedDifficulties.filter(
																	(l) =>
																		l !==
																		level
															  )
															: [
																	...filters.selectedDifficulties,
																	level,
															  ];
													filters.setSelectedDifficulties(
														newDifficulties
													);
													filters.persistFilters(
														undefined,
														undefined,
														newDifficulties
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
											filters.setSelectedTopics([]);
											filters.setSelectedDifficulties([]);
											setFilterSearch("");
											filters.setSearchTerm("");
											filters.setSortBy("default");
											filters.persistFilters(
												"",
												[],
												[],
												"default"
											);
										}}
									>
										Reset
									</Button>
								</div>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Sorting Dropdown */}
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
									value={filters.sortBy}
									onValueChange={(v) => {
										const newSort = v as FilterSortBy;
										filters.setSortBy(newSort);
										filters.persistFilters(
											undefined,
											undefined,
											undefined,
											newSort
										);
									}}
								>
									<DropdownMenuRadioItem value="default">
										Default
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="difficulty">
										Difficulty
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="title">
										Title
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* List */}
				<div className="w-full border border-border rounded-md overflow-hidden">
					{filteredProblems.map((problem, idx) => {
						const problemProgress = progress.getAlgoProblemProgress(
							problem.id,
							"javascript"
						);

						const isCompleted =
							problemProgress?.status === "completed";
						return (
							<ProblemRow
								key={problem.id}
								index={idx + 1}
								problem={problem}
								isCompleted={isCompleted}
							/>
						);
					})}
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
								filters.setSearchTerm("");
								filters.setSelectedTopics([]);
								filters.setSelectedDifficulties([]);
								filters.setSortBy("default");
								filters.persistFilters("", [], [], "default");
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

function ProblemRow({
	problem,
	index,
	isCompleted,
}: {
	problem: AlgoProblemMeta;
	index: number;
	isCompleted: boolean;
}) {
	const displayNumber = problem.order ?? index;

	return (
		<Link
			href={`/algorithms/problems/${problem.slug}`}
			className="border-t border-border hover:bg-white/5 w-full text-sm group px-4 py-3 flex justify-between items-center min-h-14"
		>
			<div className="truncate pr-4 flex items-center gap-6">
				<div className="w-4 flex items-center justify-center">
					{isCompleted ? (
						<Check className="w-4 h-4 text-green-500" />
					) : null}
				</div>
				<div className="text-sm text-muted-foreground">
					{displayNumber}
				</div>
				<span className="group-hover:underline">{problem.title}</span>
			</div>
			<div className="text-sm font-medium capitalize {getDifficultyColor(problem.difficulty)}">
				<span className={getDifficultyColor(problem.difficulty)}>
					{problem.difficulty}
				</span>
			</div>
			{/* <div className="hidden md:flex flex-wrap gap-2">
				{problem.topics.map((topic) => (
					<Badge key={topic} variant="secondary" className="text-2xs">
						{topic}
					</Badge>
				))}
			</div> */}
			{/* <div className="text-right">
				<Link href={`/algorithms/problems/${problem.slug}`}>
					<Button size="sm" variant="outline" className="px-3">
						Solve
					</Button>
				</Link>
			</div> */}
		</Link>
	);
}
