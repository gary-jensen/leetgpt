"use client";

import { AlgoProblemDetail } from "@/types/algorithm-types";
import { TestResult } from "./TestResultsDisplay";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSuggestionsProps {
	problem: AlgoProblemDetail;
	code?: string;
	testResults?: TestResult[];
	onSuggestionClick: (message: string) => void;
	isThinking?: boolean;
	isLoggedIn?: boolean;
}

/**
 * Check if user has written their own code (different from starting code)
 */
function hasUserWrittenCode(
	code: string | undefined,
	startingCode: string | undefined
): boolean {
	if (!code || !startingCode) return false;
	// Normalize whitespace for comparison
	const normalizedCode = code.trim();
	const normalizedStarting = startingCode.trim();
	return normalizedCode !== normalizedStarting;
}

/**
 * Get main suggestions based on context
 */
function getMainSuggestions(
	hasUserCode: boolean,
	hasTestResults: boolean,
	allTestsPassed: boolean
): string[] {
	if (!hasUserCode) {
		// No user-written code yet - focus on understanding
		return ["Where do I start?", "Teach me this concept"];
	}

	if (hasTestResults && !allTestsPassed) {
		// Tests failing - focus on debugging
		return [
			"I'm stuck",
			"Am I on the right path?",
			"Teach me this concept",
		];
	}

	if (hasTestResults && allTestsPassed) {
		// All passing - focus on optimization
		return ["Am I on the right path?", "How can I optimize this?"];
	}

	// Has user code but no test results yet
	return ["I'm stuck", "Am I on the right path?", "Teach me this concept"];
}

/**
 * All categorized suggestions
 */
const suggestionCategories = {
	"Understanding the Problem": [
		"What is this problem asking me to do?",
		"What are the key constraints?",
		"Can you explain the examples?",
	],
	"Getting Unstuck": [
		"What data structure should I use?",
		"What approach should I take?",
		"What pattern applies here?",
		"Give me a hint",
	],
	"Learning Concepts": (topics: string[]) => {
		const commonConcepts = [
			"Explain two pointers",
			"Explain hash maps",
			"Explain dynamic programming",
			"Explain binary search",
			"Explain sliding window",
			"What's the difference between arrays and linked lists?",
		];

		// Add topic-specific suggestions
		const topicSuggestions = topics
			.filter((topic) => {
				const lowerTopic = topic.toLowerCase();
				return !commonConcepts.some((concept) =>
					concept.toLowerCase().includes(lowerTopic)
				);
			})
			.map((topic) => `Explain ${topic.toLowerCase()}`);

		return [...topicSuggestions, ...commonConcepts];
	},
	Debugging: [
		"Why are my tests failing?",
		"What edge cases am I missing?",
		"Help me debug my code",
	],
	Optimization: [
		"What's the time complexity of my solution?",
		"How can I optimize this?",
		"What's the optimal approach?",
	],
	"Code Review": [
		"Is my code following best practices?",
		"Can you review my solution?",
	],
};

