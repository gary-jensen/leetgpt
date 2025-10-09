import { TestResult } from "../../temp-types";

interface AIFeedbackRequest {
	stepContent: string;
	stepType: string;
	testResults: TestResult[];
	userCode: string;
}

interface AIFeedbackResponse {
	feedback: string;
}

const API_ENDPOINT = "/api/ai/feedback";

export const getAIFeedback = async (
	request: AIFeedbackRequest
): Promise<AIFeedbackResponse> => {
	try {
		const response = await fetch(API_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				stepContent: request.stepContent,
				stepType: request.stepType,
				testResults: request.testResults,
				userCode: request.userCode,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
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

export const formatAIFeedback = (
	aiResponse: AIFeedbackResponse,
	stepContent: string
): string => {
	// Just return the single sentence feedback
	return aiResponse.feedback;
};
