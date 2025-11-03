import { useState, useEffect } from "react";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { TestResult } from "./TestResultsDisplay";
import { getTestStatus, getOverallStatus } from "../utils/testStatusUtils";
import { createDiff } from "../utils/diffUtils";
import { cn } from "@/lib/utils";
import { processMarkdown } from "@/components/MarkdownEditor/markdown-processor";
import "@/components/MarkdownEditor/MarkdownDisplay.css";
import { ChatMarkdownDisplay } from "@/components/workspace/Chat/components/ChatMarkdownDisplay";
import {
	CheckCircle,
	XCircle,
	Circle as CircleIcon,
	XIcon,
	CheckIcon,
} from "lucide-react";

interface TestCasesPanelProps {
	problem: AlgoProblemDetail;
	testResults: TestResult[];
	activeTestTab: "examples" | "testcase" | "results";
	setActiveTestTab: (tab: "examples" | "testcase" | "results") => void;
}

export function TestCasesPanel({
	problem,
	testResults,
	activeTestTab,
	setActiveTestTab,
}: TestCasesPanelProps) {
	const [selectedTestIndex, setSelectedTestIndex] = useState(0);
	const [processedInputs, setProcessedInputs] = useState<string[]>([]);

	// Auto-select first failed case when switching to results tab
	useEffect(() => {
		if (activeTestTab === "results" && testResults.length > 0) {
			const firstFailedIndex = testResults.findIndex(
				(result) => !result.passed
			);
			if (firstFailedIndex !== -1) {
				setSelectedTestIndex(firstFailedIndex);
			} else {
				// All passed, select first case
				setSelectedTestIndex(0);
			}
		}
	}, [activeTestTab, testResults]);

	useEffect(() => {
		if (problem.tests[selectedTestIndex]) {
			const processInputs = async () => {
				const inputs = problem.tests[selectedTestIndex].input.map(
					async (value) => {
						const jsonStr = JSON.stringify(value);
						const markdown = `\`\`\`json\n${jsonStr}\n\`\`\``;
						return await processMarkdown(markdown);
					}
				);
				setProcessedInputs(await Promise.all(inputs));
			};
			processInputs();
		}
	}, [selectedTestIndex, problem.tests]);

	return (
		<div className="bg-background flex flex-col rounded-2xl border-[#2f2f2f] border-1 overflow-hidden h-full">
			<div className="flex items-center justify-between p-3 py-1.5 border-b border-border">
				<div className="flex gap-4">
					<button
						onClick={() => setActiveTestTab("examples")}
						className={`px-2 py-1 rounded-md hover:bg-white/10 hover:cursor-pointer ${
							activeTestTab !== "examples" &&
							"text-muted-foreground"
						}`}
					>
						Examples
					</button>
					<button
						onClick={() => setActiveTestTab("testcase")}
						className={`px-2 py-1 rounded-md hover:bg-white/10 hover:cursor-pointer ${
							activeTestTab !== "testcase" &&
							"text-muted-foreground"
						}`}
					>
						Test Case
					</button>
					<button
						onClick={() => setActiveTestTab("results")}
						className={`px-2 py-1 rounded-md hover:bg-white/10 hover:cursor-pointer ${
							activeTestTab !== "results" &&
							"text-muted-foreground"
						}`}
					>
						Test Results
					</button>
				</div>
			</div>

			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Tab Content */}
				{activeTestTab === "examples" ? (
					<ExamplesTab problem={problem} />
				) : activeTestTab === "testcase" ? (
					<TestCaseTab
						problem={problem}
						selectedTestIndex={selectedTestIndex}
						setSelectedTestIndex={setSelectedTestIndex}
						processedInputs={processedInputs}
					/>
				) : (
					<TestResultsTab
						problem={problem}
						testResults={testResults}
						selectedTestIndex={selectedTestIndex}
						setSelectedTestIndex={setSelectedTestIndex}
						processedInputs={processedInputs}
					/>
				)}
			</div>
		</div>
	);
}

interface ExamplesTabProps {
	problem: AlgoProblemDetail;
}

function ExamplesTab({ problem }: ExamplesTabProps) {
	const [
		processedExamplesAndConstraints,
		setProcessedExamplesAndConstraints,
	] = useState<string>("");

	useEffect(() => {
		const processExamplesAndConstraints = async () => {
			if (problem.examplesAndConstraintsHtml) {
				setProcessedExamplesAndConstraints(
					problem.examplesAndConstraintsHtml
				);
				return;
			}

			if (problem.examplesAndConstraintsMd) {
				try {
					const html = await processMarkdown(
						problem.examplesAndConstraintsMd,
						{
							allowInlineHtml: true,
							codeBackgroundInChoices: true,
						}
					);
					setProcessedExamplesAndConstraints(html);
				} catch (error) {
					console.error(
						"Error processing examples/constraints:",
						error
					);
					setProcessedExamplesAndConstraints("");
				}
			} else {
				setProcessedExamplesAndConstraints("");
			}
		};

		processExamplesAndConstraints();
	}, [problem]);

	if (!processedExamplesAndConstraints) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center h-full">
				<p className="text-muted-foreground">
					Examples and constraints will appear here
				</p>
			</div>
		);
	}

	return (
		<div
			className="flex-1 flex flex-col overflow-hidden overflow-y-auto dark-scrollbar p-4"
			style={{
				scrollbarWidth: "thin",
				scrollbarColor: "#9f9f9f #2C2C2C",
			}}
		>
			<div className="chat-markdown-display">
				<div
					className="markdown-content"
					dangerouslySetInnerHTML={{
						__html: processedExamplesAndConstraints,
					}}
				/>
			</div>
		</div>
	);
}

