"use client";

import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { LessonStreaming } from "../../temp-types";

interface ChatProps {
	lessonStreaming: LessonStreaming;
}

const Chat = ({ lessonStreaming }: ChatProps) => {
	return (
		<div className="flex-35 max-h-full h-full bg-background-3 flex flex-col">
			<ChatHeader />
			<ChatMessageList lessonStreaming={lessonStreaming} />
			<ChatInput lessonStreaming={lessonStreaming} />
		</div>
	);
};

export default Chat;
