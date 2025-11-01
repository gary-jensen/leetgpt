"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	testAllProblems,
	TestProblemResult,
} from "@/lib/actions/adminTestActions";
import { formatFailedTestCases } from "@/lib/execution/adminTestUtils";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { AlgoTestResult } from "@/lib/execution/algoTestExecutor";
import { FixDialog } from "./FixDialog";
import { BatchFixDialog } from "./BatchFixDialog";

export function TestRunner() {
	const [isRunning, setIsRunning] = useState(false);
	const [results, setResults] = useState<TestProblemResult[] | null>(null);
	const [summary, setSummary] = useState<{
		totalProblems: number;
		passedProblems: number;
		failedProblems: number;
	} | null>(null);
	const [fixDialogOpen, setFixDialogOpen] = useState(false);
	const [fixDialogProblem, setFixDialogProblem] = useState<{
		problem: TestProblemResult;
		language: string;
	} | null>(null);
	const [batchFixDialogOpen, setBatchFixDialogOpen] = useState(false);

	const handleRunTests = async () => {
		setIsRunning(true);
		setResults(null);
		setSummary(null);

		try {
			const result = await testAllProblems();
			setResults(result.results);
			setSummary({
				totalProblems: result.totalProblems,
				passedProblems: result.passedProblems,
				failedProblems: result.failedProblems,
			});
		} catch (error) {
			console.error("Error running tests:", error);
			alert("Error running tests. Check console for details.");
		} finally {
			setIsRunning(false);
		}
	};

	const copyFailedTestCases = async (problemResult: TestProblemResult) => {
		// Create a minimal AlgoProblemDetail object for formatting
		const problem: AlgoProblemDetail = {
			id: problemResult.problemId,
			slug: problemResult.problemSlug,
			title: problemResult.problemTitle,
			topics: [],
			difficulty: "easy",
			languages: problemResult.languages.map((l) => l.language),
			order: 0,
			statementMd: "",
			rubric: { optimal_time: "", acceptable_time: [] },
			tests: [],
			parameterNames: [],
			startingCode: {},
			passingCode: {},
		};

		// Collect all failed test cases across all languages
		const allFailedTestCases: AlgoTestResult[] = [];

		for (const langResult of problemResult.languages) {
			if (langResult.failedTestCases) {
				langResult.failedTestCases.forEach((failedTc) => {
					allFailedTestCases.push({
						case: failedTc.case,
						passed: false,
						input: failedTc.input,
						expected: failedTc.expected,
						actual: failedTc.actual,
						error: failedTc.error,
					});
				});
			}
		}

		if (allFailedTestCases.length === 0) {
			return;
		}

		const formatted = formatFailedTestCases(problem, allFailedTestCases);

		try {
			await navigator.clipboard.writeText(formatted);
			alert("Failed test cases copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy to clipboard:", error);
			alert("Failed to copy to clipboard. Check console for details.");
		}
	};

	const handleFixWithAI = (
		problemResult: TestProblemResult,
		language: string
	) => {
		setFixDialogProblem({ problem: problemResult, language });
		setFixDialogOpen(true);
	};

	const handleFixed = () => {
		// Refresh test results after fix is applied
		if (results) {
			handleRunTests();
		}
	};

	const getFailedProblems = (): Array<{
		problem: TestProblemResult;
		language: string;
	}> => {
		if (!results) return [];

		const failed: Array<{ problem: TestProblemResult; language: string }> =
			[];

		for (const problemResult of results) {
			for (const langResult of problemResult.languages) {
				if (!langResult.passed && langResult.failedTestCasesCount > 0) {
					failed.push({
						problem: problemResult,
						language: langResult.language,
					});
				}
			}
		}

		return failed;
	};

	const handleFixAllFailed = () => {
		setBatchFixDialogOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold">Test All Problems</h2>
					<p className="text-muted-foreground mt-1">
						Validate that all problems&apos; passingCode passes all
						test cases
					</p>
				</div>
				<Button onClick={handleRunTests} disabled={isRunning}>
					{isRunning ? "Running Tests..." : "Run All Tests"}
				</Button>
			</div>

			{summary && (
				<div className="border rounded-lg p-4 bg-muted/50">
					<div className="flex items-center justify-between">
						<div className="grid grid-cols-3 gap-4 flex-1">
							<div>
								<div className="text-sm text-muted-foreground">
									Total Problems
								</div>
								<div className="text-2xl font-bold">
									{summary.totalProblems}
								</div>
							</div>
							<div>
								<div className="text-sm text-muted-foreground">
									Passed
								</div>
								<div className="text-2xl font-bold text-green-600">
									{summary.passedProblems}
								</div>
							</div>
							<div>
								<div className="text-sm text-muted-foreground">
									Failed
								</div>
								<div className="text-2xl font-bold text-red-600">
									{summary.failedProblems}
								</div>
							</div>
						</div>
						{summary.failedProblems > 0 && results && (
							<Button
								variant="outline"
								onClick={handleFixAllFailed}
								disabled={isRunning}
							>
								Fix All Failed with AI
							</Button>
						)}
					</div>
				</div>
			)}

			{results && (
				<div className="border rounded-lg">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Problem</TableHead>
								<TableHead>Languages</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Failed Cases</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{results.map((problemResult) => {
								const allPassed = problemResult.languages.every(
									(l) => l.passed
								);
								const totalFailedCases =
									problemResult.languages.reduce(
										(sum, l) =>
											sum + l.failedTestCasesCount,
										0
									);

								return (
									<TableRow key={problemResult.problemId}>
										<TableCell className="font-medium">
											{problemResult.problemTitle}
											<br />
											<span className="text-xs text-muted-foreground">
												{problemResult.problemId}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												{problemResult.languages.map(
													(lang) => (
														<Badge
															key={lang.language}
															variant={
																lang.passed
																	? "default"
																	: "destructive"
															}
														>
															{lang.language}
														</Badge>
													)
												)}
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													allPassed
														? "default"
														: "destructive"
												}
											>
												{allPassed
													? "Passed"
													: "Failed"}
											</Badge>
										</TableCell>
										<TableCell>
											{totalFailedCases > 0 ? (
												<span className="text-red-600 font-medium">
													{totalFailedCases}
												</span>
											) : (
												<span className="text-green-600">
													0
												</span>
											)}
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-2">
												{totalFailedCases > 0 && (
													<>
														{problemResult.languages
															.filter(
																(l) =>
																	!l.passed &&
																	l.failedTestCasesCount >
																		0
															)
															.map((lang) => (
																<Button
																	key={
																		lang.language
																	}
																	variant="outline"
																	size="sm"
																	onClick={() =>
																		handleFixWithAI(
																			problemResult,
																			lang.language
																		)
																	}
																>
																	Fix{" "}
																	{
																		lang.language
																	}{" "}
																	with AI
																</Button>
															))}
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																copyFailedTestCases(
																	problemResult
																)
															}
														>
															Copy Failed Cases
														</Button>
													</>
												)}
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			)}

			{/* Fix Dialog */}
			{fixDialogProblem && (
				<FixDialog
					open={fixDialogOpen}
					onOpenChange={setFixDialogOpen}
					problemResult={fixDialogProblem.problem}
					language={fixDialogProblem.language}
					onFixed={handleFixed}
				/>
			)}

			{/* Batch Fix Dialog */}
			<BatchFixDialog
				open={batchFixDialogOpen}
				onOpenChange={setBatchFixDialogOpen}
				failedProblems={getFailedProblems()}
				onFixed={handleFixed}
			/>
		</div>
	);
}
