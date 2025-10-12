import { ChatMessage as ChatMessageType } from "../types/chat";
import { ChatMarkdownDisplay } from "./ChatMarkdownDisplay";

interface ChatMessageProps {
	message: ChatMessageType;
	isStreaming: boolean;
	displayedWords: string[];
}

export const ChatMessage = ({
	message,
	isStreaming,
	displayedWords,
}: ChatMessageProps) => {
	const hasContent = message.content.trim().length > 0;

	if (isStreaming && !hasContent) {
		return null;
	}

	// Get styling based on message type
	const getMessageStyling = () => {
		const baseClasses = "space-y-1";

		switch (message.messageType) {
			case "error":
				return `${baseClasses} border-l-4 border-red-500 pl-4 bg-red-500/10 rounded-r-lg py-2 error-message`;
			case "success":
				return `${baseClasses} border-l-4 border-green-500 pl-4 bg-green-500/10 rounded-r-lg py-2 success-message`;
			case "info":
			default:
				return baseClasses;
		}
	};

	// For user messages, display as plain text
	if (message.role === "user") {
		return (
			<div className={getMessageStyling()}>
				<div className="text-base leading-[1.75]">
					<div className="whitespace-pre-wrap">{message.content}</div>
				</div>
			</div>
		);
	}

	// For assistant messages, use markdown display
	return (
		<div className={getMessageStyling()}>
			<ChatMarkdownDisplay
				content={message.content}
				isStreaming={isStreaming}
				enableTypingAnimation={false}
			/>
		</div>
	);
};
