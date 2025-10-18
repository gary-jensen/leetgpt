import { useCallback, useEffect, useState, useRef } from "react";
import {
	Lesson,
	LessonStreaming,
	TestResult,
} from "../lesson-data/lesson-types";
import { useChat } from "../Chat/hooks/useChat";
import { createLessonStreamer } from "../Chat/utils/lessonStreamer";
import {
	getAIFeedback,
	formatAIFeedback,
} from "../Chat/services/aiFeedbackService";
import { useProgress } from "../../../contexts/ProgressContext";
import { trackLessonStart } from "@/lib/analytics";

interface UseLessonStreamingProps {
	currentLesson: Lesson;
	currentStepIndex: number;
	setCurrentStepIndex: (index: number) => void;
	setCurrentLessonIndex: (index: number) => void;
	lessons: Lesson[];
	currentLessonIndex: number;
	setCode: (code: string) => void;
	isInitialized?: boolean;
	stepInitialized?: boolean;
	setAttemptsCount: (count: number) => void;
	onAllLessonsCompleted?: () => void;
}

export const useLessonStreaming = ({
	currentLesson,
	currentStepIndex,
	setCurrentStepIndex,
	setCurrentLessonIndex,
	lessons,
	currentLessonIndex,
	setCode,
	isInitialized = true,
	stepInitialized = true,
	setAttemptsCount,
	onAllLessonsCompleted,
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
	const {
		progress,
		addStepXP,
		addLessonXP,
		showXPGain,
		queueAnimation,
		isProgressLoading,
	} = useProgress();

	// Track when tests just passed for button glow effect
	const [hasJustPassed, setHasJustPassed] = useState(false);

	// Track lesson start time
	const [startTime, setStartTime] = useState(new Date().getTime());

	// Track previous skill node completion status
	const [previousNodeCompletion, setPreviousNodeCompletion] = useState<
		Record<string, boolean>
	>({});
	const hasInitializedNodeTracking = useRef(false);

	// Track lesson starts
	const trackedLessonsRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		// Wait until progress has finished loading and component is initialized
		if (isProgressLoading || !isInitialized) {
			return;
		}

		// Track lesson start only if we haven't tracked this lesson yet
		if (!trackedLessonsRef.current.has(currentLesson.id)) {
			trackLessonStart(currentLesson.id, currentLesson.title);
			trackedLessonsRef.current.add(currentLesson.id);
		}
	}, [
		currentLesson.id,
		currentLesson.title,
		isInitialized,
		isProgressLoading,
	]);

	// Check for skill node completion after state updates
	useEffect(() => {
		// On first run, just initialize the tracking without triggering animations
		if (!hasInitializedNodeTracking.current && isInitialized) {
			const initialCompletionStatus: Record<string, boolean> = {};
			progress.skillNodes.forEach((node) => {
				initialCompletionStatus[node.id] = node.completed;
			});
			setPreviousNodeCompletion(initialCompletionStatus);
			hasInitializedNodeTracking.current = true;
			return;
		}

		// Only check for changes after initialization
		if (hasInitializedNodeTracking.current) {
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
		}
	}, [progress.skillNodes, queueAnimation, isInitialized]);

	// Create lesson streamer instance
	const lessonStreamer = createLessonStreamer(
		streamCustomMessage,
		addSystemMessage
	);

	// Track if we've loaded content for this lesson to prevent infinite loops
	const loadedLessonsRef = useRef<Set<string>>(new Set());

	// Set initial startingCode and stream steps when component mounts and is initialized
	useEffect(() => {
		if (
			isInitialized &&
			stepInitialized &&
			messages.length === 0 &&
			currentLesson.steps[currentStepIndex]
		) {
			// Create a unique key for this lesson+step combination
			const lessonKey = `${currentLesson.id}-${currentStepIndex}`;

			// Only load if we haven't loaded this lesson yet
			if (!loadedLessonsRef.current.has(lessonKey)) {
				loadedLessonsRef.current.add(lessonKey);

				// Set the startingCode for the current step if it exists
				const currentStep = currentLesson.steps[currentStepIndex];
				if (currentStep.startingCode) {
					setCode(currentStep.startingCode);
				}

				// Stream all previous steps as context, then stream current step
				// Call the function directly here to avoid dependency issues
				(async () => {
					// If we're on step 0, just stream normally
					if (currentStepIndex === 0) {
						await streamCurrentStep();
						return;
					}

					// Way to stream all previous steps (non-streaming)
					// Stream all previous steps as context (non-streaming for speed)
					// const previousStepsContent = currentLesson.steps
					// 	.slice(0, currentStepIndex)
					// 	.map((step, index) => step.content)
					// 	.join("");

					// Add all previous steps (non-streaming)
					// addSystemMessage(previousStepsContent, "info");
					// addSystemMessage("👇 Continue from here!", "success");

					// lessonStreamer.streamCustomLessonMessage(
					// 	previousStepsContent,
					// 	{},
					// 	"info"
					// );
					// lessonStreamer.streamCustomLessonMessage(
					// 	"👇 Continue from here!",
					// 	{},
					// 	"success"
					// );

					// Stream the current step, and all previous steps
					await streamCurrentStep();
				})();
			}
		}
	}, [
		isInitialized,
		stepInitialized,
		currentLesson,
		currentStepIndex,
		setCode,
	]);

	// Clear loaded lessons tracking when lesson changes
	useEffect(() => {
		loadedLessonsRef.current.clear();
	}, [currentLesson.id]);

	// Imperative streaming functions
	const streamCurrentStep = useCallback(async () => {
		if (currentLesson.steps[currentStepIndex]) {
			// Stream all steps up to the current step
			for (let i = 0; i <= currentStepIndex; i++) {
				if (i === currentStepIndex && currentStepIndex !== 0) {
					// Streams the continue message (when needed)
					await lessonStreamer.streamCustomLessonMessage(
						"👇 Continue from here!",
						{},
						"success"
					);
				}
				// Streams the step
				await lessonStreamer.streamStep(currentLesson.steps[i], {
					streamingSpeed: i === currentStepIndex ? 30 : 10,
				});

				// await new Promise((resolve) => setTimeout(resolve, 100));
			}
			// await lessonStreamer.streamStep(
			// 	currentLesson.steps[currentStepIndex],
			// 	{
			// 		streamingSpeed: 30,
			// 	}
			// );
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
					testResults: results,
					userCode: userCode,
				});

				// Hide thinking animation
				setThinking(false);

				// Format and stream the AI feedback
				const feedbackMessage = formatAIFeedback(aiResponse);
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
			// Go to next step in lesson, if all results are passed: show next step's content
			if (results.every((result) => result.passed)) {
				// Trigger button glow effect
				setHasJustPassed(true);
				// Clear glow after animation completes (1s animation duration)
				setTimeout(() => setHasJustPassed(false), 1000);

				// Show success message
				await lessonStreamer.streamCustomLessonMessage(
					"✅ Great job! You got it right!",
					{},
					"success"
				);

				// If there is a next step, go to it
				if (currentLesson.steps[currentStepIndex + 1]) {
					// Award step XP and show animation
					const newStepIndex = currentStepIndex + 1;
					addStepXP(
						currentLesson.stepXpReward,
						currentLesson.id,
						newStepIndex
					);
					showXPGain(currentLesson.stepXpReward);
					setTimeout(() => {
						setCurrentStepIndex(newStepIndex);
						setAttemptsCount(0); // Reset attempts counter when moving to next step
						// Stream the next step content after success message streams

						streamStep(currentLessonIndex, newStepIndex);
						setCode(
							lessons[currentLessonIndex].steps[newStepIndex]
								.startingCode ?? ""
						);
					}, 300);
					// else if there is a next lesson, go to it
				} else if (lessons.length > currentLessonIndex + 1) {
					// Award lesson completion XP and show animation
					const now = new Date().getTime();
					addLessonXP(
						currentLesson.id,
						currentLesson.title,
						currentLesson.skillNodeId,
						currentLesson.xpReward,
						now - startTime,
						currentLesson.steps.length
					);
					setStartTime(now);
					showXPGain(currentLesson.xpReward);

					setTimeout(() => {
						// Clear chat messages for new lesson
						clearMessages();
						setCode(
							lessons[currentLessonIndex + 1].steps[0]
								.startingCode ?? ""
						);

						// set timeTaken for lesson to 0

						setCurrentLessonIndex(currentLessonIndex + 1);
						setCurrentStepIndex(0);
						setAttemptsCount(0); // Reset attempts counter when moving to new lesson
						// Stream the first step of the new lesson
						streamStep(currentLessonIndex + 1, 0);
					}, 1000); // Standard delay
				} else {
					// Award final lesson completion XP and show animation
					const now = new Date().getTime();
					addLessonXP(
						currentLesson.id,
						currentLesson.title,
						currentLesson.skillNodeId,
						currentLesson.xpReward,
						now - startTime,
						currentLesson.steps.length
					);
					setStartTime(now);
					showXPGain(currentLesson.xpReward);

					// Trigger callback for all lessons completed
					if (onAllLessonsCompleted) {
						setTimeout(() => {
							onAllLessonsCompleted();
						}, 2000); // Wait for XP animation to complete
					}
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
			onAllLessonsCompleted,
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
		hasJustPassed,
		messagesEndRef,
		// Chat handlers
		handleSendMessage,
		handleKeyPress,
		setInputValue,
		clearMessages,
		addSystemMessage,
		// Streaming functions
		streamCurrentStep,
		streamStep,
		streamCustomLessonMessage,
		handleTestResults,
	};
};
