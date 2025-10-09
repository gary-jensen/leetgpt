"use client";

import React, { useEffect, useState } from "react";

interface XPGainAnimationProps {
	xp: number;
	onComplete?: () => void;
	className?: string;
}

export const XPGainAnimation: React.FC<XPGainAnimationProps> = ({
	xp,
	onComplete,
	className = "",
}) => {
	const [isVisible, setIsVisible] = useState(true);
	const [animationPhase, setAnimationPhase] = useState<
		"enter" | "hold" | "exit"
	>("enter");

	useEffect(() => {
		// Enter animation
		const enterTimer = setTimeout(() => {
			setAnimationPhase("hold");
		}, 300);

		// Hold for a moment
		const holdTimer = setTimeout(() => {
			setAnimationPhase("exit");
		}, 800);

		// Exit animation
		const exitTimer = setTimeout(() => {
			setIsVisible(false);
			onComplete?.();
		}, 1200);

		return () => {
			clearTimeout(enterTimer);
			clearTimeout(holdTimer);
			clearTimeout(exitTimer);
		};
	}, []); // Empty dependency array - onComplete is stable from useCallback

	if (!isVisible) return null;

	const getAnimationClasses = () => {
		switch (animationPhase) {
			case "enter":
				return "transform translate-y-0 scale-100 opacity-100";
			case "hold":
				return "transform translate-y-0 scale-100 opacity-100";
			case "exit":
				return "transform -translate-y-8 scale-75 opacity-0";
			default:
				return "";
		}
	};

	return (
		<div
			className={`fixed top-20 right-8 z-50 pointer-events-none transition-all duration-500 ease-out ${getAnimationClasses()} ${className}`}
		>
			<div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-lg flex items-center gap-2">
				<span className="text-green-200">+</span>
				<span>{xp}</span>
				<span className="text-green-200 text-sm">XP</span>
			</div>
		</div>
	);
};

export default XPGainAnimation;
