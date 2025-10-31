import { ResizablePanel } from "@/components/ui/resizable";
import { AlgoProblemDetail, AlgoLesson } from "@/types/algorithm-types";
import { ProblemStatement } from "./ProblemStatement";

interface LeftColumnPanelProps {
	problem: AlgoProblemDetail;
	processedStatement: string;
	relatedLessons: AlgoLesson[];
}

export function LeftColumnPanel({
	problem,
	processedStatement,
	relatedLessons,
}: LeftColumnPanelProps) {
	return (
		<ResizablePanel
			defaultSize={37.5}
			minSize={15}
			maxSize={50}
			className="flex flex-col"
		>
			<ProblemStatement
				problem={problem}
				processedStatement={processedStatement}
				topics={problem.topics}
				relatedLessons={relatedLessons}
			/>
		</ResizablePanel>
	);
}
