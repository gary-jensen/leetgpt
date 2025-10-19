import { useState, useEffect, useRef } from "react";
import {
	TestResult,
	Step,
} from "@/features/Workspace/lesson-data/lesson-types";
import { demoLesson } from "../data/demoLesson";
import {
	getAIFeedback,
	formatAIFeedback,
} from "@/features/Workspace/Chat/services/aiFeedbackService";
import {
	trackDemoSubmitCorrect,
	trackDemoSubmitIncorrect,
	trackDemoComplete,
} from "@/lib/analytics";
import { playErrorSound, playSuccessSound } from "@/lib/soundManager";

export interface DemoMessage {
	id: string;
	role: "assistant" | "system";
	content: string;
	type?: "error" | "success" | "info";
	timestamp?: Date;
}

export const useDemoLesson = () => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [code, setCode] = useState("");
	const [attempts, setAttempts] = useState(0);
	const [messages, setMessages] = useState<DemoMessage[]>([]);
	const [isThinking, setIsThinking] = useState(false);
	const [hasJustPassed, setHasJustPassed] = useState(false);
	const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
		null
	);
	const [displayedWords, setDisplayedWords] = useState<{
		[messageId: string]: string[];
	}>({});
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const currentStep = demoLesson.steps[currentStepIndex];
	const isLastStep = currentStepIndex === demoLesson.steps.length - 1;

	// Initialize with first step content
	useEffect(() => {
		if (currentStep) {
			streamMessage(currentStep.content, "info");
		}
	}, [currentStepIndex]);

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		if (messagesEndRef.current) {
			// Use setTimeout to ensure DOM has updated
			setTimeout(() => {
				// Find the scrollable parent container (the chat messages container)
				const scrollableParent = messagesEndRef.current?.parentElement;
				if (scrollableParent) {
					scrollableParent.scrollTop = scrollableParent.scrollHeight;
				}
			}, 100);
		}
	}, [messages]);

	const addMessage = (message: DemoMessage) => {
		setMessages((prev) => [...prev, message]);
	};

	const streamMessage = async (
		content: string,
		type?: "error" | "success" | "info"
	) => {
		const messageId = `msg-${Date.now()}`;
		setStreamingMessageId(messageId);
		setDisplayedWords({ [messageId]: [] });

		// Create the message first
		const message: DemoMessage = {
			id: messageId,
			role: "assistant",
			content: "",
			type,
			timestamp: new Date(),
		};
		setMessages((prev) => [...prev, message]);

		// Simulate streaming by adding words progressively
		const words = content.split(" ");
		let currentContent = "";

		for (let i = 0; i < words.length; i++) {
			await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms delay between words

			currentContent += (i > 0 ? " " : "") + words[i];

			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === messageId
						? { ...msg, content: currentContent }
						: msg
				)
			);
		}

		// Finish streaming
		setStreamingMessageId(null);
		setDisplayedWords({});
	};

	const handleTestResults = async (
		results: TestResult[],
		userCode: string
	) => {
		const allTestsPassed = results.every((result) => result.passed);

		if (allTestsPassed) {
			// Track successful test
			trackDemoSubmitCorrect(currentStep.id, attempts + 1, userCode);

			// Track demo completion on last step
			if (isLastStep) {
				trackDemoComplete();
			}

			// Show success message
			setHasJustPassed(true);
			playSuccessSound();
			await streamMessage(
				"✅ **Perfect!** Your code passed all tests.",
				"success"
			);

			// Auto-advance to next step after 2 seconds
			setTimeout(() => {
				setHasJustPassed(false);
				if (!isLastStep) {
					setCurrentStepIndex((prev) => prev + 1);
					setCode(""); // Clear code for next step
					setAttempts(0);
				}
			}, 500);
		} else {
			// Track failed test
			const firstFailedTest = results.find((r) => !r.passed);
			trackDemoSubmitIncorrect(
				currentStep.id,
				userCode,
				firstFailedTest?.error
			);

			// Show AI feedback for failed test
			setIsThinking(true);
			playErrorSound();
			setAttempts((prev) => prev + 1);
			try {
				// Get real AI feedback
				const userCode = results[0]?.code || "";
				const aiResponse = await getAIFeedback({
					stepContent: currentStep.content,
					testResults: results,
					userCode: userCode,
					isDemo: true, // Flag this as a demo request
				});

				// Format and display the AI feedback
				const feedbackMessage = formatAIFeedback(aiResponse);
				await streamMessage(`❌ ${feedbackMessage}`, "error");
			} catch (error) {
				console.error("Error getting AI feedback:", error);
				// Fallback to basic feedback if AI service fails
				await streamMessage(
					"❌ I see you're having trouble with this step. Let me help you understand what went wrong. Take your time and try again!",
					"error"
				);
			} finally {
				setIsThinking(false);
			}
		}
	};

	return {
		currentStep,
		currentStepIndex,
		code,
		setCode,
		messages,
		isThinking,
		hasJustPassed,
		handleTestResults,
		messagesEndRef,
		isLastStep,
		streamingMessageId,
		displayedWords,
	};
};
