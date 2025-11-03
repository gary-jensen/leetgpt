"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { WorkspaceLayout } from "./WorkspaceLayout";
import { TestResult } from "./TestResultsDisplay";
import { useAlgoProblemExecution } from "../hooks/useAlgoProblemExecution";
import { streamAlgoCoachMessage } from "../services/algoCoachStream";
import { Button } from "@/components/ui/button";
import { AlgoProblemDetail, AlgoLesson } from "@/types/algorithm-types";
import { useProgress } from "@/contexts/ProgressContext";
import { useSession } from "next-auth/react";
import { updateAlgoProblemProgress } from "@/lib/actions/algoProgress";
import {
	trackAlgoProblemViewed,
	trackAlgoHintRequested,
} from "@/lib/analytics";
import { toast } from "sonner";
import { TopicsDropdown } from "./TopicsDropdown";

interface AlgorithmWorkspaceProps {
	problem: AlgoProblemDetail;
	relatedLessons: AlgoLesson[];
}

export function AlgorithmWorkspace({
	problem,
	relatedLessons,
}: AlgorithmWorkspaceProps) {
	const [chatMessages, setChatMessages] = useState<any[]>([]);
	const [isThinking, setIsThinking] = useState(false);
	const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
		null
	);
	const [currentSessionId, setCurrentSessionId] = useState<string>("");
	const chatMessagesRef = useRef<any[]>([]);
	const previousIsExecutingRef = useRef(false);
	const submissionCounterRef = useRef(0);
	const { data: session } = useSession();
	const progress = useProgress();

	// Keep ref in sync with state
	useEffect(() => {
		chatMessagesRef.current = chatMessages;
	}, [chatMessages]);

	const {
		code,
		setCode,
		testResults,
		isExecuting,
		iframeRef,
		executeCode,
		resetCode,
		showSolution,
		buttonVariant,
		buttonDisabled,
		allTestsPassed,
	} = useAlgoProblemExecution(problem);

	// Create new chat session on mount and initialize with problem statement
	useEffect(() => {
		const sessionId = `session_${Date.now()}_${Math.random()
			.toString(36)
			.substring(7)}`;
		setCurrentSessionId(sessionId);

		// Initialize chat with problem statement and examples/constraints
		const initialMessages: any[] = [
			{
				id: "problem-statement",
				role: "assistant" as const,
				content: problem.statementHtml || problem.statementMd,
				timestamp: new Date(),
				type: "problem_statement",
			},
		];

		// Add examples/constraints if available
		if (
			problem.examplesAndConstraintsHtml ||
			problem.examplesAndConstraintsMd
		) {
			initialMessages.push({
				id: "examples-constraints",
				role: "assistant" as const,
				content:
					problem.examplesAndConstraintsHtml ||
					problem.examplesAndConstraintsMd ||
					"",
				timestamp: new Date(),
				type: "examples_constraints",
			});
		}

		setChatMessages(initialMessages);
	}, [problem.id]); // Re-initialize when problem changes

	// Create submission message when code execution completes
	useEffect(() => {
		// Only create submission message after execution completes (transition from executing to done)
		if (!isExecuting && previousIsExecutingRef.current) {
			// Create submission message if we have test results OR if execution just finished
			// This ensures errors are shown even if testResults is empty or errors occurred
			if (testResults.length > 0) {
				const testsPassed = testResults.filter((r) => r.passed).length;
				const allPassed = testsPassed === testResults.length;
				const totalRuntime = testResults.reduce(
					(sum, r) => sum + (r.runtime || 0),
					0
				);

				// Debug: log test results to verify errors are present
				const hasErrors = testResults.some((r) => r.error);
				if (hasErrors) {
					console.log(
						"Creating submission message with errors:",
						testResults
					);
				}

				// Generate unique ID with counter to avoid duplicates
				submissionCounterRef.current += 1;
				const submissionMessage = {
					id: `submission-${Date.now()}-${
						submissionCounterRef.current
					}`,
					role: "user" as const,
					type: "submission",
					content: "Submitted code solution",
					timestamp: new Date(),
					submissionData: {
						allPassed,
						testsPassed,
						testsTotal: testResults.length,
						runtime: totalRuntime, // Always include runtime, even if 0
						testResults,
					},
				};

				setChatMessages((prev) => {
					const updated = [...prev, submissionMessage];
					chatMessagesRef.current = updated;
					return updated;
				});

				// Auto-trigger AI response after submission (async, don't await)
				handleSubmissionResponse(submissionMessage).catch((error) => {
					console.error("Error handling submission response:", error);
				});
			}
		}

		// Update previous execution state
		previousIsExecutingRef.current = isExecuting;
	}, [testResults, isExecuting]);

	// Load saved code from context on mount
	useEffect(() => {
		if (session?.user?.id && progress.getAlgoProblemProgress) {
			const savedProgress = progress.getAlgoProblemProgress(
				problem.id,
				"javascript"
			);
			if (savedProgress?.currentCode) {
				setCode(savedProgress.currentCode);
			}
			// Don't load old chat messages - we start fresh each session
		}
	}, [session, progress, problem.id, setCode]);

	// Track problem viewed
	useEffect(() => {
		trackAlgoProblemViewed(problem.id, problem.title, problem.difficulty);
	}, [problem.id, problem.title, problem.difficulty]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl/Cmd + Enter: Run code
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				if (!buttonDisabled && !isExecuting) {
					executeCode();
				}
			}

			// Ctrl/Cmd + H: Request hint
			if ((e.ctrlKey || e.metaKey) && e.key === "h") {
				e.preventDefault();
				handleHint();
			}

			// Escape: Reset code (optional)
			if (e.key === "Escape") {
				// Could add reset confirmation modal later
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [executeCode, buttonDisabled, isExecuting]);

	const handleHint = async () => {
		setIsThinking(true);
		trackAlgoHintRequested(problem.id, problem.title);

		// Add user message indicating hint was requested
		const userHintMessage = {
			id: `hint-request-${Date.now()}`,
			role: "user" as const,
			content: "Can I have a hint?",
			timestamp: new Date(),
		};

		setChatMessages((prev) => [...prev, userHintMessage]);

		const hintMessageId = `hint-${Date.now()}`;
		const hintMessage = {
			id: hintMessageId,
			role: "assistant" as const,
			content: "",
			timestamp: new Date(),
		};

		setChatMessages((prev) => [...prev, hintMessage]);
		setStreamingMessageId(hintMessageId);

		let fullContent = "";

		try {
			await streamAlgoCoachMessage(
				{
					problemId: problem.id,
					code,
					chatHistory: [
						...chatMessagesRef.current.filter(
							(msg) =>
								msg.id !== "problem-statement" &&
								msg.id !== "examples-constraints"
						),
						userHintMessage,
					],
					failureSummary: getFailureSummary(testResults),
					type: "hint",
				},
				(data) => {
					if (data.content) {
						// Stop thinking animation as soon as first chunk arrives
						if (fullContent === "") {
							setIsThinking(false);
						}
						fullContent += data.content;
						setChatMessages((prev) =>
							prev.map((msg) =>
								msg.id === hintMessageId
									? { ...msg, content: fullContent }
									: msg
							)
						);
					}

					if (data.done) {
						setStreamingMessageId(null);
					}
				},
				(error) => {
					console.error("Error streaming hint:", error);
					setStreamingMessageId(null);
					setIsThinking(false);
					setChatMessages((prev) =>
						prev.map((msg) =>
							msg.id === hintMessageId
								? {
										...msg,
										content:
											"Sorry, I encountered an error. Please try again.",
								  }
								: msg
						)
					);
					if (error instanceof Error) {
						if (error.message.includes("Rate limit")) {
							toast.error(error.message);
						} else if (
							error.message.includes("Authentication required")
						) {
							toast.error("Please sign in to use AI hints");
						} else {
							toast.error(
								"Failed to get hint. Please try again."
							);
						}
					}
				}
			);
		} catch (error) {
			console.error("Error getting hint:", error);
			setStreamingMessageId(null);
			setIsThinking(false);
			setChatMessages((prev) =>
				prev.map((msg) =>
					msg.id === hintMessageId
						? {
								...msg,
								content:
									"Failed to get hint. Please try again.",
						  }
						: msg
				)
			);
			if (error instanceof Error) {
				if (error.message.includes("Rate limit")) {
					toast.error(error.message);
				} else if (error.message.includes("Authentication required")) {
					toast.error("Please sign in to use AI hints");
				} else {
					toast.error("Failed to get hint. Please try again.");
				}
			}
		}
	};

	const handleSubmissionResponse = async (submissionMessage: any) => {
		if (!session?.user?.id) return; // Skip if not authenticated

		setIsThinking(true);

		const submissionMessageId = `submission-${Date.now()}`;
		const submissionAiMessage = {
			id: submissionMessageId,
			role: "assistant" as const,
			content: "",
			timestamp: new Date(),
		};

		setChatMessages((prev) => [...prev, submissionAiMessage]);
		setStreamingMessageId(submissionMessageId);

		let fullContent = "";

		try {
			// Stream submission response
			await streamAlgoCoachMessage(
				{
					problemId: problem.id,
					code,
					chatHistory: chatMessagesRef.current.filter(
						(msg) =>
							msg.id !== "problem-statement" &&
							msg.id !== "examples-constraints"
					),
					submissionData: submissionMessage.submissionData,
					type: "submission",
				},
				(data) => {
					if (data.content) {
						// Stop thinking animation as soon as first chunk arrives
						if (fullContent === "") {
							setIsThinking(false);
						}
						fullContent += data.content;
						setChatMessages((prev) =>
							prev.map((msg) =>
								msg.id === submissionMessageId
									? { ...msg, content: fullContent }
									: msg
							)
						);
					}

					if (data.done) {
						setStreamingMessageId(null);
					}
				},
				(error) => {
					console.error(
						"Error streaming submission response:",
						error
					);
					setStreamingMessageId(null);
					setIsThinking(false);
					// Remove empty message on error - silent failure for auto-responses
					setChatMessages((prev) =>
						prev.filter((msg) => msg.id !== submissionMessageId)
					);
				}
			);

			// Persist chat history to database
			if (session?.user?.id && currentSessionId && fullContent) {
				try {
					const savedProgress = progress.getAlgoProblemProgress?.(
						problem.id,
						"javascript"
					);
					const existingSessions = savedProgress?.chatHistory || [];

					const currentSession = {
						id: currentSessionId,
						createdAt: new Date(),
						messages: [
							...chatMessagesRef.current,
							submissionMessage,
							{ ...submissionAiMessage, content: fullContent },
						],
					};

					await updateAlgoProblemProgress(
						session.user.id,
						problem.id,
						"javascript",
						{
							chatHistory: [...existingSessions, currentSession],
						}
					);
				} catch (error) {
					console.error("Error saving submission response:", error);
				}
			}
		} catch (error) {
			console.error("Error getting submission response:", error);
			setStreamingMessageId(null);
			setIsThinking(false);
			// Remove empty message on error - silent failure for auto-responses
			setChatMessages((prev) =>
				prev.filter((msg) => msg.id !== submissionMessageId)
			);
		}
	};

	const handleSendMessage = async (message: string) => {
		if (!message.trim()) return;

		const userMessage = {
			id: Date.now().toString(),
			role: "user" as const,
			content: message,
			timestamp: new Date(),
		};

		setChatMessages((prev) => [...prev, userMessage]);
		setIsThinking(true);

		// Create AI message with empty content for streaming
		const aiMessageId = `ai-${Date.now()}`;
		const aiMessage = {
			id: aiMessageId,
			role: "assistant" as const,
			content: "",
			timestamp: new Date(),
		};

		setChatMessages((prev) => [...prev, aiMessage]);
		setStreamingMessageId(aiMessageId);

		let fullContent = "";

		try {
			// Stream AI response
			await streamAlgoCoachMessage(
				{
					problemId: problem.id,
					userMessage: message,
					code,
					chatHistory: chatMessagesRef.current.filter(
						(msg) =>
							msg.id !== "problem-statement" &&
							msg.id !== "examples-constraints"
					),
					type: "chat",
				},
				(data) => {
					if (data.content) {
						// Stop thinking animation as soon as first chunk arrives
						if (fullContent === "") {
							setIsThinking(false);
						}
						fullContent += data.content;
						setChatMessages((prev) =>
							prev.map((msg) =>
								msg.id === aiMessageId
									? { ...msg, content: fullContent }
									: msg
							)
						);
					}

					if (data.done) {
						setStreamingMessageId(null);
					}
				},
				(error) => {
					console.error("Error streaming AI response:", error);
					setStreamingMessageId(null);
					setIsThinking(false);
					// Update message with error
					setChatMessages((prev) =>
						prev.map((msg) =>
							msg.id === aiMessageId
								? {
										...msg,
										content:
											"Sorry, I encountered an error. Please try again.",
								  }
								: msg
						)
					);
				}
			);

			// Persist chat history to database if authenticated
			if (session?.user?.id && currentSessionId) {
				try {
					const savedProgress = progress.getAlgoProblemProgress?.(
						problem.id,
						"javascript"
					);
					const existingSessions = savedProgress?.chatHistory || [];

					const currentSession = {
						id: currentSessionId,
						createdAt: new Date(),
						messages: [
							...chatMessagesRef.current.filter(
								(msg) =>
									msg.id !== "problem-statement" &&
									msg.id !== "examples-constraints"
							),
							userMessage,
							{ ...aiMessage, content: fullContent },
						],
					};

					await updateAlgoProblemProgress(
						session.user.id,
						problem.id,
						"javascript",
						{
							chatHistory: [...existingSessions, currentSession],
						}
					);
				} catch (error) {
					console.error("Error saving chat history:", error);
				}
			}
		} catch (error) {
			console.error("Error getting AI response:", error);
			setStreamingMessageId(null);
			setIsThinking(false);

			let errorContent = "Failed to get AI response. Please try again.";
			if (error instanceof Error) {
				if (error.message.includes("Rate limit")) {
					errorContent = error.message;
					toast.error(error.message);
				} else if (error.message.includes("Authentication required")) {
					errorContent = "Please sign in to use AI chat";
					toast.error("Please sign in to use AI chat");
				} else {
					toast.error("Failed to get AI response. Please try again.");
				}
			}

			const errorMessage = {
				id: (Date.now() + 1).toString(),
				role: "assistant" as const,
				content: errorContent,
				timestamp: new Date(),
			};
			setChatMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsThinking(false);
		}
	};

	return (
		<>
			<WorkspaceLayout
				problem={problem}
				code={code}
				setCode={setCode}
				testResults={testResults}
				isExecuting={isExecuting}
				onRun={executeCode}
				onReset={resetCode}
				onHint={handleHint}
				onShowSolution={showSolution}
				iframeRef={iframeRef}
				buttonVariant={buttonVariant}
				buttonDisabled={buttonDisabled}
				chatMessages={chatMessages}
				onSendMessage={handleSendMessage}
				isThinking={isThinking}
				streamingMessageId={streamingMessageId}
				relatedLessons={relatedLessons}
			/>
		</>
	);
}

function getFailureSummary(testResults: TestResult[]): string {
	const failedTests = testResults.filter((r) => !r.passed);
	if (failedTests.length === 0) return "";

	return `Failed ${failedTests.length} of ${
		testResults.length
	} tests. Errors: ${failedTests
		.map((t) => t.error || "Unknown error")
		.join(", ")}`;
}
