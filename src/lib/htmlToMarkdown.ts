/**
 * Convert HTML to Markdown
 * TODO: Implement proper HTML to Markdown conversion
 */
export function htmlToMarkdown(html: string): string {
	// Simple implementation - just strip HTML tags for now
	// Can be enhanced later with proper HTML to Markdown conversion
	return html
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<p>/gi, "")
		.replace(/<\/p>/gi, "\n\n")
		.replace(/<strong>|<b>/gi, "**")
		.replace(/<\/strong>|<\/b>/gi, "**")
		.replace(/<em>|<i>/gi, "*")
		.replace(/<\/em>|<\/i>/gi, "*")
		.replace(/<code>/gi, "`")
		.replace(/<\/code>/gi, "`")
		.replace(/<[^>]+>/g, ""); // Remove remaining HTML tags
}
