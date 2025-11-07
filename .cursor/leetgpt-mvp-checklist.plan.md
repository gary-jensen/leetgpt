# LeetGPT MVP Checklist

## Implementation Plan & Order

### Phase 1: Foundation & Core Infrastructure (Week 1-2)

#### 1. Async execution and execution timeout ⚠️ HIGH PRIORITY

**Status**: ✅ **COMPLETED** - Timeout and Web Worker implementation added
**Dependencies**: None
**Effort**: Medium
**Details**:

-   ✅ Added 10-second timeout to `algoTestExecutor.ts` (configurable)
-   ✅ Added per-test timeout protection
-   ✅ **Web Worker implementation** - Can terminate infinite loops by killing the worker
-   ✅ Falls back to direct execution for server-side or if worker unavailable
-   ✅ Proper cleanup of timeouts and workers
-   ✅ Error handling for timeout scenarios

**Files modified**:

-   ✅ `src/lib/execution/algoTestExecutor.ts` - Added timeout and Web Worker support
-   ✅ `public/algo-test-worker.js` - Web Worker that can be terminated (kills infinite loops)

**Note**: The Web Worker uses a simplified execution model. For full feature parity (type converters, judges, etc.), the worker would need to bundle all dependencies. Current implementation prevents freezing but may not handle all edge cases perfectly.

---

#### 2. Submission history (like leetcode) 📊

