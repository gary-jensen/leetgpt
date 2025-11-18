"use client";

import { cn } from "@/lib/utils";

interface MobileWorkspaceTabsProps {
	activeTab: "problem" | "editor" | "tests";
	onTabChange: (tab: "problem" | "editor" | "tests") => void;
}

export function MobileWorkspaceTabs({
	activeTab,
	onTabChange,
}: MobileWorkspaceTabsProps) {
	return (
		<div className="w-full bg-background-3 border-b border-border flex items-center justify-around">
			<button
				onClick={() => onTabChange("problem")}
				className={cn(
					"flex-1 py-3 px-4 text-sm font-medium transition-colors relative",
					activeTab === "problem"
						? "text-foreground"
						: "text-muted-foreground hover:text-foreground"
				)}
			>
				Problem
				{activeTab === "problem" && (
					<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
				)}
			</button>
			<button
				onClick={() => onTabChange("editor")}
				className={cn(
					"flex-1 py-3 px-4 text-sm font-medium transition-colors relative",
					activeTab === "editor"
						? "text-foreground"
						: "text-muted-foreground hover:text-foreground"
				)}
			>
				Editor
				{activeTab === "editor" && (
					<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
				)}
			</button>
			<button
				onClick={() => onTabChange("tests")}
				className={cn(
					"flex-1 py-3 px-4 text-sm font-medium transition-colors relative",
					activeTab === "tests"
						? "text-foreground"
						: "text-muted-foreground hover:text-foreground"
				)}
			>
				Tests
				{activeTab === "tests" && (
					<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
				)}
			</button>
		</div>
	);
}

