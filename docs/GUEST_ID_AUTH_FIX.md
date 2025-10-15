# Guest ID Authentication Check Fix

## Problem

Guest IDs were being created for authenticated users because `getGuestId()` was called on every analytics event, creating a new guest ID in localStorage even after the user had signed in and their previous guest ID was cleared.

## Root Cause

1. `getGuestId()` automatically created a guest ID if one didn't exist
2. It was called for every event in `trackEvent()` regardless of authentication status
3. After sign-in, when the guest ID was cleared, the next event would create a new guest ID for the authenticated user

## Solution

### 1. Split Guest ID Functions (`src/lib/guestId.ts`)

Created two separate functions:

**`getGuestId()`** - Read-only, doesn't create

```typescript
export function getGuestId(): string {
	// Only returns existing guest ID from localStorage
	// Returns empty string if none exists
	return localStorage.getItem(GUEST_ID_KEY) || "";
}
```

**`getOrCreateGuestId()`** - Creates if needed

```typescript
export function getOrCreateGuestId(): string {
	// Creates a new guest ID if one doesn't exist
	// Should only be called for unauthenticated users
	let guestId = localStorage.getItem(GUEST_ID_KEY);
	if (!guestId) {
		guestId = generateGuestId();
		localStorage.setItem(GUEST_ID_KEY, guestId);
	}
	return guestId;
}
```

### 2. Server-Side Protection (`src/lib/actions/analytics.ts`)

Added authentication check in both save functions:

```typescript
// Single event
guestId: userId ? null : eventData.guestId || null;

// Batch events
guestId: userId ? null : event.guestId || null;
```

**Logic:** If user is authenticated (`userId` exists), force `guestId` to `null` regardless of what the client sent.

### 3. Client-Side Initialization (`src/components/Analytics.tsx`)

Only create guest IDs for unauthenticated users:

```typescript
const { data: session, status } = useSession();

useEffect(() => {
	// Create guest ID for unauthenticated users only
	if (status === "unauthenticated") {
		getOrCreateGuestId();
	}
}, [status]);
```

## How It Works Now

### For Unauthenticated Users

```
1. User visits site
2. Analytics component checks: status === "unauthenticated"
3. Calls getOrCreateGuestId() → Creates guest ID
4. Events tracked with guestId, userId = null
```

### For Authenticated Users

```
1. User signs in
2. Auth event tracked with previousGuestId in metadata
3. Guest ID cleared from localStorage
4. Analytics component checks: status === "authenticated"
5. Does NOT call getOrCreateGuestId()
6. Events tracked with userId, guestId = null
7. Server enforces: guestId always null when userId exists
```

### Guest → Authenticated Flow

```
1. Guest events → guestId: "abc123", userId: null
2. Sign-in event → userId: "user1", metadata.previousGuestId: "abc123"
3. clearGuestId() removes guest ID from localStorage
4. Future events → userId: "user1", guestId: null
5. getGuestId() returns "" (no ID in localStorage)
6. Server enforces guestId = null for authenticated users
```

## Benefits

✅ **No Duplicate IDs** - Authenticated users never get a guest ID  
✅ **Clean Data** - Clear separation between guest and authenticated events  
✅ **Server Protection** - Even if client sends guest ID, server ignores it for authenticated users  
✅ **Privacy** - Guest IDs only exist for anonymous users  
✅ **Proper Lifecycle** - Guest ID created on first visit, used until auth, then removed forever

## Testing

### Test 1: New Visitor (Unauthenticated)

```
Expected:
- localStorage has bitschool_guest_id
- Events have guestId, userId = null
```

### Test 2: Authenticated User

```
Expected:
- localStorage does NOT have bitschool_guest_id (or ignored if it does)
- Events have userId, guestId = null
- Database shows guestId = null for all events
```

### Test 3: Sign-In Flow

```
Expected:
1. Guest events → guestId populated
2. auth_signin event → metadata.previousGuestId populated, userId populated
3. Post-auth events → guestId = null, userId populated
4. localStorage bitschool_guest_id removed
```

---

**Date:** October 15, 2025  
**Status:** ✅ Fixed
