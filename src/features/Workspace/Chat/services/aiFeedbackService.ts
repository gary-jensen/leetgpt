import { TestResult } from "../../lesson-types";
import { getAIFeedback as getAIFeedbackServer } from "@/lib/actions/aiFeedback";
import { Test } from "../../types/test-types";

interface AIFeedbackRequest {
	stepContent: string;
	testResults: TestResult[];
	userCode: string;
}

interface AIFeedbackResponse {
	feedback: string;
}

/**
 * Convert a pattern (string or RegExp) to a string for safe serialization
 */
function convertPatternToString(pattern: string | RegExp): string {
	if (typeof pattern === "string") {
		return pattern;
	} else if (pattern && typeof pattern === "object") {
		try {
			// Check if it's a RegExp-like object
			if ("source" in pattern && typeof pattern.source === "string") {
				const flags = "flags" in pattern ? pattern.flags : "";
				return `/${pattern.source}/${flags}`;
			} else {
				// Try to extract from object properties
				const patternObj = pattern as any;
				if (patternObj.source) {
					return `/${patternObj.source}/${patternObj.flags || ""}`;
				} else if (patternObj.pattern) {
					return patternObj.pattern;
				} else if (
					patternObj.toString &&
					typeof patternObj.toString === "function"
				) {
					return patternObj.toString();
				} else {
					return JSON.stringify(pattern);
				}
			}
		} catch (error) {
			// Last resort - show what we can
			try {
				return JSON.stringify(pattern);
			} catch (jsonError) {
				return `[Pattern object]`;
			}
		}
	} else {
		return String(pattern);
	}
}

/**
 * Convert all patterns in a test to strings
 */
function convertTestPatternsToStrings(test: Test): Test {
	const convertedTest = { ...test };

	// Handle different test types that have patterns
	if ("pattern" in convertedTest) {
		convertedTest.pattern = convertPatternToString(convertedTest.pattern);
	}

	// Handle ifStatement test patterns
	if (convertedTest.type === "ifStatement") {
		if ("bodyPattern" in convertedTest && convertedTest.bodyPattern) {
			convertedTest.bodyPattern = convertPatternToString(
				convertedTest.bodyPattern
			);
		}
		if ("elsePattern" in convertedTest && convertedTest.elsePattern) {
			convertedTest.elsePattern = convertPatternToString(
				convertedTest.elsePattern
			);
		}
		if ("elseIfPatterns" in convertedTest && convertedTest.elseIfPatterns) {
			convertedTest.elseIfPatterns = convertedTest.elseIfPatterns.map(
				(elseIf) => ({
					...elseIf,
					condition: convertPatternToString(elseIf.condition),
					body: elseIf.body
						? convertPatternToString(elseIf.body)
						: elseIf.body,
				})
			);
		}
	}

	return convertedTest;
}

export const getAIFeedback = async (
	request: AIFeedbackRequest
): Promise<AIFeedbackResponse> => {
	try {
		// Convert all patterns to strings before sending to server
		const convertedRequest = {
			...request,
			testResults: request.testResults.map((testResult) => ({
				...testResult,
				test: convertTestPatternsToStrings(testResult.test),
			})),
		};

		// Use server function instead of API call
		const response = await getAIFeedbackServer(convertedRequest);
		return response;
	} catch (error) {
		console.error("Error getting AI feedback:", error);
		// Check if there's a syntax error in the test results
		const hasSyntaxError =
			request.testResults[0]?.error &&
			request.testResults[0].error.includes("SyntaxError");

		// Fallback to basic feedback if AI service fails
		return {
			feedback: hasSyntaxError
				? "There's a syntax error in your code - check for missing commas, parentheses, or quotes."
				: "Check your output carefully - there might be a small typo or missing punctuation.",
		};
	}
};

export const formatAIFeedback = (aiResponse: AIFeedbackResponse): string => {
	// Just return the single sentence feedback
	return aiResponse.feedback;
};
