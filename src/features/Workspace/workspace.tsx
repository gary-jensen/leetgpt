"use client";

import Editor from "./Editor/components/editor";
import Chat from "./Chat/components/chat";
import useConsole from "./Console/hooks/useConsole";
import { useState } from "react";
import { useLessonStreaming } from "./hooks/useLessonStreaming";
import { ProgressBar } from "./components/ProgressBar";
import AnimationManager from "../../components/Rewards/AnimationManager";

import { mockLessons as lessons } from "./mock-lessons";

const Workspace = () => {
	/* lesson data section */

	const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const currentLesson = lessons[currentLessonIndex];
	/* end of lesson data section */

	const [code, setCode] = useState("");
	const [showSkillTree, setShowSkillTree] = useState(false);

	// Use our custom hook for all lesson streaming logic
	const lessonStreaming = useLessonStreaming({
		currentLesson,
		currentStepIndex,
		setCurrentStepIndex,
		setCurrentLessonIndex,
		lessons,
		currentLessonIndex,
		setCode,
	});

	const { iframeRef, handleTest } = useConsole(
		code,
		currentLesson,
		currentStepIndex,
		lessonStreaming.handleTestResults
	);

	return (
		<div className="w-screen h-screen max-h-screen flex flex-col bg-background-4">
			<ProgressBar setShowSkillTree={setShowSkillTree} />
			<div className="flfex-1 h-[calc(100%-68px)] flex items-start justify-center pb-6">
				<div className="flex w-[80%] h-[99%] max-h-[99%] gap-6 roundfed-xl overflow-hidden">
					<Chat lessonStreaming={lessonStreaming} />
					<Editor
						code={code}
						setCode={setCode}
						iframeRef={iframeRef}
						handleRun={handleTest}
					/>
				</div>
			</div>
			<AnimationManager />
		</div>
	);
};
export default Workspace;
