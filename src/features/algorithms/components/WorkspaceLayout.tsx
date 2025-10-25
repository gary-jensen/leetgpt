"use client";

import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import { Button } from "@/components/ui/button";
import "@/components/workspace/Chat/components/ChatMarkdownDisplay.css";
import Editor from "@/components/workspace/Editor/components/editor";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { ChevronLeft, ChevronRight, Lightbulb, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { TestResult } from "./TestResultsDisplay";

interface WorkspaceLayoutProps {
	problem: AlgoProblemDetail;
	code: string;
	setCode: (code: string) => void;
	testResults: TestResult[];
	isExecuting: boolean;
	onRun: () => void;
	onReset: () => void;
	onHint: () => void;
	onShowSolution: () => void;
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	buttonVariant: "correct" | "wrong" | "run";
	buttonDisabled: boolean;
	// AI Chat props
	chatMessages: any[];
	onSendMessage: (message: string) => void;
	isThinking: boolean;
}

export function WorkspaceLayout({
	problem,
	code,
	setCode,
	testResults,
	isExecuting,
	onRun,
	onReset,
	onHint,
	onShowSolution,
	iframeRef,
	buttonVariant,
	buttonDisabled,
	chatMessages,
	onSendMessage,
	isThinking,
}: WorkspaceLayoutProps) {
	const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
	const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
	const [processedStatement, setProcessedStatement] = useState("");

	// Process markdown statement
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

	return (
		<div className="h-screen flex flex-col bg-background-4">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-border bg-background">
				<div className="flex items-center gap-4">
					<h1 className="text-xl font-semibold">{problem.title}</h1>
					<div className="flex items-center gap-2">
						<span
							className={`px-2 py-1 text-xs rounded-full ${
								problem.difficulty === "easy"
									? "bg-green-100 text-green-800"
									: problem.difficulty === "medium"
									? "bg-yellow-100 text-yellow-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{problem.difficulty.toUpperCase()}
						</span>
						<div className="flex gap-1">
							{problem.topics.map((topic) => (
								<span
									key={topic}
									className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
								>
									{topic}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						onClick={onReset}
						variant="outline"
						size="sm"
						className="flex items-center gap-2"
					>
						<RotateCcw className="w-4 h-4" />
						Reset
					</Button>
					<Button
						onClick={onHint}
						variant="outline"
						size="sm"
						className="flex items-center gap-2"
					>
						<Lightbulb className="w-4 h-4" />
						Hint
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Left Panel - Problem Statement */}
				<div
					className={`${
						leftPanelCollapsed ? "w-12" : "w-80"
					} transition-all duration-300 border-r border-border bg-background flex flex-col`}
				>
					<div className="flex items-center justify-between p-3 border-b border-border">
						<h3 className="font-medium">Problem Statement</h3>
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								setLeftPanelCollapsed(!leftPanelCollapsed)
							}
						>
							{leftPanelCollapsed ? (
								<ChevronRight className="w-4 h-4" />
							) : (
								<ChevronLeft className="w-4 h-4" />
							)}
						</Button>
					</div>

					{!leftPanelCollapsed && (
						<div className="flex-1 overflow-auto p-4">
							{/* Problem Statement */}
							<div className="chat-markdown-display">
								<div
									className="markdown-content"
									dangerouslySetInnerHTML={{
										__html: processedStatement,
									}}
								/>
							</div>

							{/* Test Cases Section */}
							<div className="mt-6 border-t border-border pt-4">
								<h3 className="text-lg font-semibold mb-3 text-foreground">
									Test Cases
								</h3>
								<div className="space-y-3">
									{problem.tests.map((test, index) => (
										<div
											key={index}
											className="bg-muted/50 rounded-lg p-3 border border-border"
										>
											<div className="text-sm font-medium text-muted-foreground mb-2">
												Test Case {index + 1}
											</div>
											<div className="space-y-2">
												<div>
													<span className="text-sm font-medium text-foreground">
														Input:
													</span>
													<pre className="mt-1 text-xs bg-background p-2 rounded border overflow-x-auto">
														{JSON.stringify(
															test.input,
															null,
															2
														)}
													</pre>
												</div>
												<div>
													<span className="text-sm font-medium text-foreground">
														Expected Output:
													</span>
													<pre className="mt-1 text-xs bg-background p-2 rounded border overflow-x-auto">
														{JSON.stringify(
															test.output,
															null,
															2
														)}
													</pre>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Center Panel - Editor */}
				<div className="flex-1 flex flex-col">
					<Editor
						code={code}
						setCode={setCode}
						iframeRef={iframeRef}
						handleRun={onRun}
						isExecuting={isExecuting}
						isThinking={isThinking}
						isInitialized={true}
						hasJustPassed={
							testResults.length > 0 &&
							testResults.every((r) => r.passed)
						}
						onShowSolution={onShowSolution}
						showConsole={false}
					/>
				</div>

				{/* Right Panel - AI Chat */}
				<div
					className={`${
						rightPanelCollapsed ? "w-12" : "w-80"
					} transition-all duration-300 border-l border-border bg-background flex flex-col`}
				>
					<div className="flex items-center justify-between p-3 border-b border-border">
						<h3 className="font-medium">AI Mentor</h3>
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								setRightPanelCollapsed(!rightPanelCollapsed)
							}
						>
							{rightPanelCollapsed ? (
								<ChevronLeft className="w-4 h-4" />
							) : (
								<ChevronRight className="w-4 h-4" />
							)}
						</Button>
					</div>

					{!rightPanelCollapsed && (
						<div className="flex-1">
							{/* Mock chat component - in real implementation, this would be the actual Chat component */}
							<div className="h-full flex flex-col">
								<div className="flex-1 overflow-auto p-4 space-y-3">
									{chatMessages.length === 0 ? (
										<div className="text-center text-muted-foreground py-8">
											<Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
											<p>
												Ask me anything about this
												problem!
											</p>
											<p className="text-sm">
												I can help you understand the
												approach or debug your code.
											</p>
										</div>
									) : (
										chatMessages.map((message, index) => (
											<div
												key={index}
												className={`p-3 rounded-lg ${
													message.role === "user"
														? "bg-blue-100 ml-8"
														: "bg-gray-100 mr-8"
												}`}
											>
												<p className="text-sm">
													{message.content}
												</p>
											</div>
										))
									)}
								</div>

								<div className="p-4 border-t border-border">
									<div className="flex gap-2">
										<input
											type="text"
											placeholder="Ask a question..."
											className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													onSendMessage(
														e.currentTarget.value
													);
													e.currentTarget.value = "";
												}
											}}
										/>
										<Button
											size="sm"
											onClick={() => {
												const input =
													document.querySelector(
														'input[placeholder="Ask a question..."]'
													) as HTMLInputElement;
												if (input.value) {
													onSendMessage(input.value);
													input.value = "";
												}
											}}
										>
											Send
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
