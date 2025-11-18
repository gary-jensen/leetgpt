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
import { signIn, useSession } from "next-auth/react";
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
import { useState, useEffect, useRef } from "react";
import { FeedbackDialog } from "./FeedbackDialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	trackSignInButtonClick,
	trackUpgradeToProButtonClick,
} from "@/lib/analytics";
import Link from "next/link";

interface EditorPanelProps {
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
	isThinking: boolean;
	problem: AlgoProblemDetail;
	hideTestCasesPanel?: boolean; // Hide test cases panel (used when showing as separate column)
	activeTestTab?: "examples" | "testcase" | "results"; // Passed from parent when hideTestCasesPanel is false
	setActiveTestTab?: (tab: "examples" | "testcase" | "results") => void; // Passed from parent when hideTestCasesPanel is false
	testCasesPanelRef?: React.RefObject<ImperativePanelHandle | null>; // Passed from parent when hideTestCasesPanel is false
	buttonDisabled?: boolean; // External button disabled state (e.g., subscription-based)
}

export function EditorPanel({
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
	isThinking,
	problem,
	hideTestCasesPanel = false,
	activeTestTab: propActiveTestTab,
	setActiveTestTab: propSetActiveTestTab,
	testCasesPanelRef: propTestCasesPanelRef,
	buttonDisabled: externalButtonDisabled,
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
	const [showGlow, setShowGlow] = useState<"run" | "submit" | null>(null);
	const glowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const previousIsExecutingRef = useRef(isExecuting);

	// Trigger glow animation when execution finishes
	useEffect(() => {
		// When execution transitions from true to false and we have results
		if (
			!isExecuting &&
			previousIsExecutingRef.current &&
			executionType &&
			testResults.length > 0
		) {
			// Show glow immediately
			setShowGlow(executionType);

			// Clear any existing timeout
			if (glowTimeoutRef.current) {
				clearTimeout(glowTimeoutRef.current);
			}

			// Hide glow after 1s (animation duration) and return to original colors
			glowTimeoutRef.current = setTimeout(() => {
				setShowGlow(null);
			}, 1000);
		} else if (isExecuting) {
			// Clear glow when execution starts
			setShowGlow(null);
			if (glowTimeoutRef.current) {
				clearTimeout(glowTimeoutRef.current);
			}
		}

		// Update previous execution state
		previousIsExecutingRef.current = isExecuting;

		return () => {
			if (glowTimeoutRef.current) {
				clearTimeout(glowTimeoutRef.current);
			}
		};
	}, [isExecuting, executionType, testResults.length]);

	// Determine button variants based on execution type and results
	const allTestsPassed =
		testResults.length > 0 && testResults.every((r) => r.passed);
	const hasResults = testResults.length > 0;

	// Run button: grey (outline) when not executing, glow variants during animation, then back to outline
	const runButtonVariant = isExecuting
		? "outline"
		: showGlow === "run" && hasResults
		? allTestsPassed
			? "runCorrect"
			: "runWrong"
		: "run";

	// Submit button: run variant when not executing, glow variants during animation, then back to run
	const submitButtonVariant = isExecuting
		? "run"
		: showGlow === "submit" && hasResults
		? allTestsPassed
			? "submitCorrect"
			: "submitWrong"
		: "submit";

	const internalButtonDisabled = isExecuting || isThinking;
	const buttonDisabled =
		internalButtonDisabled || externalButtonDisabled || false;

	// Button text logic
	const getRunButtonText = () => {
		if (isExecuting) return "Pending...";
		return "Run";
	};

	const getSubmitButtonText = () => {
		if (isExecuting) return "Pending...";
		return "Submit";
	};

	const handleReset = () => {
		onReset();
		setResetDialogOpen(false);
	};

	const handleSignIn = async () => {
		// Track the signin button click event
		trackSignInButtonClick("algo_editor_panel");
		await signIn();
	};
	const handleUpgradeToPro = () => {
		// Track the signin button click event
		trackUpgradeToProButtonClick("algo_editor_panel");
		// await signIn();
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
			{session?.user?.id && session?.user?.role !== "BASIC" ? (
				<>
					<div className="flex items-center gap-2">
						{isExecuting ? (
							<div className="flex items-center justify-center px-4 py-2 text-muted-foreground">
								Pending...
							</div>
						) : (
							<>
								<Button
									onClick={onRun}
									variant={runButtonVariant}
									disabled={buttonDisabled}
								>
									{getRunButtonText()}
								</Button>
								<Button
									onClick={onSubmit}
									variant={submitButtonVariant}
									disabled={buttonDisabled}
								>
									{getSubmitButtonText()}
								</Button>
							</>
						)}
					</div>
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
								className="opacity-0 disabled:opacity-0 hover:opacity-100 !text-orange-600 border-orange-600 duration-0"
							>
								Show Solution
							</Button>
						)}
						<AlertDialog
							open={resetDialogOpen}
							onOpenChange={setResetDialogOpen}
						>
							<Tooltip>
								<TooltipTrigger asChild>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											disabled={buttonDisabled}
											className="flex items-center gap-2"
										>
											<RotateCcw className="w-4 h-4" />
										</Button>
									</AlertDialogTrigger>
								</TooltipTrigger>
								<TooltipContent>
									<p>Reset</p>
								</TooltipContent>
							</Tooltip>
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
			) : status === "unauthenticated" ? (
				<div className="w-full flex items-center justify-center text-muted-foreground text-sm">
					You need to{" "}
					<Button
						variant="link"
						onClick={handleSignIn}
						className="mx-2 px-0 text-blue-500 cursor-pointer"
					>
						log in / sign up
					</Button>{" "}
					to run code
				</div>
			) : (
				session?.user?.role === "BASIC" && (
					<div className="w-full flex items-center justify-center text-muted-foreground text-sm">
						<Link href="/billing">
							<Button
								variant="link"
								onClick={handleUpgradeToPro}
								className="mx-2 px-0 text-blue-500 cursor-pointer"
							>
								Upgrade to PRO
							</Button>
						</Link>{" "}
						to run code
					</div>
				)
			)}
		</div>
	);

	// Reusable editor content wrapper
	const editorContent = (backgroundClass: string) => (
		<div className="border-1 border-[#2f2f2f] rounded-2xl overflow-hidden gap-2 h-full">
			<div className="h-full flex rounfded-2xl overflow-hidden">
				<div
					className={`flex-3 h-full ${backgroundClass} flex flex-col`}
				>
					<div className="w-full h-full flex flex-col p-0">
						<div className="md:min-h-0 flex flex-1 flex-col overflow-hidden">
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
					className="overflow-hidden gap-2"
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
