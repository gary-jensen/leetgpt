"use client";

import { useEffect } from "react";
import { trackAlgoLessonViewed } from "@/lib/analytics";

interface LessonTrackerProps {
	lessonId: string;
	lessonTitle: string;
}

export function LessonTracker({ lessonId, lessonTitle }: LessonTrackerProps) {
	useEffect(() => {
		trackAlgoLessonViewed(lessonId, lessonTitle);
	}, [lessonId, lessonTitle]);

	return null;
}
