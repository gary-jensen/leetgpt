import { getSharedHighlighter } from "./code-highlighter";
import { processContentForStorage } from "./code-highlighter";

// Monaco color mapping - from dark-plus to Monaco colors
const monacoColorMap: { [key: string]: string } = {
	// Code block grey to custom
	"#1e1e1e": "",

	// Dark-plus blues to Monaco green (keywords)
	"#569cd6": "#8aff00", // keywords
	"#4fc1ff": "#44fffa", // numbers

	// Dark-plus yellows to Monaco yellows (functions/strings)
	"#dcdcaa": "#44fffa", // functions
	"#ce9178": "#ffda4c", // strings

	// Comments stay similar
	"#6a9955": "#aaaaaa", // single-line comments
	"#D16969": "#aaaaaa", // multi-line comments

	// Variables and identifiers
	"#9cdcfe": "#ffffff", // variables
	"#4ec9b0": "#98e948", // types/classes

	// Operators and punctuation
	"#c586c0": "#8aff00", // keywords/operators
	"#d4d4d4": "#ffffff", // default text

	// HTML/markup
	"#92c5f8": "#98e948", // HTML attributes
	"#808080": "#aaaaaa", // punctuation

	// CSS
	"#d7ba7d": "#44fffa", // CSS values/numbers (ensure numbers are cyan)
	"#f44747": "#ff4271", // errors/invalid

	// JSON
	"#b5cea8": "#44fffa", // JSON numbers/values (ensure numbers are cyan)

	// Additional number color mappings to ensure numbers are always cyan
	"#ffff99": "#44fffa", // light yellow numbers
	"#ffd700": "#44fffa", // gold/yellow numbers

	// Ensure operators are consistent (make asterisk white like plus)
	"#b4b4b4": "#ffffff", // light gray operators to white
	"#cccccc": "#ffffff", // other light operators to white
};

/**
 * Transform dark-plus colors to Monaco colors
 */
function applyMonacoColors(html: string): string {
	let transformedHtml = html;

	// Replace each color mapping
	Object.entries(monacoColorMap).forEach(([darkPlusColor, monacoColor]) => {
		const colorRegex = new RegExp(
			`color:${darkPlusColor.replace("#", "#")}`,
			"gi"
		);
		transformedHtml = transformedHtml.replace(
			colorRegex,
			`color:${monacoColor}`
		);
	});

	return transformedHtml;
}

export interface MarkdownProcessorOptions {
	allowInlineHtml?: boolean;
	codeBackgroundInChoices?: boolean;
}

/**
 * Main markdown processor that converts markdown to HTML
 */
export async function processMarkdown(
	markdown: string,
	options: MarkdownProcessorOptions = {}
): Promise<string> {
	let html = markdown;

	// Process in order of precedence to avoid conflicts

	// 1. Protect character codes from markdown processing by converting to a safe placeholder
	html = protectCharacterCodes(html);

	// 2. Code blocks first (```code```)
	html = await processCodeBlocks(html);

	// 3. Inline code
	html = await processContentForStorage(html);

	// 3. Headers (# ## ### etc.)
	html = processHeaders(html);

	// 4. Horizontal rules
	html = processHorizontalRules(html);

	// 5. Blockquotes
	html = processBlockquotes(html);

	// 6. Lists (ordered and unordered)
	html = processLists(html);

	// 7. Text formatting (bold, italic, etc.)
	html = processTextFormatting(html);

	// 8. Color highlighting
	html = processColorHighlighting(html);

	// 9. Text color
	html = processTextColor(html);

	// 10. Paragraphs (last to wrap remaining content)
	html = processParagraphs(html);

	// 11. Restore character codes from placeholders
	html = restoreCharacterCodes(html);

	// 13. Handle choices background for inline code
	if (options.codeBackgroundInChoices === false) {
		html = html.replace(
			/<code class="syntax-highlighted inline-code">/g,
			'<code class="syntax-highlighted inline-code no-bg">'
		);
	}

	return html.trim();
}

// Map to store character code placeholders
const charCodeMap = new Map<string, string>();
let charCodeCounter = 0;

/**
 * Protect character codes by converting them to placeholders
 */
