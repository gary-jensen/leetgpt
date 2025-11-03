"use client";

import { ResizablePanel } from "@/components/ui/resizable";
import { AlgoProblemDetail, AlgoLesson } from "@/types/algorithm-types";
import { ChatMarkdownDisplay } from "@/components/workspace/Chat/components/ChatMarkdownDisplay";
import { useState, useRef, useEffect } from "react";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import ThinkingAnimation from "@/components/workspace/Chat/components/ThinkingAnimation";
import { SubmissionMessage } from "./SubmissionMessage";
import { RelatedLessonsModal } from "./RelatedLessonsModal";
import { TopicsDropdown } from "./TopicsDropdown";
import {
	TagIcon,
	BookOpen,
	ChevronUp,
	ChevronDown,
	Plus,
	Mic,
	ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "@/components/workspace/Chat/components/ChatMarkdownDisplay.css";
import "./ProblemStatement.css";
import { Button } from "@/components/ui/button";

interface ProblemStatementChatProps {
	problem: AlgoProblemDetail;
	processedStatement: string;
	chatMessages: any[];
	onSendMessage: (message: string) => void;
	isThinking?: boolean;
	relatedLessons?: AlgoLesson[];
	defaultSize?: number; // Default panel size (for 2 or 3 column layouts)
}

export function ProblemStatementChat({
	problem,
	processedStatement,
	chatMessages,
	onSendMessage,
	isThinking = false,
	relatedLessons = [],
	defaultSize = 50,
}: ProblemStatementChatProps) {
	const [inputValue, setInputValue] = useState("");
	const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
	const [
		processedExamplesAndConstraints,
		setProcessedExamplesAndConstraints,
	] = useState<string>("");
	const [isScrolled, setIsScrolled] = useState(false);
	const [isStickyExpanded, setIsStickyExpanded] = useState(false);
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const hasUserMessagesRef = useRef(false);
	const isInitialStickyRenderRef = useRef(false);

	// Process examples and constraints
	useEffect(() => {
		const processExamplesAndConstraints = async () => {
			// If examplesAndConstraintsHtml exists, use it
			if (problem.examplesAndConstraintsHtml) {
				setProcessedExamplesAndConstraints(
					problem.examplesAndConstraintsHtml
				);
				return;
			}

			// Otherwise, if examplesAndConstraintsMd exists, process it
			if (problem.examplesAndConstraintsMd) {
				try {
					const html = await processMarkdown(
						problem.examplesAndConstraintsMd,
						{
							allowInlineHtml: true,
							codeBackgroundInChoices: true,
						}
					);
					setProcessedExamplesAndConstraints(html);
				} catch (error) {
					console.error(
						"Error processing examples/constraints:",
						error
					);
					setProcessedExamplesAndConstraints("");
				}
			} else {
				// No examples/constraints yet - show empty
				setProcessedExamplesAndConstraints("");
			}
		};

		processExamplesAndConstraints();
	}, [problem]);

	// Track scroll state to conditionally show shadow
	useEffect(() => {
		const container = chatContainerRef.current;
		if (!container) return;

		const handleScroll = () => {
			setIsScrolled(container.scrollTop > 0);
		};

		container.addEventListener("scroll", handleScroll);
		// Check initial scroll state
		handleScroll();

		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Auto-scroll to bottom when new messages arrive (but not for initial problem statement/examples)
	useEffect(() => {
		// Only auto-scroll if there are actual chat messages beyond the initial ones
		const nonInitialMessages = chatMessages.filter(
			(msg) =>
				msg.id !== "problem-statement" &&
				msg.id !== "examples-constraints"
		);
		if (nonInitialMessages.length > 0) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
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

	// Get problem statement and examples/constraints from chatMessages
	const problemStatementMessage = chatMessages.find(
		(msg) => msg.id === "problem-statement"
	);
	const examplesConstraintsMessage = chatMessages.find(
		(msg) => msg.id === "examples-constraints"
	);

	// Filter out initial messages from chatMessages for display
	const displayMessages = chatMessages.filter(
		(msg) =>
			msg.id !== "problem-statement" && msg.id !== "examples-constraints"
	);

	// Check if user has interacted (any message beyond problem statement/examples-constraints)
	// This includes: user messages, submissions, hints (AI responses), or any other interaction
	// If yes, make problem statement sticky
	const hasUserMessages = displayMessages.length > 0;

	// Trigger animation when hasUserMessages becomes true for the first time
	useEffect(() => {
		if (hasUserMessages && !hasUserMessagesRef.current) {
			hasUserMessagesRef.current = true;
			isInitialStickyRenderRef.current = true;
			// Start expanded immediately (no animation on initial render)
			setIsStickyExpanded(true);
			setShouldAnimate(false); // Disable animation for initial expanded state
			// Immediately enable animation and collapse (no delay)
			requestAnimationFrame(() => {
				isInitialStickyRenderRef.current = false;
				setShouldAnimate(true);
				// Small delay to ensure transition is enabled before changing state
				setTimeout(() => {
					setIsStickyExpanded(false);
				}, 50);
			});
		} else if (!hasUserMessages) {
			// Reset when user messages are cleared
			hasUserMessagesRef.current = false;
			isInitialStickyRenderRef.current = false;
			setIsStickyExpanded(false);
			setShouldAnimate(false);
		}
	}, [hasUserMessages]);

	return (
		<ResizablePanel
			defaultSize={defaultSize}
			minSize={30}
			maxSize={70}
			className="flex flex-col"
		>
			<div className="bg-background flex flex-col rounded-2xl border-[#2f2f2f] border-1 overflow-hidden h-full">
				{/* Header */}
				<div className="flex items-center justify-between p-4 pb-2 border-b border-border flex-shrink-0">
					<h2 className="text-2xl font-bold flex items-center gap-4">
						{problem.title}
						<span
							className={cn(
								"text-sm bg-white/15 px-1.5 py-0.5 rounded-sm font-normal font-dm-sans",
								problem.difficulty === "easy"
									? "text-emerald-400"
									: problem.difficulty === "medium"
									? " text-yellow-400"
									: " text-red-500"
							)}
						>
							{problem.difficulty}
						</span>
						<span className="text-sm bg-white/15 px-1.5 py-0.5 rounded-sm font-normal font-dm-sans flex items-center gap-1">
							<TagIcon size={14} />
							Topics
						</span>
					</h2>
					{relatedLessons.length > 0 && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsLessonsModalOpen(true)}
							className="flex items-center gap-2"
						>
							<BookOpen className="w-4 h-4" />
							Related Lessons
						</Button>
					)}
				</div>
				<RelatedLessonsModal
					lessons={relatedLessons}
					open={isLessonsModalOpen}
					onOpenChange={setIsLessonsModalOpen}
				/>
				{/* Messages Container */}
				<div
					ref={chatContainerRef}
					className={cn(
						"flex-1 pb-2 space-y-2 relative pft-[calc(30vh+12px)] h-full max-h-full flex flex-col overflow-auto"
						// isStickyExpanded
						// 	? "overflow-y-hidden"
						// 	: "overflow-y-auto"
					)}
					style={{
						scrollbarWidth: "thin",
						scrollbarColor: "#9f9f9f #2C2C2C",
					}}
				>
					{/* Problem Statement - Sticky only after user messages */}
					{problemStatementMessage && (
						<div
							className={
								hasUserMessages
									? "static top-0 bottom-[-10px] z-10 bg-background mb-2 border-b-4 border-border flex flex-col overflow-y-auto"
									: "mb-2"
							}
							style={{
								boxShadow: hasUserMessages
									? "0 4px 12px 0px rgba(0, 0, 0, 0.15)"
									: "none",
								maxHeight: hasUserMessages
									? isStickyExpanded
										? "100vh"
										: "30vh"
									: "none",
								transition: isInitialStickyRenderRef.current
									? "none"
									: shouldAnimate
									? "max-height 0.8s ease"
									: hasUserMessages
									? "max-height 0.8s ease"
									: "none",
								paddingTop: "12px",
								// paddingBottom: hasUserMessages ? "4px" : "0px",
							}}
						>
							{/* Scrollable content area */}
							<div className="flex-1 ">
								<div className="space-y-1 px-3">
									<div className="chat-markdown-display problem-statement">
										<div
											className="markdown-content"
											dangerouslySetInnerHTML={{
												__html:
													problemStatementMessage.content ||
													processedStatement,
											}}
										/>
									</div>
								</div>
							</div>
							{/* Expand/Collapse Button - only show when sticky, fixed at bottom */}
							{hasUserMessages && (
								<div className="sticky bottom-1 right-2 flex justify-end px-3 pt-2 pb-1 flex-shrink-0">
									<button
										onClick={() =>
											setIsStickyExpanded(
												!isStickyExpanded
											)
										}
										className="flex items-center gap-1 text-xs opacity-80 hover:opacity-100 bg-[#3f3f3f]  px-2 py-1 rounded-sm cursor-pointer"
										aria-label={
											isStickyExpanded
												? "Collapse problem statement"
												: "Expand problem statement"
										}
									>
										{isStickyExpanded ? (
											<>
												<ChevronUp className="w-3 h-3" />
												Collapse
											</>
										) : (
											<>
												<ChevronDown className="w-3 h-3" />
												Expand
											</>
										)}
									</button>
								</div>
							)}
						</div>
					)}
					<div className="flex-1 flex flex-col overflow-y-auto space-y-4">
						{/* Examples & Constraints (scrollable) */}
						{examplesConstraintsMessage && (
							<div className="space-y-1 px-3">
								<div className="chat-markdown-display">
									<div
										className="markdown-content"
										dangerouslySetInnerHTML={{
											__html: examplesConstraintsMessage.content,
										}}
									/>
								</div>
							</div>
						)}
						{/* Fallback to processed examples/constraints if not in messages */}
						{!examplesConstraintsMessage &&
							processedExamplesAndConstraints && (
								<div className="space-y-1 px-3">
									<div className="chat-markdown-display">
										<div
											className="markdown-content"
											dangerouslySetInnerHTML={{
												__html: processedExamplesAndConstraints,
											}}
										/>
									</div>
								</div>
							)}

						{/* Regular Chat Messages */}
						{displayMessages.map((message, index) => {
							// Submission messages - card-style
							if (
								message.type === "submission" &&
								message.submissionData
							) {
								return (
									<div key={message.id || index}>
										<SubmissionMessage
											submissionData={
												message.submissionData
											}
										/>
									</div>
								);
							}

							// User messages - right-aligned with gray background
							if (message.role === "user") {
								return (
									<div
										key={message.id || index}
										className="space-y-1 flex justify-end px-3"
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
							return (
								<div
									key={message.id || index}
									className="space-y-1 px-3"
								>
									<ChatMarkdownDisplay
										content={message.content}
										isStreaming={false}
										enableTypingAnimation={false}
										isLastMessage={
											index + 1 === displayMessages.length
										}
										messagesEndRef={
											index + 1 === displayMessages.length
												? messagesEndRef
												: undefined
										}
									/>
								</div>
							);
						})}

						{/* Thinking animation */}
						{isThinking && (
							<div className="space-y-1 px-3">
								<div className="text-base leading-[1.75]">
									<div className="whitespace-pre-wrap">
										<ThinkingAnimation />
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />
					</div>
				</div>

				{/* Input - ChatGPT Style */}
				<div className="bofrder-t border-border p-2 pt-1 pb-3 bg-background">
					<div className="relative flex items-center bg-[#3f3f3f] rounded-[24px] px-4 py-3 border border-[#505050]/50 shadow-sm">
						{/* Plus Icon - Left */}
						{/* <button
							type="button"
							className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
							aria-label="Attach file"
						>
							<Plus className="w-5 h-5 text-white/70" />
						</button> */}

						{/* Text Input */}
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Ask anything"
							disabled={isThinking}
							className="flex-1 bg-transparent text-white placeholder:text-white/50 px-3 py-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-base"
						/>

						{/* Microphone Icon */}
						{/* <button
							type="button"
							className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
							aria-label="Voice input"
						>
							<Mic className="w-5 h-5 text-white/70" />
						</button> */}

						{/* Send Button - Circular with Arrow */}
						<button
							type="button"
							onClick={handleSend}
							disabled={!inputValue.trim() || isThinking}
							className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-white/90 disabled:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 ml-2"
							aria-label="Send message"
						>
							<ArrowUp className="w-4 h-4 text-black" />
						</button>
					</div>
				</div>
			</div>
		</ResizablePanel>
	);
}
