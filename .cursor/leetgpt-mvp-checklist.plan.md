# LeetGPT MVP Checklist

## Implementation Plan & Order

### Phase 1: Foundation & Core Infrastructure (Week 1-2)

#### 1. Async execution and execution timeout ⚠️ HIGH PRIORITY

**Status**: ✅ **COMPLETED** - Timeout implemented using sandboxed iframe execution
**Dependencies**: None
**Effort**: Medium
**Details**:

-   ✅ Added 10-second timeout to `algoTestExecutor.ts` (configurable via `timeoutMs` parameter)
-   ✅ Timeout implemented in `CodeExecutor` using `setTimeout` - resolves promise after timeout
-   ✅ Cancellation message sent to iframe when timeout occurs
-   ✅ Algorithm test execution script checks for cancellation between test cases
-   ✅ Proper cleanup of timeouts and error handling for timeout scenarios
-   ✅ Works with sandboxed iframe execution (no freezing, async execution)
-   ✅ Timeout prevents infinite loops from blocking the UI

**Files modified**:

-   ✅ `src/lib/execution/algoTestExecutor.ts` - Added cancellation handling and timeout checks
-   ✅ `src/lib/execution/codeExecutor.ts` - Enhanced timeout mechanism with cancellation messages
-   ✅ `src/features/algorithms/hooks/useAlgoProblemExecution.ts` - Passes timeout to executor

**Note**: Timeout is enforced at the CodeExecutor level, which sends cancellation messages to the sandboxed iframe. The algorithm test execution script checks for cancellation between test cases and stops execution when cancelled. This prevents infinite loops from freezing the page while maintaining full feature parity with type converters, judges, etc.

---

#### 2. Submission history (like leetcode) 📊

