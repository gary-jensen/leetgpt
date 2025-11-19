"use client";

import { useProgress } from "@/contexts/ProgressContext";
import { updateAlgoProblemProgress } from "@/lib/actions/algoProgress";
import {
	trackAlgoChatError,
	trackAlgoChatMessageReceived,
	trackAlgoChatMessageSent,
	trackAlgoHintRequested,
	trackAlgoProblemCompleted,
	trackAlgoProblemStarted,
	trackAlgoProblemSwitched,
	trackAlgoProblemViewed,
} from "@/lib/analytics";
import {
	AlgoLesson,
	AlgoProblemDetail,
	AlgoProblemSubmission,
} from "@/types/algorithm-types";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAlgoProblemExecution } from "../hooks/useAlgoProblemExecution";
import { useProblemTimeTracking } from "../hooks/useProblemTimeTracking";
import { streamAlgoCoachMessage } from "../services/algoCoachStream";
import { TestResult } from "./TestResultsDisplay";
import { WorkspaceLayout } from "./WorkspaceLayout";

import { SubscriptionStatusValue } from "@/lib/actions/billing";
import { getSubscriptionStatusFromSession } from "@/lib/utils/subscription";
import { AlgoProblemMeta } from "@/types/algorithm-types";

interface AlgorithmWorkspaceProps {
	problem: AlgoProblemDetail;
	relatedLessons: AlgoLesson[];
	subscriptionStatus?: {
		subscriptionStatus: SubscriptionStatusValue;
		stripePriceId: string | null;
		stripeCurrentPeriodEnd: Date | null;
		planTier: "PRO" | "EXPERT" | null;
		isYearly: boolean;
		trialDaysRemaining: number | null;
	} | null;
	problemsMeta: AlgoProblemMeta[];
}

