"use client";

import { AlgoProblemDetail, AlgoLesson } from "@/types/algorithm-types";
import { ChatMarkdownDisplay } from "@/components/workspace/Chat/components/ChatMarkdownDisplay";
import { useRef, useEffect } from "react";
import ThinkingAnimation from "@/components/workspace/Chat/components/ThinkingAnimation";
import { SubmissionMessage } from "./SubmissionMessage";
import { TagIcon, ChevronUp, ChevronDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/components/workspace/Chat/components/ChatMarkdownDisplay.css";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatSuggestions } from "./ChatSuggestions";

interface DescriptionTabProps {
	problem: AlgoProblemDetail;
	processedStatement: string;
	chatMessages: any[];
	onSendMessage: (message: string) => void;
	isThinking?: boolean;
	streamingMessageId?: string | null;
	relatedLessons?: AlgoLesson[];
	processedExamplesAndConstraints: string;
	examplesConstraintsMessage?: any;
	problemStatementMessage?: any;
	displayMessages: any[];
	hasUserMessages: boolean;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
	chatContainerRef: React.RefObject<HTMLDivElement | null>;
	problemStatementContentRef: React.RefObject<HTMLDivElement | null>;
	isStickyExpanded: boolean;
	setIsStickyExpanded: (expanded: boolean) => void;
	shouldAnimate: boolean;
	needsExpandCollapse: boolean;
	isExpandedBeforeMessages: boolean;
	setIsExpandedBeforeMessages: (expanded: boolean) => void;
	inputValue: string;
	setInputValue: (value: string) => void;
	handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	handleSend: () => void;
	setIsTopicsDialogOpen: (open: boolean) => void;
	hasUserMessagesRef: React.MutableRefObject<boolean>;
	isInitialStickyRenderRef: React.MutableRefObject<boolean>;
	hasInitializedExpandedStateRef: React.MutableRefObject<boolean>;
	userHasInteractedWithExpandRef: React.MutableRefObject<boolean>;
	code?: string;
	testResults?: any[];
}

export function DescriptionTab({
	problem,
	processedStatement,
	chatMessages,
	onSendMessage,
	isThinking = false,
	streamingMessageId = null,
	relatedLessons = [],
	processedExamplesAndConstraints,
	examplesConstraintsMessage,
	problemStatementMessage,
	displayMessages,
	hasUserMessages,
	messagesEndRef,
	chatContainerRef,
	problemStatementContentRef,
	isStickyExpanded,
	setIsStickyExpanded,
	shouldAnimate,
	needsExpandCollapse,
	isExpandedBeforeMessages,
	setIsExpandedBeforeMessages,
	inputValue,
	setInputValue,
	handleKeyPress,
	handleSend,
	setIsTopicsDialogOpen,
	hasUserMessagesRef,
	isInitialStickyRenderRef,
	hasInitializedExpandedStateRef,
	userHasInteractedWithExpandRef,
	code,
	testResults,
}: DescriptionTabProps) {
	const { data: session } = useSession();
	const isLoggedIn = !!session?.user?.id;

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

	// Initialize expanded state once on mount (only if content exceeds 30vh and no user messages)
	useEffect(() => {
		const contentDiv = problemStatementContentRef.current;
		if (!contentDiv || hasInitializedExpandedStateRef.current) return;

		// Use requestAnimationFrame to ensure DOM is fully rendered
		requestAnimationFrame(() => {
			if (!contentDiv || userHasInteractedWithExpandRef.current) return;

			const contentHeight = contentDiv.scrollHeight;
			const viewportHeight30vh = window.innerHeight * 0.3;
			const needsExpCollapse = contentHeight > viewportHeight30vh;

			if (needsExpCollapse && !hasUserMessages) {
				setIsExpandedBeforeMessages(true);
				hasInitializedExpandedStateRef.current = true;
			}
		});
	}, [problemStatementMessage, processedStatement, hasUserMessages]);

	// Trigger animation when hasUserMessages becomes true for the first time
	useEffect(() => {
		if (hasUserMessages && !hasUserMessagesRef.current) {
			hasUserMessagesRef.current = true;
			isInitialStickyRenderRef.current = true;
			// Sync expanded state from before-messages state if it was expanded
			const shouldStartExpanded =
				isExpandedBeforeMessages && needsExpandCollapse;
			setIsStickyExpanded(shouldStartExpanded);
			// Disable animation for initial expanded state
			// Immediately enable animation and collapse if needed (no delay)
			requestAnimationFrame(() => {
				isInitialStickyRenderRef.current = false;
				// Small delay to ensure transition is enabled before changing state
				// Only collapse if it wasn't expanded before
				if (!shouldStartExpanded) {
					setTimeout(() => {
						setIsStickyExpanded(false);
					}, 50);
				}
			});
		} else if (!hasUserMessages) {
			// Reset when user messages are cleared
			hasUserMessagesRef.current = false;
			isInitialStickyRenderRef.current = false;
			setIsStickyExpanded(false);
			// Reset the initialization flags so it can be set again if needed
			hasInitializedExpandedStateRef.current = false;
			userHasInteractedWithExpandRef.current = false;
		}
	}, [hasUserMessages, isExpandedBeforeMessages, needsExpandCollapse]);

	return (
		<div
			ref={chatContainerRef}
			className={cn(
				"flex-1 pb-2 space-y-2 relative pft-[calc(30vh+12px)] h-full max-h-full flex flex-col overflow-auto"
			)}
			style={{
				scrollbarWidth: "thin",
				scrollbarColor: "#9f9f9f #2C2C2C",
			}}
		>
			{/* Title */}
			<div className="flex justify-between items-center p-4 pb-0">
				<h2 className="text-2xl font-bold flex items-center gap-4">
					{problem.order}. {problem.title}
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
				</h2>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setIsTopicsDialogOpen(true)}
					className="flex items-center gap-2 font-normal text-[13px]"
				>
					<TagIcon className="scale-80" />
					Topics
				</Button>
			</div>
			{/* Problem Statement - Sticky only after user messages */}
			{problemStatementMessage && (
				<div
					className={cn(
						hasUserMessages
							? "static top-0 bottom-[-10px] z-10 bg-background mb-2 border-b-4 border-border flex flex-col overflow-y-auto"
							: needsExpandCollapse
							? "mb-2 border-b-4 border-border flex flex-col overflow-y-auto"
							: "mb-2"
					)}
					style={{
						boxShadow:
							hasUserMessages || needsExpandCollapse
								? "0 4px 12px 0px rgba(0, 0, 0, 0.15)"
								: "none",
						maxHeight: hasUserMessages
							? isStickyExpanded
								? "100vh"
								: "30vh"
							: needsExpandCollapse && !isExpandedBeforeMessages
							? "30vh"
							: "none",
						transition: isInitialStickyRenderRef.current
							? "none"
							: shouldAnimate
							? "max-height 0.8s ease"
							: hasUserMessages
							? "max-height 0.8s ease"
							: needsExpandCollapse
							? "max-height 0.8s ease"
							: "none",
					}}
				>
					{/* Scrollable content area */}
					<div className="flex-1 ">
						<div className="space-y-1 px-3">
							<div className="chat-markdown-display algo-problem">
								<div
									ref={problemStatementContentRef}
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

					<div className="sticky bottom-1 right-2 flex justify-end px-3 pt-2 pb-1 flex-shrink-0">
						{/* Expand/Collapse Button - show when content exceeds 30vh (before or after user messages) */}
						{needsExpandCollapse && (
							<button
								onClick={() => {
									if (hasUserMessages) {
										setIsStickyExpanded(!isStickyExpanded);
									} else {
										userHasInteractedWithExpandRef.current =
											true;
										setIsExpandedBeforeMessages(
											!isExpandedBeforeMessages
										);
									}
								}}
								className="flex items-center gap-1 text-xs opacity-80 hover:opacity-100 bg-[#3f3f3f]  px-2 py-1 rounded-sm cursor-pointer"
								aria-label={
									(
										hasUserMessages
											? isStickyExpanded
											: isExpandedBeforeMessages
									)
										? "Collapse problem statement"
										: "Expand problem statement"
								}
							>
								{(
									hasUserMessages
										? isStickyExpanded
										: isExpandedBeforeMessages
								) ? (
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
						)}
					</div>
				</div>
			)}
			<div className="flex-1 flex flex-col overflow-y-auto space-y-4">
				{/* Examples & Constraints (scrollable) */}
				{examplesConstraintsMessage && (
					<div className="space-y-1 px-3">
						<div className="chat-markdown-display algo-problem">
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
							<div className="chat-markdown-display algo-problem">
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
									submissionData={message.submissionData}
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
					const isStreaming = message.id === streamingMessageId;
					return (
						<div
							key={message.id || index}
							className="space-y-1 px-3"
						>
							<ChatMarkdownDisplay
								className="algo-problem"
								content={message.content}
								isStreaming={isStreaming}
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

			{/* Input - ChatGPT Style */}
			<div className="bofrder-t border-border p-2 pt-1 pb-1 bg-background">
				{/* Chat Suggestions */}
				<ChatSuggestions
					problem={problem}
					code={code}
					testResults={testResults}
					onSuggestionClick={(message) => {
						onSendMessage(message);
					}}
					isThinking={isThinking}
					isLoggedIn={isLoggedIn}
				/>
				<div className="relative flex items-center bg-[#3f3f3f] rounded-[24px] px-4 py-3 border border-[#505050]/50 shadow-sm">
					{/* Text Input */}
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Ask anything"
						disabled={isThinking || !isLoggedIn}
						className="flex-1 bg-transparent text-white placeholder:text-white/50 px-3 py-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-base"
					/>

					{/* Send Button - Circular with Arrow */}
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								onClick={handleSend}
								disabled={
									!inputValue.trim() ||
									isThinking ||
									!isLoggedIn
								}
								className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-white/90 disabled:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 ml-2"
								aria-label="Send message"
							>
								<ArrowUp className="w-4 h-4 text-black" />
							</button>
						</TooltipTrigger>
						{!isLoggedIn && (
							<TooltipContent>
								<p>
									You need to log in to use the chat feature
								</p>
							</TooltipContent>
						)}
					</Tooltip>
				</div>
			</div>
		</div>
	);
}
