"use client";

import { useState, useEffect, useRef } from "react";
import { useProgress } from "../../contexts/ProgressContext";
import WorkspaceContent from "./WorkspaceContent";
import { mockLessons as lessons } from "./mock-lessons";

const Workspace = () => {
	const { progress, isProgressLoading } = useProgress();
	const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
	const [isInitialized, setIsInitialized] = useState(false);
	const lastProcessedLessons = useRef<string[]>([]);

	// Initialize lesson based on progress
	useEffect(() => {
		if (!isProgressLoading) {
			// Check if progress has changed (for migration case)
			const lessonsChanged =
				JSON.stringify(lastProcessedLessons.current) !==
				JSON.stringify(progress.completedLessons);

			// Initialize on first load, or recalculate if progress changed after init
			if (!isInitialized || (isInitialized && lessonsChanged)) {
				lastProcessedLessons.current = [...progress.completedLessons];

				// Find the first lesson that hasn't been completed
				const firstIncompleteIndex = lessons.findIndex(
					(lesson) => !progress.completedLessons.includes(lesson.id)
				);

				// If all lessons are completed, stay on last lesson
				// Otherwise, go to first incomplete lesson
				const startingIndex =
					firstIncompleteIndex === -1
						? lessons.length - 1
						: firstIncompleteIndex;

				setCurrentLessonIndex(startingIndex);

				if (!isInitialized) {
					setIsInitialized(true);
				}
			}
		}
	}, [isProgressLoading, progress.completedLessons]);

	return (
		<WorkspaceContent
			lessons={lessons}
			currentLessonIndex={currentLessonIndex}
			setCurrentLessonIndex={setCurrentLessonIndex}
			isInitialized={isInitialized}
		/>
	);
};
export default Workspace;
