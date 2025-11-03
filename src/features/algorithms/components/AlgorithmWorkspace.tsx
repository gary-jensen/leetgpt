"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { WorkspaceLayout } from "./WorkspaceLayout";
import { TestResult } from "./TestResultsDisplay";
import { useAlgoProblemExecution } from "../hooks/useAlgoProblemExecution";
import {
	getHint,
	getChatResponse,
	getSubmissionResponse,
} from "@/lib/actions/algoCoach";
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
	const [currentSessionId, setCurrentSessionId] = useState<string>("");
	const [consecutiveFailures, setConsecutiveFailures] = useState(0);
	const [hasShownStuckMessage, setHasShownStuckMessage] = useState(false);
	const previousFailureCountRef = useRef(0);
	const chatMessagesRef = useRef<any[]>([]);
	const lastSubmissionRef = useRef<string>(""); // Track last submission to avoid duplicates
	const previousIsExecutingRef = useRef(false);
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
		setConsecutiveFailures(0); // Reset failure count on new session
		setHasShownStuckMessage(false); // Reset stuck message flag
	}, [problem.id]); // Re-initialize when problem changes

	// Create submission message when code execution completes
	useEffect(() => {
		// Only create submission message after execution completes (transition from executing to done)
		if (!isExecuting && previousIsExecutingRef.current) {
			// Create submission message if we have test results OR if execution just finished
			// This ensures errors are shown even if testResults is empty or errors occurred
			if (testResults.length > 0) {
				// Create a unique key for this submission based on test results signature
				// Include error messages in signature to detect different errors
				const testSignature = testResults
					.map((r) => `${r.case}-${r.passed}-${r.error || ""}`)
					.join(",");
				const submissionKey = testSignature;

				// Avoid duplicate submissions (only if different from last one)
				if (lastSubmissionRef.current !== submissionKey) {
					lastSubmissionRef.current = submissionKey;

					const testsPassed = testResults.filter(
						(r) => r.passed
					).length;
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

					const submissionMessage = {
						id: `submission-${Date.now()}`,
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
					handleSubmissionResponse(submissionMessage).catch(
						(error) => {
							console.error(
								"Error handling submission response:",
								error
							);
						}
					);
				}
			}
		}

		// Update previous execution state
		previousIsExecutingRef.current = isExecuting;
	}, [testResults, isExecuting]);

	// Track consecutive failures and trigger AI help message
	useEffect(() => {
		if (testResults.length > 0) {
			const allPassed = testResults.every((r) => r.passed);
			if (allPassed) {
				setConsecutiveFailures(0);
				setHasShownStuckMessage(false); // Reset when they pass
				previousFailureCountRef.current = 0;
			} else {
				const newFailureCount = previousFailureCountRef.current + 1;
				setConsecutiveFailures(newFailureCount);
				previousFailureCountRef.current = newFailureCount;

				// Show AI help message after 2-3 failures (only once per session)
				if (
					newFailureCount >= 2 &&
					newFailureCount <= 3 &&
					!hasShownStuckMessage
				) {
					setHasShownStuckMessage(true);

					// Build help message (short and sweet - lesson buttons will appear below automatically)
					const helpMessage = `I notice you've had some trouble with the test cases. Would you like some **help**?`;

					// Add AI assistant message to chat (update state immediately)
					const stuckMessage = {
						id: `stuck-${Date.now()}`,
						role: "assistant" as const,
						content: helpMessage,
						timestamp: new Date(),
					};

					// Update state immediately (no blocking)
					const updatedMessages = [...chatMessages, stuckMessage];
					setChatMessages(updatedMessages);
					chatMessagesRef.current = updatedMessages;

					// Persist to database asynchronously after state update (don't block UI)
					if (session?.user?.id && currentSessionId) {
						// Schedule database save for next tick to not block state update
						Promise.resolve().then(async () => {
							try {
								const savedProgress =
									progress.getAlgoProblemProgress?.(
										problem.id,
										"javascript"
									);
								const existingSessions =
									savedProgress?.chatHistory || [];

								const currentSession = {
									id: currentSessionId,
									createdAt: new Date(),
									// Use computed updatedMessages directly
									messages: updatedMessages,
								};

								// Update database asynchronously (fire and forget)
								updateAlgoProblemProgress(
									session.user.id,
									problem.id,
									"javascript",
									{
										chatHistory: [
											...existingSessions,
											currentSession,
										],
									}
								).catch((error) => {
									console.error(
										"Error saving stuck message:",
										error
									);
								});
							} catch (error) {
								console.error(
									"Error saving stuck message:",
									error
								);
							}
						});
					}
				}
			}
		}
	}, [
		testResults,
		hasShownStuckMessage,
		relatedLessons,
		session,
		currentSessionId,
		problem.id,
		progress,
	]);

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
		try {
			const hint = await getHint(
				problem,
				code,
				chatMessages,
				getFailureSummary(testResults)
			);

			const newMessage = {
				id: Date.now().toString(),
				role: "assistant" as const,
				content: hint.message,
				timestamp: new Date(),
			};

			setChatMessages((prev) => [...prev, newMessage]);

			if (hint.followUpQuestion) {
				setTimeout(() => {
					const followUp = {
						id: (Date.now() + 1).toString(),
						role: "assistant" as const,
						content: hint.followUpQuestion,
						timestamp: new Date(),
					};
					setChatMessages((prev) => [...prev, followUp]);
				}, 1000);
			}
		} catch (error) {
			console.error("Error getting hint:", error);
			if (error instanceof Error) {
				if (error.message.includes("Rate limit")) {
					toast.error(error.message);
				} else if (error.message.includes("Authentication required")) {
					toast.error("Please sign in to use AI hints");
				} else {
					toast.error("Failed to get hint. Please try again.");
				}
			} else {
				toast.error("An unexpected error occurred");
			}
		} finally {
			setIsThinking(false);
		}
	};

	const handleSubmissionResponse = async (submissionMessage: any) => {
		if (!session?.user?.id) return; // Skip if not authenticated

		setIsThinking(true);
		try {
			const aiResponse = await getSubmissionResponse(
				problem,
				submissionMessage.submissionData,
				code,
				chatMessagesRef.current.filter(
					(msg) =>
						msg.id !== "problem-statement" &&
						msg.id !== "examples-constraints"
				)
			);

			setChatMessages((prev) => {
				const updated = [...prev, aiResponse];
				chatMessagesRef.current = updated;
				return updated;
			});

			// Persist chat history to database
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
							...chatMessagesRef.current,
							submissionMessage,
							aiResponse,
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
			// Don't show error to user for auto-responses, just log it
		} finally {
			setIsThinking(false);
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

		try {
			// Call AI coach
			const aiResponse = await getChatResponse(
				problem.id,
				message,
				code,
				chatMessages,
				testResults
			);

			setChatMessages((prev) => [...prev, aiResponse]);

			// Persist chat history to database if authenticated
			// This will be saved to the current session on page unload
			// For now, we'll save immediately to ensure it persists
			if (session?.user?.id && currentSessionId) {
				try {
					// Get existing sessions from progress
					const savedProgress = progress.getAlgoProblemProgress?.(
						problem.id,
						"javascript"
					);
					const existingSessions = savedProgress?.chatHistory || [];

					// Create current session with all messages
					const currentSession = {
						id: currentSessionId,
						createdAt: new Date(),
						messages: [...chatMessages, userMessage, aiResponse],
					};

					// Append current session to existing sessions
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
