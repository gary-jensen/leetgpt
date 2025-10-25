"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { WorkspaceLayout } from "@/features/algorithms/components/WorkspaceLayout";
import { TestResult } from "@/features/algorithms/components/TestResultsDisplay";
import { useAlgoProblemExecution } from "@/features/algorithms/hooks/useAlgoProblemExecution";
import { getAlgoProblem } from "@/features/algorithms/data";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { getHint } from "@/lib/actions/algoCoach";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export default function AlgorithmWorkspacePage() {
	const params = useParams();
	const problemId = params.problemId as string;

	const problem = getAlgoProblem(problemId);
	const [chatMessages, setChatMessages] = useState<any[]>([]);
	const [isThinking, setIsThinking] = useState(false);

	const {
		code,
		setCode,
		testResults,
		isExecuting,
		iframeRef,
		executeCode,
		resetCode,
		showSolution,
		buttonVariant,
		buttonDisabled,
		allTestsPassed,
	} = useAlgoProblemExecution(problem);

	const handleHint = async () => {
		if (!problem) return;

		setIsThinking(true);
		try {
			const hint = await getHint(
				problemId,
				code,
				chatMessages,
				getFailureSummary(testResults)
			);

			const newMessage = {
				id: Date.now().toString(),
				role: "assistant" as const,
				content: hint.message,
				timestamp: new Date(),
			};

			setChatMessages((prev) => [...prev, newMessage]);

			if (hint.followUpQuestion) {
				setTimeout(() => {
					const followUp = {
						id: (Date.now() + 1).toString(),
						role: "assistant" as const,
						content: hint.followUpQuestion,
						timestamp: new Date(),
					};
					setChatMessages((prev) => [...prev, followUp]);
				}, 1000);
			}
		} catch (error) {
			console.error("Error getting hint:", error);
		} finally {
			setIsThinking(false);
		}
	};

	const handleSendMessage = (message: string) => {
		if (!message.trim()) return;

		const userMessage = {
			id: Date.now().toString(),
			role: "user" as const,
			content: message,
			timestamp: new Date(),
		};

		setChatMessages((prev) => [...prev, userMessage]);

		// In a real implementation, this would call the AI coach
		setTimeout(() => {
			const aiResponse = {
				id: (Date.now() + 1).toString(),
				role: "assistant" as const,
				content:
					"I'm here to help! What specific part of the problem would you like to discuss?",
				timestamp: new Date(),
			};
			setChatMessages((prev) => [...prev, aiResponse]);
		}, 1000);
	};

	if (!problem) {
		return (
			<div className="h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">
						Problem Not Found
					</h1>
					<p className="text-muted-foreground mb-4">
						The problem you&apos;re looking for doesn&apos;t exist.
					</p>
					<Button onClick={() => window.history.back()}>
						Go Back
					</Button>
				</div>
			</div>
		);
	}

	return (
		<WorkspaceLayout
			problem={problem}
			code={code}
			setCode={setCode}
			testResults={testResults}
			isExecuting={isExecuting}
			onRun={executeCode}
			onReset={resetCode}
			onHint={handleHint}
			onShowSolution={showSolution}
			iframeRef={iframeRef}
			buttonVariant={buttonVariant}
			buttonDisabled={buttonDisabled}
			chatMessages={chatMessages}
			onSendMessage={handleSendMessage}
			isThinking={isThinking}
		/>
	);
}

function getFailureSummary(testResults: TestResult[]): string {
	const failedTests = testResults.filter((r) => !r.passed);
	if (failedTests.length === 0) return "";

	return `Failed ${failedTests.length} of ${
		testResults.length
	} tests. Errors: ${failedTests
		.map((t) => t.error || "Unknown error")
		.join(", ")}`;
}
