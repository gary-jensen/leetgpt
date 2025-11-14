"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, ListChecks, BookOpenCheck, BarChart3 } from "lucide-react";
import { useProgress } from "@/contexts/ProgressContext";
import { useSession } from "next-auth/react";
import { getAlgoProgress } from "@/lib/actions/algoProgress";

type Difficulty = "easy" | "medium" | "hard";

function computeSolvedByDifficulty(
	problems: { id: string; difficulty: Difficulty }[] | undefined,
	problemProgress: {
		problemId: string;
		status: "not_started" | "in_progress" | "completed";
	}[]
) {
	const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
	if (!problems || problems.length === 0) return counts;
	const idToDifficulty = new Map<string, Difficulty>(
		problems.map((p) => [p.id, p.difficulty])
	);
	for (const prog of problemProgress) {
		if (prog.status === "completed") {
			const d = idToDifficulty.get(prog.problemId as string);
			if (d) counts[d] += 1;
		}
	}
	return counts;
}

function computeProblemTotals(
	problems: { id: string; difficulty: Difficulty }[] | undefined
) {
	const totals: {
		easy: number;
		medium: number;
		hard: number;
		total: number;
	} = {
		easy: 0,
		medium: 0,
		hard: 0,
		total: 0,
	};
	if (!problems) return totals;
	for (const p of problems) {
		totals[p.difficulty] += 1;
		totals.total += 1;
	}
	return totals;
}

interface AlgoSidebarProps {
	problems?: { id: string; difficulty: "easy" | "medium" | "hard" }[];
	lessonsTotal?: number;
}

export function AlgoSidebar({ problems, lessonsTotal }: AlgoSidebarProps) {
	const pathname = usePathname();
	const progress = useProgress();
	const isProgressLoaded = !progress.isAlgoProgressLoading;

	const links = [
		// { href: "/algorithms", label: "Home", icon: Home },
		{ href: "/problems", label: "Problems", icon: ListChecks },
		// { href: "/algorithms/lessons", label: "Lessons", icon: BookOpenCheck },
	];

	// Compute totals using helpers
	const solvedByDifficulty = computeSolvedByDifficulty(
		problems,
		progress.algoProblemProgress
	);
	const problemTotals = computeProblemTotals(problems);

	// We don't have difficulty on progress entries; we will approximate totals from props and solved from submissions count not ideal.
	const totalSolved = progress.algoProblemProgress.filter(
		(p) => p.status === "completed"
	).length;
	// const lessonsCompleted = progress.algoLessonProgress.filter(
	// 	(l) => l.status === "completed"
	// ).length;

	return (
		<aside className="hidden md:flex md:flex-col w-56 shrink-0 h-[calc(100vh-48px)] border-r border-border fixed left-0 top-12 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<nav className="p-3 space-y-1">
				{links.map(({ href, label, icon: Icon }) => (
					<Link
						key={href}
						href={href}
						className={cn(
							"flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors",
							pathname?.endsWith(href) ? "bg-white/10" : ""
						)}
					>
						<Icon className="w-4 h-4" />
						{label}
					</Link>
				))}
			</nav>

			<div className="mt-auto p-3 border-t border-border text-sm space-y-2">
				{/* Problems stats */}
				<div className="text-xs uppercase tracking-wide text-muted-foreground">
					Problems
				</div>
				<div className="flex items-center justify-between">
					<span className="text-emerald-400">Easy</span>
					<span className="font-medium">
						{isProgressLoaded && solvedByDifficulty.easy}/
						{problemTotals.easy}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-yellow-400">Medium</span>
					<span className="font-medium">
						{isProgressLoaded && solvedByDifficulty.medium}/
						{problemTotals.medium}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-red-500">Hard</span>
					<span className="font-medium">
						{isProgressLoaded && solvedByDifficulty.hard}/
						{problemTotals.hard}
					</span>
				</div>
				<div className="flex items-center justify-between pt-1">
					Total
					<span className="font-medium">
						{isProgressLoaded && totalSolved}/{problemTotals.total}
					</span>
				</div>

				{/* Lessons stats */}
				{/* <div className="text-xs uppercase tracking-wide text-muted-foreground pt-3">
					Lessons
				</div>
				<div className="flex items-center justify-between">
					Completed
					<span className="font-medium">
						{isProgressLoaded && lessonsCompleted}/
						{lessonsTotal ?? 0}
					</span>
				</div> */}
			</div>
		</aside>
	);
}
