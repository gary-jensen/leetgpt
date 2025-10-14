import { MessageSquareIcon } from "lucide-react";

interface ChatHeaderProps {
	title?: string;
}

export const ChatHeader = ({ title = "Chat" }: ChatHeaderProps) => {
	return (
		<div className="px-3 py-3.5 maxf-h-[40px] hf-[45px] flex items-center gap-2 border-b shadow-md">
			<MessageSquareIcon size={18} />
			{title}
		</div>
	);
};