export function ChatSuggestions({
	problem,
	code,
	testResults,
	onSuggestionClick,
	isThinking = false,
	isLoggedIn = true,
}: ChatSuggestionsProps) {
	const startingCode = problem.startingCode?.javascript || "";
	const hasUserCode = hasUserWrittenCode(code, startingCode);
	const hasTestResults = !!testResults && testResults.length > 0;
	const allTestsPassed =
		hasTestResults && testResults.every((result) => result.passed);

	const mainSuggestions = getMainSuggestions(
		hasUserCode,
		hasTestResults,
		allTestsPassed
	);

	const handleSuggestionClick = (message: string) => {
		if (!isThinking && isLoggedIn) {
			onSuggestionClick(message);
		}
	};

	// Don't show suggestions if user is not logged in
	if (!isLoggedIn) {
		return null;
	}

	return (
		<div className="flex items-center gap-2 px-2 pb-2 flex-wrap">
			{/* Main Suggestions */}
			{mainSuggestions.map((suggestion, index) => (
				<Button
					key={index}
					variant="outline"
					size="sm"
					onClick={() => handleSuggestionClick(suggestion)}
					disabled={isThinking}
					className={cn(
						"text-xs h-7 px-3 rounded-full border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white/90 font-normal",
						isThinking && "opacity-50 cursor-not-allowed"
					)}
				>
					{suggestion}
				</Button>
			))}

			{/* More Options Dropdown */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						disabled={isThinking}
						className={cn(
							"text-xs h-7 w-7 p-0 rounded-full border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white/90 font-normal",
							isThinking && "opacity-50 cursor-not-allowed"
						)}
						aria-label="More suggestions"
					>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-56 bg-[#2C2C2C] border-[#505050] text-white"
				>
					<DropdownMenuLabel className="text-white/70">
						More Questions
					</DropdownMenuLabel>
					<DropdownMenuSeparator className="bg-[#505050]" />

					{/* Understanding the Problem */}
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="text-white hover:bg-white/10 focus:bg-white/10">
							Understanding the Problem
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="bg-[#2C2C2C] border-[#505050]">
							{suggestionCategories[
								"Understanding the Problem"
							].map((suggestion, index) => (
								<DropdownMenuItem
									key={index}
									onClick={() =>
										handleSuggestionClick(suggestion)
									}
									className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
								>
									{suggestion}
								</DropdownMenuItem>
							))}
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					{/* Getting Unstuck */}
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="text-white hover:bg-white/10 focus:bg-white/10">
							Getting Unstuck
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="bg-[#2C2C2C] border-[#505050]">
							{suggestionCategories["Getting Unstuck"].map(
								(suggestion, index) => (
									<DropdownMenuItem
										key={index}
										onClick={() =>
											handleSuggestionClick(suggestion)
										}
										className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
									>
										{suggestion}
									</DropdownMenuItem>
								)
							)}
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					{/* Learning Concepts */}
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="text-white hover:bg-white/10 focus:bg-white/10">
							Learning Concepts
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="bg-[#2C2C2C] border-[#505050]">
							{(typeof suggestionCategories[
								"Learning Concepts"
							] === "function"
								? suggestionCategories["Learning Concepts"](
										problem.topics
								  )
								: suggestionCategories["Learning Concepts"]
							).map((suggestion: string, index: number) => (
								<DropdownMenuItem
									key={index}
									onClick={() =>
										handleSuggestionClick(suggestion)
									}
									className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
								>
									{suggestion}
								</DropdownMenuItem>
							))}
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<DropdownMenuSeparator className="bg-[#505050]" />

					{/* Debugging */}
					{hasUserCode && (
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="text-white hover:bg-white/10 focus:bg-white/10">
								Debugging
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="bg-[#2C2C2C] border-[#505050]">
								{suggestionCategories["Debugging"].map(
									(suggestion, index) => (
										<DropdownMenuItem
											key={index}
											onClick={() =>
												handleSuggestionClick(
													suggestion
												)
											}
											className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
										>
											{suggestion}
										</DropdownMenuItem>
									)
								)}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					)}

					{/* Optimization */}
					{hasUserCode && (
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="text-white hover:bg-white/10 focus:bg-white/10">
								Optimization
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="bg-[#2C2C2C] border-[#505050]">
								{suggestionCategories["Optimization"].map(
									(suggestion, index) => (
										<DropdownMenuItem
											key={index}
											onClick={() =>
												handleSuggestionClick(
													suggestion
												)
											}
											className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
										>
											{suggestion}
										</DropdownMenuItem>
									)
								)}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					)}

					{/* Code Review */}
					{hasUserCode && (
						<>
							<DropdownMenuSeparator className="bg-[#505050]" />
							<DropdownMenuSub>
								<DropdownMenuSubTrigger className="text-white hover:bg-white/10 focus:bg-white/10">
									Code Review
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="bg-[#2C2C2C] border-[#505050]">
									{suggestionCategories["Code Review"].map(
										(suggestion, index) => (
											<DropdownMenuItem
												key={index}
												onClick={() =>
													handleSuggestionClick(
														suggestion
													)
												}
												className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
											>
												{suggestion}
											</DropdownMenuItem>
										)
									)}
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
