"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
	generateProblemData,
	generateTestCases,
} from "./adminProblemGenerationActions";
import { executeAlgoTests } from "@/lib/execution/algoTestExecutor";
import {
	BuilderState,
	BuilderPhase,
	formatElapsedTime,
	getPhaseDescription,
	validateCodeUniqueness,
	getBackoffDelay,
} from "@/lib/utils/problemBuilderUtils";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { TestCase } from "@/types/algorithm-types";
import { generateUUID } from "@/lib/cryptoUtils";

// In-memory storage for builder state
const builderStates = new Map<string, BuilderState>();

// In-memory storage for builder problem data and test cases (for manual finish)
interface BuilderData {
	problemData?: any; // ProblemGenerationData
	testCases?: TestCase[];
}
const builderData = new Map<string, BuilderData>();

/**
 * Dedicated server action for revalidating paths
 * This ensures revalidation happens in a proper server action context, not during render
 */
async function revalidateAlgorithmPaths() {
	const { revalidatePath } = await import("next/cache");
	revalidatePath("/algorithms");
	revalidatePath("/algorithms/problems");
}

/**
 * Yield to event loop with actual delay to allow other requests to process
 * This is critical for preventing server freezing
 */
function yieldToEventLoop(ms: number = 10): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Initialize a new builder state
 */
function initializeBuilderState(
	builderId: string,
	problemName: string
): BuilderState {
	const state: BuilderState = {
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
	};
	builderStates.set(builderId, state);
	return state;
}

/**
 * Update builder state
 */
function updateBuilderState(
	builderId: string,
	updates: Partial<BuilderState>
): BuilderState | null {
	const state = builderStates.get(builderId);
	if (!state) {
		return null;
	}

	const updatedState: BuilderState = {
		...state,
		...updates,
	};

	// If phase changed, reset phase start time
	if (updates.phase && updates.phase !== state.phase) {
		updatedState.phaseStartTime = Date.now();
		updatedState.phaseDescription = getPhaseDescription(
			updates.phase,
			updates.batchNumber
				? { batchNumber: updates.batchNumber }
				: undefined
		);
	}

	builderStates.set(builderId, updatedState);
	return updatedState;
}

/**
 * Get current builder state
 */
export async function getBuilderState(
	builderId: string
): Promise<BuilderState | null> {
	requireAdmin();
	return builderStates.get(builderId) || null;
}

/**
 * Cancel a running builder
 */
export async function cancelBuilder(
	builderId: string
): Promise<{ success: boolean; error?: string }> {
	requireAdmin();

	const state = builderStates.get(builderId);
	if (!state) {
		return { success: false, error: "Builder not found" };
	}

	// Don't allow cancelling if already completed, failed, or cancelled
	if (
		state.phase === "completed" ||
		state.phase === "failed" ||
		state.phase === "cancelled"
	) {
		return {
			success: false,
			error: `Cannot cancel builder in ${state.phase} state`,
		};
	}

	// Mark as cancelled
	updateBuilderState(builderId, {
		phase: "cancelled",
		phaseDescription: "Cancelled by user",
		cancelled: true,
		cancelledAt: Date.now(),
	});

	return { success: true };
}

/**
 * Check if builder is cancelled (helper function)
 */
function isBuilderCancelled(builderId: string): boolean {
	const state = builderStates.get(builderId);
	return state?.cancelled === true || state?.phase === "cancelled";
}

/**
 * Start building a single problem
 */
