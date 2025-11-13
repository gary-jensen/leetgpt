"use client";

import ReactGA from "react-ga4";
import { saveAnalyticsEvent } from "@/lib/actions/analytics";
import { getGuestId } from "@/lib/guestId";

// Session ID for tracking related events
let currentSessionId: string | null = null;

/**
 * Generate a new session ID
 */
function generateSessionId(): string {
	return (
		"session_" + Date.now() + "_" + Math.random().toString(36).substring(2)
	);
}

/**
 * Get current session ID
 */
export function getSessionId(): string {
	if (!currentSessionId) {
		currentSessionId = generateSessionId();
	}
	return currentSessionId;
}

// Initialize GA4
export const initGA = () => {
	const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
	if (measurementId) {
		ReactGA.initialize(measurementId);
	} else {
		console.warn("GA4 Measurement ID not found");
	}

	// Initialize session ID
	getSessionId();
};

// Custom event tracking - sends to both GA4 and database
export const trackEvent = (
	category: string,
	action: string,
	label?: string,
	value?: number,
	metadata?: Record<string, any>
) => {
	// console.log("🎯 Analytics: trackEvent called", {
	// 	category,
	// 	action,
	// 	label,
	// 	value,
	// 	metadata,
	// });

	// Send to GA4
	ReactGA.event({
		category,
		action,
		label,
		value,
	});

	// Detect if we're running on localhost (local machine)
	const isDev =
		typeof window !== "undefined" &&
		(window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1" ||
			window.location.hostname.startsWith("192.168.") ||
			window.location.hostname.startsWith("10.") ||
			window.location.hostname.startsWith("172."));

	// Send to database (async, don't wait)
	saveAnalyticsEvent({
		eventCategory: category,
		eventAction: action,
		eventLabel: label,
		eventValue: value,
		metadata,
		sessionId: getSessionId(),
		guestId: getGuestId(),
		isDev,
	}).catch((error) => {
		console.error("Failed to save event to database:", error);
	});
};

// Session tracking
export const trackSessionStart = () => {
	trackEvent("Session", "session_start");
};

// Lesson tracking
export const trackLessonStart = (lessonId: string, lessonTitle: string) => {
	trackEvent(
		"Lesson",
		"lesson_start",
		`${lessonId} - ${lessonTitle}`,
		undefined,
		{
			lessonId,
			lessonTitle,
		}
	);
};

export const trackLessonComplete = (
	lessonId: string,
	lessonTitle: string,
	xpGained: number,
	timeTaken: number
) => {
	trackEvent(
		"Lesson",
		"lesson_complete",
		`${lessonId} - ${lessonTitle}`,
		timeTaken / 1000,
		{
			lessonId,
			lessonTitle,
			xpGained,
			timeTaken: timeTaken / 1000,
		}
	);
};

export const trackStepComplete = (
	lessonId: string,
	stepId: string,
	xpGained: number
) => {
	trackEvent("Step", "step_complete", `${lessonId}-${stepId}`, xpGained, {
		lessonId,
		stepId,
		xpGained,
	});
};

// Code execution tracking
export const trackCodeSubmitCorrect = (
	lessonId: string,
	stepId: string,
	attempts: number,
	code: string
) => {
	trackEvent(
		"Code",
		"code_submit_correct",
		`${lessonId}-${stepId}`,
		attempts,
		{
			lessonId,
			stepId,
			attempts,
			code,
		}
	);
};

export const trackCodeSubmitIncorrect = (
	lessonId: string,
	stepId: string,
	code: string,
	errorType?: string
) => {
	trackEvent(
		"Code",
		"code_submit_incorrect",
		errorType || "unknown",
		undefined,
		{
			lessonId,
			stepId,
			errorType,
			code,
		}
	);
};

// Progress tracking
export const trackLevelUp = (newLevel: number) => {
	trackEvent("Progress", "level_up", `Level ${newLevel}`, newLevel, {
		newLevel,
	});
};