function protectCharacterCodes(text: string): string {
	// Handle numeric character codes (&#42;, &#x2A;)
	text = text.replace(/&#(x)?([0-9a-fA-F]+);/g, (match, isHex, code) => {
		try {
			const charCode = isHex ? parseInt(code, 16) : parseInt(code, 10);
			if (isNaN(charCode) || charCode < 0 || charCode > 0x10ffff) {
				return match;
			}

			// Use a simple placeholder that's just the character code number
			const placeholder = `CHARCODE${charCodeCounter++}`;
			const character = String.fromCharCode(charCode);
			charCodeMap.set(placeholder, character);

			return placeholder;
		} catch (error) {
			return match;
		}
	});

	// Handle named HTML entities (&gt;, &lt;, &amp;, etc.)
	text = text.replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, entityName) => {
		// Map common named entities to their characters
		const entityMap: { [key: string]: string } = {
			gt: ">",
			lt: "<",
			amp: "&",
			quot: '"',
			apos: "'",
			nbsp: " ",
			mdash: "—",
			ndash: "–",
			hellip: "…",
			lsquo: `'`,
			rsquo: `'`,
			ldquo: `"`,
			rdquo: '"',
		};

		if (entityMap[entityName]) {
			const placeholder = `CHARCODE${charCodeCounter++}`;
			charCodeMap.set(placeholder, entityMap[entityName]);
			return placeholder;
		}

		// If it's not a known entity, leave it as-is
		return match;
	});

	return text;
}

/**
 * Restore character codes from placeholders
 */
function restoreCharacterCodes(text: string): string {
	// Replace each placeholder with its character
	for (const [placeholder, character] of charCodeMap.entries()) {
		text = text.split(placeholder).join(character);
	}

	// Handle orphaned placeholders (from previous processing runs where map was cleared)
	// These are placeholders that exist in text but not in the current map
	text = text.replace(/CHARCODE\d+/g, (match) => {
		// If this placeholder is in our current map, it was already processed above
		if (charCodeMap.has(match)) {
			return match; // Don't change it, it was already handled
		}

		// This is an orphaned placeholder - default to asterisk (most common case)
		return "*";
	});

	// Fix operator highlighting in code blocks to match other operators
	// Replace cyan-colored operators with white-colored operators in code blocks
	text = text.replace(
		/<span style="color:#44fffa"> \*<\/span>/g,
		'<span style="color:#ffffff"> *</span>'
	);
	text = text.replace(
		/<span style="color:#44fffa">\*<\/span>/g,
		'<span style="color:#ffffff">*</span>'
	);
	text = text.replace(
		/<span style="color:#44fffa"> &gt;<\/span>/g,
		'<span style="color:#ffffff"> ></span>'
	);
	text = text.replace(
		/<span style="color:#44fffa">&gt;<\/span>/g,
		'<span style="color:#ffffff">></span>'
	);
	text = text.replace(
		/<span style="color:#44fffa"> &lt;<\/span>/g,
		'<span style="color:#ffffff"> <</span>'
	);
	text = text.replace(
		/<span style="color:#44fffa">&lt;<\/span>/g,
		'<span style="color:#ffffff"><</span>'
	);
	// Also fix the actual characters (in case they're not entities)
	text = text.replace(
		/<span style="color:#44fffa"> ><\/span>/g,
		'<span style="color:#ffffff"> ></span>'
	);
	text = text.replace(
		/<span style="color:#44fffa">><\/span>/g,
		'<span style="color:#ffffff">></span>'
	);
	text = text.replace(
		/<span style="color:#44fffa"> <<\/span>/g,
		'<span style="color:#ffffff"> <</span>'
	);
	text = text.replace(
		/<span style="color:#44fffa"><<\/span>/g,
		'<span style="color:#ffffff"><</span>'
	);

	// Clear the map for next use
	charCodeMap.clear();
	charCodeCounter = 0;

	return text;
}

/**
 * Process code blocks (```language ... ```)
 */
async function processCodeBlocks(text: string): Promise<string> {
	const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;

	return await replaceAsync(
		text,
		codeBlockRegex,
		async (match, language, code) => {
			const lang = language || "javascript";
			// DON'T process character codes yet - let them stay as &#42; for now
			const trimmedCode = code.trim();

			try {
				// Use shared highlighter instance
				const highlighter = await getSharedHighlighter();

				const html = await highlighter.codeToHtml(trimmedCode, {
					lang: lang,
					theme: "dark-plus",
				});

				// Apply Monaco color transformations
				const monacoHtml = applyMonacoColors(html);
				return `<div class="code-block-wrapper monaco-colors">${monacoHtml}</div>`;
			} catch (error) {
				console.warn("Failed to highlight code block:", error);
				return `<pre class="code-block"><code>${trimmedCode}</code></pre>`;
			}
		}
	);
}

