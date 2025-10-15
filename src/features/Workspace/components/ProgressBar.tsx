import React, {
	useState,
	useEffect,
	useRef,
	Dispatch,
	SetStateAction,
} from "react";
import { useProgress } from "../../../contexts/ProgressContext";
import { getXPRequiredForLevel } from "../../../lib/progressionSystem";
import { cn } from "@/lib/utils";
import SkillNode from "./SkillNode";
import SkillTreeDropdown from "./SkillTreeDropdown";
// import SkillTreeOverlay from "./SkillTreeOverlay"; // Keeping for future use
import SkillTreeOverlayVertical from "./SkillTreeOverlayVertical";
import AuthButton from "@/components/AuthButton";
import XPGainAnimation from "@/components/Rewards/XPGainAnimation";

interface ProgressBarProps {
	className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ className = "" }) => {
	const [showSkillTreeDropdown, setShowSkillTreeDropdown] = useState(false);
	const [showSkillTreeOverlay, setShowSkillTreeOverlay] = useState(false);
	const [originPosition, setOriginPosition] = useState<
		{ x: number; y: number } | undefined
	>(undefined);
	const {
		progress,
		isProgressLoading,
		getCurrentSkillNode,
		getXPProgress,
		justLeveledUp,
		clearJustLeveledUp,
		animationQueue,
		isAnimationPlaying,
		completeCurrentAnimation,
		xpGainQueue,
		removeXPGain,
	} = useProgress();

	const [displayProgress, setDisplayProgress] = useState(0);
	const [isResetting, setIsResetting] = useState(false);
	const [animationDuration, setAnimationDuration] = useState(500);
	const [showSkillNodeAnimation, setShowSkillNodeAnimation] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isLevelUpAnimating, setIsLevelUpAnimating] = useState(false);
	const [levelUpAnimationPhase, setLevelUpAnimationPhase] = useState<
		"idle" | "celebrating" | "completing"
	>("idle");
	const progressBarRef = useRef<HTMLDivElement>(null);
	const progressPathRef = useRef<SVGPathElement>(null);
	const skillNodeRef = useRef<HTMLDivElement>(null);

	const currentSkillNode = getCurrentSkillNode();
	const xpProgress = getXPProgress();

	// Check if skill tree animation is queued
	const currentAnimation = animationQueue[0];
	const shouldShowSkillTree =
		currentAnimation?.type === "skillTree" && !isAnimationPlaying;

	// Show skill tree dropdown when animation is queued (completion animation)
	useEffect(() => {
		if (shouldShowSkillTree) {
			setShowSkillTreeDropdown(true);
		}
	}, [shouldShowSkillTree]);

	const handleOpenSkillTreeOverlay = (position: { x: number; y: number }) => {
		setOriginPosition(position);
		setShowSkillTreeOverlay(true);
	};

	// Handle level up animation sequence
	useEffect(() => {
		if (justLeveledUp && !isResetting) {
			// Start level up sequence
			const progressTo100 = 1 - displayProgress;
			const completionDuration = Math.min(600, 200 + progressTo100 * 600);
			setAnimationDuration(completionDuration);
			setIsAnimating(true);
			setIsLevelUpAnimating(true);
			setLevelUpAnimationPhase("celebrating");

			// Animate to 100%
			setDisplayProgress(1);

			// After completion, hold at 100% for 1 second, then reset to 0%
			setTimeout(() => {
				// Directly disable transitions on the DOM element and SVG path
				if (progressBarRef.current) {
					progressBarRef.current.style.transition = "none";
					progressBarRef.current.style.transitionDuration = "0ms";
					progressBarRef.current.style.transitionProperty = "none";
				}
				if (progressPathRef.current) {
					progressPathRef.current.style.transition = "none";
					progressPathRef.current.style.transitionDuration = "0ms";
					progressPathRef.current.style.transitionProperty = "none";
				}
				setIsResetting(true);
				setLevelUpAnimationPhase("completing");
				setDisplayProgress(0);

				// After reset, animate to new progress immediately
				setTimeout(() => {
					const progressToNew = Math.abs(xpProgress - 0);
					const newProgressDuration = Math.min(
						600,
						200 + progressToNew * 600
					);
					setAnimationDuration(newProgressDuration);
					setIsResetting(false);

					// Re-enable transitions on the DOM element and SVG path
					if (progressBarRef.current) {
						progressBarRef.current.style.transition = "";
						progressBarRef.current.style.transitionDuration = "";
						progressBarRef.current.style.transitionProperty = "";
					}
					if (progressPathRef.current) {
						progressPathRef.current.style.transition = "";
						progressPathRef.current.style.transitionDuration = "";
						progressPathRef.current.style.transitionProperty = "";
					}

					setDisplayProgress(xpProgress);
					clearJustLeveledUp();

					// Stop animation after a short delay
					setTimeout(() => {
						setIsAnimating(false);
						setIsLevelUpAnimating(false);
						setLevelUpAnimationPhase("idle");
					}, newProgressDuration + 100);
				}, 100);
			}, completionDuration + 500); // Added 300ms pause at 100%
		}
	}, [xpProgress]);

	// Handle normal progress updates
	useEffect(() => {
		if (!justLeveledUp && !isResetting) {
			const progressChange = Math.abs(xpProgress - displayProgress);
			const baseDuration = 300;
			const maxDuration = 1000;
			const calculatedDuration = Math.min(
				maxDuration,
				baseDuration + progressChange * 1000
			);
			setAnimationDuration(calculatedDuration);
			setIsAnimating(true);
			setDisplayProgress(xpProgress);

			// Stop animation after progress completes
			setTimeout(() => {
				setIsAnimating(false);
			}, calculatedDuration + 100);
		}
	}, [xpProgress, justLeveledUp, isResetting, displayProgress]);

	// Handle skill node progress animation
	useEffect(() => {
		if (currentSkillNode?.progress && currentSkillNode.progress > 0) {
			setShowSkillNodeAnimation(true);
			// Hide animation after a short duration
			setTimeout(() => {
				setShowSkillNodeAnimation(false);
			}, 1000);
		}
	}, [currentSkillNode?.progress]);

	const nextLevelXP = getXPRequiredForLevel(progress.level + 1);
	const currentLevelStartXP = getXPRequiredForLevel(progress.level);
	const currentLevelEndXP = getXPRequiredForLevel(progress.level + 1);
	const xpToNextLevel = nextLevelXP - progress.xp;
	const xpInCurrentLevel = progress.xp - currentLevelStartXP;
	const xpNeededForNextLevel = currentLevelEndXP - currentLevelStartXP;

	return (
		<div
			className={`flex justify-center items-center w-full gap-4 relative ${className}`}
		>
			<div className="flex justify-center items-center w-[80%] relative">
				{/* Skill Node Section */}
				<SkillNode
					ref={skillNodeRef}
					currentSkillNode={currentSkillNode}
					showSkillNodeAnimation={showSkillNodeAnimation}
					onOpenSkillTree={handleOpenSkillTreeOverlay}
					isProgressLoading={isProgressLoading}
				/>

				{/* Skill Tree Dropdown - for completion animations */}
				<SkillTreeDropdown
					isVisible={showSkillTreeDropdown}
					onClose={() => {
						setShowSkillTreeDropdown(false);
						if (shouldShowSkillTree) {
							completeCurrentAnimation();
						}
					}}
					autoCloseDuration={currentAnimation?.data?.duration || 1500}
					currentSkillNode={currentSkillNode}
					showSkillNodeAnimation={showSkillNodeAnimation}
					completedNodeId={currentAnimation?.data?.completedNodeId}
				/>

				{/* Skill Tree Overlay - for manual click */}
				<SkillTreeOverlayVertical
					isOpen={showSkillTreeOverlay}
					onClose={() => {
						setShowSkillTreeOverlay(false);
					}}
					originPosition={originPosition}
				/>
				{/* Curved Progress Bar with Central Level Circle */}
				<div className="relative w-[69%] h-20 flex items-center justify-center">
					<svg
						width="100%"
						height="80"
						viewBox="0 0 1250 80"
						className="overflow-visible"
					>
						{/* Background line - shows full path */}
						<path
							d={`M 10 40 Q 650 ${
								isLevelUpAnimating ? 140 : 40
							} 1240 40`}
							stroke="rgb(55, 65, 81)"
							strokeWidth="12"
							fill="none"
							strokeLinecap="round"
							className="transition-all ease-out"
							style={{
								transitionDuration: `${animationDuration}ms`,
							}}
						/>
						{/* Progress Bar - animates from flat to curved and shows progress */}
						<path
							ref={progressPathRef}
							d={`M 10 40 Q 650 ${
								isLevelUpAnimating ? 140 : 40
							} 1240 40`}
							stroke="url(#progressGradient)"
							strokeWidth="12"
							fill="none"
							strokeLinecap="round"
							strokeDasharray="1240"
							strokeDashoffset={`${
								1240 * (1 - Math.max(0, displayProgress))
							}`}
							className={`${
								isResetting ? "" : "transition-all ease-out"
							}`}
							style={{
								transitionDuration: isResetting
									? "0ms !important"
									: `${animationDuration}ms`,
								transitionProperty: isResetting
									? "none !important"
									: "all",
							}}
						/>
						{/* Gradient definition */}
						<defs>
							<linearGradient
								id="progressGradient"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="0%"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor="#3b82f6" />
								<stop offset="100%" stopColor="#9333ea" />
							</linearGradient>
						</defs>
					</svg>
					{/* Central Level Circle - follows the curve and scales */}
					<div
						className="absolute z-10 transition-all ease-out"
						style={{
							left: isLevelUpAnimating ? "50%" : "50%", // Always centered horizontally
							top: isLevelUpAnimating
								? "calc(50% + 50px)"
								: "50%", // Moves down when curved
							transform: isLevelUpAnimating
								? "translate(-50%, -50%)"
								: "translate(-50%, -50%)",
							transitionDuration: `${animationDuration}ms`,
						}}
					>
						<div
							className={cn(
								`${
									isLevelUpAnimating
										? "w-32 h-32"
										: "w-16 h-16"
								} scale-[0.8] rounded-full bg-[#202020] flex items-center justify-center shadow-lg`
							)}
							style={{
								background: (() => {
									// Calculate circle position relative to progress bar
									// Progress bar path: M 50 40 Q 700 40/140 1350 40 (viewBox 0 0 1400 80)
									// Circle is positioned at left: 50% of the container
									// In viewBox coordinates, 50% of 1400 = 700
									// Circle center is at x=700, progress bar goes from x=50 to x=1350
									const progressBarStart = 50;
									const progressBarEnd = 1350;
									const progressBarLength =
										progressBarEnd - progressBarStart; // 1300
									const circleCenter = 700; // 50% of 1400 viewBox width
									// Calculate circle position as percentage of progress bar
									const circlePosition =
										(circleCenter - progressBarStart) /
										progressBarLength; // (700-50)/1300 = 0.5
									const circleWidth = 64; // 16 * 4 (w-16 with 4px padding)
									const circleRadius = circleWidth / 2; // 32px radius
									// Convert circle radius to percentage of progress bar
									const circleRadiusPercent =
										circleRadius / progressBarLength; // 32/1300 ≈ 0.025
									// Circle starts and ends as percentages of progress bar
									const circleStart =
										circlePosition - circleRadiusPercent; // 0.5 - 0.025 = 0.475
									const circleEnd =
										circlePosition + circleRadiusPercent; // 0.5 + 0.025 = 0.525
									// Calculate how much of the circle should be colored
									let circleProgress = 0;
									let startColor = "#374151"; // Default gray
									let endColor = "#374151"; // Default gray
									if (displayProgress >= circleStart) {
										// Progress has reached the circle
										const progressInCircle = Math.min(
											displayProgress - circleStart,
											circleEnd - circleStart
										);
										circleProgress =
											progressInCircle /
											(circleEnd - circleStart); // 0 to 1
										// Calculate the colors that should be at the circle's position
										// Circle center is at circlePosition (0.5 = 50% of progress bar)
										// We need to interpolate the gradient colors based on the circle's position
										const circleCenterProgress =
											circlePosition; // 0.5
										// Interpolate between blue (#3b82f6) and purple (#9333ea) based on circle position
										// At 0% progress bar: blue, at 100% progress bar: purple
										const blueR = 59,
											blueG = 130,
											blueB = 246;
										const purpleR = 147,
											purpleG = 51,
											purpleB = 234;
										const r = Math.round(
											blueR +
												(purpleR - blueR) *
													circleCenterProgress
										);
										const g = Math.round(
											blueG +
												(purpleG - blueG) *
													circleCenterProgress
										);
										const b = Math.round(
											blueB +
												(purpleB - blueB) *
													circleCenterProgress
										);
										startColor = `rgb(${r}, ${g}, ${b})`;
										// For the end color, use a slightly more purple version
										const endR = Math.round(
											blueR +
												(purpleR - blueR) *
													Math.min(
														circleCenterProgress +
															0.1,
														1
													)
										);
										const endG = Math.round(
											blueG +
												(purpleG - blueG) *
													Math.min(
														circleCenterProgress +
															0.1,
														1
													)
										);
										const endB = Math.round(
											blueB +
												(purpleB - blueB) *
													Math.min(
														circleCenterProgress +
															0.1,
														1
													)
										);
										endColor = `rgb(${endR}, ${endG}, ${endB})`;
									}
									return `linear-gradient(to right,
										${startColor} 0%,
										${endColor} ${circleProgress * 100}%,
										${endColor} ${circleProgress * 100}%,
										#374151 ${circleProgress * 100}%,
										#374151 100%
									)`;
								})(),
								padding: isLevelUpAnimating ? "9px" : "6px",
							}}
						>
							<div className="w-full h-full rounded-full bg-[#202020] flex items-center justify-center">
								<div
									className={`${
										isLevelUpAnimating
											? "text-center"
											: "flex items-center justify-center"
									}`}
								>
									<div
										className={`text-gray-200 text-2xl font-bold transition-all duration-500 ${
											levelUpAnimationPhase ===
											"celebrating"
												? "animate-bounce scale-125"
												: levelUpAnimationPhase ===
												  "completing"
												? "animate-bounce scale-110"
												: ""
										}`}
										style={{
											transform: isLevelUpAnimating
												? "translateY(-8px)"
												: "translateY(0)",
											fontSize: isLevelUpAnimating
												? "40px"
												: "24px",
										}}
									>
										{progress.level}
									</div>
									<div
										className="text-gray-300 text-base transition-opacity duration-50 absolute"
										style={{
											opacity: isLevelUpAnimating ? 1 : 0,
											top: "60%",
											left: "50%",
											transform: "translateX(-50%)",
											whiteSpace: "nowrap",
										}}
									>
										level
									</div>
								</div>
							</div>
						</div>
					</div>
					{/* XP Display Container */}
					<div className="absolute right-0 translate-x-[calc(100%+20px)]">
						{/* XP Display Text */}
						<div className="text-sm text-gray-300">
							<span className="font-mono">
								{xpInCurrentLevel}
							</span>
							<span className="text-gray-500">/</span>
							<span className="font-mono">
								{xpNeededForNextLevel}
							</span>
							<span className="text-gray-500 ml-1">XP</span>
						</div>

						{/* XP Gain Animations positioned below XP Display */}
						{xpGainQueue.map(({ xp, id }) => (
							<XPGainAnimation
								key={id}
								xp={xp}
								onComplete={() => removeXPGain(id)}
								className="!absolute !top-8 !left-1/2 !-translate-x-1/2 !right-auto"
							/>
						))}
					</div>
				</div>
				<div className="text-sm text-gray-300 absolute right-4">
					<AuthButton />
				</div>
			</div>
		</div>
	);
};