export const trackSkillNodeComplete = (nodeName: string) => {
	trackEvent("Progress", "skill_node_complete", nodeName, undefined, {
		nodeName,
	});
};

// Auth tracking
export const trackAuthSignup = () => {
	const guestId = getGuestId();
	trackEvent("Auth", "auth_signup", undefined, undefined, {
		previousGuestId: guestId || null,
	});
};

export const trackAuthSignin = () => {
	const guestId = getGuestId();
	trackEvent(
		"Auth",
		"auth_signin",
		undefined,
		undefined,
		guestId
			? {
					previousGuestId: guestId || null,
			  }
			: undefined
	);
};

export const trackUpgradeToProButtonClick = (source?: string) => {
	trackEvent("Billing", "upgrade_to_pro_button_click", source, undefined, {
		timestamp: new Date().toISOString(),
	});
};

export const trackSignInButtonClick = (source?: string) => {
	trackEvent("Auth", "sign_in_button_click", source, undefined, {
		timestamp: new Date().toISOString(),
	});
};

export const trackAuthSignout = () => {
	trackEvent("Auth", "auth_signout", undefined, undefined, {
		timestamp: new Date().toISOString(),
	});
};

// Demo workspace tracking

export const trackDemoSubmitCorrect = (
	stepId: string,
	attempts: number,
	userCode: string
) => {
	trackEvent("Demo", "demo_submit_correct", stepId, attempts, {
		stepId,
		attempts,
		userCode: userCode.replace(/</g, "&lt;").replace(/>/g, "&gt;"), // Escape HTML
	});
};

export const trackDemoSubmitIncorrect = (
	stepId: string,
	userCode: string,
	errorType?: string
) => {
	trackEvent("Demo", "demo_submit_incorrect", stepId, undefined, {
		stepId,
		errorType,
		userCode: userCode.replace(/</g, "&lt;").replace(/>/g, "&gt;"), // Escape HTML
	});
};

export const trackDemoComplete = () => {
	trackEvent("Demo", "demo_complete");
};

// Landing page section tracking
export const trackLandingSectionView = (
	sectionName: string,
	percentViewed: number
) => {
	trackEvent("Landing", "section_view", sectionName, percentViewed, {
		sectionName,
		percentViewed,
	});
};

export const trackLandingCTAClick = (ctaLocation: string) => {
	trackEvent("Landing", "cta_click", ctaLocation, undefined, {
		ctaLocation,
	});
};

// Algorithm Problem tracking
export const trackAlgoProblemViewed = (
	problemId: string,
	problemTitle: string,
	difficulty: string,
	topics?: string[],
	isFirstView?: boolean
) => {
	trackEvent(
		"AlgoProblem",
		"algo_problem_viewed",
		`${problemId} - ${problemTitle}`,
		undefined,
		{
			problemId,
			problemTitle,
			difficulty,
			topics,
			isFirstView,
		}
	);
};

export const trackAlgoProblemStarted = (
	problemId: string,
	problemTitle: string,
	difficulty: string,
	timeSinceView?: number
) => {
	trackEvent(
		"AlgoProblem",
		"algo_problem_started",
		`${problemId} - ${problemTitle}`,
		undefined,
		{
			problemId,
			problemTitle,
			difficulty,
			timeSinceView,
		}
	);
};

export const trackAlgoProblemSwitched = (
	fromProblemId: string,
	toProblemId: string,
	timeSpentOnPrevious?: number
) => {
	trackEvent(
		"AlgoProblem",
		"algo_problem_switched",
		`${fromProblemId} -> ${toProblemId}`,
		undefined,
		{
			fromProblemId,
			toProblemId,
			timeSpentOnPrevious,
		}
	);
};

export const trackAlgoProblemCompleted = (
	problemId: string,
	problemTitle: string,
	difficulty: string,
	totalAttempts: number,
	totalTime: number,
	totalSubmissions: number,
	firstSubmissionTime?: number
) => {
	trackEvent(
		"AlgoProblem",
		"algo_problem_completed",
		`${problemId} - ${problemTitle}`,
		totalAttempts,
		{
			problemId,
			problemTitle,
			difficulty,
			totalAttempts,
			totalTime,
			totalSubmissions,
			firstSubmissionTime,
		}
	);
};

