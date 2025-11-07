"use server";

import OpenAI from "openai";
import {
	AlgoProblemDetail,
	ChatMessage,
	HintResponse,
} from "@/types/algorithm-types";
import { getAlgoProblem } from "@/features/algorithms/data";
import { getSession } from "@/lib/auth";
import { checkRateLimit, getRateLimitKey } from "@/lib/rateLimit";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const COACH_SYSTEM_PROMPT = `You are a coding mentor for algorithm interview prep. Your job is to guide students without revealing the solution directly.

Style Guidelines:
- Keep responses SHORT and SWEET - aim for 2-4 sentences max
- Use markdown formatting to make text easy to read:
  * Use **bold** for emphasis on key concepts
  * Use *italics* for gentle suggestions
  * Use \`code\` backticks for technical terms
  * Use - for bullet points in lists
  * Use line breaks to separate ideas
- Write in a friendly, conversational tone
- Make complex ideas simple and digestible

Rules:
1. Give concise hints (<= 200 characters). Prefer Socratic questions over statements.
2. Never output full code unless explicitly requested to show the solution.
3. Use chat history to avoid repeating previous hints.
4. When asked about optimality, describe Big-O complexity and name the pattern (without code).
5. If tests fail, focus on the smallest failing case or likely bug location.
6. Be concise, friendly, and constructive.
7. Help students discover the solution through guided questioning.
8. Always format your responses with markdown for better readability.

Example good hint: "What **data structure** could help you look up values quickly? Think about *constant-time* operations."
Example bad hint: "Use a hashmap to store nums[i] as keys and i as values"`;

export async function getHint(
	problem: AlgoProblemDetail,
	code?: string,
	chatHistory?: ChatMessage[],
	failureSummary?: string
): Promise<HintResponse> {
	// Check authentication
	const session = await getSession();
	if (!session?.user?.id) {
		throw new Error("Authentication required to use AI coach");
	}

	// Check rate limit (60/hour per user)
	const rateLimitKey = getRateLimitKey(
		session.user.id,
		null,
		"algo-coach-hint"
	);
	const rateLimitCheck = await checkRateLimit(rateLimitKey, 60, 3600000); // 60 requests per 3600 seconds (1 hour)
	if (!rateLimitCheck.allowed) {
		throw new Error(
			`Rate limit exceeded. You've used all 60 hints for this hour. Try again in ${Math.ceil(
				(rateLimitCheck.resetTime - Date.now()) / 60000
			)} minutes.`
		);
	}

	// const problem = await getAlgoProblem(problemId);

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

	// Call OpenAI API
	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{ role: "system", content: COACH_SYSTEM_PROMPT },
			{ role: "user", content: context },
		],
		temperature: 0.7,
		max_tokens: 300,
	});

	const aiResponse = completion.choices[0]?.message?.content || "";

	// Parse AI response for hint and follow-up question
	// Split by newline or question mark to separate hint from question
	const parts = aiResponse.split(/[\n\n]+/).filter((p) => p.trim());
	const message = parts[0]?.trim() || aiResponse.slice(0, 200);
	const followUpQuestion =
		parts.length > 1 ? parts[1]?.trim().slice(0, 200) : undefined;

	return {
		message,
		followUpQuestion,
	};
}

export async function reviewOptimality(
	problem: AlgoProblemDetail,
	code: string,
	language: "javascript"
): Promise<{
	isOptimal: boolean;
	summary: string;
	suggestion?: string;
	currentComplexity: string;
	suggestedComplexity: string;
}> {
	// Check authentication
	const session = await getSession();
	if (!session?.user?.id) {
		throw new Error("Authentication required to use AI coach");
	}

	// Check rate limit (60/hour per user)
	const rateLimitKey = getRateLimitKey(
		session.user.id,
		null,
		"algo-coach-optimality"
	);
	const rateLimitCheck = await checkRateLimit(rateLimitKey, 60, 3600000); // 60 requests per 3600 seconds (1 hour)
	if (!rateLimitCheck.allowed) {
		throw new Error(
			`Rate limit exceeded. You've used all 60 reviews for this hour. Try again in ${Math.ceil(
				(rateLimitCheck.resetTime - Date.now()) / 60000
			)} minutes.`
		);
	}

	// const problem = await getAlgoProblem(problemId);

	if (!problem) {
		throw new Error("Problem not found");
	}

	// Simple analysis for MVP (can upgrade to AI analysis later)
	const analysis = analyzeCodeOptimality(code, problem);

	return {
		isOptimal: analysis.isOptimal,
		summary: analysis.summary,
		suggestion: analysis.suggestion, // Keep for backward compatibility, but won't be used in nudges
		currentComplexity: analysis.currentComplexity || "",
		suggestedComplexity: analysis.suggestedComplexity || "",
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

export async function getChatResponse(
	problemId: string,
	userMessage: string,
	code?: string,
	chatHistory?: ChatMessage[],
	testResults?: any
): Promise<ChatMessage> {
	// Check authentication
	const session = await getSession();
	if (!session?.user?.id) {
		throw new Error("Authentication required to use AI coach");
	}

	// Check rate limit (60/hour per user)
	const rateLimitKey = getRateLimitKey(
		session.user.id,
		null,
		"algo-coach-chat"
	);
	const rateLimitCheck = await checkRateLimit(rateLimitKey, 60, 3600000); // 60 requests per hour
	if (!rateLimitCheck.allowed) {
		throw new Error(
			`Rate limit exceeded. You've used all 60 chat requests for this hour. Try again in ${Math.ceil(
				(rateLimitCheck.resetTime - Date.now()) / 60000
			)} minutes.`
		);
	}

	const problem = await getAlgoProblem(problemId);

	if (!problem) {
		throw new Error("Problem not found");
	}

	// Build context for AI
	let context = `Problem: ${problem.title}\n`;
	context += `Statement: ${problem.statementMd}\n`;
	context += `Topics: ${problem.topics.join(", ")}\n`;
	context += `Difficulty: ${problem.difficulty}\n`;

	if (code) {
		context += `\nUser's current code:\n${code}\n`;
	}

	if (testResults && testResults.length > 0) {
		const passedCount = testResults.filter((r: any) => r.passed).length;
		context += `\nTest results: ${passedCount}/${testResults.length} tests passing\n`;
	}

	if (chatHistory && chatHistory.length > 0) {
		context += `\nPrevious conversation:\n`;
		chatHistory.forEach((msg) => {
			context += `${msg.role}: ${msg.content}\n`;
		});
	}

	context += `\nUser's question: ${userMessage}\n`;

	// Call OpenAI API
	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{ role: "system", content: COACH_SYSTEM_PROMPT },
			{ role: "user", content: context },
		],
		temperature: 0.7,
		max_tokens: 500,
	});

	const aiResponse = completion.choices[0]?.message?.content || "";

	return {
		id: Date.now().toString(),
		role: "assistant",
		content: aiResponse,
		timestamp: new Date(),
	};
}