interface TestCaseTabProps {
	problem: AlgoProblemDetail;
	selectedTestIndex: number;
	setSelectedTestIndex: (index: number) => void;
	processedInputs: string[];
}

function TestCaseTab({
	problem,
	selectedTestIndex,
	setSelectedTestIndex,
	processedInputs,
}: TestCaseTabProps) {
	return (
		<div
			className="flex-1 flex flex-col overflow-hidden overflow-y-auto dark-scrollbar"
			style={{
				scrollbarWidth: "thin",
				scrollbarColor: "#9f9f9f #2C2C2C",
			}}
		>
			{/* Test Case Selection Tabs - Show only first 5 */}
			<div className="flex mx-4 my-4 gap-2">
				{problem.tests.slice(0, 5).map((_, index) => {
					const isSelected = selectedTestIndex === index;
					return (
						<button
							key={index}
							onClick={() => setSelectedTestIndex(index)}
							className={cn(
								"px-3 py-1.5 rounded-md text-sm text-nowrap font-medium hover:bg-white/15 hover:cursor-pointer",
								isSelected
									? "bg-white/10 text-white"
									: "text-muted-foreground hover:text-foreground "
							)}
						>
							Case {index + 1}
						</button>
					);
				})}
			</div>

			{/* Test Case Input Content */}
			<div className="flex-1 p-4 pt-0">
				{problem.tests[selectedTestIndex] && (
					<div className="space-y-4">
						{problem.tests[selectedTestIndex].input.map(
							(value, index) => (
								<div key={index}>
									<span className="text-sm font-medium text-foreground">
										{problem.parameterNames[index] ||
											`param${index + 1}`}{" "}
										=
									</span>
									<div className="mt-1 bg-[#ffffff22] rounded-md p-3">
										{processedInputs[index] ? (
											<div
												className="text-sm overflow-x-auto"
												dangerouslySetInnerHTML={{
													__html:
														processedInputs[
															index
														] || "",
												}}
											/>
										) : (
											<pre
												className="text-sm text-white 
                                        overflow-x-auto"
											>
												{JSON.stringify(value)}
											</pre>
										)}
									</div>
								</div>
							)
						)}
					</div>
				)}
			</div>
		</div>
	);
}

interface TestResultsTabProps {
	problem: AlgoProblemDetail;
	testResults: TestResult[];
	selectedTestIndex: number;
	setSelectedTestIndex: (index: number) => void;
	processedInputs: string[];
}