export const trackAlgoProblemRun = (
	problemId: string,
	problemTitle: string,
	testsPassed: number,
	testsTotal: number,
	runtime: number,
	codeLength?: number,
	attemptNumber?: number,
	timeSinceStart?: number,
	isFirstRun?: boolean
) => {
	trackEvent(
		"AlgoProblem",
		"algo_problem_run",
		`${problemId} - ${problemTitle}`,
		testsPassed,
		{
			problemId,
			problemTitle,
			testsPassed,
			testsTotal,
			runtime,
			passRate: testsPassed / testsTotal,
			codeLength,
			attemptNumber,
			timeSinceStart,
			isFirstRun,
		}
	);
};

export const trackAlgoProblemTimeTracked = (
	problemId: string,
	activeTime: number,
	totalTime: number,
	isPageVisible: boolean
) => {
	trackEvent(
		"AlgoProblem",
		"algo_problem_time_tracked",
		problemId,
		activeTime,
		{
			problemId,
			activeTime,
			totalTime,
			isPageVisible,
		}
	);
};

export const trackAlgoProblemSessionEnd = (
	problemId: string,
	totalTime: number,
	activeTime: number,
	submissionCount: number,
	completionStatus: "completed" | "in_progress" | "not_started"
) => {
	trackEvent(
		"AlgoProblem",
		"algo_problem_session_end",
		problemId,
		activeTime,
		{
			problemId,
			totalTime,
			activeTime,
			submissionCount,
			completionStatus,
		}
	);
};

export const trackAlgoCodeReset = (
	problemId: string,
	timeSinceStart?: number,
	hadModifications?: boolean
) => {
	trackEvent("AlgoProblem", "algo_code_reset", problemId, undefined, {
		problemId,
		timeSinceStart,
		hadModifications,
	});
};

export const trackAlgoSolutionViewed = (
	problemId: string,
	problemTitle: string,
	attemptNumber?: number,
	timeSinceStart?: number,
	hadSubmissions?: boolean
) => {
	trackEvent(
		"AlgoProblem",
		"algo_solution_viewed",
		`${problemId} - ${problemTitle}`,
		undefined,
		{
			problemId,
			problemTitle,
			attemptNumber,
			timeSinceStart,
			hadSubmissions,
		}
	);
};

export const trackAlgoHintRequested = (
	problemId: string,
	problemTitle: string,
	hintNumber?: number,
	timeSinceStart?: number,
	hasSubmissions?: boolean
) => {
	trackEvent(
		"AlgoProblem",
		"algo_hint_requested",
		`${problemId} - ${problemTitle}`,
		undefined,
		{
			problemId,
			problemTitle,
			hintNumber,
			timeSinceStart,
			hasSubmissions,
		}
	);
};

export const trackAlgoProblemListViewed = (
	totalProblems: number,
	filteredCount?: number
) => {
	trackEvent(
		"AlgoProblem",
		"algo_problem_list_viewed",
		undefined,
		totalProblems,
		{
			totalProblems,
			filteredCount,
		}
	);
};

export const trackAlgoProblemClicked = (
	problemId: string,
	problemTitle: string,
	difficulty: string,
	positionInList?: number,
	hasProgress?: boolean
) => {
	trackEvent(
		"AlgoProblem",
		"algo_problem_clicked",
		`${problemId} - ${problemTitle}`,
		undefined,
		{
			problemId,
			problemTitle,
			difficulty,
			positionInList,
			hasProgress,
		}
	);
};

// Algorithm Chat tracking
export const trackAlgoChatMessageSent = (
	problemId: string,
	messageLength: number,
	messageType?: "question" | "hint_request" | "error_help",
	isFirstMessage?: boolean,
	timeSinceStart?: number
) => {
	trackEvent("AlgoChat", "algo_chat_message_sent", problemId, messageLength, {
		problemId,
		messageLength,
		messageType,
		isFirstMessage,
		timeSinceStart,
	});
};

