# Session End Reason Tracking

## Overview

Session end events now include the reason why the session ended, along with additional context about the session state at the time of ending.

## Session End Reasons

The `eventLabel` field in `session_end` events contains one of these reasons:

### Automatic Reasons

**`page_unload`** - User closed/refreshed the page

-   Desktop browsers
-   Most common on desktop
-   Triggered by `beforeunload` event

**`page_hide`** - Page was hidden/closed

-   More reliable on mobile browsers
-   Triggered by `pagehide` event
-   Better mobile support than `beforeunload`

### Manual Reasons

**`logout`** - User explicitly logged out

-   Call `endSession("logout")` in your logout handler

**`timeout`** - Session expired due to inactivity

-   Call `endSession("timeout")` if implementing timeout logic

**`error`** - Session ended due to error

-   Call `endSession("error")` in error boundaries

**`manual`** - Explicitly ended for other reasons

-   Default when calling `endSession()` without parameters

## Metadata Tracked

Each `session_end` event includes:

```typescript
{
  totalTime: number,          // Total session duration in seconds
  activeTime: number,         // Time user was actively engaged (seconds)
  endReason: string,          // Why the session ended
  timeSinceLastActivity: number, // Seconds since last user activity
  wasVisible: boolean,        // Was page visible when session ended
}
```

## Usage

### Automatic (Already Implemented)

Session ends are automatically tracked when:

-   User closes the tab/window → `page_unload`
-   User refreshes the page → `page_unload`
-   Mobile browser suspends → `page_hide`

### Manual Session Ending

For explicit logout or other scenarios:

```typescript
import { endSession } from "@/lib/analytics";

// On logout
function handleLogout() {
	endSession("logout");
	// ... rest of logout logic
}

// On session timeout
function handleSessionTimeout() {
	endSession("timeout");
	// ... redirect to login
}

// On critical error
function handleCriticalError() {
	endSession("error");
	// ... error handling
}
```

## Example Queries

### Get Session End Reasons

```typescript
const sessionEnds = await prisma.analyticsEvent.findMany({
	where: {
		eventAction: "session_end",
	},
	select: {
		eventLabel: true, // This is the reason
		eventValue: true, // Active time
		metadata: true,
		createdAt: true,
	},
});

// Group by reason
const reasonCounts = sessionEnds.reduce((acc, event) => {
	const reason = event.eventLabel || "unknown";
	acc[reason] = (acc[reason] || 0) + 1;
	return acc;
}, {});

console.log(reasonCounts);
// { page_unload: 150, page_hide: 45, logout: 12, timeout: 3 }
```

### Analyze Engagement by End Reason

```typescript
const engagementByReason = await prisma.$queryRaw`
  SELECT 
    "eventLabel" as reason,
    COUNT(*) as sessions,
    AVG("eventValue") as avg_active_time,
    AVG(CAST(metadata->>'totalTime' AS INTEGER)) as avg_total_time,
    AVG(CAST(metadata->>'timeSinceLastActivity' AS INTEGER)) as avg_inactive_time
  FROM "AnalyticsEvent"
  WHERE "eventAction" = 'session_end'
  GROUP BY "eventLabel"
  ORDER BY sessions DESC
`;
```

### Find Abandoned Sessions

Sessions that ended while user was inactive:

```typescript
const abandonedSessions = await prisma.analyticsEvent.findMany({
	where: {
		eventAction: "session_end",
		metadata: {
			path: ["timeSinceLastActivity"],
			gt: 300, // More than 5 minutes inactive
		},
	},
});
```

### Compare Logout vs. Other Endings

```typescript
// Users who logged out properly
const logoutSessions = await prisma.analyticsEvent.count({
	where: {
		eventAction: "session_end",
		eventLabel: "logout",
	},
});

// Users who just closed the tab
const unloadSessions = await prisma.analyticsEvent.count({
	where: {
		eventAction: "session_end",
		eventLabel: { in: ["page_unload", "page_hide"] },
	},
});

console.log(
	`Logout rate: ${(
		(logoutSessions / (logoutSessions + unloadSessions)) *
		100
	).toFixed(1)}%`
);
```

## Use Cases

### 1. Engagement Analysis

-   How many users actively log out vs. just close the tab?
-   What's the average active time for different end reasons?
-   Are mobile users (page_hide) less engaged than desktop users?

### 2. UX Improvements

-   If many sessions end due to timeout, consider longer timeouts
-   If users rarely log out explicitly, maybe logout button is hard to find
-   Analyze sessions ending with low active time to find friction points

### 3. Session Quality

-   Calculate engagement ratio: `activeTime / totalTime`
-   Identify high-quality sessions (high engagement, explicit logout)
-   Find problematic sessions (quick exit, high inactivity)

### 4. Mobile vs Desktop

-   `page_hide` is predominantly mobile
-   Compare mobile engagement to desktop engagement
-   Optimize for platform-specific behaviors

## Implementation Details

### Why Two Events (beforeunload + pagehide)?

```typescript
// Desktop: beforeunload fires reliably
window.addEventListener("beforeunload", () => {
	sendSessionData("page_unload");
});

// Mobile: pagehide is more reliable
window.addEventListener("pagehide", () => {
	sendSessionData("page_hide");
});
```

**Note:** Some browsers may fire both events. The database will record both, but you can dedupe by `sessionId` when analyzing.

### Additional Context

The metadata includes:

-   **totalTime**: How long the session lasted
-   **activeTime**: How much of that time the user was active
-   **timeSinceLastActivity**: When they stopped interacting
-   **wasVisible**: If the page was visible when it ended

This helps distinguish between:

-   Active sessions that ended intentionally
-   Abandoned sessions where user wandered off
-   Background tabs that eventually closed

---

**Date:** October 15, 2025  
**Status:** ✅ Implemented
