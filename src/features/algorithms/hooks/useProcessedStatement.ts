import { useEffect, useState } from "react";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import { AlgoProblemDetail } from "@/types/algorithm-types";

export function useProcessedStatement(problem: AlgoProblemDetail) {
	// Initialize with pre-processed HTML if available (zero loading time!)
	const [processedStatement, setProcessedStatement] = useState<string>(
		problem.statementHtml || ""
	);

	useEffect(() => {
		// Only process markdown if we don't have pre-processed HTML
		if (problem.statementHtml) {
			console.log("✅ Using pre-processed HTML - zero loading time!");
			return;
		}

		console.log(
			"⚠️ No pre-processed HTML, processing markdown on client..."
		);

		const processStatement = async () => {
			try {
				// Process markdown on the fly (fallback for legacy data)
				const html = await processMarkdown(problem.statementMd, {
					allowInlineHtml: true,
					codeBackgroundInChoices: true,
				});
				setProcessedStatement(html);
			} catch (error) {
				console.error("Error processing markdown:", error);
				// Fallback to plain text if markdown processing fails
				setProcessedStatement(
					problem.statementMd
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;")
				);
			}
		};

		processStatement();
	}, [problem.statementMd]);

	return processedStatement;
}
