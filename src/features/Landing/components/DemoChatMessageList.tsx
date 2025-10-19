"use client";

import { DemoMessage } from "../hooks/useDemoLesson";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import { useEffect, useState } from "react";
import "@/features/Workspace/Chat/components/ChatMarkdownDisplay.css";

interface DemoChatMessageListProps {
	messages: DemoMessage[];
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
	isThinking: boolean;
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
}: DemoChatMessageListProps) {
	return (
		<div className="flex-1 max-h-[calc(100%-40px)] h-[calc(100%-40px)] overflow-y-auto px-3 pt-3 pb-2 space-y-2">
			{messages.map((message) => {
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

				return (
					<div key={message.id} className={getMessageStyling()}>
						<div className="text-base leading-[1.75]">
							<ChatMarkdownDisplay content={message.content} />
						</div>
					</div>
				);
			})}

			{/* Thinking Indicator */}
			{isThinking && (
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
