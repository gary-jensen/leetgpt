"use client";

import React from "react";

interface SkillTreeNodeProps {
	node: {
		id: string;
		name: string;
		completed: boolean;
		progress: number;
	};
	isActive?: boolean;
	className?: string;
}

export const SkillTreeNode: React.FC<SkillTreeNodeProps> = ({
	node,
	isActive = false,
	className = "",
}) => {
	const getNodeClasses = () => {
		let baseClasses =
			"w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300";

		if (node.completed) {
			baseClasses += " bg-green-500 shadow-lg shadow-green-500/50";
		} else if (isActive) {
			baseClasses += " bg-blue-500 shadow-lg shadow-blue-500/50";
		} else {
			baseClasses += " bg-gray-600";
		}

		return `${baseClasses} ${className}`;
	};

	return (
		<div className="flex flex-col items-center">
			<div className={getNodeClasses()}>
				{node.completed ? "✓" : node.name.charAt(0)}
			</div>
			<div className="mt-2 text-xs text-center max-w-20">
				<div className="font-medium text-gray-200">{node.name}</div>
				{!node.completed && (
					<div className="text-gray-400">
						{Math.round(node.progress * 100)}%
					</div>
				)}
			</div>
		</div>
	);
};

export default SkillTreeNode;
