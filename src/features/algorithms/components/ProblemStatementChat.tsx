"use client";

import { ResizablePanel } from "@/components/ui/resizable";
import { AlgoProblemDetail, AlgoLesson } from "@/types/algorithm-types";
import { ChatMarkdownDisplay } from "@/components/workspace/Chat/components/ChatMarkdownDisplay";
import { useState, useRef, useEffect, useCallback } from "react";
import {
	trackAlgoTabSwitched,
	trackAlgoSubmissionsTabViewed,
	trackAlgoTopicsDialogOpened,
} from "@/lib/analytics";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import ThinkingAnimation from "@/components/workspace/Chat/components/ThinkingAnimation";
import { SubmissionMessage } from "./SubmissionMessage";
import { TopicsDropdown } from "./TopicsDropdown";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	TagIcon,
	ChevronUp,
	ChevronDown,
	Plus,
	Mic,
	ArrowUp,
	CodeXmlIcon,
	ScanTextIcon,
	FlaskConicalIcon,
	HistoryIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "@/components/workspace/Chat/components/ChatMarkdownDisplay.css";
import "./ProblemStatement.css";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { SubmissionsTab } from "./SubmissionsTab";
import { DescriptionTab } from "./DescriptionTab";
import { SubmissionDetailTab } from "./SubmissionDetailTab";
import { getSubmissionHistory } from "@/lib/actions/algoProgress";
import { AlgoProblemSubmission } from "@/types/algorithm-types";
import { X } from "lucide-react";

interface ProblemStatementChatProps {
	problem: AlgoProblemDetail;
	processedStatement: string;
	chatMessages: any[];
	onSendMessage: (message: string) => void;
	isThinking?: boolean;
	streamingMessageId?: string | null;
	relatedLessons?: AlgoLesson[];
	defaultSize?: number; // Default panel size (for 2 or 3 column layouts)
	onCopyToEditor?: (code: string) => void;
	onNewSubmission?: (
		handler: (submission: AlgoProblemSubmission) => void
	) => void;
	code?: string;
	testResults?: any[];
}

