# Guest ID Tracking & Clearing

## Overview

Guest IDs are now properly tracked during authentication and cleared after migration to link anonymous activity with authenticated users.

## Implementation

### 1. Track Guest ID in Auth Events

Updated `src/lib/analytics.ts` to capture the guest ID before sign-in/sign-up:

```typescript
// Auth tracking
export const trackAuthSignup = () => {
	const guestId = getGuestId();
	trackEvent("Auth", "auth_signup", undefined, undefined, {
		previousGuestId: guestId || null,
	});
};

export const trackAuthSignin = () => {
	const guestId = getGuestId();
	trackEvent("Auth", "auth_signin", undefined, undefined, {
		previousGuestId: guestId || null,
	});
};
```

### 2. Clear Guest ID After Migration

Updated `src/contexts/ProgressContext.tsx` to track and clear guest ID during data migration:

```typescript
if (localProgress && !hasMigratedRef.current) {
	hasMigratedRef.current = true;

	// Track sign-in with guest ID before clearing it
	trackAuthSignin();

	// Migrate/merge localStorage data with database
	await migrateLocalStorageData(session.user.id, localProgress);

	// Clear localStorage after migration
	localStorage.removeItem("bitschool-progress");
	localStorage.removeItem("bitschool-progress-checksum");

	// Clear guest ID after tracking and migration
	clearGuestId();
}
```

## Benefits

### User Journey Tracking

-   **Before Auth**: All events saved with `guestId` and `userId = null`
-   **During Auth**: `auth_signin` event captures both `guestId` (in metadata) and new `userId`
-   **After Auth**: All events saved with `userId` and `guestId = null`

### Analytics Queries

You can now correlate guest activity with authenticated users:

```typescript
// Get all guest events before authentication
const guestEvents = await getGuestEvents(previousGuestId);

// Get the auth event that linked guest to user
const authEvent = await prisma.analyticsEvent.findFirst({
	where: {
		eventCategory: "Auth",
		eventAction: "auth_signin",
		metadata: {
			path: ["previousGuestId"],
			equals: previousGuestId,
		},
	},
});

// Get user's authenticated events
const userEvents = await getUserEvents(authEvent.userId);

// Now you have the complete user journey!
```

## Data Flow

### Guest User Session

```
1. User visits site
2. Guest ID created → "guest_abc123"
3. Events tracked:
   - session_start (guestId: "guest_abc123", userId: null)
   - lesson_start (guestId: "guest_abc123", userId: null)
   - code_run (guestId: "guest_abc123", userId: null)
```

### Sign-In Event

```
4. User signs in
5. auth_signin tracked:
   - userId: "user_xyz789"
   - guestId: "guest_abc123"
   - metadata: { previousGuestId: "guest_abc123" }
6. Guest ID cleared from localStorage
```

### Authenticated User Session

```
7. Future events tracked:
   - lesson_complete (guestId: null, userId: "user_xyz789")
   - level_up (guestId: null, userId: "user_xyz789")
```

## Database Schema

The `AnalyticsEvent` model supports this workflow:

```prisma
model AnalyticsEvent {
  id            String   @id @default(uuid())
  userId        String?  // Null for guests, populated after auth
  guestId       String?  // Populated for guests, null after auth
  eventCategory String
  eventAction   String
  metadata      Json?    // Contains previousGuestId in auth events
  // ...
}
```

## Use Cases

### 1. Conversion Funnel Analysis

Track user behavior from anonymous visitor to authenticated user:

-   How many lessons do users complete before signing up?
-   What triggers sign-up? (completing a lesson, leveling up, etc.)

### 2. User Attribution

Link all pre-auth activity to the authenticated user:

-   Total XP earned (guest + authenticated)
-   Complete learning history
-   Time to conversion

### 3. A/B Testing

Test features with anonymous users and track outcomes after authentication:

-   Did feature X increase sign-up rates?
-   How does pre-auth engagement affect post-auth retention?

### 4. Data Privacy Compliance

Clean up guest data when users authenticate:

-   Guest ID is cleared from localStorage
-   All future events use userId
-   Easy to identify and manage guest data

## Privacy Considerations

-   **Guest ID Storage**: Stored only in browser localStorage
-   **Guest ID Format**: Random UUID (e.g., "4a7b5c9d-1e2f-3a4b-5c6d-7e8f9a0b1c2d")
-   **Guest ID Lifecycle**: Created on first visit for unauthenticated users only, cleared on authentication
-   **Data Linkage**: Only through `previousGuestId` in auth event metadata
-   **User Control**: Guest can clear browser data to remove guest ID
-   **Authentication Protection**: Server enforces guestId = null for all authenticated users
-   **No Re-creation**: Once cleared after sign-in, guest IDs are never created again for that user

## Testing

To verify the implementation:

1. **As Guest**:

    - Open app in incognito
    - Complete some lessons
    - Check database: Events have guestId, no userId

2. **Sign In**:

    - Sign in with Google
    - Check database: auth_signin event has both userId and previousGuestId

3. **As Authenticated**:

    - Complete more lessons
    - Check database: Events have userId, no guestId
    - Check localStorage: bitschool_guest_id is gone

4. **Query Journey**:

    ```typescript
    // Get the auth event
    const authEvent = await prisma.analyticsEvent.findFirst({
    	where: { userId: "user_xyz", eventAction: "auth_signin" },
    });

    // Get pre-auth activity
    const guestId = authEvent.metadata.previousGuestId;
    const preAuthEvents = await prisma.analyticsEvent.findMany({
    	where: { guestId },
    });

    // Get post-auth activity
    const postAuthEvents = await prisma.analyticsEvent.findMany({
    	where: { userId: "user_xyz" },
    });
    ```

---

**Date:** October 15, 2025  
**Status:** ✅ Implemented
