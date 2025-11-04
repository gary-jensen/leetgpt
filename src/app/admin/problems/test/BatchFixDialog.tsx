"use client";

import { useState, useEffect, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	generateProblemFix,
	testProposedFix,
	applyProblemFix,
	AIFixResponse,
	TestFixResult,
} from "@/lib/actions/adminAIFixActions";
import { TestProblemResult } from "@/lib/actions/adminTestActions";

interface BatchFixItem {
	problemResult: TestProblemResult;
	language: string;
	status: "pending" | "generating" | "testing" | "ready" | "failed" | "error";
	fix?: AIFixResponse;
	testResult?: TestFixResult;
	error?: string;
	retryCount: number;
}

interface BatchFixDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	failedProblems: Array<{
		problem: TestProblemResult;
		language: string;
	}>;
	onFixed: (problemIds?: string[]) => void;
}

const MAX_CONCURRENT = 5;
const MAX_RETRIES = 1;

export function BatchFixDialog({
	open,
	onOpenChange,
	failedProblems,
	onFixed,
}: BatchFixDialogProps) {
	const [items, setItems] = useState<BatchFixItem[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isApplying, setIsApplying] = useState(false);
	const [selectedToApply, setSelectedToApply] = useState<Set<number>>(
		new Set()
	);
	const itemsRef = useRef(items);

	// Keep ref in sync with state
	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	// Initialize items when dialog opens
	useEffect(() => {
		if (open && failedProblems.length > 0) {
			const initialItems: BatchFixItem[] = failedProblems.map((fp) => ({
				problemResult: fp.problem,
				language: fp.language,
				status: "pending",
				retryCount: 0,
			}));
			setItems(initialItems);
			setSelectedToApply(new Set());
			setIsProcessing(false);
			setIsApplying(false);
		}
	}, [open, failedProblems]);

	// Process items with concurrency limit
	const processBatch = async () => {
		setIsProcessing(true);

		const processItem = async (index: number) => {
			// Update status to generating
			setItems((prev) => {
				const current = prev[index];
				if (
					!current ||
					current.status === "ready" ||
					current.status === "error"
				) {
					return prev;
				}
				return prev.map((it, i) =>
					i === index ? { ...it, status: "generating" } : it
				);
			});

			// Get current item from ref (latest state)
			const currentItem = itemsRef.current[index];

			if (
				!currentItem ||
				currentItem.status === "ready" ||
				currentItem.status === "error"
			) {
				return;
			}

			try {
				const langResult = currentItem.problemResult.languages.find(
					(l) => l.language === currentItem.language
				);
				const failedTestCases = langResult?.failedTestCases || [];

				// Generate fix
				const result = await generateProblemFix(
					currentItem.problemResult.problemId,
					currentItem.language,
					failedTestCases.map((tc) => ({
						case: tc.case,
						input: tc.input,
						expected: tc.expected,
						actual: tc.actual,
						error: tc.error,
					}))
				);

				if (!result.success || !result.fix) {
					// Retry if we haven't exceeded max retries
					const shouldRetry = currentItem.retryCount < MAX_RETRIES;
					if (shouldRetry) {
						setItems((prev) =>
							prev.map((it, i) =>
								i === index
									? {
											...it,
											status: "pending",
											retryCount: it.retryCount + 1,
											error: undefined,
									  }
									: it
							)
						);
						return; // Will be picked up by concurrency loop
					}

					// Max retries exceeded, mark as error
					setItems((prev) =>
						prev.map((it, i) =>
							i === index
								? {
										...it,
										status: "error",
										error:
											result.error ||
											"Failed to generate fix",
								  }
								: it
						)
					);
					return;
				}

				// Update to testing
				setItems((prev) =>
					prev.map((it, i) =>
						i === index
							? { ...it, status: "testing", fix: result.fix }
							: it
					)
				);

				// Test the fix
				const testResult = await testProposedFix(
					currentItem.problemResult.problemId,
					result.fix
				);

				// Update to ready
				setItems((prev) =>
					prev.map((it, i) =>
						i === index
							? {
									...it,
									status: "ready",
									testResult,
									error: undefined,
							  }
							: it
					)
				);

				// Auto-select if all tests pass
				setItems((prev) => {
					const updated = prev[index];
					if (updated?.testResult?.allTestsPass) {
						setSelectedToApply((prevSelected) =>
							new Set(prevSelected).add(index)
						);
					}
					return prev;
				});
			} catch (err) {
				// Retry if we haven't exceeded max retries
				const shouldRetry = currentItem.retryCount < MAX_RETRIES;
				if (shouldRetry) {
					setItems((prev) =>
						prev.map((it, i) =>
							i === index
								? {
										...it,
										status: "pending",
										retryCount: it.retryCount + 1,
										error: undefined,
								  }
								: it
						)
					);
					return; // Will be picked up by concurrency loop
				}

				// Max retries exceeded
				setItems((prev) =>
					prev.map((it, i) =>
						i === index
							? {
									...it,
									status: "error",
									error:
										err instanceof Error
											? err.message
											: "Unknown error",
							  }
							: it
					)
				);
			}
		};

		// Process with concurrency limit
		const processWithConcurrency = async () => {
			let hasMore = true;

			while (hasMore) {
				// Get current state from ref
				const currentItems = itemsRef.current;
				const pendingIndices = currentItems
					.map((item, index) => ({ item, index }))
					.filter(
						({ item }) =>
							item.status === "pending" ||
							item.status === "generating"
					)
					.map(({ index }) => index);

				if (pendingIndices.length === 0) {
					hasMore = false;
					break;
				}

				// Process in batches of MAX_CONCURRENT
				for (
					let i = 0;
					i < pendingIndices.length;
					i += MAX_CONCURRENT
				) {
					const batch = pendingIndices.slice(i, i + MAX_CONCURRENT);
					await Promise.allSettled(
						batch.map((index) => processItem(index))
					);
				}

				// Wait a bit before checking for more work
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			setIsProcessing(false);
		};

		processWithConcurrency();
	};

	const handleApplySelected = async () => {
		setIsApplying(true);

		const toApply = Array.from(selectedToApply);
		const results: Array<{
			index: number;
			success: boolean;
			error?: string;
		}> = [];

		for (const index of toApply) {
			const item = items[index];
			if (!item || !item.fix) continue;

			try {
				const result = await applyProblemFix(
					item.problemResult.problemId,
					item.fix
				);

				results.push({
					index,
					success: result.success,
					error: result.error,
				});
			} catch (err) {
				results.push({
					index,
					success: false,
					error: err instanceof Error ? err.message : "Unknown error",
				});
			}
		}

		// Close dialog immediately - don't wait for re-testing
		onOpenChange(false);

		// Start re-testing in the background (don't await)
		const fixedProblemIds = results
			.filter((r) => r.success)
			.map((r) => items[r.index].problemResult.problemId);
		onFixed(fixedProblemIds);

		setIsApplying(false);
	};

	const toggleSelection = (index: number) => {
		setSelectedToApply((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	};

	const readyCount = items.filter((item) => item.status === "ready").length;
	const errorCount = items.filter((item) => item.status === "error").length;
	const processingCount = items.filter(
		(item) => item.status === "generating" || item.status === "testing"
	).length;
	const passingCount = items.filter(
		(item) => item.status === "ready" && item.testResult?.allTestsPass
	).length;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Fix All Failed Problems</DialogTitle>
					<DialogDescription>
						Processing {failedProblems.length} problems with AI
						fixes
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Status Summary */}
					<div className="grid grid-cols-4 gap-4 border rounded-lg p-4 bg-muted/50">
						<div>
							<div className="text-sm text-muted-foreground">
								Total
							</div>
							<div className="text-2xl font-bold">
								{items.length}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">
								Ready
							</div>
							<div className="text-2xl font-bold text-green-600">
								{readyCount}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">
								Errors
							</div>
							<div className="text-2xl font-bold text-red-600">
								{errorCount}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">
								Processing
							</div>
							<div className="text-2xl font-bold text-blue-600">
								{processingCount}
							</div>
						</div>
					</div>

					{/* Control Buttons */}
					<div className="flex gap-2">
						{!isProcessing && items.length > 0 && (
							<Button
								onClick={processBatch}
								disabled={isApplying}
							>
								Start Processing
							</Button>
						)}
						{isProcessing && (
							<Button disabled>Processing...</Button>
						)}
					</div>

					{/* Results List */}
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{items.map((item, index) => (
							<div
								key={`${item.problemResult.problemId}-${item.language}`}
								className="border rounded-lg p-4"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<input
												type="checkbox"
												checked={selectedToApply.has(
													index
												)}
												onChange={() =>
													toggleSelection(index)
												}
												disabled={
													item.status !== "ready" ||
													!item.testResult
														?.allTestsPass ||
													isApplying
												}
												className="rounded"
											/>
											<h4 className="font-semibold">
												{
													item.problemResult
														.problemTitle
												}{" "}
												({item.language})
											</h4>
											<Badge
												variant={
													item.status === "ready" &&
													item.testResult
														?.allTestsPass
														? "default"
														: item.status ===
														  "error"
														? "destructive"
														: item.status ===
														  "ready"
														? "destructive"
														: "secondary"
												}
											>
												{item.status === "pending" &&
													"Pending"}
												{item.status === "generating" &&
													"Generating..."}
												{item.status === "testing" &&
													"Testing..."}
												{item.status === "ready" &&
													item.testResult
														?.allTestsPass &&
													"All tests pass ✓"}
												{item.status === "ready" &&
													!item.testResult
														?.allTestsPass &&
													"Tests still failing"}
												{item.status === "error" &&
													"Error"}
											</Badge>
										</div>

										{item.error && (
											<p className="text-sm text-red-600 mb-2">
												{item.error}
											</p>
										)}

										{item.fix && (
											<div className="text-sm text-muted-foreground mb-2">
												{item.fix.explanation}
											</div>
										)}

										{item.testResult && (
											<div className="text-sm">
												<span
													className={
														item.testResult
															.allTestsPass
															? "text-green-600"
															: "text-red-600"
													}
												>
													{
														item.testResult.testResults.filter(
															(r) => r.passed
														).length
													}{" "}
													/{" "}
													{
														item.testResult
															.testResults.length
													}{" "}
													tests passing
												</span>
											</div>
										)}

										{item.retryCount > 0 && (
											<div className="text-xs text-muted-foreground mt-1">
												Retried {item.retryCount}{" "}
												time(s)
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Apply Section */}
					{readyCount > 0 && !isProcessing && (
						<div className="border rounded-lg p-4 bg-muted/50">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h4 className="font-semibold">
										Selected: {selectedToApply.size} /{" "}
										{passingCount} passing fixes
									</h4>
									<p className="text-sm text-muted-foreground">
										Review and apply fixes that passed all
										tests
									</p>
								</div>
								<Button
									onClick={handleApplySelected}
									disabled={
										isApplying || selectedToApply.size === 0
									}
								>
									{isApplying
										? "Applying..."
										: `Apply ${selectedToApply.size} Fix(es)`}
								</Button>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