export const trackAlgoChatMessageReceived = (
	problemId: string,
	responseTime: number,
	messageLength?: number,
	messageType?: string
) => {
	trackEvent(
		"AlgoChat",
		"algo_chat_message_received",
		problemId,
		responseTime,
		{
			problemId,
			responseTime,
			messageLength,
			messageType,
		}
	);
};

export const trackAlgoChatSuggestionClicked = (
	problemId: string,
	suggestionText: string
) => {
	trackEvent(
		"AlgoChat",
		"algo_chat_suggestion_clicked",
		problemId,
		undefined,
		{
			problemId,
			suggestionText,
		}
	);
};

export const trackAlgoChatError = (
	problemId: string,
	errorType: string,
	errorMessage?: string
) => {
	trackEvent("AlgoChat", "algo_chat_error", problemId, undefined, {
		problemId,
		errorType,
		errorMessage,
	});
};

// Algorithm Submission tracking
export const trackAlgoSubmissionsTabViewed = (
	problemId: string,
	submissionCount: number
) => {
	trackEvent(
		"AlgoSubmission",
		"algo_submissions_tab_viewed",
		problemId,
		submissionCount,
		{
			problemId,
			submissionCount,
		}
	);
};

export const trackAlgoSubmissionViewed = (
	problemId: string,
	submissionId: string,
	submissionStatus: "passed" | "failed",
	submissionDate: Date,
	isOwnSubmission: boolean
) => {
	trackEvent(
		"AlgoSubmission",
		"algo_submission_viewed",
		`${problemId} - ${submissionId}`,
		undefined,
		{
			problemId,
			submissionId,
			submissionStatus,
			submissionDate: submissionDate.toISOString(),
			isOwnSubmission,
		}
	);
};

export const trackAlgoSubmissionCopiedToClipboard = (
	problemId: string,
	submissionId: string,
	submissionStatus: "passed" | "failed"
) => {
	trackEvent(
		"AlgoSubmission",
		"algo_submission_copied_to_clipboard",
		`${problemId} - ${submissionId}`,
		undefined,
		{
			problemId,
			submissionId,
			submissionStatus,
		}
	);
};

export const trackAlgoSubmissionCopiedToEditor = (
	problemId: string,
	submissionId: string,
	submissionStatus: "passed" | "failed"
) => {
	trackEvent(
		"AlgoSubmission",
		"algo_submission_copied_to_editor",
		`${problemId} - ${submissionId}`,
		undefined,
		{
			problemId,
			submissionId,
			submissionStatus,
		}
	);
};

// Algorithm Navigation tracking
export const trackAlgoTabSwitched = (
	problemId: string,
	fromTab: "description" | "submissions" | "submission",
	toTab: "description" | "submissions" | "submission"
) => {
	trackEvent("AlgoNavigation", "algo_tab_switched", problemId, undefined, {
		problemId,
		fromTab,
		toTab,
	});
};

export const trackAlgoTestTabSwitched = (
	problemId: string,
	fromTab: "examples" | "testcase" | "results",
	toTab: "examples" | "testcase" | "results",
	hasTestResults: boolean
) => {
	trackEvent(
		"AlgoNavigation",
		"algo_test_tab_switched",
		problemId,
		undefined,
		{
			problemId,
			fromTab,
			toTab,
			hasTestResults,
		}
	);
};

export const trackAlgoTestCaseSelected = (
	problemId: string,
	testIndex: number,
	testStatus: "passed" | "failed",
	isFirstSelection: boolean
) => {
	trackEvent(
		"AlgoNavigation",
		"algo_test_case_selected",
		problemId,
		testIndex,
		{
			problemId,
			testIndex,
			testStatus,
			isFirstSelection,
		}
	);
};

export const trackAlgoTopicsDialogOpened = (
	problemId: string,
	topicCount: number
) => {
	trackEvent(
		"AlgoNavigation",
		"algo_topics_dialog_opened",
		problemId,
		topicCount,
		{
			problemId,
			topicCount,
		}
	);
};

