"use client";

import { useEffect, useState, useRef } from "react";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import { cn } from "@/lib/utils";
import "./ChatMarkdownDisplay.css";

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

interface ChatMarkdownDisplayProps {
	content: string;
	className?: string;
	isStreaming?: boolean;
	enableTypingAnimation?: boolean;
	messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}

export const ChatMarkdownDisplay = ({
	content,
	className,
	isStreaming = false,
	messagesEndRef,
}: ChatMarkdownDisplayProps) => {
	const [processedHtml, setProcessedHtml] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [hasIncompleteCodeBlock, setHasIncompleteCodeBlock] = useState(false);
	const lastProcessedContent = useRef<string>("");

	useEffect(() => {
		if (!content.trim()) {
			setProcessedHtml("");
			setHasIncompleteCodeBlock(false);
			lastProcessedContent.current = "";
			return;
		}

		// Only process if content has actually changed
		if (lastProcessedContent.current === content) {
			return;
		}

		const processContent = async () => {
			setIsProcessing(true);
			try {
				// Preprocess content for streaming to handle incomplete code blocks
				const {
					content: preprocessedContent,
					hasIncompleteCodeBlock: incomplete,
				} = preprocessStreamingMarkdown(content, isStreaming);
				setHasIncompleteCodeBlock(incomplete);

				const html = await processMarkdown(preprocessedContent, {
					allowInlineHtml: true,
					codeBackgroundInChoices: true,
				});
				setProcessedHtml(html);
				lastProcessedContent.current = content;
			} catch (error) {
				// console.error("Error processing markdown:", error);
				// Fallback to plain text if markdown processing fails
				setProcessedHtml(
					content.replace(/</g, "&lt;").replace(/>/g, "&gt;")
				);
				setHasIncompleteCodeBlock(false);
				lastProcessedContent.current = content;
			} finally {
				setIsProcessing(false);
			}
		};

		processContent();
	}, [content, isStreaming]);

	// Trigger scroll when streaming completes (when isStreaming changes from true to false)
	useEffect(() => {
		if (!isStreaming && messagesEndRef?.current) {
			// Small delay to ensure the DOM has updated with the final content
			const timeoutId = setTimeout(() => {
				// Find the scrollable parent container
				const scrollableParent = messagesEndRef.current?.parentElement;
				if (scrollableParent) {
					// Always scroll to the absolute bottom of the container
					scrollableParent.scrollTop = scrollableParent.scrollHeight;
				}
			}, 150); // Increased delay to ensure content is fully rendered

			return () => clearTimeout(timeoutId);
		}
	}, [isStreaming, messagesEndRef]);

	// Also trigger scroll when markdown processing completes and we're not streaming
	useEffect(() => {
		if (
			!isStreaming &&
			!isProcessing &&
			processedHtml &&
			messagesEndRef?.current
		) {
			// Small delay to ensure the DOM has updated with the processed content
			const timeoutId = setTimeout(() => {
				const scrollableParent = messagesEndRef.current?.parentElement;
				if (scrollableParent) {
					scrollableParent.scrollTop = scrollableParent.scrollHeight;
				}
			}, 100);

			return () => clearTimeout(timeoutId);
		}
	}, [isStreaming, isProcessing, processedHtml, messagesEndRef]);

	// Show loading state while processing
	if (isProcessing && !processedHtml) {
		return (
			<div className={cn("chat-markdown-loading", className)}>
				<div className="flex items-center space-x-2">
					<div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
					<div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
					<div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
				</div>
			</div>
		);
	}

	// For streaming messages, show the processed content with a cursor
	if (isStreaming) {
		// Add streaming indicator class to incomplete code blocks
		let displayHtml = processedHtml;
		if (hasIncompleteCodeBlock) {
			// Add streaming class to the last pre element (which should be the incomplete code block)
			displayHtml = displayHtml.replace(
				/(<pre[^>]*>[\s\S]*?<\/pre>)(?![\s\S]*<pre)/,
				(match) =>
					match.replace("<pre", '<pre class="streaming-code-block"')
			);
		}

		return (
			<div className={cn("chat-markdown-display", className)}>
				<div
					className="markdown-content"
					dangerouslySetInnerHTML={{ __html: displayHtml }}
				/>
			</div>
		);
	}

	// For completed messages, show the processed content
	return (
		<div className={cn("chat-markdown-display", className)}>
			<div
				className="markdown-content"
				dangerouslySetInnerHTML={{ __html: processedHtml }}
			/>
		</div>
	);
};
