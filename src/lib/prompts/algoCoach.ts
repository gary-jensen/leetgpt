/**
 * Algorithm Coach Prompts
 *
 * These prompts are used for the AI coach feature that helps students
 * solve algorithm problems through hints, chat, and submission feedback.
 */

import { AlgoProblemDetail, ChatMessage } from "@/types/algorithm-types";

/**
 * System prompt for the algorithm coach
 * Defines the coach's role, style, and rules for helping students
 */
export function getCoachSystemPrompt(): string {
	return `You are a coding mentor for algorithm interview prep. Your job is to guide students without revealing the solution directly.

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
}

/**
 * Build context for hint generation
 *
 * @param problem - The algorithm problem details
 * @param code - Optional user's current code
 * @param chatHistory - Optional previous conversation messages
 * @param failureSummary - Optional summary of test failures
 * @returns Formatted context string for hint generation
 */
export function buildHintContext(
	problem: AlgoProblemDetail,
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

/**
 * Build context for chat responses
 *
 * @param problem - The algorithm problem details
 * @param userMessage - The user's question/message
 * @param code - Optional user's current code
 * @param chatHistory - Optional previous conversation messages
 * @param testResults - Optional test execution results
 * @returns Formatted context string for chat responses
 */
export function buildChatContext(
	problem: AlgoProblemDetail,
	userMessage: string,
	code?: string,
	chatHistory?: ChatMessage[],
	testResults?: any[]
): string {
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

	return context;
}

/**
 * Build context for streaming chat/hint/submission responses
 *
 * @param problem - The algorithm problem details (optional)
 * @param type - Type of request: 'chat' | 'hint' | 'submission'
 * @param userMessage - Optional user's question/message
 * @param code - Optional user's current code
 * @param chatHistory - Optional previous conversation messages
 * @param failureSummary - Optional summary of test failures (for hints)
 * @param submissionData - Optional submission data (for submission responses)
 * @returns Formatted context string
 */
export function buildStreamContext(
	problem: AlgoProblemDetail | null,
	type: "chat" | "hint" | "submission",
	userMessage?: string,
	code?: string,
	chatHistory?: ChatMessage[],
	failureSummary?: string,
	submissionData?: {
		allPassed: boolean;
		testsPassed: number;
		testsTotal: number;
	}
): string {
	let context = "";

	if (problem) {
		context = `Problem: ${problem.title}\n`;
		context += `Statement: ${problem.statementMd}\n`;
		context += `Topics: ${problem.topics.join(", ")}\n`;
		context += `Difficulty: ${problem.difficulty}\n`;
	}

	if (code) {
		context += `\nUser's current code:\n${code}\n`;
	}

	if (type === "hint" && failureSummary) {
		context += `\nTest failures: ${failureSummary}\n`;
	}

	if (chatHistory && chatHistory.length > 0) {
		context += `\nPrevious conversation:\n`;
		chatHistory.forEach((msg: any) => {
			context += `${msg.role}: ${msg.content}\n`;
		});
	}

	if (userMessage) {
		context += `\nUser's question: ${userMessage}\n`;
	}

	if (type === "hint") {
		context += `\nProvide a helpful hint to guide the student without revealing the solution directly.`;
	}

	if (type === "submission" && submissionData) {
		context += `\nTest Results: ${submissionData.testsPassed}/${submissionData.testsTotal} tests passed\n`;
		if (submissionData.allPassed) {
			context += `\nThe user's solution passed all tests. Provide an encouraging response. If you can determine the complexity, mention if there's a more optimal approach without giving specific hints (only if there is a more optimal approach. Sometimes there isn't, so don't talk about optimizing it further. Make it seem like they can move on!). Keep it short (2-4 sentences max).`;
		} else {
			context += `\nThe user's solution failed some tests. Provide an encouraging message. Do NOT give hints unless explicitly asked. Just acknowledge their progress and encourage them to keep trying. Keep it short, 1 sentence max. End the response with "Ask me a question if you would like some help!" on a new line`;
		}
	}

	return context;
}

/**
 * Build prompt for submission response (all tests passed)
 *
 * @param context - Base context string
 * @param optimalityInfo - Optional optimality review information
 * @returns Formatted prompt for successful submissions
 */
export function buildSubmissionSuccessPrompt(
	context: string,
	optimalityInfo?: string
): string {
	const fullContext = optimalityInfo
		? `${context}${optimalityInfo}`
		: context;
	return `${fullContext}\n\nThe user's solution passed all tests. Provide an encouraging response. If the solution is not optimal (complexity mismatch), give a gentle nudge (e.g., "Your solution runs in O(n²) time. Can you try solving it with O(n) complexity?"). Do NOT give specific suggestions or hints - just mention the complexity difference and encourage trying a more optimal approach. Keep it short (2-4 sentences max).`;
}

/**
 * Build prompt for submission response (some tests failed)
 *
 * @param context - Base context string
 * @param testsPassed - Number of tests that passed
 * @param testsTotal - Total number of tests
 * @returns Formatted prompt for failed submissions
 */
export function buildSubmissionFailurePrompt(
	context: string,
	testsPassed: number,
	testsTotal: number
): string {
	return `${context}\n\nThe user's solution failed some tests (${testsPassed}/${testsTotal} passed). Provide an encouraging message. Do NOT give hints unless explicitly asked. Just acknowledge their progress and encourage them to keep trying. Keep it short (2-3 sentences max).`;
}

/**
 * Build base context for submission responses
 *
 * @param problem - The algorithm problem details
 * @param submissionData - Submission test results
 * @param code - Optional user's code
 * @param chatHistory - Optional previous conversation messages
 * @returns Base context string
 */
export function buildSubmissionBaseContext(
	problem: AlgoProblemDetail,
	submissionData: {
		allPassed: boolean;
		testsPassed: number;
		testsTotal: number;
		runtime?: number;
	},
	code?: string,
	chatHistory?: ChatMessage[]
): string {
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

	return context;
}
