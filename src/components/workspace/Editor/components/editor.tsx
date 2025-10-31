"use client";

import Image from "next/image";
import EditorWrapper from "./EditorWrapper";
import { useState, useEffect } from "react";
import Console from "../../Console/components/console";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/contexts/ProgressContext";
import { cn } from "@/lib/utils";

const Editor = ({
	code,
	setCode,
	iframeRef,
	handleRun,
	isExecuting,
	isThinking,
	isInitialized = true,
	hasJustPassed = false,
	onShowSolution,
	showConsole = true,
	disableBorder = false,
	hideActionButtons = false,
}: {
	code: string;
	setCode: (code: string) => void;
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	handleRun: () => void;
	isExecuting: boolean;
	isThinking: boolean;
	isInitialized?: boolean;
	hasJustPassed?: boolean;
	onShowSolution?: () => void;
	showConsole?: boolean;
	disableBorder?: boolean;
	hideActionButtons?: boolean;
}) => {
	const [isDebouncing, setIsDebouncing] = useState(false);

	const handleRunClick = () => {
		// Don't run if already executing, thinking, debouncing, or not initialized
		if (isExecuting || isThinking || isDebouncing || !isInitialized) return;

		// Start debounce
		setIsDebouncing(true);

		// Call the actual run handler
		handleRun();

		// Clear debounce after 500ms
		setTimeout(() => {
			setIsDebouncing(false);
		}, 500);
	};

	// Reset debounce if AI starts thinking (to keep button disabled)
	useEffect(() => {
		if (isThinking) {
			setIsDebouncing(false);
		}
	}, [isThinking]);

	const buttonVariant = hasJustPassed
		? "correct"
		: isThinking
		? "wrong"
		: "run";

	const buttonDisabled =
		!isInitialized || isExecuting || isThinking || isDebouncing;

	return (
		<div className="flex-50 lg:flex-65 h-full flex">
			{/* <Sidebar /> */}
			<div className="flex-3 h-full bg-backgroufnd-2 flex flex-col">
				<div className="w-full h-full  flex flex-col inset-shadow-black/30f inseft-shadow-sm shadow-finset p-0 gap-6">
					<div
						className={cn(
							"ff min-h-[60vh] md:min-h-0 flex flex-1 flex-col border-1 overflow-hidden",
							!hideActionButtons && "rounded-2xl",
							disableBorder && "border-none"
						)}
					>
						<div className="w-full bg-background-2">
							<div className="w-fit px-3 py-3.5 fh-[40px] bg-background hover:bg-card flex items-center gap-3 cursor-pointer">
								<Image
									src="/js.svg"
									alt="js"
									width={20}
									height={20}
								/>
								index.js
							</div>
						</div>
						<EditorWrapper
							code={code}
							setCode={setCode}
							className="w-full md:flex-1 bg-background [&>*]:flex-1"
							focusOnLoad={true}
						/>
						{!hideActionButtons && (
							<div className="flex md:hidden xl:flex w-full h-[64px] px-3 bg-background-2 items-center gap-2 border-t-1">
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
										disabled={buttonDisabled}
										className="text-orange-600 border-orange-200 hover:bg-orange-50"
									>
										Show Solution
									</Button>
								)}

								{/* <Button
									onClick={handleDebugLevelUp}
									variant="outline"
								>
									Debug Level Up
								</Button>
								<Button onClick={handleAdd33XP} variant="outline">
									+33 XP
								</Button>
								<Button onClick={handleAdd3XP} variant="outline">
									+3 XP
								</Button> */}
							</div>
						)}
					</div>
					{showConsole && (
						<Console
							iframeRef={iframeRef}
							handleRunClick={handleRunClick}
							buttonVariant={buttonVariant}
							buttonDisabled={buttonDisabled}
							onShowSolution={onShowSolution}
							showSolutionDisabled={buttonDisabled}
						/>
					)}
				</div>
			</div>
		</div>
	);
};
export default Editor;
