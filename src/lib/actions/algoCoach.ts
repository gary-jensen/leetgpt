"use server";

import { ChatMessage, HintResponse } from "@/types/algorithm-types";
import { getAlgoProblem } from "@/features/algorithms/data";

export async function getHint(
	problemId: string,
	code?: string,
	chatHistory?: ChatMessage[],
	failureSummary?: string
): Promise<HintResponse> {
	const problem = getAlgoProblem(problemId);

	if (!problem) {
		throw new Error("Problem not found");
	}

	// Build context for AI
	const context = buildHintContext(
		problem,
		code,
		chatHistory,
		failureSummary
	);

	// For MVP, we'll use a simple rule-based hint system
	// In production, this would call an AI service
	const hint = generateHint(problem, code, failureSummary);

	return {
		message: hint.message,
		followUpQuestion: hint.followUpQuestion,
	};
}

export async function reviewOptimality(
	problemId: string,
	code: string,
	language: "javascript"
): Promise<{
	isOptimal: boolean;
	summary: string;
	suggestion?: string;
}> {
	const problem = getAlgoProblem(problemId);

	if (!problem) {
		throw new Error("Problem not found");
	}

	// Simple analysis for MVP
	const analysis = analyzeCodeOptimality(code, problem);

	return {
		isOptimal: analysis.isOptimal,
		summary: analysis.summary,
		suggestion: analysis.suggestion,
	};
}

function buildHintContext(
	problem: any,
	code?: string,
	chatHistory?: ChatMessage[],
	failureSummary?: string
): string {
	let context = `Problem: ${problem.title}\n`;
	context += `Statement: ${problem.statementMd}\n`;
	context += `Topics: ${problem.topics.join(", ")}\n`;
	context += `Difficulty: ${problem.difficulty}\n`;

	if (code) {
		context += `\nUser's code:\n${code}\n`;
	}

	if (failureSummary) {
		context += `\nTest failures: ${failureSummary}\n`;
	}

	if (chatHistory && chatHistory.length > 0) {
		context += `\nPrevious conversation:\n`;
		chatHistory.forEach((msg) => {
			context += `${msg.role}: ${msg.content}\n`;
		});
	}

	return context;
}

function generateHint(
	problem: any,
	code?: string,
	failureSummary?: string
): HintResponse {
	// Simple rule-based hints for MVP
	const topic = problem.topics[0];

	if (failureSummary) {
		if (failureSummary.includes("undefined")) {
			return {
				message:
					"It looks like you might have an undefined variable. Check your variable declarations!",
				followUpQuestion:
					"What variables are you using in your solution?",
			};
		}

		if (failureSummary.includes("TypeError")) {
			return {
				message:
					"There's a type error in your code. Make sure you're calling methods on the right data types.",
				followUpQuestion: "What data types are you working with?",
			};
		}

		return {
			message:
				"Your code isn't passing all tests yet. Take a closer look at the failing test cases.",
			followUpQuestion:
				"What do you think might be causing the test failures?",
		};
	}

	// Topic-based hints
	switch (topic) {
		case "hashmap":
			return {
				message:
					"Consider using a hash map to store values as you iterate through the array.",
				followUpQuestion:
					"What information would be useful to store in a hash map for this problem?",
			};

		case "two-pointers":
			return {
				message:
					"Try using two pointers - one at the beginning and one at the end of the array.",
				followUpQuestion:
					"How could you move the pointers based on the current values?",
			};

		case "sliding-window":
			return {
				message:
					"Think about maintaining a window of elements as you iterate through the array.",
				followUpQuestion:
					"What should you do when the window becomes too large or too small?",
			};

		case "arrays":
			return {
				message:
					"Consider what information you need to track as you go through the array.",
				followUpQuestion:
					"What's the most efficient way to process each element?",
			};

		default:
			return {
				message:
					"Think about the problem step by step. What's the first thing you need to do?",
				followUpQuestion:
					"What data structure or approach might help you solve this efficiently?",
			};
	}
}

function analyzeCodeOptimality(
	code: string,
	problem: any
): {
	isOptimal: boolean;
	summary: string;
	suggestion?: string;
} {
	// Simple analysis for MVP
	const hasNestedLoops =
		(code.match(/for\s*\([^)]*\)\s*{[\s\S]*for\s*\([^)]*\)\s*{/g) || [])
			.length > 0;
	const hasHashMap =
		code.includes("Map") || code.includes("{}") || code.includes("new Map");
	const hasTwoPointers = code.includes("left") && code.includes("right");

	const topic = problem.topics[0];
	const expectedTime = problem.rubric.optimal_time;

	let isOptimal = false;
	let summary = "";
	let suggestion = "";

	if (expectedTime === "O(n)") {
		if (hasNestedLoops) {
			isOptimal = false;
			summary = "O(n²) - Nested loops detected";
			suggestion =
				"Try using a hash map or two pointers to achieve O(n) time complexity";
		} else if (topic === "hashmap" && hasHashMap) {
			isOptimal = true;
			summary = "O(n) - Good use of hash map";
		} else if (topic === "two-pointers" && hasTwoPointers) {
			isOptimal = true;
			summary = "O(n) - Good use of two pointers";
		} else {
			isOptimal = true;
			summary = "O(n) - Single pass solution";
		}
	} else if (expectedTime === "O(n log n)") {
		if (hasNestedLoops) {
			isOptimal = false;
			summary = "O(n²) - Nested loops detected";
			suggestion =
				"Consider sorting the array first, then using a more efficient approach";
		} else {
			isOptimal = true;
			summary = "O(n log n) - Efficient solution";
		}
	} else {
		isOptimal = true;
		summary = "Looks efficient for this problem";
	}

	return { isOptimal, summary, suggestion };
}
