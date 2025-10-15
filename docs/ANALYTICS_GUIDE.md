# Analytics System Guide

## Overview

The analytics system tracks user behavior and events across the application, storing data in both **Google Analytics 4** (GA4) and our **PostgreSQL database**. This dual approach gives us the best of both worlds:

-   GA4 for their powerful analytics tools and reporting
-   Database for custom queries, detailed analysis, and data ownership

## Architecture

### Components

1. **Database Schema** (`prisma/schema.prisma`)

    - `AnalyticsEvent` model stores all events with flexible metadata
    - Includes `isDev` flag to distinguish development from production events

2. **Server Actions** (`src/lib/actions/`)

    - `analytics.ts` - Save events to database
    - `analyticsQueries.ts` - Query analytics data

3. **Client Library** (`src/lib/analytics.ts`)

    - Tracking functions that send to both GA4 and database
    - Session management
    - Guest ID tracking

4. **Guest ID Management** (`src/lib/guestId.ts`)
    - Generates and stores anonymous user IDs in localStorage
    - Tracks users before authentication

## Current Event Types

### Session Events

-   `session_start` - When user starts a session
-   `session_end` - When user ends a session (includes duration and end reason)
    -   End reasons: `page_unload`, `page_hide`, `sign_out`, `timeout`, `error`, `manual`
    -   Metadata includes: `totalTime`, `activeTime`, `endReason`, `timeSinceLastActivity`, `wasVisible`

### Lesson Events

-   `lesson_start` - User starts a lesson
-   `lesson_complete` - User completes a lesson
-   `step_complete` - User completes a lesson step

### Code Events

-   `code_run` - User runs code (every execution)
-   `code_submit_correct` - User submits correct code
    -   `eventValue` contains the number of attempts it took to succeed
    -   Attempts counter resets for each new step/challenge
-   `code_submit_incorrect` - User submits incorrect code
    -   `eventLabel` contains the error message
    -   Each failed attempt increments the counter (tracked on next success)

### Progress Events

-   `level_up` - User levels up
-   `skill_node_complete` - User completes a skill node

### Auth Events

-   `auth_signup` - User signs up
-   `auth_signin` - User signs in
    -   Metadata includes: `previousGuestId` (guest ID before signing in)
-   `auth_signout` - User signs out
    -   Metadata includes: `timestamp`
    -   Automatically triggers a `session_end` event with reason `sign_out`

## Adding New Events

### Step 1: Add Tracking Function

Add a new function to `src/lib/analytics.ts`:

```typescript
export const trackNewEvent = (
	param1: string,
	param2: number
	// ... other params
) => {
	trackEvent(
		"CategoryName", // Event category
		"action_name", // Event action
		"Label (optional)", // Event label
		42, // Event value (optional number)
		{
			// Metadata (flexible JSON)
			param1,
			param2,
			customField: "value",
			// Any data you want to store
		}
	);
};
```

### Step 2: Use the Function

Import and call it anywhere in your application:

```typescript
import { trackNewEvent } from "@/lib/analytics";

// In your component or function
trackNewEvent("value1", 123);
```

### Examples

#### Example 1: Track Video Playback

```typescript
export const trackVideoPlay = (
	videoId: string,
	videoTitle: string,
	position: number
) => {
	trackEvent("Video", "video_play", videoTitle, position, {
		videoId,
		videoTitle,
		position,
		timestamp: new Date().toISOString(),
	});
};

export const trackVideoComplete = (
	videoId: string,
	videoTitle: string,
	duration: number
) => {
	trackEvent("Video", "video_complete", videoTitle, duration, {
		videoId,
		videoTitle,
		duration,
	});
};
```

#### Example 2: Track Quiz Events

```typescript
export const trackQuizStart = (quizId: string, quizTitle: string) => {
	trackEvent("Quiz", "quiz_start", quizTitle, undefined, {
		quizId,
		quizTitle,
	});
};

export const trackQuizAnswer = (
	quizId: string,
	questionId: string,
	isCorrect: boolean,
	timeSpent: number
) => {
	trackEvent(
		"Quiz",
		isCorrect ? "quiz_answer_correct" : "quiz_answer_incorrect",
		questionId,
		timeSpent,
		{
			quizId,
			questionId,
			isCorrect,
			timeSpent,
		}
	);
};

export const trackQuizComplete = (
	quizId: string,
	score: number,
	totalQuestions: number
) => {
	trackEvent("Quiz", "quiz_complete", quizId, score, {
		quizId,
		score,
		totalQuestions,
		percentage: (score / totalQuestions) * 100,
	});
};
```

#### Example 3: Track Social Features

```typescript
export const trackShareContent = (
	contentType: string,
	contentId: string,
	platform: string
) => {
	trackEvent("Social", "content_share", platform, undefined, {
		contentType,
		contentId,
		platform,
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
	});
};
```

## Special Use Cases

### Tracking Logout and Session End

Session end is automatically tracked when users close/refresh the page. Logout also triggers both an `auth_signout` event and a `session_end` event:

```typescript
import { trackAuthSignout, endSession } from "@/lib/analytics";

// In your logout handler
async function handleLogout() {
	trackAuthSignout(); // Track auth event
	endSession("sign_out"); // Track session end with reason
	await signOut(); // Perform actual sign out
}
```

**Auth Signout Event** (`auth_signout`):

-   Category: `Auth`
-   Action: `auth_signout`
-   Metadata: `timestamp`

**Session End Event** (`session_end`):

-   Category: `Session`
-   Action: `session_end`
-   Label: End reason (e.g., `sign_out`, `page_unload`, `page_hide`, `timeout`)
-   Value: Active time in seconds

