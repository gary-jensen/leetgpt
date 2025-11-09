"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen, Check, TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProgress } from "@/contexts/ProgressContext";
import { LessonModal } from "./LessonModal";
import { AlgoLesson } from "@/types/algorithm-types";
import { trackAlgoRelatedLessonClicked } from "@/lib/analytics";

interface TopicsDropdownProps {
	topics: string[];
	relatedLessons: AlgoLesson[];
	problemId?: string;
}

export function TopicsDropdown({
	topics,
	relatedLessons,
	problemId,
}: TopicsDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const progress = useProgress();

	const getLessonStatus = (lessonId: string) => {
		if (!progress.getAlgoLessonProgress) return "not_started";
		const lessonProgress = progress.getAlgoLessonProgress(lessonId);
		return lessonProgress?.status || "not_started";
	};

	return (
		<div className=" pt-4 mt-4 border-t-1 border-white/20">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CollapsibleTrigger className="flex w-full justify-between items-center hover:bg-white/10 p-2 rounded-md">
					{/* <Button className="w-full justify-between"> */}
					<span className="font-dm-sans flex gap-3 justify-center items-center">
						<TagIcon size={16} />
						Show Topics
					</span>
					{isOpen ? (
						<ChevronUp className="w-4 h-4" />
					) : (
						<ChevronDown className="w-4 h-4" />
					)}
					{/* </Button> */}
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="mft-2 px-2 py-2 bofrder rounded-lg bg-background space-y-4 font-dm-sans">
						<div>
							<h4 className="text-sm font-semibold mb-2">
								Topics:
							</h4>
							<div className="flex flex-wrap gap-2">
								{topics.map((topic) => (
									<Badge key={topic} variant="secondary">
										{topic}
									</Badge>
								))}
							</div>
						</div>

						{relatedLessons.length > 0 && (
							<div>
								<h4 className="text-sm font-semibold mb-2">
									Related lessons:
								</h4>
								<div className="space-y-2">
									{relatedLessons.map((lesson) => {
										const status = getLessonStatus(
											lesson.id
										);
										const isCompleted =
											status === "completed";

										return (
											<div
												key={lesson.id}
												className="flex items-center justify-between p-2 border rounded hover:bg-muted transition-colors"
											>
												<div className="flex items-center gap-2">
													<BookOpen className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm">
														{lesson.title}
													</span>
													{isCompleted && (
														<Check className="w-4 h-4 text-green-600" />
													)}
												</div>
												<LessonModal
													lesson={lesson}
													onOpen={() => {
														if (problemId) {
															trackAlgoRelatedLessonClicked(
																problemId,
																lesson.id
															);
														}
													}}
												>
													<Button
														size="sm"
														variant="outline"
													>
														{isCompleted
															? "Review"
															: "Open Lesson"}
													</Button>
												</LessonModal>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
