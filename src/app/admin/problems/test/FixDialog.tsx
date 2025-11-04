"use client";

import { useState, useEffect } from "react";
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

interface FixDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	problemResult: TestProblemResult;
	language: string;
	isSecondary?: boolean;
	onFixed: (problemId?: string) => void;
}

export function FixDialog({
	open,
	onOpenChange,
	problemResult,
	language,
	isSecondary = false,
	onFixed,
}: FixDialogProps) {
	const [step, setStep] = useState<
		"generating" | "testing" | "ready" | "applying"
	>("generating");
	const [fix, setFix] = useState<AIFixResponse | null>(null);
	const [testResult, setTestResult] = useState<TestFixResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isApplying, setIsApplying] = useState(false);

	const langResult = problemResult.languages.find(
		(l) => l.language === language
	);
	const primaryFailedTestCases = langResult?.failedTestCases || [];
	const secondaryFailedTestCases =
		langResult?.secondaryValidation?.failedTestCases || [];
	const failedTestCases = isSecondary
		? secondaryFailedTestCases
		: primaryFailedTestCases;

	// Reset state when dialog opens/closes or problem changes
	useEffect(() => {
		if (open) {
			// Reset all state when dialog opens
			setStep("generating");
			setFix(null);
			setTestResult(null);
			setError(null);
			setIsApplying(false);

			// Generate fix if we have any failed test cases (primary or secondary)
			if (
				primaryFailedTestCases.length > 0 ||
				secondaryFailedTestCases.length > 0
			) {
				generateFix();
			}
		} else {
			// Reset state when dialog closes
			setStep("generating");
			setFix(null);
			setTestResult(null);
			setError(null);
			setIsApplying(false);
		}
	}, [open, problemResult.problemId, language]);

	const generateFix = async () => {
		setStep("generating");
		setError(null);
		setFix(null);
		setTestResult(null);

		try {
			// Always pass both primary and secondary failures if they exist
			// The AI will determine what needs to be fixed
			const result = await generateProblemFix(
				problemResult.problemId,
				language,
				primaryFailedTestCases.map((tc) => ({
					case: tc.case,
					input: tc.input,
					expected: tc.expected,
					actual: tc.actual,
					error: tc.error,
				})),
				secondaryFailedTestCases.length > 0
					? secondaryFailedTestCases.map((tc) => ({
							case: tc.case,
							input: tc.input,
							expected: tc.expected,
							actual: tc.actual,
							error: tc.error,
					  }))
					: undefined
			);

			if (!result.success || !result.fix) {
				setError(result.error || "Failed to generate fix");
				setStep("ready"); // Allow retry even on error
				return;
			}

			setFix(result.fix);
			setStep("testing");
			setError(null);

			// Auto-test the fix with timeout
			try {
				// Add timeout to prevent hanging indefinitely
				const timeoutPromise: Promise<TestFixResult> = new Promise(
					(_, reject) => {
						setTimeout(() => {
							reject(new Error("Testing timeout after 60 seconds"));
						}, 60000); // 60 second timeout
					}
				);

				const testResult = await Promise.race([
					testProposedFix(problemResult.problemId, result.fix),
					timeoutPromise,
				]);

				setTestResult(testResult);
				setStep("ready");
			} catch (testErr) {
				setError(
					`Fix generated but testing failed: ${
						testErr instanceof Error
							? testErr.message
							: "Unknown error"
					}`
				);
				setStep("ready");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
			setStep("ready"); // Allow retry on error
		}
	};

	const handleRetry = () => {
		setFix(null);
		setTestResult(null);
		setError(null);
		generateFix();
	};

	const handleApply = async () => {
		if (!fix) return;

		setIsApplying(true);
		setError(null);

		try {
			const result = await applyProblemFix(problemResult.problemId, fix);

			if (!result.success) {
				setError(result.error || "Failed to apply fix");
				setIsApplying(false);
				return;
			}

			// Close dialog immediately - don't wait for re-testing
			onOpenChange(false);

			// Reset state immediately
			setFix(null);
			setTestResult(null);
			setError(null);
			setStep("generating");
			setIsApplying(false);

			// Start re-testing in the background (don't await)
			onFixed(problemResult.problemId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
			setIsApplying(false);
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		// Reset state immediately
		setFix(null);
		setTestResult(null);
		setError(null);
		setStep("generating");
		setIsApplying(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						Fix with AI: {problemResult.problemTitle}
						{isSecondary && (
							<Badge variant="secondary" className="ml-2">
								Secondary Code
							</Badge>
						)}
					</DialogTitle>
					<DialogDescription>
						AI will analyze the failed test cases and propose fixes
						{isSecondary &&
							" (fixing test cases that reject valid secondary solutions)"}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Status indicator */}
					<div className="flex items-center gap-2 flex-wrap">
						<Badge
							variant={
								step === "ready" && testResult?.allTestsPass
									? "default"
									: step === "ready" &&
									  !testResult?.allTestsPass
									? "destructive"
									: error
									? "destructive"
									: "secondary"
							}
						>
							{step === "generating" && "Generating fix..."}
							{step === "testing" && "Testing fix..."}
							{step === "ready" &&
								testResult?.allTestsPass &&
								"All tests pass ✓"}
							{step === "ready" &&
								!testResult?.allTestsPass &&
								testResult &&
								"Tests still failing"}
							{step === "ready" &&
								error &&
								!testResult &&
								"Error occurred"}
							{step === "applying" && "Applying fix..."}
						</Badge>
					</div>

					{/* Error Display */}
					{error && (
						<div className="border border-red-300 bg-red-50 dark:bg-red-950 rounded-lg p-4">
							<h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
								Error
							</h4>
							<p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
								{error}
							</p>
							<p className="text-xs text-red-600 dark:text-red-400 mt-2">
								Check the browser console for more details.
							</p>
						</div>
					)}

					{/* AI Explanation */}
					{fix && (
						<div className="border rounded-lg p-4 bg-muted/50">
							<h4 className="font-semibold mb-2">AI Analysis</h4>
							<p className="text-sm">{fix.explanation}</p>
							<div className="mt-2">
								<Badge variant="outline">
									Fix Type: {fix.fixType}
								</Badge>
							</div>
						</div>
					)}

					{/* Proposed Changes */}
					{fix && (
						<div className="border rounded-lg p-4">
							<h4 className="font-semibold mb-2">
								Proposed Changes
							</h4>

							{fix.fixType === "testCases" ||
							fix.fixType === "both" ? (
								<div className="mb-4">
									<h5 className="text-sm font-medium mb-2">
										Test Cases (
										{fix.fixes.testCases?.updates.length ||
											0}{" "}
										updates)
									</h5>
									<div className="space-y-2 text-xs font-mono bg-background p-2 rounded overflow-x-auto">
										{fix.fixes.testCases?.updates.map(
											(update, idx) => (
												<div
													key={idx}
													className="border-l-2 pl-2"
												>
													<div>
														Test Index:{" "}
														{update.testIndex}
													</div>
													{update.input !==
														undefined && (
														<div>
															Input:{" "}
															{JSON.stringify(
																update.input
															)}
														</div>
													)}
													{update.output !==
														undefined && (
														<div>
															Output:{" "}
															{JSON.stringify(
																update.output
															)}
														</div>
													)}
												</div>
											)
										)}
									</div>
								</div>
							) : null}

							{fix.fixType === "passingCode" ||
							fix.fixType === "both" ? (
								<div>
									<h5 className="text-sm font-medium mb-2">
										Passing Code ({language})
									</h5>
									<pre className="text-xs bg-background p-3 rounded overflow-x-auto border">
										<code>
											{fix.fixes.passingCode?.javascript}
										</code>
									</pre>
								</div>
							) : null}
						</div>
					)}

					{/* Test Results */}
					{testResult && step === "ready" && (
						<div className="border rounded-lg p-4">
							<h4 className="font-semibold mb-2">Test Results</h4>
							<div className="flex items-center gap-2 mb-2">
								<Badge
									variant={
										testResult.allTestsPass
											? "default"
											: "destructive"
									}
								>
									{
										testResult.testResults.filter(
											(r) => r.passed
										).length
									}{" "}
									/ {testResult.testResults.length} tests
									passing
								</Badge>
							</div>

							{!testResult.allTestsPass && (
								<div className="mt-2 space-y-1">
									<p className="text-sm font-medium text-red-600">
										Still failing tests:
									</p>
									<div className="text-xs space-y-1 max-h-32 overflow-y-auto">
										{testResult.testResults
											.filter((r) => !r.passed)
											.map((r, idx) => (
												<div
													key={idx}
													className="bg-red-50 dark:bg-red-950 p-2 rounded"
												>
													<div>
														Test {r.case}: Input=
														{JSON.stringify(
															r.input
														)}
													</div>
													<div>
														Expected:{" "}
														{JSON.stringify(
															r.expected
														)}
														, Got:{" "}
														{JSON.stringify(
															r.actual
														)}
													</div>
													{r.error && (
														<div className="text-red-600">
															Error: {r.error}
														</div>
													)}
												</div>
											))}
									</div>
								</div>
							)}
						</div>
					)}

					{/* Loading state */}
					{(step === "generating" ||
						step === "testing" ||
						step === "applying") && (
						<div className="flex items-center justify-center py-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isApplying}
					>
						Cancel
					</Button>
					{step === "ready" && (
						<>
							<Button
								variant="outline"
								onClick={handleRetry}
								disabled={isApplying}
							>
								Retry
							</Button>
							<Button
								onClick={handleApply}
								disabled={
									isApplying || !testResult?.allTestsPass
								}
							>
								{isApplying ? "Applying..." : "Apply Fix"}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
