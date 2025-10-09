import { LessonStreaming } from "../../temp-types";
import { ChatMessage as ChatMessageType } from "../types/chat";
import { ChatMessage } from "./ChatMessage";
import ThinkingAnimation from "./ThinkingAnimation";

interface ChatMessageListProps {
	lessonStreaming: LessonStreaming;
}

export const ChatMessageList = ({ lessonStreaming }: ChatMessageListProps) => {
	return (
		<div className="fflex-1 max-h-[calc(100%-40px)] h-[calc(100%-40px)] overflow-y-auto px-3 pt-3 pb-2 space-y-2">
			{lessonStreaming.messages.length === 0 && (
				<div className="text-center text-gray-500 mt-8">
					<p>Start a conversation with the AI assistant!</p>
					<p className="text-sm mt-1">
						Ask questions about coding, get help with your projects,
						or just chat.
					</p>
				</div>
			)}

			{lessonStreaming.messages.map((message) => {
				const isStreaming =
					lessonStreaming.streamingMessageId === message.id;

				return (
					<ChatMessage
						key={message.id}
						message={message}
						isStreaming={
							lessonStreaming.streamingMessageId === message.id
						}
						displayedWords={[]}
					/>
				);
			})}
			{lessonStreaming.isThinking && (
				<div className="px-4 py-2">
					<ThinkingAnimation />
				</div>
			)}

			<div ref={lessonStreaming.messagesEndRef} />
		</div>
	);
};
