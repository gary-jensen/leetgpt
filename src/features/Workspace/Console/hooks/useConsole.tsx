import { useEffect, useRef, useState } from "react";
import { CodeExecutor } from "../lib/codeExecutor";
// import { TestValidator } from "../lib/testValidator";
import { Lesson, TestResult } from "../../lesson-data/lesson-types";
import { ExecutionResult } from "../lib/types";
import { questionTestDetailed } from "../lib/questionTest";
import {
	trackCodeSubmitCorrect,
	trackCodeSubmitIncorrect,
} from "@/lib/analytics";

// interface UseConsoleProps {
// 	code: string;
// 	// currentQuestion?: any;
// 	// onTestResults?: (results: any[]) => void;
// 	// onUsePassingCode?: (passingCode: string) => void;
// }

const useConsole = (
	code: string,
	currentLesson: Lesson,
	currentStepIndex: number,
	handleTestResults: (results: TestResult[]) => void,
	attemptsCount: number,
	setAttemptsCount: (count: number) => void,
	addSystemMessage?: (
		content: string,
		messageType?: "error" | "success" | "info"
	) => void
) => {
	const currentQuestion = currentLesson.steps[currentStepIndex];

	const iframeRef = useRef<HTMLIFrameElement>(null);
	const executorRef = useRef<CodeExecutor | null>(null);
	// const validatorRef = useRef<TestValidator>(new TestValidator());

	const [isExecuting, setIsExecuting] = useState(false);
	const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

	// Initialize executor when iframe is ready
	useEffect(() => {
		if (iframeRef.current && !executorRef.current) {
			executorRef.current = new CodeExecutor();
			executorRef.current.setIframe(iframeRef.current);
		}

		return () => {
			if (executorRef.current) {
				executorRef.current.cleanup();
				executorRef.current = null;
			}
		};
	}, []);

	const handleRun = async () => {
		if (!executorRef.current || isExecuting) return;

		setIsExecuting(true);
		try {
			const result = await executorRef.current.executeCode(code, false);
			setLastResult(result);
		} catch (error) {
			// console.error("Execution failed:", error);
			setLastResult({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				logs: [],
			});
		} finally {
			setIsExecuting(false);
		}
	};

	const handleTest = async () => {
		if (!executorRef.current || !currentQuestion || isExecuting) return;

		// Client-side code length validation
		if (code.length > 5000) {
			// Send error message to chat if available
			if (addSystemMessage) {
				addSystemMessage(
					"❌ **Code Length Error**\n\nYour code is too long! The maximum allowed length is 5,000 characters. Please shorten your code and try again.",
					"error"
				);
			}
			return;
		}

		// Increment attempts for this step
		const currentAttempt = attemptsCount + 1;
		setAttemptsCount(currentAttempt);

		setIsExecuting(true);
		try {
			const result = await executorRef.current.executeCode(code, true);
			setLastResult(result);

			// Run tests
			// Create result array where each element corresponds to a test
			const testResultArray =
				currentQuestion.tests?.map((test) => {
					// For function tests, execute the function with test cases
					if (test.type === "function") {
						// Execute function test cases
						return (
							test.testCases?.map((testCase) => {
								const testLogs: string[] = [];
								const originalLog = console.log;

								// Override console.log to capture output during function execution
								console.log = function (...args: any[]) {
									const msg = args
										.map((arg) =>
											arg === undefined
												? "undefined"
												: arg
										)
										.join(" ");
									testLogs.push(msg);
									// Don't output to console during test case execution
								};

								let testResult: any;
								try {
									// Check if function exists in the tracked functions
									const trackedFunctions =
										result.tracked?.functions || {};
									const serializedFunction =
										trackedFunctions[test.functionName];

									if (!serializedFunction) {
										// Function doesn't exist
										testResult = {
											__functionNotFound: true,
											functionName: test.functionName,
										};
									} else {
										// Recreate the function from serialized format
										let targetFunction;
										try {
											if (serializedFunction.toString) {
												// Create function from string representation
												targetFunction = eval(
													`(${serializedFunction.toString})`
												);
											} else {
												// Fallback if it's already a function
												targetFunction =
													serializedFunction;
											}
										} catch (e) {
											// Function could not be recreated
											testResult = {
												__functionNotFound: true,
												functionName: test.functionName,
											};
										}

										if (targetFunction) {
											// Actually execute the function with test inputs
											testResult = targetFunction.apply(
												null,
												testCase.input
											);
										}
									}
								} catch (e) {
									// If it's a ReferenceError, the function doesn't exist
									if (
										e instanceof ReferenceError &&
										e.message.includes(test.functionName)
									) {
										testResult = {
											__functionNotFound: true,
											functionName: test.functionName,
										};
									} else {
										// Re-throw other errors (these are legitimate user code errors)
										throw e;
									}
								} finally {
									// Restore original console.log
									console.log = originalLog;
								}

								return { result: testResult, logs: testLogs };
							}) || []
						);
					}

					// For variable tests, use the old system approach
					if (test.type === "variableAssignment") {
						// Return marker object like old system
						return {
							__variableAssignmentTest: true,
							variableName: test.variableName,
						};
					}
					if (test.type === "variableReassignment") {
						// Return the actual variable value
						const variableValue = result.result?.[test.variable];
						return variableValue;
					}
					// For other tests, pass the full result or appropriate data
					return result;
				}) || [];

			// Create result array like old system: [testResults, tracked, calls, newTracked]
			const oldSystemResult: [
				any[],
				{ name: string; value: any }[],
				any[],
				any?
			] = [
				testResultArray,
				result.__bs_tracked || [],
				result.__bs_calls || [],
				result.tracked, // Pass the new tracked data
			];

			const testResults = currentQuestion.tests
				? questionTestDetailed(
						currentQuestion.tests,
						code,
						oldSystemResult,
						result.logs
				  )
				: [];
			// const testResults = currentQuestion.tests ? validatorRef.current.validateTests(
			// 	currentQuestion.tests,
			// 	result,
			// 	code
			// ): [];

			// const testResults = currentQuestion.tests;

			// Check if all tests passed
			const allTestsPassed = testResults.every((result) => result.passed);

			// Track analytics with code
			if (allTestsPassed) {
				trackCodeSubmitCorrect(
					currentLesson.id,
					currentQuestion.id,
					currentAttempt,
					code
				);
			} else {
				const firstFailedTest = testResults.find((r) => !r.passed);
				trackCodeSubmitIncorrect(
					currentLesson.id,
					currentQuestion.id,
					code,
					firstFailedTest?.error
						? `Code error - ${firstFailedTest?.error}`
						: `Code failed - ${currentLesson.id}`
				);
			}

			if (handleTestResults) {
				handleTestResults(testResults);
			}
		} catch (error) {
			// console.error("Test execution failed:", error);
			setLastResult({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				logs: [],
			});

			// Create a failed test result for syntax errors
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			const testResults = [
				{
					passed: false,
					expected: undefined,
					// currentQuestion.tests?.[0]?.expected ||
					// "Valid JavaScript code",
					code: code,
					error: errorMessage,
				},
			];

			// if (handleTestResults) {
			// 	handleTestResults(testResults);
			// }
		} finally {
			setIsExecuting(false);
		}
	};

	// const handleUsePassingCode = () => {
	// 	if (currentQuestion?.passingCode && onUsePassingCode) {
	// 		onUsePassingCode(currentQuestion.passingCode);
	// 	}
	// };

	return {
		iframeRef,
		isExecuting,
		lastResult,
		handleRun,
		handleTest,
		// handleUsePassingCode,
	};
};
export default useConsole;
