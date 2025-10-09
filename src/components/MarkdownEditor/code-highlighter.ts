import { createHighlighter } from "./shiki.bundle";

// Cache the highlighter instance to avoid recreating it
let highlighterInstance: any = null;
let highlighterPromise: Promise<any> | null = null;

// Monaco color mapping - from dark-plus to Monaco colors
const monacoColorMap: { [key: string]: string } = {
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

export async function getSharedHighlighter() {
	// If we already have an instance, return it
	if (highlighterInstance) {
		return highlighterInstance;
	}

	// If we're already creating one, wait for it
	if (highlighterPromise) {
		return await highlighterPromise;
	}

	// Create the highlighter (only one thread will do this)
	highlighterPromise = createHighlighter({
		themes: ["dark-plus"],
		langs: ["javascript", "typescript", "html", "css", "json"],
	});

	try {
		highlighterInstance = await highlighterPromise;
		return highlighterInstance;
	} finally {
		// Clear the promise so future calls can create a new one if needed
		highlighterPromise = null;
	}
}

// Keep the old function for internal use
async function getHighlighter() {
	return getSharedHighlighter();
}

// Function to detect programming language from code text
function detectLanguage(text: string): { lang: string; cleanedText: string } {
	// Check for manual language specification: lang:js:console.log()
	const langMatch = text.match(/^lang:(\w+):(.+)$/);
	if (langMatch) {
		const [, specifiedLang, cleanedCode] = langMatch;
		const validLangs = [
			"javascript",
			"js",
			"typescript",
			"ts",
			"html",
			"css",
			"json",
		];
		const normalizedLang =
			specifiedLang === "js"
				? "javascript"
				: specifiedLang === "ts"
				? "typescript"
				: specifiedLang;

		if (validLangs.includes(normalizedLang)) {
			return { lang: normalizedLang, cleanedText: cleanedCode };
		}
	}

	const code = text.toLowerCase().trim();

	// HTML detection
	if (code.includes("<") && code.includes(">")) {
		if (
			code.includes("div") ||
			code.includes("span") ||
			code.includes("class")
		) {
			return { lang: "html", cleanedText: text };
		}
	}

	// CSS detection
	if (
		code.includes(":") &&
		(code.includes("{") ||
			code.includes("}") ||
			code.includes("px") ||
			code.includes("color"))
	) {
		return { lang: "css", cleanedText: text };
	}

	// JSON detection
	if (
		(code.startsWith("{") && code.includes(":")) ||
		(code.startsWith("[") && code.includes(":"))
	) {
		return { lang: "json", cleanedText: text };
	}

	// TypeScript detection
	if (
		code.includes("interface") ||
		code.includes(": string") ||
		code.includes(": number") ||
		code.includes("type ") ||
		code.includes("enum ") ||
		code.includes("<T>")
	) {
		return { lang: "typescript", cleanedText: text };
	}

	// JavaScript detection (default for most cases)
	if (
		code.includes("function") ||
		code.includes("const ") ||
		code.includes("let ") ||
		code.includes("var ") ||
		code.includes("console.") ||
		code.includes("useState") ||
		code.includes("=>") ||
		code.includes("require(") ||
		code.includes("import ")
	) {
		return { lang: "javascript", cleanedText: text };
	}

	// Default to JavaScript for most programming-like text
	return { lang: "javascript", cleanedText: text };
}

/**
 * Highlights inline code in a string and returns HTML
 * Converts `code` blocks to syntax-highlighted HTML
 */
export async function highlightInlineCode(text: string): Promise<string> {
	try {
		const highlighter = await getHighlighter();

		// Replace inline code blocks (backticks) with highlighted HTML
		const highlightedText = await replaceAsync(
			text,
			/`([^`]+)`/g,
			async (match, codeContent) => {
				// DON'T process character codes yet - let them stay as &#42; for now
				const { lang, cleanedText } = detectLanguage(codeContent);

				try {
					const html = await highlighter.codeToHtml(cleanedText, {
						lang: lang,
						theme: "dark-plus",
					});

					// Extract just the inner content, not the full <pre><code> wrapper
					const contentMatch = html.match(
						/<code[^>]*>([\s\S]*?)<\/code>/
					);
					if (contentMatch) {
						// Apply Monaco color transformations
						const monacoHtml = applyMonacoColors(contentMatch[1]);
						return `<code class="syntax-highlighted inline-code monaco-colors">${monacoHtml}</code>`;
					}
				} catch (err) {
					console.warn("Failed to highlight code:", cleanedText, err);
				}

				// Fallback to basic styling
				return `<code class="basic-code">${cleanedText}</code>`;
			}
		);

		return highlightedText;
	} catch (error) {
		console.error("Failed to highlight inline code:", error);
		return text; // Return original text if highlighting fails
	}
}

/**
 * Processes lesson/question content and returns HTML with highlighted code
 */
export async function processContentForStorage(
	content: string
): Promise<string> {
	// First handle inline code
	let processed = await highlightInlineCode(content);

	// You could add more processing here:
	// - Convert markdown to HTML
	// - Process other formatting
	// - Handle code blocks (```code```)

	return processed;
}

/**
 * Test function to demonstrate the highlighting
 */
export async function testHighlighting(): Promise<string> {
	const testContent = `
This is a lesson about React. You can use \`useState\` to manage state and \`useEffect\` for side effects.
Here's an example of TypeScript: \`interface User { name: string; age: number }\`.
And some CSS: \`lang:css:color: #ff0000; margin: 10px; border-radius: 8px\`.
HTML elements: \`<div class="container">Content</div>\`.
JSON data: \`{"name": "John", "age": 30}\`.
Regular text should remain unchanged.
`;

	return await processContentForStorage(testContent);
}

// Helper function for async replace
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
