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

		try {
			// Phase 1: Generate Problem Data
			updateState({
				phase: "generating_problem",
				phaseDescription: getPhaseDescription("generating_problem"),
			});

			console.log(
				`[${builderId}] 🟢 generating_problem started`,
				new Date().toISOString()
			);

			let problemData: ProblemGenerationData | null = null;
			let retryCount = 0;
			const maxRetries = 3;

			while (retryCount <= maxRetries) {
				if (isCancelled()) {
					return;
				}

				try {
					console.log(
						`[${builderId}] 📞 Calling generateProblemData for: ${problemName}`,
						new Date().toISOString()
					);

					// Use API route for concurrent execution
					const response = await fetch(
						"/api/admin/generate-problem-data",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ problemName }),
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

					// Validate code uniqueness
					const isUnique = validateCodeUniqueness(
						result.data.passingCode.javascript,
						result.data.secondaryPassingCode.javascript
					);

					if (!isUnique) {
						updateState({
							phaseDescription:
								"Regenerating secondary code (must be different)...",
						});

						if (isCancelled()) {
							return;
						}

						// Try to regenerate with stronger prompt
						const regenerateResponse = await fetch(
							"/api/admin/generate-problem-data",
							{
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ problemName }),
							}
						);

						if (!regenerateResponse.ok) {
							const errorData = await regenerateResponse.json();
							throw new Error(
								errorData.error ||
									"Failed to regenerate problem data"
							);
						}

						const regenerateResult =
							await regenerateResponse.json();

						if (isCancelled()) {
							return;
						}

						if (regenerateResult.success && regenerateResult.data) {
							const isUniqueAfterRegen = validateCodeUniqueness(
								regenerateResult.data.passingCode.javascript,
								regenerateResult.data.secondaryPassingCode
									.javascript
							);

							if (isUniqueAfterRegen) {
								problemData = regenerateResult.data;
								break;
							}
						}

						if (retryCount < maxRetries) {
							retryCount++;
							updateState({
								retryCount,
								phaseDescription: `Retrying code generation (attempt ${
									retryCount + 1
								}/${maxRetries + 1})...`,
							});
							await new Promise((resolve) =>
								setTimeout(
									resolve,
									getBackoffDelay(retryCount - 1)
								)
							);
							continue;
						}

						throw new Error(
							"Failed to generate unique secondary passing code after multiple attempts"
						);
					}

					problemData = result.data;
					problemDataRef.current = problemData;
					break;
				} catch (error) {
					if (retryCount >= maxRetries) {
						throw error;
					}
					retryCount++;
					updateState({
						retryCount,
						error:
							error instanceof Error
								? error.message
								: "Unknown error",
						errorTimestamp: Date.now(),
						phaseDescription: `Retrying (attempt ${
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
			retryCount = 0;

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
							problem: tempProblem,
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
					break;
				} catch (error) {
					if (retryCount >= maxRetries) {
						throw error;
					}
					retryCount++;
					updateState({
						retryCount,
						error:
							error instanceof Error
								? error.message
								: "Unknown error",
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

			// Phase 3: Validate Test Cases
			updateState({
				phase: "validating_tests",
				phaseDescription: getPhaseDescription("validating_tests"),
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
				examplesAndConstraintsMd: problemData.examplesAndConstraintsMd,
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

			// Run both test executions in parallel
			const [passingCodeResult, secondaryCodeResult] = await Promise.all([
				executeAlgoTests(
					tempProblem,
					problemData.passingCode.javascript,
					"javascript",
					() => isCancelled()
				),
				executeAlgoTests(
					tempProblem,
					problemData.secondaryPassingCode.javascript,
					"javascript",
					() => isCancelled()
				),
			]);

			if (
				isCancelled() ||
				passingCodeResult.message === "Execution was cancelled" ||
				secondaryCodeResult.message === "Execution was cancelled"
			) {
				return;
			}

			// Filter out failing test cases - only keep those that pass both codes
			console.log(
				`\n[Builder] Validating ${allTestCases.length} test cases for: ${problemData.title}`
			);
			console.log(
				`[Builder] Passing code results: ${
					passingCodeResult.results.filter((r) => r.passed).length
				}/${passingCodeResult.results.length} passed`
			);
			console.log(
				`[Builder] Secondary code results: ${
					secondaryCodeResult.results.filter((r) => r.passed).length
				}/${secondaryCodeResult.results.length} passed`
			);

			const passingTestCases = allTestCases.filter((testCase, index) => {
				const passingTest = passingCodeResult.results[index];
				const secondaryTest = secondaryCodeResult.results[index];

				const passes =
					passingTest?.passed === true &&
					secondaryTest?.passed === true;

				// Log first few failures for debugging
				if (!passes && index < 5) {
					console.log(`\n[Builder] Failed test case ${index + 1}:`);
					console.log(`  Input: ${JSON.stringify(testCase.input)}`);
					console.log(
						`  Expected: ${JSON.stringify(testCase.output)}`
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
					if (secondaryTest?.passed !== true) {
						console.log(
							`  Secondary code actual: ${JSON.stringify(
								secondaryTest?.actual
							)}`
						);
						console.log(
							`  Secondary code passed: ${secondaryTest?.passed}`
						);
						if (secondaryTest?.error) {
							console.log(
								`  Secondary code error: ${secondaryTest.error}`
							);
						}
					}
				}

				return passes;
			});

			updateState({
				testCaseCounts: {
					generated: allTestCases.length,
					passed: passingTestCases.length,
					failed: allTestCases.length - passingTestCases.length,
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

			if (isCancelled()) {
				return;
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
				phaseDescription: "Failed",
				error: errorMessage,
				errorTimestamp: Date.now(),
			});
		}
	}, [problemName, state.phase, updateState, isCancelled]);

	const finishManually = useCallback(async () => {
		if (!problemDataRef.current) {
			throw new Error("Problem data not found");
		}

		const testCases = testCasesRef.current;
		if (testCases.length === 0) {
			throw new Error("No test cases available");
		}

		updateState({
			phase: "finalizing",
			phaseDescription: "Manually finishing and saving to database...",
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

	// Auto-start when hook is initialized
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
	}, []); // Only run once on mount - start function is stable

	return {
		state,
		cancel,
		finishManually,
	};
}
