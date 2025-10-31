"use client";

import {
	ResizablePanelGroup,
	ResizableHandle,
} from "@/components/ui/resizable";
import "@/components/workspace/Chat/components/ChatMarkdownDisplay.css";
import { AlgoProblemDetail, AlgoLesson } from "@/types/algorithm-types";
import { TestResult } from "./TestResultsDisplay";
import { useProcessedStatement } from "../hooks/useProcessedStatement";
import { WorkspaceNavbar } from "./WorkspaceNavbar";
import { LeftColumnPanel } from "./LeftColumnPanel";
import { EditorPanel } from "./EditorPanel";
import { AIChatPanel } from "./AIChatPanel";

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
	relatedLessons: AlgoLesson[];
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
	relatedLessons,
}: WorkspaceLayoutProps) {
	const processedStatement = useProcessedStatement(problem);

	return (
		<div className="w-screen h-screen max-h-screen flex flex-col bg-background-4 overflow-hidden">
			<WorkspaceNavbar />

			{/* Main Content */}
			<div className="flex-1 flex items-center justify-center overflow-hidden pb-6">
				<div className="w-[95%] h-full max-h-full rounded-xl overflow-hidden pt-4">
					<ResizablePanelGroup
						direction="horizontal"
						className="h-full gapf-2"
					>
						{/* Left Column - Problem Statement */}
						<LeftColumnPanel
							problem={problem}
							processedStatement={processedStatement}
							relatedLessons={relatedLessons}
						/>

						<ResizableHandle className="w-3 bg-transparent hover:bg-blue-800/60 rounded-md" />

						{/* Center Panel - Editor and Test Cases */}
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
						/>

						<ResizableHandle className="w-3 bg-transparent hover:bg-blue-800/60 rounded-md" />

						{/* Right Panel - AI Chat */}
						<AIChatPanel
							chatMessages={chatMessages}
							onSendMessage={onSendMessage}
							isThinking={isThinking}
							relatedLessons={relatedLessons}
						/>
					</ResizablePanelGroup>
				</div>
			</div>
		</div>
	);
}
