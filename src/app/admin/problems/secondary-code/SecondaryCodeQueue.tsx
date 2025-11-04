"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	getProblemsNeedingSecondaryCode,
	generateSecondaryPassingCode,
	saveSecondaryPassingCode,
	ProblemQueueItem,
} from "@/lib/actions/adminSecondaryCodeActions";
import { Progress } from "@/components/ui/progress";

interface QueueItem extends ProblemQueueItem {
	status: "pending" | "processing" | "completed" | "error";
	error?: string;
}

const QUEUE_STORAGE_KEY = "secondaryCodeQueue";

export function SecondaryCodeQueue() {
	const [queue, setQueue] = useState<QueueItem[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isInitialized, setIsInitialized] = useState(false);
	const currentIndexRef = useRef(0);
	const isProcessingRef = useRef(false);

	// Keep refs in sync with state
	useEffect(() => {
		currentIndexRef.current = currentIndex;
	}, [currentIndex]);

	useEffect(() => {
		isProcessingRef.current = isProcessing;
	}, [isProcessing]);

	// Load queue from localStorage on mount
	useEffect(() => {
		const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
		const savedIndex = localStorage.getItem(`${QUEUE_STORAGE_KEY}_index`);

		if (savedQueue) {
			try {
				const parsed = JSON.parse(savedQueue);
				setQueue(parsed);
				if (savedIndex) {
					setCurrentIndex(parseInt(savedIndex, 10));
				}
			} catch (error) {
				console.error("Error loading saved queue:", error);
			}
		}
		setIsInitialized(true);
	}, []);

	// Save queue to localStorage whenever it changes
	useEffect(() => {
		if (isInitialized && queue.length > 0) {
			localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
			localStorage.setItem(
				`${QUEUE_STORAGE_KEY}_index`,
				currentIndex.toString()
			);
		}
	}, [queue, currentIndex, isInitialized]);

	const loadProblems = useCallback(async () => {
		const problems = await getProblemsNeedingSecondaryCode();
		console.log("Loaded problems:", problems.length, problems);

		const queueItems: QueueItem[] = problems.map((p) => ({
			...p,
			status: p.hasSecondaryCode ? "completed" : "pending",
		}));

		console.log(
			"Queue items:",
			queueItems.map((q) => ({
				id: q.id,
				title: q.title,
				status: q.status,
			}))
		);

		// Merge with existing queue to preserve status
		setQueue((prevQueue) => {
			const merged = queueItems.map((item) => {
				const existing = prevQueue.find((p) => p.id === item.id);
				if (existing && existing.status !== "pending") {
					return existing;
				}
				return item;
			});
			console.log(
				"Merged queue:",
				merged.length,
				merged.map((q) => ({
					id: q.id,
					title: q.title,
					status: q.status,
				}))
			);
			return merged;
		});

		// Find first pending item and update both state and ref
		setQueue((prevQueue) => {
			const firstPendingIndex = prevQueue.findIndex(
				(item) => item.status === "pending"
			);
			console.log("First pending index:", firstPendingIndex);
			if (firstPendingIndex !== -1) {
				setCurrentIndex(firstPendingIndex);
				currentIndexRef.current = firstPendingIndex;
			}
			return prevQueue;
		});
	}, []);

	useEffect(() => {
		if (isInitialized && queue.length === 0) {
			loadProblems();
		}
	}, [isInitialized, queue.length, loadProblems]);

	const processNext = useCallback(async () => {
		// Check processing state using ref to avoid race conditions
		console.log(
			"processNext called, isProcessingRef.current:",
			isProcessingRef.current,
			"isProcessing state:",
			isProcessing
		);
		if (isProcessingRef.current) {
			console.log("Already processing, skipping (ref check)");
			return;
		}

		// Set processing to true atomically
		console.log("Setting processing to true");
		setIsProcessing(true);
		isProcessingRef.current = true;

		console.log("processNext starting");

		// Get current index from ref
		const idx = currentIndexRef.current;
		console.log("Processing item at index:", idx);

		// Get the current item and process it entirely within setQueue callback
		setQueue((prevQueue) => {
			const currentItem = prevQueue[idx];
			console.log(
				"Current item in callback:",
				currentItem
					? {
							id: currentItem.id,
							title: currentItem.title,
							status: currentItem.status,
					  }
					: "not found",
				"Queue length:",
				prevQueue.length
			);

			if (!currentItem || currentItem.status !== "pending") {
				console.log("Item not valid or not pending, finding next");
				// Find next pending item
				const nextPendingIndex = prevQueue.findIndex(
					(item, i) => i > idx && item.status === "pending"
				);

				if (nextPendingIndex !== -1) {
					setTimeout(() => {
						setCurrentIndex(nextPendingIndex);
						currentIndexRef.current = nextPendingIndex;
						setIsProcessing(false);
						isProcessingRef.current = false;
						setTimeout(() => processNext(), 100);
					}, 0);
				} else {
					setIsProcessing(false);
					isProcessingRef.current = false;
				}
				return prevQueue;
			}

			// Item is valid and pending - process it
			const problemId = currentItem.id;
			console.log(
				"Found valid pending item, processing:",
				problemId,
				currentItem.title
			);

			// Update status to processing
			const updated = prevQueue.map((q, i) =>
				i === idx
					? {
							...q,
							status: "processing" as const,
							error: undefined,
					  }
					: q
			);

			// Start async processing - defer to next tick to avoid setState during render
			setTimeout(() => {
				(async () => {
					try {
						console.log(
							"Calling generateSecondaryPassingCode for:",
							problemId
						);
						const result = await generateSecondaryPassingCode(
							problemId
						);
						console.log(
							"Generation result:",
							result.success ? "success" : "failed",
							result.error
						);

						if (!result.success) {
							setQueue((prev) =>
								prev.map((q) =>
									q.id === problemId
										? {
												...q,
												status: "error" as const,
												error:
													result.error ||
													"Failed to generate secondary code",
										  }
										: q
								)
							);
							setIsProcessing(false);
							isProcessingRef.current = false;
							return;
						}

						if (!result.secondaryCode) {
							setQueue((prev) =>
								prev.map((q) =>
									q.id === problemId
										? {
												...q,
												status: "error" as const,
												error: "No secondary code generated",
										  }
										: q
								)
							);
							setIsProcessing(false);
							isProcessingRef.current = false;
							return;
						}

						const saveResult = await saveSecondaryPassingCode(
							problemId,
							result.secondaryCode
						);

						if (!saveResult.success) {
							setQueue((prev) =>
								prev.map((q) =>
									q.id === problemId
										? {
												...q,
												status: "error" as const,
												error:
													saveResult.error ||
													"Failed to save secondary code",
										  }
										: q
								)
							);
							setIsProcessing(false);
							isProcessingRef.current = false;
							return;
						}

						// Mark as completed
						setQueue((prev) => {
							const completed = prev.map((q) =>
								q.id === problemId
									? {
											...q,
											status: "completed" as const,
											hasSecondaryCode: true,
									  }
									: q
							);

							// Find next pending item
							const currentIdx = currentIndexRef.current;
							const nextPendingIndex = completed.findIndex(
								(q, i) =>
									i > currentIdx && q.status === "pending"
							);

							if (nextPendingIndex !== -1) {
								setTimeout(() => {
									setCurrentIndex(nextPendingIndex);
									currentIndexRef.current = nextPendingIndex;
									setIsProcessing(false);
									isProcessingRef.current = false;
									setTimeout(() => processNext(), 100);
								}, 500);
							} else {
								setIsProcessing(false);
								isProcessingRef.current = false;
							}

							return completed;
						});
					} catch (error) {
						console.error("Error processing:", error);
						setQueue((prev) =>
							prev.map((q) =>
								q.id === problemId
									? {
											...q,
											status: "error" as const,
											error:
												error instanceof Error
													? error.message
													: "Unknown error",
									  }
									: q
							)
						);
						setIsProcessing(false);
						isProcessingRef.current = false;
					}
				})();
			}, 0);

			return updated;
		});
	}, []);

	const handleStart = async () => {
		console.log(
			"handleStart called, queue length:",
			queue.length,
			"isProcessing:",
			isProcessing
		);
		if (queue.length === 0) {
			console.log("Queue empty, loading problems");
			await loadProblems();
			// After loading, try to start processing
			setTimeout(() => {
				console.log("After loading, starting processNext");
				processNext();
			}, 500);
			return;
		}
		console.log("Starting processing");
		processNext();
	};

	const handleReset = () => {
		localStorage.removeItem(QUEUE_STORAGE_KEY);
		localStorage.removeItem(`${QUEUE_STORAGE_KEY}_index`);
		setQueue([]);
		setCurrentIndex(0);
		currentIndexRef.current = 0;
		setIsProcessing(false);
		isProcessingRef.current = false;
		loadProblems();
	};

	const handleRetry = (problemId: string) => {
		setQueue((prev) => {
			const updated = prev.map((item) =>
				item.id === problemId
					? { ...item, status: "pending" as const, error: undefined }
					: item
			);
			// Find the index and set it
			const index = updated.findIndex((item) => item.id === problemId);
			if (index !== -1 && !isProcessing) {
				// Use setTimeout to avoid setState during render
				setTimeout(() => {
					setCurrentIndex(index);
					currentIndexRef.current = index;
					setTimeout(() => processNext(), 100);
				}, 0);
			}
			return updated;
		});
	};

	const pendingCount = queue.filter(
		(item) => item.status === "pending"
	).length;
	const completedCount = queue.filter(
		(item) => item.status === "completed"
	).length;
	const errorCount = queue.filter((item) => item.status === "error").length;
	const processingCount = queue.filter(
		(item) => item.status === "processing"
	).length;
	const totalCount = queue.length;
	const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold">
						Generate Secondary Passing Code
					</h2>
					<p className="text-muted-foreground mt-1">
						Generate non-optimal but passing solutions for test case
						validation
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={handleStart}
						disabled={isProcessing || pendingCount === 0}
					>
						{isProcessing ? "Processing..." : "Start Processing"}
					</Button>
					<Button variant="outline" onClick={loadProblems}>
						Refresh Queue
					</Button>
					<Button variant="outline" onClick={handleReset}>
						Reset Queue
					</Button>
				</div>
			</div>

			{totalCount > 0 && (
				<div className="border rounded-lg p-4 bg-muted/50">
					<div className="grid grid-cols-4 gap-4 mb-4">
						<div>
							<div className="text-sm text-muted-foreground">
								Total
							</div>
							<div className="text-2xl font-bold">
								{totalCount}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">
								Pending
							</div>
							<div className="text-2xl font-bold text-yellow-600">
								{pendingCount}
							</div>
						</div>
						<div>
							<div className="text-sm text-muted-foreground">
								Completed
							</div>
							<div className="text-2xl font-bold text-green-600">
								{completedCount}
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
					</div>
					<Progress value={progress} className="h-2" />
					<div className="text-sm text-muted-foreground mt-2">
						{completedCount} / {totalCount} completed (
						{Math.round(progress)}%)
					</div>
				</div>
			)}

			{queue.length > 0 && (
				<div className="border rounded-lg">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Status</TableHead>
								<TableHead>Problem</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{queue.map((item, index) => (
								<TableRow
									key={item.id}
									className={
										index === currentIndex && isProcessing
											? "bg-muted"
											: ""
									}
								>
									<TableCell>
										<Badge
											variant={
												item.status === "completed"
													? "default"
													: item.status === "error"
													? "destructive"
													: item.status ===
													  "processing"
													? "secondary"
													: "outline"
											}
										>
											{item.status === "processing"
												? "Processing..."
												: item.status === "completed"
												? "Completed"
												: item.status === "error"
												? "Error"
												: "Pending"}
										</Badge>
									</TableCell>
									<TableCell className="font-medium">
										{item.title}
									</TableCell>
									<TableCell>
										<span className="text-xs text-muted-foreground">
											{item.slug}
										</span>
									</TableCell>
									<TableCell>
										{item.status === "error" && (
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													handleRetry(item.id)
												}
												disabled={isProcessing}
											>
												Retry
											</Button>
										)}
										{item.status === "error" &&
											item.error && (
												<span className="text-xs text-red-600 ml-2">
													{item.error}
												</span>
											)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			{queue.length === 0 && isInitialized && (
				<div className="text-center py-8 text-muted-foreground">
					No problems found. Click &quot;Refresh Queue&quot; to load
					problems.
				</div>
			)}
		</div>
	);
}
