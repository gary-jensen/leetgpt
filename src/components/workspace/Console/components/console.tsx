"use client";

import { Button } from "@/components/ui/button";
import { SquareChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

const Console = ({
	iframeRef,
	handleRunClick,
	buttonVariant,
	buttonDisabled,
	onShowSolution,
	showSolutionDisabled,
}: {
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	handleRunClick: () => void;
	buttonVariant: "correct" | "wrong" | "submit";
	buttonDisabled: boolean;
	onShowSolution?: () => void;
	showSolutionDisabled?: boolean;
}) => {
	const [isGlowing, setIsGlowing] = useState(false);

	useEffect(() => {
		// Listen for messages from the iframe that indicate console activity
		const handleMessage = (event: MessageEvent) => {
			if (!event.data || typeof event.data !== "object") {
				return;
			}

			const { type, logs } = event.data;

			// Trigger glow effect when execution completes with logs
			if (type === "execution-complete" && logs && logs.length > 0) {
				setIsGlowing(true);
				// Remove glow after animation completes
				setTimeout(() => setIsGlowing(false), 1000);
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	return (
		<div
			className={`w-full fh-[400px] min-h-[60vh] md:min-h-0  flex-1 bg-background borderf-t border-border flex flex-col pb-4 rounded-2xl border-1 transition-all duration-300 overflow-hidden ${
				isGlowing ? "console-glow" : ""
			}`}
		>
			<div className="w-full hf-[40px] flex items-center gap-4 cursor-pointer justify-start px-3 border-b-1 py-3.5 shadow-md">
				{/* <Image src="/js.svg" alt="js" width={24} height={24} /> */}
				<div className="flex items-center gap-2">
					<SquareChevronRightIcon size={20} />
					Console
				</div>
				<div className="hidden md:flex xl:hidden gap-2">
					<Button
						onClick={handleRunClick}
						variant={buttonVariant}
						disabled={buttonDisabled}
					>
						Run
					</Button>
					{onShowSolution && (
						<Button
							onClick={onShowSolution}
							variant="outline"
							disabled={showSolutionDisabled}
							className="text-orange-600 border-orange-200 hover:bg-orange-50"
						>
							Show Solution
						</Button>
					)}
				</div>
				{/* <Button onClick={handleRun}>Run</Button> */}
			</div>

			{/* Console Output */}
			<div className="flex-1 bg-transparent px-3">
				<iframe
					ref={iframeRef}
					sandbox="allow-scripts allow-modals"
					style={{
						width: "100%",
						height: "100%",
						background: "transparent",
						border: "none",
					}}
					className="bg-transparent"
				/>
			</div>

			<style jsx>{`
				@keyframes console-pulse {
					0%,
					100% {
						box-shadow: 0 0 3px rgba(59, 130, 246, 0.5),
							0 0 6px rgba(59, 130, 246, 0.3);
						border-color: rgba(59, 130, 246, 0.6);
					}
					50% {
						box-shadow: 0 0 10px rgba(59, 130, 246, 0.8),
							0 0 15px rgba(59, 130, 246, 0.5);
						border-color: rgba(59, 130, 246, 1);
					}
				}

				.console-glow {
					animation: console-pulse 0.6s ease-in-out;
				}
			`}</style>
		</div>
	);
};
export default Console;
