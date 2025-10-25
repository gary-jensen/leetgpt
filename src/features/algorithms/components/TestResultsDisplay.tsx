"use client";

import { useState } from "react";
import { TestCaseItem } from "./TestCaseItem";
import Console from "@/components/workspace/Console/components/console";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Terminal } from "lucide-react";

export interface TestResult {
	case: number;
	passed: boolean;
	input: any[];
	expected: any;
	actual?: any;
	error?: string;
}

interface TestResultsDisplayProps {
	results: TestResult[];
	isExecuting: boolean;
	iframeRef: React.RefObject<HTMLIFrameElement | null>;
	handleRunClick: () => void;
	buttonVariant: "correct" | "wrong" | "run";
	buttonDisabled: boolean;
	onShowSolution?: () => void;
	showSolutionDisabled?: boolean;
	showConsoleTab?: boolean;
}

export function TestResultsDisplay({
	results,
	isExecuting,
	iframeRef,
	handleRunClick,
	buttonVariant,
	buttonDisabled,
	onShowSolution,
	showSolutionDisabled,
	showConsoleTab = true,
}: TestResultsDisplayProps) {
	const [activeTab, setActiveTab] = useState<"tests" | "console">("tests");

	const passedCount = results.filter((r) => r.passed).length;
	const totalCount = results.length;
	const allPassed = passedCount === totalCount && totalCount > 0;

	return (
		<div className="w-full bg-background-2 border-t border-border">
			{/* Tab Headers */}
			<div className="flex border-b border-border">
				<button
					onClick={() => setActiveTab("tests")}
					className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
						activeTab === "tests"
							? "border-primary text-primary"
							: "border-transparent text-muted-foreground hover:text-foreground"
					}`}
				>
					<CheckCircle className="w-4 h-4" />
					Test Cases
					{totalCount > 0 && (
						<span
							className={`px-2 py-1 text-xs rounded-full ${
								allPassed
									? "bg-green-100 text-green-800"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							{passedCount}/{totalCount}
						</span>
					)}
				</button>
				{showConsoleTab && (
					<button
						onClick={() => setActiveTab("console")}
						className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
							activeTab === "console"
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						<Terminal className="w-4 h-4" />
						Console
					</button>
				)}
			</div>

			{/* Tab Content */}
			<div className="h-64 overflow-auto">
				{activeTab === "tests" ? (
					<div className="p-4 space-y-3">
						{isExecuting ? (
							<div className="flex items-center justify-center py-8">
								<Clock className="w-6 h-6 animate-spin text-primary" />
								<span className="ml-2 text-muted-foreground">
									Running tests...
								</span>
							</div>
						) : results.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
								<CheckCircle className="w-12 h-12 mb-4 opacity-50" />
								<p>No test results yet</p>
								<p className="text-sm">
									Click &quot;Run&quot; to execute your code
								</p>
							</div>
						) : (
							<>
								{/* Summary */}
								<div
									className={`p-3 rounded-lg border ${
										allPassed
											? "bg-green-50 border-green-200 text-green-800"
											: "bg-red-50 border-red-200 text-red-800"
									}`}
								>
									<div className="flex items-center gap-2">
										{allPassed ? (
											<CheckCircle className="w-5 h-5" />
										) : (
											<XCircle className="w-5 h-5" />
										)}
										<span className="font-medium">
											{allPassed
												? "All tests passed!"
												: `${passedCount} of ${totalCount} tests passed`}
										</span>
									</div>
								</div>

								{/* Test Cases */}
								<div className="space-y-2">
									{results.map((result, index) => (
										<TestCaseItem
											key={index}
											result={result}
											isExpanded={
												!result.passed ||
												results.length <= 3
											}
										/>
									))}
								</div>
							</>
						)}
					</div>
				) : showConsoleTab ? (
					<div className="h-full">
						<Console
							iframeRef={iframeRef}
							handleRunClick={handleRunClick}
							buttonVariant={buttonVariant}
							buttonDisabled={buttonDisabled}
							onShowSolution={onShowSolution}
							showSolutionDisabled={showSolutionDisabled}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}
