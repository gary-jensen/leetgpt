"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateAlgoLessonProgress } from "@/lib/actions/algoProgress";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { trackAlgoLessonCompleted } from "@/lib/analytics";
import { useProgress } from "@/contexts/ProgressContext";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import "@/components/workspace/Chat/components/ChatMarkdownDisplay.css";

interface LessonModalProps {
	lesson: {
		id: string;
		slug: string;
		title: string;
		summary: string;
		topics: string[];
		bodyMd: string;
	};
	children: React.ReactNode;
}

export function LessonModal({ lesson, children }: LessonModalProps) {
	const [open, setOpen] = useState(false);
	const [isMarkingComplete, setIsMarkingComplete] = useState(false);
	const [processedHtml, setProcessedHtml] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState(false);
	const { data: session } = useSession();
	const progress = useProgress();

	const isCompleted =
		progress.getAlgoLessonProgress?.(lesson.id)?.status === "completed";

	// Process markdown when modal opens
	useEffect(() => {
		if (open && lesson.bodyMd) {
			const processContent = async () => {
				setIsProcessing(true);
				try {
					const html = await processMarkdown(lesson.bodyMd, {
						allowInlineHtml: true,
						codeBackgroundInChoices: true,
					});
					setProcessedHtml(html);
				} catch (error) {
					// console.error("Error processing markdown:", error);
					// Fallback to escaped plain text
					setProcessedHtml(
						lesson.bodyMd
							.replace(/</g, "&lt;")
							.replace(/>/g, "&gt;")
							.replace(/\n/g, "<br>")
					);
				} finally {
					setIsProcessing(false);
				}
			};

			processContent();
		}
	}, [open, lesson.bodyMd]);

	const handleMarkComplete = async () => {
		if (!session?.user?.id) {
			toast.error("Please sign in to mark lessons as complete");
			return;
		}

		setIsMarkingComplete(true);
		// Optimistically update local state immediately
		progress.updateAlgoLessonProgressLocal?.(lesson.id, "completed");

		try {
			await updateAlgoLessonProgress(
				session.user.id,
				lesson.id,
				"completed"
			);
			trackAlgoLessonCompleted(lesson.id, lesson.title);
			toast.success("Lesson marked as complete!");
		} catch (error) {
			// console.error("Error marking lesson complete:", error);
			// Revert optimistic update on error
			progress.updateAlgoLessonProgressLocal?.(lesson.id, "in_progress");
			toast.error("Failed to mark lesson as complete");
		} finally {
			setIsMarkingComplete(false);
		}
	};

	return (
		<>
			<div onClick={() => setOpen(true)}>{children}</div>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto">
					<DialogTitle>{lesson.title}</DialogTitle>
					<div className="flex justify-between items-center mb-4">
						<DialogDescription>{lesson.summary}</DialogDescription>
						{isCompleted ? (
							<div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg h-[32px] max-h-[32px] px-3 py-[14.4px] text-sm box-border">
								<CheckCircle2 className="w-4 h-4 text-green-600" />
								<span className="text-green-700">
									Completed
								</span>
							</div>
						) : session?.user?.id ? (
							<Button
								onClick={handleMarkComplete}
								disabled={isMarkingComplete}
								className="!py-4"
								size="xs"
							>
								{isMarkingComplete ? (
									"Marking..."
								) : (
									<>
										<CheckCircle2 className="w-4 h-4 mr-2" />
										Mark as Complete
									</>
								)}
							</Button>
						) : null}
					</div>
					{isProcessing ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-muted-foreground">
								Processing content...
							</div>
						</div>
					) : (
						<div className="chat-markdown-display algo-problem overflow-hidden">
							<div
								className="markdown-content prose prose-sm max-w-none"
								dangerouslySetInnerHTML={{
									__html: processedHtml,
								}}
							/>
						</div>
					)}

					<div className="flex justify-end gap-2 mt-4">
						<Button
							variant="outline"
							onClick={() => setOpen(false)}
						>
							<X className="w-4 h-4 mr-2" />
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
