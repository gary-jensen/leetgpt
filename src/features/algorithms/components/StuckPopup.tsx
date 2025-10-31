"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonModal } from "./LessonModal";
import { AlgoLesson } from "@/types/algorithm-types";

interface StuckPopupProps {
	consecutiveFailures: number;
	relatedLessons: AlgoLesson[];
}

export function StuckPopup({
	consecutiveFailures,
	relatedLessons,
}: StuckPopupProps) {
	const [isDismissed, setIsDismissed] = useState(false);

	// Show popup after 2-3 failures
	const shouldShow =
		consecutiveFailures >= 2 &&
		consecutiveFailures <= 3 &&
		!isDismissed &&
		relatedLessons.length > 0;

	if (!shouldShow) return null;

	return (
		<div className="fixed bottom-4 right-4 w-80 bg-muted border border-border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-4">
			<div className="flex items-start gap-3">
				<div className="flex-shrink-0 mt-1">
					<Lightbulb className="w-5 h-5 text-yellow-600" />
				</div>
				<div className="flex-1 space-y-2">
					<h4 className="font-semibold text-sm">Need help?</h4>
					<p className="text-sm text-muted-foreground">
						You&apos;ve failed the last {consecutiveFailures} test
						runs. Review these lessons:
					</p>
					<div className="space-y-2">
						{relatedLessons.map((lesson) => (
							<LessonModal key={lesson.id} lesson={lesson}>
								<Button
									size="sm"
									variant="outline"
									className="w-full justify-start"
								>
									<span className="truncate">
										{lesson.title}
									</span>
								</Button>
							</LessonModal>
						))}
					</div>
					<div className="flex gap-2 pt-2">
						<Button
							size="sm"
							variant="ghost"
							className="flex-1"
							onClick={() => setIsDismissed(true)}
						>
							Continue without help
						</Button>
					</div>
				</div>
				<Button
					size="sm"
					variant="ghost"
					className="h-6 w-6 p-0"
					onClick={() => setIsDismissed(true)}
				>
					<X className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
