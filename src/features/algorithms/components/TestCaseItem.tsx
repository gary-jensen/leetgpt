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
					? "border-green-200 bg-green-50"
					: "border-red-200 bg-red-50"
			}`}
		>
			{/* Header */}
			<div
				className="flex items-center justify-between p-3 cursor-pointer hover:bg-opacity-80"
				onClick={() => setExpanded(!expanded)}
			>
				<div className="flex items-center gap-3">
					{result.passed ? (
						<CheckCircle className="w-5 h-5 text-green-600" />
					) : (
						<XCircle className="w-5 h-5 text-red-600" />
					)}
					<span className="font-medium">Test Case {result.case}</span>
					<span
						className={`text-sm px-2 py-1 rounded-full ${
							result.passed
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{result.passed ? "PASSED" : "FAILED"}
					</span>
				</div>

				<Button variant="ghost" size="sm" className="p-1 h-auto">
					{expanded ? (
						<ChevronDown className="w-4 h-4" />
					) : (
						<ChevronRight className="w-4 h-4" />
					)}
				</Button>
			</div>

			{/* Expanded Content */}
			{expanded && (
				<div className="border-t bg-white p-4 space-y-3">
					{/* Input */}
					<div>
						<h4 className="text-sm font-medium text-gray-700 mb-2">
							Input:
						</h4>
						<div className="bg-gray-100 p-3 rounded font-mono text-sm">
							{formatValue(result.input)}
						</div>
					</div>

					{/* Expected vs Actual */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Expected:
							</h4>
							<div className="bg-green-100 p-3 rounded font-mono text-sm">
								{formatValue(result.expected)}
							</div>
						</div>

						{result.actual !== undefined && (
							<div>
								<h4 className="text-sm font-medium text-gray-700 mb-2">
									Actual:
								</h4>
								<div
									className={`p-3 rounded font-mono text-sm ${
										result.passed
											? "bg-green-100"
											: "bg-red-100"
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
							<h4 className="text-sm font-medium text-red-700 mb-2">
								Error:
							</h4>
							<div className="bg-red-100 p-3 rounded text-sm text-red-800">
								{result.error}
							</div>
						</div>
					)}

					{/* Test Case Details */}
					<div className="text-xs text-gray-500 pt-2 border-t">
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
