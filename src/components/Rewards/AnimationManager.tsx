"use client";

import React from "react";
import { useProgress } from "../../contexts/ProgressContext";
import NodeCompleteAnimation from "./NodeCompleteAnimation";

export const AnimationManager: React.FC = () => {
	const {
		removeNodeComplete,
		animationQueue,
		isAnimationPlaying,
		completeCurrentAnimation,
	} = useProgress();

	// Get the current animation from the queue
	const currentAnimation = animationQueue[0];

	return (
		<>
			{/* XP Gain Animations are now rendered in ProgressBar */}

			{/* Queued Animations - Only one at a time */}
			{currentAnimation && !isAnimationPlaying && (
				<>
					{currentAnimation.type === "nodeComplete" && (
						<NodeCompleteAnimation
							nodeName={currentAnimation.data?.nodeName || "Node"}
							onComplete={() => {
								removeNodeComplete(currentAnimation.id);
								completeCurrentAnimation();
							}}
						/>
					)}
					{currentAnimation.type === "skillTree" && (
						// Skill tree is now handled directly in ProgressBar
						<div style={{ display: "none" }} />
					)}
				</>
			)}
		</>
	);
};

export default AnimationManager;
