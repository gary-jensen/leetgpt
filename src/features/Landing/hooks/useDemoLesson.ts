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

export interface DemoMessage {
	id: string;
	role: "assistant" | "system";
	content: string;
	type?: "error" | "success" | "info";
}

export const useDemoLesson = () => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [code, setCode] = useState("");
	const [messages, setMessages] = useState<DemoMessage[]>([]);
	const [isThinking, setIsThinking] = useState(false);
	const [hasJustPassed, setHasJustPassed] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const currentStep = demoLesson.steps[currentStepIndex];
	const isLastStep = currentStepIndex === demoLesson.steps.length - 1;

	// Initialize with first step content
	useEffect(() => {
		if (currentStep) {
			addMessage({
				id: `step-${currentStepIndex}-content`,
				role: "assistant",
				content: currentStep.content,
			});
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
		addMessage({
			id: messageId,
			role: "assistant",
			content,
			type,
		});
	};

	const handleTestResults = async (results: TestResult[]) => {
		const allTestsPassed = results.every((result) => result.passed);

		if (allTestsPassed) {
			// Show success message
			setHasJustPassed(true);
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
				}
			}, 2000);
		} else {
			// Show AI feedback for failed test
			setIsThinking(true);

			try {
				// Get real AI feedback
				const userCode = results[0]?.code || "";
				const aiResponse = await getAIFeedback({
					stepContent: currentStep.content,
					testResults: results,
					userCode: userCode,
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
	};
};
