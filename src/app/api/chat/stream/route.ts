import { NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
	try {
		const { messages } = await request.json();

		if (!process.env.OPENAI_API_KEY) {
			return new Response(
				JSON.stringify({
					content:
						"OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.",
					done: true,
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		const stream = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: messages.map((msg: any) => ({
				role: msg.role,
				content: msg.content,
			})),
			max_tokens: 1000,
			temperature: 0.7,
			stream: true,
		});

		const encoder = new TextEncoder();

		const readableStream = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of stream) {
						const content = chunk.choices[0]?.delta?.content || "";
						if (content) {
							const data = JSON.stringify({
								content,
								done: false,
							});
							controller.enqueue(
								encoder.encode(`data: ${data}\n\n`)
							);
						}
					}
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								content: "",
								done: true,
							})}\n\n`
						)
					);
					controller.close();
				} catch (error) {
					console.error("Error in stream:", error);
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								content:
									"I'm sorry, I encountered an error while processing your message. Please try again.",
								done: true,
							})}\n\n`
						)
					);
					controller.close();
				}
			},
		});

		return new Response(readableStream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("Error calling OpenAI API:", error);
		return new Response(
			JSON.stringify({
				content:
					"I'm sorry, I encountered an error while processing your message. Please try again.",
				done: true,
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	}
}