/**
 * Process headers (# ## ### etc.)
 */
function processHeaders(text: string): string {
	return text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
		const level = hashes.length;
		const id = content
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-");
		return `<h${level} id="${id}">${content}</h${level}>`;
	});
}

/**
 * Process horizontal rules (--- or ***)
 */
function processHorizontalRules(text: string): string {
	return text.replace(/^(---|\*\*\*)\s*$/gm, '<hr class="markdown-hr">');
}

/**
 * Process blockquotes (> text)
 */
function processBlockquotes(text: string): string {
	return text.replace(
		/^>\s*(.+)$/gm,
		'<blockquote class="markdown-quote">$1</blockquote>'
	);
}

/**
 * Process lists (ordered and unordered)
 */
function processLists(text: string): string {
	// Unordered lists
	text = text.replace(
		/^(\s*)[\*\-\+]\s+(.+)$/gm,
		(match, indent, content) => {
			const level = Math.floor(indent.length / 2);
			return `<li class="markdown-ul-item" data-level="${level}">${content}</li>`;
		}
	);

	// Ordered lists
	text = text.replace(/^(\s*)\d+\.\s+(.+)$/gm, (match, indent, content) => {
		const level = Math.floor(indent.length / 2);
		return `<li class="markdown-ol-item" data-level="${level}">${content}</li>`;
	});

	// Wrap consecutive list items
	text = wrapListItems(text);

	return text;
}

/**
 * Wrap consecutive list items in ul/ol tags
 */
function wrapListItems(text: string): string {
	// Wrap unordered list items
	text = text.replace(
		/(<li class="markdown-ul-item"[^>]*>[\s\S]*?<\/li>(\s*<li class="markdown-ul-item"[^>]*>[\s\S]*?<\/li>)*)/g,
		'<ul class="markdown-ul">$1</ul>'
	);

	// Wrap ordered list items
	text = text.replace(
		/(<li class="markdown-ol-item"[^>]*>[\s\S]*?<\/li>(\s*<li class="markdown-ol-item"[^>]*>[\s\S]*?<\/li>)*)/g,
		'<ol class="markdown-ol">$1</ol>'
	);

	return text;
}

/**
 * Process text formatting (bold, italic, strikethrough, etc.)
 */
function processTextFormatting(text: string): string {
	// Bold (**text** or __text__)
	text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
	text = text.replace(/__(.*?)__/g, "<strong>$1</strong>");

	// Italic (*text* or _text_)
	text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
	text = text.replace(/_(.*?)_/g, "<em>$1</em>");

	// Strikethrough (~~text~~)
	text = text.replace(/~~(.*?)~~/g, "<del>$1</del>");

	// Superscript (^text^)
	text = text.replace(/\^(.*?)\^/g, "<sup>$1</sup>");

	// Subscript (~text~)
	text = text.replace(/~(.*?)~/g, "<sub>$1</sub>");

	return text;
}

/**
 * Process color highlighting ==color:text==
 */
