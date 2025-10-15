# Code Submission Attempts Tracking

## Overview

The system now tracks the actual number of attempts a user makes before successfully completing a code challenge, rather than hardcoding it to `1`.

## Implementation

### Architecture

The `attemptsCount` state is managed at the `WorkspaceContent` level alongside `currentStepIndex`, allowing for explicit resets when navigation occurs without relying on `useEffect`.

**Benefits of this approach:**

-   ✅ **No useEffect needed** - Attempts reset explicitly where navigation happens
-   ✅ **Co-located with navigation logic** - State lives next to the step/lesson indices it relates to
-   ✅ **More predictable** - Resets happen synchronously with navigation
-   ✅ **Easier to debug** - Clear, explicit function calls instead of reactive effects

### Changes Made

**1. State Management (`src/features/Workspace/WorkspaceContent.tsx`)**

```typescript
const [attemptsCount, setAttemptsCount] = useState(0);
```

State is lifted to the parent component where step/lesson navigation is controlled.

**2. Pass State to Hooks**

```typescript
// Pass to useConsole for tracking
const { iframeRef, handleTest, isExecuting } = useConsole(
	code,
	currentLesson,
	currentStepIndex,
	lessonStreaming.handleTestResults,
	attemptsCount,
	setAttemptsCount
);

// Pass to useLessonStreaming for resetting
const lessonStreaming = useLessonStreaming({
	// ... other props
	setAttemptsCount,
});
```

**3. Track Attempts on Test Submission (`src/features/Workspace/Console/hooks/useConsole.tsx`)**

```typescript
const handleTest = async () => {
	// Increment attempts for this step
	const currentAttempt = attemptsCount + 1;
	setAttemptsCount(currentAttempt);

	// ... test execution logic

	if (allTestsPassed) {
		trackCodeSubmitCorrect(
			currentLesson.id,
			currentQuestion.id,
			currentAttempt // Now using real attempts!
		);
	}
};
```

**4. Reset When Navigation Occurs (`src/features/Workspace/hooks/useLessonStreaming.ts`)**

```typescript
// When moving to next step
setTimeout(() => {
	setCurrentStepIndex(currentStepIndex + 1);
	setAttemptsCount(0); // Reset explicitly
	// ... other logic
}, 300);

// When moving to next lesson
setTimeout(() => {
	setCurrentLessonIndex(currentLessonIndex + 1);
	setCurrentStepIndex(0);
	setAttemptsCount(0); // Reset explicitly
	// ... other logic
}, 1000);
```

## How It Works

### Attempt Counting Flow

```
Step 1 - New Challenge
  attempts = 0

User clicks "Test" → Fail
  attempts = 1
  Track: code_submit_incorrect

User clicks "Test" → Fail
  attempts = 2
  Track: code_submit_incorrect

User clicks "Test" → Success
  attempts = 3
  Track: code_submit_correct with attempts=3

Step 2 - Next Challenge
  attempts = 0 (reset)
  ...
```

### What Gets Tracked

**On Success:**

```typescript
{
  eventCategory: "Code",
  eventAction: "code_submit_correct",
  eventLabel: "lesson-id-step-id",
  eventValue: 3,  // Number of attempts
  metadata: {
    lessonId: "lesson-id",
    stepId: "step-id",
    attempts: 3
  }
}
```

**On Failure:**

```typescript
{
  eventCategory: "Code",
  eventAction: "code_submit_incorrect",
  eventLabel: "error_message",
  metadata: {
    lessonId: "lesson-id",
    stepId: "step-id",
    errorType: "Test failed"
  }
}
```

## Analytics Use Cases

### 1. Difficulty Analysis

Find which steps require the most attempts:

```typescript
const stepDifficulty = await prisma.analyticsEvent.groupBy({
	by: ["metadata"],
	where: {
		eventAction: "code_submit_correct",
	},
	_avg: {
		eventValue: true, // Average attempts
	},
	_count: {
		id: true, // Number of completions
	},
});

// Sort by average attempts to find hardest challenges
const hardest = stepDifficulty.sort(
	(a, b) => (b._avg.eventValue || 0) - (a._avg.eventValue || 0)
);
```

