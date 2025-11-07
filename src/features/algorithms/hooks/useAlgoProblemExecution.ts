"use client";

import { useState, useRef, useCallback } from "react";
import useConsole from "@/hooks/workspace/useConsole";
import { TestResult } from "../components/TestResultsDisplay";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { executeAlgoTests } from "@/lib/execution/algoTestExecutor";
import { useSession } from "next-auth/react";
import { useProgress } from "@/contexts/ProgressContext";
import {
	createSubmission,
	markProblemCompleted,
	updateAlgoProblemProgress,
} from "@/lib/actions/algoProgress";
import { trackAlgoProblemRun } from "@/lib/analytics";

export function useAlgoProblemExecution(problem: AlgoProblemDetail | null) {
	const [testResults, setTestResults] = useState<TestResult[]>([]);
	const [isExecuting, setIsExecuting] = useState(false);
	const [code, setCode] = useState(problem?.startingCode?.javascript || "");
	const { data: session } = useSession();
	const progress = useProgress();

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

	const executeCode = useCallback(async () => {
		if (!problem || !code.trim()) {
			setTestResults([]);
			return;
		}

		setIsExecuting(true);
		setTestResults([]);

		try {
			// Execute tests using the new algorithm test executor
			const result = await executeAlgoTests(problem, code, "javascript");

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

				// Create submission if user is authenticated
				if (session?.user?.id && problem) {
					try {
						const passed = formattedResults.every((r) => r.passed);
						const testsPassed = formattedResults.filter(
							(r) => r.passed
						).length;

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

						await createSubmission(
							session.user.id,
							problem.id,
							"javascript",
							code,
							passed,
							result.runMs,
							testsPassed,
							problem.tests.length
						);
						// Track run event
						trackAlgoProblemRun(
							problem.id,
							problem.title,
							testsPassed,
							problem.tests.length,
							result.runMs || 0
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
	}, [code, problem, session?.user?.id]);

	const resetCode = useCallback(() => {
		if (!problem) return;
		setCode(problem.startingCode.javascript || "");
		setTestResults([]);
	}, [problem]);

	const showSolution = useCallback(() => {
		if (!problem) return;
		setCode(problem.passingCode.javascript || "");
		setTestResults([]);
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
		iframeRef,
		executeCode,
		resetCode,
		showSolution,
		buttonVariant,
		buttonDisabled: isExecuting || !code.trim(),
		allTestsPassed,
	};
}