export function ProblemStatementChat({
	problem,
	processedStatement,
	chatMessages,
	onSendMessage,
	isThinking = false,
	streamingMessageId = null,
	relatedLessons = [],
	defaultSize = 50,
	onCopyToEditor,
	onNewSubmission,
	code,
	testResults,
}: ProblemStatementChatProps) {
	const [inputValue, setInputValue] = useState("");
	const [isTopicsDialogOpen, setIsTopicsDialogOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"description" | "submissions" | "submission"
	>("description");
	const [selectedSubmission, setSelectedSubmission] =
		useState<AlgoProblemSubmission | null>(null);
	const [
		processedExamplesAndConstraints,
		setProcessedExamplesAndConstraints,
	] = useState<string>("");
	const [isScrolled, setIsScrolled] = useState(false);
	const [isStickyExpanded, setIsStickyExpanded] = useState(false);
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const [needsExpandCollapse, setNeedsExpandCollapse] = useState(false);
	const [isExpandedBeforeMessages, setIsExpandedBeforeMessages] =
		useState(true);
	const [submissions, setSubmissions] = useState<AlgoProblemSubmission[]>([]);
	const [submissionsLoading, setSubmissionsLoading] = useState(false);
	const [submissionsFetched, setSubmissionsFetched] = useState(false);
	const { data: session, status } = useSession();
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const chatContainerRef = useRef<HTMLDivElement | null>(null);
	const problemStatementContentRef = useRef<HTMLDivElement | null>(null);
	const hasUserMessagesRef = useRef(false);
	const isInitialStickyRenderRef = useRef(false);
	const hasInitializedExpandedStateRef = useRef(false);
	const userHasInteractedWithExpandRef = useRef(false);

	// Process examples and constraints
	useEffect(() => {
		const processExamplesAndConstraints = async () => {
			// If examplesAndConstraintsHtml exists, use it
			if (problem.examplesAndConstraintsHtml) {
				setProcessedExamplesAndConstraints(
					problem.examplesAndConstraintsHtml
				);
				return;
			}

			// Otherwise, if examplesAndConstraintsMd exists, process it
			if (problem.examplesAndConstraintsMd) {
				try {
					const html = await processMarkdown(
						problem.examplesAndConstraintsMd,
						{
							allowInlineHtml: true,
							codeBackgroundInChoices: true,
						}
					);
					setProcessedExamplesAndConstraints(html);
				} catch (error) {
					// console.error(
					// 	"Error processing examples/constraints:",
					// 	error
					// );
					setProcessedExamplesAndConstraints("");
				}
			} else {
				// No examples/constraints yet - show empty
				setProcessedExamplesAndConstraints("");
			}
		};

		processExamplesAndConstraints();
	}, [problem]);

	// Track scroll state to conditionally show shadow
	useEffect(() => {
		const container = chatContainerRef.current;
		if (!container) return;

		const handleScroll = () => {
			setIsScrolled(container.scrollTop > 0);
		};

		container.addEventListener("scroll", handleScroll);
		// Check initial scroll state
		handleScroll();

		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// Auto-scroll to bottom when new messages arrive (but not for initial problem statement/examples)
	useEffect(() => {
		// Only auto-scroll if there are actual chat messages beyond the initial ones
		const nonInitialMessages = chatMessages.filter(
			(msg) =>
				msg.id !== "problem-statement" &&
				msg.id !== "examples-constraints"
		);
		if (nonInitialMessages.length > 0) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [chatMessages, isThinking]);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (
			e.key === "Enter" &&
			!e.shiftKey &&
			inputValue.trim() &&
			!isThinking
		) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleSend = () => {
		if (inputValue.trim() && !isThinking) {
			onSendMessage(inputValue.trim());
			setInputValue("");
		}
	};

	// Get problem statement and examples/constraints from chatMessages
	const problemStatementMessage = chatMessages.find(
		(msg) => msg.id === "problem-statement"
	);
	const examplesConstraintsMessage = chatMessages.find(
		(msg) => msg.id === "examples-constraints"
	);

	// Filter out initial messages from chatMessages for display
	const displayMessages = chatMessages.filter(
		(msg) =>
			msg.id !== "problem-statement" && msg.id !== "examples-constraints"
	);

	// Check if user has interacted (any message beyond problem statement/examples-constraints)
	// This includes: user messages, submissions, hints (AI responses), or any other interaction
	// If yes, make problem statement sticky
	const hasUserMessages = displayMessages.length > 0;

	// Initialize expanded state once on mount (only if content exceeds 30vh and no user messages)
	useEffect(() => {
		const contentDiv = problemStatementContentRef.current;
		if (!contentDiv || hasInitializedExpandedStateRef.current) return;

		// Use requestAnimationFrame to ensure DOM is fully rendered
		requestAnimationFrame(() => {
			if (!contentDiv || userHasInteractedWithExpandRef.current) return;

			const contentHeight = contentDiv.scrollHeight;
			const viewportHeight30vh = window.innerHeight * 0.3;
			const needsExpCollapse = contentHeight > viewportHeight30vh;

			if (needsExpCollapse && !hasUserMessages) {
				setIsExpandedBeforeMessages(true);
				hasInitializedExpandedStateRef.current = true;
			}
		});
	}, [problemStatementMessage, processedStatement, hasUserMessages]);

	// Measure problem statement content height to determine if expand/collapse is needed
	useEffect(() => {
		const contentDiv = problemStatementContentRef.current;
		if (!contentDiv) return;

		const measureHeight = () => {
			const contentHeight = contentDiv.scrollHeight;
			const viewportHeight30vh = window.innerHeight * 0.3;
			const needsExpCollapse = contentHeight > viewportHeight30vh;
			setNeedsExpandCollapse(needsExpCollapse);
			// Do NOT touch isExpandedBeforeMessages here - it's only set in the initialization effect above
		};

		// Measure initially and on resize
		measureHeight();
		window.addEventListener("resize", measureHeight);

		// Use ResizeObserver for more accurate measurement when content changes
		const resizeObserver = new ResizeObserver(measureHeight);
		resizeObserver.observe(contentDiv);

		return () => {
			window.removeEventListener("resize", measureHeight);
			resizeObserver.disconnect();
		};
	}, [problemStatementMessage, processedStatement]);

	// Trigger animation when hasUserMessages becomes true for the first time
	useEffect(() => {
		if (hasUserMessages && !hasUserMessagesRef.current) {
			hasUserMessagesRef.current = true;
			isInitialStickyRenderRef.current = true;
			// Sync expanded state from before-messages state if it was expanded
			const shouldStartExpanded =
				isExpandedBeforeMessages && needsExpandCollapse;
			setIsStickyExpanded(shouldStartExpanded);
			setShouldAnimate(false); // Disable animation for initial expanded state
			// Immediately enable animation and collapse if needed (no delay)
			requestAnimationFrame(() => {
				isInitialStickyRenderRef.current = false;
				setShouldAnimate(true);
				// Small delay to ensure transition is enabled before changing state
				// Only collapse if it wasn't expanded before
				if (!shouldStartExpanded) {
					setTimeout(() => {
						setIsStickyExpanded(false);
					}, 50);
				}
			});
		} else if (!hasUserMessages) {
			// Reset when user messages are cleared
			hasUserMessagesRef.current = false;
			isInitialStickyRenderRef.current = false;
			setIsStickyExpanded(false);
			setShouldAnimate(false);
			// Reset the initialization flags so it can be set again if needed
			hasInitializedExpandedStateRef.current = false;
			userHasInteractedWithExpandRef.current = false;
		}
	}, [hasUserMessages, isExpandedBeforeMessages, needsExpandCollapse]);

	// Fetch submissions on page load and when problem changes
	useEffect(() => {
		if (!session?.user?.id || !problem.id) {
			setSubmissions([]);
			setSubmissionsFetched(false);
			setSubmissionsLoading(false);
			return;
		}

		const fetchSubmissions = async () => {
			try {
				setSubmissionsLoading(true);
				const data = await getSubmissionHistory(
					session.user.id,
					problem.id
				);
				setSubmissions(data);
				setSubmissionsFetched(true);
			} catch (error) {
				console.error("Error fetching submission history:", error);
				setSubmissions([]);
				setSubmissionsFetched(true); // Mark as fetched even on error to prevent retries
			} finally {
				setSubmissionsLoading(false);
			}
		};

		// Reset and fetch when problem changes
		setSubmissions([]);
		setSubmissionsFetched(false);
		setSelectedSubmission(null); // Reset selected submission when problem changes
		// setActiveTab("description"); // Reset to description tab
		fetchSubmissions();
	}, [session?.user?.id, problem.id]);

	// Handle new submissions from parent
	// Parent will call onNewSubmission(submission) when a new submission is created
	// We update our local state when this happens
	const handleNewSubmission = useCallback(
		(submission: AlgoProblemSubmission) => {
			if (submission.problemId === problem.id) {
				setSubmissions((prev) => [submission, ...prev]);
			}
		},
		[problem.id]
	);

	// Store the handler in a ref so parent can access it
	const submissionHandlerRef = useRef(handleNewSubmission);
	useEffect(() => {
		submissionHandlerRef.current = handleNewSubmission;
	}, [handleNewSubmission]);

	// Expose handler to parent via callback prop
	// Parent will call this callback to register the handler, then call the handler when submission is created
	useEffect(() => {
		if (onNewSubmission) {
			// Parent passes a function that we call with our handler
			// Parent stores our handler and calls it when submission is created
			onNewSubmission(submissionHandlerRef.current);
		}
	}, [onNewSubmission]);

	return (
		<ResizablePanel
			defaultSize={defaultSize}
			minSize={10}
			maxSize={80}
			className="flex flex-col"
		>
			<div className="bg-background flex flex-col rounded-2xl border-[#2f2f2f] border-1 overflow-hidden h-full">
				{/* Header */}
				<div className="flex items-center justify-between p-3 py-1.5 border-b border-border">
					<div className="flex gap-4">
						<button
							onClick={() => {
								if (activeTab !== "description") {
									trackAlgoTabSwitched(
										problem.id,
										activeTab,
										"description"
									);
								}
								setActiveTab("description");
							}}
							className={`text-sm px-1.5 py-1 rounded-md hover:bg-white/10 hover:cursor-pointer flex items-center gap-1.5 ${
								activeTab !== "description" &&
								"text-muted-foreground"
							}`}
						>
							<ScanTextIcon className="h-4 w-4 text-[#007bff]" />
							Description
						</button>

						<button
							onClick={() => {
								if (activeTab !== "submissions") {
									trackAlgoTabSwitched(
										problem.id,
										activeTab,
										"submissions"
									);
									// Track submissions tab viewed
									trackAlgoSubmissionsTabViewed(
										problem.id,
										submissions.length
									);
								}
								setActiveTab("submissions");
							}}
							className={`text-sm px-1.5 py-1 rounded-md hover:bg-white/10 hover:cursor-pointer flex items-center gap-1.5 ${
								activeTab !== "submissions" &&
								"text-muted-foreground"
							}`}
						>
							<FlaskConicalIcon className="h-4 w-4 text-[#007bff]" />
							Submissions
						</button>

						{selectedSubmission && (
							<div
								className={cn(
									"flex justify-center items-center gap-1 px-1.5 py-1 rounded-md hover:bg-white/10 group",
									activeTab === "submission" && "bg-white/10"
								)}
							>
								<button
									onClick={() => {
										if (activeTab !== "submission") {
											trackAlgoTabSwitched(
												problem.id,
												activeTab,
												"submission"
											);
										}
										setActiveTab("submission");
									}}
									className={`text-sm flex items-center gap-1.5 ${
										activeTab === "submission"
											? "text-white"
											: "text-muted-foreground"
									}`}
								>
									<HistoryIcon className="h-4 w-4 text-[#007bff]" />{" "}
									Submission
								</button>
								<button
									onClick={() => {
										setSelectedSubmission(null);
										// Switch back to submissions tab when closing
										if (activeTab === "submission") {
											setActiveTab("submissions");
										}
									}}
									className={cn(
										"hover:bg-white/10 rounded p-0.5 pb-0.25 transition-colors hover:text-white text-muted-foreground",
										activeTab === "submission" &&
											"text-white"
									)}
									aria-label="Close submission"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							</div>
						)}
					</div>
				</div>
				{/* Topics Dialog */}
				<Dialog
					open={isTopicsDialogOpen}
					onOpenChange={(open) => {
						setIsTopicsDialogOpen(open);
						if (open) {
							trackAlgoTopicsDialogOpened(
								problem.id,
								problem.topics.length
							);
						}
					}}
				>
					<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
						<DialogTitle>Topics & Related Lessons</DialogTitle>
						<div className="mt-3 mb-2">
							<div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
								<p className="text-sm text-foreground mb-2">
									<strong>💡 Tip:</strong> Try solving the
									problem first without checking the topics!
									Pattern recognition is a crucial skill.
								</p>
								<p className="text-sm text-foreground">
									Use the AI coach to guide your thinking
									rather than jumping straight to the solution
									pattern.
								</p>
							</div>
						</div>
						<div className="mft-4">
							<TopicsDropdown
								topics={problem.topics}
								relatedLessons={relatedLessons}
								problemId={problem.id}
							/>
						</div>
					</DialogContent>
				</Dialog>
				{/* Tab Content */}
				<div className="flex-1 flex flex-col overflow-hidden">
					{activeTab === "description" ? (
						<DescriptionTab
							problem={problem}
							processedStatement={processedStatement}
							chatMessages={chatMessages}
							onSendMessage={onSendMessage}
							isThinking={isThinking}
							streamingMessageId={streamingMessageId}
							relatedLessons={relatedLessons}
							processedExamplesAndConstraints={
								processedExamplesAndConstraints
							}
							examplesConstraintsMessage={chatMessages.find(
								(msg) => msg.id === "examples-constraints"
							)}
							problemStatementMessage={chatMessages.find(
								(msg) => msg.id === "problem-statement"
							)}
							displayMessages={chatMessages.filter(
								(msg) =>
									msg.id !== "problem-statement" &&
									msg.id !== "examples-constraints"
							)}
							hasUserMessages={
								chatMessages.filter(
									(msg) =>
										msg.id !== "problem-statement" &&
										msg.id !== "examples-constraints"
								).length > 0
							}
							messagesEndRef={messagesEndRef}
							chatContainerRef={chatContainerRef}
							problemStatementContentRef={
								problemStatementContentRef
							}
							isStickyExpanded={isStickyExpanded}
							setIsStickyExpanded={setIsStickyExpanded}
							shouldAnimate={shouldAnimate}
							needsExpandCollapse={needsExpandCollapse}
							isExpandedBeforeMessages={isExpandedBeforeMessages}
							setIsExpandedBeforeMessages={
								setIsExpandedBeforeMessages
							}
							inputValue={inputValue}
							setInputValue={setInputValue}
							handleKeyPress={handleKeyPress}
							handleSend={handleSend}
							setIsTopicsDialogOpen={setIsTopicsDialogOpen}
							hasUserMessagesRef={hasUserMessagesRef}
							isInitialStickyRenderRef={isInitialStickyRenderRef}
							hasInitializedExpandedStateRef={
								hasInitializedExpandedStateRef
							}
							userHasInteractedWithExpandRef={
								userHasInteractedWithExpandRef
							}
							code={code}
							testResults={testResults}
						/>
					) : activeTab === "submission" && selectedSubmission ? (
						<SubmissionDetailTab
							submission={selectedSubmission}
							onCopyToEditor={onCopyToEditor}
						/>
					) : (
						<SubmissionsTab
							problemId={problem.id}
							userId={session?.user?.id || ""}
							userLoading={status === "loading"}
							submissions={submissions}
							isLoading={submissionsLoading}
							onSubmissionClick={(submission) => {
								setSelectedSubmission(submission);
								setActiveTab("submission");
							}}
						/>
					)}
				</div>
			</div>
		</ResizablePanel>
	);
}