### 2. User Skill Assessment

Identify struggling vs. advanced users:

```typescript
const userPerformance = await prisma.analyticsEvent.groupBy({
	by: ["userId"],
	where: {
		eventAction: "code_submit_correct",
	},
	_avg: {
		eventValue: true, // Average attempts per user
	},
});

// Users with low average attempts = skilled
// Users with high average attempts = may need help
```

### 3. First-Try Success Rate

Calculate how often users get it right on the first try:

```typescript
const firstTrySuccess = await prisma.analyticsEvent.count({
	where: {
		eventAction: "code_submit_correct",
		eventValue: 1,
	},
});

const totalSuccess = await prisma.analyticsEvent.count({
	where: {
		eventAction: "code_submit_correct",
	},
});

const firstTryRate = (firstTrySuccess / totalSuccess) * 100;
console.log(`${firstTryRate.toFixed(1)}% first-try success rate`);
```

### 4. Persistence Analysis

See how many attempts users make before giving up vs. succeeding:

```typescript
// Get all attempts for a specific step
const stepAttempts = await prisma.analyticsEvent.findMany({
	where: {
		eventCategory: "Code",
		metadata: {
			path: ["stepId"],
			equals: "specific-step",
		},
	},
	orderBy: {
		createdAt: "asc",
	},
});

// Count sequences that ended in success vs. abandonment
```

### 5. Learning Curve

Track improvement over time:

```typescript
// Get user's attempts chronologically
const userProgress = await prisma.analyticsEvent.findMany({
	where: {
		userId: "user-id",
		eventAction: "code_submit_correct",
	},
	orderBy: {
		createdAt: "asc",
	},
	select: {
		eventValue: true, // Attempts
		createdAt: true,
	},
});

// Plot attempts over time to see if user improves
```

## Benefits

✅ **Accurate Difficulty Metrics** - Know which challenges are actually hard  
✅ **User Segmentation** - Identify users who need help vs. advanced users  
✅ **Content Optimization** - Find steps that need better hints or explanations  
✅ **Engagement Tracking** - See how persistent users are with challenges  
✅ **Skill Assessment** - Measure learning progress objectively  
✅ **A/B Testing** - Compare difficulty of different teaching approaches

## Example Queries

### Average Attempts by Step Type

```typescript
const avgAttemptsByType = await prisma.$queryRaw`
  SELECT 
    metadata->>'stepType' as step_type,
    AVG(CAST("eventValue" AS FLOAT)) as avg_attempts,
    COUNT(*) as completions
  FROM "AnalyticsEvent"
  WHERE "eventAction" = 'code_submit_correct'
  GROUP BY metadata->>'stepType'
  ORDER BY avg_attempts DESC
`;
```

### Users Struggling on Current Challenge

```typescript
// Find users with many failed attempts on their current step
const strugglingUsers = await prisma.analyticsEvent.groupBy({
	by: ["userId", "metadata"],
	where: {
		eventAction: "code_submit_incorrect",
		createdAt: {
			gte: new Date(Date.now() - 3600000), // Last hour
		},
	},
	_count: {
		id: true,
	},
	having: {
		id: {
			_count: {
				gt: 5, // More than 5 failures
			},
		},
	},
});

// Could trigger intervention (hint, video, etc.)
```

### Completion Rate by Attempt Count

```typescript
const completionByAttempts = await prisma.analyticsEvent.groupBy({
	by: ["eventValue"], // Group by number of attempts
	where: {
		eventAction: "code_submit_correct",
	},
	_count: {
		id: true,
	},
	orderBy: {
		eventValue: "asc",
	},
});

// See distribution: how many users succeed on 1st, 2nd, 3rd attempt, etc.
```

## Future Enhancements

Potential additions:

1. **Time Per Attempt** - Track time between attempts
2. **Hint Usage** - Correlate hint views with attempt count
3. **Code Diff Analysis** - See how code changes between attempts
4. **Give Up Detection** - Alert when user has many failures and stops
5. **Smart Hints** - Show contextual hints after N failed attempts
6. **Adaptive Difficulty** - Adjust next challenges based on attempt patterns

---

**Date:** October 15, 2025  
**Status:** ✅ Implemented
