import { ChatMessage } from "./Chat/types/chat";
import { Test } from "./types/test-types";

export interface Lesson {
	id: string;
	title: string;
	skillNodeId: string;
	xpReward: number;
	stepXpReward: number;
	steps: Step[];
}

export interface Step {
	id: string;
	content: string;
	startingCode?: string;
	tests?: Test[];
}

export interface TestResult {
	passed: boolean;
	test: Test;
	code: string;
	error?: string;
	actualLogs?: string[];
}

export interface LessonStreaming {
	messages: ChatMessage[];
	inputValue: string;
	isLoading: boolean;
	streamingMessageId: string | null;
	displayedWords: { [messageId: string]: string[] };
	isThinking: boolean;
	hasJustPassed: boolean;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
	handleSendMessage: () => Promise<void>;
	handleKeyPress: (e: React.KeyboardEvent) => void;
	setInputValue: (value: string) => void;
	clearMessages: () => void;
	streamCurrentStep: () => Promise<void>;
	streamStep: (lessonIndex: number, stepIndex: number) => Promise<void>;
	streamCustomLessonMessage: (message: string) => Promise<void>;
	handleTestResults: (results: TestResult[]) => Promise<void>;
	addSystemMessage: (
		content: string,
		messageType?: "error" | "success" | "info"
	) => void;
}
