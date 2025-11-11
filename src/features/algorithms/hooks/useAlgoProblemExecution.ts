"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import useConsole from "@/hooks/workspace/useConsole";
import { TestResult } from "../components/TestResultsDisplay";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { executeAlgoTests } from "@/lib/execution/algoTestExecutor";
import { CodeExecutor } from "@/lib/execution/codeExecutor";
import { useSession } from "next-auth/react";
import { useProgress } from "@/contexts/ProgressContext";
import {
	createSubmission,
	markProblemCompleted,
	updateAlgoProblemProgress,
} from "@/lib/actions/algoProgress";
import {
	trackAlgoProblemRun,
	trackAlgoCodeReset,
	trackAlgoSolutionViewed,
} from "@/lib/analytics";
import { AlgoProblemSubmission } from "@/types/algorithm-types";
import { playSuccessSound, playErrorSound } from "@/lib/soundManager";
import { toast } from "sonner";

export function useAlgoProblemExecution(
	problem: AlgoProblemDetail | null,
	onSubmissionCreated?: (submission: AlgoProblemSubmission) => void
) {
	const [testResults, setTestResults] = useState<TestResult[]>([]);
	const [isExecuting, setIsExecuting] = useState(false);
	const [executionType, setExecutionType] = useState<"run" | "submit" | null>(
		null
	);
	const [code, setCode] = useState(problem?.startingCode?.javascript || "");
	const { data: session } = useSession();
	const progress = useProgress();
	const runCountRef = useRef(0);
	const problemStartTimeRef = useRef<number | null>(null);
	const initialCodeRef = useRef<string>("");
	const lastExecutionTimeRef = useRef<number | null>(null);
	const isTestOnlyRunRef = useRef(false);

	// Initialize problem start time and initial code
	useEffect(() => {
		if (problem) {
			problemStartTimeRef.current = Date.now();
			initialCodeRef.current = problem.startingCode.javascript || "";
			runCountRef.current = 0;
			lastExecutionTimeRef.current = null; // Reset execution time when problem changes
		}
	}, [problem]);

	// Mock lesson for useConsole compatibility
	const mockLesson = problem
		? {
				id: problem.id,
				title: problem.title,
				skillNodeId: problem.id,
				xpReward: 100,
				stepXpReward: 50,
				steps: [
					{
						id: "step-1",
						content: problem.statementMd,
						startingCode: problem.startingCode.javascript || "",
						tests: problem.tests.map((test, index) => ({
							id: `test-${index}`,
							type: "function" as const,
							functionName: "solution", // We'll extract this from the code
							testCases: [
								{
									input: test.input,
									output: test.output,
								},
							],
						})),
					},
				],
		  }
		: {
				id: "",
				title: "",
				skillNodeId: "",
				xpReward: 0,
				stepXpReward: 0,
				steps: [],
		  };

	const handleTestResults = useCallback(
		(results: any[]) => {
			if (!problem) return;

			const formattedResults: TestResult[] = results.map(
				(result, index) => ({
					case: index + 1,
					passed: result.passed,
					input: problem.tests[index]?.input || [],
					expected: problem.tests[index]?.output,
					actual: result.actualLogs
						? result.actualLogs.join("\n")
						: undefined,
					error: result.error,
					runtime: result.runtime, // Include runtime for each test case
				})
			);

			setTestResults(formattedResults);
		},
		[problem]
	);

	const addSystemMessage = useCallback(
		(content: string, messageType?: "error" | "success" | "info") => {
			// This would be used for AI feedback in the real implementation
			// console.log("System message:", content, messageType);
		},
		[]
	);

	const {
		iframeRef,
		handleTest,
		isExecuting: consoleExecuting,
	} = useConsole(
		code,
		mockLesson,
		0, // currentStepIndex
		handleTestResults,
		0, // attemptsCount
		() => {}, // setAttemptsCount
		addSystemMessage
	);

	// Create CodeExecutor instance for algorithm test execution
	const codeExecutorRef = useRef<CodeExecutor | null>(null);

	// Initialize CodeExecutor when iframe becomes available
	useEffect(() => {
		const checkAndInit = () => {
			if (iframeRef.current && !codeExecutorRef.current) {
				codeExecutorRef.current = new CodeExecutor();
				codeExecutorRef.current.setIframe(iframeRef.current);
			} else if (iframeRef.current && codeExecutorRef.current) {
				// Update iframe reference if it changed
				codeExecutorRef.current.setIframe(iframeRef.current);
			}
		};

		// Check immediately
		checkAndInit();

		// Also check periodically in case iframe mounts later
		const interval = setInterval(checkAndInit, 100);

		// Clean up after a reasonable time (5 seconds should be enough)
		const timeout = setTimeout(() => {
			clearInterval(interval);
		}, 5000);

		return () => {
			clearInterval(interval);
			clearTimeout(timeout);
			// Cleanup on unmount
			if (codeExecutorRef.current) {
				codeExecutorRef.current.cleanup();
				codeExecutorRef.current = null;
			}
		};
	}, []);

	const executeCode = useCallback(async () => {
		if (!problem || !code.trim()) {
			setTestResults([]);
			return;
		}

		// Require authentication to execute code
		if (!session?.user?.id) {
			toast.error("You must be logged in to run code");
			return;
		}

		// Check rate limit for BASIC users (8 seconds between runs)
		const userRole = session?.user?.role || "BASIC";
		if (userRole === "BASIC" && lastExecutionTimeRef.current !== null) {
			const timeSinceLastRun = Date.now() - lastExecutionTimeRef.current;
			const MIN_RUN_INTERVAL_MS = 8 * 1000; // 8 seconds

			if (timeSinceLastRun < MIN_RUN_INTERVAL_MS) {
				const secondsRemaining = Math.ceil(
					(MIN_RUN_INTERVAL_MS - timeSinceLastRun) / 1000
				);
				toast.error(
					`You are submitting too frequently. Please wait ${secondsRemaining} second${
						secondsRemaining !== 1 ? "s" : ""
					} before running again. Upgrade to Pro to remove this limit.`
				);
				return;
			}
		}

		// Ensure CodeExecutor is initialized with iframe
		if (!codeExecutorRef.current) {
			if (iframeRef.current) {
				codeExecutorRef.current = new CodeExecutor();
				codeExecutorRef.current.setIframe(iframeRef.current);
			} else {
				// Iframe not available, show error
				setTestResults([
					{
						case: 1,
						passed: false,
						input: problem.tests[0]?.input || [],
						expected: problem.tests[0]?.output,
						error: "Code executor not ready. Please wait a moment and try again.",
					},
				]);
				return;
			}
		} else if (iframeRef.current) {
			// Ensure iframe is set (in case it changed)
			codeExecutorRef.current.setIframe(iframeRef.current);
		}

		if (!codeExecutorRef.current) {
			setTestResults([
				{
					case: 1,
					passed: false,
					input: problem.tests[0]?.input || [],
					expected: problem.tests[0]?.output,
					error: "Code executor not ready. Please wait a moment and try again.",
				},
			]);
			return;
		}

		setIsExecuting(true);
		setTestResults([]);
		setExecutionType("submit");
		isTestOnlyRunRef.current = false; // Mark as full submission

		// Update last execution time
		lastExecutionTimeRef.current = Date.now();

		try {
			// Execute tests using the new algorithm test executor
			const result = await executeAlgoTests(
				problem,
				code,
				"javascript",
				10000,
				codeExecutorRef.current
			);

			if (result.status === "error") {
				setTestResults([
					{
						case: 1,
						passed: false,
						input: problem.tests[0]?.input || [],
						expected: problem.tests[0]?.output,
						error: result.message || "Unknown error",
					},
				]);
			} else {
				// Format results for our component
				const formattedResults: TestResult[] = result.results.map(
					(testResult) => ({
						case: testResult.case,
						passed: testResult.passed,
						input: testResult.input,
						expected: testResult.expected,
						actual: testResult.actual,
						error: testResult.error,
						runtime: testResult.runtime, // Include runtime from test results
					})
				);

				setTestResults(formattedResults);

				// Determine if all tests passed
				const passed = formattedResults.every((r) => r.passed);
				const testsPassed = formattedResults.filter(
					(r) => r.passed
				).length;

				// Play sound effects based on test results
				if (formattedResults.length > 0) {
					if (passed) {
						playSuccessSound();
					} else {
						playErrorSound();
					}
				}

				// Create submission if user is authenticated
				if (session?.user?.id && problem) {
					try {
						// Mark as completed on first successful run
						if (passed && session?.user?.id) {
							// Optimistically update local state immediately
							progress.updateAlgoProblemProgressLocal?.(
								problem.id,
								"javascript",
								{
									status: "completed",
									completedAt: new Date(),
								}
							);

							try {
								await markProblemCompleted(
									session.user.id,
									problem.id,
									"javascript"
								);
							} catch (error) {
								// console.error(
								// 	"Error marking problem completed:",
								// 	error
								// );
								// Revert optimistic update on error
								progress.updateAlgoProblemProgressLocal?.(
									problem.id,
									"javascript",
									{
										status: "in_progress",
										completedAt: undefined,
									}
								);
							}
						}

						const submission = await createSubmission(
							session.user.id,
							problem.id,
							"javascript",
							code,
							passed,
							result.runMs,
							testsPassed,
							problem.tests.length
						);
						// Notify parent about new submission
						if (onSubmissionCreated) {
							onSubmissionCreated(submission);
						}
						// Track run event with enhanced metadata
						runCountRef.current += 1;
						const timeSinceStart = problemStartTimeRef.current
							? Date.now() - problemStartTimeRef.current
							: undefined;
						trackAlgoProblemRun(
							problem.id,
							problem.title,
							testsPassed,
							problem.tests.length,
							result.runMs || 0,
							code.length,
							runCountRef.current,
							timeSinceStart,
							runCountRef.current === 1
						);
					} catch (error) {
						// console.error("Error creating submission:", error);
						// Don't throw, submission creation failure shouldn't block the UI
					}
				}
			}
		} catch (error) {
			// console.error("Execution error:", error);
			setTestResults([
				{
					case: 1,
					passed: false,
					input: problem.tests[0]?.input || [],
					expected: problem.tests[0]?.output,
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
				},
			]);
		} finally {
			setIsExecuting(false);
		}
	}, [code, problem, session?.user?.id, progress, onSubmissionCreated]);

	const resetCode = useCallback(() => {
		if (!problem) return;
		const hadModifications = code !== initialCodeRef.current;
		const timeSinceStart = problemStartTimeRef.current
			? Date.now() - problemStartTimeRef.current
			: undefined;
		setCode(problem.startingCode.javascript || "");
		setTestResults([]);
		setExecutionType(null);
		trackAlgoCodeReset(problem.id, timeSinceStart, hadModifications);
	}, [problem, code]);

	const runTestsOnly = useCallback(async () => {
		if (!problem || !code.trim()) {
			setTestResults([]);
			return;
		}

		// Require authentication to execute code
		if (!session?.user?.id) {
			toast.error("You must be logged in to run code");
			return;
		}

		// Ensure CodeExecutor is initialized with iframe
		if (!codeExecutorRef.current) {
			if (iframeRef.current) {
				codeExecutorRef.current = new CodeExecutor();
				codeExecutorRef.current.setIframe(iframeRef.current);
			} else {
				// Iframe not available, show error
				setTestResults([
					{
						case: 1,
						passed: false,
						input: problem.tests[0]?.input || [],
						expected: problem.tests[0]?.output,
						error: "Code executor not ready. Please wait a moment and try again.",
					},
				]);
				return;
			}
		} else if (iframeRef.current) {
			// Ensure iframe is set (in case it changed)
			codeExecutorRef.current.setIframe(iframeRef.current);
		}

		if (!codeExecutorRef.current) {
			setTestResults([
				{
					case: 1,
					passed: false,
					input: problem.tests[0]?.input || [],
					expected: problem.tests[0]?.output,
					error: "Code executor not ready. Please wait a moment and try again.",
				},
			]);
			return;
		}

		setIsExecuting(true);
		setTestResults([]);
		setExecutionType("run");
		isTestOnlyRunRef.current = true; // Mark as test-only run

		try {
			// Execute only first 5 test cases
			const result = await executeAlgoTests(
				problem,
				code,
				"javascript",
				10000,
				codeExecutorRef.current,
				5 // maxTests: 5
			);

			if (result.status === "error") {
				setTestResults([
					{
						case: 1,
						passed: false,
						input: problem.tests[0]?.input || [],
						expected: problem.tests[0]?.output,
						error: result.message || "Unknown error",
					},
				]);
			} else {
				// Format results for our component
				const formattedResults: TestResult[] = result.results.map(
					(testResult) => ({
						case: testResult.case,
						passed: testResult.passed,
						input: testResult.input,
						expected: testResult.expected,
						actual: testResult.actual,
						error: testResult.error,
						runtime: testResult.runtime,
					})
				);

				setTestResults(formattedResults);

				// Play sound effects based on test results
				if (formattedResults.length > 0) {
					const passed = formattedResults.every((r) => r.passed);
					if (passed) {
						playSuccessSound();
					} else {
						playErrorSound();
					}
				}
			}
		} catch (error) {
			setTestResults([
				{
					case: 1,
					passed: false,
					input: problem.tests[0]?.input || [],
					expected: problem.tests[0]?.output,
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
				},
			]);
		} finally {
			setIsExecuting(false);
		}
	}, [code, problem, session?.user?.id]);

	const showSolution = useCallback(() => {
		if (!problem) return;
		const timeSinceStart = problemStartTimeRef.current
			? Date.now() - problemStartTimeRef.current
			: undefined;
		const hadSubmissions = runCountRef.current > 0;
		setCode(problem.passingCode.javascript || "");
		setTestResults([]);
		trackAlgoSolutionViewed(
			problem.id,
			problem.title,
			runCountRef.current,
			timeSinceStart,
			hadSubmissions
		);
	}, [problem]);

	const allTestsPassed =
		testResults.length > 0 && testResults.every((r) => r.passed);
	const buttonVariant: "correct" | "wrong" | "run" = allTestsPassed
		? "correct"
		: isExecuting
		? "wrong"
		: "run";

	return {
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
		buttonDisabled: isExecuting || !code.trim(),
		allTestsPassed,
		isTestOnlyRunRef,
	};
}
