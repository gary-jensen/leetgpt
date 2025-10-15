"use client";

import React, { useEffect, useState } from "react";

interface NodeCompleteAnimationProps {
	nodeName: string;
	onComplete?: () => void;
	className?: string;
}

export const NodeCompleteAnimation: React.FC<NodeCompleteAnimationProps> = ({
	nodeName,
	onComplete,
	className = "",
}) => {
	const [isVisible, setIsVisible] = useState(true);
	const [animationPhase, setAnimationPhase] = useState<
		"enter" | "celebrate" | "exit"
	>("enter");

	useEffect(() => {
		// Enter animation
		const enterTimer = setTimeout(() => {
			setAnimationPhase("celebrate");
		}, 500);

		// Celebrate for a moment
		const celebrateTimer = setTimeout(() => {
			setAnimationPhase("exit");
		}, 2500);

		// Exit animation
		const exitTimer = setTimeout(() => {
			setIsVisible(false);
			onComplete?.();
		}, 3500);

		return () => {
			clearTimeout(enterTimer);
			clearTimeout(celebrateTimer);
			clearTimeout(exitTimer);
		};
	}, []); // Empty dependency array - onComplete is stable from useCallback

	if (!isVisible) return null;

	const getAnimationClasses = () => {
		switch (animationPhase) {
			case "enter":
				return "transform scale-0 opacity-0";
			case "celebrate":
				return "transform scale-110 opacity-100 animate-bounce";
			case "exit":
				return "transform scale-100 opacity-0";
			default:
				return "";
		}
	};

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all duration-500 ease-out ${getAnimationClasses()} ${className}`}
		>
			<div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
				<div className="text-6xl mb-4">⭐</div>
				<h2 className="text-3xl font-bold mb-2">Skill Complete!</h2>
				<p className="text-xl text-blue-200">
					You mastered {nodeName}!
				</p>
				<div className="mt-4 text-sm text-blue-300">
					Ready for the next challenge?
				</div>
			</div>
		</div>
	);
};

export default NodeCompleteAnimation;
