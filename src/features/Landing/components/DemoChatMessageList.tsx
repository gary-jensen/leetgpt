"use client";

import { DemoMessage } from "../hooks/useDemoLesson";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import { useEffect, useState } from "react";
import "@/features/Workspace/Chat/components/ChatMarkdownDisplay.css";

// Component to handle async markdown processing
const MessageContent = ({
	content,
	messageType,
	className,
}: {
	content: string;
	messageType?: "error" | "success" | "info";
	className: string;
}) => {
	const [html, setHtml] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		const processContent = async () => {
			setIsProcessing(true);
			try {
				const processedHtml = await processMarkdown(content);
				setHtml(processedHtml);
			} catch (error) {
				console.error("Error processing markdown:", error);
				setHtml(content.replace(/</g, "&lt;").replace(/>/g, "&gt;"));
			} finally {
				setIsProcessing(false);
			}
		};

		processContent();
	}, [content]);

	return (
		<div className={className}>
			<div className="text-base leading-[1.75]">
				<div className="chat-markdown-display">
					{!isProcessing && (
						<div
							className="markdown-content"
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

/**
 * Preprocesses markdown content for streaming to handle incomplete code blocks
 */
function preprocessStreamingMarkdown(
	content: string,
	isStreaming: boolean
): { content: string; hasIncompleteCodeBlock: boolean } {
	if (!isStreaming) {
		return { content, hasIncompleteCodeBlock: false };
	}

	// Handle incomplete code blocks during streaming
	let processedContent = content;
	let hasIncompleteCodeBlock = false;

	// Count opening and closing code block markers
	const openingCodeBlocks = (processedContent.match(/```/g) || []).length;
	const isOddNumberOfCodeBlocks = openingCodeBlocks % 2 === 1;

	// Only add temporary closing if there's an odd number of ``` (incomplete code block)
	if (isOddNumberOfCodeBlocks) {
		// Find the last occurrence of ``` and check if it's truly incomplete
		const lastCodeBlockStart = processedContent.lastIndexOf("```");
		if (lastCodeBlockStart !== -1) {
			// Check if there's already a closing ``` after this position
			const afterStart = processedContent.substring(
				lastCodeBlockStart + 3
			);
			const hasClosing = afterStart.includes("```");

			if (!hasClosing) {
				// Add a temporary closing ``` to make the code block valid
				processedContent = processedContent + "\n```";
				hasIncompleteCodeBlock = true;
			}
		}
	}

	// Handle incomplete inline code during streaming
	// Count single backticks to determine if there's an incomplete inline code
	const singleBackticks = (processedContent.match(/`/g) || []).length;
	const isOddNumberOfBackticks = singleBackticks % 2 === 1;

	// Only add temporary closing backtick if there's an odd number of backticks (incomplete inline code)
	if (isOddNumberOfBackticks) {
		// Find the last backtick and check if it's truly incomplete
		const lastBacktick = processedContent.lastIndexOf("`");
		if (lastBacktick !== -1) {
			const afterBacktick = processedContent.substring(lastBacktick + 1);
			const hasClosingBacktick = afterBacktick.includes("`");

			if (!hasClosingBacktick) {
				// Add a temporary closing backtick
				processedContent = processedContent + "`";
			}
		}
	}

	return { content: processedContent, hasIncompleteCodeBlock };
}

interface DemoChatMessageListProps {
	messages: DemoMessage[];
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
	isThinking: boolean;
	streamingMessageId?: string | null;
	displayedWords?: { [messageId: string]: string[] };
}

const ThinkingAnimation = () => {
	return (
		<div className="flex items-center gap-2 text-gray-500 text-[0.925rem] leading-[2]">
			<span>thinking</span>
			<div className="flex gap-1">
				<div
					className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
					style={{ animationDelay: "0ms" }}
				></div>
				<div
					className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
					style={{ animationDelay: "150ms" }}
				></div>
				<div
					className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
					style={{ animationDelay: "300ms" }}
				></div>
			</div>
		</div>
	);
};

const ChatMarkdownDisplay = ({ content }: { content: string }) => {
	const [processedHtml, setProcessedHtml] = useState<string>("");

	useEffect(() => {
		const processContent = async () => {
			try {
				const html = await processMarkdown(content, {
					allowInlineHtml: true,
					codeBackgroundInChoices: true,
				});
				setProcessedHtml(html);
			} catch (error) {
				setProcessedHtml(
					content.replace(/</g, "&lt;").replace(/>/g, "&gt;")
				);
			}
		};

		if (content.trim()) {
			processContent();
		}
	}, [content]);

	return (
		<div className="chat-markdown-display">
			<div
				className="markdown-content"
				dangerouslySetInnerHTML={{ __html: processedHtml }}
			/>
		</div>
	);
};

export default function DemoChatMessageList({
	messages,
	messagesEndRef,
	isThinking,
	streamingMessageId,
	displayedWords = {},
}: DemoChatMessageListProps) {
	return (
		<div className="flex-1 max-h-[calc(100%-40px)] h-[calc(100%-40px)] overflow-y-auto px-3 pt-3 pb-2 space-y-2">
			{messages.map((message, index) => {
				// Get styling based on message type
				const getMessageStyling = () => {
					const baseClasses = "space-y-1";

					switch (message.type) {
						case "error":
							return `${baseClasses} border-l-4 border-red-500 pl-4 bg-red-500/10 rounded-r-lg py-2 error-message`;
						case "success":
							return `${baseClasses} border-l-4 border-green-500 pl-4 bg-green-500/10 rounded-r-lg py-2 success-message`;
						case "info":
						default:
							return baseClasses;
					}
				};

				const isStreaming = streamingMessageId === message.id;
				const isLastMessage = index === messages.length - 1;

				// Preprocess content for streaming to handle incomplete code blocks
				const { content: processedContent, hasIncompleteCodeBlock } =
					preprocessStreamingMarkdown(message.content, isStreaming);

				return (
					<MessageContent
						key={message.id}
						content={processedContent}
						messageType={message.type}
						className={getMessageStyling()}
					/>
				);
			})}

			{/* Thinking Indicator - only show when thinking and not streaming */}
			{isThinking && !streamingMessageId && (
				<div className="space-y-1 border-l-4 border-red-500 pl-4 bg-red-500/10 rounded-r-lg py-2 error-message">
					<div className="text-base leading-[1.75]">
						<div className="whitespace-pre-wrap">
							<ThinkingAnimation />
						</div>
					</div>
				</div>
			)}

			<div ref={messagesEndRef} />
		</div>
	);
}
