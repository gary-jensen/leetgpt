import { useEffect, useState } from "react";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import { AlgoProblemDetail } from "@/types/algorithm-types";

export function useProcessedStatement(problem: AlgoProblemDetail) {
	const [processedStatement, setProcessedStatement] = useState("");

	useEffect(() => {
		const processStatement = async () => {
			try {
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
