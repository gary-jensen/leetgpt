interface StreamChunk {
	content?: string;
	done?: boolean;
}

export const streamAlgoCoachMessage = async (
	options: {
		problemId?: string;
		userMessage?: string;
		code?: string;
		chatHistory?: any[];
		failureSummary?: string;
		submissionData?: {
			allPassed: boolean;
			testsPassed: number;
			testsTotal: number;
			runtime?: number;
		};
		type?: "chat" | "hint" | "submission";
	},
	onChunk: (chunk: StreamChunk) => void,
	onError: (error: Error) => void
): Promise<void> => {
	try {
		const response = await fetch("/api/algo-coach/stream", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(options),
		});

		if (!response.ok) {
			// Handle rate limit errors (429)
			if (response.status === 429) {
				try {
					const errorData = await response.json();
					const errorMessage = errorData.error || "Rate limit exceeded";
					throw new Error(errorMessage);
				} catch (parseError) {
					throw new Error("Rate limit exceeded. Please try again later.");
				}
			}
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
							// Ignore parse errors
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

