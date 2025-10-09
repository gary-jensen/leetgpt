"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
	processMarkdown,
	MarkdownProcessorOptions,
} from "@/lib/markdown-processor";
import "./MarkdownEditor.scss";
import "./MarkdownDisplay.css";
import MarkdownDisplay from "./MarkdownDisplay";
import { htmlToMarkdown } from "@/lib/htmlToMarkdown";

export interface MarkdownEditorProps {
	value?: string;
	onChange?: (markdown: string, html?: string) => void;
	placeholder?: string;
	readOnly?: boolean;
	showPreview?: boolean;
	minHeight?: string;
	className?: string;
	processorOptions?: MarkdownProcessorOptions;
	autoProcess?: boolean;
	// Simplified props
	simple?: boolean; // Simple single-line input mode
	enableHistory?: boolean; // Control undo/redo functionality
}

export default function MarkdownEditor({
	value = "",
	onChange,
	placeholder = "Type your markdown here...",
	readOnly = false,
	showPreview = true,
	minHeight = "300px",
	className = "",
	processorOptions = {},
	autoProcess = false,
	simple = false,
	enableHistory = true,
}: MarkdownEditorProps) {
	// Convert value to markdown if it's HTML (always convert - this is a markdown editor!)
	const initialMarkdown = (() => {
		if (!value) return "";

		// Simple heuristic: if contains HTML tags, convert to markdown
		const isHtml = /<[^>]+>/.test(value.trim());
		if (isHtml) {
			return htmlToMarkdown(value);
		}

		// Otherwise, use value as-is (already markdown or plain text)
		return value;
	})();

	const [markdown, setMarkdown] = useState(initialMarkdown);
	const [html, setHtml] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [mode, setMode] = useState<"edit" | "preview" | "split">("split");
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Undo/Redo state
	const [history, setHistory] = useState<
		Array<{ content: string; cursorPos: number }>
	>([{ content: value, cursorPos: 0 }]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const historyIndexRef = useRef(0);

	// Process markdown to HTML (manual processing)
	const processContent = useCallback(
		async (content?: string) => {
			const textToProcess = content || markdown;
			setIsProcessing(true);
			try {
				const processedHtml = await processMarkdown(
					textToProcess,
					processorOptions
				);
				setHtml(processedHtml);
				onChange?.(textToProcess, processedHtml);
			} catch (error) {
				console.error("Failed to process markdown:", error);
				setHtml(
					`<p style="color: red;">Error processing markdown: ${error}</p>`
				);
			} finally {
				setIsProcessing(false);
			}
		},
		[markdown, onChange, processorOptions]
	);

	// Update ref when historyIndex changes
	useEffect(() => {
		historyIndexRef.current = historyIndex;
	}, [historyIndex]);

	// Save to history with debouncing
	const saveToHistory = useCallback((content: string, cursorPos: number) => {
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}

		saveTimeoutRef.current = setTimeout(() => {
			setHistory((prev) => {
				// Remove any history after current index (when we're not at the end)
				const newHistory = prev.slice(0, historyIndexRef.current + 1);

				// Don't save if content is the same as current
				if (newHistory[newHistory.length - 1]?.content === content) {
					return prev;
				}

				// Add new state
				const updatedHistory = [...newHistory, { content, cursorPos }];

				// Limit history size to 50 entries
				if (updatedHistory.length > 50) {
					return updatedHistory.slice(-50);
				}

				return updatedHistory;
			});

			setHistoryIndex((prev) => prev + 1);
		}, 500); // 500ms debounce
	}, []);

	// Undo function
	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			const previousState = history[newIndex];

			setHistoryIndex(newIndex);
			setMarkdown(previousState.content);
			onChange?.(previousState.content);

			// Restore cursor position for both input and textarea
			setTimeout(() => {
				const element = simple ? inputRef.current : textareaRef.current;
				if (element) {
					element.focus();
					element.setSelectionRange(
						previousState.cursorPos,
						previousState.cursorPos
					);
				}
			}, 0);
		}
	}, [historyIndex, history, onChange, simple]);

	// Redo function
	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			const nextState = history[newIndex];

			setHistoryIndex(newIndex);
			setMarkdown(nextState.content);
			onChange?.(nextState.content);

			// Restore cursor position for both input and textarea
			setTimeout(() => {
				const element = simple ? inputRef.current : textareaRef.current;
				if (element) {
					element.focus();
					element.setSelectionRange(
						nextState.cursorPos,
						nextState.cursorPos
					);
				}
			}, 0);
		}
	}, [historyIndex, history, onChange, simple]);

	// Handle input change for both textarea and input
	const handleInputChange = (
		e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
	) => {
		const newValue = e.target.value;
		const cursorPos = e.target.selectionStart || 0;

		setMarkdown(newValue);

		// Both simple and full mode behave the same: no live processing
		// Only difference is visual (toolbar, single line vs multiline)
		onChange?.(newValue);

		// Save to history with debouncing (enabled for both simple and full modes)
		if (enableHistory) {
			saveToHistory(newValue, cursorPos);
		}
	};

	// Insert text at cursor position (for inline elements)
	const insertText = useCallback(
		(text: string, offsetCursor = 0) => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const newValue =
				markdown.substring(0, start) + text + markdown.substring(end);

			setMarkdown(newValue);
			onChange?.(newValue);

			// Set cursor position and save to history
			const newCursorPos = start + text.length + offsetCursor;
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(newCursorPos, newCursorPos);
			}, 0);

			// Save to history immediately for button actions
			saveToHistory(newValue, newCursorPos);
		},
		[markdown, onChange, saveToHistory]
	);

	// Smart block-level text insertion with toggle/replace functionality
	const insertBlockText = useCallback(
		(text: string, offsetCursor = 0) => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const start = textarea.selectionStart;
			const lines = markdown.split("\n");
			let currentLineIndex = 0;
			let charCount = 0;

			// Find which line the cursor is on
			for (let i = 0; i < lines.length; i++) {
				if (charCount + lines[i].length >= start) {
					currentLineIndex = i;
					break;
				}
				charCount += lines[i].length + 1; // +1 for newline
			}

			const currentLine = lines[currentLineIndex];
			const trimmedLine = currentLine.trim();

			// Check if the line already has the same block element
			if (currentLine.startsWith(text)) {
				// Toggle: Remove the existing block element
				lines[currentLineIndex] = currentLine.substring(text.length);
				const newValue = lines.join("\n");
				setMarkdown(newValue);
				onChange?.(newValue);

				// Set cursor position at the beginning of the content
				const newCursorPos = charCount;
				setTimeout(() => {
					textarea.focus();
					textarea.setSelectionRange(newCursorPos, newCursorPos);
				}, 0);

				// Save to history
				saveToHistory(newValue, newCursorPos);
			} else {
				// Check for other block elements to replace
				const blockPatterns = [
					/^#{1,6}\s+/, // Headings
					/^>\s+/, // Quotes
					/^[-*+]\s+/, // Unordered lists
					/^\d+\.\s+/, // Ordered lists
				];

				let lineContent = currentLine;
				let existingBlockLength = 0;

				// Find and remove existing block element
				for (const pattern of blockPatterns) {
					const match = currentLine.match(pattern);
					if (match) {
						existingBlockLength = match[0].length;
						lineContent =
							currentLine.substring(existingBlockLength);
						break;
					}
				}

				// Insert the new block element
				lines[currentLineIndex] = text + lineContent;
				const newValue = lines.join("\n");
				setMarkdown(newValue);
				onChange?.(newValue);

				// Set cursor position after the inserted text
				const newCursorPos = charCount + text.length + offsetCursor;
				setTimeout(() => {
					textarea.focus();
					textarea.setSelectionRange(newCursorPos, newCursorPos);
				}, 0);

				// Save to history
				saveToHistory(newValue, newCursorPos);
			}
		},
		[markdown, onChange, saveToHistory]
	);

	// Insert text on a new line (for standalone block elements)
	const insertNewLineText = useCallback(
		(text: string, offsetCursor = 0) => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;

			// Check if we're at the beginning of a line
			const beforeCursor = markdown.substring(0, start);
			const isAtStartOfLine =
				beforeCursor === "" || beforeCursor.endsWith("\n");

			// Insert appropriate newlines
			const prefix = isAtStartOfLine ? "" : "\n";
			const suffix = "\n";
			const fullText = prefix + text + suffix;

			const newValue =
				markdown.substring(0, start) +
				fullText +
				markdown.substring(end);

			setMarkdown(newValue);
			onChange?.(newValue);

			// Set cursor position
			const newCursorPos =
				start + prefix.length + text.length + offsetCursor;
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(newCursorPos, newCursorPos);
			}, 0);

			// Save to history
			saveToHistory(newValue, newCursorPos);
		},
		[markdown, onChange, saveToHistory]
	);

	// Wrap selected text
	const wrapText = useCallback(
		(before: string, after: string = before) => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const selectedText = markdown.substring(start, end);
			const newText = before + selectedText + after;
			const newValue =
				markdown.substring(0, start) +
				newText +
				markdown.substring(end);

			setMarkdown(newValue);
			onChange?.(newValue);

			// Set cursor position
			const newCursorPos = start + before.length + selectedText.length;
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(start + before.length, newCursorPos);
			}, 0);

			// Save to history
			saveToHistory(newValue, newCursorPos);
		},
		[markdown, onChange, saveToHistory]
	);

	// Smart ordered list insertion
	const insertOrderedList = useCallback(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const lines = markdown.split("\n");
		let currentLineIndex = 0;
		let charCount = 0;

		// Find which line the cursor is on
		for (let i = 0; i < lines.length; i++) {
			if (charCount + lines[i].length >= start) {
				currentLineIndex = i;
				break;
			}
			charCount += lines[i].length + 1;
		}

		const currentLine = lines[currentLineIndex];

		// Check if it's already an ordered list
		const orderedMatch = currentLine.match(/^(\d+)\.\s+/);
		let listNumber = 1;
		let isRemoving = false;

		if (orderedMatch) {
			// Toggle: Remove the ordered list
			lines[currentLineIndex] = currentLine.substring(
				orderedMatch[0].length
			);
			isRemoving = true;
		} else {
			// Find the appropriate number by looking at surrounding lines

			// Look backwards for the last ordered list item
			for (let i = currentLineIndex - 1; i >= 0; i--) {
				const prevMatch = lines[i].match(/^(\d+)\.\s+/);
				if (prevMatch) {
					listNumber = parseInt(prevMatch[1]) + 1;
					break;
				}
				// Stop if we hit a non-list line (empty or different block)
				if (
					lines[i].trim() &&
					!lines[i].match(/^[-*+]\s+/) &&
					!lines[i].match(/^\d+\.\s+/)
				) {
					break;
				}
			}

			// Remove any existing block element and add ordered list
			const blockPatterns = [
				/^#{1,6}\s+/, // Headings
				/^>\s+/, // Quotes
				/^[-*+]\s+/, // Unordered lists
			];

			let lineContent = currentLine;
			for (const pattern of blockPatterns) {
				const match = currentLine.match(pattern);
				if (match) {
					lineContent = currentLine.substring(match[0].length);
					break;
				}
			}

			lines[currentLineIndex] = `${listNumber}. ${lineContent}`;
		}

		const newValue = lines.join("\n");
		setMarkdown(newValue);
		onChange?.(newValue);

		// Set cursor position
		const newCursorPos =
			charCount + (isRemoving ? 0 : `${listNumber}. `.length);
		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(newCursorPos, newCursorPos);
		}, 0);

		// Save to history
		saveToHistory(newValue, newCursorPos);
	}, [markdown, onChange, saveToHistory]);

	// Keyboard shortcut handling
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			// Prevent line breaks in simple mode
			if (simple && e.key === "Enter") {
				e.preventDefault();
				return;
			}

			// Handle undo/redo shortcuts for both simple and full modes
			if (enableHistory) {
				const isMac =
					navigator.platform.toUpperCase().indexOf("MAC") >= 0;
				const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

				if (isCtrlOrCmd) {
					if (e.key === "z" && !e.shiftKey) {
						e.preventDefault();
						undo();
					} else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
						e.preventDefault();
						redo();
					}
				}
			}
		},
		[undo, redo, simple, enableHistory]
	);

	// Toolbar actions
	const actions = {
		// History actions
		undo: () => undo(),
		redo: () => redo(),

		// Inline formatting (wraps selected text or inserts at cursor)
		bold: () => wrapText("**"),
		italic: () => wrapText("*"),
		strikethrough: () => wrapText("~~"),
		superscript: () => wrapText("^"),
		subscript: () => wrapText("~"),
		inlineCode: () => wrapText("`"),
		inlineCodeNoBackground: () => wrapText("`"),
		colorHighlight: () => wrapText("==yellow:", "=="),
		textColor: () => wrapText("@@#cd4c4c:", "@@"),

		// Character codes (common markdown conflicting characters)
		insertAsterisk: () => insertText("&#42;"), // *
		insertUnderscore: () => insertText("&#95;"), // _
		insertHash: () => insertText("&#35;"), // #
		insertTilde: () => insertText("&#126;"), // ~
		insertBacktick: () => insertText("&#96;"), // `
		insertPipe: () => insertText("&#124;"), // |
		insertCaret: () => insertText("&#94;"), // ^

		// Block-level elements (insert at beginning of current line)
		heading1: () => insertBlockText("# "),
		heading2: () => insertBlockText("## "),
		heading3: () => insertBlockText("### "),
		heading4: () => insertBlockText("#### "),
		heading5: () => insertBlockText("##### "),
		heading6: () => insertBlockText("###### "),
		quote: () => insertBlockText("> "),
		unorderedList: () => insertBlockText("- "),
		orderedList: () => insertOrderedList(),

		// Standalone block elements (insert on new lines)
		horizontalRule: () => insertNewLineText("---"),
		codeBlock: () => insertNewLineText("```javascript\n\n```", -4),
	};

	// Auto-process initial content once on mount (only if autoProcess is enabled)
	useEffect(() => {
		if (autoProcess && value.trim()) {
			processContent(value);
		}
	}, []); // Empty dependencies - runs once on mount

	// Simple single-line input mode
	if (simple) {
		return (
			<input
				ref={inputRef}
				type="text"
				value={markdown}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className={`border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none bg-white text-gray-900 font-mono text-sm ${className}`}
				style={{
					fontFamily:
						"JetBrains Mono, Fira Code, Consolas, monospace",
				}}
				disabled={readOnly}
			/>
		);
	}

	return (
		<div className={`markdown-editor ${className}`}>
			{/* Toolbar */}
			{!readOnly && (
				<div className="markdown-toolbar">
					{/* <div className="toolbar-group">
						<button
							onClick={actions.undo}
							disabled={historyIndex <= 0}
							title="Undo (Ctrl/Cmd+Z)"
							className="toolbar-btn"
						>
							↶
						</button>
						<button
							onClick={actions.redo}
							disabled={historyIndex >= history.length - 1}
							title="Redo (Ctrl/Cmd+Y)"
							className="toolbar-btn"
						>
							↷
						</button>
					</div> */}

					<div className="toolbar-group">
						<button
							onClick={actions.bold}
							title="Bold"
							className="toolbar-btn"
						>
							<strong>B</strong>
						</button>
						<button
							onClick={actions.italic}
							title="Italic"
							className="toolbar-btn"
						>
							<em>I</em>
						</button>
						<button
							onClick={actions.strikethrough}
							title="Strikethrough"
							className="toolbar-btn"
						>
							<del>S</del>
						</button>
						<button
							onClick={actions.superscript}
							title="Superscript"
							className="toolbar-btn"
						>
							X<sup>2</sup>
						</button>
						<button
							onClick={actions.subscript}
							title="Subscript"
							className="toolbar-btn"
						>
							X<sub>2</sub>
						</button>
					</div>

					<div className="toolbar-group">
						<button
							onClick={actions.heading1}
							title="Heading 1"
							className="toolbar-btn"
						>
							H1
						</button>
						<button
							onClick={actions.heading2}
							title="Heading 2"
							className="toolbar-btn"
						>
							H2
						</button>
						<button
							onClick={actions.heading3}
							title="Heading 3"
							className="toolbar-btn"
						>
							H3
						</button>
					</div>

					<div className="toolbar-group">
						<button
							onClick={actions.inlineCode}
							title="Inline Code"
							className="toolbar-btn"
						>
							&lt;/&gt;
						</button>
						<button
							onClick={actions.codeBlock}
							title="Code Block"
							className="toolbar-btn"
						>
							{}
						</button>
					</div>

					<div className="toolbar-group">
						<button
							onClick={actions.quote}
							title="Quote"
							className="toolbar-btn"
						>
							&quot;
						</button>
						<button
							onClick={actions.unorderedList}
							title="Unordered List"
							className="toolbar-btn"
						>
							• List
						</button>
						<button
							onClick={actions.orderedList}
							title="Ordered List"
							className="toolbar-btn"
						>
							1. List
						</button>
						<button
							onClick={actions.horizontalRule}
							title="Horizontal Rule"
							className="toolbar-btn"
						>
							---
						</button>
					</div>

					<div className="toolbar-group">
						<button
							onClick={actions.colorHighlight}
							title="Color Highlight (Background)"
							className="toolbar-btn"
						>
							🎨
						</button>
						<button
							onClick={actions.textColor}
							title="Text Color"
							className="toolbar-btn"
						>
							🖍️
						</button>
						<button
							onClick={actions.insertAsterisk}
							title="Insert Character Codes - Click for asterisk (&#42;), or use dropdown for more"
							className="toolbar-btn"
						>
							&#42;
						</button>
					</div>

					<div className="toolbar-group">
						<button
							onClick={() => processContent()}
							disabled={isProcessing || !markdown.trim()}
							title="Process Markdown to HTML"
							className={`toolbar-btn process-btn ${
								isProcessing ? "processing" : ""
							}`}
						>
							{isProcessing ? "⏳" : "🚀"} Process
						</button>
					</div>

					{showPreview && (
						<div className="toolbar-group toolbar-modes">
							<button
								onClick={() => setMode("split")}
								className={`toolbar-btn ${
									mode === "split" ? "active" : ""
								}`}
								title="Split Mode"
							>
								⚡
							</button>
							<button
								onClick={() => setMode("edit")}
								className={`toolbar-btn ${
									mode === "edit" ? "active" : ""
								}`}
								title="Edit Mode"
							>
								📝
							</button>

							<button
								onClick={() => setMode("preview")}
								className={`toolbar-btn ${
									mode === "preview" ? "active" : ""
								}`}
								title="Preview Mode"
							>
								👁️
							</button>
						</div>
					)}
				</div>
			)}

			{/* Editor Content */}
			<div className="markdown-content" style={{ minHeight }}>
				{/* Edit Mode or Split Mode */}
				{(mode === "edit" || mode === "split") && !readOnly && (
					<div
						className={`markdown-input ${
							mode === "split" ? "split-mode" : ""
						}`}
					>
						<textarea
							ref={textareaRef}
							value={markdown}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							placeholder={placeholder}
							className="markdown-textarea"
							disabled={readOnly}
						/>
					</div>
				)}

				{/* Preview Mode or Split Mode */}
				{(mode === "preview" || mode === "split" || readOnly) && (
					<div
						className={`markdown-preview ${
							mode === "split" ? "split-mode" : ""
						}`}
					>
						{isProcessing && (
							<div className="processing-indicator">
								🔄 Processing...
							</div>
						)}
						{/* <div
							className="markdown-output markdown-display max-h-[500px] overflow-y-auto"
							dangerouslySetInnerHTML={{ __html: html }}
						/> */}
						<MarkdownDisplay content={html} />
					</div>
				)}
			</div>

			{/* Status Bar */}
			<div className="markdown-status">
				<span>Characters: {markdown.length}</span>
				<span>
					Words: {markdown.split(/\s+/).filter(Boolean).length}
				</span>
				{isProcessing && (
					<span className="processing">⏳ Processing...</span>
				)}
			</div>
		</div>
	);
}
