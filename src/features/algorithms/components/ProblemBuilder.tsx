"use client";

import { useState, useEffect, useRef } from "react";
import { ProblemBuilderForm } from "./ProblemBuilderForm";
import { ProblemBuilderCard } from "./ProblemBuilderCard";
import { useProblemBuilder } from "../hooks/useProblemBuilder";
import { CodeExecutor } from "@/lib/execution/codeExecutor";
import { generateUUID } from "@/lib/cryptoUtils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

interface QueueItem {
	builderId: string;
	problemName: string;
	status: "pending" | "building" | "completed" | "failed" | "cancelled";
}

const MAX_CONCURRENT = 5;

export function ProblemBuilder() {
	const [queue, setQueue] = useState<QueueItem[]>([]);

	const handleAddToQueue = (problemNames: string[]) => {
		const newItems: QueueItem[] = problemNames.map((problemName) => ({
			builderId: generateUUID(),
			problemName,
			status: "pending" as const,
		}));

		setQueue((prev) => {
			const updated = [...prev, ...newItems];
			// Auto-start pending items up to MAX_CONCURRENT
			const buildingCount = updated.filter(
				(i) => i.status === "building"
			).length;
			const pendingItems = updated.filter((i) => i.status === "pending");
			const toStart = Math.min(
				MAX_CONCURRENT - buildingCount,
				pendingItems.length
			);

			return updated.map((item) => {
				if (item.status === "pending" && toStart > 0) {
					const index = pendingItems.indexOf(item);
					if (index < toStart) {
						return { ...item, status: "building" as const };
					}
				}
				return item;
			});
		});
	};

	const handleBuilderStateChange = (
		builderId: string,
		phase: string,
		error?: string
	) => {
		setQueue((prev) => {
			const updated: QueueItem[] = prev.map((item) => {
				if (item.builderId !== builderId) return item;

				// Map hook phases to queue statuses
				if (phase === "completed") {
					return { ...item, status: "completed" as const };
				}
				if (phase === "failed") {
					return { ...item, status: "failed" as const };
				}
				if (phase === "cancelled") {
					return { ...item, status: "cancelled" as const };
				}
				return item;
			});

			// When a builder completes/fails/cancels, start the next pending one
			if (
				phase === "completed" ||
				phase === "failed" ||
				phase === "cancelled"
			) {
				const buildingCount = updated.filter(
					(i) => i.status === "building"
				).length;
				const pendingItems = updated.filter(
					(i) => i.status === "pending"
				);
				const toStart = Math.min(
					MAX_CONCURRENT - buildingCount,
					pendingItems.length
				);

				return updated.map((item): QueueItem => {
					if (item.status === "pending" && toStart > 0) {
						const index = pendingItems.indexOf(item);
						if (index < toStart) {
							return { ...item, status: "building" as const };
						}
					}
					return item;
				});
			}

			return updated;
		});
	};

	const pendingCount = queue.filter(
		(item) => item.status === "pending"
	).length;
	const buildingCount = queue.filter(
		(item) => item.status === "building"
	).length;
	const completedCount = queue.filter(
		(item) => item.status === "completed"
	).length;
	const failedCount = queue.filter((item) => item.status === "failed").length;

	return (
		<div className="space-y-6">
			<ProblemBuilderForm onAddToQueue={handleAddToQueue} />

			{/* Queue Stats */}
			{queue.length > 0 && (
				<div className="flex items-center gap-4 flex-wrap">
					<Badge variant="secondary">Total: {queue.length}</Badge>
					{pendingCount > 0 && (
						<Badge variant="outline">
							<Clock className="w-3 h-3 mr-1" />
							Pending: {pendingCount}
						</Badge>
					)}
					{buildingCount > 0 && (
						<Badge variant="default">
							<Loader2 className="w-3 h-3 mr-1 animate-spin" />
							Building: {buildingCount}
						</Badge>
					)}
					{completedCount > 0 && (
						<Badge variant="default" className="bg-green-600">
							<CheckCircle2 className="w-3 h-3 mr-1" />
							Completed: {completedCount}
						</Badge>
					)}
					{failedCount > 0 && (
						<Badge variant="destructive">
							<XCircle className="w-3 h-3 mr-1" />
							Failed: {failedCount}
						</Badge>
					)}
				</div>
			)}

			{/* Queue Items */}
			{queue.length > 0 && (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold">
						Queue ({queue.length})
					</h3>
					<div className="space-y-4">
						{queue.map((item, index) => {
							// Only render the hook for items that are building or have finished
							// Pending items are shown as simple cards
							if (item.status === "pending") {
								return (
									<div
										key={`${item.builderId}-${index}`}
										className="p-4 border rounded-lg bg-muted/50"
									>
										<div className="flex items-center justify-between">
											<div>
												<div className="font-medium">
													{item.problemName}
												</div>
												<div className="text-sm text-muted-foreground">
													Waiting in queue...
												</div>
											</div>
											<Badge variant="outline">
												<Clock className="w-3 h-3 mr-1" />
												Pending
											</Badge>
										</div>
									</div>
								);
							}

							return (
								<BuilderCardWrapper
									key={`${item.builderId}-${index}`}
									builderId={item.builderId}
									problemName={item.problemName}
									status={item.status}
									onStateChange={handleBuilderStateChange}
								/>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

function BuilderCardWrapper({
	builderId,
	problemName,
	status,
	onStateChange,
}: {
	builderId: string;
	problemName: string;
	status: QueueItem["status"];
	onStateChange: (builderId: string, phase: string, error?: string) => void;
}) {
	// Create hidden iframe for CodeExecutor
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
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

	const { state, cancel, finishManually } = useProblemBuilder(
		builderId,
		problemName,
		codeExecutorRef.current || undefined
	);

	// Update parent when state changes
	useEffect(() => {
		// Always notify parent of phase changes
		onStateChange(builderId, state.phase, state.error);
	}, [state.phase, state.error, builderId, onStateChange]);

	return (
		<>
			{/* Hidden iframe for CodeExecutor */}
			<iframe
				ref={iframeRef}
				style={{
					position: "absolute",
					width: "1px",
					height: "1px",
					border: "none",
					pointerEvents: "none",
					opacity: 0,
				}}
				title="CodeExecutor iframe"
			/>
		<ProblemBuilderCard
			state={state}
			onCancel={cancel}
			onFinishManually={finishManually}
		/>
		</>
	);
}