export async function getSubmissionResponse(
	problem: AlgoProblemDetail,
	submissionData: {
		allPassed: boolean;
		testsPassed: number;
		testsTotal: number;
		runtime?: number;
	},
	code?: string,
	chatHistory?: ChatMessage[]
): Promise<ChatMessage> {
	// Check authentication
	const session = await getSession();
	if (!session?.user?.id) {
		throw new Error("Authentication required to use AI coach");
	}

	// Check rate limit (60/hour per user)
	const rateLimitKey = getRateLimitKey(
		session.user.id,
		null,
		"algo-coach-submission"
	);
	const rateLimitCheck = await checkRateLimit(rateLimitKey, 60, 3600000);
	if (!rateLimitCheck.allowed) {
		throw new Error(
			`Rate limit exceeded. You've used all 60 responses for this hour. Try again in ${Math.ceil(
				(rateLimitCheck.resetTime - Date.now()) / 60000
			)} minutes.`
		);
	}

	// const problem = await getAlgoProblem(problemId);
	if (!problem) {
		throw new Error("Problem not found");
	}

	let context = `Problem: ${problem.title}\n`;
	context += `Statement: ${problem.statementMd}\n`;
	context += `Topics: ${problem.topics.join(", ")}\n`;
	context += `Difficulty: ${problem.difficulty}\n`;
	context += `\nTest Results: ${submissionData.testsPassed}/${submissionData.testsTotal} tests passed\n`;

	if (code) {
		context += `\nUser's code:\n${code}\n`;
	}

	if (chatHistory && chatHistory.length > 0) {
		context += `\nPrevious conversation:\n`;
		chatHistory.forEach((msg) => {
			context += `${msg.role}: ${msg.content}\n`;
		});
	}

	// Build prompt based on submission status
	let userPrompt = "";
	if (submissionData.allPassed) {
		// Check optimality for passing solutions
		let optimalityInfo = "";
		if (code) {
			try {
				const optimality = await reviewOptimality(
					problem,
					code,
					"javascript"
				);
				optimalityInfo = `\nOptimality Review:\n- Current Complexity: ${optimality.currentComplexity}\n- Optimal Complexity: ${optimality.suggestedComplexity}\n- Is Optimal: ${optimality.isOptimal}\n`;
				context += optimalityInfo;
			} catch (error) {
				// console.error("Error reviewing optimality:", error);
			}
		}

		userPrompt = `${context}\n\nThe user's solution passed all tests. Provide an encouraging response. If the solution is not optimal (complexity mismatch), give a gentle nudge (e.g., "Your solution runs in O(n²) time. Can you try solving it with O(n) complexity?"). Do NOT give specific suggestions or hints - just mention the complexity difference and encourage trying a more optimal approach. Keep it short (2-4 sentences max).`;
	} else {
		userPrompt = `${context}\n\nThe user's solution failed some tests (${submissionData.testsPassed}/${submissionData.testsTotal} passed). Provide an encouraging message. Do NOT give hints unless explicitly asked. Just acknowledge their progress and encourage them to keep trying. Keep it short (2-3 sentences max).`;
	}

	// Call OpenAI API
	const completion = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		messages: [
			{ role: "system", content: COACH_SYSTEM_PROMPT },
			{ role: "user", content: userPrompt },
		],
		temperature: 0.7,
		max_tokens: 200,
	});

	const aiResponse = completion.choices[0]?.message?.content || "";

	return {
		id: Date.now().toString(),
		role: "assistant",
		content: aiResponse,
		timestamp: new Date(),
	};
}

function analyzeCodeOptimality(
	code: string,
	problem: any
): {
	isOptimal: boolean;
	summary: string;
	suggestion?: string;
	currentComplexity?: string;
	suggestedComplexity?: string;
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

	const currentComplexity = summary.split(" - ")[0] || "";
	const suggestedComplexity = expectedTime || "";

	return {
		isOptimal,
		summary,
		suggestion,
		currentComplexity,
		suggestedComplexity,
	};
}
