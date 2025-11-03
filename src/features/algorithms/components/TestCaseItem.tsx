"use client";

import { useState } from "react";
import { TestResult } from "./TestResultsDisplay";
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestCaseItemProps {
	result: TestResult;
	isExpanded?: boolean;
}

export function TestCaseItem({
	result,
	isExpanded = false,
}: TestCaseItemProps) {
	const [expanded, setExpanded] = useState(isExpanded);

	const formatValue = (value: any): string => {
		if (value === null) return "null";
		if (value === undefined) return "undefined";
		if (typeof value === "string") return `"${value}"`;
		if (Array.isArray(value))
			return `[${value.map(formatValue).join(", ")}]`;
		if (typeof value === "object") return JSON.stringify(value);
		return String(value);
	};

	return (
		<div
			className={`border rounded-lg overflow-hidden ${
				result.passed
					? "border-green-500/30 bg-green-500/5"
					: "border-red-500/30 bg-red-500/5"
			}`}
		>
			{/* Header */}
			<div
				className="flex items-center justify-between p-3 cursor-pointer hover:opacity-80 transition-opacity"
				onClick={() => setExpanded(!expanded)}
			>
				<div className="flex items-center gap-3">
					{result.passed ? (
						<CheckCircle className="w-5 h-5 text-green-500" />
					) : (
						<XCircle className="w-5 h-5 text-red-500" />
					)}
					<span className="font-medium text-foreground">Test Case {result.case}</span>
					<span
						className={`text-sm px-2 py-1 rounded-full font-medium ${
							result.passed
								? "bg-green-500/20 text-green-400"
								: "bg-red-500/20 text-red-400"
						}`}
					>
						{result.passed ? "PASSED" : "FAILED"}
					</span>
				</div>

				<Button variant="ghost" size="sm" className="p-1 h-auto">
					{expanded ? (
						<ChevronDown className="w-4 h-4 text-foreground" />
					) : (
						<ChevronRight className="w-4 h-4 text-foreground" />
					)}
				</Button>
			</div>

			{/* Expanded Content */}
			{expanded && (
				<div className="border-t border-border/50 bg-background/50 p-4 space-y-3">
					{/* Input */}
					<div>
						<h4 className="text-sm font-medium text-foreground mb-2">
							Input:
						</h4>
						<div className="bg-muted p-3 rounded font-mono text-sm text-foreground">
							{formatValue(result.input)}
						</div>
					</div>

					{/* Expected vs Actual */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<h4 className="text-sm font-medium text-foreground mb-2">
								Expected:
							</h4>
							<div className="bg-green-500/10 border border-green-500/20 p-3 rounded font-mono text-sm text-foreground">
								{formatValue(result.expected)}
							</div>
						</div>

						{result.actual !== undefined && (
							<div>
								<h4 className="text-sm font-medium text-foreground mb-2">
									Actual:
								</h4>
								<div
									className={`p-3 rounded font-mono text-sm border ${
										result.passed
											? "bg-green-500/10 border-green-500/20 text-foreground"
											: "bg-red-500/10 border-red-500/20 text-foreground"
									}`}
								>
									{formatValue(result.actual)}
								</div>
							</div>
						)}
					</div>

					{/* Error Message */}
					{result.error && (
						<div>
							<h4 className="text-sm font-medium text-red-400 mb-2">
								Error:
							</h4>
							<div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-sm text-red-300">
								{result.error}
							</div>
						</div>
					)}

					{/* Test Case Details */}
					<div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
						<div className="flex justify-between">
							<span>Test Case #{result.case}</span>
							<span>
								{result.passed ? "✓ Passed" : "✗ Failed"}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
