import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth";
import { checkRateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { getAlgoProblem } from "@/features/algorithms/data";

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

		// Check rate limit
		const rateLimitKey = getRateLimitKey(
			session.user.id,
			null,
			`algo-coach-${type}`
		);
		const rateLimitCheck = await checkRateLimit(rateLimitKey, 60, 3600000);
		if (!rateLimitCheck.allowed) {
			return new Response(
				JSON.stringify({
					error: `Rate limit exceeded. Try again in ${Math.ceil(
						(rateLimitCheck.resetTime - Date.now()) / 60000
					)} minutes.`,
				}),
				{ status: 429 }
			);
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

		if (type === "hint" && body.failureSummary) {
			context += `\nTest failures: ${body.failureSummary}\n`;
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
				// Will need to check optimality - for now just pass basic info
				context += `\nThe user's solution passed all tests. Provide an encouraging response. If you can determine the complexity, mention if there's a more optimal approach without giving specific hints (only if there is a more optimal approach. Sometimes there isn't, so don't talk about optimizing it further. Make it seem like they can move on!). Keep it short (2-4 sentences max).`;
			} else {
				context += `\nThe user's solution failed some tests. Provide an encouraging message. Do NOT give hints unless explicitly asked. Just acknowledge their progress and encourage them to keep trying. Keep it short, 1 sentence max. End the response with "Ask me a question if you would like some help!" on a new line`;
			}
		}

		// Create streaming response
		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				try {
					const openaiStream = await openai.chat.completions.create({
						model: "gpt-4o-mini",
						messages: [
							{ role: "system", content: COACH_SYSTEM_PROMPT },
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
