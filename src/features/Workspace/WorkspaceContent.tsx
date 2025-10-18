"use client";

import Editor from "./Editor/components/editor";
import Chat from "./Chat/components/chat";
import useConsole from "./Console/hooks/useConsole";
import { useState, useEffect } from "react";
import { useLessonStreaming } from "./hooks/useLessonStreaming";
import { ProgressBar } from "./components/ProgressBar";
import AnimationManager from "../../components/Rewards/AnimationManager";
import { Lesson } from "./lesson-data/lesson-types";
import MoreLessonsComingSoon from "./components/MoreLessonsComingSoon";
import { useProgress } from "../../contexts/ProgressContext";

interface WorkspaceContentProps {
	lessons: Lesson[];
	currentLessonIndex: number;
	setCurrentLessonIndex: (index: number) => void;
	isInitialized: boolean;
}

export default function WorkspaceContent({
	lessons,
	currentLessonIndex,
	setCurrentLessonIndex,
	isInitialized,
}: WorkspaceContentProps) {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [stepInitialized, setStepInitialized] = useState(false);
	const [code, setCode] = useState("");
	const [attemptsCount, setAttemptsCount] = useState(0);
	const [allLessonsCompleted, setAllLessonsCompleted] = useState(false);

	const { progress, getCurrentStep } = useProgress();
	const currentLesson = lessons[currentLessonIndex];

	// Initialize currentStepIndex from progress
	useEffect(() => {
		console.log(
			`WorkspaceContent step init: currentLesson=${currentLesson?.id}, isInitialized=${isInitialized}`
		);
		if (currentLesson && isInitialized) {
			const savedStep = getCurrentStep(currentLesson.id);
			// Ensure the saved step is within bounds
			const maxStep = Math.max(0, currentLesson.steps.length - 1);
			const validStep = Math.min(Math.max(0, savedStep), maxStep);

			console.log(
				`Resuming lesson ${currentLesson.id}: savedStep=${savedStep}, maxStep=${maxStep}, validStep=${validStep}`
			);
			setCurrentStepIndex(validStep);
			// Use setTimeout to ensure this runs after the state update
			setTimeout(() => setStepInitialized(true), 0);
		}
	}, [currentLesson, isInitialized, getCurrentStep]);

	// Reset step initialization when lesson changes
	useEffect(() => {
		setStepInitialized(false);
	}, [currentLesson.id]);

	// Check if all lessons are completed
	useEffect(() => {
		if (isInitialized && Object.keys(progress.lessonProgress).length > 0) {
			const allCompleted = lessons.every(
				(lesson) =>
					progress.lessonProgress[lesson.id]?.completed ?? false
			);
			setAllLessonsCompleted(allCompleted);
		}
	}, [isInitialized, progress.lessonProgress, lessons]);

	// Use our custom hook for all lesson streaming logic
	const lessonStreaming = useLessonStreaming({
		currentLesson,
		currentStepIndex,
		setCurrentStepIndex,
		setCurrentLessonIndex,
		lessons,
		currentLessonIndex,
		setCode,
		isInitialized,
		stepInitialized,
		setAttemptsCount,
		onAllLessonsCompleted: () => setAllLessonsCompleted(true),
	});

	const { iframeRef, handleTest, isExecuting } = useConsole(
		code,
		currentLesson,
		currentStepIndex,
		lessonStreaming.handleTestResults,
		attemptsCount,
		setAttemptsCount,
		lessonStreaming.addSystemMessage
	);

	// Show coming soon screen if all lessons are completed
	if (allLessonsCompleted) {
		return <MoreLessonsComingSoon />;
	}

	return (
		<div className="w-screen h-fit md:h-screen md:max-h-screen flex flex-col bg-background-4">
			<ProgressBar />
			<div className="h-fit md:h-[calc(100vh-144px)] flex items-start justify-center pb-6">
				<div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-[35%_65%] w-[80%] h-[99%] max-h-[99%] gap-6 roundfed-xl md:overflow-hidden">
					<Chat lessonStreaming={lessonStreaming} />
					<Editor
						code={code}
						setCode={setCode}
						iframeRef={iframeRef}
						handleRun={handleTest}
						isExecuting={isExecuting}
						isThinking={lessonStreaming.isThinking}
						isInitialized={isInitialized}
						hasJustPassed={lessonStreaming.hasJustPassed}
					/>
				</div>
			</div>
			<AnimationManager />
		</div>
	);
}