function TestResultsTab({
	problem,
	testResults,
	selectedTestIndex,
	setSelectedTestIndex,
	processedInputs,
}: TestResultsTabProps) {
	const status = getOverallStatus(testResults);
	if (status === "pending") {
		return (
			<div className="flex-1 flex flex-col items-center justify-center h-full mb-16">
				You must run your code first.
			</div>
		);
	}

	// Check if there's an error - if so, show only the error
	const firstFailedTest = testResults.find((result) => !result.passed);
	const hasError = firstFailedTest?.error;

	if (hasError) {
		return (
			<div
				className="flex-1 flex flex-col overflow-auto p-4"
				style={{
					scrollbarWidth: "thin",
					scrollbarColor: "#9f9f9f #2C2C2C",
				}}
			>
				<div>
					<h4 className="text-xl font-medium text-red-400 mb-2">
						Error
					</h4>
					<div className="mt-1 bg-red-500/10 border border-red-500/20 rounded-md p-3">
						<pre className="text-sm text-red-300 overflow-x-auto whitespace-pre-wrap">
							{firstFailedTest.error}
						</pre>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className="flex-1 flex flex-col overflow-auto"
			style={{
				scrollbarWidth: "thin",
				scrollbarColor: "#9f9f9f #2C2C2C",
			}}
		>
			{/* Overall Status Header */}
			<div className="p-4 border-b border-border">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span
							className={`text-lg font-medium ${
								getOverallStatus(testResults) === "accepted"
									? "text-green-500"
									: getOverallStatus(testResults) === "wrong"
									? "text-[#ef4743]"
									: "text-gray-500"
							}`}
						>
							{getOverallStatus(testResults) === "accepted"
								? "Accepted"
								: getOverallStatus(testResults) === "wrong"
								? "Wrong Answer"
								: "Pending"}
						</span>
						{testResults.length > 0 &&
							(() => {
								// Calculate total runtime across all test cases
								const totalRuntime = testResults.reduce(
									(sum, result) =>
										sum + (result.runtime || 0),
									0
								);

								return (
									<span className="text-sm text-muted-foreground">
										Runtime: {totalRuntime} ms
									</span>
								);
							})()}
						{testResults.length > 0 &&
							(() => {
								const firstFailedIndex = testResults.findIndex(
									(result) => !result.passed
								);
								const passedCount =
									firstFailedIndex === -1
										? testResults.length
										: firstFailedIndex + 1;

								return (
									<span className="text-sm text-muted-foreground">
										{passedCount}/{testResults.length}{" "}
										testcases passed
									</span>
								);
							})()}
					</div>
				</div>
			</div>

			{/* Test Case Selection Tabs */}
			<div className="flex mx-4 my-4 gap-2">
				{/* Only show the first 5 test cases by default, or the FIRST failed case */}
				{(() => {
					const MAX_VISIBLE_TESTS = 5;
					const visibleIndices = problem.tests
						.map((_, index) => index)
						.slice(0, MAX_VISIBLE_TESTS);
					const firstFailedIndex = testResults.findIndex(
						(result) => !result.passed
					);

					// Combine visible indices with the first failed index (if any)
					const allVisibleIndices = Array.from(
						new Set([
							...visibleIndices,
							...(firstFailedIndex !== -1
								? [firstFailedIndex]
								: []),
						])
					).sort((a, b) => a - b);

					return allVisibleIndices.map((index) => {
						const status = getTestStatus(testResults, index);
						const isSelected = selectedTestIndex === index;
						return (
							<button
								key={index}
								onClick={() => setSelectedTestIndex(index)}
								className={cn(
									"px-2.5 pl-1.5 py-1 rounded-md text-sm text-nowrap font-medium hover:bg-white/15 hover:cursor-pointer",
									isSelected
										? "bg-white/10 text-white"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								<div className="flex items-center gap-1">
									{status === "passed" && (
										<CheckIcon className="h-4 w-4 text-green-500" />
									)}
									{status === "failed" && (
										<XIcon className="h-f4 w-4f text-red-500" />
									)}
									{status === "pending" && (
										<span className="text-gray-400">○</span>
									)}
									Case {index + 1}
								</div>
							</button>
						);
					});
				})()}
			</div>

			{/* Test Results Content */}
			<div className="flex-1 p-4 pt-0 dark-scrollbar">
				{problem.tests[selectedTestIndex] &&
					testResults[selectedTestIndex] && (
						<div className="space-y-4">
							{/* Input Section */}
							<div>
								<h4 className="text-sm font-medium text-muted-foreground mb-2">
									Input
								</h4>
								<div className="space-y-2">
									{problem.tests[selectedTestIndex].input.map(
										(value, index) => (
											<div key={index}>
												<span className="text-sm font-medium text-foreground">
													{problem.parameterNames[
														index
													] ||
														`param${
															index + 1
														}`}{" "}
													=
												</span>
												<div className="mt-1 bg-[#ffffff22] rounded-md p-3">
													{processedInputs[index] ? (
														<div
															className="text-sm overflow-x-auto"
															dangerouslySetInnerHTML={{
																__html:
																	processedInputs[
																		index
																	] || "",
															}}
														/>
													) : (
														<pre
															className="text-sm text-white 
                                        overflow-x-auto"
														>
															{JSON.stringify(
																value
															)}
														</pre>
													)}
												</div>
											</div>
										)
									)}
								</div>
							</div>

							{/* Output Section */}
							<div>
								<h4 className="text-sm font-medium text-muted-foreground mb-2">
									Output
								</h4>
								<div className="mt-1 bg-[#ffffff22] rounded-md p-3">
									<pre
										className="text-sm overflow-x-auto"
										dangerouslySetInnerHTML={{
											__html:
												testResults[selectedTestIndex]
													?.actual !== undefined
													? createDiff(
															testResults[
																selectedTestIndex
															].actual,
															problem.tests[
																selectedTestIndex
															].output
													  ).output
													: '<span class="text-gray-400">undefined</span>',
										}}
									/>
								</div>
							</div>

							{/* Expected Section */}
							<div>
								<h4 className="text-sm font-medium text-muted-foreground mb-2">
									Expected
								</h4>
								<div className="mt-1 bg-[#ffffff22] rounded-md p-3">
									<pre
										className="text-sm overflow-x-auto"
										dangerouslySetInnerHTML={{
											__html:
												testResults[selectedTestIndex]
													?.actual !== undefined
													? createDiff(
															testResults[
																selectedTestIndex
															].actual,
															problem.tests[
																selectedTestIndex
															].output
													  ).expected
													: `<span class="text-green-400">${JSON.stringify(
															problem.tests[
																selectedTestIndex
															].output
													  )}</span>`,
										}}
									/>
								</div>
							</div>
						</div>
					)}
			</div>
		</div>
	);
}
