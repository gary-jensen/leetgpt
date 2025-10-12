"use client";

import Image from "next/image";
import EditorWrapper from "./EditorWrapper";
import { useState } from "react";
import Console from "../../Console/components/console";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/contexts/ProgressContext";

const Sidebar = () => {
	return <div className="flex-1 h-full bg-background-2"></div>;
};

const Editor = ({
	code,
	setCode,
	iframeRef,
	handleRun,
}: {
	code: string;
	setCode: (code: string) => void;
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	handleRun: () => void;
}) => {
	const { addStepXP } = useProgress();

	const handleDebugLevelUp = () => {
		// Add enough XP to trigger a level up (this will set justLeveledUp flag)
		addStepXP(1000); // This should trigger a level up
	};

	const handleAdd33XP = () => {
		// Add 250 XP to test level up animation (should trigger level up)
		addStepXP(33);
	};

	const handleAdd3XP = () => {
		// Add 250 XP to test level up animation (should trigger level up)
		addStepXP(3);
	};
	return (
		<div className="flex-65 h-full flex">
			{/* <Sidebar /> */}
			<div className="flex-3 h-full bg-backgroufnd-2 flex flex-col">
				<div className="w-full h-full  flex flex-col inset-shadow-black/30f inseft-shadow-sm shadow-finset p-0 gap-6">
					<div className="flex flex-1 flex-col rounded-2xl border-1 overflow-hidden">
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
							className="w-full flex-1 bg-background"
							focusOnLoad={false}
						/>
						<div className="w-full h-[64px] px-3 bg-background-2 flex items-center gap-2 border-t-1">
							<Button onClick={handleRun} variant="run">
								Run
							</Button>
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
					</div>
					<Console iframeRef={iframeRef} handleRun={handleRun} />
				</div>
			</div>
		</div>
	);
};
export default Editor;
