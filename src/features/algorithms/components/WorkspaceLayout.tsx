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
	AlgoProblemSubmission,
} from "@/types/algorithm-types";
import { TestResult } from "./TestResultsDisplay";
import { useProcessedStatement } from "../hooks/useProcessedStatement";
import { WorkspaceNavbar } from "./WorkspaceNavbar";
import { ProblemStatementChat } from "./ProblemStatementChat";
import { EditorPanel } from "./EditorPanel";
import { TestCasesPanel } from "./TestCasesPanel";
import { useTestTab } from "../hooks/useTestTab";
import { MobileWorkspaceTabs } from "./MobileWorkspaceTabs";
import { useState, useEffect, useCallback } from "react";

interface WorkspaceLayoutProps {
	problem: AlgoProblemDetail;
	code: string;
	setCode: (code: string) => void;
	testResults: TestResult[];
	isExecuting: boolean;
	executionType?: "run" | "submit" | null;
	onRun: () => void;
	onSubmit: () => void;
	onReset: () => void;
	onHint: () => void;
	onShowSolution: () => void;
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	buttonVariant: "correct" | "wrong" | "submit";
	buttonDisabled: boolean;
	// AI Chat props
	chatMessages: any[];
	onSendMessage: (message: string) => void;
	isThinking: boolean;
	streamingMessageId: string | null;
	relatedLessons: AlgoLesson[];
	problemsMeta: AlgoProblemMeta[];
	onNewSubmission?: (
		handler: (submission: AlgoProblemSubmission) => void
	) => void;
}

export function WorkspaceLayout({
	problem,
	code,
	setCode,
	testResults,
	isExecuting,
	executionType,
	onRun,
	onSubmit,
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
	onNewSubmission,
}: WorkspaceLayoutProps) {
	const processedStatement = useProcessedStatement(problem);
	const {
		activeTestTab,
		setActiveTestTab,
		testCasesPanelRef: separatePanelRef,
	} = useTestTab(testResults, isExecuting);

	// Mobile tab state
	const [activeMobileTab, setActiveMobileTab] = useState<
		"problem" | "editor" | "tests"
	>("problem");

	// Wrap handlers to switch tabs on mobile (only switches on mobile via CSS media query)
	const handleRun = useCallback(() => {
		onRun();
		// Check if we're on mobile at the time of click (lg breakpoint is 1024px)
		if (window.innerWidth < 1024) {
			setActiveMobileTab("tests");
		}
	}, [onRun]);

	const handleSubmit = useCallback(() => {
		onSubmit();
		// Check if we're on mobile at the time of click (lg breakpoint is 1024px)
		if (window.innerWidth < 1024) {
			setActiveMobileTab("problem");
		}
	}, [onSubmit]);

	return (
		<div className="w-screen h-screen max-h-screen flex flex-col bg-background-4 overflow-hidden">
			<WorkspaceNavbar problemsMeta={problemsMeta} />

			{/* Mobile Tabs - shown below lg breakpoint (1024px) */}
			<div className="lg:hidden">
				<MobileWorkspaceTabs
					activeTab={activeMobileTab}
					onTabChange={setActiveMobileTab}
				/>
			</div>

			{/* Mobile Layout - Single Panel with Tabs - shown below lg breakpoint (1024px) */}
			<div className="flex-1 overflow-hidden p-2 lg:hidden">
				{activeMobileTab === "problem" && (
					<div className="w-full h-full">
						<ResizablePanelGroup
							direction="horizontal"
							className="h-full"
						>
							<ProblemStatementChat
								problem={problem}
								processedStatement={processedStatement}
								chatMessages={chatMessages}
								onSendMessage={onSendMessage}
								isThinking={isThinking}
								streamingMessageId={streamingMessageId}
								relatedLessons={relatedLessons}
								defaultSize={100}
								onCopyToEditor={setCode}
								onNewSubmission={onNewSubmission}
								code={code}
								testResults={testResults}
							/>
						</ResizablePanelGroup>
					</div>
				)}

				{activeMobileTab === "editor" && (
					<div className="w-full h-full">
						<ResizablePanelGroup
							direction="horizontal"
							className="h-full"
						>
							<EditorPanel
								code={code}
								setCode={setCode}
								testResults={testResults}
								isExecuting={isExecuting}
								executionType={executionType}
								onRun={handleRun}
								onSubmit={handleSubmit}
								onReset={onReset}
								onHint={onHint}
								onShowSolution={onShowSolution}
								iframeRef={iframeRef}
								isThinking={isThinking}
								problem={problem}
								hideTestCasesPanel={true}
								activeTestTab={activeTestTab}
								setActiveTestTab={setActiveTestTab}
								testCasesPanelRef={undefined}
								buttonDisabled={buttonDisabled}
							/>
						</ResizablePanelGroup>
					</div>
				)}

				{activeMobileTab === "tests" && (
					<div className="w-full h-full bg-background-3 rounded-lg overflow-hidden">
						<TestCasesPanel
							problem={problem}
							testResults={testResults}
							activeTestTab={activeTestTab}
							setActiveTestTab={setActiveTestTab}
							isExecuting={isExecuting}
						/>
					</div>
				)}
			</div>

			{/* Desktop Layout - Resizable Panels - shown at lg+ (1024px+) */}
			<div className="hidden lg:flex flex-1 items-center justify-center overflow-hidden pb-6">
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
							defaultSize={33.33}
							onCopyToEditor={setCode}
							onNewSubmission={onNewSubmission}
							code={code}
							testResults={testResults}
						/>

						<ResizableHandle className="w-3 bg-transparent hover:bg-blue-800/60 rounded-md" />

						{/* Middle Panel - Editor */}
						<EditorPanel
							code={code}
							setCode={setCode}
							testResults={testResults}
							isExecuting={isExecuting}
							executionType={executionType}
							onRun={handleRun}
							onSubmit={handleSubmit}
							onReset={onReset}
							onHint={onHint}
							onShowSolution={onShowSolution}
							iframeRef={iframeRef}
							isThinking={isThinking}
							problem={problem}
							hideTestCasesPanel={false}
							activeTestTab={activeTestTab}
							setActiveTestTab={setActiveTestTab}
							testCasesPanelRef={undefined}
							buttonDisabled={buttonDisabled}
						/>

						{/* Right Panel - Test Cases (hidden below 2xl, visible at 2xl+) */}
						<ResizableHandle className="hidden 2xl:block w-3 bg-transparent hover:bg-blue-800/60 rounded-md" />
						<ResizablePanel
							defaultSize={33.33}
							minSize={10}
							maxSize={80}
							className="hidden 2xl:flex flex-col overflow-hidden"
							ref={separatePanelRef}
						>
							<TestCasesPanel
								problem={problem}
								testResults={testResults}
								activeTestTab={activeTestTab}
								setActiveTestTab={setActiveTestTab}
								isExecuting={isExecuting}
							/>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</div>
	);
}
