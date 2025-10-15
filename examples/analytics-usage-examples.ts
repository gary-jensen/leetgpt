/**
 * Analytics Usage Examples
 *
 * This file demonstrates how to use the analytics system
 * and add new custom events for future features.
 */

import {
	trackEvent,
	trackLessonStart,
	trackLessonComplete,
	trackCodeRun,
	trackLevelUp,
} from "@/lib/analytics";

// ============================================================================
// EXISTING EVENTS - Already implemented and working
// ============================================================================

// Example 1: Track lesson start
function handleLessonStart() {
	trackLessonStart("lesson-101", "Introduction to JavaScript");
}

// Example 2: Track lesson completion with XP
function handleLessonComplete() {
	trackLessonComplete("lesson-101", "Introduction to JavaScript", 50);
}

// Example 3: Track code execution
function handleCodeRun() {
	trackCodeRun("lesson-101", "step-1");
}

// Example 4: Track level up
function handleLevelUp() {
	trackLevelUp(5); // User reached level 5
}

// ============================================================================
// NEW CUSTOM EVENTS - Examples for future features
// ============================================================================

// Example 5: Track video playback
export const trackVideoPlay = (
	videoId: string,
	videoTitle: string,
	currentPosition: number = 0
) => {
	trackEvent("Video", "video_play", videoTitle, currentPosition, {
		videoId,
		videoTitle,
		position: currentPosition,
		timestamp: new Date().toISOString(),
	});
};

export const trackVideoPause = (
	videoId: string,
	currentPosition: number,
	duration: number
) => {
	trackEvent("Video", "video_pause", videoId, currentPosition, {
		videoId,
		position: currentPosition,
		duration,
		percentageWatched: (currentPosition / duration) * 100,
	});
};

export const trackVideoComplete = (videoId: string, duration: number) => {
	trackEvent("Video", "video_complete", videoId, duration, {
		videoId,
		duration,
	});
};

// Example 6: Track quiz/assessment events
export const trackQuizStart = (quizId: string, quizTitle: string) => {
	trackEvent("Quiz", "quiz_start", quizTitle, undefined, {
		quizId,
		quizTitle,
		startTime: new Date().toISOString(),
	});
};

export const trackQuizAnswer = (
	quizId: string,
	questionId: string,
	questionNumber: number,
	isCorrect: boolean,
	timeSpent: number
) => {
	trackEvent(
		"Quiz",
		isCorrect ? "quiz_answer_correct" : "quiz_answer_incorrect",
		`Q${questionNumber}`,
		timeSpent,
		{
			quizId,
			questionId,
			questionNumber,
			isCorrect,
			timeSpent,
		}
	);
};

export const trackQuizComplete = (
	quizId: string,
	score: number,
	totalQuestions: number,
	timeSpent: number
) => {
	const percentage = (score / totalQuestions) * 100;

	trackEvent("Quiz", "quiz_complete", quizId, score, {
		quizId,
		score,
		totalQuestions,
		percentage,
		timeSpent,
		passed: percentage >= 70, // Assuming 70% is passing
	});
};

// Example 7: Track social/community features
export const trackContentShare = (
	contentType: string,
	contentId: string,
	platform: string
) => {
	trackEvent("Social", "content_share", platform, undefined, {
		contentType, // "lesson", "achievement", "progress"
		contentId,
		platform, // "twitter", "facebook", "linkedin", "copy"
	});
};

export const trackCommentPost = (
	contentType: string,
	contentId: string,
	commentLength: number
) => {
	trackEvent("Social", "comment_post", contentType, commentLength, {
		contentType,
		contentId,
		commentLength,
		hasLinks: commentLength > 100, // example additional metadata
	});
};

export const trackProfileView = (viewedUserId: string, context: string) => {
	trackEvent("Social", "profile_view", context, undefined, {
		viewedUserId,
		context, // "leaderboard", "comment", "direct"
	});
};

// Example 8: Track challenge/competition events
export const trackChallengeJoin = (
	challengeId: string,
	challengeType: string
) => {
	trackEvent("Challenge", "challenge_join", challengeType, undefined, {
		challengeId,
		challengeType, // "daily", "weekly", "tournament"
	});
};

export const trackChallengeComplete = (
	challengeId: string,
	rank: number,
	score: number
) => {
	trackEvent("Challenge", "challenge_complete", challengeId, score, {
		challengeId,
		rank,
		score,
	});
};

// Example 9: Track streak and habit formation
export const trackDailyStreakContinued = (streakDays: number) => {
	trackEvent("Engagement", "streak_continued", undefined, streakDays, {
		streakDays,
		milestone: streakDays % 7 === 0, // Weekly milestone
	});
};

export const trackDailyStreakBroken = (
	previousStreak: number,
	daysMissed: number
) => {
	trackEvent("Engagement", "streak_broken", undefined, previousStreak, {
		previousStreak,
		daysMissed,
	});
};

