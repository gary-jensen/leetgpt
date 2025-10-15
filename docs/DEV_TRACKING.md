# Development Environment Tracking

## Overview

All analytics events now automatically track whether they originated from a development or production environment via the `isDev` boolean field. This allows you to separate test data from real user analytics.

## Implementation

### Database Schema

Added `isDev` field to the `AnalyticsEvent` model:

```prisma
model AnalyticsEvent {
    id            String   @id @default(uuid())
    userId        String?
    user          User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
    guestId       String?
    eventCategory String
    eventAction   String
    eventLabel    String?
    eventValue    Int?
    metadata      Json?
    sessionId     String?
    isDev         Boolean  @default(false)  // NEW FIELD
    createdAt     DateTime @default(now())

    @@index([userId, createdAt])
    @@index([guestId, createdAt])
    @@index([eventCategory, eventAction])
    @@index([sessionId])
    @@index([isDev])  // NEW INDEX for efficient filtering
}
```

### Automatic Detection

The `isDev` flag is automatically set based on `NODE_ENV`:

```typescript
// src/lib/analytics.ts
export const trackEvent = (
	category: string,
	action: string,
	label?: string,
	value?: number,
	metadata?: Record<string, any>
) => {
	// Detect environment automatically
	const isDev = process.env.NODE_ENV === "development";

	// Send to database with isDev flag
	saveAnalyticsEvent({
		eventCategory: category,
		eventAction: action,
		eventLabel: label,
		eventValue: value,
		metadata,
		sessionId: getSessionId(),
		guestId: getGuestId(),
		isDev, // Automatically tracked
	});
};
```

### Server Actions

Updated the analytics server actions to accept and store the `isDev` field:

```typescript
// src/lib/actions/analytics.ts
export interface AnalyticsEventData {
	eventCategory: string;
	eventAction: string;
	eventLabel?: string;
	eventValue?: number;
	metadata?: Record<string, any>;
	sessionId?: string;
	guestId?: string;
	isDev?: boolean; // NEW FIELD
}

// Single event
await prisma.analyticsEvent.create({
	data: {
		// ... other fields
		isDev: eventData.isDev ?? false,
	},
});

// Batch events
await prisma.analyticsEvent.createMany({
	data: events.map((event) => ({
		// ... other fields
		isDev: event.isDev ?? false,
	})),
});
```

## Usage

### Query Production Events Only

```typescript
// Get only production events
const productionEvents = await prisma.analyticsEvent.findMany({
	where: {
		isDev: false, // Production only
	},
});

// Get production lesson completions
const prodLessonCompletions = await prisma.analyticsEvent.count({
	where: {
		eventAction: "lesson_complete",
		isDev: false,
	},
});

// Get average attempts in production
const prodAttempts = await prisma.analyticsEvent.aggregate({
	where: {
		eventAction: "code_submit_correct",
		isDev: false,
	},
	_avg: {
		eventValue: true,
	},
});
```

### Compare Dev vs Production

```typescript
// Event counts by environment
const eventsByEnv = await prisma.analyticsEvent.groupBy({
	by: ["isDev"],
	_count: {
		id: true,
	},
});
// Result:
// [
//   { isDev: false, _count: { id: 5234 } },  // Production
//   { isDev: true, _count: { id: 142 } }      // Development
// ]

// Average session duration by environment
const sessionsByEnv = await prisma.analyticsEvent.groupBy({
	by: ["isDev"],
	where: {
		eventAction: "session_end",
	},
	_avg: {
		eventValue: true, // activeTime in seconds
	},
});
```

### Filter in Analytics Queries

```typescript
// Get top lessons excluding dev data
const topLessons = await prisma.analyticsEvent.groupBy({
	by: ["metadata"],
	where: {
		eventAction: "lesson_complete",
		isDev: false, // Production only
	},
	_count: {
		id: true,
	},
	orderBy: {
		_count: {
			id: "desc",
		},
	},
	take: 10,
});
```