**Status**: ✅ **COMPLETED** - Full submission history UI implemented with tabbed interface
**Dependencies**: None (can work in parallel with #1)
**Effort**: Medium-High
**Details**:

-   ✅ Submission saving verified and working on code execution
-   ✅ Created tabbed UI in ProblemStatementChat panel (Description, Submissions tabs)
-   ✅ Submissions tab displays: status (Accepted/Wrong Answer), language, runtime, date
-   ✅ Submission detail tab shows: code in read-only editor, test cases passed, runtime, metadata
-   ✅ Clicking a submission opens detail view in new "Submission" tab with close button
-   ✅ Submissions list updates automatically when code is run (no refresh needed)
-   ✅ Copy to clipboard and copy to editor functionality in submission detail view
-   ✅ Server action `getSubmissionHistory` fetches last 50 submissions per problem

**Files modified/created**:

-   ✅ `src/features/algorithms/components/ProblemStatementChat.tsx` - Converted to tabbed interface
-   ✅ `src/features/algorithms/components/DescriptionTab.tsx` - Extracted description content
-   ✅ `src/features/algorithms/components/SubmissionsTab.tsx` - New component for submissions list
-   ✅ `src/features/algorithms/components/SubmissionDetailTab.tsx` - New component for submission details
-   ✅ `src/features/algorithms/components/AlgorithmWorkspace.tsx` - Added submission handler registration
-   ✅ `src/features/algorithms/components/WorkspaceLayout.tsx` - Pass submission handler through
-   ✅ `src/features/algorithms/hooks/useAlgoProblemExecution.ts` - Added callback to notify on new submission
-   ✅ `src/lib/actions/algoProgress.ts` - `getSubmissionHistory` server action (already existed)

---

#### 10. Finalize algorithm lesson system 🎓

**Status**: Not implemented
**Dependencies**: Core infrastructure (#1, #2) should be done first
**Effort**: Medium-High
**Details**:

-   Complete related lessons data fetching for TopicsDropdown and StuckPopup
-   Add related problems/lessons sections for SEO on lesson and problem pages
-   Create lesson content for core algorithm topics (hashmaps, arrays, trees, etc.)
-   Polish UI/UX inconsistencies and edge cases
-   Verify analytics tracking works for all user actions
-   Ensure proper AI Chat integration

**Reference**:

-   `.cursor/algo-problems-outline.md` - Implementation status and remaining tasks
-   `src/features/algorithms/data/index.ts` - Existing data fetching functions
-   `src/lib/actions/algoProgress.ts` - Progress tracking actions

---

### Phase 2: User Experience Enhancements (Week 2-3)

#### 4. Add sound effects like /learn workspace 🔊

**Status**: ✅ **COMPLETED** - Sound effects integrated into algorithm workspace
**Dependencies**: None
**Effort**: Low
**Details**:

-   ✅ Integrated existing `soundManager.ts` (`playSuccessSound()`, `playErrorSound()`)
-   ✅ Sound effects called on test execution completion
-   ✅ Success sound plays when all tests pass
-   ✅ Error sound plays when any tests fail
-   ✅ Respects user mute preferences (handled by soundManager)

**Files modified**:

-   ✅ `src/features/algorithms/hooks/useAlgoProblemExecution.ts` - Added sound effect calls after test results are set

**Reference**:

-   ✅ `src/lib/soundManager.ts` (already implemented)
-   ✅ `src/features/Workspace/hooks/useLessonStreaming.ts` (reference implementation)

---

#### 5. AI Chat suggestions 💬

**Status**: ✅ **COMPLETED** - Context-aware chat suggestions with categorized dropdown
**Dependencies**: None (can work in parallel)
**Effort**: Medium
**Details**:

-   ✅ Created `ChatSuggestions.tsx` component with main suggestions and categorized dropdown
-   ✅ Main suggestions (2-3) are context-aware:
    -   No code: "I'm stuck", "Teach me this concept"
    -   Code with failing tests: "I'm stuck", "Am I on the right path?"
    -   Code with all tests passing: "Am I on the right path?", "How can I optimize this?"
-   ✅ "..." button opens dropdown menu with categorized suggestions:
    -   Understanding the Problem
    -   Getting Unstuck
    -   Learning Concepts (dynamic based on problem topics)
    -   Debugging (only shown when user has code)
    -   Optimization (only shown when user has code)
    -   Code Review (only shown when user has code)
-   ✅ Suggestions are disabled when AI is thinking or user is not logged in
-   ✅ Clicking any suggestion sends it as a message to the chat

**Files created/modified**:

-   ✅ `src/features/algorithms/components/ChatSuggestions.tsx` (new component)
-   ✅ `src/features/algorithms/components/DescriptionTab.tsx` (integrated suggestions above input)
-   ✅ `src/features/algorithms/components/ProblemStatementChat.tsx` (added code/testResults props)
-   ✅ `src/features/algorithms/components/WorkspaceLayout.tsx` (passed code/testResults to chat)

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

**Status**: ✅ **COMPLETED** - Full Stripe integration with subscription state machine
**Dependencies**: None (can work independently)
**Effort**: High
**Details**:

-   ✅ Stripe integration with subscription state machine
-   ✅ Subscription plans (PRO/EXPERT, monthly/yearly)
-   ✅ Billing page with status-based display
-   ✅ Full subscription lifecycle (create, update, cancel, expire)
-   ✅ Webhook handling for all Stripe events
-   ✅ App-managed and Stripe-managed trial support
-   ✅ Payment success page
-   ✅ Manual subscription sync functionality

**Reference**:

-   `.cursor/stripe/STRIPE_OUTLINE.md` - Complete implementation details and production checklist
-   `docs/SUBSCRIPTION_STATE_MACHINE.md` - State machine documentation

---

## Summary Order

### Complete

-   **Async execution and execution timeout** - Foundation, affects all execution
-   **Submission history** - Core feature, can work in parallel with #1
-   **Sound effects** - Quick UX win, low effort
-   **AI Chat suggestions** - UX enhancement, medium effort
-   **Stripe/payment** - Full subscription system with state machine
-   **Turn off lesson system**
-   **Move problems and get rid of "algo" dashboard**
-   **hide /learn and get rid of any links to it**
-   **Rebrand to LeetGPT**
-   **Create new landing page**
-   **Fix Problem statement not initial render**

### Todo

<!-- -   **Finalize algorithm lesson system** - Complete core system before UX enhancements -->

-   **responsiveness**
-   **Create preview image**
-   **Stripe Prod**

## Notes

-   Algorithm lesson system (#10) should be finalized early as it's foundational
-   Items 4-7 can be done in parallel as they're independent
-   Stripe integration (#9) is complete - see `.cursor/stripe/STRIPE_OUTLINE.md` for details
-   Consider MVP scope: Some items might be simplified for initial launch
