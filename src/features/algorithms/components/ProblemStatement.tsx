import "./ProblemStatement.css";

interface ProblemStatementProps {
	processedStatement: string;
}

export function ProblemStatement({
	processedStatement,
}: ProblemStatementProps) {
	return (
		<div className="bg-background flex flex-col rounded-2xl border-[#2f2f2f] border-1 overflow-hidden h-full min-h-full">
			<div className="flex items-center justify-between p-3 border-b border-border">
				<h3 className="font-medium">Problem Statement</h3>
			</div>

			<div
				className="flex-1 overflow-auto p-4 dark-scrollbar"
				style={{
					scrollbarWidth: "thin",
					scrollbarColor: "#9f9f9f #2C2C2C",
				}}
			>
				<div className="chat-markdown-display problem-statement">
					<div
						className="markdown-content"
						dangerouslySetInnerHTML={{
							__html: processedStatement,
						}}
					/>
				</div>
			</div>
		</div>
	);
}
