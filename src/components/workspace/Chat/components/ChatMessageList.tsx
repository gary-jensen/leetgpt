import { LessonStreaming } from "@/features/Workspace/lesson-data/lesson-types";
import { ChatMessage } from "./ChatMessage";
import ThinkingAnimation from "./ThinkingAnimation";

interface ChatMessageListProps {
	lessonStreaming: LessonStreaming;
}

export const ChatMessageList = ({ lessonStreaming }: ChatMessageListProps) => {
	return (
		<div className="fflex-1 max-h-[calc(100%-40px)] h-[calc(100%-40px)] overflow-y-auto px-3 pt-3 pb-2 space-y-2">
			{lessonStreaming.messages.map((message, index) => {
				return (
					<ChatMessage
						key={message.id}
						message={message}
						isStreaming={
							lessonStreaming.streamingMessageId === message.id
						}
						displayedWords={[]}
						isLastMessage={
							index + 1 === lessonStreaming.messages.length
						}
						messagesEndRef={lessonStreaming.messagesEndRef}
					/>
				);
			})}
			{lessonStreaming.isThinking && (
				// <div className="px-4 py-2">
				// 	<ThinkingAnimation />
				// </div>
				<div className="space-y-1 border-l-4 border-red-500 pl-4 bg-red-500/10 rounded-r-lg py-2 error-message">
					<div className="text-base leading-[1.75]">
						<div className="whitespace-pre-wrap">
							<ThinkingAnimation />
						</div>
					</div>
				</div>
			)}

			<div ref={lessonStreaming.messagesEndRef} />
		</div>
	);
};