export const trackAlgoTopicClicked = (problemId: string, topicName: string) => {
	trackEvent("AlgoNavigation", "algo_topic_clicked", problemId, undefined, {
		problemId,
		topicName,
	});
};

export const trackAlgoRelatedLessonClicked = (
	problemId: string,
	lessonId: string
) => {
	trackEvent(
		"AlgoNavigation",
		"algo_related_lesson_clicked",
		problemId,
		undefined,
		{
			problemId,
			lessonId,
		}
	);
};

// Algorithm Lesson tracking
export const trackAlgoLessonViewed = (
	lessonId: string,
	lessonTitle: string,
	relatedProblemIds?: string[]
) => {
	trackEvent(
		"AlgoLesson",
		"algo_lesson_viewed",
		`${lessonId} - ${lessonTitle}`,
		undefined,
		{
			lessonId,
			lessonTitle,
			relatedProblemIds,
		}
	);
};

export const trackAlgoLessonCompleted = (
	lessonId: string,
	lessonTitle: string,
	timeSpent?: number,
	relatedProblemIds?: string[]
) => {
	trackEvent(
		"AlgoLesson",
		"algo_lesson_completed",
		`${lessonId} - ${lessonTitle}`,
		timeSpent,
		{
			lessonId,
			lessonTitle,
			timeSpent,
			relatedProblemIds,
		}
	);
};

// Time tracking
let sessionStartTime: number | null = null;
let activeTime = 0;
let lastActivityTime: number | null = null;
let isPageVisible = true;

export const startTimeTracking = () => {
	sessionStartTime = Date.now();
	lastActivityTime = Date.now();

	// Track page visibility
	document.addEventListener("visibilitychange", handleVisibilityChange);

	// Send heartbeat every 30 seconds when active
	const heartbeatInterval = setInterval(() => {
		if (isPageVisible && lastActivityTime) {
			const currentTime = Date.now();
			const timeSinceLastActivity = currentTime - lastActivityTime;

			// Only count as active if there was recent activity (within 1 minute)
			if (timeSinceLastActivity < 60000) {
				activeTime += 30; // Add 30 seconds of active time
			}
		}
	}, 30000);

	// Track activity
	const updateActivity = () => {
		lastActivityTime = Date.now();
	};

	document.addEventListener("mousemove", updateActivity);
	document.addEventListener("keydown", updateActivity);
	document.addEventListener("click", updateActivity);
	document.addEventListener("scroll", updateActivity);

	// Send session data on page unload
	window.addEventListener("beforeunload", () => {
		clearInterval(heartbeatInterval);
		sendSessionData("page_unload");
	});

	// Track page hide (more reliable than beforeunload on mobile)
	window.addEventListener("pagehide", () => {
		clearInterval(heartbeatInterval);
		sendSessionData("page_hide");
	});
};

const handleVisibilityChange = () => {
	isPageVisible = !document.hidden;
	if (isPageVisible) {
		lastActivityTime = Date.now();
	}
};

const sendSessionData = (reason: string = "unknown") => {
	if (sessionStartTime) {
		const totalTime = Math.floor((Date.now() - sessionStartTime) / 1000);
		const timeSinceLastActivity = lastActivityTime
			? Math.floor((Date.now() - lastActivityTime) / 1000)
			: 0;

		// Send to GA4
		ReactGA.event({
			category: "Session",
			action: "session_end",
			value: activeTime,
		});

		// Send to database
		trackEvent("Session", "session_end", reason, activeTime, {
			totalTime,
			activeTime,
			endReason: reason,
			timeSinceLastActivity,
			wasVisible: isPageVisible,
		});
	}
};

/**
 * Manually end session (e.g., on logout)
 */
export const endSession = (reason: string = "manual") => {
	sendSessionData(reason);
};

export const getActiveTime = () => activeTime;
export const getSessionDuration = () => {
	if (!sessionStartTime) return 0;
	return Math.floor((Date.now() - sessionStartTime) / 1000);
};
