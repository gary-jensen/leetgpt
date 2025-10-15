# Analytics Tracking Fix

## Issues Fixed

### Problem 1: Level Up Event on Page Refresh

**Issue:** The `level_up` event was being tracked every time the page refreshed, even when just loading data from localStorage/database.

**Root Cause:** The level tracking `useEffect` in `ProgressContext.tsx` was comparing the loaded level against the initial value, treating any loaded progress as a "level up." The timing of when `isProgressLoading` became false and when `state.level` updated could cause the effect to run at a moment when it appeared to be a level increase.

**Solution:** Added initialization tracking with a dedicated flag:

-   During loading: Update the ref without tracking, clear initialization flag
-   On first run after loading completes: Set initialization flag, update ref, don't track
-   On subsequent runs: Only track if level actually increased after initialization
-   This ensures level ups are only tracked when users actually gain XP and level up

**Code Changed:** `src/contexts/ProgressContext.tsx` lines 380-401

```typescript
// Track level ups (only after initial load completes)
useEffect(() => {
	// During initial load, just initialize the ref without tracking
	if (isProgressLoading) {
		prevLevelRef.current = state.level;
		hasInitializedLevelTracking.current = false;
		return;
	}

	// On first run after loading completes, just set the initialized flag
	if (!hasInitializedLevelTracking.current) {
		hasInitializedLevelTracking.current = true;
		prevLevelRef.current = state.level;
		return;
	}

	// Only track if level actually increased after initialization
	if (state.level > prevLevelRef.current) {
		trackLevelUp(state.level);
	}
	prevLevelRef.current = state.level;
}, [state.level, isProgressLoading]);
```

### Problem 2: Lesson Start Tracked for Wrong Lesson on Load

**Issue:** `lesson_start` was being tracked for the transient lesson (lesson-1) that appeared during loading, then again for the correct lesson (lesson-2) after progress loaded.

**Root Cause:** The lesson tracking `useEffect` in `useLessonStreaming.ts` was firing every time `currentLesson.id` changed, including during the progress loading phase when the lesson would change from the default to the user's actual current lesson.

**Solution:** Wait for progress loading to complete before tracking any lessons:

-   Check if `isProgressLoading` is true - if so, don't track anything
-   Once progress loads and `isInitialized` is true, track the correct lesson
-   Then track any subsequent lesson changes as user navigates
-   This ensures only the correct initial lesson is tracked, not the transient one during loading

**Code Changed:** `src/features/Workspace/hooks/useLessonStreaming.ts` lines 70-89

```typescript
// Track lesson starts
const trackedLessonsRef = useRef<Set<string>>(new Set());

useEffect(() => {
	// Wait until progress has finished loading and component is initialized
	if (isProgressLoading || !isInitialized) {
		return;
	}

	// Track lesson start only if we haven't tracked this lesson yet
	if (!trackedLessonsRef.current.has(currentLesson.id)) {
		trackLessonStart(currentLesson.id, currentLesson.title);
		trackedLessonsRef.current.add(currentLesson.id);
	}
}, [currentLesson.id, currentLesson.title, isInitialized, isProgressLoading]);
```

## Result

Analytics events now only fire for **actual user actions**:

-   ✅ Level ups tracked only when XP gain triggers level increase (not on page load)
-   ✅ Correct initial lesson tracked after progress loads (not transient lesson during loading)
-   ✅ Subsequent lesson navigations tracked correctly
-   ✅ No spurious events during data initialization
-   ✅ Clean, accurate analytics data

## Testing

To verify the fix:

1. Refresh the page → No `level_up` events should fire
2. Check database → Only see `session_start` on page load
3. After progress loads → `lesson_start` tracked once for correct current lesson (e.g., lesson-2)
4. Navigate to new lesson → `lesson_start` tracked once for the new lesson
5. Gain XP and level up → `level_up` tracked once

---

**Date:** October 15, 2025  
**Status:** ✅ Fixed
