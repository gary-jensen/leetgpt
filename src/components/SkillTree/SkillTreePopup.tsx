"use client";

import React, { useState, useEffect } from "react";
import { useProgress } from "../../contexts/ProgressContext";
import SkillTreeNode from "./SkillTreeNode";

interface SkillTreePopupProps {
	onClose: () => void;
	className?: string;
	autoCloseDuration?: number;
}

export const SkillTreePopup: React.FC<SkillTreePopupProps> = ({
	onClose,
	className = "",
	autoCloseDuration,
}) => {
	const { progress } = useProgress();
	const [isVisible, setIsVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	// Trigger enter animation on mount
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 10); // Small delay to ensure the component is mounted

		return () => clearTimeout(timer);
	}, []);

	// Auto-close if duration is provided
	useEffect(() => {
		if (autoCloseDuration && isVisible) {
			const autoCloseTimer = setTimeout(() => {
				handleClose();
			}, autoCloseDuration);

			return () => clearTimeout(autoCloseTimer);
		}
	}, [autoCloseDuration, isVisible]);

	const handleClose = () => {
		setIsClosing(true);
		// Close after animation completes
		setTimeout(() => {
			onClose();
		}, 300);
	};

	const getAnimationClasses = () => {
		if (isClosing) {
			return "opacity-0 scale-95";
		}
		if (isVisible) {
			return "opacity-100 scale-100";
		}
		return "opacity-0 scale-95";
	};

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center bg-black/25 transition-all duration-300 ease-out ${getAnimationClasses()} ${className}`}
			onClick={handleClose}
		>
			<div
				className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="text-center mb-8">
					<h2 className="text-3xl font-bold text-white mb-2">
						Skill Tree
					</h2>
					<p className="text-gray-400">Your learning progress</p>
					<button
						onClick={handleClose}
						className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
					>
						Close
					</button>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
					{progress.skillNodes.map((node, index) => (
						<div key={node.id} className="relative">
							{/* Connection line to next node */}
							{index < progress.skillNodes.length - 1 && (
								<div className="absolute top-8 left-16 w-8 h-0.5 bg-gray-600 transform translate-x-4" />
							)}

							<SkillTreeNode
								node={node}
								isActive={
									node.id === progress.currentSkillNodeId
								}
							/>
						</div>
					))}
				</div>

				<div className="mt-8 text-center">
					<div className="text-gray-400 text-sm">
						Level {progress.level} • {progress.xp} XP
					</div>
				</div>
			</div>
		</div>
	);
};

export default SkillTreePopup;