function processColorHighlighting(text: string): string {
	return text.replace(/==([\w#]+):(.*?)==/g, (match, color, content) => {
		// Validate color (basic validation)
		const isValidColor =
			/^(#[0-9a-fA-F]{3,6}|red|blue|green|yellow|orange|purple|pink|gray|black|white)$/.test(
				color
			);
		if (!isValidColor) {
			return content; // Return content without highlighting if invalid color
		}
		return `<span class="markdown-highlight" style="background-color: ${color}; color: ${getContrastColor(
			color
		)}; padding: 2px 4px; border-radius: 3px;">${content}</span>`;
	});
}

/**
 * Get contrasting text color for background
 */
function getContrastColor(bgColor: string): string {
	// Simple contrast logic - can be enhanced
	const lightColors = ["yellow", "white", "pink", "#ffff", "#fff"];
	const isLight = lightColors.some((color) =>
		bgColor.toLowerCase().includes(color)
	);
	return isLight ? "#000" : "#fff";
}

/**
 * Process text color @@color:text@@
 */
function processTextColor(text: string): string {
	return text.replace(/@@([\w#]+):(.*?)@@/g, (match, color, content) => {
		// Validate color (basic validation)
		const isValidColor =
			/^(#[0-9a-fA-F]{3,6}|red|blue|green|yellow|orange|purple|pink|gray|black|white|cyan)$/.test(
				color
			);
		if (!isValidColor) {
			return content; // Return content without coloring if invalid color
		}
		return `<span class="markdown-text-color" style="color: ${color};">${content}</span>`;
	});
}

/**
 * Process paragraphs (wrap standalone text in <p> tags)
 */
function processParagraphs(text: string): string {
	// Split by double newlines to identify paragraphs
	const paragraphs = text.split(/\n\s*\n/);

	return paragraphs
		.map((para) => {
			const trimmed = para.trim();
			if (!trimmed) return "";

			// Don't wrap if already wrapped in block elements
			if (trimmed.match(/^<(h[1-6]|ul|ol|blockquote|hr|div|pre)/)) {
				return trimmed;
			}

			// Check if this paragraph contains list items
			if (trimmed.includes("<li")) {
				// Split the content to separate text from list items
				const parts = trimmed.split(/(<li[^>]*>.*?<\/li>)/g);
				return parts
					.map((part) => {
						const partTrimmed = part.trim();
						if (!partTrimmed) return "";

						// If it's a list item, return as-is
						if (partTrimmed.startsWith("<li")) {
							return partTrimmed;
						}

						// If it's text, wrap in paragraph
						return `<p class="markdown-paragraph">${partTrimmed}</p>`;
					})
					.filter(Boolean)
					.join("");
			}

			// Don't wrap single line breaks
			if (trimmed.includes("\n") && !trimmed.match(/^<.*>.*<\/.*>$/)) {
				// Handle line breaks within paragraphs
				const lines = trimmed
					.split("\n")
					.map((line) => line.trim())
					.filter(Boolean);
				return `<p class="markdown-paragraph">${lines.join(
					// "<br>"
					""
				)}</p>`;
			}

			return `<p class="markdown-paragraph">${trimmed}</p>`;
		})
		.join("\n\n");
}

/**
 * Helper function for async regex replacement
 */
async function replaceAsync(
	str: string,
	regex: RegExp,
	asyncFn: (match: string, ...args: any[]) => Promise<string>
): Promise<string> {
	const promises: Promise<string>[] = [];
	const parts: string[] = [];
	let lastIndex = 0;

	let match;
	while ((match = regex.exec(str)) !== null) {
		// Add the text before this match
		parts.push(str.substring(lastIndex, match.index));

		// Add a placeholder for the async result
		parts.push(null as any);

		// Store the promise
		promises.push(asyncFn(match[0], ...match.slice(1)));

		lastIndex = regex.lastIndex;
	}

	// Add the remaining text
	parts.push(str.substring(lastIndex));

	// Wait for all async operations
	const results = await Promise.all(promises);

	// Replace placeholders with results
	let resultIndex = 0;
	return parts
		.map((part) => (part === null ? results[resultIndex++] : part))
		.join("");
}

/**
 * Quick markdown preview for testing
 */
export function getMarkdownPreview(): string {
	return `# Heading 1
## Heading 2
### Heading 3

This is a **bold** and *italic* text with ~~strikethrough~~.

Character codes work: &#42; (asterisk), &#35; (hash), &#95; (underscore), &#126; (tilde), &#96; (backtick).
Hex codes too: &#x2A; (asterisk), &#x23; (hash), &#x5F; (underscore).
Named entities: &gt; (greater than), &lt; (less than), &amp; (ampersand).
Now you can show: &#42;&#42;text&#42;&#42; without making it **bold**!
Math examples: \`3 + 4 &#42; 2\` and \`4 &#42; 2 + 3\` show asterisks in code.
HTML examples: \`&lt;div&gt;content&lt;/div&gt;\` shows HTML tags without processing.
But &#42;&#42;this&#42;&#42; should NOT become bold outside of code.

Here's some inline code: \`useState\` and \`lang:css:color: red\`.

\`\`\`javascript
function hello() {
  console.log("Hello World!");
  return true;
}
\`\`\`

> This is a blockquote
> with multiple lines

- Unordered list item 1
- Unordered list item 2
  - Nested item
- Item 3

1. Ordered list item 1
2. Ordered list item 2
3. Item 3

==yellow:This text is highlighted== in yellow.

---

Super^script^ and sub~script^ text.

Regular paragraph with line breaks
will be handled properly.`;
}
