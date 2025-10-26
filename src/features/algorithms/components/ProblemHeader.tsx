import { AlgoProblemDetail } from "@/types/algorithm-types";

interface ProblemHeaderProps {
	problem: AlgoProblemDetail;
	onReset: () => void;
	onHint: () => void;
}

export function ProblemHeader({
	problem,
	onReset,
	onHint,
}: ProblemHeaderProps) {
	return (
		<div className="flex items-center justify-between p-4 border-b border-border bg-background">
			<div className="flex items-center gap-4">
				<h1 className="text-xl font-semibold">{problem.title}</h1>
				<div className="flex items-center gap-2">
					<span
						className={`px-2 py-1 text-xs rounded-full ${
							problem.difficulty === "easy"
								? "bg-green-100 text-green-800"
								: problem.difficulty === "medium"
								? "bg-yellow-100 text-yellow-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{problem.difficulty.toUpperCase()}
					</span>
					<div className="flex gap-1">
						{problem.topics.map((topic) => (
							<span
								key={topic}
								className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
							>
								{topic}
							</span>
						))}
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<button
					onClick={onReset}
					className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-gray-50"
				>
					Reset
				</button>
				<button
					onClick={onHint}
					className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-gray-50"
				>
					Hint
				</button>
			</div>
		</div>
	);
}
