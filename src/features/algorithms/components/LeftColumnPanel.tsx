import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { TestResult } from "./TestResultsDisplay";
import { ProblemStatement } from "./ProblemStatement";
import { TestCasesPanel } from "./TestCasesPanel";

interface LeftColumnPanelProps {
	problem: AlgoProblemDetail;
	testResults: TestResult[];
	processedStatement: string;
	activeTestTab: "testcase" | "results";
	setActiveTestTab: (tab: "testcase" | "results") => void;
}

export function LeftColumnPanel({
	problem,
	testResults,
	processedStatement,
	activeTestTab,
	setActiveTestTab,
}: LeftColumnPanelProps) {
	return (
		<ResizablePanel
			defaultSize={37.5}
			minSize={15}
			maxSize={50}
			className="flex flex-col"
		>
			<ResizablePanelGroup direction="vertical" className="h-full gap-2">
				{/* Problem Statement Panel */}
				<ResizablePanel
					defaultSize={60}
					minSize={30}
					maxSize={80}
					className="flex flex-col"
				>
					<ProblemStatement processedStatement={processedStatement} />
				</ResizablePanel>

				<ResizableHandle className="h-3 bg-transparent hover:bg-blue-800/60" />

				{/* Test Cases Panel */}
				<ResizablePanel
					defaultSize={40}
					minSize={20}
					maxSize={70}
					className="flex flex-col"
				>
					<TestCasesPanel
						problem={problem}
						testResults={testResults}
						activeTestTab={activeTestTab}
						setActiveTestTab={setActiveTestTab}
					/>
				</ResizablePanel>
			</ResizablePanelGroup>
		</ResizablePanel>
	);
}
