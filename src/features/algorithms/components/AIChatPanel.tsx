"use client";

import { Lightbulb, MessageSquareIcon } from "lucide-react";
import { ResizablePanel } from "@/components/ui/resizable";
import { useState, useRef, useEffect } from "react";
import { ChatMarkdownDisplay } from "@/components/workspace/Chat/components/ChatMarkdownDisplay";
import ThinkingAnimation from "@/components/workspace/Chat/components/ThinkingAnimation";
import { AlgoLesson } from "@/types/algorithm-types";
import { LessonModal } from "./LessonModal";
import { Button } from "@/components/ui/button";

interface AIChatPanelProps {
	chatMessages: any[];
	onSendMessage: (message: string) => void;
	isThinking?: boolean;
	relatedLessons?: AlgoLesson[];
}

export function AIChatPanel({
	chatMessages,
	onSendMessage,
	isThinking = false,
	relatedLessons = [],
}: AIChatPanelProps) {
	const [inputValue, setInputValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [chatMessages, isThinking]);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (
			e.key === "Enter" &&
			!e.shiftKey &&
			inputValue.trim() &&
			!isThinking
		) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleSend = () => {
		if (inputValue.trim() && !isThinking) {
			onSendMessage(inputValue.trim());
			setInputValue("");
		}
	};

	return (
		<ResizablePanel
			defaultSize={25}
			minSize={15}
			maxSize={50}
			className="flex flex-col"
		>
			<div className="bg-background flex flex-col rounded-2xl border-[#2f2f2f] border-1 overflow-hidden h-full">
				{/* Header */}
				<div className="px-3 py-3.5 flex items-center gap-2 border-b shadow-md">
					<MessageSquareIcon size={18} />
					AI Mentor
				</div>

				{/* Messages */}
				<div className="flex-1 max-h-[calc(100%-40px)] h-[calc(100%-40px)] overflow-y-auto px-3 pt-3 pb-2 space-y-2">
					{chatMessages.length === 0 ? (
						<div className="text-center text-muted-foreground py-8">
							<Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
							<p>Ask me anything about this problem!</p>
							<p className="text-sm">
								I can help you understand the approach or debug
								your code.
							</p>
						</div>
					) : (
						chatMessages.map((message, index) => {
							// User messages - right-aligned with gray background
							if (message.role === "user") {
								return (
									<div
										key={message.id || index}
										className="space-y-1 flex justify-end"
									>
										<div className="bg-white/15 rounded-lg px-3 py-2 max-w-[80%]">
											<div className="text-base leading-[1.75]">
												<div className="whitespace-pre-wrap">
													{message.content}
												</div>
											</div>
										</div>
									</div>
								);
							}

							// Assistant messages - markdown display (left-aligned)
							// Check if message contains lesson recommendations and extract them
							const extractLessonButtons = () => {
								const buttons: AlgoLesson[] = [];

								// Check if this is a stuck/help message - if so, show all related lessons
								const isHelpMessage =
									message.content
										.toLowerCase()
										.includes("trouble") ||
									message.content
										.toLowerCase()
										.includes("help") ||
									message.content
										.toLowerCase()
										.includes("stuck");

								if (
									isHelpMessage &&
									relatedLessons.length > 0
								) {
									// For help messages, show up to 3 most relevant lessons
									return relatedLessons.slice(0, 3);
								}

								// Otherwise, find lesson titles mentioned in the message
								relatedLessons.forEach((lesson) => {
									// Check for lesson title in bold markdown (**title**) or plain text
									const titleEscaped = lesson.title.replace(
										/[.*+?^${}()|[\]\\]/g,
										"\\$&"
									);
									const boldPattern = new RegExp(
										`\\*\\*${titleEscaped}\\*\\*`,
										"i"
									);
									const plainPattern = new RegExp(
										`\\b${titleEscaped}\\b`,
										"i"
									);

									if (
										boldPattern.test(message.content) ||
										plainPattern.test(message.content)
									) {
										buttons.push(lesson);
									}
								});

								return buttons;
							};

							const lessonButtons = extractLessonButtons();

							return (
								<div
									key={message.id || index}
									className="space-y-1"
								>
									<ChatMarkdownDisplay
										content={message.content}
										isStreaming={false}
										enableTypingAnimation={false}
										isLastMessage={
											index + 1 === chatMessages.length
										}
										messagesEndRef={
											index + 1 === chatMessages.length
												? messagesEndRef
												: undefined
										}
									/>
									{/* Render lesson buttons below the message */}
									{lessonButtons.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{lessonButtons.map((lesson) => (
												<LessonModal
													key={lesson.id}
													lesson={lesson}
												>
													<Button
														size="sm"
														variant="outline"
														className="text-xs"
													>
														📚 {lesson.title}
													</Button>
												</LessonModal>
											))}
										</div>
									)}
								</div>
							);
						})
					)}

					{/* Thinking animation */}
					{isThinking && (
						<div className="space-y-1">
							<div className="text-base leading-[1.75]">
								<div className="whitespace-pre-wrap">
									<ThinkingAnimation />
								</div>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Input */}
				<div className="border-t border-gray-200 p-3">
					<div className="flex gap-2">
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Type your message..."
							disabled={isThinking}
							className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
						/>
						<button
							onClick={handleSend}
							disabled={!inputValue.trim() || isThinking}
							className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							Send
						</button>
					</div>
				</div>
			</div>
		</ResizablePanel>
	);
}
