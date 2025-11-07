/**
 * Extract the title from a problem name by removing leading numbers
 * Example: "51. N-Queens" -> "N-Queens"
 * Example: "Two Sum" -> "Two Sum"
 */
export function extractTitleFromProblemName(problemName: string): string {
	const trimmed = problemName.trim();
	// Match pattern like "51. " or "51 " at the start
	const match = trimmed.match(/^\d+\.?\s*(.+)$/);
	return match ? match[1].trim() : trimmed;
}

/**
 * Convert a problem name to a slug (kebab-case)
 * Extracts the title first (removes leading numbers) to match how AI generates slugs
 * Handles numbers, special characters, and multiple spaces
 */
export function problemNameToSlug(problemName: string): string {
	// Extract title first (remove leading number like "51. ")
	const title = extractTitleFromProblemName(problemName);

	return title
		.toLowerCase()
		.replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, and hyphens
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
		.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}
