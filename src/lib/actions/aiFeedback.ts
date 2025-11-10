"use server";

import OpenAI from "openai";
import { TestResult } from "@/features/Workspace/lesson-data/lesson-types";
import {
	validateJsonPayloadSize,
	sanitizeUserCode,
	validateCodeLength,
} from "@/lib/validation";
import {
	checkRateLimit,
	getRateLimitKey,
	getIPRateLimitKey,
	RATE_LIMITS,
} from "@/lib/rateLimit";
import { getClientIP } from "@/lib/serverUtils";
import { getSession } from "../auth";
import {
	getAIFeedbackSystemPrompt,
	buildSyntaxErrorPrompt,
	buildTestFailurePrompt,
} from "@/lib/prompts/aiFeedback";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

interface AIFeedbackRequest {
	stepContent: string;
	testResults: TestResult[];
	userCode: string;
	isDemo?: boolean; // Flag to identify demo requests
}

interface AIFeedbackResponse {
	feedback: string;
}

/**
 * Get AI feedback for user code based on test results
 * Allows both authenticated users and guests
 */
export async function getAIFeedback(
	request: AIFeedbackRequest
): Promise<AIFeedbackResponse> {
	try {
		// Rate limiting - get user info for rate limiting

		const session = await getSession();
		const userId = session?.user?.id;
		const clientIP = await getClientIP();

		// Determine if this is a demo request
		const isDemoRequest = request.isDemo || false;

		// Use different rate limits for demo vs production
		const rateLimitType = isDemoRequest
			? "demo_ai_feedback"
			: "ai_feedback";
		const userLimit = isDemoRequest
			? RATE_LIMITS.DEMO_AI_FEEDBACK
			: RATE_LIMITS.AI_FEEDBACK;
		const ipLimit = isDemoRequest
			? RATE_LIMITS.DEMO_AI_FEEDBACK_IP
			: RATE_LIMITS.AI_FEEDBACK_IP;

		// Rate limiting - user/guest based
		const userKey = getRateLimitKey(userId || null, null, rateLimitType);
		const userRateLimit = await checkRateLimit(
			userKey,
			userLimit.limit,
			userLimit.windowMs
		);

		if (!userRateLimit.allowed) {
			const timeRemaining = Math.ceil(
				(userRateLimit.resetTime - Date.now()) / 1000
			);
			const timeUnit = isDemoRequest
				? timeRemaining > 60
					? "minutes"
					: "seconds"
				: "seconds";
			const timeValue = isDemoRequest
				? timeRemaining > 60
					? Math.ceil(timeRemaining / 60)
					: timeRemaining
				: timeRemaining;

			return {
				feedback: `Rate limit exceeded. Please try again in ${timeValue} ${timeUnit}.`,
			};
		}

		// Rate limiting - IP based
		if (clientIP) {
			const ipKey = getIPRateLimitKey(clientIP, rateLimitType);
			const ipRateLimit = await checkRateLimit(
				ipKey,
				ipLimit.limit,
				ipLimit.windowMs
			);

			if (!ipRateLimit.allowed) {
				const timeRemaining = Math.ceil(
					(ipRateLimit.resetTime - Date.now()) / 1000
				);
				const timeUnit = isDemoRequest
					? timeRemaining > 60
						? "minutes"
						: "seconds"
					: "seconds";
				const timeValue = isDemoRequest
					? timeRemaining > 60
						? Math.ceil(timeRemaining / 60)
						: timeRemaining
					: timeRemaining;

				return {
					feedback: `Rate limit exceeded. Please try again in ${timeValue} ${timeUnit}.`,
				};
			}
		}

		// Check if code exists
		if (!request.userCode) {
			return {
				feedback:
					"No code provided. Please check the editor and try again!",
			};
		}

		// Validate code length
		if (!validateCodeLength(request.userCode)) {
			return {
				feedback:
					"Code is too long. Please keep it under 5000 characters.",
			};
		}

		// Validate payload size
		const payload = JSON.stringify(request);
		if (!validateJsonPayloadSize(payload)) {
			return {
				feedback: "Request too large. Please try with shorter code.",
			};
		}

		// Sanitize user code
		const sanitizedCode = sanitizeUserCode(request.userCode);
		if (!sanitizedCode) {
			return {
				feedback: "Invalid code provided. Please check your input.",
			};
		}

		const { stepContent, testResults } = request;

		// Check if there's a syntax error
		const hasSyntaxError = testResults.some((result) =>
			result.actualLogs?.some((log) => log.includes("Error:"))
		);

		// Create a prompt based on error type
		let prompt;
		if (hasSyntaxError) {
			// Find the first error message
			const errorResult = testResults.find((result) =>
				result.actualLogs?.some((log) => log.includes("Error:"))
			);
			const errorMessage =
				errorResult?.actualLogs?.find((log) =>
					log.includes("Error:")
				) || "Unknown syntax error";

			prompt = buildSyntaxErrorPrompt(
				stepContent,
				sanitizedCode,
				errorMessage
			);
		} else {
			// Format test information for better AI understanding
			const failedTest = testResults.find((test) => !test.passed);
			if (!failedTest) {
				// No failed test, return generic feedback
				return {
					feedback: "All tests passed! Great job!",
				};
			}

			prompt = buildTestFailurePrompt(
				stepContent,
				sanitizedCode,
				testResults,
				failedTest
			);
		}

		// Check if OpenAI API key is configured
		if (!process.env.OPENAI_API_KEY) {
			return {
				feedback:
					"AI feedback service is not available. Please try again later.",
			};
		}

		// Call OpenAI API with optimizations for speed
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content: getAIFeedbackSystemPrompt(),
				},
				{
					role: "user",
					content: prompt,
				},
			],
		});

		const aiResponse = completion.choices[0]?.message?.content;

		// Parse the JSON response from AI
		let feedback;
		try {
			const parsed = JSON.parse(aiResponse || "{}");
			feedback =
				parsed.feedback ||
				"Your code needs some adjustments. Try again!";
		} catch (error) {
			// If AI doesn't return valid JSON, use the raw response
			feedback =
				aiResponse || "Your code needs some adjustments. Try again!";
		}

		return { feedback };
	} catch (error) {
		// console.error("Error processing AI feedback request:", error);
		return {
			feedback:
				"I'm sorry, I encountered an error while processing your request. Please try again.",
		};
	}
}