Session end events include rich metadata:

-   `endReason`: Why the session ended (sign_out, page_unload, page_hide, timeout, etc.)
-   `totalTime`: Total session duration in seconds
-   `activeTime`: Time user was actively engaged
-   `timeSinceLastActivity`: Seconds since last interaction
-   `wasVisible`: Whether page was visible when ended

**Example Session End Reasons:**

-   `sign_out` - User clicked logout button
-   `page_unload` - User closed browser/tab or navigated away
-   `page_hide` - Page became hidden (tab switch, minimize, etc.)
-   `timeout` - Session expired due to inactivity

### Development vs Production Events

All analytics events automatically track whether they came from a development or production environment via the `isDev` field:

-   `isDev: true` - Event came from `NODE_ENV=development` (local development)
-   `isDev: false` - Event came from production environment

**Benefits:**

-   Filter out test data when analyzing production metrics
-   Separate development testing from real user behavior
-   Debug analytics implementation without polluting production data
-   Compare development vs production event patterns

**Implementation:**

```typescript
// Automatically detected in trackEvent()
const isDev = process.env.NODE_ENV === "development";
```

## Querying Analytics Data

### Get User Events

```typescript
import { getUserEvents } from "@/lib/actions/analyticsQueries";

const result = await getUserEvents(100, 0, "Lesson");
if (result.success) {
	console.log(result.events);
	console.log(result.total);
	console.log(result.hasMore);
}
```

### Get Event Statistics

```typescript
import { getEventStats } from "@/lib/actions/analyticsQueries";

const result = await getEventStats();
if (result.success) {
	console.log(result.stats.totalEvents);
	console.log(result.stats.eventsByCategory);
	console.log(result.stats.eventsByAction);
	console.log(result.stats.totalXP);
}
```

### Get Session Analytics

```typescript
import { getSessionAnalytics } from "@/lib/actions/analyticsQueries";

const result = await getSessionAnalytics(sessionId);
if (result.success) {
	console.log(result.session);
	console.log(result.events);
	console.log(result.eventCount);
}
```

### Filter Production-Only Events

To exclude development events from your analytics:

```typescript
import { prisma } from "@/lib/prisma";

// Get only production events
const productionEvents = await prisma.analyticsEvent.findMany({
	where: {
		isDev: false, // Only production events
		eventCategory: "Lesson",
	},
	orderBy: {
		createdAt: "desc",
	},
});

// Get event counts by environment
const eventsByEnv = await prisma.analyticsEvent.groupBy({
	by: ["isDev"],
	_count: {
		id: true,
	},
});
// Result: [{ isDev: false, _count: { id: 1234 } }, { isDev: true, _count: { id: 56 } }]

// Get average attempts for production users only
const productionAttempts = await prisma.analyticsEvent.aggregate({
	where: {
		eventAction: "code_submit_correct",
		isDev: false, // Production only
	},
	_avg: {
		eventValue: true,
	},
});
console.log(`Average attempts (prod): ${productionAttempts._avg.eventValue}`);
```

## Best Practices

### 1. Consistent Naming

-   Use descriptive category names (e.g., "Lesson", "Quiz", "Video")
-   Use snake_case for actions (e.g., "lesson_start", "video_complete")
-   Keep names consistent across similar events

### 2. Meaningful Metadata

-   Store all relevant context in the metadata field
-   Include IDs for entities (lessonId, quizId, etc.)
-   Add timestamps for time-based analysis
-   Don't store sensitive information (passwords, tokens, etc.)

### 3. Event Values

-   Use event values for numeric metrics that you want to aggregate
-   Examples: XP gained, time spent, scores, counts
-   Keep values consistent within an event category

### 4. Error Handling

-   Analytics should never break the app
-   All tracking calls include error handling
-   Database failures are logged but don't affect GA4

### 5. Performance

-   Events are sent asynchronously
-   Don't wait for analytics to complete before continuing
-   Use batch operations for multiple events when possible

## Database Schema

```prisma
model AnalyticsEvent {
  id            String    @id @default(uuid())
  userId        String?   // Authenticated user ID
  guestId       String?   // Anonymous user ID
  eventCategory String    // Event category
  eventAction   String    // Event action
  eventLabel    String?   // Optional label
  eventValue    Int?      // Optional numeric value
  metadata      Json?     // Flexible JSON metadata
  sessionId     String?   // Session grouping
  createdAt     DateTime  @default(now())

  @@index([userId, createdAt])
  @@index([guestId, createdAt])
  @@index([eventCategory, eventAction])
  @@index([sessionId])
}
```

## Privacy & Security

### Guest IDs

-   Generated client-side using crypto.randomUUID()
-   Stored in localStorage (key: `bitschool_guest_id`)
-   Used to track anonymous users before authentication
-   Cleared on logout (optional)

### Data Retention

-   Events are stored indefinitely by default
-   Consider implementing a data retention policy
-   Add GDPR/privacy compliance as needed

### PII Handling

-   Never store passwords or tokens in events
-   Be careful with email addresses and names
-   Use IDs instead of personal information when possible

## Future Enhancements

Potential additions to the analytics system:

1. **Admin Dashboard** - View analytics in the app
2. **Real-time Events** - WebSocket-based live analytics
3. **Event Funnels** - Track user journeys through flows
4. **A/B Testing** - Track experiment variants
5. **Cohort Analysis** - Group users and analyze behavior
6. **Data Export** - Export analytics data to CSV/JSON
7. **Automated Reports** - Email scheduled analytics reports
8. **Event Validation** - Validate event schemas before saving
9. **Rate Limiting** - Prevent analytics spam
10. **Data Anonymization** - Auto-anonymize old data
