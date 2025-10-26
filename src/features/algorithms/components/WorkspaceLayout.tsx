"use client";

import {
	ResizablePanelGroup,
	ResizableHandle,
} from "@/components/ui/resizable";
import "@/components/workspace/Chat/components/ChatMarkdownDisplay.css";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { TestResult } from "./TestResultsDisplay";
import { useTestTab } from "../hooks/useTestTab";
import { useProcessedStatement } from "../hooks/useProcessedStatement";
import { ProblemHeader } from "./ProblemHeader";
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
	const processedStatement = useProcessedStatement(problem);
	const { activeTestTab, setActiveTestTab } = useTestTab(
		testResults,
		isExecuting
	);

	return (
		<div className="w-screen h-fit md:h-screen md:max-h-screen flex flex-col bg-background-4">
			<ProblemHeader
				problem={problem}
				onReset={onReset}
				onHint={onHint}
			/>

			{/* Main Content */}
			<div className="h-fit md:h-[calc(100vh-65px)] flex items-start justify-center pb-6">
				<div className="w-[95%] h-[99%] max-h-[99%] rounded-xl md:overflow-hidden pt-4">
					<ResizablePanelGroup
						direction="horizontal"
						className="h-full gap-2"
					>
						{/* Left Column - Two Separate Panels */}
						<LeftColumnPanel
							problem={problem}
							testResults={testResults}
							processedStatement={processedStatement}
							activeTestTab={activeTestTab}
							setActiveTestTab={setActiveTestTab}
						/>

						<ResizableHandle className="w-3 bg-transparent hover:bg-blue-800/60" />

						{/* Center Panel - Editor */}
						<EditorPanel
							code={code}
							setCode={setCode}
							testResults={testResults}
							isExecuting={isExecuting}
							onRun={onRun}
							onShowSolution={onShowSolution}
							iframeRef={iframeRef}
							isThinking={isThinking}
						/>

						<ResizableHandle className="w-3 bg-transparent hover:bg-blue-800/60" />

						{/* Right Panel - AI Chat */}
						<AIChatPanel
							chatMessages={chatMessages}
							onSendMessage={onSendMessage}
						/>
					</ResizablePanelGroup>
				</div>
			</div>
		</div>
	);
}
