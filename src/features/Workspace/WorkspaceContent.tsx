"use client";

import Editor from "./Editor/components/editor";
import Chat from "./Chat/components/chat";
import useConsole from "./Console/hooks/useConsole";
import { useState } from "react";
import { useLessonStreaming } from "./hooks/useLessonStreaming";
import { ProgressBar } from "./components/ProgressBar";
import AnimationManager from "../../components/Rewards/AnimationManager";
import { Lesson } from "./lesson-types";

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
	const [code, setCode] = useState("");
	const [attemptsCount, setAttemptsCount] = useState(0);

	const currentLesson = lessons[currentLessonIndex];

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
		setAttemptsCount,
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
