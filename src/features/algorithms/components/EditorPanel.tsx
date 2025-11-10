"use client";

import {
	ResizablePanel,
	ResizablePanelGroup,
	ResizableHandle,
} from "@/components/ui/resizable";
import Editor from "@/components/workspace/Editor/components/editor";
import { TestResult } from "./TestResultsDisplay";
import { TestCasesPanel } from "./TestCasesPanel";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { Button } from "@/components/ui/button";
import { RotateCcw, Lightbulb, MessageCircleQuestionIcon } from "lucide-react";
import { useTestTab } from "../hooks/useTestTab";
import { useSession } from "next-auth/react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { FeedbackDialog } from "./FeedbackDialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditorPanelProps {
	code: string;
	setCode: (code: string) => void;
	testResults: TestResult[];
	isExecuting: boolean;
	onRun: () => void;
	onReset: () => void;
	onHint: () => void;
	onShowSolution: () => void;
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	isThinking: boolean;
	problem: AlgoProblemDetail;
	hideTestCasesPanel?: boolean; // Hide test cases panel (used when showing as separate column)
	activeTestTab?: "examples" | "testcase" | "results"; // Passed from parent when hideTestCasesPanel is false
	setActiveTestTab?: (tab: "examples" | "testcase" | "results") => void; // Passed from parent when hideTestCasesPanel is false
	testCasesPanelRef?: React.RefObject<ImperativePanelHandle | null>; // Passed from parent when hideTestCasesPanel is false
}

export function EditorPanel({
	code,
	setCode,
	testResults,
	isExecuting,
	onRun,
	onReset,
	onHint,
	onShowSolution,
	iframeRef,
	isThinking,
	problem,
	hideTestCasesPanel = false,
	activeTestTab: propActiveTestTab,
	setActiveTestTab: propSetActiveTestTab,
	testCasesPanelRef: propTestCasesPanelRef,
}: EditorPanelProps) {
	// Only use hook if we need the test cases panel and props aren't provided
	const hookResult = useTestTab(testResults, isExecuting);
	const activeTestTab = propActiveTestTab ?? hookResult.activeTestTab;
	const setActiveTestTab =
		propSetActiveTestTab ?? hookResult.setActiveTestTab;
	const testCasesPanelRef =
		propTestCasesPanelRef ?? hookResult.testCasesPanelRef;

	const { data: session, status } = useSession();
	const isAdmin = session?.user?.role === "ADMIN";
	const [resetDialogOpen, setResetDialogOpen] = useState(false);

	const buttonVariant =
		testResults.length > 0 && testResults.every((r) => r.passed)
			? "correct"
			: isThinking
			? "wrong"
			: "run";

	const buttonDisabled = isExecuting || isThinking;

	const handleReset = () => {
		onReset();
		setResetDialogOpen(false);
	};

	// Reusable Editor component
	const editorComponent = (
		<Editor
			code={code}
			setCode={setCode}
			iframeRef={iframeRef}
			handleRun={onRun}
			isExecuting={isExecuting}
			isThinking={isThinking}
			isInitialized={true}
			hasJustPassed={
				testResults.length > 0 && testResults.every((r) => r.passed)
			}
			onShowSolution={onShowSolution}
			showConsole={false}
			disableBorder={true}
			hideActionButtons={true}
			workspaceType="algo"
		/>
	);

	// Reusable Action Buttons Toolbar
	const actionButtonsToolbar = (
		<div className="w-full h-[64px] px-3 bg-background-2 items-center justify-between gap-2 border-t border-border flex">
			{status === "loading" || session?.user?.id ? (
				<>
					<Button
						onClick={onRun}
						variant={buttonVariant}
						disabled={buttonDisabled}
					>
						{isExecuting ? "Running..." : "Run"}
					</Button>
					{/* <Button
						onClick={onHint}
						variant="outline"
						disabled={buttonDisabled}
						className="flex items-center gap-2"
					>
						<Lightbulb className="w-4 h-4" />
						Hint
					</Button> */}
					<div className="flex items-center gap-2">
						{isAdmin && (
							<Button
								onClick={onShowSolution}
								variant="outline"
								disabled={buttonDisabled}
								className="text-orange-600 border-orange-200 hover:bg-orange-50"
							>
								Show Solution
							</Button>
						)}
						<AlertDialog
							open={resetDialogOpen}
							onOpenChange={setResetDialogOpen}
						>
							<AlertDialogTrigger asChild>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="outline"
											disabled={buttonDisabled}
											className="flex items-center gap-2"
										>
											<RotateCcw className="w-4 h-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										<p>Reset</p>
									</TooltipContent>
								</Tooltip>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										Reset Code Editor
									</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to reset the code
										editor? This will clear all your current
										code and cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel variant="ghost">
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleReset}
										variant="destructive"
									>
										Reset
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<FeedbackDialog
							problemId={problem.id}
							problemTitle={problem.title}
						>
							<Button
								variant="outline"
								disabled={buttonDisabled}
								className="p-2"
								size="icon"
							>
								<MessageCircleQuestionIcon className="w-4 h-4" />
							</Button>
						</FeedbackDialog>
					</div>
				</>
			) : (
				status === "unauthenticated" && (
					<div className="w-full flex items-center justify-center text-muted-foreground text-sm">
						You need to log in / sign up to run code
					</div>
				)
			)}
		</div>
	);

	// Reusable editor content wrapper
	const editorContent = (backgroundClass: string) => (
		<div className="border-1 rounded-2xl overflow-hidden gap-2 h-full">
			<div className="h-full flex rounfded-2xl overflow-hidden bforder-1">
				<div
					className={`flex-3 h-full ${backgroundClass} flex flex-col`}
				>
					<div className="w-full h-full flex flex-col p-0">
						<div className="min-h-[60vh] md:min-h-0 flex flex-1 flex-col overflow-hidden">
							{editorComponent}
						</div>
						{actionButtonsToolbar}
					</div>
				</div>
			</div>
		</div>
	);

	// If hiding test cases panel, just show editor
	if (hideTestCasesPanel) {
		return (
			<ResizablePanel
				defaultSize={33.33}
				minSize={10}
				className="flex flex-col overflow-hidden"
			>
				{editorContent("bg-background-2")}
			</ResizablePanel>
		);
	}

	return (
		<ResizablePanel
			defaultSize={50}
			minSize={10}
			className="flex flex-col overflow-hidden"
		>
			<ResizablePanelGroup
				direction="vertical"
				className="h-full overflow-hidden"
			>
				{/* Editor Panel */}
				<ResizablePanel
					defaultSize={95}
					minSize={30}
					maxSize={95}
					className="border-1 rounded-2xl overflow-hidden gap-2"
				>
					{editorContent("bg-background")}
				</ResizablePanel>

				<ResizableHandle className="!h-3 bg-transparent hover:bg-blue-800/60 rounded-md 2xl:hidden" />

				{/* Test Cases Panel */}
				<ResizablePanel
					defaultSize={5}
					minSize={5}
					maxSize={70}
					collapsible
					collapsedSize={5}
					className="flex flex-col overflow-hidden 2xl:hidden"
					ref={testCasesPanelRef}
				>
					<div className="h-full w-full">
						<TestCasesPanel
							problem={problem}
							testResults={testResults}
							activeTestTab={activeTestTab}
							setActiveTestTab={setActiveTestTab}
							isExecuting={isExecuting}
						/>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</ResizablePanel>
	);
}
