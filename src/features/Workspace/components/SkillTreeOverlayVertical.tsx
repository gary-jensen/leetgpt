"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProgress } from "../../../contexts/ProgressContext";
import { cn } from "@/lib/utils";
import {
	BoxIcon,
	CircleIcon,
	CloudLightningIcon,
	ParenthesesIcon,
	CodeIcon,
	DatabaseIcon,
	GlobeIcon,
	ZapIcon,
	XIcon,
} from "lucide-react";

interface SkillTreeOverlayVerticalProps {
	isOpen: boolean;
	onClose: () => void;
	originPosition?: { x: number; y: number };
}

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

// Calculate wavy vertical layout positions
const calculateWavyVerticalLayout = (
	nodeCount: number,
	isMobile: boolean = false
) => {
	const positions: { x: number; y: number }[] = [];
	const verticalSpacing = isMobile ? 120 : 180; // Smaller vertical spacing for mobile
	const waveAmplitude = isMobile ? 100 : 150; // Smaller wave amplitude for mobile

	// Wave frequency controls how many nodes per complete wave cycle
	// Formula: frequency = (2 * PI) / nodes_per_cycle
	// Examples:
	//   - 8 nodes per cycle: (2 * Math.PI) / 8 ≈ 0.785
	//   - 10 nodes per cycle: (2 * Math.PI) / 10 ≈ 0.628
	//   - 12 nodes per cycle: (2 * Math.PI) / 12 ≈ 0.524
	//   - 6 nodes per cycle: (2 * Math.PI) / 6 ≈ 1.047
	const nodesPerCycle = 8; // Adjust this number to change wave period
	const waveFrequency = (2 * Math.PI) / nodesPerCycle;

	for (let i = 0; i < nodeCount; i++) {
		// Create a sine wave pattern for x position
		const xOffset = Math.sin(i * waveFrequency) * waveAmplitude;

		positions.push({
			x: xOffset,
			y: i * verticalSpacing,
		});
	}

	return positions;
};

export const SkillTreeOverlayVertical: React.FC<
	SkillTreeOverlayVerticalProps
