import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth";
import { checkHourlyLimit, getSubscriptionTier } from "@/lib/hourlyLimits";
import { SubscriptionStatusValue } from "@/lib/actions/billing";
import { getAlgoProblem } from "@/features/algorithms/data";
import { prisma } from "@/lib/prisma";
import {
	getCoachSystemPrompt,
	buildStreamContext,
} from "@/lib/prompts/algoCoach";
import {
	checkAndExpireTrial,
	updateExpiredTrial,
} from "@/lib/utils/subscription";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
	try {
		const session = await getSession();
		if (!session?.user?.id) {
			return new Response(
				JSON.stringify({ error: "Authentication required" }),
				{ status: 401 }
			);
		}

		const body = await req.json();
		const {
			problemId,
			userMessage,
			code,
			chatHistory,
			failureSummary,
			submissionData,
			type = "chat", // 'chat' | 'hint' | 'submission'
		} = body;

		// Check and expire trial if needed (synchronous, uses session data)
		if (session.user.subscriptionStatus === undefined) {
			return new Response(
				JSON.stringify({ error: "Subscription data not available" }),
				{ status: 500 }
			);
		}

		const needsDbUpdate = checkAndExpireTrial(
			{
				subscriptionStatus: session.user.subscriptionStatus,
				stripeCurrentPeriodEnd:
					session.user.stripeCurrentPeriodEnd || null,
				stripeSubscriptionId: session.user.stripeSubscriptionId || null,
				role: session.user.role || null,
			},
			session
		);

		// Update database asynchronously if needed (fire and forget)
		if (needsDbUpdate) {
			updateExpiredTrial(session.user.id).catch((error) => {
				console.error("Failed to update expired trial:", error);
			});
		}

		// Determine subscription tier using session data
		const subscriptionTier = getSubscriptionTier(
			session.user.role || null,
			session.user.subscriptionStatus,
			session.user.stripePriceId || null
		);

		// Block canceled/expired users (BASIC role with no subscription or expired trial)
		if (subscriptionTier === "CANCELED") {
			const isExpired = session.user.subscriptionStatus === "expired";
			const errorMessage = isExpired
				? "Your free trial has expired. Please upgrade to Pro to use chat."
				: "Access denied. Please upgrade to Pro.";

			return new Response(
				JSON.stringify({
					error: errorMessage,
				}),
				{ status: 403 }
			);
		}

		// Map request type to limit type
		// 'hint' and 'chat' share the same limit pool
		const limitType = type === "submission" ? "submission" : "hint-chat";

		// Only check rate limit for submissions if they passed (successful submissions use AI)
		// Failing submissions should not reach this API route (handled in component with hardcoded responses)
		const shouldCheckLimit =
			type !== "submission" ||
			(type === "submission" && submissionData?.allPassed === true);

		if (shouldCheckLimit) {
			// Check hourly limit based on subscription tier
			const limitCheck = await checkHourlyLimit(
				session.user.id,
				limitType,
				subscriptionTier
			);

			if (!limitCheck.allowed) {
				const minutesRemaining = Math.ceil(
					(limitCheck.resetTime - Date.now()) / 60000
				);
				const actionName =
					type === "submission"
						? "submission responses"
						: type === "hint"
						? "hints"
						: "chat messages";

				let errorMessage = `You've reached your hourly limit for ${actionName}. Please try again in ${minutesRemaining} minute${
					minutesRemaining !== 1 ? "s" : ""
				}.`;

				// Add upgrade suggestion for trial users
				if (subscriptionTier === "TRIAL") {
					errorMessage += ` Pick a plan for higher limits!`;
				}

				return new Response(JSON.stringify({ error: errorMessage }), {
					status: 429,
				});
			}
		}

		// Get problem if needed
		let problem = null;
		if (problemId) {
			problem = await getAlgoProblem(problemId);
			if (!problem) {
				return new Response(
					JSON.stringify({ error: "Problem not found" }),
					{ status: 404 }
				);
			}
		}

		// Build context based on type
		const context = buildStreamContext(
			problem,
			type,
			userMessage,
			code,
			chatHistory,
			type === "hint" ? body.failureSummary : undefined,
			submissionData
		);

		// Create streaming response
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				try {
					const openaiStream = await openai.chat.completions.create({
						model: "gpt-4o-mini",
						messages: [
							{ role: "system", content: getCoachSystemPrompt() },
							{ role: "user", content: context },
						],
						temperature: 0.7,
						max_tokens: type === "hint" ? 300 : 500,
						stream: true,
					});

					for await (const chunk of openaiStream) {
						const deltaContent = chunk.choices[0]?.delta?.content;
						// Skip if content is null, undefined, or empty
						if (deltaContent && typeof deltaContent === "string") {
							// Convert bullet character (•) to markdown bullet (-)
							const content = deltaContent.replace(/•/g, "-");
							const data = JSON.stringify({ content });
							controller.enqueue(
								encoder.encode(`data: ${data}\n\n`)
							);
						}
					}

					// Send done signal
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ done: true })}\n\n`
						)
					);
					controller.close();
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: "Unknown error";
					controller.error(new Error(errorMessage));
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
		});
	}
}