// Example 10: Track resource downloads/exports
export const trackResourceDownload = (
	resourceType: string,
	resourceId: string,
	format: string
) => {
	trackEvent("Resource", "resource_download", resourceType, undefined, {
		resourceType, // "certificate", "notes", "code"
		resourceId,
		format, // "pdf", "txt", "zip"
	});
};

// Example 11: Track search and discovery
export const trackSearch = (
	searchQuery: string,
	resultCount: number,
	category?: string
) => {
	trackEvent("Search", "search_query", category || "all", resultCount, {
		searchQuery: searchQuery.toLowerCase(),
		resultCount,
		category,
		hasResults: resultCount > 0,
	});
};

export const trackSearchResultClick = (
	searchQuery: string,
	resultId: string,
	resultPosition: number
) => {
	trackEvent("Search", "search_result_click", searchQuery, resultPosition, {
		searchQuery: searchQuery.toLowerCase(),
		resultId,
		resultPosition,
	});
};

// Example 12: Track help and support
export const trackHelpArticleView = (
	articleId: string,
	articleTitle: string
) => {
	trackEvent("Support", "help_article_view", articleTitle, undefined, {
		articleId,
		articleTitle,
	});
};

export const trackHelpfulVote = (articleId: string, wasHelpful: boolean) => {
	trackEvent(
		"Support",
		wasHelpful ? "help_article_helpful" : "help_article_not_helpful",
		articleId,
		undefined,
		{
			articleId,
			wasHelpful,
		}
	);
};

// Example 13: Track error and issue reporting
export const trackUserReportedIssue = (issueType: string, context: string) => {
	trackEvent("Support", "issue_reported", issueType, undefined, {
		issueType, // "bug", "content_error", "feature_request"
		context, // What they were doing when they reported
	});
};

// Example 14: Track notifications and emails
export const trackNotificationReceived = (notificationType: string) => {
	trackEvent(
		"Notification",
		"notification_received",
		notificationType,
		undefined,
		{
			notificationType, // "achievement", "reminder", "social"
		}
	);
};

export const trackNotificationClicked = (
	notificationId: string,
	notificationType: string
) => {
	trackEvent(
		"Notification",
		"notification_clicked",
		notificationType,
		undefined,
		{
			notificationId,
			notificationType,
		}
	);
};

// Example 15: Track feature usage
export const trackFeatureUsed = (
	featureName: string,
	context?: Record<string, any>
) => {
	trackEvent("Feature", "feature_used", featureName, undefined, {
		featureName,
		...context,
	});
};

export const trackFeatureDiscovered = (
	featureName: string,
	discoveryMethod: string
) => {
	trackEvent("Feature", "feature_discovered", featureName, undefined, {
		featureName,
		discoveryMethod, // "tutorial", "organic", "notification"
	});
};

// ============================================================================
// USAGE IN COMPONENTS
// ============================================================================

/*
// Example component usage:

import { trackVideoPlay, trackQuizStart } from "@/lib/analytics/custom-events";

export function VideoPlayer({ videoId, title }) {
  const handlePlay = () => {
    trackVideoPlay(videoId, title, videoRef.current?.currentTime);
  };
  
  return <video onPlay={handlePlay} ... />;
}

export function QuizComponent({ quizId, title }) {
  const startQuiz = () => {
    trackQuizStart(quizId, title);
    // ... start quiz logic
  };
  
  return <button onClick={startQuiz}>Start Quiz</button>;
}
*/

// ============================================================================
// QUERYING ANALYTICS DATA
// ============================================================================

/*
// Example queries in server components or API routes:

import { 
  getUserEvents, 
  getEventStats,
  getSessionAnalytics 
} from "@/lib/actions/analyticsQueries";

// Get user's recent video watches
const videoEvents = await getUserEvents(50, 0, "Video");
const watchedVideos = videoEvents.events.filter(
  e => e.eventAction === "video_complete"
);

// Get overall statistics
const stats = await getEventStats();
console.log("Total XP earned:", stats.stats.totalXP);
console.log("Events by category:", stats.stats.eventsByCategory);

// Analyze specific session
const sessionData = await getSessionAnalytics(sessionId);
console.log("Session events:", sessionData.events);
*/

export default {
	// Export all tracking functions
	trackVideoPlay,
	trackVideoPause,
	trackVideoComplete,
	trackQuizStart,
	trackQuizAnswer,
	trackQuizComplete,
	trackContentShare,
	trackCommentPost,
	trackProfileView,
	trackChallengeJoin,
	trackChallengeComplete,
	trackDailyStreakContinued,
	trackDailyStreakBroken,
	trackResourceDownload,
	trackSearch,
	trackSearchResultClick,
	trackHelpArticleView,
	trackHelpfulVote,
	trackUserReportedIssue,
	trackNotificationReceived,
	trackNotificationClicked,
	trackFeatureUsed,
	trackFeatureDiscovered,
};
