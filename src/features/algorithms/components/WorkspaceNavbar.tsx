"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	ArrowRight,
	List,
	Search,
	Filter,
	ArrowUpDown,
	ChevronRightIcon,
	Check,
	ExternalLinkIcon,
	SquareArrowOutUpRightIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import AuthButton from "@/components/AuthButton";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProgress } from "@/contexts/ProgressContext";
import { trackAlgoProblemSwitched } from "@/lib/analytics";
import { getDifficultyColor } from "../utils/difficultyUtils";
import { useAlgoFilters } from "../hooks/useAlgoFilters";
import type { FilterSortBy } from "../utils/filterStorage";
import TrialBanner from "@/components/TrialBanner";
import ProBadge from "@/components/ProBadge";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import type { AlgoProblemMeta } from "@/types/algorithm-types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WorkspaceNavbarProps {
	problemsMeta: AlgoProblemMeta[];
}

export function WorkspaceNavbar({ problemsMeta }: WorkspaceNavbarProps) {
	const { data: session } = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [filterSearch, setFilterSearch] = useState("");
	const progress = useProgress();

	const filters = useAlgoFilters({
		saveOnUnmount: false,
		autoPersist: true,
		reloadTrigger: pathname,
		reloadOnOpen: drawerOpen,
	});

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

	// Extract current problem slug from path: /problems/[slug]
	const currentSlug = useMemo(() => {
		if (!pathname) return null;
		const parts = pathname.split("/").filter(Boolean);
		const idx = parts.findIndex((p) => p === "problems");
		if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
		return null;
	}, [pathname]);

	const allTopics = useMemo(() => {
		const set = new Set<string>();
		problemsMeta.forEach((p) => p.topics.forEach((t) => set.add(t)));
		return Array.from(set).sort((a, b) => a.localeCompare(b));
	}, [problemsMeta]);

	const filteredList = useMemo(() => {
		let list = [...problemsMeta];
		if (filters.selectedTopics.length) {
			list = list.filter((p) =>
				p.topics.some((t) => filters.selectedTopics.includes(t))
			);
		}
		if (filters.selectedDifficulties.length) {
			list = list.filter((p) =>
				filters.selectedDifficulties.includes(p.difficulty)
			);
		}
		if (filters.searchTerm.trim()) {
			const s = filters.searchTerm.toLowerCase();
			list = list.filter(
				(p) =>
					p.title.toLowerCase().includes(s) ||
					p.topics.some((t) => t.toLowerCase().includes(s))
			);
		}
		list.sort((a, b) => {
			if (filters.sortBy === "default") return a.order - b.order;
			if (filters.sortBy === "difficulty") {
				const order: Record<string, number> = {
					easy: 0,
					medium: 1,
					hard: 2,
				};
				return (order[a.difficulty] ?? 0) - (order[b.difficulty] ?? 0);
			}
			return a.title.localeCompare(b.title);
		});
		return list;
	}, [
		problemsMeta,
		filters.selectedTopics,
		filters.selectedDifficulties,
		filters.searchTerm,
		filters.sortBy,
	]);

	const currentIndex = useMemo(() => {
		if (!currentSlug) return -1;
		return filteredList.findIndex((p) => p.slug === currentSlug);
	}, [filteredList, currentSlug]);

	const goToIndex = (idx: number) => {
		if (idx < 0 || idx >= filteredList.length) return;
		const targetProblem = filteredList[idx];
		// Track problem switch if we have a current problem
		if (currentSlug) {
			const currentProblem = problemsMeta.find(
				(p) => p.slug === currentSlug
			);
			if (currentProblem) {
				trackAlgoProblemSwitched(currentProblem.id, targetProblem.id);
			}
		}
		router.push(`/problems/${targetProblem.slug}`);
	};

	const goPrev = () => {
		if (currentIndex <= 0) return;
		goToIndex(currentIndex - 1);
	};
	const goNext = () => {
		if (currentIndex < 0) return;
		if (currentIndex + 1 >= filteredList.length) return;
		goToIndex(currentIndex + 1);
	};

	return (
		<>
			<TrialBanner />
			<nav className="w-full bg-none bgf-background/80 backdrop-blur-sm border-0 bforder-b border-border">
				<div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:fpx-8 lg:px-0">
					<div className="flex items-center justify-between h-16">
						{/* Left: Logo and Back Button */}
						<div className="flex items-center gap-4">
							<Link href="/" className="flex items-center gap-2">
								<Image
									src="/leetgpt_icon.svg"
									alt="LeetGPT"
									width={32}
									height={32}
								/>
								<span className="text-lg font-extrabold text-foreground">
									LeetGPT
								</span>
							</Link>

							<div className="h-6 w-px bg-border" />

							{/* Drawer trigger + Prev/Next */}
							<div className="flex items-center gap-2">
								<Drawer
									open={drawerOpen}
									onOpenChange={setDrawerOpen}
									direction="left"
								>
									<DrawerTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="group gap-2 bg-transparent border-transparent hover:border-border hover:bg-white/10 w-35 justify-start cursor-pointer"
										>
											<List className="w-4 h-4" />
											<span className="hidden sm:inline truncate">
												Problem List
											</span>
											<Tooltip>
												<TooltipTrigger asChild>
													<div className="border shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9 hidden group-hover:flex h-fit w-fit rounded-[4px] bg-white/10 hover:bg-white/15 hover:border-white/1">
														<Link
															href="/problems"
															target="_blank"
															onClick={(e) => {
																e.stopPropagation();
															}}
															className="p-0.5"
														>
															<SquareArrowOutUpRightIcon
																className="scale-[75%]"
																size={12}
															/>
														</Link>
													</div>
												</TooltipTrigger>
												<TooltipContent className="pointer-events-none">
													<p>Open in new tab</p>
												</TooltipContent>
											</Tooltip>
										</Button>
									</DrawerTrigger>
									<DrawerContent className="!max-w-2xl">
										<DrawerHeader className="py-0 border-b border-border mb-2 h-16 justify-center">
											<DrawerTitle>
												<Link
													href="/problems"
													className="text-lg text-foreground hover:underline py-4 flex items-center gap-1"
													onClick={() =>
														setDrawerOpen(false)
													}
												>
													Problem List
													<ChevronRightIcon />
												</Link>
											</DrawerTitle>
										</DrawerHeader>
										<div className="px-4 pb-4 flex items-center gap-2">
											<div className="relative flex-1">
												<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
												<Input
													placeholder="Search problems..."
													value={filters.searchTerm}
													onChange={(e) =>
														filters.setSearchTerm(
															e.target.value
														)
													}
													className="pl-9 h-8"
												/>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="outline"
														size="icon"
														aria-label="Filters"
														className={
															activeFilterCount >
															0
																? "text-blue-500"
																: ""
														}
													>
														<div className="relative">
															<Filter className="w-4 h-4" />
															{activeFilterCount >
																0 && (
																<Badge
																	variant="default"
																	className="absolute -top-1 -right-1 h-3 min-w-3 flex items-center justify-center px-0.5 text-[8px] bg-blue-500 text-white font-medium"
																>
																	{
																		activeFilterCount
																	}
																</Badge>
															)}
														</div>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="start"
													className="w-[360px] p-2"
												>
													<div className="relative mb-2">
														<Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
														<Input
															value={filterSearch}
															onChange={(e) =>
																setFilterSearch(
																	e.target
																		.value
																)
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
																		key={
																			topic
																		}
																		size="sm"
																		variant={
																			active
																				? "default"
																				: "secondary"
																		}
																		className={cn(
																			"capitalize",
																			!active &&
																				"bg-white/20"
																		)}
																		onClick={() => {
																			const newTopics =
																				filters.selectedTopics.includes(
																					topic
																				)
																					? filters.selectedTopics.filter(
																							(
																								t
																							) =>
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
														{[
															"easy",
															"medium",
															"hard",
														].map((level) => {
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
																		!active &&
																			"bg-white/20"
																	)}
																	onClick={() => {
																		const newDifficulties =
																			filters.selectedDifficulties.includes(
																				level
																			)
																				? filters.selectedDifficulties.filter(
																						(
																							l
																						) =>
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
																filters.setSelectedTopics(
																	[]
																);
																filters.setSelectedDifficulties(
																	[]
																);
																setFilterSearch(
																	""
																);
																filters.setSearchTerm(
																	""
																);
																filters.setSortBy(
																	"default"
																);
															}}
														>
															Reset
														</Button>
													</div>
												</DropdownMenuContent>
											</DropdownMenu>
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
													<DropdownMenuLabel>
														Sort By
													</DropdownMenuLabel>
													<DropdownMenuRadioGroup
														value={filters.sortBy}
														onValueChange={(v) =>
															filters.setSortBy(
																v as FilterSortBy
															)
														}
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

										<div
											className="px-2 pb-4 space-y-1 overflow-y-auto dark-scrollbar"
											style={{
												scrollbarWidth: "thin",
												scrollbarColor:
													"#9f9f9f #2C2C2C",
											}}
										>
											{filteredList.map((p, idx) => {
												const isActive =
													p.slug === currentSlug;
												const problemProgress =
													progress.getAlgoProblemProgress?.(
														p.id,
														"javascript"
													);
												const isCompleted =
													problemProgress?.status ===
													"completed";
												return (
													<button
														key={p.id}
														onClick={() => {
															setDrawerOpen(
																false
															);
															router.push(
																`/problems/${p.slug}`
															);
														}}
														className={`w-full text-left px-3 py-2 rounded-md border border-transparent hover:bg-white/10 ${
															isActive
																? "bg-white/5 border-border"
																: ""
														}`}
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3 truncate">
																<div className="w-4 flex items-center justify-center">
																	{isCompleted ? (
																		<Check className="w-4 h-4 text-green-500" />
																	) : null}
																</div>
																<span className="text-xs text-muted-foreground">
																	{p.order ??
																		idx + 1}
																</span>
																<span className="truncate text-sm">
																	{p.title}
																</span>
															</div>
															<span
																className={`text-xs capitalize ${getDifficultyColor(
																	p.difficulty
																)}`}
															>
																{p.difficulty}
															</span>
														</div>
													</button>
												);
											})}
										</div>
									</DrawerContent>
								</Drawer>

								<Button
									variant="ghost"
									className="hover:bg-white/10 cursor-pointer"
									size="icon"
									aria-label="Previous problem"
									onClick={goPrev}
									disabled={currentIndex <= 0}
								>
									<ArrowLeft className="w-4 h-4" />
								</Button>
								<Button
									variant="ghost"
									className="hover:bg-white/10 cursor-pointer"
									size="icon"
									aria-label="Next problem"
									onClick={goNext}
									disabled={
										currentIndex < 0 ||
										currentIndex + 1 >= filteredList.length
									}
								>
									<ArrowRight className="w-4 h-4" />
								</Button>
							</div>
						</div>

						{/* Right: Auth Button */}
						<div className="flex items-center gap-2">
							<ProBadge />
							<AuthButton />
						</div>
					</div>
				</div>
			</nav>
		</>
	);
}
