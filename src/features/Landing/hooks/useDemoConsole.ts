import { useEffect, useRef, useState } from "react";
import { CodeExecutor } from "@/features/Workspace/Console/lib/codeExecutor";
import { ExecutionResult } from "@/features/Workspace/Console/lib/types";
import { questionTestDetailed } from "@/features/Workspace/Console/lib/questionTest";
import {
	TestResult,
	Step,
} from "@/features/Workspace/lesson-data/lesson-types";
import { Test } from "@/features/Workspace/types/test-types";

const useDemoConsole = (
	code: string,
	currentStep: Step,
	handleTestResults: (results: TestResult[]) => void
) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const executorRef = useRef<CodeExecutor | null>(null);
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

	const handleTest = async () => {
		if (!executorRef.current || !currentStep || isExecuting) return;

		setIsExecuting(true);
		try {
			const result = await executorRef.current.executeCode(code, true);
			setLastResult(result);

			// Run tests
			const testResultArray =
				currentStep.tests?.map((test) => {
					if (test.type === "variableAssignment") {
						return {
							__variableAssignmentTest: true,
							variableName: test.variableName,
						};
					}
					if (test.type === "variableReassignment") {
						const variableValue = result.result?.[test.variable];
						return variableValue;
					}
					return result;
				}) || [];

			const oldSystemResult: [
				any[],
				{ name: string; value: any }[],
				any[],
				any?
			] = [
				testResultArray,
				result.__bs_tracked || [],
				result.__bs_calls || [],
				result.tracked,
			];

			const testResults = currentStep.tests
				? questionTestDetailed(
						currentStep.tests,
						code,
						oldSystemResult,
						result.logs
				  )
				: [];

			if (handleTestResults) {
				handleTestResults(testResults);
			}
		} catch (error) {
			setLastResult({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				logs: [],
			});

			// Create a failed test result for syntax errors
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			const testResults: TestResult[] = [
				{
					passed: false,
					test: currentStep.tests?.[0] || ({} as Test),
					code: code,
					error: errorMessage,
				},
			];

			if (handleTestResults) {
				handleTestResults(testResults);
			}
		} finally {
			setIsExecuting(false);
		}
	};

	return {
		iframeRef,
		isExecuting,
		lastResult,
		handleTest,
	};
};

export default useDemoConsole;
