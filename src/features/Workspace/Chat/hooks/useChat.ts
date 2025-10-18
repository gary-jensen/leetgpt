import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage, ChatState, ChatHookReturn } from "../types/chat";
import { streamMessage } from "../services/chatService";
import { generateUUID } from "@/lib/cryptoUtils";

const initialState: ChatState = {
	messages: [],
	inputValue: "",
	isLoading: false,
	streamingMessageId: null,
	displayedWords: {},
	isThinking: false,
};

export const useChat = (): ChatHookReturn => {
	const [state, setState] = useState<ChatState>(initialState);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const scrollToBottom = useCallback(() => {
		if (window.innerWidth >= 980) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		} else {
			// Find the scrollable parent container
			const scrollableParent = messagesEndRef.current?.parentElement;
			if (scrollableParent) {
				scrollableParent.scrollTop = scrollableParent.scrollHeight;
			}
		}
	}, [messagesEndRef.current]);

	useEffect(() => {
		scrollToBottom();
	}, [state.messages, state.displayedWords, scrollToBottom]);

	const handleSendMessage = useCallback(async (): Promise<void> => {
		if (!state.inputValue.trim() || state.isLoading) return;

		const userMessage: ChatMessage = {
			id: generateUUID(),
			role: "user",
			content: state.inputValue.trim(),
			timestamp: new Date(),
		};

		setState((prev) => ({
			...prev,
			messages: [...prev.messages, userMessage],
			inputValue: "",
			isLoading: true,
		}));

		const aiMessageId = generateUUID();
		setState((prev) => ({
			...prev,
			streamingMessageId: aiMessageId,
			displayedWords: {
				...prev.displayedWords,
				[aiMessageId]: [],
			},
		}));

		let fullContent = "";

		await streamMessage(
			[...state.messages, userMessage],
			(data) => {
				if (data.content) {
					fullContent += data.content;

					setState((prev) => {
						const existingMessage = prev.messages.find(
							(msg) => msg.id === aiMessageId
						);

						if (!existingMessage) {
							const aiMessage: ChatMessage = {
								id: aiMessageId,
								role: "assistant",
								content: fullContent,
								timestamp: new Date(),
							};
							return {
								...prev,
								messages: [...prev.messages, aiMessage],
							};
						}

						return {
							...prev,
							messages: prev.messages.map((msg) =>
								msg.id === aiMessageId
									? { ...msg, content: fullContent }
									: msg
							),
						};
					});
				}

				if (data.done) {
					setState((prev) => ({
						...prev,
						streamingMessageId: null,
						isLoading: false,
					}));
				}
			},
			(error) => {
				// console.error("Error sending message:", error);
				const errorMessage: ChatMessage = {
					id: aiMessageId,
					role: "assistant",
					content: "Sorry, I encountered an error. Please try again.",
					timestamp: new Date(),
				};
				setState((prev) => ({
					...prev,
					messages: [...prev.messages, errorMessage],
					streamingMessageId: null,
					isLoading: false,
				}));
			}
		);
	}, [state.inputValue, state.isLoading, state.messages]);

	const handleKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSendMessage();
			}
		},
		[handleSendMessage]
	);

	const setInputValue = useCallback((value: string) => {
		setState((prev) => ({ ...prev, inputValue: value }));
	}, []);

	// Custom message streaming function
	const streamCustomMessage = useCallback(
		async (
			content: string,
			role: "assistant" | "system" = "assistant",
			streamingSpeed: number = 50, // milliseconds between words
			messageType: "error" | "success" | "info" = "info"
		): Promise<void> => {
			const messageId = generateUUID();
			const words = content.split(" ");
			let currentWordIndex = 0;

			// Add the message to state immediately
			const customMessage: ChatMessage = {
				id: messageId,
				role,
				content: "",
				timestamp: new Date(),
				messageType,
			};

			setState((prev) => ({
				...prev,
				messages: [...prev.messages, customMessage],
				streamingMessageId: messageId,
				displayedWords: {
					...prev.displayedWords,
					[messageId]: [],
				},
			}));

			// Stream words one by one
			const streamWords = () => {
				if (currentWordIndex < words.length) {
					const currentContent = words
						.slice(0, currentWordIndex + 1)
						.join(" ");

					setState((prev) => ({
						...prev,
						messages: prev.messages.map((msg) =>
							msg.id === messageId
								? { ...msg, content: currentContent }
								: msg
						),
						displayedWords: {
							...prev.displayedWords,
							[messageId]: words.slice(0, currentWordIndex + 1),
						},
					}));

					currentWordIndex++;
					setTimeout(streamWords, streamingSpeed);
				} else {
					// Streaming complete
					setState((prev) => ({
						...prev,
						streamingMessageId: null,
					}));
				}
			};

			streamWords();
		},
		[]
	);

	// Add a system message without streaming
	const addSystemMessage = useCallback(
		(
			content: string,
			messageType: "error" | "success" | "info" = "info"
		) => {
			const systemMessage: ChatMessage = {
				id: generateUUID(),
				role: "system",
				content,
				timestamp: new Date(),
				messageType,
			};

			setState((prev) => ({
				...prev,
				messages: [...prev.messages, systemMessage],
			}));
		},
		[]
	);

	const setThinking = useCallback((thinking: boolean) => {
		setState((prev) => ({ ...prev, isThinking: thinking }));
	}, []);

	const clearMessages = useCallback(() => {
		setState((prev) => ({
			...prev,
			messages: [],
			displayedWords: {},
			streamingMessageId: null,
			isThinking: false,
		}));
	}, []);

	return {
		...state,
		handleSendMessage,
		handleKeyPress,
		setInputValue,
		streamCustomMessage,
		addSystemMessage,
		setThinking,
		clearMessages,
		messagesEndRef,
	};
};
