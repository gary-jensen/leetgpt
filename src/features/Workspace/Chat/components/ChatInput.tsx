import { LessonStreaming } from "../../lesson-data/lesson-types";

interface ChatInputProps {
	lessonStreaming: LessonStreaming;
}

export const ChatInput = ({ lessonStreaming }: ChatInputProps) => {
	return (
		<div className="border-t border-gray-200 p-3">
			<div className="flex gap-2">
				<input
					type="text"
					value={lessonStreaming.inputValue}
					onChange={(e) =>
						lessonStreaming.setInputValue(e.target.value)
					}
					onKeyPress={lessonStreaming.handleKeyPress}
					placeholder="Type your message..."
					disabled={lessonStreaming.isLoading}
					className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
				/>
				<button
					onClick={lessonStreaming.handleSendMessage}
					disabled={
						!lessonStreaming.inputValue.trim() ||
						lessonStreaming.isLoading
					}
					className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					Send
				</button>
			</div>
		</div>
	);
};
