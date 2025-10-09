import { ChatMessage, StreamChunk } from "../types/chat";

const API_ENDPOINT = "/api/chat/stream";

export const streamMessage = async (
	messages: ChatMessage[],
	onChunk: (chunk: StreamChunk) => void,
	onError: (error: Error) => void
): Promise<void> => {
	try {
		const response = await fetch(API_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messages: messages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("No reader available");
		}

		const decoder = new TextDecoder();

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n").filter((line) => line.trim());

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.slice(6));
							onChunk(data);
						} catch (parseError) {
							console.error(
								"Error parsing stream data:",
								parseError
							);
						}
					}
				}
			}
		} finally {
			reader.releaseLock();
		}
	} catch (error) {
		onError(error instanceof Error ? error : new Error("Unknown error"));
	}
};
