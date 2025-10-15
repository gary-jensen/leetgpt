import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { CodeExecutor } from "../lib/codeExecutor";
// import { TestValidator } from "../lib/testValidator";
import { Lesson, TestResult } from "../../temp-types";
import { ExecutionResult } from "../lib/types";
import { questionTestDetailed } from "../lib/questionTest";
import { saveCodeSubmission } from "@/lib/actions/submissions";
import {
	trackCodeRun,
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
	// currentQuestion,
	handleTestResults: (results: TestResult[]) => void
	// onTestResults,
	// onUsePassingCode,
) => {
	const { data: session } = useSession();
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

			// Track code run
			trackCodeRun(currentLesson.id, currentQuestion.id);
		} catch (error) {
			console.error("Execution failed:", error);
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

		setIsExecuting(true);
		try {
			const result = await executorRef.current.executeCode(code, true);
			setLastResult(result);

			// Run tests
			// Create result array where each element corresponds to a test
			const testResultArray =
				currentQuestion.tests?.map((test) => {
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
						const variableValue = result.result[test.variable];
						return variableValue;
					}
					// For other tests, pass the full result or appropriate data
					return result;
				}) || [];

			// Create result array like old system: [testResults, tracked, calls]
			const oldSystemResult: [
				any[],
				{ name: string; value: any }[],
				any[]
			] = [
				testResultArray,
				result.__bs_tracked || [],
				result.__bs_calls || [],
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

			// Track analytics
			trackCodeRun(currentLesson.id, currentQuestion.id);
			if (allTestsPassed) {
				trackCodeSubmitCorrect(
					currentLesson.id,
					currentQuestion.id,
					1 // Could track actual attempts in the future
				);
			} else {
				const firstFailedTest = testResults.find((r) => !r.passed);
				trackCodeSubmitIncorrect(
					currentLesson.id,
					currentQuestion.id,
					firstFailedTest?.error || "Test failed"
				);
			}

			// Save submission to database (only if user is authenticated)
			if (session?.user?.id) {
				await saveCodeSubmission(
					session.user.id,
					currentLesson.id,
					currentQuestion.id,
					code,
					allTestsPassed,
					{
						lessonTitle: currentLesson.title,
						stepType: currentQuestion.stepType,
					}
				);
			}

			if (handleTestResults) {
				handleTestResults(testResults);
			}
		} catch (error) {
			console.error("Test execution failed:", error);
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
