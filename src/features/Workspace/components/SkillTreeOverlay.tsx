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

interface SkillTreeOverlayProps {
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

// Calculate linear layout positions
const calculateLinearLayout = (
	nodeCount: number,
	isMobile: boolean = false
) => {
	const positions: { x: number; y: number }[] = [];
	const spacing = isMobile ? 120 : 200; // Smaller spacing for mobile
	const totalWidth = (nodeCount - 1) * spacing;
	const startX = -totalWidth / 2; // Center the line

	for (let i = 0; i < nodeCount; i++) {
		positions.push({
			x: startX + i * spacing,
			y: 0, // All nodes on same horizontal line
		});
	}

	return positions;
};

export const SkillTreeOverlay: React.FC<SkillTreeOverlayProps> = ({
	isOpen,
	onClose,
	originPosition,
}) => {
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
		console.log("useEffect");
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768); // md breakpoint
			console.log(window.innerWidth < 768 ? "ismobile" : "isnotmobile");
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const positions = calculateLinearLayout(
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

	// Scroll to center the current node when overlay opens
	useEffect(() => {
		if (
			isOpen &&
			showContent &&
			scrollContainerRef.current &&
			currentNodeIndex !== -1
		) {
			const currentNodePos = positions[currentNodeIndex];
			const containerWidth = scrollContainerRef.current.clientWidth;

			// Calculate scroll position to center the current node
			// Node is at 50% + currentNodePos.x, we want it centered in viewport
			const scrollLeft =
				currentNodePos.x +
				(contentRef.current?.clientWidth || 1000) / 2 -
				containerWidth / 2;

			scrollContainerRef.current.scrollLeft = scrollLeft;
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
			{/* Close button */}
			<button
				onClick={handleClose}
				className={cn(
					"absolute top-[10%] left-1/2 -translate-x-1/2 z-[110] w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all duration-200",
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

			{/* Scrollable tree container wrapper */}
			<div
				ref={scrollContainerRef}
				className="relative z-[105] ease-out overflow-x-auto overflow-y-hidden"
				style={{
					maxWidth: "90vw",
					width: "90vw",
					height: "200px",
					opacity: showContent && !isAnimatingOut ? 1 : 0,
					transition: `opacity ${
						isAnimatingOut ? "200ms" : "600ms"
					} ease-out`,
					transitionDelay:
						showContent && !isAnimatingOut ? "200ms" : "0ms",
					scrollbarWidth: "thin",
					scrollbarColor: "#4b5563 transparent",
				}}
			>
				{/* Tree container - 100% transparent */}
				<div
					ref={contentRef}
					className="relative h-full"
					style={{
						width: `${progress.skillNodes.length * 200}px`, // Dynamic width based on number of nodes
						minWidth: "100%",
					}}
				>
					{/* Connection lines */}
					{progress.skillNodes.map((node, index) => {
						if (index === progress.skillNodes.length - 1)
							return null;

						const startPos = positions[index];
						const endPos = positions[index + 1];

						// Calculate line position and rotation
						const deltaX = endPos.x - startPos.x;
						const deltaY = endPos.y - startPos.y;
						const angle =
							Math.atan2(deltaY, deltaX) * (180 / Math.PI);

						// Adjust length to account for node radius (40px)
						const nodeRadius = 40;
						const fullLength = Math.sqrt(
							deltaX * deltaX + deltaY * deltaY
						);
						const length = fullLength - nodeRadius * 2;
						const offsetX = (deltaX / fullLength) * nodeRadius;
						const offsetY = (deltaY / fullLength) * nodeRadius;

						const isCompleted = node.completed;

						// Always render a line, either solid gradient or dashed gray
						if (isCompleted) {
							return (
								<div
									key={`line-${index}`}
									className={cn(
										"absolute transition-opacity duration-300 ease-out pointer-events-none",
										showContent && !isAnimatingOut
											? "opacity-100"
											: "opacity-0"
									)}
									style={{
										left: `calc(50% + ${startPos.x}px)`,
										top: `calc(50% - ${
											nodeRadius / 2
										}px + 3px)`,
										width: `${length * 1.5}px`,
										height: "3px",
										background:
											"linear-gradient(to right, #3b82f6, #8b5cf6)",
										transformOrigin: "0 50%",
										transform: `rotate(${angle}deg)`,
									}}
								/>
							);
						} else {
							return (
								<div
									key={`line-${index}`}
									className={cn(
										"absolute transition-opacity duration-300 ease-out pointer-events-none",
										showContent && !isAnimatingOut
											? "opacity-100"
											: "opacity-0"
									)}
									style={{
										left: `calc(50% + ${startPos.x}px)`,
										top: `calc(50% - ${
											nodeRadius / 2
										}px + 3px)`,
										width: `${length * 1.5}px`,
										height: "0px",
										borderTop: "3px dashed #374151",
										transformOrigin: "0 50%",
										transform: `rotate(${angle}deg)`,
									}}
								/>
							);
						}
					})}

					{/* Nodes */}
					<div className="absolute inset-0">
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
										top: "50%",
										transform: "translate(-50%, -50%)",
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
											<div className=" absolute bottom-[-8px] translate-y-[100%] left-1/2 translate-x-[-50%] text-xs text-gray-500 mt-1">
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

export default SkillTreeOverlay;