**Status**: Database model exists (`AlgoProblemSubmission`), but UI/functionality may be incomplete
**Dependencies**: None (can work in parallel with #1)
**Effort**: Medium-High
**Details**:

-   Verify submission saving is working on code execution
-   Create UI to display submission history (similar to LeetCode)
-   Show: timestamp, code, passed/failed, runtime, test results
-   Add filtering/sorting (by date, status, problem)
-   Display in algorithm workspace or separate page

**Files to check/modify**:

-   `prisma/schema.prisma` (model exists)
-   `src/features/algorithms/components/AlgorithmWorkspace.tsx`
-   Create: `src/features/algorithms/components/SubmissionHistory.tsx`
-   Server action to fetch submissions

---

### Phase 2: User Experience Enhancements (Week 2-3)

#### 3. Add red/green glow to test results panel ✨

**Status**: Not implemented
**Dependencies**: None
**Effort**: Low
**Details**:

-   Similar to `/learn` workspace editor glow
-   Green glow when all tests pass
-   Red glow when tests fail
-   Use existing CSS classes: `button-glow-green`, `button-glow-red` or create new ones
-   Apply to `TestResultsDisplay` or `TestCasesPanel` component

**Files to modify**:

-   `src/features/algorithms/components/TestResultsDisplay.tsx`
-   `src/features/algorithms/components/TestCasesPanel.tsx`
-   `src/app/globals.css` (if new classes needed)
-   `src/features/algorithms/hooks/useAlgoProblemExecution.ts` (to track pass/fail state)

**Reference**:

-   `src/components/workspace/Console/components/console.tsx` (has `console-glow`)
-   `src/app/globals.css` (has `button-glow-red` and `button-glow-green`)

---

#### 4. Add sound effects like /learn workspace 🔊

**Status**: Sound manager exists, just needs integration
**Dependencies**: None
**Effort**: Low
**Details**:

-   Use existing `soundManager.ts` (`playSuccessSound()`, `playErrorSound()`)
-   Call on test execution completion
-   Play success sound when all tests pass
-   Play error sound when tests fail
-   Respect user mute preferences

**Files to modify**:

-   `src/features/algorithms/hooks/useAlgoProblemExecution.ts`
-   `src/features/algorithms/components/AlgorithmWorkspace.tsx`

**Reference**:

-   `src/lib/soundManager.ts` (already implemented)
-   `src/features/Workspace/hooks/useLessonStreaming.ts` (line 326, 153)

---

#### 5. AI Chat suggestions 💬

**Status**: Not implemented
**Dependencies**: None (can work in parallel)
**Effort**: Medium
**Details**:

-   Add suggestion chips/buttons in chat input area
-   Examples: "What is a Binary Tree", "How do I approach this problem", "Explain time complexity"
-   Suggestions should be context-aware (based on current problem)
-   Clicking suggestion sends it as a message
-   Can be static list or AI-generated based on problem

**Files to create/modify**:

-   `src/features/algorithms/components/ProblemStatementChat.tsx` (add suggestions UI)
-   `src/features/algorithms/components/ChatSuggestions.tsx` (new component)
-   May need server action to generate contextual suggestions

---

#### 6. Feedback button 💭

**Status**: Not implemented
**Dependencies**: None
**Effort**: Low-Medium
**Details**:

-   Add feedback button (floating or in navbar)
-   Opens modal/form to submit feedback
-   Collect: rating, comments, bug reports, feature requests
-   Store in database or send to external service (e.g., email, support ticket)
-   Can be simple form or integrate with feedback service

**Files to create/modify**:

-   `src/components/FeedbackButton.tsx` (new component)
-   `src/features/algorithms/components/WorkspaceNavbar.tsx` (add button)
-   Server action to save feedback
-   Database model (optional) or external service integration

---

### Phase 3: Analytics & Tracking (Week 3-4)

#### 7. Analytics for algorithm workspace and problem/lesson lists 📈

**Status**: Analytics system exists, needs extension
**Dependencies**: Submission history (#2) would be helpful
**Effort**: Medium
**Details**:

-   Extend existing analytics system to track:
    -   Problem views, starts, completions
    -   Time spent on problems
    -   Submission attempts
    -   Chat interactions
    -   Hint usage
-   Add analytics to problem/lesson list pages
-   Track user progress through algorithm problems
-   Dashboard/visualization (optional for MVP)

**Files to modify**:

-   `src/lib/actions/analytics.ts` (extend event types)
-   `src/features/algorithms/components/AlgorithmWorkspace.tsx`
-   `src/features/algorithms/pages/ProblemListPage.tsx` (if exists)
-   `prisma/schema.prisma` (verify `AnalyticsEvent` model supports needed fields)

**Reference**:

-   `src/lib/actions/analytics.ts` (existing implementation)
-   `docs/ANALYTICS_IMPLEMENTATION_SUMMARY.md`

---

### Phase 4: Monetization & Limits (Week 4-5)

#### 8. Add daily limits for free users 🚫

**Status**: Rate limiting exists, but not daily limits for specific features
**Dependencies**: User authentication system
**Effort**: Medium-High
**Details**:

-   Implement daily limits for:
    -   Hints (e.g., 3 hints per day for free users)
    -   Wrong answer submission chats (e.g., 5 AI feedback requests per day)
    -   Maybe: problem submissions, solution views
-   Track daily usage per user
-   Show limit warnings/UI when approaching limits
-   Premium users have unlimited or higher limits
-   Use existing rate limiting infrastructure as base

**Files to create/modify**:

-   `src/lib/dailyLimits.ts` (new utility)
-   `src/lib/actions/dailyLimits.ts` (server actions)
-   `prisma/schema.prisma` (add `UserDailyLimits` model or use existing)
-   `src/features/algorithms/components/AlgorithmWorkspace.tsx` (check limits before actions)
-   `src/features/algorithms/hooks/useAlgoProblemExecution.ts` (limit checks)
-   UI components to show limit status

**Reference**:

-   `src/lib/rateLimit.ts` (existing rate limiting)
-   `prisma/schema.prisma` (User model with Role enum)

---

#### 9. Stripe, payment, billing, premium 💳

**Status**: Not implemented
**Dependencies**: Daily limits (#8) should be done first to define premium benefits
**Effort**: High
**Details**:

-   Integrate Stripe for payments
-   Set up subscription plans (monthly/yearly)
-   Create billing page
-   Handle subscription lifecycle (create, update, cancel)
-   Update user role to PRO when subscribed
-   Webhook handling for Stripe events
-   Payment success/failure pages
-   Premium badge/indicators in UI

**Files to create/modify**:

-   `prisma/schema.prisma` (add Stripe customer/subscription fields to User)
-   `src/lib/stripe.ts` (Stripe client setup)
-   `src/lib/actions/billing.ts` (server actions for billing)
-   `src/app/api/stripe/webhook/route.ts` (webhook handler)
-   `src/app/billing/page.tsx` (billing page)
-   `src/app/payment/success/page.tsx`
-   `src/app/payment/cancel/page.tsx`
-   Update User model to track subscription status
-   UI components for upgrade prompts

**Dependencies**:

-   Stripe account setup
-   Environment variables for Stripe keys
-   Database migration for new fields

---

## Summary Order

1. **Async execution and execution timeout** - Foundation, affects all execution
2. **Submission history** - Core feature, can work in parallel with #1
3. **Red/green glow** - Quick UX win, low effort
4. **Sound effects** - Quick UX win, low effort
5. **AI Chat suggestions** - UX enhancement, medium effort
6. **Feedback button** - Quick feature, good for user input
7. **Analytics** - Important for understanding usage, medium effort
8. **Daily limits** - Must be done before Stripe to define premium value
9. **Stripe/payment** - Final monetization step, depends on #8

## Notes

-   Items 3-6 can be done in parallel as they're independent
-   Analytics (#7) benefits from having submission history (#2) in place
-   Daily limits (#8) should define what premium gets you before building Stripe (#9)
-   Consider MVP scope: Some items might be simplified for initial launch
