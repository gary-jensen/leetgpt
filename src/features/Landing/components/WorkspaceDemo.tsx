"use client";

import { useDemoLesson } from "../hooks/useDemoLesson";
import useDemoConsole from "../hooks/useDemoConsole";
import DemoChatMessageList from "./DemoChatMessageList";
import EditorWrapper from "@/components/workspace/Editor/components/EditorWrapper";
import Console from "@/components/workspace/Console/components/console";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MessageSquareIcon } from "lucide-react";
import { trackLandingCTAClick } from "@/lib/analytics";

export default function WorkspaceDemo() {
	const {
		currentStep,
		code,
		setCode,
		messages,
		isThinking,
		hasJustPassed,
		handleTestResults,
		messagesEndRef,
		isLastStep,
		streamingMessageId,
		displayedWords,
	} = useDemoLesson();

	const { iframeRef, isExecuting, handleTest } = useDemoConsole(
		code,
		currentStep,
		handleTestResults
	);

	const handleRunClick = () => {
		if (isExecuting || isThinking) return;
		handleTest();
	};

	const buttonVariant = hasJustPassed
		? "correct"
		: isThinking
		? "wrong"
		: "submit";

	const buttonDisabled = isExecuting || isThinking;

	return (
		<div className="w-full h-full maxf-h-[calc(85vh-48px)] md:max-h-[calc(70vh-48px)] flex flex-col md:flex-row gap-4 font-inter overflow-y-auto md:overflow-y-hidden md:overflow-hidden">
			{/* Chat Section */}
			<div className="w-full md:w-[35%] h-[40vh] min-h-[40vh] max-h-[40vh] md:min-h-[calc(70vh-50px)] flex-1 md:max-h-[calc(70vh-50px)] flex flex-col bg-background rounded-2xl border border-border overflow-hidden overflow-y-auto">
				{/* Chat Header */}
				<div className="px-3 py-3.5 flex items-center gap-2 border-b shadow-md">
					<MessageSquareIcon size={18} />
					Chat
				</div>

				{/* Messages */}
				<DemoChatMessageList
					messages={messages}
					messagesEndRef={messagesEndRef}
					isThinking={isThinking}
					streamingMessageId={streamingMessageId}
					displayedWords={displayedWords}
				/>

				{/* CTA on last step */}
				{isLastStep && (
					<div className="px-4 py-4 border-t border-border bg-background-2">
						<Link
							href="/login"
							onClick={() =>
								trackLandingCTAClick("demo_complete")
							}
							className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-2xl text-center block transition-colors duration-200"
						>
							Sign Up Free →
						</Link>
					</div>
				)}
			</div>

			{/* Editor & Console Section */}
			<div className="w-full md:w-[65%] h-full min-h-[calc(85vh-48px)] max-h-[calc(85vh-48px)] md:min-h-[calc(70vh-48px)] md:max-h-[calc(70vh-48px)] grid grid-rows-2 md:grid-rows-[55%_45%] gap-4">
				{/* Editor */}
				<div className=" flex flex-col rounded-2xl border border-border overflow-hidden bg-background md:mfin-h-[40vh] md:min-fh-0">
					{/* Editor Header */}
					<div className="w-full bg-background-2 border-b border-border">
						<div className="w-fit px-3 py-3 bg-background hover:bg-card flex items-center gap-3 cursor-pointer transition-colors">
							<Image
								src="/js.svg"
								alt="js"
								width={20}
								height={20}
							/>
							<span className="text-sm text-foreground">
								index.js
							</span>
						</div>
					</div>

					{/* Editor */}
					<div className="h-[calc(40vh-64px-45px)] md:h-[calc(40vh-64px-45px)] md:flex-1">
						<EditorWrapper
							code={code}
							setCode={setCode}
							className="w-full h-full bg-background"
							focusOnLoad={false}
						/>
					</div>

					{/* Run Button */}
					<div className="w-full h-[64px] px-3 bg-background-2 items-center gap-2 border-t border-border flex md:hidden xl:flex">
						<Button
							onClick={handleRunClick}
							variant={buttonVariant}
							disabled={buttonDisabled}
						>
							{isExecuting ? "Running..." : "Run"}
						</Button>
					</div>
				</div>

				{/* Console */}
				<div className="flex flex-col [&>div]:flex-1 [&>div]:min-h-[calc(40vh-34px)] [&>div]:max-h-[calc(40vh-34px)] [&>div]:md:min-h-[calc(30.75vh-34px)] [&>div]:md:max-h-[calc(30.75vh-34px)]">
					<Console
						iframeRef={iframeRef}
						handleRunClick={handleRunClick}
						buttonVariant={buttonVariant}
						buttonDisabled={buttonDisabled}
					/>
				</div>
			</div>
		</div>
	);
}
