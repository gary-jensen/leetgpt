import { useEffect, useState } from "react";
import { TestResult } from "../components/TestResultsDisplay";

export function useTestTab(testResults: TestResult[], isExecuting: boolean) {
	const [activeTestTab, setActiveTestTab] = useState<"testcase" | "results">(
		"testcase"
	);

	// Auto-switch to results tab when tests are run
	useEffect(() => {
		if (testResults.length > 0) {
			setActiveTestTab("results");
		}
	}, [testResults]);

	// Auto-switch to results tab when execution starts
	useEffect(() => {
		if (isExecuting) {
			setActiveTestTab("results");
		}
	}, [isExecuting]);

	return {
		activeTestTab,
		setActiveTestTab,
	};
}
