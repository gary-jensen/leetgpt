"use client";

import ReactGA from "react-ga4";

// Initialize GA4
export const initGA = () => {
	const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
	if (measurementId) {
		ReactGA.initialize(measurementId);
	} else {
		console.warn("GA4 Measurement ID not found");
	}
};

// Custom event tracking
export const trackEvent = (
	category: string,
	action: string,
	label?: string,
	value?: number
) => {
	ReactGA.event({
		category,
		action,
		label,
		value,
	});
};

// Session tracking
export const trackSessionStart = () => {
	trackEvent("Session", "session_start");
};

// Lesson tracking
export const trackLessonStart = (lessonId: string, lessonTitle: string) => {
	trackEvent("Lesson", "lesson_start", lessonTitle);
	ReactGA.event({
		category: "Lesson",
		action: "lesson_start",
		label: lessonTitle,
	} as any);
};

export const trackLessonComplete = (
	lessonId: string,
	lessonTitle: string,
	xpGained: number
) => {
	trackEvent("Lesson", "lesson_complete", lessonTitle, xpGained);
	ReactGA.event({
		category: "Lesson",
		action: "lesson_complete",
		label: lessonTitle,
		value: xpGained,
	} as any);
};

export const trackStepComplete = (
	lessonId: string,
	stepId: string,
	xpGained: number
) => {
	trackEvent("Step", "step_complete", `${lessonId}-${stepId}`, xpGained);
};

// Code execution tracking
export const trackCodeRun = (lessonId: string, stepId: string) => {
	trackEvent("Code", "code_run", `${lessonId}-${stepId}`);
};

export const trackCodeSubmitCorrect = (
	lessonId: string,
	stepId: string,
	attempts: number
) => {
	trackEvent(
		"Code",
		"code_submit_correct",
		`${lessonId}-${stepId}`,
		attempts
	);
};

export const trackCodeSubmitIncorrect = (
	lessonId: string,
	stepId: string,
	errorType?: string
) => {
	trackEvent("Code", "code_submit_incorrect", errorType || "unknown");
};

// Progress tracking
export const trackLevelUp = (newLevel: number) => {
	trackEvent("Progress", "level_up", `Level ${newLevel}`, newLevel);
	ReactGA.event({
		category: "Progress",
		action: "level_up",
		value: newLevel,
	} as any);
};

export const trackSkillNodeComplete = (nodeName: string) => {
	trackEvent("Progress", "skill_node_complete", nodeName);
};

// Auth tracking
export const trackAuthSignup = () => {
	trackEvent("Auth", "auth_signup");
	ReactGA.event({
		category: "Auth",
		action: "auth_signup",
	});
};

export const trackAuthSignin = () => {
	trackEvent("Auth", "auth_signin");
	ReactGA.event({
		category: "Auth",
		action: "auth_signin",
	});
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
		sendSessionData();
	});
};

const handleVisibilityChange = () => {
	isPageVisible = !document.hidden;
	if (isPageVisible) {
		lastActivityTime = Date.now();
	}
};

const sendSessionData = () => {
	if (sessionStartTime) {
		const totalTime = Math.floor((Date.now() - sessionStartTime) / 1000);

		ReactGA.event({
			category: "Session",
			action: "session_end",
			value: activeTime,
		} as any);
	}
};

export const getActiveTime = () => activeTime;
export const getSessionDuration = () => {
	if (!sessionStartTime) return 0;
	return Math.floor((Date.now() - sessionStartTime) / 1000);
};
