import { TestResult } from "../../temp-types";
import { getAIFeedback as getAIFeedbackServer } from "@/lib/actions/aiFeedback";

interface AIFeedbackRequest {
	stepContent: string;
	stepType: string;
	testResults: TestResult[];
	userCode: string;
}

interface AIFeedbackResponse {
	feedback: string;
}

export const getAIFeedback = async (
	request: AIFeedbackRequest
): Promise<AIFeedbackResponse> => {
	try {
		// Use server function instead of API call
		const response = await getAIFeedbackServer(request);
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
