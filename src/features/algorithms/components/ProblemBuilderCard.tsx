"use client";

import { BuilderState } from "@/lib/utils/problemBuilderUtils";
import {
	formatElapsedTime,
	getPhaseDescription,
} from "@/lib/utils/problemBuilderUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, X } from "lucide-react";
import {
	cancelBuilder,
	finishBuilderManually,
	revalidateAlgorithmPaths,
} from "@/lib/actions/adminProblemBuilderActions";
import { useState, useEffect, useRef } from "react";

interface ProblemBuilderCardProps {
	state: BuilderState;
}

export function ProblemBuilderCard({ state }: ProblemBuilderCardProps) {
	const [isCancelling, setIsCancelling] = useState(false);
	const [isFinishing, setIsFinishing] = useState(false);
	const hasRevalidatedRef = useRef(false);
	const previousPhaseRef = useRef(state.phase);
	const elapsedTime = formatElapsedTime(Date.now() - state.phaseStartTime);

	// Revalidate paths when builder completes (only once per completion)
	useEffect(() => {
		const justCompleted =
			previousPhaseRef.current !== "completed" &&
			state.phase === "completed";

		if (justCompleted && !hasRevalidatedRef.current) {
			hasRevalidatedRef.current = true;
			// Call revalidation in a separate context after state update
			setTimeout(() => {
				revalidateAlgorithmPaths().catch((error) => {
					console.error("Failed to revalidate paths:", error);
				});
			}, 100);
		}

		previousPhaseRef.current = state.phase;
	}, [state.phase]);

	const canCancel =
		state.phase !== "completed" &&
		state.phase !== "failed" &&
		state.phase !== "cancelled" &&
		state.phase !== "idle";

	const canFinish =
		state.phase !== "completed" &&
		state.phase !== "failed" &&
		state.phase !== "cancelled" &&
		state.phase !== "idle" &&
		state.phase !== "generating_problem"; // Only allow after problem data is generated

	const handleCancel = async () => {
		if (!canCancel || isCancelling) return;

		setIsCancelling(true);
		try {
			await cancelBuilder(state.builderId);
		} catch (error) {
			console.error("Failed to cancel builder:", error);
		} finally {
			setIsCancelling(false);
		}
	};

	const handleFinish = async () => {
		if (!canFinish || isFinishing) return;

		if (
			!confirm(
				`Finish and save problem with ${state.testCaseCounts.passed} test cases? (Target was 40)`
			)
		) {
			return;
		}

		setIsFinishing(true);
		try {
			const result = await finishBuilderManually(state.builderId);
			if (!result.success) {
				alert(`Failed to finish: ${result.error}`);
			} else {
				// Revalidate paths after successful manual finish
				// Delay to ensure it's in a separate context
				setTimeout(() => {
					revalidateAlgorithmPaths().catch((error) => {
						console.error("Failed to revalidate paths:", error);
					});
				}, 100);
			}
		} catch (error) {
			console.error("Failed to finish builder:", error);
			alert(
				`Failed to finish: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		} finally {
			setIsFinishing(false);
		}
	};

	const getStatusBadge = () => {
		switch (state.phase) {
			case "idle":
				return <Badge variant="default">Idle</Badge>;
			case "generating_problem":
			case "generating_tests":
			case "validating_tests":
			case "finalizing":
				return <Badge variant="secondary">In Progress</Badge>;
			case "completed":
				return (
					<Badge variant="default" className="bg-green-600">
						Completed
					</Badge>
				);
			case "failed":
				return <Badge variant="destructive">Failed</Badge>;
			case "cancelled":
				return <Badge variant="outline">Cancelled</Badge>;
			default:
				return <Badge variant="default">Unknown</Badge>;
		}
	};

	const getPhaseIcon = () => {
		if (state.phase === "completed") {
			return <CheckCircle2 className="w-5 h-5 text-green-600" />;
		}
		if (state.phase === "failed") {
			return <XCircle className="w-5 h-5 text-destructive" />;
		}
		if (state.phase === "cancelled") {
			return <XCircle className="w-5 h-5 text-muted-foreground" />;
		}
		if (
			state.phase === "generating_problem" ||
			state.phase === "generating_tests" ||
			state.phase === "validating_tests" ||
			state.phase === "finalizing"
		) {
			return <Loader2 className="w-5 h-5 animate-spin" />;
		}
		return null;
	};

	const testCaseProgress = state.testCaseCounts.passed / 40;
	const testCaseProgressPercent = Math.min(testCaseProgress * 100, 100);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						{getPhaseIcon()}
						{state.problemName}
					</CardTitle>
					<div className="flex items-center gap-2">
						{getStatusBadge()}
						{canFinish && (
							<Button
								variant="default"
								size="sm"
								onClick={handleFinish}
								disabled={isFinishing}
								className="h-8 bg-blue-600 hover:bg-blue-700"
							>
								{isFinishing ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Finishing...
									</>
								) : (
									<>
										<CheckCircle2 className="w-4 h-4 mr-2" />
										Finish Now
									</>
								)}
							</Button>
						)}
						{canCancel && (
							<Button
								variant="outline"
								size="sm"
								onClick={handleCancel}
								disabled={isCancelling}
								className="h-8"
							>
								{isCancelling ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Cancelling...
									</>
								) : (
									<>
										<X className="w-4 h-4 mr-2" />
										Cancel
									</>
								)}
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Current Phase */}
				<div className="space-y-1">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">Current Phase</span>
						<span className="text-muted-foreground">
							{elapsedTime}
						</span>
					</div>
					<p className="text-sm text-muted-foreground">
						{state.phaseDescription ||
							getPhaseDescription(state.phase, {
								batchNumber: state.batchNumber,
								passedTests: state.testCaseCounts.passed,
								targetTests: 40,
							})}
					</p>
				</div>

				{/* Test Case Progress */}
				{(state.phase === "generating_tests" ||
					state.phase === "validating_tests" ||
					state.phase === "completed") && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">Test Cases</span>
							<span className="text-muted-foreground">
								{state.testCaseCounts.passed} / 40 passing
							</span>
						</div>
						<Progress value={testCaseProgressPercent} max={100} />
						<div className="flex items-center gap-4 text-xs text-muted-foreground">
							<span>
								Generated: {state.testCaseCounts.generated}
							</span>
							<span>Passed: {state.testCaseCounts.passed}</span>
							{state.testCaseCounts.failed > 0 && (
								<span className="text-destructive">
									Failed: {state.testCaseCounts.failed}
								</span>
							)}
						</div>
					</div>
				)}

				{/* Batch Number */}
				{state.batchNumber && (
					<div className="text-sm text-muted-foreground">
						Working on batch {state.batchNumber}
					</div>
				)}

				{/* Retry Count */}
				{state.retryCount > 0 && (
					<div className="text-sm text-muted-foreground">
						Retry attempt: {state.retryCount}
					</div>
				)}

				{/* Error Display */}
				{state.error && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{state.error}</AlertDescription>
						{state.errorTimestamp && (
							<div className="mt-2 text-xs text-muted-foreground">
								Occurred at:{" "}
								{new Date(
									state.errorTimestamp
								).toLocaleTimeString()}
							</div>
						)}
					</Alert>
				)}

				{/* Completion Time */}
				{state.phase === "completed" && state.completedAt && (
					<div className="text-sm text-muted-foreground">
						Completed at:{" "}
						{new Date(state.completedAt).toLocaleString()}
					</div>
				)}

				{/* Cancellation Time */}
				{state.phase === "cancelled" && state.cancelledAt && (
					<div className="text-sm text-muted-foreground">
						Cancelled at:{" "}
						{new Date(state.cancelledAt).toLocaleString()}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
