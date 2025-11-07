"use client";

import { useState, useMemo } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Search, Filter } from "lucide-react";
import { ProblemsTableRow } from "./ProblemsTableRow";
import type { FilterSortBy } from "../utils/filterStorage";
import { cn } from "@/lib/utils";

interface AdminProblemsTableProps {
	problems: Array<{
		id: string;
		slug: string;
		title: string;
		topics: string[];
		difficulty: string;
		languages: string[];
		order?: number;
		tests?: any;
		published?: boolean;
	}>;
}

export function AdminProblemsTable({ problems }: AdminProblemsTableProps) {
	const [sortBy, setSortBy] = useState<FilterSortBy>("default");
	const [sortAscending, setSortAscending] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
	const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(
		[]
	);
	const [filterSearch, setFilterSearch] = useState("");

	// Get all unique topics
	const allTopics = useMemo(() => {
		const topicSet = new Set<string>();
		problems.forEach((problem) => {
			problem.topics.forEach((topic) => topicSet.add(topic));
		});
		return Array.from(topicSet).sort((a, b) => a.localeCompare(b));
	}, [problems]);

	const difficultyLevels = ["easy", "medium", "hard"];

	// Calculate active filter count
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (selectedTopics.length > 0) count += 1;
		if (selectedDifficulties.length > 0) count += 1;
		if (searchTerm.trim()) count += 1;
		return count;
	}, [selectedTopics, selectedDifficulties, searchTerm]);

	const filteredAndSortedProblems = useMemo(() => {
		let filtered = [...problems];

		// Apply search filter
		if (searchTerm.trim()) {
			const searchLower = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(problem) =>
					problem.title.toLowerCase().includes(searchLower) ||
					problem.topics.some((topic) =>
						topic.toLowerCase().includes(searchLower)
					)
			);
		}

		// Apply topic filter
		if (selectedTopics.length > 0) {
			filtered = filtered.filter((problem) =>
				problem.topics.some((t) => selectedTopics.includes(t))
			);
		}

		// Apply difficulty filter
		if (selectedDifficulties.length > 0) {
			filtered = filtered.filter((problem) =>
				selectedDifficulties.includes(problem.difficulty)
			);
		}

		// Sort problems
		filtered.sort((a, b) => {
			let comparison = 0;

			if (sortBy === "default") {
				// Sort by order field, fallback to index if order doesn't exist
				const orderA = a.order ?? 0;
				const orderB = b.order ?? 0;
				comparison = orderA - orderB;
			} else if (sortBy === "difficulty") {
				const difficultyOrder: Record<string, number> = {
					easy: 0,
					medium: 1,
					hard: 2,
				};
				comparison =
					(difficultyOrder[a.difficulty] ?? 0) -
					(difficultyOrder[b.difficulty] ?? 0);
			} else {
				// Sort by title
				comparison = a.title.localeCompare(b.title);
			}

			// Apply ascending/descending order
			return sortAscending ? comparison : -comparison;
		});

		return filtered;
	}, [
		problems,
		sortBy,
		sortAscending,
		searchTerm,
		selectedTopics,
		selectedDifficulties,
	]);

	return (
		<div className="space-y-4">
			{/* Controls Row */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
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

				{/* Filter and Sort Controls */}
				<div className="flex items-center gap-2">
					{/* Filter Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								aria-label="Filters"
								className={
									activeFilterCount > 0 ? "text-blue-500" : ""
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
												className={cn(
													"capitalize",
													!active && "bg-white/20"
												)}
												onClick={() => {
													setSelectedTopics(
														active
															? selectedTopics.filter(
																	(t) =>
																		t !==
																		topic
															  )
															: [
																	...selectedTopics,
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
										selectedDifficulties.includes(level);
									return (
										<Button
											key={level}
											size="sm"
											variant={
												active ? "default" : "secondary"
											}
											className={cn(
												"capitalize",
												!active && "bg-white/20"
											)}
											onClick={() => {
												setSelectedDifficulties(
													active
														? selectedDifficulties.filter(
																(l) =>
																	l !== level
														  )
														: [
																...selectedDifficulties,
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
										setSearchTerm("");
										setSortBy("default");
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
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Sort By</DropdownMenuLabel>
							<DropdownMenuRadioGroup
								value={sortBy}
								onValueChange={(v) =>
									setSortBy(v as FilterSortBy)
								}
							>
								<DropdownMenuRadioItem value="default">
									Default (Order)
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="difficulty">
									Difficulty
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="title">
									Title
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>Order</DropdownMenuLabel>
							<DropdownMenuRadioGroup
								value={sortAscending ? "asc" : "desc"}
								onValueChange={(v) =>
									setSortAscending(v === "asc")
								}
							>
								<DropdownMenuRadioItem value="asc">
									Ascending
								</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="desc">
									Descending
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Table */}
			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Difficulty</TableHead>
							<TableHead>Topics</TableHead>
							<TableHead>Languages</TableHead>
							<TableHead>Total Testcases</TableHead>
							<TableHead>Published</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredAndSortedProblems.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center py-12"
								>
									<p className="text-muted-foreground">
										No problems found. Try adjusting your
										search or filter criteria.
									</p>
								</TableCell>
							</TableRow>
						) : (
							filteredAndSortedProblems.map((problem) => (
								<ProblemsTableRow
									key={problem.id}
									problem={problem}
								/>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
