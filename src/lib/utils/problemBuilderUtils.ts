/**
 * Utility functions for problem builder
 */

export type BuilderPhase =
	| "idle"
	| "generating_problem"
	| "generating_tests"
	| "validating_tests"
	| "finalizing"
	| "completed"
	| "failed"
	| "cancelled";

export interface BuilderState {
	builderId: string;
	problemName: string;
	phase: BuilderPhase;
	phaseStartTime: number;
	phaseDescription: string;
	batchNumber?: number;
	testCaseCounts: {
		generated: number;
		passed: number;
		failed: number;
	};
	retryCount: number;
	error?: string;
	errorTimestamp?: number;
	completedAt?: number;
	cancelled?: boolean;
	cancelledAt?: number;
}

/**
 * Format elapsed time in milliseconds to human-readable string
 * Returns "Xm Ys" or "Xs" if less than 60 seconds
 */
export function formatElapsedTime(ms: number): string {
	const seconds = Math.floor(ms / 1000);
	if (seconds < 60) {
		return `${seconds}s`;
	}
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Get human-readable phase description
 */
export function getPhaseDescription(
	phase: BuilderPhase,
	context?: {
		batchNumber?: number;
		passedTests?: number;
		targetTests?: number;
	}
): string {
	switch (phase) {
		case "idle":
			return "Waiting to start...";
		case "generating_problem":
			return "Generating problem data...";
		case "generating_tests":
			if (context?.batchNumber) {
				return `Generating test cases (batch ${context.batchNumber})...`;
			}
			return "Generating test cases...";
		case "validating_tests":
			if (context?.batchNumber) {
				return `Validating batch ${context.batchNumber}...`;
			}
			if (
				context?.passedTests !== undefined &&
				context?.targetTests !== undefined
			) {
				return `Validating tests (${context.passedTests}/${context.targetTests} passing)...`;
			}
			return "Validating test cases...";
		case "finalizing":
			return "Saving to database...";
		case "completed":
			return "Completed successfully";
		case "failed":
			return "Failed";
		case "cancelled":
			return "Cancelled";
		default:
			return "Unknown phase";
	}
}

/**
 * Normalize code for comparison (remove whitespace, comments, normalize formatting)
 */
export function normalizeCode(code: string): string {
	// Remove comments (single-line and multi-line)
	let normalized = code.replace(/\/\*[\s\S]*?\*\//g, ""); // Multi-line comments
	normalized = normalized.replace(/\/\/.*$/gm, ""); // Single-line comments

	// Remove extra whitespace
	normalized = normalized.replace(/\s+/g, " ");

	// Remove leading/trailing whitespace
	normalized = normalized.trim();

	return normalized;
}

/**
 * Validate that two code strings are different
 */
export function validateCodeUniqueness(
	passingCode: string,
	secondaryPassingCode: string
): boolean {
	const normalizedPassing = normalizeCode(passingCode);
	const normalizedSecondary = normalizeCode(secondaryPassingCode);

	return normalizedPassing !== normalizedSecondary;
}

/**
 * Calculate exponential backoff delay in milliseconds
 */
export function getBackoffDelay(retryCount: number): number {
	// 1s, 2s, 4s
	return Math.pow(2, retryCount) * 1000;
}
