/**
 * Examples of how to stream custom messages to chat
 *
 * This file demonstrates various ways to use the custom message streaming functionality
 * with the currentLesson and other custom content.
 */

import { Lesson } from "../../lesson-data/lesson-types";
import { createLessonStreamer } from "../utils/lessonStreamer";

// Example lesson data
const exampleLesson: Lesson = {
	id: "lesson-1",
	title: "Introduction to JavaScript",
	skillNodeId: "variables",
	xpReward: 100,
	stepXpReward: 10,
	steps: [
		{
			id: "step-1",
			content:
				"JavaScript is a programming language that allows you to create interactive web pages.",
		},
		{
			id: "step-2",
			content: "Here's a simple example: console.log('Hello, World!');",
		},
		{
			id: "step-3",
			content:
				"Try writing your own console.log statement with a different message.",
		},
	],
};

/**
 * Example 1: Basic custom message streaming
 */
export const streamBasicMessage = async (
	streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number
	) => Promise<void>
) => {
	await streamCustomMessage(
		"Hello! I'm here to help you learn.",
		"assistant",
		50
	);
};

/**
 * Example 2: Stream lesson introduction
 */
export const streamLessonIntro = async (
	lesson: Lesson,
	streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number
	) => Promise<void>,
	addSystemMessage: (content: string) => void
) => {
	const lessonStreamer = createLessonStreamer(
		streamCustomMessage,
		addSystemMessage
	);

	// Add lesson context
	lessonStreamer.addLessonContext(lesson);

	// Stream introduction
	await lessonStreamer.streamLessonIntroduction(lesson, {
		streamingSpeed: 30,
		includeSteps: true,
		stepDelay: 1500,
	});
};

/**
 * Example 3: Stream individual lesson steps
 */
export const streamIndividualSteps = async (
	lesson: Lesson,
	streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number
	) => Promise<void>,
	addSystemMessage: (content: string) => void
) => {
	const lessonStreamer = createLessonStreamer(
		streamCustomMessage,
		addSystemMessage
	);

	// Stream each step individually with delays
	for (let i = 0; i < lesson.steps.length; i++) {
		await lessonStreamer.streamStep(lesson.steps[i], {
			streamingSpeed: 40,
		});

		// Add delay between steps
		if (i < lesson.steps.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}
};

/**
 * Example 4: Progressive lesson delivery
 */
export const streamProgressiveLesson = async (
	lesson: Lesson,
	streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number
	) => Promise<void>,
	addSystemMessage: (content: string) => void
) => {
	const lessonStreamer = createLessonStreamer(
		streamCustomMessage,
		addSystemMessage
	);

	// Step 1: Welcome message
	await lessonStreamer.streamCustomLessonMessage(
		`Welcome to "${lesson.title}"! Let's start your learning journey.`
	);

	// Step 2: Add context
	lessonStreamer.addLessonContext(lesson);

	// Step 3: Stream first step
	if (lesson.steps.length > 0) {
		await lessonStreamer.streamStep(lesson.steps[0]);
	}

	// Step 4: Ask for user interaction
	await lessonStreamer.streamCustomLessonMessage(
		"Ready to continue? Let me know when you're ready for the next step!"
	);
};

/**
 * Example 5: Interactive lesson flow
 */
export const streamInteractiveLesson = async (
	lesson: Lesson,
	streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number
	) => Promise<void>,
	addSystemMessage: (content: string) => void,
	userResponse?: string
) => {
	const lessonStreamer = createLessonStreamer(
		streamCustomMessage,
		addSystemMessage
	);

	if (!userResponse) {
		// Initial lesson start
		await lessonStreamer.streamCustomLessonMessage(
			`Great! Let's begin "${lesson.title}". This lesson has ${lesson.steps.length} steps.`
		);
		await lessonStreamer.streamCustomLessonMessage(
			"Type 'next' when you're ready to continue, or 'help' for assistance."
		);
	} else if (userResponse.toLowerCase() === "next") {
		// User wants to continue
		await lessonStreamer.streamCustomLessonMessage(
			"Excellent! Let's move to the next step."
		);
		// Stream next step logic would go here
	} else if (userResponse.toLowerCase() === "help") {
		// User needs help
		await lessonStreamer.streamCustomLessonMessage(
			"I'm here to help! You can type 'next' to continue, 'repeat' to hear the current step again, or ask me any questions."
		);
	} else {
		// Handle other responses
		await lessonStreamer.streamCustomLessonMessage(
			"I understand. Let me know if you need help or want to continue with 'next'."
		);
	}
};

/**
 * Example 6: Completion and feedback
 */
export const streamLessonCompletion = async (
	lesson: Lesson,
	streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number
	) => Promise<void>,
	addSystemMessage: (content: string) => void
) => {
	const lessonStreamer = createLessonStreamer(
		streamCustomMessage,
		addSystemMessage
	);

	// Stream completion message
	await lessonStreamer.streamLessonCompletion(lesson);

	// Add feedback request
	await lessonStreamer.streamCustomLessonMessage(
		"How did you find this lesson? Any questions or feedback?"
	);
};

/**
 * Example 7: Error handling and recovery
 */
export const streamWithErrorHandling = async (
	lesson: Lesson,
	streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number
	) => Promise<void>,
	addSystemMessage: (content: string) => void
) => {
	const lessonStreamer = createLessonStreamer(
		streamCustomMessage,
		addSystemMessage
	);

	try {
		await lessonStreamer.streamLessonIntroduction(lesson);
	} catch (error) {
		// Handle streaming errors gracefully
		await streamCustomMessage(
			"Sorry, I encountered an issue streaming the lesson. Let me try a different approach.",
			"assistant",
			50
		);

		// Fallback: add lesson context without streaming
		lessonStreamer.addLessonContext(lesson);
		await streamCustomMessage(
			`Let's start with "${lesson.title}". This lesson covers ${lesson.steps.length} key concepts.`,
			"assistant",
			50
		);
	}
};

/**
 * Usage in your Chat component:
 *
 * ```tsx
 * const Chat = ({ currentLesson }: { currentLesson: Lesson }) => {
 *   const { streamCustomMessage, addSystemMessage } = useChat();
 *
 *   // Stream lesson on mount
 *   useEffect(() => {
 *     streamLessonIntro(currentLesson, streamCustomMessage, addSystemMessage);
 *   }, [currentLesson.id]);
 *
 *   // Handle user interactions
 *   const handleUserMessage = async (userInput: string) => {
 *     if (userInput.toLowerCase() === 'start lesson') {
 *       await streamProgressiveLesson(currentLesson, streamCustomMessage, addSystemMessage);
 *     }
 *   };
 * };
 * ```
 */