async function startProblemBuilder(
	problemName: string,
	builderId: string
): Promise<{
	success: boolean;
	problemId?: string;
	error?: string;
}> {
	// Yield before any operations to prevent blocking
	await yieldToEventLoop(10);

	requireAdmin();

	// Yield after auth check
	await yieldToEventLoop(10);

	// Initialize state
	initializeBuilderState(builderId, problemName);

	try {
		// Phase 1: Generate Problem Data
		updateBuilderState(builderId, {
			phase: "generating_problem",
			phaseDescription: getPhaseDescription("generating_problem"),
		});

		let problemData;
		let retryCount = 0;
		const maxRetries = 3;

		while (retryCount <= maxRetries) {
			// Check for cancellation
			if (isBuilderCancelled(builderId)) {
				return {
					success: false,
					error: "Builder was cancelled",
				};
			}

			// Yield before each retry attempt
			if (retryCount > 0) {
				await yieldToEventLoop(10);
			}

			try {
				const result = await generateProblemData(problemName);
				if (!result.success || !result.data) {
					throw new Error(
						result.error || "Failed to generate problem data"
					);
				}

				// Yield after AI call to prevent blocking
				await yieldToEventLoop(20);

				// Yield before code validation (CPU-intensive)
				await yieldToEventLoop(20);

				// Validate code uniqueness
				const isUnique = validateCodeUniqueness(
					result.data.passingCode.javascript,
					result.data.secondaryPassingCode.javascript
				);

				// Yield after validation
				await yieldToEventLoop(10);

				if (!isUnique) {
					// Regenerate secondary passing code
					updateBuilderState(builderId, {
						phaseDescription:
							"Regenerating secondary code (must be different)...",
					});

					// Yield before regeneration
					await yieldToEventLoop(20);

					// Try to regenerate with stronger prompt
					const regenerateResult = await generateProblemData(
						problemName
					);

					// Yield after regeneration
					await yieldToEventLoop(20);

					if (regenerateResult.success && regenerateResult.data) {
						// Yield before validation
						await yieldToEventLoop(20);

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

					// Yield before deciding to retry
					await yieldToEventLoop(10);

					if (retryCount < maxRetries) {
						retryCount++;
						updateBuilderState(builderId, {
							retryCount,
							phaseDescription: `Retrying code generation (attempt ${
								retryCount + 1
							}/${maxRetries + 1})...`,
						});
						await new Promise((resolve) =>
							setTimeout(resolve, getBackoffDelay(retryCount - 1))
						);
						continue;
					}

					throw new Error(
						"Failed to generate unique secondary passing code after multiple attempts"
					);
				}

				problemData = result.data;
				// Store problem data for manual finish
				builderData.set(builderId, { problemData: result.data });
				break;
			} catch (error) {
				if (retryCount >= maxRetries) {
					throw error;
				}
				retryCount++;
				updateBuilderState(builderId, {
					retryCount,
					error:
						error instanceof Error
							? error.message
							: "Unknown error",
					errorTimestamp: Date.now(),
					phaseDescription: `Retrying (attempt ${retryCount + 1}/${
						maxRetries + 1
					})...`,
				});
				// Yield before backoff delay
				await yieldToEventLoop(10);
				await new Promise((resolve) =>
					setTimeout(resolve, getBackoffDelay(retryCount - 1))
				);
			}
		}

		if (!problemData) {
			throw new Error("Failed to generate problem data");
		}

		// Reset retry count for next phase
		updateBuilderState(builderId, {
			retryCount: 0,
			error: undefined,
			errorTimestamp: undefined,
		});

		// Phase 2: Generate Test Cases (Batch Loop)
		updateBuilderState(builderId, {
			phase: "generating_tests",
			phaseDescription: getPhaseDescription("generating_tests"),
		});

		const passingTestCases: TestCase[] = [];
		const MIN_PASSING_TESTS = 40;
		let batchNumber = 0;

		while (passingTestCases.length < MIN_PASSING_TESTS) {
			// Check for cancellation
			if (isBuilderCancelled(builderId)) {
				return {
					success: false,
					error: "Builder was cancelled",
				};
			}

			// Yield to event loop to prevent blocking
			await yieldToEventLoop(20);

			batchNumber++;
			updateBuilderState(builderId, {
				batchNumber,
				phaseDescription: getPhaseDescription("generating_tests", {
					batchNumber,
				}),
			});

			// Generate batch of test cases
			let batchTestCases: TestCase[] = [];
			retryCount = 0;

			while (retryCount <= maxRetries) {
				// Check for cancellation
				if (isBuilderCancelled(builderId)) {
					return {
						success: false,
						error: "Builder was cancelled",
					};
				}

				// Yield before each retry attempt
				if (retryCount > 0) {
					await yieldToEventLoop(10);
				}

				try {
					const testResult = await generateTestCases(
						problemData,
						passingTestCases,
						10
					);

					if (!testResult.success || !testResult.testCases) {
						throw new Error(
							testResult.error || "Failed to generate test cases"
						);
					}

					// Yield after AI call
					await yieldToEventLoop(20);

					batchTestCases = testResult.testCases;
					break;
				} catch (error) {
					if (retryCount >= maxRetries) {
						throw error;
					}
					retryCount++;
					updateBuilderState(builderId, {
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
					// Yield before backoff delay
					await yieldToEventLoop(10);
					await new Promise((resolve) =>
						setTimeout(resolve, getBackoffDelay(retryCount - 1))
					);
				}
			}

			// Validate test cases against both passing codes
			updateBuilderState(builderId, {
				phaseDescription: getPhaseDescription("validating_tests", {
					batchNumber,
				}),
			});

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
				tests: batchTestCases,
				parameterNames: problemData.parameterNames,
				startingCode: problemData.startingCode,
				passingCode: problemData.passingCode,
				secondaryPassingCode: problemData.secondaryPassingCode,
				systemCode: problemData.systemCode,
				outputOrderMatters: problemData.outputOrderMatters,
			};

			// Check for cancellation before test execution
			if (isBuilderCancelled(builderId)) {
				return {
					success: false,
					error: "Builder was cancelled",
				};
			}

			// Yield to event loop before heavy CPU operations
			await yieldToEventLoop(50);

			// Test against passing code
			const passingCodeResult = await executeAlgoTests(
				tempProblem,
				problemData.passingCode.javascript,
				"javascript"
			);

			// Check for cancellation after first test execution
			if (isBuilderCancelled(builderId)) {
				return {
					success: false,
					error: "Builder was cancelled",
				};
			}

			// Yield again before next CPU-intensive operation (longer delay for heavy operations)
			await yieldToEventLoop(50);

			// Test against secondary passing code
			const secondaryCodeResult = await executeAlgoTests(
				tempProblem,
				problemData.secondaryPassingCode.javascript,
				"javascript"
			);

			// Check for cancellation after second test execution
			if (isBuilderCancelled(builderId)) {
				return {
					success: false,
					error: "Builder was cancelled",
				};
			}

			// Yield after test executions (longer delay)
			await yieldToEventLoop(50);

			// Filter to only test cases that pass both codes
			const validTestCases = batchTestCases.filter((testCase, index) => {
				const passingResult = passingCodeResult.results[index];
				const secondaryResult = secondaryCodeResult.results[index];
				return (
					passingResult?.passed === true &&
					secondaryResult?.passed === true
				);
			});

			// Update counts
			const generated = batchTestCases.length;
			const passed = validTestCases.length;
			const failed = generated - passed;

			updateBuilderState(builderId, {
				testCaseCounts: {
					generated: passingTestCases.length + generated,
					passed: passingTestCases.length + passed,
					failed:
						(builderStates.get(builderId)?.testCaseCounts.failed ||
							0) + failed,
				},
				phaseDescription: getPhaseDescription("validating_tests", {
					passedTests: passingTestCases.length + passed,
					targetTests: MIN_PASSING_TESTS,
				}),
			});

			// Add valid test cases
			passingTestCases.push(...validTestCases);

			// Update stored test cases for manual finish
			const currentData = builderData.get(builderId) || {};
			builderData.set(builderId, {
				...currentData,
				testCases: [...passingTestCases],
			});

			// Log successful batch
			if (passed === generated && passed > 0) {
				console.log(
					`✅ Builder ${builderId} - Batch ${batchNumber}: All ${passed}/${generated} test cases passed for ${problemData.title}`
				);
			}

			// Yield after batch completion to prevent blocking
			await yieldToEventLoop(20);
		}

		// Check for cancellation before final validation
		if (isBuilderCancelled(builderId)) {
			return {
				success: false,
				error: "Builder was cancelled",
			};
		}

		// Phase 3: Final Validation
		updateBuilderState(builderId, {
			phase: "validating_tests",
			phaseDescription: "Running final validation...",
		});

		// Yield to event loop before heavy validation
		await yieldToEventLoop(50);

		// Create final problem for validation
		const finalProblem: AlgoProblemDetail = {
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
			tests: passingTestCases,
			parameterNames: problemData.parameterNames,
			startingCode: problemData.startingCode,
			passingCode: problemData.passingCode,
			secondaryPassingCode: problemData.secondaryPassingCode,
			systemCode: problemData.systemCode || undefined,
			outputOrderMatters: problemData.outputOrderMatters,
		};

		// Final validation
		const finalPassingResult = await executeAlgoTests(
			finalProblem,
			problemData.passingCode.javascript,
			"javascript"
		);

		// Yield between test executions (longer delay for 40+ tests)
		await yieldToEventLoop(50);

		const finalSecondaryResult = await executeAlgoTests(
			finalProblem,
			problemData.secondaryPassingCode.javascript,
			"javascript"
		);

		if (finalPassingResult.status === "error") {
			throw new Error(
				`Passing code validation failed: ${finalPassingResult.message}`
			);
		}

		if (finalSecondaryResult.status === "error") {
			throw new Error(
				`Secondary code validation failed: ${finalSecondaryResult.message}`
			);
		}

		// Yield after validation checks
		await yieldToEventLoop(20);

		const allPassingPassed = finalPassingResult.results.every(
			(r) => r.passed
		);
		const allSecondaryPassed = finalSecondaryResult.results.every(
			(r) => r.passed
		);

		if (!allPassingPassed || !allSecondaryPassed) {
			throw new Error(
				`Final validation failed: passing code passed ${
					finalPassingResult.results.filter((r) => r.passed).length
				}/${finalPassingResult.results.length}, secondary code passed ${
					finalSecondaryResult.results.filter((r) => r.passed).length
				}/${finalSecondaryResult.results.length}`
			);
		}

		// Check for cancellation before finalizing
		if (isBuilderCancelled(builderId)) {
			return {
				success: false,
				error: "Builder was cancelled",
			};
		}

		// Phase 4: Finalizing
		updateBuilderState(builderId, {
			phase: "finalizing",
			phaseDescription: "Saving to database...",
		});

		// Yield before database operations
		await yieldToEventLoop(20);

		// Use order from problem data if provided, otherwise get max order value
		const finalOrder =
			problemData.order ??
			(await (async () => {
				const maxOrderResult = await prisma.algoProblem.findFirst({
					orderBy: { order: "desc" },
					select: { order: true },
				});
				return (maxOrderResult?.order || 0) + 1;
			})());

		// Yield after database query
		await yieldToEventLoop(20);

		// Process markdown to HTML (to avoid revalidatePath during render)
		const { processMarkdown } = await import(
			"@/components/MarkdownEditor/markdown-processor"
		);

		// Yield before CPU-intensive markdown processing
		await yieldToEventLoop(30);

		const statementHtml = await processMarkdown(problemData.statementMd);

		// Yield between markdown processing calls
		await yieldToEventLoop(30);

		const examplesAndConstraintsHtml = problemData.examplesAndConstraintsMd
			? await processMarkdown(problemData.examplesAndConstraintsMd)
			: null;

		// Yield after markdown processing
		await yieldToEventLoop(30);

		// Save to database directly (avoiding createAlgoProblem to prevent revalidatePath during render)
		const savedProblem = await prisma.algoProblem.create({
			data: {
				slug: problemData.slug,
				title: problemData.title,
				statementMd: problemData.statementMd,
				statementHtml,
				examplesAndConstraintsMd:
					problemData.examplesAndConstraintsMd || null,
				examplesAndConstraintsHtml,
				topics: problemData.topics,
				difficulty: problemData.difficulty,
				languages: problemData.languages,
				rubric: problemData.rubric,
				parameterNames: problemData.parameterNames,
				tests: passingTestCases as any, // Cast to Prisma Json type
				startingCode: problemData.startingCode,
				passingCode: problemData.passingCode,
				secondaryPassingCode: problemData.secondaryPassingCode,
				systemCode: problemData.systemCode || undefined,
				outputOrderMatters: problemData.outputOrderMatters,
				order: finalOrder,
			},
		});

		// Yield after database save
		await yieldToEventLoop(20);

		// Revalidate paths after successful save
		// Schedule revalidation using queueMicrotask to ensure it's outside render context
		// This prevents Next.js from detecting it as happening during render
		queueMicrotask(() => {
			revalidateAlgorithmPaths().catch((error) => {
				console.error("Failed to revalidate paths:", error);
			});
		});

		// Yield after scheduling revalidation
		await yieldToEventLoop(20);

		// Phase 5: Complete
		updateBuilderState(builderId, {
			phase: "completed",
			phaseDescription: "Completed successfully",
			completedAt: Date.now(),
		});

		return {
			success: true,
			problemId: savedProblem.id,
		};
	} catch (error) {
		// Yield in error handling to prevent blocking
		await yieldToEventLoop(20);

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		updateBuilderState(builderId, {
			phase: "failed",
			phaseDescription: "Failed",
			error: errorMessage,
			errorTimestamp: Date.now(),
		});

		return {
			success: false,
			error: errorMessage,
		};
	}
}

/**
 * Start multiple builders in parallel (max 5)
 */
export async function startMultipleBuilders(problemNames: string[]): Promise<{
	success: boolean;
	builderIds?: string[];
	error?: string;
}> {
	requireAdmin();

	if (problemNames.length === 0) {
		return { success: false, error: "No problem names provided" };
	}

	if (problemNames.length > 5) {
		return {
			success: false,
			error: "Maximum 5 problems can be built at once",
		};
	}

	// Create unique builder IDs
	const builderIds = problemNames.map(() => generateUUID());

	// Start all builders in parallel (don't await - they run in background)
	// Use setTimeout to ensure the HTTP response is sent before builders start
	// Stagger builder starts more aggressively to prevent overwhelming the server
	setTimeout(() => {
		problemNames.forEach((problemName, index) => {
			const builderId = builderIds[index];
			// Stagger starts by 500ms to prevent simultaneous execution and API rate limiting
			setTimeout(() => {
				startProblemBuilder(problemName, builderId).catch((error) => {
					console.error(`Builder ${builderId} failed:`, error);
				});
			}, index * 500);
		});
	});

	return {
		success: true,
		builderIds,
	};
}

/**
 * Manually finish a builder and save the problem with current test cases (even if less than 40)
 */
export async function finishBuilderManually(builderId: string): Promise<{
	success: boolean;
	problemId?: string;
	error?: string;
}> {
	requireAdmin();

	const state = builderStates.get(builderId);
	if (!state) {
		return { success: false, error: "Builder not found" };
	}

	// Check if builder is in a state that can be finished
	if (
		state.phase === "completed" ||
		state.phase === "failed" ||
		state.phase === "cancelled"
	) {
		return { success: false, error: `Builder is already ${state.phase}` };
	}

	// Get stored problem data and test cases
	const data = builderData.get(builderId);
	if (!data?.problemData) {
		return {
			success: false,
			error: "Problem data not found. Builder may not have generated problem data yet.",
		};
	}

	const problemData = data.problemData;
	const testCases = data.testCases || [];

	try {
		// Update builder state to finalizing
		updateBuilderState(builderId, {
			phase: "finalizing",
			phaseDescription: "Manually finishing and saving to database...",
		});

		await yieldToEventLoop(20);

		// Use order from problem data if provided, otherwise get max order value
		const finalOrder =
			problemData.order ??
			(await (async () => {
				const maxOrderResult = await prisma.algoProblem.findFirst({
					orderBy: { order: "desc" },
					select: { order: true },
				});
				return (maxOrderResult?.order || 0) + 1;
			})());

		await yieldToEventLoop(20);

		// Process markdown to HTML
		const { processMarkdown } = await import(
			"@/components/MarkdownEditor/markdown-processor"
		);

		await yieldToEventLoop(30);

		const statementHtml = await processMarkdown(problemData.statementMd);

		await yieldToEventLoop(30);

		const examplesAndConstraintsHtml = problemData.examplesAndConstraintsMd
			? await processMarkdown(problemData.examplesAndConstraintsMd)
			: null;

		await yieldToEventLoop(30);

		// Save to database with whatever test cases we have
		const savedProblem = await prisma.algoProblem.create({
			data: {
				slug: problemData.slug,
				title: problemData.title,
				statementMd: problemData.statementMd,
				statementHtml,
				examplesAndConstraintsMd:
					problemData.examplesAndConstraintsMd || null,
				examplesAndConstraintsHtml,
				topics: problemData.topics,
				difficulty: problemData.difficulty,
				languages: problemData.languages,
				rubric: problemData.rubric,
				parameterNames: problemData.parameterNames,
				tests: testCases as any, // Cast to Prisma Json type
				startingCode: problemData.startingCode,
				passingCode: problemData.passingCode,
				secondaryPassingCode: problemData.secondaryPassingCode,
				systemCode: problemData.systemCode || undefined,
				outputOrderMatters: problemData.outputOrderMatters,
				order: finalOrder,
			},
		});

		await yieldToEventLoop(20);

		// Revalidate paths
		queueMicrotask(() => {
			revalidateAlgorithmPaths().catch((error) => {
				console.error("Failed to revalidate paths:", error);
			});
		});

		await yieldToEventLoop(20);

		// Mark as completed
		updateBuilderState(builderId, {
			phase: "completed",
			phaseDescription: `Manually completed with ${testCases.length} test cases`,
			completedAt: Date.now(),
		});

		// Clean up stored data
		builderData.delete(builderId);

		return {
			success: true,
			problemId: savedProblem.id,
		};
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		updateBuilderState(builderId, {
			phase: "failed",
			phaseDescription: "Failed to manually finish",
			error: errorMessage,
			errorTimestamp: Date.now(),
		});

		return {
			success: false,
			error: errorMessage,
		};
	}
}
