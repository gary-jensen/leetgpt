import { Lesson, Step } from "@/features/Workspace/lesson-data/lesson-types";

export interface LessonStreamOptions {
	streamingSpeed?: number;
	includeSteps?: boolean;
	stepDelay?: number; // delay between steps
}

export class LessonStreamer {
	private streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number,
		messageType?: "error" | "success" | "info"
	) => Promise<void>;
	private addSystemMessage: (
		content: string,
		messageType?: "error" | "success" | "info"
	) => void;

	constructor(
		streamCustomMessage: (
			content: string,
			role?: "assistant" | "system",
			streamingSpeed?: number,
			messageType?: "error" | "success" | "info"
		) => Promise<void>,
		addSystemMessage: (
			content: string,
			messageType?: "error" | "success" | "info"
		) => void
	) {
		this.streamCustomMessage = streamCustomMessage;
		this.addSystemMessage = addSystemMessage;
	}

	/**
	 * Stream lesson introduction
	 */
	async streamLessonIntroduction(
		lesson: Lesson,
		options: LessonStreamOptions = {}
	) {
		const { streamingSpeed = 50, includeSteps = true } = options;

		const introduction = `Welcome to "${lesson.title}"! Let's get started with this lesson.`;
		await this.streamCustomMessage(
			introduction,
			"assistant",
			streamingSpeed
		);

		if (includeSteps && lesson.steps.length > 0) {
			await this.streamLessonSteps(lesson, options);
		}
	}

	/**
	 * Stream lesson steps
	 */
	async streamLessonSteps(lesson: Lesson, options: LessonStreamOptions = {}) {
		const { streamingSpeed = 50, stepDelay = 1000 } = options;

		for (let i = 0; i < lesson.steps.length; i++) {
			const step = lesson.steps[i];

			// Stream step content only (no headers)
			await this.streamCustomMessage(
				step.content,
				"assistant",
				streamingSpeed
			);

			// Add delay between steps (except for the last one)
			if (i < lesson.steps.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, stepDelay));
			}
		}
	}

	/**
	 * Stream a specific step
	 */
	async streamStep(step: Step, options: LessonStreamOptions = {}) {
		const { streamingSpeed = 50 } = options;

		// Stream step content only (no headers)
		await this.streamCustomMessage(
			step.content,
			"assistant",
			streamingSpeed
		);
	}

	/**
	 * Stream lesson completion message
	 */
	async streamLessonCompletion(
		lesson: Lesson,
		options: LessonStreamOptions = {}
	) {
		const { streamingSpeed = 50 } = options;

		const completionMessage = `🎉 Congratulations! You've completed "${lesson.title}". Great job!`;
		await this.streamCustomMessage(
			completionMessage,
			"assistant",
			streamingSpeed
		);
	}

	/**
	 * Stream a custom lesson-related message
	 */
	async streamCustomLessonMessage(
		content: string,
		options: LessonStreamOptions = {},
		messageType: "error" | "success" | "info" = "info"
	) {
		const { streamingSpeed = 50 } = options;
		await this.streamCustomMessage(
			content,
			"assistant",
			streamingSpeed,
			messageType
		);
	}

	/**
	 * Add a lesson context message (non-streaming)
	 */
	addLessonContext(lesson: Lesson) {
		const contextMessage = `📚 Current Lesson: ${lesson.title} (${lesson.steps.length} steps)`;
		this.addSystemMessage(contextMessage);
	}
}

/**
 * Helper function to create a lesson streamer instance
 */
export const createLessonStreamer = (
	streamCustomMessage: (
		content: string,
		role?: "assistant" | "system",
		streamingSpeed?: number,
		messageType?: "error" | "success" | "info"
	) => Promise<void>,
	addSystemMessage: (
		content: string,
		messageType?: "error" | "success" | "info"
	) => void
) => {
	return new LessonStreamer(streamCustomMessage, addSystemMessage);
};
