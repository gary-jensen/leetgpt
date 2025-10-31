"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { WorkspaceLayout } from "./WorkspaceLayout";
import { TestResult } from "./TestResultsDisplay";
import { useAlgoProblemExecution } from "../hooks/useAlgoProblemExecution";
import { getHint, getChatResponse } from "@/lib/actions/algoCoach";
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
	console.log(
		"🔍 AlgorithmWorkspace - problem.statementHtml:",
		problem.statementHtml
			? `✅ EXISTS (${problem.statementHtml.length} chars)`
			: "❌ NULL"
	);
	console.log("🔍 AlgorithmWorkspace - problem.id:", problem.id);
	console.log("🔍 AlgorithmWorkspace - problem.slug:", problem.slug);

	const [chatMessages, setChatMessages] = useState<any[]>([]);
	const [isThinking, setIsThinking] = useState(false);
	const [currentSessionId, setCurrentSessionId] = useState<string>("");
	const [consecutiveFailures, setConsecutiveFailures] = useState(0);
	const [hasShownStuckMessage, setHasShownStuckMessage] = useState(false);
	const previousFailureCountRef = useRef(0);
	const { data: session } = useSession();
	const progress = useProgress();

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

	// Create new chat session on mount
	useEffect(() => {
		const sessionId = `session_${Date.now()}_${Math.random()
			.toString(36)
			.substring(7)}`;
		setCurrentSessionId(sessionId);
		setChatMessages([]); // Start with fresh chat
		setConsecutiveFailures(0); // Reset failure count on new session
		setHasShownStuckMessage(false); // Reset stuck message flag
	}, []); // Only run once on mount

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

					// Build help message based on related lessons (formatted with markdown)
					let helpMessage = "";
					if (relatedLessons.length > 0) {
						const lessonList = relatedLessons
							.slice(0, 3)
							.map((l) => `• **${l.title}**`)
							.join("\n");
						helpMessage = `I notice you've had some trouble with the test cases. Here are some **related lessons** that might help:\n\n${lessonList}\n\n💡 You can review these lessons using the **"Review Lessons"** button in the problem statement panel, or ask me any questions!`;
					} else {
						helpMessage = `I notice you've had some trouble with the test cases. Would you like some **help**?\n\nI can provide hints or explain concepts that might be useful. Just ask me anything! 💭`;
					}

					// Add AI assistant message to chat
					const stuckMessage = {
						id: `stuck-${Date.now()}`,
						role: "assistant" as const,
						content: helpMessage,
						timestamp: new Date(),
					};

					setChatMessages((prev) => {
						const updated = [...prev, stuckMessage];

						// Persist to database if authenticated
						if (session?.user?.id && currentSessionId) {
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
									messages: updated,
								};

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
						}

						return updated;
					});
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
				problem.id,
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
