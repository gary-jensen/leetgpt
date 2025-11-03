import { useEffect, useState, useRef } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { TestResult } from "../components/TestResultsDisplay";

export function useTestTab(testResults: TestResult[], isExecuting: boolean) {
	const [activeTestTab, setActiveTestTab] = useState<
		"examples" | "testcase" | "results"
	>("examples");
	const testCasesPanelRef = useRef<ImperativePanelHandle | null>(null);

	// Auto-switch to results tab when tests are run
	useEffect(() => {
		if (testResults.length > 0) {
			setActiveTestTab("results");
			// Resize panel to 35% when results are available (only if collapsed)
			const panel = testCasesPanelRef?.current;
			if (panel && panel.getSize() <= 5) {
				panel.resize(35);
			}
		}
	}, [testResults, testCasesPanelRef]);

	// Auto-switch to results tab when execution starts
	useEffect(() => {
		if (isExecuting) {
			setActiveTestTab("results");
			// Resize panel to 35% when execution starts (only if collapsed)
			const panel = testCasesPanelRef?.current;
			if (panel && panel.getSize() <= 5) {
				panel.resize(35);
			}
		}
	}, [isExecuting, testCasesPanelRef]);

	// Wrap setActiveTestTab to expand panel when switching to results
	const handleSetActiveTestTab = (
		tab: "examples" | "testcase" | "results"
	) => {
		setActiveTestTab(tab);

		// Resize panel to 35% when switching to results tab (only if collapsed)
		if (tab === "results" && testCasesPanelRef.current) {
			const panel = testCasesPanelRef.current;
			if (panel.getSize() <= 5) {
				panel.resize(35);
			}
		}
	};

	return {
		activeTestTab,
		setActiveTestTab: handleSetActiveTestTab,
		testCasesPanelRef,
	};
}
