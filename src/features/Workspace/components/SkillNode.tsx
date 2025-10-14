import { SkillNode as SkillNodeType } from "@/lib/progressionSystem";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const SkillNode = forwardRef<
	HTMLDivElement,
	{
		currentSkillNode: SkillNodeType | undefined;
		showSkillNodeAnimation: boolean;
		onOpenSkillTree?: (position: { x: number; y: number }) => void;
	}
>(({ currentSkillNode, showSkillNodeAnimation, onOpenSkillTree }, ref) => {
	const openSkillTree = () => {
		// Get the position of this element
		if (ref && typeof ref !== "function" && ref.current) {
			const rect = ref.current.getBoundingClientRect();
			const position = {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
			};
			onOpenSkillTree?.(position);
		}
	};

	return (
		<>
			<div
				ref={ref}
				className="flex items-center gap-3 mb-2 absolute left-0 hover:bg-background/80 px-4 py-3 rounded-lg cursor-pointer"
				onClick={openSkillTree}
			>
				{/* <div
					className={cn(
						"absolute left-0 right-0 top-0 bottom-0 bg-background/80 z-1000 opacity-0 rounded-lg transition-all duration-300 ease-out",
						showSkillTree && "opacity-100 left-20 top-40 bg-red-500"
					)}
				>
					hey
				</div> */}
				<div className="w-8 h-8 relative">
					<svg
						className="w-8 h-8 transform -rotate-90"
						viewBox="0 0 32 32"
					>
						<circle
							cx="16"
							cy="16"
							r="14"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="text-gray-600"
						/>
						<circle
							cx="16"
							cy="16"
							r="14"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeDasharray={`${2 * Math.PI * 14}`}
							strokeDashoffset={`${
								2 *
								Math.PI *
								14 *
								(1 - (currentSkillNode?.progress || 0))
							}`}
							className={`text-blue-400 transition-all duration-500 ease-out ${
								showSkillNodeAnimation ? "animate-pulse" : ""
							}`}
						/>
					</svg>
				</div>
				<div className="text-sm">
					<div className="text-white font-medium">
						{currentSkillNode?.name || "Variables"}
					</div>
					<div className="text-gray-400 text-xs">
						{Math.round((currentSkillNode?.progress || 0) * 100)}%
						complete
					</div>
				</div>
			</div>
		</>
	);
});

SkillNode.displayName = "SkillNode";

export default SkillNode;
