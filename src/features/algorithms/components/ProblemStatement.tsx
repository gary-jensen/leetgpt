import { AlgoProblemDetail, AlgoLesson } from "@/types/algorithm-types";
import "./ProblemStatement.css";
import { TopicsDropdown } from "./TopicsDropdown";
import { TagIcon, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RelatedLessonsModal } from "./RelatedLessonsModal";

interface ProblemStatementProps {
	problem: AlgoProblemDetail;
	processedStatement: string;
	topics: string[];
	relatedLessons: AlgoLesson[];
}

export function ProblemStatement({
	problem,
	processedStatement,
	topics,
	relatedLessons,
}: ProblemStatementProps) {
	const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
	return (
		<div className="bg-background flex flex-col rounded-2xl border-[#2f2f2f] border-1 overflow-hidden h-full min-h-full">
			<div className="flex items-center justify-between p-4 pb-2 border-b border-border">
				<h2 className="text-2xl font-bold flex items-center gap-4">
					{problem.title}
					<span
						className={cn(
							"text-sm bg-white/15 px-1.5 py-0.5 rounded-sm font-normal font-dm-sans",
							problem.difficulty === "easy"
								? "text-emerald-400"
								: problem.difficulty === "medium"
								? " text-yellow-400"
								: " text-red-500"
						)}
					>
						{problem.difficulty}
					</span>
					<span className="text-sm bg-white/15 px-1.5 py-0.5 rounded-sm font-normal font-dm-sans flex items-center gap-1">
						<TagIcon size={14} />
						Topics
					</span>
				</h2>
				{relatedLessons.length > 0 && (
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsLessonsModalOpen(true)}
						className="flex items-center gap-2"
					>
						<BookOpen className="w-4 h-4" />
						Related Lessons
					</Button>
				)}
			</div>
			<RelatedLessonsModal
				lessons={relatedLessons}
				open={isLessonsModalOpen}
				onOpenChange={setIsLessonsModalOpen}
			/>
			<div
				className="flex-1 overflow-auto p-4 dark-scrollbar"
				style={{
					scrollbarWidth: "thin",
					scrollbarColor: "#9f9f9f #2C2C2C",
				}}
			>
				<div className="chat-markdown-display problem-statement">
					<div
						className="markdown-content"
						dangerouslySetInnerHTML={{
							__html: processedStatement,
						}}
					/>
				</div>

				<TopicsDropdown
					topics={topics}
					relatedLessons={relatedLessons}
				/>
			</div>
		</div>
	);
}
