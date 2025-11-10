"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { submitProblemFeedback } from "@/lib/actions/feedback";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeedbackDialogProps {
	problemId: string;
	problemTitle: string;
	children: React.ReactNode;
}

const ISSUE_OPTIONS = [
	"Description or examples are unclear or incorrect",
	"Difficulty is inaccurate",
	"Testcases are missing or incorrect",
	"Runtime is too strict",
	"Edge cases are too frustrating to solve",
	"Other",
];

export function FeedbackDialog({
	problemId,
	problemTitle,
	children,
}: FeedbackDialogProps) {
	const [open, setOpen] = useState(false);
	const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
	const [additionalFeedback, setAdditionalFeedback] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { data: session } = useSession();

	const handleIssueToggle = (issue: string) => {
		setSelectedIssues((prev) =>
			prev.includes(issue)
				? prev.filter((i) => i !== issue)
				: [...prev, issue]
		);
	};

	const handleSubmit = async () => {
		if (!session?.user?.id) {
			toast.error("You must be logged in to submit feedback");
			return;
		}

		if (selectedIssues.length === 0) {
			toast.error("Please select at least one issue");
			return;
		}

		setIsSubmitting(true);
		try {
			const result = await submitProblemFeedback(
				problemId,
				selectedIssues,
				additionalFeedback.trim() || undefined
			);

			if (result.success) {
				toast.success("Thank you for your feedback!");
				// Reset form
				setSelectedIssues([]);
				setAdditionalFeedback("");
				setOpen(false);
			} else {
				toast.error(result.error || "Failed to submit feedback");
			}
		} catch (error) {
			console.error("Error submitting feedback:", error);
			toast.error("Failed to submit feedback. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			// Reset form when closing
			setSelectedIssues([]);
			setAdditionalFeedback("");
		}
		setOpen(newOpen);
	};

	if (!session?.user?.id) {
		// Don't show feedback option if not logged in
		return null;
	}

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<div onClick={() => setOpen(true)}>{children}</div>
				</TooltipTrigger>
				<TooltipContent>
					<p>Feedback</p>
				</TooltipContent>
			</Tooltip>
			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Feedback</DialogTitle>
					</DialogHeader>

					<div className="space-y-6 py-4">
						{/* Problem Name */}
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								Problem:
							</Label>
							<p className="mt-1 text-sm font-semibold">
								{problemTitle}
							</p>
						</div>

						{/* Issues Section */}
						<div>
							<Label className="text-sm font-medium text-muted-foreground">
								<span className="text-red-600/70">*</span>{" "}
								Issues Encountered:
							</Label>
							<div className="mt-3 space-y-3 max-h-[200px] overflow-y-auto">
								{ISSUE_OPTIONS.map((issue) => (
									<label
										key={issue}
										className="flex items-start gap-3 cursor-pointer group"
									>
										<Checkbox
											checked={selectedIssues.includes(
												issue
											)}
											onCheckedChange={() =>
												handleIssueToggle(issue)
											}
											className="mt-0.5"
										/>
										<span className="text-sm text-foreground group-hover:text-foreground/90">
											{issue}
										</span>
									</label>
								))}
							</div>
						</div>

						{/* Additional Feedback */}
						<div>
							<Label
								htmlFor="additional-feedback"
								className="text-sm font-medium"
							>
								Additional Feedback:
							</Label>
							<Textarea
								id="additional-feedback"
								value={additionalFeedback}
								onChange={(e) =>
									setAdditionalFeedback(e.target.value)
								}
								placeholder="Please provide any additional details..."
								className="mt-2 min-h-[100px] resize-none"
								disabled={isSubmitting}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={
								isSubmitting || selectedIssues.length === 0
							}
							className="bg-green-600 hover:bg-green-700 text-white"
						>
							{isSubmitting ? "Submitting..." : "Submit"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
