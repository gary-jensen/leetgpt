"use client";

import { useState } from "react";
import { TestResult } from "./TestResultsDisplay";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { TestCaseItem } from "./TestCaseItem";

interface SubmissionMessageProps {
	submissionData: {
		allPassed: boolean;
		testsPassed: number;
		testsTotal: number;
		runtime?: number;
		testResults: TestResult[];
	};
}

export function SubmissionMessage({ submissionData }: SubmissionMessageProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const { allPassed, testsPassed, testsTotal, runtime, testResults } =
		submissionData;

	// Find the first failed test case
	const firstFailedTest = testResults.find((result) => !result.passed);
	// Check if this is an execution error (error occurred before test could complete)
	// Execution errors typically have an error message but no actual result
	// Also check if actual property doesn't exist at all
	const isExecutionError =
		firstFailedTest?.error &&
		(firstFailedTest.actual === undefined ||
			!("actual" in firstFailedTest));

	return (
		<div className="space-y-1 flex justify-end px-3">
			<div
				className={
					allPassed
						? "border-l-4 border-green-500 pl-4 bg-green-500/10 rounded-r-lg py-2 space-y-1 px-3 max-w-[85%] success-message"
						: "border-l-4 border-red-500 pl-4 bg-red-500/10 rounded-r-lg py-2 space-y-1 px-3 max-w-[85%] error-message"
				}
			>
				{/* Summary Header */}
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<div className="flex items-center gap-2">
						{allPassed ? (
							<CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
						) : (
							<XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
						)}
						<span className="font-medium text-base">
							{allPassed
								? `All ${testsTotal} tests passed! 🎉`
								: isExecutionError
								? "Execution error occurred"
								: `${testsPassed} of ${testsTotal} tests passed`}
						</span>
					</div>
				</div>
				<div className="flex items-center justify-between gap-3">
					{runtime !== undefined && (
						<span className="text-sm opacity-80 whitespace-nowrap">
							Runtime: {runtime}ms
						</span>
					)}
					{/* Expandable first failed test case */}
					{!allPassed && firstFailedTest && (
						<>
							<button
								onClick={() => setIsExpanded(!isExpanded)}
								className="flex items-center gap-1 text-xs opacity-80 hover:opacity-100 cursor-pointer"
							>
								{isExpanded ? (
									<>
										<ChevronUp className="w-3 h-3" />
										Hide test details
									</>
								) : (
									<>
										<ChevronDown className="w-3 h-3" />
										Show test details
									</>
								)}
							</button>
						</>
					)}
				</div>
				{/* Show error message directly for any errors */}
				{!allPassed && firstFailedTest?.error && (
					<div className="mt-2 bg-red-500/10 border border-red-500/20 p-3 rounded text-sm text-red-300">
						<strong className="text-red-400">
							{isExecutionError ? "Execution Error: " : "Error: "}
						</strong>
						{firstFailedTest.error}
					</div>
				)}
				{!allPassed && firstFailedTest && isExpanded && (
					<div className="mt-2">
						<TestCaseItem
							result={firstFailedTest}
							isExpanded={true}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
