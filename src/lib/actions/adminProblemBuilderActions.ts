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
import { revalidatePath, revalidateTag } from "next/cache";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";

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
 * This is a public server action that can be called from client components
 * to revalidate algorithm-related pages after problem creation/updates
 *
 * This is called from the client after detecting builder completion,
 * ensuring revalidation happens in a separate server action context,
 * not during the builder's execution or during render.
 */
export async function revalidateAlgorithmPaths() {
	requireAdmin();

	revalidatePath("/algorithms");
	revalidatePath("/algorithms/problems");
	revalidateTag("algo:problems");
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
				// Check for cancellation before making OpenAI API call
				if (isBuilderCancelled(builderId)) {
					return {
						success: false,
						error: "Builder was cancelled",
					};
				}

				const result = await generateProblemData(problemName);

				// Check for cancellation after OpenAI API call completes
				if (isBuilderCancelled(builderId)) {
					return {
						success: false,
						error: "Builder was cancelled",
					};
				}

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

					// Check for cancellation before regeneration
					if (isBuilderCancelled(builderId)) {
						return {
							success: false,
							error: "Builder was cancelled",
						};
					}

					// Try to regenerate with stronger prompt
					const regenerateResult = await generateProblemData(
						problemName
					);

					// Check for cancellation after regeneration
					if (isBuilderCancelled(builderId)) {
						return {
							success: false,
							error: "Builder was cancelled",
						};
					}

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

		// Phase 2: Generate All Test Cases (Single Function Call)
		updateBuilderState(builderId, {
			phase: "generating_tests",
			phaseDescription: getPhaseDescription("generating_tests"),
		});

		// Check for cancellation
		if (isBuilderCancelled(builderId)) {
			return {
				success: false,
				error: "Builder was cancelled",
			};
		}

		// Yield to event loop to prevent blocking
		await yieldToEventLoop(20);

		// Generate all test cases at once
		let allTestCases: TestCase[] = [];
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
				// Check for cancellation before making OpenAI API call
				if (isBuilderCancelled(builderId)) {
					return {
						success: false,
						error: "Builder was cancelled",
					};
				}

				const testResult = await generateTestCases(
					problemData,
					[] // No existing tests on first generation
				);

				// Check for cancellation after OpenAI API call completes
				if (isBuilderCancelled(builderId)) {
					return {
						success: false,
						error: "Builder was cancelled",
					};
				}

				if (!testResult.success || !testResult.testCases) {
					throw new Error(
						testResult.error || "Failed to generate test cases"
					);
				}

				// Yield after AI call
				await yieldToEventLoop(20);

				allTestCases = testResult.testCases;
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
			phaseDescription: getPhaseDescription("validating_tests"),
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

		// Check for cancellation before test execution
		if (isBuilderCancelled(builderId)) {
			return {
				success: false,
				error: "Builder was cancelled",
			};
		}

		// Yield to event loop before heavy CPU operations
		await yieldToEventLoop(50);

		// Check for cancellation before test execution
		if (isBuilderCancelled(builderId)) {
			return {
				success: false,
				error: "Builder was cancelled",
			};
		}

		// Run both test executions in parallel
		const [passingCodeResult, secondaryCodeResult] = await Promise.all([
			executeAlgoTests(
				tempProblem,
				problemData.passingCode.javascript,
				"javascript",
				() => isBuilderCancelled(builderId)
			),
			executeAlgoTests(
				tempProblem,
				problemData.secondaryPassingCode.javascript,
				"javascript",
				() => isBuilderCancelled(builderId)
			),
		]);

		// Check for cancellation after test executions
		if (
			isBuilderCancelled(builderId) ||
			passingCodeResult.message === "Execution was cancelled" ||
			secondaryCodeResult.message === "Execution was cancelled"
		) {
			return {
				success: false,
				error: "Builder was cancelled",
			};
		}

		// Yield after test executions
		await yieldToEventLoop(50);

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
				passingTest?.passed === true && secondaryTest?.passed === true;

			// Log first few failures for debugging
			if (!passes && index < 5) {
				console.log(`\n[Builder] Failed test case ${index + 1}:`);
				console.log(`  Input: ${JSON.stringify(testCase.input)}`);
				console.log(`  Expected: ${JSON.stringify(testCase.output)}`);
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

		updateBuilderState(builderId, {
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
				parameters: problemData.parameters || undefined,
				returnType: problemData.returnType || undefined,
				functionName: problemData.functionName || undefined,
				tests: passingTestCases as any, // Cast to Prisma Json type
				startingCode: problemData.startingCode,
				passingCode: problemData.passingCode,
				secondaryPassingCode: problemData.secondaryPassingCode,
				outputOrderMatters: problemData.outputOrderMatters,
				judge: problemData.judge || undefined, // Custom judge config (only for edge cases)
				order: finalOrder,
			},
		});

		// Yield after database save
		await yieldToEventLoop(20);

		// Note: Revalidation is now handled by the client component
		// calling revalidateAlgorithmPaths() after detecting completion
		// This prevents Next.js from detecting revalidation during render

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
				parameters: problemData.parameters || undefined,
				returnType: problemData.returnType || undefined,
				functionName: problemData.functionName || undefined,
				tests: testCases as any, // Cast to Prisma Json type
				startingCode: problemData.startingCode,
				passingCode: problemData.passingCode,
				secondaryPassingCode: problemData.secondaryPassingCode,
				outputOrderMatters: problemData.outputOrderMatters,
				judge: problemData.judge || undefined, // Custom judge config (only for edge cases)
				order: finalOrder,
			},
		});

		await yieldToEventLoop(20);

		// Note: Revalidation is now handled by the client component
		// calling revalidateAlgorithmPaths() after detecting completion
		// This prevents Next.js from detecting revalidation during render

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
