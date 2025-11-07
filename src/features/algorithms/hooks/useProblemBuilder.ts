"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
	BuilderState,
	BuilderPhase,
	getPhaseDescription,
	validateCodeUniqueness,
	getBackoffDelay,
} from "@/lib/utils/problemBuilderUtils";
// Using API routes instead of server actions for concurrent execution
// import {
// 	generateProblemData,
// 	generateTestCaseGeneratorFunction,
// } from "@/lib/actions/adminProblemGenerationActions";
import { executeGeneratorFunctionClient } from "@/lib/utils/testCaseGeneratorExecutor";
import { executeAlgoTests } from "@/lib/execution/algoTestExecutor";
import { saveProblemToDatabase } from "@/lib/actions/adminProblemBuilderActions";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { TestCase } from "@/types/algorithm-types";

interface ProblemGenerationData {
	slug: string;
	title: string;
	statementMd: string;
	examplesAndConstraintsMd: string | null;
	topics: string[];
	difficulty: "easy" | "medium" | "hard";
	languages: string[];
	rubric: { optimal_time: string; acceptable_time: string[] };
	parameters: { name: string; type: string }[];
	returnType: string;
	functionName: string;
	judge?: any;
	startingCode: { [language: string]: string };
	passingCode: { [language: string]: string };
	secondaryPassingCode: { [language: string]: string };
	outputOrderMatters: boolean;
	order?: number;
}

