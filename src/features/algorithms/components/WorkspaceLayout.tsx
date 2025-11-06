"use client";

import {
	ResizablePanelGroup,
	ResizableHandle,
	ResizablePanel,
} from "@/components/ui/resizable";
import "@/components/workspace/Chat/components/ChatMarkdownDisplay.css";
import {
	AlgoProblemDetail,
	AlgoLesson,
	AlgoProblemMeta,
} from "@/types/algorithm-types";
import { TestResult } from "./TestResultsDisplay";
import { useProcessedStatement } from "../hooks/useProcessedStatement";
import { WorkspaceNavbar } from "./WorkspaceNavbar";
import { ProblemStatementChat } from "./ProblemStatementChat";
import { EditorPanel } from "./EditorPanel";
import { TestCasesPanel } from "./TestCasesPanel";
import { useTestTab } from "../hooks/useTestTab";
import { useEffect, useState } from "react";

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
	streamingMessageId: string | null;
	relatedLessons: AlgoLesson[];
	problemsMeta: AlgoProblemMeta[];
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
	streamingMessageId,
	relatedLessons,
	problemsMeta,
}: WorkspaceLayoutProps) {
	const processedStatement = useProcessedStatement(problem);
	const { activeTestTab, setActiveTestTab, testCasesPanelRef } = useTestTab(
		testResults,
		isExecuting
	);
	const [is2xl, setIs2xl] = useState(false);

	// Check if screen is 2xl breakpoint (1536px)
	useEffect(() => {
		const checkBreakpoint = () => {
			setIs2xl(window.innerWidth >= 1536);
		};

		checkBreakpoint();
		window.addEventListener("resize", checkBreakpoint);
		return () => window.removeEventListener("resize", checkBreakpoint);
	}, []);

	return (
		<div className="w-screen h-screen max-h-screen flex flex-col bg-background-4 overflow-hidden">
			<WorkspaceNavbar problemsMeta={problemsMeta} />

			{/* Main Content */}
			<div className="flex-1 flex items-center justify-center overflow-hidden pb-6">
				<div className="w-[95%] h-full max-h-full rounded-xl overflow-hidden pft-4">
					<ResizablePanelGroup
						direction="horizontal"
						className="h-full gapf-2"
					>
						{/* Left Column - Problem Statement + Chat */}
						<ProblemStatementChat
							problem={problem}
							processedStatement={processedStatement}
							chatMessages={chatMessages}
							onSendMessage={onSendMessage}
							isThinking={isThinking}
							streamingMessageId={streamingMessageId}
							relatedLessons={relatedLessons}
							defaultSize={is2xl ? 33.33 : 50}
						/>

						<ResizableHandle className="w-3 bg-transparent hover:bg-blue-800/60 rounded-md" />

						{/* Middle Panel - Editor */}
						<EditorPanel
							code={code}
							setCode={setCode}
							testResults={testResults}
							isExecuting={isExecuting}
							onRun={onRun}
							onReset={onReset}
							onHint={onHint}
							onShowSolution={onShowSolution}
							iframeRef={iframeRef}
							isThinking={isThinking}
							problem={problem}
							hideTestCasesPanel={is2xl}
							activeTestTab={is2xl ? undefined : activeTestTab}
							setActiveTestTab={
								is2xl ? undefined : setActiveTestTab
							}
							testCasesPanelRef={
								is2xl ? undefined : testCasesPanelRef
							}
						/>

						{/* Right Panel - Test Cases (only visible at 2xl+) */}
						{is2xl && (
							<>
								<ResizableHandle className="w-3 bg-transparent hover:bg-blue-800/60 rounded-md" />
								<ResizablePanel
									defaultSize={33.33}
									minSize={15}
									maxSize={40}
									className="flex flex-col overflow-hidden"
									ref={testCasesPanelRef}
								>
									<TestCasesPanel
										problem={problem}
										testResults={testResults}
										activeTestTab={activeTestTab}
										setActiveTestTab={setActiveTestTab}
									/>
								</ResizablePanel>
							</>
						)}
					</ResizablePanelGroup>
				</div>
			</div>
		</div>
	);
}
