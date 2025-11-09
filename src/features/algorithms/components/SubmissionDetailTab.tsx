"use client";

import { AlgoProblemSubmission } from "@/types/algorithm-types";
import { cn } from "@/lib/utils";
import { Clock, Copy, FileCode } from "lucide-react";
import EditorWrapper from "@/components/workspace/Editor/components/EditorWrapper";
import { Button } from "@/components/ui/button";
import {
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useState } from "react";
import { toast } from "sonner";
import {
	trackAlgoSubmissionCopiedToClipboard,
	trackAlgoSubmissionCopiedToEditor,
} from "@/lib/analytics";

interface SubmissionDetailTabProps {
	submission: AlgoProblemSubmission;
	onCopyToEditor?: (code: string) => void;
}

export function SubmissionDetailTab({
	submission,
	onCopyToEditor,
}: SubmissionDetailTabProps) {
	const [copied, setCopied] = useState(false);

	// Unescape HTML entities in code (code is escaped when saved to database)
	// Note: Unescape &amp; last to avoid double-unescaping issues
	const unescapeHtml = (text: string): string => {
		return text
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'")
			.replace(/&amp;/g, "&");
	};

	const unescapedCode = unescapeHtml(submission.code);

	const handleCopyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(unescapedCode);
			setCopied(true);
			toast.success("Code copied to clipboard");
			trackAlgoSubmissionCopiedToClipboard(
				submission.problemId,
				submission.id,
				submission.passed ? "passed" : "failed"
			);
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			toast.error("Failed to copy to clipboard");
		}
	};

	const handleCopyToEditor = () => {
		if (onCopyToEditor) {
			onCopyToEditor(unescapedCode);
			toast.success("Code copied to editor");
			trackAlgoSubmissionCopiedToEditor(
				submission.problemId,
				submission.id,
				submission.passed ? "passed" : "failed"
			);
		}
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	const formatLanguage = (language: string) => {
		if (language.toLowerCase() === "javascript") {
			return "JavaScript";
		}
		if (language.toLowerCase() === "typescript") {
			return "TypeScript";
		}
		return language.charAt(0).toUpperCase() + language.slice(1);
	};

	return (
		<div
			className="flex-1 flex flex-col overflow-auto"
			style={{
				scrollbarWidth: "thin",
				scrollbarColor: "#9f9f9f #2C2C2C",
			}}
		>
			{/* Header Info */}
			<div className="border-b border-border p-4 space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span
							className={cn(
								"text-lg font-medium",
								submission.passed
									? "text-emerald-400"
									: "text-[#ef4743]"
							)}
						>
							{submission.passed ? "Accepted" : "Wrong Answer"}
						</span>
						<span className="bg-white/10 px-2 py-0.5 rounded text-sm">
							{formatLanguage(submission.language)}
						</span>
					</div>
					<div className="text-sm text-muted-foreground">
						{formatDate(submission.submittedAt)}
					</div>
				</div>

				{/* Stats */}
				<div className="flex items-center gap-6 text-sm">
					<div className="flex items-center gap-2">
						<Clock className="w-4 h-4 text-muted-foreground" />
						<span className="text-muted-foreground">Runtime:</span>
						<span>
							{submission.passed && submission.runtime
								? `${submission.runtime} ms`
								: "N/A"}
						</span>
					</div>
					<div>
						<span className="text-muted-foreground">
							Test Cases:{" "}
						</span>
						<span
							className={cn(
								"font-medium",
								submission.passed
									? "text-emerald-400"
									: "text-[#ef4743]"
							)}
						>
							{submission.testsPassed}/{submission.testsTotal}
						</span>
					</div>
				</div>
			</div>

			{/* Code Section */}
			<div className="flex-1 flex flex-col overflow-hidden relative">
				<div className="flex-1 overflow-hidden">
					<EditorWrapper
						code={unescapedCode}
						setCode={() => {}} // No-op since read-only
						defaultLanguage={
							submission.language.toLowerCase() === "typescript"
								? "typescript"
								: "javascript"
						}
						readOnly={true}
						focusOnLoad={false}
						className="w-full h-full"
					/>
				</div>
				{/* Floating buttons */}
				<TooltipProvider delayDuration={300}>
					<div className="absolute top-3 right-5 flex gap-2 z-10">
						<TooltipPrimitive.Root>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									onClick={handleCopyToClipboard}
									className="h-7 w-7 p-0 bg-background/95 backdrop-blur-sm border-border/50 shadow-lg"
								>
									<Copy className="w-3.5 h-3.5" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									{copied ? "Copied!" : "Copy to clipboard"}
								</p>
							</TooltipContent>
						</TooltipPrimitive.Root>
						{onCopyToEditor && (
							<TooltipPrimitive.Root>
								<TooltipTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										onClick={handleCopyToEditor}
										className="h-7 w-7 p-0 bg-background/95 backdrop-blur-sm border-border/50 shadow-lg"
									>
										<FileCode className="w-3.5 h-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Copy to editor</p>
								</TooltipContent>
							</TooltipPrimitive.Root>
						)}
					</div>
				</TooltipProvider>
			</div>
		</div>
	);
}
