"use client";

import { AlgoProblemSubmission } from "@/types/algorithm-types";
import { cn } from "@/lib/utils";
import { Clock, Loader2 } from "lucide-react";
import { trackAlgoSubmissionViewed } from "@/lib/analytics";

interface SubmissionsTabProps {
	problemId: string;
	userId: string;
	userLoading: boolean;
	submissions: AlgoProblemSubmission[];
	isLoading: boolean;
	onSubmissionClick?: (submission: AlgoProblemSubmission) => void;
}

export function SubmissionsTab({
	problemId,
	userId,
	userLoading,
	submissions,
	isLoading,
	onSubmissionClick,
}: SubmissionsTabProps) {
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatLanguage = (language: string) => {
		// Capitalize first letter and handle common cases
		if (language.toLowerCase() === "javascript") {
			return "JavaScript";
		}
		if (language.toLowerCase() === "typescript") {
			return "TypeScript";
		}
		return language.charAt(0).toUpperCase() + language.slice(1);
	};

	if (isLoading || userLoading) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!userId) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<p className="text-muted-foreground">
					Please log in to view your submission history.
				</p>
			</div>
		);
	}

	if (submissions.length === 0) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center">
				<p className="text-muted-foreground text-center">
					No submissions yet.
				</p>
				<p className="text-muted-foreground text-center">
					Run your code to see your submission history here.
				</p>
			</div>
		);
	}

	return (
		<div
			className="flex-1 flex flex-col overflow-auto"
			style={{
				scrollbarWidth: "thin",
				scrollbarColor: "#9f9f9f #2C2C2C",
			}}
		>
			{/* Table Header */}
			<div className="border-b border-border">
				<div className="grid grid-cols-[1fr_120px_120px_140px] gap-4 px-4 py-3 text-sm font-medium text-muted-foreground">
					<div>Status</div>
					<div>Language</div>
					<div>Runtime</div>
					<div>Date</div>
				</div>
			</div>

			{/* Table Rows */}
			<div className="flex-1">
				{submissions.map((submission, index) => {
					console.log(submission);
					return (
						<div
							key={submission.id}
							onClick={() => {
								trackAlgoSubmissionViewed(
									problemId,
									submission.id,
									submission.passed ? "passed" : "failed",
									submission.submittedAt,
									true // isOwnSubmission
								);
								onSubmissionClick?.(submission);
							}}
							className="border-b border-border hover:bg-white/5 transition-colors cursor-pointer"
						>
							<div className="grid grid-cols-[1fr_120px_120px_140px] gap-4 px-4 py-3 text-sm">
								{/* Status */}
								<div>
									<span
										className={cn(
											"font-medium",
											submission.passed
												? "text-emerald-400"
												: "text-[#ef4743]"
										)}
									>
										{submission.passed
											? "Accepted"
											: "Wrong Answer"}
									</span>
								</div>

								{/* Language */}
								<div>
									<span className="bg-white/10 px-2 py-0.5 rounded text-xs">
										{formatLanguage(submission.language)}
									</span>
								</div>

								{/* Runtime */}
								<div className="flex items-center gap-1.5">
									{submission.passed &&
									submission.runtime != null ? (
										<>
											<Clock className="w-3.5 h-3.5 text-muted-foreground" />
											<span>{submission.runtime} ms</span>
										</>
									) : (
										<span className="text-muted-foreground">
											N/A
										</span>
									)}
								</div>

								{/* Date */}
								<div className="text-muted-foreground">
									{formatDate(submission.submittedAt)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
