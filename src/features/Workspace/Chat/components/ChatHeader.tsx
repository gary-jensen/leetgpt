import { MessageSquareIcon } from "lucide-react";

interface ChatHeaderProps {
	title?: string;
}

export const ChatHeader = ({ title = "Chat" }: ChatHeaderProps) => {
	return (
		<div className="px-3 h-[40px] flex items-center gap-2 border-b">
			<MessageSquareIcon size={18} />
			{title}
		</div>
	);
};
