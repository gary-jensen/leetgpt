"use client";

import React, { useState, useEffect } from "react";
import { useProgress } from "../../../contexts/ProgressContext";
import { cn } from "@/lib/utils";
import { SkillNode } from "@/lib/progressionSystem";
import {
	BoxIcon,
	CircleIcon,
	CloudLightningIcon,
	ParenthesesIcon,
	CodeIcon,
	DatabaseIcon,
	GlobeIcon,
	ZapIcon,
} from "lucide-react";

interface SkillTreeDropdownProps {
	isVisible: boolean;
	onClose: () => void;
	autoCloseDuration?: number;
	currentSkillNode: SkillNode | undefined;
	showSkillNodeAnimation: boolean;
	completedNodeId?: string;
}

export const SkillTreeDropdown: React.FC<SkillTreeDropdownProps> = ({
	isVisible,
	onClose,
	autoCloseDuration,
	currentSkillNode,
	showSkillNodeAnimation,
	completedNodeId,
}) => {
	const { progress } = useProgress();
	const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [showContent, setShowContent] = useState(false);

	//temp
	const [animateProgress, setAnimateProgress] = useState(false);
	const [animate, setAnimate] = useState(false);
	const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);

	// Find the current skill node index - use completedNodeId if provided
	useEffect(() => {
		if (isVisible) {
			if (completedNodeId) {
				// Use the completed node ID from the animation data
				const completedIndex = progress.skillNodes.findIndex(
					(node) => node.id === completedNodeId
				);
				if (completedIndex !== -1) {
					setCurrentNodeIndex(completedIndex);
				}
			} else {
				// Fallback to current node
				const currentIndex = progress.skillNodes.findIndex(
					(node) => node.id === progress.currentSkillNodeId
				);
				if (currentIndex !== -1) {
					setCurrentNodeIndex(currentIndex);
				}
			}
		}
	}, [isVisible, progress.skillNodes, completedNodeId]);

	// Trigger enter animation
	useEffect(() => {
		if (isVisible) {
			setShowContent(true);
		} else {
			setShowContent(false);
			// Reset animation states when dropdown closes (after animation is done)
			// This ensures states are reset BEFORE the next opening
			setTimeout(() => {
				setAnimateProgress(false);
				setAnimate(false);
			}, 300); // Wait for close animation to finish
		}
	}, [isVisible]);

	// Auto-close if duration is provided
	useEffect(() => {
		if (autoCloseDuration && isVisible) {
			const animateProgressTimer = setTimeout(() => {
				setAnimateProgress(true);
			}, 300);
			const animateTimer = setTimeout(() => {
				setAnimate(true);
			}, 1000);

			// setTimeout(() => {
			// 	setAnimateProgress(false);
			// 	setAnimate(false);
			// }, 2000);
			const autoCloseTimer = setTimeout(() => {
				handleClose();
			}, 2500);
			return () => {
				clearTimeout(animateProgressTimer);
				clearTimeout(animateTimer);
				clearTimeout(autoCloseTimer);
			};
		}
	}, [autoCloseDuration, isVisible]);

	// Watch for node completion to trigger slide animation
	// Disabled - we now control the display through completedNodeId prop
	// useEffect(() => {
	// 	const currentNode = progress.skillNodes[currentNodeIndex];
	// 	if (currentNode && currentNode.progress >= 1 && !isAnimating) {
	// 		// Node completed, slide to next
	// 		setIsAnimating(true);
	// 		setTimeout(() => {
	// 			if (currentNodeIndex < progress.skillNodes.length - 1) {
	// 				setCurrentNodeIndex(currentNodeIndex + 1);
	// 			}
	// 			setIsAnimating(false);
	// 		}, 300);
	// 	}
	// }, [progress.skillNodes, currentNodeIndex, isAnimating]);

	const handleClose = () => {
		setShowContent(false);
		setTimeout(() => {
			onClose();
		}, 300);
	};

	const getCurrentNode = () => {
		return progress.skillNodes[currentNodeIndex];
	};

	const getNextNode = () => {
		return progress.skillNodes[currentNodeIndex + 1];
	};

	// Get icon for skill node type
	const getSkillIcon = (nodeType: string) => {
		switch (nodeType.toLowerCase()) {
			case "variables":
			case "variable":
				return BoxIcon;
			case "functions":
			case "function":
				return ParenthesesIcon;
			case "arrays":
			case "array":
				return DatabaseIcon;
			case "objects":
			case "object":
				return CircleIcon;
			case "loops":
			case "loop":
				return ZapIcon;
			case "dom":
			case "html":
				return GlobeIcon;
			case "async":
			case "promises":
				return CloudLightningIcon;
			default:
				return CodeIcon;
		}
	};

	// Get nodes to display (current + next + next+1)
	const getDisplayNodes = () => {
		const nodes = [];
		const startIndex = Math.max(0, currentNodeIndex);
		const endIndex = Math.min(
			progress.skillNodes.length - 1,
			currentNodeIndex + 2
		);

		for (let i = startIndex; i <= endIndex; i++) {
			if (progress.skillNodes[i]) {
				nodes.push({
					...progress.skillNodes[i],
					index: i,
					position: i - startIndex, // 0 for first, 1 for second, 2 for third
				});
			}
		}
		return nodes;
	};

	if (!isVisible) return null;

	return (
		<div
			className={cn(
				"absolute top-0 left-20 transform -translate-x-1/2 mt-2 w-[151px] bg-background/98 rounded-lg shadow-2xl z-50 transition-all duration-300 ease-out flex items-center justify-center pfy-20 overflow-hidden",
				showContent
					? "opacity-100 h-[140px] pfy-25 scalef-100"
					: "opacity-0 h-0 scafle-95 py-0"
			)}
		>
			{getDisplayNodes().map((node, index) => {
				const IconComponent = getSkillIcon(node.name);
				const isFirstNode = index === 0;
				const isLastNode = index === getDisplayNodes().length - 1;

				return (
					<div
						key={node.id}
						className={cn(
							"w-16 h-16 absolute transition-transform duration-800 ease-in-out translate-y-[-10px]",
							node.position === 1 && "left-46",
							node.position === 2 && "left-92",
							animate && "translate-x-[-140px]"
						)}
					>
						{/* Connection line (for all nodes except the last) */}
						{!isLastNode && (
							<svg
								className="absolute translate-x-[-43.5px] w-[200px] h-16"
								viewBox="0 0 32 32"
							>
								{/* Background line */}
								<path
									d="M 16 16 L100 16"
									fill="none"
									stroke="#3d4554"
									strokeWidth="2"
								/>
								{/* Animated blue line */}
								<path
									d="M 16 16 L100 16"
									fill="none"
									stroke="#3b82f6"
									strokeWidth="2"
									strokeDasharray="84"
									strokeDashoffset={
										animate && isFirstNode ? "0" : "84"
									}
									className="transition-all duration-800 ease-out"
								/>
							</svg>
						)}
						{/* Progress circle */}
						<svg
							className="w-16 h-16 transform -rotate-90 blur-[0.55px]"
							viewBox="0 0 32 32"
						>
							<circle
								cx="16"
								cy="16"
								r="14"
								fill="#2a2f3f"
								stroke="none"
								strokeWidth="0"
							/>
							<circle
								cx="16"
								cy="16"
								r="14"
								fill="none"
								stroke="#3d4554"
								strokeWidth="2"
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
									(1 -
										(isFirstNode
											? animateProgress
												? 1
												: 0.7
											: node.progress || 0))
								}`}
								className={`text-blue-400 transition-all duration-500 ease-out ${
									showSkillNodeAnimation && isFirstNode
										? "animate-pulse"
										: ""
								}`}
							/>
						</svg>

						{/* Icon */}
						<IconComponent className="absolute top-0 translate-4.5 left-0 w-7 h-7 text-blue-400" />

						{/* Label */}
						<span className="absolute top-16 left-0 translate-x-[calc(-50%+32px)] text-center text-sm">
							{node.name}
						</span>
					</div>
				);
			})}
		</div>
	);
};

export default SkillTreeDropdown;

// const _ContentNotUsed = () => {
// 	return (
// 		<div className="p-4">
// 				<div className="relative overflow-hidden">
// 					{/* Current Node */}
// 					<div
// 						className={cn(
// 							"transition-transform duration-300 ease-out",
// 							isAnimating ? "-translate-x-full" : "translate-x-0"
// 						)}
// 					>
// 						<div className="flex items-center space-x-4">
// 							{/* Progress Circle */}
// 							<div className="w-12 h-12 relative">
// 								<svg
// 									className="w-12 h-12 transform -rotate-90"
// 									viewBox="0 0 48 48"
// 								>
// 									<circle
// 										cx="24"
// 										cy="24"
// 										r="20"
// 										fill="none"
// 										stroke="currentColor"
// 										strokeWidth="3"
// 										className="text-gray-600"
// 									/>
// 									<circle
// 										cx="24"
// 										cy="24"
// 										r="20"
// 										fill="none"
// 										stroke="currentColor"
// 										strokeWidth="3"
// 										strokeDasharray={`${2 * Math.PI * 20}`}
// 										strokeDashoffset={`${
// 											2 *
// 											Math.PI *
// 											20 *
// 											(1 -
// 												(getCurrentNode()?.progress ||
// 													0))
// 										}`}
// 										className="text-blue-400 transition-all duration-500 ease-out"
// 									/>
// 								</svg>
// 								{/* Completion checkmark */}
// 								{getCurrentNode()?.progress >= 1 && (
// 									<div className="absolute inset-0 flex items-center justify-center">
// 										<svg
// 											className="w-6 h-6 text-green-400"
// 											fill="none"
// 											stroke="currentColor"
// 											viewBox="0 0 24 24"
// 										>
// 											<path
// 												strokeLinecap="round"
// 												strokeLinejoin="round"
// 												strokeWidth={3}
// 												d="M5 13l4 4L19 7"
// 											/>
// 										</svg>
// 									</div>
// 								)}
// 							</div>

// 							{/* Node Info */}
// 							<div className="flex-1">
// 								<h4 className="text-white font-medium text-lg">
// 									{getCurrentNode()?.name || "Current Skill"}
// 								</h4>
// 								<p className="text-gray-400 text-sm">
// 									{Math.round(
// 										(getCurrentNode()?.progress || 0) * 100
// 									)}
// 									% complete
// 								</p>
// 								{getCurrentNode()?.progress >= 1 && (
// 									<p className="text-green-400 text-sm font-medium">
// 										✓ Completed!
// 									</p>
// 								)}
// 							</div>
// 						</div>
// 					</div>

// 					{/* Next Node (slides in from right) */}
// 					{currentNodeIndex < progress.skillNodes.length - 1 && (
// 						<div
// 							className={cn(
// 								"absolute top-0 left-0 w-full transition-transform duration-300 ease-out",
// 								isAnimating
// 									? "translate-x-0"
// 									: "translate-x-full"
// 							)}
// 						>
// 							<div className="flex items-center space-x-4">
// 								{/* Next Node Circle */}
// 								<div className="w-12 h-12 relative">
// 									<svg
// 										className="w-12 h-12 transform -rotate-90"
// 										viewBox="0 0 48 48"
// 									>
// 										<circle
// 											cx="24"
// 											cy="24"
// 											r="20"
// 											fill="none"
// 											stroke="currentColor"
// 											strokeWidth="3"
// 											className="text-gray-600"
// 										/>
// 										<circle
// 											cx="24"
// 											cy="24"
// 											r="20"
// 											fill="none"
// 											stroke="currentColor"
// 											strokeWidth="3"
// 											strokeDasharray={`${
// 												2 * Math.PI * 20
// 											}`}
// 											strokeDashoffset={`${
// 												2 *
// 												Math.PI *
// 												20 *
// 												(1 -
// 													(getNextNode()?.progress ||
// 														0))
// 											}`}
// 											className="text-blue-400 transition-all duration-500 ease-out"
// 										/>
// 									</svg>
// 								</div>

// 								{/* Next Node Info */}
// 								<div className="flex-1">
// 									<h4 className="text-white font-medium text-lg">
// 										{getNextNode()?.name || "Next Skill"}
// 									</h4>
// 									<p className="text-gray-400 text-sm">
// 										{Math.round(
// 											(getNextNode()?.progress || 0) * 100
// 										)}
// 										% complete
// 									</p>
// 									<p className="text-blue-400 text-sm">
// 										Next up
// 									</p>
// 								</div>
// 							</div>
// 						</div>
// 					)}
// 				</div>

// 				{/* Progress indicator */}
// 				<div className="mt-4 flex space-x-1">
// 					{progress.skillNodes.map((_, index) => (
// 						<div
// 							key={index}
// 							className={cn(
// 								"h-1 flex-1 rounded-full transition-colors duration-300",
// 								index === currentNodeIndex
// 									? "bg-blue-400"
// 									: index < currentNodeIndex
// 									? "bg-green-400"
// 									: "bg-gray-600"
// 							)}
// 						/>
// 					))}
// 				</div>
// 			</div>
// 	);
// };