## Benefits

✅ **Clean Production Metrics** - Exclude test data from production analytics  
✅ **Debug Without Pollution** - Test analytics implementation freely in dev  
✅ **Environment Comparison** - Compare user behavior between dev and prod  
✅ **Automatic Detection** - No manual configuration needed  
✅ **Indexed Field** - Fast queries for filtering by environment  
✅ **Zero Config** - Works out of the box based on NODE_ENV

## Example Scenarios

### 1. Production Dashboard

```typescript
// Dashboard showing only production metrics
const dashboardStats = {
	totalUsers: await prisma.analyticsEvent
		.findMany({
			where: { isDev: false },
			distinct: ["userId"],
		})
		.then((r) => r.length),

	completedLessons: await prisma.analyticsEvent.count({
		where: {
			eventAction: "lesson_complete",
			isDev: false,
		},
	}),

	avgAttempts: await prisma.analyticsEvent.aggregate({
		where: {
			eventAction: "code_submit_correct",
			isDev: false,
		},
		_avg: { eventValue: true },
	}),
};
```

### 2. Development Testing

```typescript
// Check recent dev events during testing
const recentDevEvents = await prisma.analyticsEvent.findMany({
	where: {
		isDev: true,
		createdAt: {
			gte: new Date(Date.now() - 3600000), // Last hour
		},
	},
	orderBy: {
		createdAt: "desc",
	},
	take: 50,
});

console.log("Recent test events:", recentDevEvents);
```

### 3. Quality Assurance

```typescript
// Compare metrics between environments
const comparison = await prisma.$queryRaw`
  SELECT 
    "isDev",
    COUNT(*) as total_events,
    COUNT(DISTINCT "userId") as unique_users,
    AVG(CAST("eventValue" AS FLOAT)) as avg_value
  FROM "AnalyticsEvent"
  WHERE "eventAction" = 'code_submit_correct'
  GROUP BY "isDev"
`;

console.log("Environment comparison:", comparison);
// Expected: Dev has fewer events, might have different avg attempts
```

## Migration

Migration file: `20251015230217_add_is_dev_to_analytics`

```sql
-- Add isDev column with default false
ALTER TABLE "AnalyticsEvent" ADD COLUMN "isDev" BOOLEAN NOT NULL DEFAULT false;

-- Add index for efficient filtering
CREATE INDEX "AnalyticsEvent_isDev_idx" ON "AnalyticsEvent"("isDev");
```

All existing events will have `isDev: false` by default, which is appropriate since they came from the production database.

## Best Practices

### 1. Always Filter Production Queries

When building analytics dashboards or reports, always filter by `isDev: false`:

```typescript
// ❌ BAD - includes dev data
const stats = await prisma.analyticsEvent.count();

// ✅ GOOD - production only
const stats = await prisma.analyticsEvent.count({
	where: { isDev: false },
});
```

### 2. Use for QA Validation

Before deploying analytics changes, verify in dev:

```typescript
// Test new event in development
trackNewFeature();

// Verify it was tracked
const devEvent = await prisma.analyticsEvent.findFirst({
	where: {
		eventAction: "new_feature",
		isDev: true,
	},
});

console.log("Dev event tracked:", devEvent);
```

### 3. Monitor Environment Split

Periodically check the ratio of dev to prod events:

```typescript
const ratio = await prisma.analyticsEvent.groupBy({
	by: ["isDev"],
	_count: { id: true },
});

const dev = ratio.find((r) => r.isDev)?._count.id || 0;
const prod = ratio.find((r) => !r.isDev)?._count.id || 0;

if (dev / prod > 0.1) {
	console.warn("High ratio of dev events - check for issues");
}
```

---

**Date:** October 15, 2025  
**Status:** ✅ Implemented  
**Migration:** `20251015230217_add_is_dev_to_analytics`