export function AlgorithmWorkspace({
	problem,
	relatedLessons,
	problemsMeta,
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
	console.time("session");
	const { data: session } = useSession();
	console.timeEnd("session");
	const progress = useProgress();

	// Get subscription status from session (synchronous, no database calls)
	const initialSubscriptionStatus = getSubscriptionStatusFromSession(session);

	// Determine subscription status from props
	const isSubscriptionExpired =
		initialSubscriptionStatus?.subscriptionStatus === "expired";
	const isBasicUser = session?.user?.role === "BASIC";
	const isSubscriptionCanceled =
		!initialSubscriptionStatus ||
		initialSubscriptionStatus.subscriptionStatus === null ||
		initialSubscriptionStatus.subscriptionStatus === "expired" ||
		isBasicUser;
	const addSubmissionHandlerRef = useRef<
		((submission: AlgoProblemSubmission) => void) | null
	>(null);
	const problemStartedRef = useRef(false);
	const previousProblemIdRef = useRef<string | null>(null);
	const problemViewTimeRef = useRef<number | null>(null);
	const problemCompletedTrackedRef = useRef(false);
	const submissionCountRef = useRef(0);
	const firstSubmissionTimeRef = useRef<number | null>(null);

	// Keep ref in sync with state
	useEffect(() => {
		chatMessagesRef.current = chatMessages;
	}, [chatMessages]);

	const {
		code,
		setCode,
		testResults,
		isExecuting,
		executionType,
		iframeRef,
		executeCode,
		runTestsOnly,
		resetCode,
		showSolution,
		buttonVariant,
		buttonDisabled,
		allTestsPassed,
		isTestOnlyRunRef,
	} = useAlgoProblemExecution(problem, (submission) => {
		// Call the handler registered by ProblemStatementChat
		if (addSubmissionHandlerRef.current) {
			addSubmissionHandlerRef.current(submission);
		}
	});

	// Create new chat session on mount
	useEffect(() => {
		const sessionId = `session_${Date.now()}_${Math.random()
			.toString(36)
			.substring(7)}`;
		setCurrentSessionId(sessionId);

		// Reset chat messages when problem changes (only actual chat, not problem statement)
		setChatMessages([]);
	}, [problem.id]); // Re-initialize when problem changes

	// Create submission message when code execution completes
	useEffect(() => {
		// Only create submission message after execution completes (transition from executing to done)
		if (!isExecuting && previousIsExecutingRef.current) {
			// Skip creating chat message if this was a test-only run
			if (isTestOnlyRunRef?.current) {
				// Reset the flag after checking
				isTestOnlyRunRef.current = false;
				previousIsExecutingRef.current = isExecuting;
				return;
			}

			// Create submission message if we have test results OR if execution just finished
			// This ensures errors are shown even if testResults is empty or errors occurred
			if (testResults.length > 0) {
				const testsPassed = testResults.filter((r) => r.passed).length;
				const allPassed = testsPassed === testResults.length;
				const totalRuntime = testResults.reduce(
					(sum, r) => sum + (r.runtime || 0),
					0
				);

				// Track submission count
				submissionCountRef.current += 1;
				if (!firstSubmissionTimeRef.current) {
					firstSubmissionTimeRef.current = Date.now();
				}

				// Track problem completion (first time all tests pass)
				if (
					allPassed &&
					!problemCompletedTrackedRef.current &&
					problemViewTimeRef.current
				) {
					problemCompletedTrackedRef.current = true;
					const totalTime = Date.now() - problemViewTimeRef.current;
					const firstSubmissionTime = firstSubmissionTimeRef.current
						? Date.now() - firstSubmissionTimeRef.current
						: undefined;
					trackAlgoProblemCompleted(
						problem.id,
						problem.title,
						problem.difficulty,
						submissionCountRef.current,
						totalTime,
						submissionCountRef.current,
						firstSubmissionTime
					);
				}

				// Debug: log test results to verify errors are present
				const hasErrors = testResults.some((r) => r.error);
				if (hasErrors) {
					// console.log(
					// 	"Creating submission message with errors:",
					// 	testResults
					// );
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
					// console.error("Error handling submission response:", error);
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

	// Track problem viewed and switched
	useEffect(() => {
		const isFirstView = previousProblemIdRef.current === null;
		const isProblemSwitch =
			previousProblemIdRef.current !== null &&
			previousProblemIdRef.current !== problem.id;

		// Track problem switch
		if (isProblemSwitch && previousProblemIdRef.current) {
			// Time spent calculation would need to be tracked separately
			trackAlgoProblemSwitched(previousProblemIdRef.current, problem.id);
		}

		// Track problem viewed
		trackAlgoProblemViewed(
			problem.id,
			problem.title,
			problem.difficulty,
			problem.topics,
			isFirstView
		);

		// Reset tracking state for new problem
		problemStartedRef.current = false;
		problemViewTimeRef.current = Date.now();
		previousProblemIdRef.current = problem.id;
		problemCompletedTrackedRef.current = false;
		submissionCountRef.current = 0;
		firstSubmissionTimeRef.current = null;
	}, [problem.id, problem.title, problem.difficulty, problem.topics]);

	// Track problem started (first interaction)
	const trackProblemStarted = () => {
		if (!problemStartedRef.current) {
			problemStartedRef.current = true;
			const timeSinceView = problemViewTimeRef.current
				? Date.now() - problemViewTimeRef.current
				: undefined;
			trackAlgoProblemStarted(
				problem.id,
				problem.title,
				problem.difficulty,
				timeSinceView
			);
		}
	};

	// Use time tracking hook
	const { activeTime, totalTime, endSession } = useProblemTimeTracking({
		problemId: problem.id,
		isActive: true,
		completionStatus: allTestsPassed
			? "completed"
			: testResults.length > 0
			? "in_progress"
			: "not_started",
		submissionCount: chatMessages.filter((msg) => msg.type === "submission")
			.length,
	});

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ctrl/Cmd + Enter: Run code
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				if (
					!buttonDisabled &&
					!isExecuting &&
					!isBasicUser &&
					!isSubscriptionExpired &&
					!isSubscriptionCanceled
				) {
					executeCode();
				} else if (
					isBasicUser ||
					isSubscriptionExpired ||
					isSubscriptionCanceled
				) {
					const message = isSubscriptionExpired
						? "Your free trial has expired. Please upgrade to Pro to submit code."
						: "Access denied. Please upgrade to Pro.";
					toast.error(message);
				}
			}

			// Ctrl/Cmd + H: Request hint
			if ((e.ctrlKey || e.metaKey) && e.key === "h") {
				e.preventDefault();
				if (
					!isBasicUser &&
					!isSubscriptionExpired &&
					!isSubscriptionCanceled
				) {
					handleHint();
				} else {
					const message = isSubscriptionExpired
						? "Your free trial has expired. Please upgrade to Pro to use hints."
						: "Access denied. Please upgrade to Pro.";
					toast.error(message);
				}
			}

			// Escape: Reset code (optional)
			if (e.key === "Escape") {
				// Could add reset confirmation modal later
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		executeCode,
		buttonDisabled,
		isExecuting,
		isSubscriptionExpired,
		isSubscriptionCanceled,
	]);

	const handleHint = async () => {
		if (isBasicUser || isSubscriptionExpired || isSubscriptionCanceled) {
			const message = isSubscriptionExpired
				? "Your free trial has expired. Please upgrade to Pro to use hints."
				: "Access denied. Please upgrade to Pro.";
			toast.error(message);
			return;
		}

		trackProblemStarted(); // Track if this is first interaction
		const timeSinceStart = problemViewTimeRef.current
			? Date.now() - problemViewTimeRef.current
			: undefined;
		const hasSubmissions =
			chatMessages.filter((msg) => msg.type === "submission").length > 0;
		trackAlgoHintRequested(
			problem.id,
			problem.title,
			undefined, // hintNumber - could be enhanced later
			timeSinceStart,
			hasSubmissions
		);
		setIsThinking(true);

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
					// console.error("Error streaming hint:", error);
					setStreamingMessageId(null);
					setIsThinking(false);

					let errorContent =
						"Sorry, I encountered an error. Please try again.";
					if (error instanceof Error) {
						if (error.message.includes("Rate limit")) {
							errorContent = error.message;
							toast.error(error.message);
						} else if (
							error.message.includes("Authentication required")
						) {
							errorContent = "Please sign in to use AI hints";
							toast.error("Please sign in to use AI hints");
						} else {
							toast.error(
								"Failed to get hint. Please try again."
							);
						}
					}

					setChatMessages((prev) =>
						prev.map((msg) =>
							msg.id === hintMessageId
								? {
										...msg,
										content: errorContent,
								  }
								: msg
						)
					);
				}
			);
		} catch (error) {
			// console.error("Error getting hint:", error);
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

	// Hardcoded failure messages (5 different responses)
	const FAILURE_MESSAGES = [
		"Not quite there yet! Keep trying - you're making progress. Ask me a question if you would like some help!",
		"Some tests are still failing, but don't give up! Review your logic and try again. Ask me a question if you would like some help!",
		"You're on the right track! Take another look at the failing test cases. Ask me a question if you would like some help!",
		"Almost there! Check your code for any edge cases you might have missed. Ask me a question if you would like some help!",
		"Keep going! Debugging is part of the learning process. Ask me a question if you would like some help!",
	];

	const handleSubmissionResponse = async (submissionMessage: any) => {
		if (!session?.user?.id) return; // Skip if not authenticated

		const submissionData = submissionMessage.submissionData;
		const allPassed = submissionData?.allPassed ?? false;

		// For failing submissions, use hardcoded response (no API call, no rate limit)
		if (!allPassed) {
			// Show thinking animation for 500ms to make it look like AI
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

			// Wait 500ms before showing the hardcoded message
			await new Promise((resolve) => setTimeout(resolve, 500));

			const randomMessage =
				FAILURE_MESSAGES[
					Math.floor(Math.random() * FAILURE_MESSAGES.length)
				];

			setIsThinking(false);
			// Keep streamingMessageId set to enable streaming animation

			// Stream the message word by word to simulate AI typing
			const words = randomMessage.split(" ");
			let streamedContent = "";
			for (let i = 0; i < words.length; i++) {
				streamedContent += (i > 0 ? " " : "") + words[i];
				setChatMessages((prev) =>
					prev.map((msg) =>
						msg.id === submissionMessageId
							? { ...msg, content: streamedContent }
							: msg
					)
				);
				// Delay between words (adjust for typing speed)
				await new Promise((resolve) => setTimeout(resolve, 20));
			}

			// Clear streaming state after message is complete
			setStreamingMessageId(null);

			// Persist chat history to database
			if (currentSessionId) {
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
							submissionMessage,
							{ ...submissionAiMessage, content: randomMessage },
						],
					};

					const updatedChatHistory = [
						...existingSessions,
						currentSession,
					];

					// Optimistically update local state immediately
					progress.updateAlgoProblemProgressLocal?.(
						problem.id,
						"javascript",
						{
							chatHistory: updatedChatHistory,
						}
					);

					try {
						await updateAlgoProblemProgress(
							session.user.id,
							problem.id,
							"javascript",
							{
								chatHistory: updatedChatHistory,
							}
						);
					} catch (error) {
						// Revert optimistic update on error
						progress.updateAlgoProblemProgressLocal?.(
							problem.id,
							"javascript",
							{
								chatHistory: existingSessions,
							}
						);
					}
				} catch (error) {
					// Silently fail - non-critical
				}
			}

			return; // Early return for failing submissions
		}

		// For successful submissions, use AI (rate limited)
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
			// Stream submission response (only for successful submissions)
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
					// console.error(
					// 	"Error streaming submission response:",
					// 	error
					// );
					setStreamingMessageId(null);
					setIsThinking(false);

					// For rate limit errors, show message in chat; otherwise silent failure for auto-responses
					if (
						error instanceof Error &&
						error.message.includes("Rate limit")
					) {
						setChatMessages((prev) =>
							prev.map((msg) =>
								msg.id === submissionMessageId
									? {
											...msg,
											content: error.message,
									  }
									: msg
							)
						);
						toast.error(error.message);
					} else {
						// Remove empty message on error - silent failure for auto-responses
						setChatMessages((prev) =>
							prev.filter((msg) => msg.id !== submissionMessageId)
						);
					}
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

					const updatedChatHistory = [
						...existingSessions,
						currentSession,
					];

					// Optimistically update local state immediately
					progress.updateAlgoProblemProgressLocal?.(
						problem.id,
						"javascript",
						{
							chatHistory: updatedChatHistory,
						}
					);

					try {
						await updateAlgoProblemProgress(
							session.user.id,
							problem.id,
							"javascript",
							{
								chatHistory: updatedChatHistory,
							}
						);
					} catch (error) {
						// console.error(
						// 	"Error saving submission response:",
						// 	error
						// );
						// Revert optimistic update on error
						progress.updateAlgoProblemProgressLocal?.(
							problem.id,
							"javascript",
							{
								chatHistory: existingSessions,
							}
						);
					}
				} catch (error) {
					// console.error("Error saving submission response:", error);
				}
			}
		} catch (error) {
			// console.error("Error getting submission response:", error);
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

		if (isBasicUser || isSubscriptionExpired || isSubscriptionCanceled) {
			const errorMessage = isSubscriptionExpired
				? "Your free trial has expired. Please upgrade to Pro to use chat."
				: "Access denied. Please upgrade to Pro.";
			toast.error(errorMessage);
			return;
		}

		trackProblemStarted(); // Track if this is first interaction

		const userMessage = {
			id: Date.now().toString(),
			role: "user" as const,
			content: message,
			timestamp: new Date(),
		};

		// Track message sent
		const userMessages = chatMessages.filter((msg) => msg.role === "user");
		const isFirstMessage = userMessages.length === 0;
		const timeSinceStart = problemViewTimeRef.current
			? Date.now() - problemViewTimeRef.current
			: undefined;
		trackAlgoChatMessageSent(
			problem.id,
			message.length,
			undefined, // messageType - could be enhanced later
			isFirstMessage,
			timeSinceStart
		);

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
		const responseStartTime = Date.now();

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
						// Track message received
						const responseTime = Date.now() - responseStartTime;
						trackAlgoChatMessageReceived(
							problem.id,
							responseTime,
							fullContent.length
						);
					}
				},
				(error) => {
					// console.error("Error streaming AI response:", error);
					setStreamingMessageId(null);
					setIsThinking(false);
					// Track chat error
					const errorMessage =
						error instanceof Error
							? error.message
							: "Unknown error";
					trackAlgoChatError(
						problem.id,
						"stream_error",
						errorMessage
					);

					// Determine error content
					let errorContent =
						"Sorry, I encountered an error. Please try again.";
					if (error instanceof Error) {
						if (error.message.includes("Rate limit")) {
							errorContent = error.message;
							toast.error(error.message);
						} else if (
							error.message.includes("Authentication required")
						) {
							errorContent = "Please sign in to use AI chat";
							toast.error("Please sign in to use AI chat");
						}
					}

					// Update message with error
					setChatMessages((prev) =>
						prev.map((msg) =>
							msg.id === aiMessageId
								? {
										...msg,
										content: errorContent,
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

					const updatedChatHistory = [
						...existingSessions,
						currentSession,
					];

					// Optimistically update local state immediately
					progress.updateAlgoProblemProgressLocal?.(
						problem.id,
						"javascript",
						{
							chatHistory: updatedChatHistory,
						}
					);

					try {
						await updateAlgoProblemProgress(
							session.user.id,
							problem.id,
							"javascript",
							{
								chatHistory: updatedChatHistory,
							}
						);
					} catch (error) {
						// console.error("Error saving chat history:", error);
						// Revert optimistic update on error
						progress.updateAlgoProblemProgressLocal?.(
							problem.id,
							"javascript",
							{
								chatHistory: existingSessions,
							}
						);
					}
				} catch (error) {
					// console.error("Error saving chat history:", error);
				}
			}
		} catch (error) {
			// console.error("Error getting AI response:", error);
			setStreamingMessageId(null);
			setIsThinking(false);

			let errorContent = "Failed to get AI response. Please try again.";
			let errorType = "unknown";
			if (error instanceof Error) {
				if (
					error.message.includes("trial has expired") ||
					error.message.includes("expired")
				) {
					errorContent =
						"Your free trial has expired. Please upgrade to Pro to use chat.";
					errorType = "trial_expired";
					toast.error(errorContent);
				} else if (error.message.includes("Rate limit")) {
					errorContent = error.message;
					errorType = "rate_limit";
					toast.error(error.message);
				} else if (error.message.includes("Authentication required")) {
					errorContent = "Please sign in to use AI chat";
					errorType = "auth_required";
					toast.error("Please sign in to use AI chat");
				} else {
					errorType = "api_error";
					toast.error("Failed to get AI response. Please try again.");
				}
			}
			// Track chat error
			trackAlgoChatError(problem.id, errorType, errorContent);

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
				executionType={executionType}
				onRun={runTestsOnly}
				onSubmit={executeCode}
				onReset={resetCode}
				onHint={handleHint}
				onShowSolution={showSolution}
				iframeRef={iframeRef}
				buttonVariant={buttonVariant}
				buttonDisabled={
					buttonDisabled ||
					isBasicUser ||
					isSubscriptionExpired ||
					isSubscriptionCanceled
				}
				chatMessages={chatMessages}
				onSendMessage={handleSendMessage}
				isThinking={isThinking}
				streamingMessageId={streamingMessageId}
				relatedLessons={relatedLessons}
				onNewSubmission={(handler) => {
					addSubmissionHandlerRef.current = handler;
				}}
				problemsMeta={problemsMeta}
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
