import { useCallback, useEffect, useState } from "react";
import { Lesson, LessonStreaming, TestResult } from "../temp-types";
import { useChat } from "../Chat/hooks/useChat";
import { createLessonStreamer } from "../Chat/utils/lessonStreamer";
import {
	getAIFeedback,
	formatAIFeedback,
} from "../Chat/services/aiFeedbackService";
import { useProgress } from "../../../contexts/ProgressContext";

interface UseLessonStreamingProps {
	currentLesson: Lesson;
	currentStepIndex: number;
	setCurrentStepIndex: (index: number) => void;
	setCurrentLessonIndex: (index: number) => void;
	lessons: Lesson[];
	currentLessonIndex: number;
	setCode: (code: string) => void;
}

export const useLessonStreaming = ({
	currentLesson,
	currentStepIndex,
	setCurrentStepIndex,
	setCurrentLessonIndex,
	lessons,
	currentLessonIndex,
	setCode,
}: UseLessonStreamingProps): LessonStreaming => {
	// Chat state and functionality
	const {
		messages,
		inputValue,
		isLoading,
		streamingMessageId,
		displayedWords,
		isThinking,
		handleSendMessage,
		handleKeyPress,
		setInputValue,
		streamCustomMessage,
		addSystemMessage,
		setThinking,
		clearMessages,
		messagesEndRef,
	} = useChat();

	// Progress system
	const { progress, addStepXP, addLessonXP, showXPGain, queueAnimation } =
		useProgress();

	// Track previous skill node completion status
	const [previousNodeCompletion, setPreviousNodeCompletion] = useState<
		Record<string, boolean>
	>({});

	// Check for skill node completion after state updates
	useEffect(() => {
		progress.skillNodes.forEach((node) => {
			const wasCompleted = previousNodeCompletion[node.id] || false;
			const isNowCompleted = node.completed;

			// If node just became completed, show skill tree
			if (!wasCompleted && isNowCompleted) {
				queueAnimation("skillTree", {
					duration: 1500,
					completedNodeId: node.id,
				});
			}
		});

		// Update the previous completion status
		const newCompletionStatus: Record<string, boolean> = {};
		progress.skillNodes.forEach((node) => {
			newCompletionStatus[node.id] = node.completed;
		});
		setPreviousNodeCompletion(newCompletionStatus);
	}, [progress.skillNodes, queueAnimation]);

	// Create lesson streamer instance
	const lessonStreamer = createLessonStreamer(
		streamCustomMessage,
		addSystemMessage
	);

	// Stream the first step when component mounts
	useEffect(() => {
		if (messages.length === 0 && currentLesson.steps[currentStepIndex]) {
			streamCurrentStep();
		}
	}, []); // Only run once on mount

	// Imperative streaming functions
	const streamCurrentStep = useCallback(async () => {
		if (currentLesson.steps[currentStepIndex]) {
			await lessonStreamer.streamStep(
				currentLesson.steps[currentStepIndex],
				{
					streamingSpeed: 30,
				}
			);
		}
	}, [currentLesson, currentStepIndex, lessonStreamer]);

	const streamStep = useCallback(
		async (lessonIndex: number, stepIndex: number) => {
			if (lessons[lessonIndex].steps[stepIndex]) {
				// Stream the new step after state update
				// setTimeout(async () => {
				await lessonStreamer.streamStep(
					lessons[lessonIndex].steps[stepIndex],
					{
						streamingSpeed: 30,
					}
				);
				// }, 100);
			}
		},
		[currentLesson, currentStepIndex, lessonStreamer, setCurrentStepIndex]
	);

	const streamCustomLessonMessage = useCallback(
		async (message: string) => {
			await lessonStreamer.streamCustomLessonMessage(message);
		},
		[lessonStreamer]
	);

	const handleFailedTests = useCallback(
		async (results: TestResult[]) => {
			const currentStep = currentLesson.steps[currentStepIndex];
			const userCode = results[0]?.code || ""; // Get user's code from test results

			// Show thinking animation
			setThinking(true);

			try {
				// Get AI feedback
				const aiResponse = await getAIFeedback({
					stepContent: currentStep.content,
					stepType: currentStep.stepType,
					testResults: results,
					userCode: userCode,
				});

				// Hide thinking animation
				setThinking(false);

				// Format and stream the AI feedback
				const feedbackMessage = formatAIFeedback(
					aiResponse,
					currentStep.content
				);
				await lessonStreamer.streamCustomLessonMessage(
					feedbackMessage,
					{},
					"error"
				);
			} catch (error) {
				console.error("Error getting AI feedback:", error);
				// Hide thinking animation
				setThinking(false);
				// Fallback to basic feedback if AI service fails
				const fallbackMessage = `I see you're having trouble with this step. Let me help you understand what went wrong.\n\n**Step content reminder:**\n${currentStep.content}\n\nTake your time and try again! I'm here to help if you need more guidance.`;
				await lessonStreamer.streamCustomLessonMessage(
					fallbackMessage,
					{},
					"error"
				);
			}
		},
		[currentLesson, currentStepIndex, lessonStreamer, setThinking]
	);

	const handleTestResults = useCallback(
		async (results: TestResult[]) => {
			console.log(results);
			// Go to next step in lesson, if all results are passed: show next step's content
			if (results.every((result) => result.passed)) {
				// Show success message
				await lessonStreamer.streamCustomLessonMessage(
					"✅ Great job! You got it right!",
					{},
					"success"
				);

				// If there is a next step, go to it
				if (currentLesson.steps[currentStepIndex + 1]) {
					// Award step XP and show animation
					addStepXP(currentLesson.stepXpReward);
					showXPGain(currentLesson.stepXpReward);
					setTimeout(() => {
						setCurrentStepIndex(currentStepIndex + 1);
						// Stream the next step content after success message streams

						streamStep(currentLessonIndex, currentStepIndex + 1);
						setCode(
							lessons[currentLessonIndex].steps[
								currentStepIndex + 1
							].startingCode ?? ""
						);
					}, 300);
					// else if there is a next lesson, go to it
				} else if (lessons.length > currentLessonIndex + 1) {
					// Award lesson completion XP and show animation
					addLessonXP(
						currentLesson.id,
						currentLesson.skillNodeId,
						currentLesson.xpReward
					);
					showXPGain(currentLesson.xpReward);

					setTimeout(() => {
						// Clear chat messages for new lesson
						clearMessages();
						setCode(
							lessons[currentLessonIndex + 1].steps[0]
								.startingCode ?? ""
						);

						setCurrentLessonIndex(currentLessonIndex + 1);
						setCurrentStepIndex(0);
						// Stream the first step of the new lesson
						streamStep(currentLessonIndex + 1, 0);
					}, 1000); // Standard delay
				} else {
					// Award final lesson completion XP and show animation
					addLessonXP(
						currentLesson.id,
						currentLesson.skillNodeId,
						currentLesson.xpReward
					);
					showXPGain(currentLesson.xpReward);
					// Finished
				}
			} else {
				// send failed results to the AI, ask to provide feedback
				await handleFailedTests(results);
			}
		},
		[
			currentLesson,
			currentStepIndex,
			lessons,
			currentLessonIndex,
			setCurrentStepIndex,
			setCurrentLessonIndex,
			streamStep,
			handleFailedTests,
			addStepXP,
			addLessonXP,
			showXPGain,
			queueAnimation,
			clearMessages,
		]
	);

	return {
		// Chat state
		messages,
		inputValue,
		isLoading,
		streamingMessageId,
		displayedWords,
		isThinking,
		messagesEndRef,
		// Chat handlers
		handleSendMessage,
		handleKeyPress,
		setInputValue,
		clearMessages,
		// Streaming functions
		streamCurrentStep,
		streamStep,
		streamCustomLessonMessage,
		handleTestResults,
	};
};
