export interface ChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: Date;
	messageType?: "error" | "success" | "info";
}

export interface ChatState {
	messages: ChatMessage[];
	inputValue: string;
	isLoading: boolean;
	streamingMessageId: string | null;
	displayedWords: { [messageId: string]: string[] };
	isThinking: boolean;
}

export interface StreamChunk {
	content: string;
	done: boolean;
}

export interface ChatHookReturn extends ChatState {
	handleSendMessage: () => Promise<void>;
	handleKeyPress: (e: React.KeyboardEvent) => void;
	setInputValue: (value: string) => void;
	streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number,
		messageType?: "error" | "success" | "info"
	) => Promise<void>;
	addSystemMessage: (
		content: string,
		messageType?: "error" | "success" | "info"
	) => void;
	setThinking: (thinking: boolean) => void;
	clearMessages: () => void;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
}
