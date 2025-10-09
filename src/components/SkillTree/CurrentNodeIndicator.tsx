"use client";

import React from "react";
import { useProgress } from "../../contexts/ProgressContext";

interface CurrentNodeIndicatorProps {
	className?: string;
}

export const CurrentNodeIndicator: React.FC<CurrentNodeIndicatorProps> = ({
	className = "",
}) => {
	const { getCurrentSkillNode } = useProgress();
	const currentSkillNode = getCurrentSkillNode();

	if (!currentSkillNode) return null;

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className="relative">
				<div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
					<span className="text-white text-xs font-bold">
						{currentSkillNode.name.charAt(0)}
					</span>
				</div>
				{/* Progress ring */}
				<svg
					className="absolute inset-0 w-8 h-8 transform -rotate-90"
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
							2 * Math.PI * 14 * (1 - currentSkillNode.progress)
						}`}
						className="text-blue-400 transition-all duration-500 ease-out"
					/>
				</svg>
			</div>
			<div className="text-sm">
				<div className="text-white font-medium">
					{currentSkillNode.name}
				</div>
				<div className="text-gray-400 text-xs">
					{Math.round(currentSkillNode.progress * 100)}% complete
				</div>
			</div>
		</div>
	);
};

export default CurrentNodeIndicator;
