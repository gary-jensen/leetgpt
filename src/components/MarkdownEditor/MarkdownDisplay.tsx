"use client";

import { cn } from "@/lib/utils";
import "./MarkdownDisplay.css";
import { useEffect, useState, useRef } from "react";

interface WordNode {
	word: string;
	htmlBefore: string;
	htmlAfter: string;
	isVisible: boolean;
}

const MarkdownDisplay = ({
	content,
	className,
	enableTypingAnimation = false,
}: {
	content: string;
	className?: string;
	enableTypingAnimation?: boolean;
}) => {
	const [wordNodes, setWordNodes] = useState<WordNode[]>([]);
	const [currentWordIndex, setCurrentWordIndex] = useState(0);
	const animationRef = useRef<NodeJS.Timeout | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Parse HTML content and extract words with their positions
	const parseHtmlContent = (html: string): WordNode[] => {
		if (!html) return [];

		// Create a temporary div to parse the HTML
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;

		// Extract all text content while preserving word order
		const textContent = tempDiv.textContent || tempDiv.innerText || "";
		const allWords = textContent
			.split(/\s+/)
			.filter((word) => word.trim().length > 0);

		return allWords.map((word) => ({
			word: word.trim(),
			htmlBefore: "",
			htmlAfter: "",
			isVisible: false,
		}));
	};

	// Initialize the DOM with or without typing animation
	useEffect(() => {
		if (!containerRef.current || !content) {
			return;
		}

		if (!enableTypingAnimation) {
			// No animation - just set the content directly
			containerRef.current.innerHTML = content;
			return;
		}

		// Parse the HTML to work with DOM nodes for animation
		const parser = new DOMParser();
		const doc = parser.parseFromString(content, "text/html");
		const container = doc.body;

		let wordIndex = 0;

		// Recursively process text nodes and wrap all words
		const processTextNodes = (node: Node): void => {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || "";
				const words = text.split(/(\s+)/); // Keep whitespace

				let newHtml = "";
				words.forEach((segment) => {
					if (segment.trim().length > 0) {
						// This is a word - wrap it with hidden class initially
						newHtml += `<span class="typing-word-hidden" data-word-index="${wordIndex}">${segment}</span>`;
						wordIndex++;
					} else {
						// This is whitespace
						newHtml += segment;
					}
				});

				// Replace the text node with our HTML
				if (node.parentNode) {
					const span = doc.createElement("span");
					span.innerHTML = newHtml;
					node.parentNode.replaceChild(span, node);
				}
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				// Process child nodes
				const children = Array.from(node.childNodes);
				children.forEach((child) => processTextNodes(child));
			}
		};

		processTextNodes(container);

		// Update the container with all words initially hidden
		containerRef.current.innerHTML = container.innerHTML;
	}, [content, enableTypingAnimation]);

	// Show words progressively based on currentWordIndex (only when animation enabled)
	useEffect(() => {
		if (!containerRef.current || !enableTypingAnimation) return;

		// Find all word spans and update their visibility
		const wordSpans =
			containerRef.current.querySelectorAll("[data-word-index]");
		wordSpans.forEach((span, index) => {
			if (index <= currentWordIndex) {
				span.className = "typing-word-visible";
			} else {
				span.className = "typing-word-hidden";
			}
		});
	}, [currentWordIndex, enableTypingAnimation]);

	// Initialize word parsing when content changes (only when animation enabled)
	useEffect(() => {
		if (!enableTypingAnimation) {
			setWordNodes([]);
			setCurrentWordIndex(-1);
			return;
		}

		if (content) {
			const parsed = parseHtmlContent(content);
			setWordNodes(parsed);
			setCurrentWordIndex(-1); // Start before first word
		} else {
			setWordNodes([]);
			setCurrentWordIndex(-1);
		}
	}, [content, enableTypingAnimation]);

	// Animate words appearing (only when animation enabled)
	useEffect(() => {
		if (!enableTypingAnimation || wordNodes.length === 0) return;

		// Clear any existing animation
		if (animationRef.current) {
			clearTimeout(animationRef.current);
		}

		// Start animation
		const animateNextWord = () => {
			setCurrentWordIndex((prev) => {
				const nextIndex = prev + 1;

				if (nextIndex < wordNodes.length) {
					animationRef.current = setTimeout(animateNextWord, 50);
				}

				return nextIndex;
			});
		};

		// Start the animation after a brief delay
		animationRef.current = setTimeout(animateNextWord, 300);

		return () => {
			if (animationRef.current) {
				clearTimeout(animationRef.current);
			}
		};
	}, [wordNodes, enableTypingAnimation]);

	return (
		<div
			ref={containerRef}
			className={cn("markdown-display markdown-output", className)}
		/>
	);
};
export default MarkdownDisplay;