export function useProblemBuilder(builderId: string, problemName: string) {
	const [state, setState] = useState<BuilderState>(() => ({
		builderId,
		problemName,
		phase: "idle",
		phaseStartTime: Date.now(),
		phaseDescription: getPhaseDescription("idle"),
		testCaseCounts: {
			generated: 0,
			passed: 0,
			failed: 0,
		},
		retryCount: 0,
	}));

	const cancelledRef = useRef(false);
	const problemDataRef = useRef<ProblemGenerationData | null>(null);
	const testCasesRef = useRef<TestCase[]>([]);
	const lastFailureErrorRef = useRef<string | undefined>(undefined);

	const updateState = useCallback((updates: Partial<BuilderState>) => {
		setState((prev) => {
			const updated: BuilderState = {
				...prev,
				...updates,
			};

			// If phase changed, reset phase start time
			if (updates.phase && updates.phase !== prev.phase) {
				updated.phaseStartTime = Date.now();
				updated.phaseDescription = getPhaseDescription(
					updates.phase,
					updates.batchNumber
						? { batchNumber: updates.batchNumber }
						: undefined
				);
			}

			return updated;
		});
	}, []);

	const cancel = useCallback(() => {
		cancelledRef.current = true;
		updateState({
			phase: "cancelled",
			phaseDescription: "Cancelled by user",
			cancelled: true,
			cancelledAt: Date.now(),
		});
	}, [updateState]);

	const isCancelled = useCallback(() => {
		return cancelledRef.current || state.phase === "cancelled";
	}, [state.phase]);

	const start = useCallback(async () => {
		if (state.phase !== "idle") {
			return;
		}

		console.log(
			`[${builderId}] 🔵 START called at`,
			new Date().toISOString()
		);

		cancelledRef.current = false;
		problemDataRef.current = null;
		testCasesRef.current = [];

		// Get previous error from last failure (if restarting)
		const previousFailureError = lastFailureErrorRef.current;
		lastFailureErrorRef.current = undefined; // Clear after using

		try {
			// Phase 1: Generate Problem Data
			updateState({
				phase: "generating_problem",
				phaseDescription: previousFailureError
					? "Restarting after failure..."
					: getPhaseDescription("generating_problem"),
			});

			console.log(
				`[${builderId}] 🟢 generating_problem started`,
				previousFailureError ? "(restarting after failure)" : "",
				new Date().toISOString()
			);

			let problemData: ProblemGenerationData | null = null;
			let retryCount = 0;
			const maxRetries = 3;
			let previousError: string | undefined = previousFailureError;

			while (retryCount <= maxRetries) {
				if (isCancelled()) {
					return;
				}

				try {
					console.log(
						`[${builderId}] 📞 Calling generateProblemData for: ${problemName}`,
						retryCount > 0
							? `(retry ${retryCount}/${maxRetries})`
							: "",
						new Date().toISOString()
					);

					// Use API route for concurrent execution
					const response = await fetch(
						"/api/admin/generate-problem-data",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								problemName,
								previousError,
							}),
						}
					);

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(
							errorData.error || "Failed to generate problem data"
						);
					}

					const result = await response.json();
					console.log(
						`[${builderId}] ✅ generateProblemData completed`,
						new Date().toISOString()
					);

					if (isCancelled()) {
						return;
					}

					if (!result.success || !result.data) {
						throw new Error(
							result.error || "Failed to generate problem data"
						);
					}

					// Secondary code validation removed - no longer needed
					problemData = result.data;
					problemDataRef.current = problemData;
					break;
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: "Unknown error";
					previousError = errorMessage;

					if (retryCount >= maxRetries) {
						throw error;
					}
					retryCount++;
					updateState({
						retryCount,
						error: errorMessage,
						errorTimestamp: Date.now(),
						phaseDescription: `Retrying code generation (attempt ${
							retryCount + 1
						}/${maxRetries + 1})...`,
					});
					await new Promise((resolve) =>
						setTimeout(resolve, getBackoffDelay(retryCount - 1))
					);
				}
			}

			if (!problemData) {
				throw new Error("Failed to generate problem data");
			}

			// Reset retry count for next phase
			updateState({
				retryCount: 0,
				error: undefined,
				errorTimestamp: undefined,
			});

			// Phase 2: Generate All Test Cases
			updateState({
				phase: "generating_tests",
				phaseDescription: getPhaseDescription("generating_tests"),
			});

			if (isCancelled()) {
				return;
			}

			let allTestCases: TestCase[] = [];
			let passingTestCases: TestCase[] = [];
			retryCount = 0;
			let previousTestError: string | undefined = undefined;

			while (retryCount <= maxRetries) {
				if (isCancelled()) {
					return;
				}

				try {
					// Step 1: Generate the generator function code (server-side - only OpenAI API call)
					console.log(
						`[${builderId}] 📞 Calling generateTestCaseGeneratorFunction`,
						new Date().toISOString()
					);

					// Use API route for concurrent execution
					const response = await fetch(
						"/api/admin/generate-test-case-generator",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								problemData,
								existingTests: [],
								previousError: previousTestError,
							}),
						}
					);

					if (!response.ok) {
						const errorData = await response.json();
						throw new Error(
							errorData.error ||
								"Failed to generate test case generator function"
						);
					}

					const generatorResult = await response.json();
					console.log(
						`[${builderId}] ✅ generateTestCaseGeneratorFunction completed`,
						new Date().toISOString()
					);

					if (isCancelled()) {
						return;
					}

					if (
						!generatorResult.success ||
						!generatorResult.generatorFunction
					) {
						throw new Error(
							generatorResult.error ||
								"Failed to generate test case generator function"
						);
					}

					const generatorFunctionCode =
						generatorResult.generatorFunction;

					// Step 2: Create temporary problem for client-side execution
					const tempProblemForGeneration: AlgoProblemDetail = {
						id: "temp",
						slug: problemData.slug,
						title: problemData.title,
						topics: problemData.topics,
						difficulty: problemData.difficulty,
						languages: problemData.languages,
						order: 0,
						statementMd: problemData.statementMd,
						examplesAndConstraintsMd:
							problemData.examplesAndConstraintsMd,
						rubric: problemData.rubric,
						tests: [],
						parameters: problemData.parameters || undefined,
						returnType: problemData.returnType || undefined,
						functionName: problemData.functionName || undefined,
						judge: problemData.judge || undefined,
						startingCode: problemData.startingCode,
						passingCode: problemData.passingCode,
						secondaryPassingCode: problemData.secondaryPassingCode,
						outputOrderMatters: problemData.outputOrderMatters,
					};

					// Step 3: Execute generator function client-side
					allTestCases = await executeGeneratorFunctionClient(
						generatorFunctionCode,
						{
							existingTests: [],
							constraints:
								problemData.examplesAndConstraintsMd || "",
							parameters: problemData.parameters,
							passingCode: problemData.passingCode.javascript,
							problem: tempProblemForGeneration,
							problemContext: {
								title: problemData.title,
								statement: problemData.statementMd,
								judge: problemData.judge,
							},
						}
					);

					if (isCancelled()) {
						return;
					}

					testCasesRef.current = allTestCases;

					// Phase 3: Validate Test Cases (inside loop to check if we need to retry)
					updateState({
						phase: "validating_tests",
						phaseDescription:
							getPhaseDescription("validating_tests"),
					});

					if (isCancelled()) {
						return;
					}

					// Create temporary problem for testing
					const tempProblem: AlgoProblemDetail = {
						id: "temp",
						slug: problemData.slug,
						title: problemData.title,
						topics: problemData.topics,
						difficulty: problemData.difficulty,
						languages: problemData.languages,
						order: 0,
						statementMd: problemData.statementMd,
						examplesAndConstraintsMd:
							problemData.examplesAndConstraintsMd,
						rubric: problemData.rubric,
						tests: allTestCases,
						parameters: problemData.parameters || undefined,
						returnType: problemData.returnType || undefined,
						functionName: problemData.functionName || undefined,
						judge: problemData.judge || undefined,
						startingCode: problemData.startingCode,
						passingCode: problemData.passingCode,
						secondaryPassingCode: problemData.secondaryPassingCode,
						outputOrderMatters: problemData.outputOrderMatters,
					};

					if (isCancelled()) {
						return;
					}

					// Run test execution (secondary code validation disabled for now)
					const passingCodeResult = await executeAlgoTests(
						tempProblem,
						problemData.passingCode.javascript,
						"javascript",
						() => isCancelled()
					);

					if (
						isCancelled() ||
						passingCodeResult.message === "Execution was cancelled"
					) {
						return;
					}

					// Filter out failing test cases - only keep those that pass passing code
					// (Secondary code validation is disabled)
					console.log(
						`\n[Builder] Validating ${allTestCases.length} test cases for: ${problemData.title}`
					);
					console.log(
						`[Builder] Passing code results: ${
							passingCodeResult.results.filter((r) => r.passed)
								.length
						}/${passingCodeResult.results.length} passed`
					);

					passingTestCases = allTestCases.filter(
						(testCase, index) => {
							const passingTest =
								passingCodeResult.results[index];

							const passes = passingTest?.passed === true;

							// Log first few failures for debugging
							if (!passes && index < 5) {
								console.log(
									`\n[Builder] Failed test case ${index + 1}:`
								);
								console.log(
									`  Input: ${JSON.stringify(testCase.input)}`
								);
								console.log(
									`  Expected: ${JSON.stringify(
										testCase.output
									)}`
								);
								if (passingTest?.passed !== true) {
									console.log(
										`  Passing code actual: ${JSON.stringify(
											passingTest?.actual
										)}`
									);
									console.log(
										`  Passing code passed: ${passingTest?.passed}`
									);
									if (passingTest?.error) {
										console.log(
											`  Passing code error: ${passingTest.error}`
										);
									}
								}
							}

							return passes;
						}
					);

					updateState({
						testCaseCounts: {
							generated: allTestCases.length,
							passed: passingTestCases.length,
							failed:
								allTestCases.length - passingTestCases.length,
						},
					});

					// Log detailed failure information
					if (passingTestCases.length < allTestCases.length) {
						console.log(
							`\n⚠️ [Builder] ${
								allTestCases.length - passingTestCases.length
							} test cases failed for: ${problemData.title}`
						);
						console.log(
							`[Builder] Only showing first 5 failures above. Total failures: ${
								allTestCases.length - passingTestCases.length
							}`
						);
					}

					console.log(
						`\n✅ Generated ${allTestCases.length} test cases, ${passingTestCases.length} passed validation for: ${problemData.title}`
					);

					// Validate minimum test case requirement - retry if insufficient
					if (passingTestCases.length <= 5) {
						const errorMessage = `Insufficient test cases: Only ${
							passingTestCases.length
						} test case${
							passingTestCases.length !== 1 ? "s" : ""
						} passed validation (minimum required: 6). Retrying test case generation...`;
						console.error(`\n⚠️ [Builder] ${errorMessage}`);

						// Retry test case generation with error context
						previousTestError = errorMessage;
						retryCount++;

						if (retryCount > maxRetries) {
							// If we've exhausted retries, fail
							const finalErrorMessage = `Failed after ${
								maxRetries + 1
							} attempts: Only ${
								passingTestCases.length
							} test case${
								passingTestCases.length !== 1 ? "s" : ""
							} passed validation (minimum required: 6).`;
							updateState({
								phase: "failed",
								phaseDescription:
									"Failed: Insufficient test cases after retries",
								error: finalErrorMessage,
								errorTimestamp: Date.now(),
								testCaseCounts: {
									generated: allTestCases.length,
									passed: passingTestCases.length,
									failed:
										allTestCases.length -
										passingTestCases.length,
								},
							});
							throw new Error(finalErrorMessage);
						}

						updateState({
							retryCount,
							error: errorMessage,
							errorTimestamp: Date.now(),
							phaseDescription: `Retrying test generation (attempt ${
								retryCount + 1
							}/${maxRetries + 1}) - need more test cases...`,
							testCaseCounts: {
								generated: allTestCases.length,
								passed: passingTestCases.length,
								failed:
									allTestCases.length -
									passingTestCases.length,
							},
						});

						// Wait before retrying
						await new Promise((resolve) =>
							setTimeout(resolve, getBackoffDelay(retryCount - 1))
						);

						// Continue to retry test case generation (outer loop)
						continue;
					}

					// We have enough test cases, break out of outer loop
					break;
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: "Unknown error";
					previousTestError = errorMessage;

					if (retryCount >= maxRetries) {
						throw error;
					}
					retryCount++;
					updateState({
						retryCount,
						error: errorMessage,
						errorTimestamp: Date.now(),
						phaseDescription: `Retrying test generation (attempt ${
							retryCount + 1
						}/${maxRetries + 1})...`,
					});
					await new Promise((resolve) =>
						setTimeout(resolve, getBackoffDelay(retryCount - 1))
					);
				}
			}

			if (isCancelled()) {
				return;
			}

			// Safety check: Ensure we have test cases before saving
			if (!passingTestCases || passingTestCases.length === 0) {
				const errorMessage =
					"No test cases available to save. This should not happen.";
				console.error(`\n❌ [Builder] ${errorMessage}`);
				updateState({
					phase: "failed",
					phaseDescription: "Failed: No test cases generated",
					error: errorMessage,
					errorTimestamp: Date.now(),
				});
				throw new Error(errorMessage);
			}

			// Phase 4: Finalizing
			updateState({
				phase: "finalizing",
				phaseDescription: "Saving to database...",
			});

			// Save to database
			const saveResult = await saveProblemToDatabase(
				problemData,
				passingTestCases
			);

			if (!saveResult.success) {
				throw new Error(
					saveResult.error || "Failed to save problem to database"
				);
			}

			// Phase 5: Complete
			updateState({
				phase: "completed",
				phaseDescription: "Completed successfully",
				completedAt: Date.now(),
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			updateState({
				phase: "failed",
				phaseDescription: "Failed - will restart automatically",
				error: errorMessage,
				errorTimestamp: Date.now(),
			});

			// Store error for next restart attempt
			lastFailureErrorRef.current = errorMessage;

			// Auto-restart after a delay
			console.log(
				`[${builderId}] 🔄 Auto-restarting after failure in 3 seconds...`
			);
			const restartTimeoutId = setTimeout(() => {
				if (!isCancelled()) {
					console.log(
						`[${builderId}] 🔄 Restarting builder with error context: ${errorMessage}`
					);
					// Reset state to idle and restart
					updateState({
						phase: "idle",
						phaseDescription: "Restarting after failure...",
						error: undefined,
						errorTimestamp: undefined,
						retryCount: 0,
					});
					// Start will be called automatically by the useEffect
				}
			}, 3000);

			// Store timeout ID so we can clear it if component unmounts
			// (Note: This is a simple implementation - in production you might want to use a ref)
		}
	}, [problemName, state.phase, updateState, isCancelled, builderId]);

	const finishManually = useCallback(async () => {
		if (!problemDataRef.current) {
			throw new Error("Problem data not found");
		}

		const testCases = testCasesRef.current;
		// Allow manual save with any number of test cases (including 0)
		// User explicitly chose to finish manually, so respect their decision

		updateState({
			phase: "finalizing",
			phaseDescription: `Manually finishing and saving to database with ${
				testCases.length
			} test case${testCases.length !== 1 ? "s" : ""}...`,
		});

		try {
			const saveResult = await saveProblemToDatabase(
				problemDataRef.current,
				testCases
			);

			if (!saveResult.success) {
				throw new Error(
					saveResult.error || "Failed to save problem to database"
				);
			}

			updateState({
				phase: "completed",
				phaseDescription: `Manually completed with ${testCases.length} test cases`,
				completedAt: Date.now(),
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			updateState({
				phase: "failed",
				phaseDescription: "Failed to manually finish",
				error: errorMessage,
				errorTimestamp: Date.now(),
			});
			throw error;
		}
	}, [updateState]);

	// Auto-start when hook is initialized or restarted after failure
	// Use startTransition to ensure immediate, non-blocking start
	useEffect(() => {
		if (state.phase === "idle") {
			// Start immediately without waiting for React to batch
			// Use setTimeout to ensure it runs in the next tick, allowing all hooks to initialize first
			const timeoutId = setTimeout(() => {
				start();
			}, 0);
			return () => clearTimeout(timeoutId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.phase]); // Restart when phase changes to idle (including after failure)

	return {
		state,
		cancel,
		finishManually,
	};
}
