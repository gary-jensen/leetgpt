import { ResizablePanel } from "@/components/ui/resizable";
import Editor from "@/components/workspace/Editor/components/editor";
import { TestResult } from "./TestResultsDisplay";

interface EditorPanelProps {
	code: string;
	setCode: (code: string) => void;
	testResults: TestResult[];
	isExecuting: boolean;
	onRun: () => void;
	onShowSolution: () => void;
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	isThinking: boolean;
}

export function EditorPanel({
	code,
	setCode,
	testResults,
	isExecuting,
	onRun,
	onShowSolution,
	iframeRef,
	isThinking,
}: EditorPanelProps) {
	return (
		<ResizablePanel
			defaultSize={37.5}
			minSize={30}
			className="border-1 rounded-2xl"
		>
			<div className="h-full flex rounfded-2xl overflow-hidden bforder-1">
				<div className="flex-3 h-full bg-background-2 flex flex-col">
					<div className="w-full h-full flex flex-col inset-shadow-black/30 inset-shadow-sm shadow-inner p-0 gap-6">
						<div className="min-h-[60vh] md:min-h-0 flex flex-1 flex-col roundefd-2xl overflow-hidden">
							<Editor
								code={code}
								setCode={setCode}
								iframeRef={iframeRef}
								handleRun={onRun}
								isExecuting={isExecuting}
								isThinking={isThinking}
								isInitialized={true}
								hasJustPassed={
									testResults.length > 0 &&
									testResults.every((r) => r.passed)
								}
								onShowSolution={onShowSolution}
								showConsole={false}
								disableBorder={true}
							/>
						</div>
					</div>
				</div>
			</div>
		</ResizablePanel>
	);
}