> = ({ isOpen, onClose, originPosition }) => {
	const { progress } = useProgress();
	const [isAnimatingIn, setIsAnimatingIn] = useState(false);
	const [isAnimatingOut, setIsAnimatingOut] = useState(false);
	const [showContent, setShowContent] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const overlayRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// Detect mobile screen size
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768); // md breakpoint
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const positions = calculateWavyVerticalLayout(
		progress.skillNodes.length,
		isMobile
	);

	// Find current node index
	const currentNodeIndex = progress.skillNodes.findIndex(
		(node) => node.id === progress.currentSkillNodeId
	);

	// Handle opening animation
	useEffect(() => {
		if (isOpen) {
			setIsAnimatingIn(true);
			setShowContent(true);
			// Stagger the content animation slightly
			const timer = setTimeout(() => {
				setIsAnimatingIn(false);
			}, 800);
			return () => clearTimeout(timer);
		} else {
			setShowContent(false);
		}
	}, [isOpen]);

	// Prevent body scroll when overlay is open
	useEffect(() => {
		if (isOpen) {
			// Store the current scroll position
			const scrollY = window.scrollY;
			// Prevent scrolling
			document.body.style.position = "fixed";
			document.body.style.top = `-${scrollY}px`;
			document.body.style.width = "100%";
		} else {
			// Restore scrolling
			const scrollY = document.body.style.top;
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
			if (scrollY) {
				window.scrollTo(0, parseInt(scrollY || "0") * -1);
			}
		}

		// Cleanup function
		return () => {
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.width = "";
		};
	}, [isOpen]);

	// Scroll to center the current node when overlay opens
	useEffect(() => {
		if (
			isOpen &&
			showContent &&
			scrollContainerRef.current &&
			currentNodeIndex !== -1
		) {
			const currentNodePos = positions[currentNodeIndex];
			const containerHeight = scrollContainerRef.current.clientHeight;

			// Calculate scroll position to center the current node
			const scrollTop = currentNodePos.y - containerHeight / 2 + 200; // +100 to account for node height

			scrollContainerRef.current.scrollTop = scrollTop;
		}
	}, [isOpen, showContent, currentNodeIndex, positions, isMobile]);

	const handleClose = () => {
		setIsAnimatingOut(true);
		setTimeout(() => {
			setIsAnimatingOut(false);
			onClose();
		}, 300);
	};

	const handleBackgroundClick = (e: React.MouseEvent) => {
		// Close on any click
		handleClose();
	};

	if (!isOpen && !showContent) return null;

	// Calculate transform origin from originPosition for the expanding circle
	const transformOrigin = originPosition
		? `${originPosition.x}px ${originPosition.y}px`
		: "center center";

	return (
		<div
			ref={overlayRef}
			className="fixed inset-0 z-[100] flex items-center justify-center"
			onClick={handleBackgroundClick}
			style={{
				overflow: "hidden", // Prevent body scroll
			}}
		>
			{/* Expanding circular background */}
			<div
				className="absolute rounded-full ease-out"
				style={{
					width: "200vmax",
					height: "200vmax",
					left: originPosition ? `${originPosition.x}px` : "50%",
					top: originPosition ? `${originPosition.y}px` : "50%",
					transform: `translate(-50%, -50%) ${
						showContent && !isAnimatingOut ? "scale(1)" : "scale(0)"
					}`,
					background:
						"radial-gradient(circle, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.6) 100%)",
					backdropFilter:
						showContent && !isAnimatingOut
							? "blur(2px)"
							: "blur(0px)",
					transition: `transform ${
						isAnimatingOut ? "300ms" : "800ms"
					} ease-out, backdrop-filter ${
						isAnimatingOut ? "300ms" : "800ms"
					} ease-out`,
				}}
			/>

			{/* Scrollable tree container wrapper */}
			<div
				ref={scrollContainerRef}
				className="relative z-[105] ease-out overflow-y-auto overflow-x-hidden pointer-events-auto"
				style={{
					maxHeight: "100vh",
					width: "100%",
					opacity: showContent && !isAnimatingOut ? 1 : 0,
					transition: `opacity ${
						isAnimatingOut ? "200ms" : "600ms"
					} ease-out`,
					transitionDelay:
						showContent && !isAnimatingOut ? "200ms" : "0ms",
					scrollbarWidth: "none",
					scrollbarColor: "#4b5563 transparent",
				}}
			>
				{/* Close button */}
				<button
					onClick={handleClose}
					className={cn(
						"sticky top-[10%] left-[10%] md:left-[30%] -translafte-x-1/2 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200",
						showContent && !isAnimatingOut
							? "opacity-100 scale-100"
							: "opacity-0 scale-75"
					)}
					style={{
						transitionDelay:
							showContent && !isAnimatingOut ? "400ms" : "0ms",
					}}
				>
					<XIcon className="w-5 h-5" />
				</button>
				{/* Tree container - wavy path */}
				<div
					ref={contentRef}
					className="relative"
					style={{
						height: `${
							progress.skillNodes.length *
								(isMobile ? 120 : 180) +
							200
						}px`, // Dynamic height based on number of nodes and mobile spacing
						minHeight: "100%",
					}}
				>
					{/* Nodes */}
					<div className="relative w-full h-full">
						{progress.skillNodes.map((node, index) => {
							const pos = positions[index];
							const IconComponent = getSkillIcon(node.name);
							const isActive =
								node.id === progress.currentSkillNodeId;
							const isCompleted = node.completed;
							const isLocked =
								index > 0 &&
								!progress.skillNodes[index - 1].completed;

							return (
								<div
									key={node.id}
									className={cn(
										"absolute flex flex-col items-center transition-opacity duration-300 ease-out",
										showContent && !isAnimatingOut
											? "opacity-100"
											: "opacity-0"
									)}
									style={{
										left: `calc(50% + ${pos.x}px)`,
										top: `${pos.y + 100}px`,
										transform: "translate(-50%, 0)",
									}}
								>
									{/* Node circle with progress */}
									<div className="relative w-20 h-20">
										<svg
											className="w-20 h-20 transform -rotate-90"
											viewBox="0 0 80 80"
										>
											{/* Background circle */}
											<circle
												cx="40"
												cy="40"
												r="36"
												fill={
													isLocked
														? "#1f2937"
														: "#1f2937"
												}
												stroke="#374151"
												strokeWidth="3"
											/>
											{/* Progress circle */}
											{!isLocked && (
												<circle
													cx="40"
													cy="40"
													r="36"
													fill="none"
													stroke={
														isCompleted
															? "#10b981"
															: isActive
															? "#3b82f6"
															: "#374151"
													}
													strokeWidth="3"
													strokeDasharray={`${
														2 * Math.PI * 36
													}`}
													strokeDashoffset={`${
														2 *
														Math.PI *
														36 *
														(1 - node.progress)
													}`}
													className="transition-all duration-500 ease-out"
												/>
											)}
										</svg>

										{/* Icon */}
										<div className="absolute inset-0 flex items-center justify-center">
											<IconComponent
												className={cn(
													"w-8 h-8 transition-colors duration-300",
													isLocked
														? "text-gray-600"
														: isCompleted
														? "text-green-400"
														: isActive
														? "text-blue-400"
														: "text-gray-400"
												)}
											/>
										</div>

										{/* Glow effect for active node */}
										{isActive && !isLocked && (
											<div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse" />
										)}
									</div>

									{/* Node label */}
									<div className="mt-3 text-center">
										<div
											className={cn(
												"text-sm font-medium transition-colors duration-300",
												isLocked
													? "text-gray-600"
													: isCompleted
													? "text-green-400"
													: isActive
													? "text-blue-400"
													: "text-gray-300"
											)}
										>
											{node.name}
										</div>
										{!isLocked && !isCompleted && (
											<div className="text-xs text-gray-500 mt-1">
												{Math.round(
													node.progress * 100
												)}
												%
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SkillTreeOverlayVertical;
