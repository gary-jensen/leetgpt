# AI Chat-First Algorithm Workspace Redesign Plan

## Overview

Transform the algorithm workspace from a 3-column layout (Problem Statement | Editor/Test Cases | AI Chat) to a 2-column chat-first experience where the AI chat is integrated into the problem statement panel, making it feel like ChatGPT with a code editor.

## Core Vision

-   **Chat-First Experience**: The problem statement appears as the first message from the AI assistant
-   **Integrated Chat**: AI chat lives inside the problem statement panel (left column)
-   **Submission Messages**: Code runs appear as user messages in the chat with test results
-   **Proactive AI**: AI responds to submissions automatically (encouraging when failing, optimality review when passing)
-   **In-Chat Teaching**: AI can teach lessons directly in the chat interface instead of just recommending them
-   **Smart Lesson Completion**: Users mark lessons as complete after AI teaches them in chat

---

## 1. Layout Changes

### Current State

-   **3 Columns**: Problem Statement (left) | Editor/Test Cases (center) | AI Chat (right)
-   **Separate Panels**: Problem statement is static markdown, chat is disconnected

### New State

-   **2 Columns**: Problem Statement + AI Chat (left) | Editor/Test Cases (right)
-   **Integrated Experience**: Problem statement is the first AI message, followed by interactive chat

### Implementation Details

-   Remove `AIChatPanel` from `WorkspaceLayout.tsx`
-   Transform `LeftColumnPanel` into a chat interface
-   Remove the right column resizable handle
-   Adjust panel sizes: Left (50-60%), Right (40-50%)
-   The left panel becomes a full chat interface with scrollable messages

---

## 2. Problem Statement as Sticky First Message

### Concept

The problem statement should appear as the first message from the AI assistant, making it feel like the AI is presenting the problem. It will be sticky at the top of the chat, with a box shadow divider at the bottom.

### Implementation

-   **Initial Message Structure**:
    -   Role: `assistant`
    -   Content: Rendered markdown of problem statement (same styling as regular messages)
    -   Special flag: `isProblemStatement: true` to mark as sticky
    -   Always visible at top with `position: sticky`
    -   Box shadow at bottom as visual divider
    -   Rendered in DOM on initial render for SEO

### Message Format

```typescript
{
  id: "problem-statement",
  role: "assistant",
  content: processedStatement, // HTML or markdown
  timestamp: problem creation date or session start,
  type: "problem_statement",
  metadata: {
    title: problem.title,
    difficulty: problem.difficulty,
    topics: problem.topics
  }
}
```

### Visual Design

-   **Same styling as regular assistant messages** (no special styling)
-   Uses existing `ChatMarkdownDisplay` component
-   Sticky positioning: `position: sticky` with `top: 0`
-   Box shadow at bottom: `box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)` or similar
-   Acts normal until scrolls (standard sticky behavior)
-   Always visible at top of chat area

### SEO Considerations

-   Problem statement HTML must be present in DOM on initial render
-   Full problem metadata in meta tags:
    -   `<title>` tag: Problem title
    -   `<meta name="description">`: Problem statement summary
    -   `<meta name="keywords">`: Topics/tags
    -   Structured data (JSON-LD): Difficulty, topics, etc.

---

## 3. Examples & Constraints Message

### Concept

Examples and constraints appear as an assistant message immediately after the problem statement (below the sticky area). They scroll normally with the chat but are always present at the top after the sticky problem statement.

### Implementation

-   **Message Structure**:
    -   Role: `assistant`
    -   Content: Combined examples and constraints (rendered markdown)
    -   Appears right after problem statement
    -   Scrolls with chat (not sticky)
    -   Always present in chat (reappears on new session)
    -   Rendered in DOM on initial render for SEO

### Message Format

```typescript
{
  id: "examples-constraints",
  role: "assistant",
  content: processedExamplesAndConstraints, // HTML or markdown
  timestamp: problem creation date or session start,
  type: "examples_constraints"
}
```

### Visual Design

-   **Same styling as regular assistant messages** (no special styling)
-   Uses existing `ChatMarkdownDisplay` component
-   Positioned after sticky problem statement
-   Scrolls normally with chat content

### Database Schema

-   Add optional fields to problem schema:
    -   `examplesAndConstraintsMd?: string`
    -   `examplesAndConstraintsHtml?: string`
-   Migration for existing problems deferred
-   New problems will use separate fields

---

## 4. Code Submission Messages

### Concept

When the user runs their code, it appears as a user message in the chat showing submission details. This is the ONLY message type with different styling (card-style).

### Implementation

-   **Trigger**: Only after `executeCode()` completes (NOT during `isExecuting` state)
-   **Message Type**: `user` role with special `submission` type
-   **Content Format**: Structured submission card showing:
    -   Status badge (✅ All Passed / ❌ X of Y Passed)
    -   Test case summary (passed/failed counts)
    -   Runtime (if available)

### Message Format

```typescript
{
  id: `submission-${timestamp}`,
  role: "user",
  type: "submission",
  content: "Submitted code solution",
  timestamp: new Date(),
  submissionData: {
    allPassed: boolean,
    testsPassed: number,
    testsTotal: number,
    runtime?: number,
    testResults: TestResult[]
  }
}
```

### Visual Design

-   **Card-style message** (only different styling - not chat bubble):
    -   Green border/background if all passed
    -   Red/orange border/background if failures
    -   Icons: CheckCircle for pass, XCircle for fail
    -   Compact summary: "3/5 tests passed" or "All tests passed! 🎉"
    -   Runtime display if available
    -   Expandable section to view full test case details

---

## 5. Automatic AI Responses to Submissions

### Concept

After a code submission appears, the AI automatically responds with appropriate feedback based on the result.

### Implementation Flow

1. User runs code → submission message appears
2. Automatically trigger AI response (no user action needed)
3. Response depends on submission status:

    - **All Tests Passed**:
        - Congratulatory message
        - Optimality review (check if code is optimal)
        - If not optimal: suggest optimization without revealing solution
        - If optimal: celebrate and encourage moving to next problem
    - **Some Tests Failed**:
        - Encouraging message (don't give hints unless asked)
        - Acknowledge progress made
        - Suggest reviewing test cases or asking for help

### AI Response Types

```typescript
// After passing submission
{
  role: "assistant",
  content: "Great job! 🎉 Your solution passed all tests...",
  type: "submission_response",
  optimalityReview?: {
    isOptimal: boolean,
    timeComplexity: string,
    suggestion?: string
  }
}

// After failing submission
{
  role: "assistant",
  content: "You're making progress! Keep going...",
  type: "submission_response"
}
```

### System Prompt Updates

-   Add instructions for submission responses:
    -   Be encouraging but not overly helpful (don't give hints unless asked)
    -   For passing solutions: review optimality naturally in response
    -   Keep responses concise (2-4 sentences)
    -   Use markdown formatting

### API Integration

-   Extend `getChatResponse()` or create new `getSubmissionResponse()`
-   Include submission data in context
-   Call `reviewOptimality()` for passing submissions
-   Generate appropriate response based on results

---

## 6. In-Chat Lesson Teaching

### Concept

Instead of just recommending lessons (opening modals), the AI can teach lessons directly in the chat when asked.

### User Experience

1. User asks: "Can you explain hash maps?"
2. AI responds with lesson content inline in the chat
3. After teaching, shows a "Mark Lesson as Complete" button
4. User clicks button to track lesson completion

### Implementation

-   **AI Teaching Capability**:

    -   Extend AI context with lesson content when lesson is mentioned/requested
    -   AI teaches concepts directly in chat response
    -   Use markdown formatting for code examples, explanations
    -   Can reference specific related lessons for the problem

-   **Lesson Content Integration**:
    -   Add lesson content to AI context when user asks about related topics
    -   AI can reference lesson IDs in response metadata
    -   Teach concepts without opening external modals

### Message Format

```typescript
{
  role: "assistant",
  content: "Let me explain hash maps... [full lesson content in markdown]",
  type: "lesson_teaching",
  lessonId?: string, // if teaching a specific lesson
  metadata: {
    teachesLesson: true,
    lessonId?: string,
    lessonTitle?: string
  }
}
```

### Mark Complete Button

-   Display button after AI teaches a lesson in chat
-   Button appears below the assistant message
-   Uses existing `MarkLessonCompleteButton` component or similar
-   Only shows if lesson hasn't been marked complete already
-   Updates progress context after marking

### Lesson Review

-   Even if lesson is marked complete, AI can still offer to review/recap
-   User can ask: "Can you review hash maps?"
-   AI provides condensed review or full recap based on user preference

---

## 7. Optimality Review After Passing

### Concept

When all tests pass, AI automatically reviews the solution for optimality and suggests improvements if needed.

### Implementation

-   **Automatic Review**:

    -   After passing submission, check optimality using existing `reviewOptimality()`
    -   Include review results in AI response context
    -   AI responds with optimality feedback (nudges, not suggestions)

-   **Response Structure**:

    ```typescript
    {
      role: "assistant",
      content: "Great job! 🎉 Your solution is correct. Your current code has O(n²) time complexity. Can you try solving it with O(n) complexity?",
      type: "optimality_feedback",
      optimalityReview: {
        isOptimal: false,
        currentComplexity: "O(n²)",
        suggestedComplexity: "O(n)"
      }
    }
    ```

-   **AI Guidance**:
    -   If optimal: "Perfect! Your solution is both correct and optimal. ✅"
    -   If not optimal:
        -   Acknowledge correctness
        -   State current complexity: "Your solution runs in O(n²) time"
        -   Nudge toward better complexity: "Can you try solving it with O(n) complexity?"
        -   NO specific suggestions or hints (user must ask for hints)

### User Flow

1. User submits passing solution
2. Submission message appears
3. AI responds with congratulations
4. AI includes optimality nudge:

    - "Your solution is correct! Time complexity: O(n²). Can you try solving it with O(n) complexity?"
    - NO suggestions, just complexity comparison and nudge

5. User can ask for hints about optimization if desired

---

## 8. Examples & Constraints Tab

### Concept

Examples and constraints will be available in both the chat (as a message) and as a tab in the Test Results panel for easy reference while coding.

### Implementation

-   **Tab Structure** (Test Results Panel):

    -   Tab 1: **Examples** (default tab)
    -   Tab 2: Test Cases
    -   Tab 3: Test Results (opens automatically when tests are run)

-   **Tab Content**:
    -   Shows same content as examples/constraints message from chat
    -   Rendered markdown with proper formatting
    -   Always accessible while coding

### Purpose

-   Provides reference without scrolling chat
-   Keeps examples visible while working on solution
-   Maintains consistency between chat and tab content

---

## 9. Component Architecture

### New/Modified Components

#### `ProblemStatementChat.tsx` (NEW)

-   Replaces `LeftColumnPanel` + `ProblemStatement`
-   Full chat interface component
-   Handles:
    -   Initial problem statement message
    -   Chat message rendering
    -   Submission message rendering
    -   Input area
    -   Auto-scrolling

#### `SubmissionMessage.tsx` (NEW)

-   Special message component for code submissions
-   Displays test results in compact card format
-   Expandable for detailed test case view
-   Styled based on pass/fail status

#### `ChatMessageContainer.tsx` (MODIFIED/REFACTORED)

-   Unified message container
-   Handles different message types:
    -   `problem_statement`: Special styling for initial problem
    -   `submission`: Submission card component
    -   `lesson_teaching`: Regular assistant message + mark complete button
    -   `optimality_feedback`: Regular assistant message
    -   `assistant`: Standard AI response
    -   `user`: Standard user message

#### `LessonTeachingButton.tsx` (NEW or REUSE)

-   Button to mark lesson as complete
-   Appears after AI teaches a lesson in chat
-   Checks if lesson already completed
-   Updates progress context

### Modified Files

-   `WorkspaceLayout.tsx`: Remove AI chat panel, update to 2 columns
-   `AlgorithmWorkspace.tsx`:
    -   Auto-trigger AI response after code execution
    -   Handle submission message creation
    -   Manage lesson teaching responses
-   `algoCoach.ts`:
    -   Add `getSubmissionResponse()` function
    -   Enhance `getChatResponse()` to handle lesson teaching requests
    -   Improve optimality review integration

---

## 10. Message Flow Examples

### Initial Load

```
┌─────────────────────────────────────┐
│ [STICKY] [AI] Problem Statement     │ ← Sticky, box shadow bottom
├─────────────────────────────────────┤
│ [AI] Examples & Constraints        │ ← Scrolls normally
│                                      │
│ [Scrollable chat area - empty]      │
└─────────────────────────────────────┘
```

### User Runs Code (Fails)

```
┌─────────────────────────────────────┐
│ [STICKY] [AI] Problem Statement     │ ← Still sticky
├─────────────────────────────────────┤
│ [AI] Examples & Constraints         │ ← Scrolls with content
│                                      │
│ [User] [Submission Card]             │ ← Card-style (only different styling)
│       ❌ 2 of 5 tests passed         │
│       Runtime: 12ms                  │
│                                      │
│ [AI] You're making progress! Don't  │ ← Regular message styling
│     worry, debugging is part of the │
│     process. Take a look at the     │
│     failing test cases.             │
└─────────────────────────────────────┘
```

### User Runs Code (Passes, Not Optimal)

```
┌─────────────────────────────────────┐
│ [STICKY] [AI] Problem Statement     │ ← Still sticky
├─────────────────────────────────────┤
│ [AI] Examples & Constraints         │ ← Scrolls with content
│                                      │
│ [User] [Submission Card]             │ ← Card-style
│       ✅ All 5 tests passed          │
│       Runtime: 45ms                  │
│                                      │
│ [AI] Great job! 🎉 Your solution is  │ ← Regular message styling
│     correct. Your current code has  │
│     O(n²) time complexity. Can you │
│     try solving it with O(n)        │
│     complexity?                     │ ← Nudge only, no suggestions
└─────────────────────────────────────┘
```

### User Asks for Lesson

```
[User] Can you explain hash maps?

[AI] [Full lesson content about hash maps in markdown]
     [Includes examples, code snippets, explanations]

[Button] ✅ Mark Lesson as Complete
```

### User Asks for Optimization Help

```
[User] How can I optimize my solution?

[AI] Great question! Let's think about this step by step.
     Since you need to look up values quickly, what data structure
     comes to mind? Think about constant-time operations...
```

---

## 11. State Management

### Chat Messages State

-   Extend existing `chatMessages` state in `AlgorithmWorkspace.tsx`
-   Add support for different message types:
    -   `problem_statement` (sticky, always first)
    -   `examples_constraints` (always second, after problem statement)
    -   `submission` (card-style, only after execution completes)
    -   `lesson_teaching` (regular assistant message + mark complete button)
    -   `optimality_feedback` (regular assistant message)
    -   `assistant` (regular assistant messages)
    -   `user` (regular user messages)

### Message Ordering

Messages appear in chronological order as they are "sent":

1. Problem statement (always first, sticky)
2. Examples & constraints (always second, scrollable)
3. Submission messages (when code runs)
4. AI responses (auto or user-triggered)
5. Regular chat messages (user questions, AI responses)

### Submission State

-   Track last submission to avoid duplicate messages
-   Compare test results to determine if submission is new/different
-   Only create submission message if code actually changed or tests changed

### Lesson Teaching State

-   Track which lessons AI has taught in current session
-   Track which lessons user has marked as complete
-   Use existing progress context for lesson completion status

---

## 12. API Enhancements

### New Server Actions

#### `getSubmissionResponse(problemId, submissionData, chatHistory)`

-   Returns AI response to code submission
-   Automatically includes optimality review for passing submissions
-   Provides encouraging feedback for failing submissions
-   No hints unless explicitly requested

#### `teachLesson(lessonId, userMessage, chatHistory)`

-   Returns AI response teaching the requested lesson
-   Includes lesson content in context
-   Formats response as teachable content
-   Returns lesson metadata for "mark complete" button

### Enhanced Existing Actions

#### `getChatResponse()`

-   Add support for lesson teaching requests
-   Detect when user asks about lessons or concepts
-   Include relevant lesson content in context
-   Return lesson metadata in response

#### `reviewOptimality()`

-   Already exists, integrate into submission response flow
-   Called automatically after passing submissions
-   Returns complexity comparison (current vs suggested)
-   Returns nudge text, NOT specific suggestions
-   Format: `{ currentComplexity: "O(n²)", suggestedComplexity: "O(n)" }`

---

## 13. Migration Strategy

### Phase 1: Layout Changes

1. Remove `AIChatPanel` from `WorkspaceLayout`
2. Transform `LeftColumnPanel` into `ProblemStatementChat`
3. Update panel sizing and layout
4. Test responsive behavior

### Phase 2: Problem Statement & Examples/Constraints

1. Create initial problem statement message on mount (sticky)
2. Create examples/constraints message immediately after (scrollable)
3. Use existing markdown rendering (no style changes)
4. Implement sticky positioning with box shadow divider
5. Add examples/constraints tab to Test Results panel (default tab)
6. Add SEO meta tags for problem metadata
7. Ensure both messages are in DOM on initial render

### Phase 3: Submission Messages

1. Create submission message component (card-style, only different styling)
2. Trigger only after `executeCode()` completes (not during `isExecuting`)
3. Display test results in card format
4. Style based on pass/fail (green for pass, red/orange for fail)

### Phase 4: Auto AI Responses

1. Implement `getSubmissionResponse()` server action
2. Auto-trigger after submission message
3. Handle both passing and failing cases
4. Integrate optimality review for passing (nudges only, no suggestions)
5. Update `reviewOptimality()` to return complexity comparison and nudge text

### Phase 5: Lesson Teaching

1. Enhance `getChatResponse()` for lesson detection
2. Implement in-chat lesson teaching
3. Add "Mark Complete" button after teaching
4. Update progress tracking

### Phase 6: Polish & Testing

1. Improve message formatting
2. Add loading states
3. Test edge cases
4. Optimize performance

---

## 14. Database Schema Changes

### New Fields

Add to problem schema:

-   `examplesAndConstraintsMd?: string` (optional)
-   `examplesAndConstraintsHtml?: string` (optional)

### Migration Notes

-   Migration for existing problems deferred (can be done later)
-   For new problems: Examples and constraints will be in separate fields
-   Existing problems can continue using `statementMd` until migration
-   Extraction logic can be added later if needed

---

## 15. Edge Cases & Considerations

### Edge Cases

-   **Empty Chat**: Show problem statement (sticky) and examples/constraints immediately, no empty state needed
-   **Multiple Submissions**: Only show latest submission or allow comparison
-   **Network Errors**: Show error message in chat, allow retry
-   **Rate Limiting**: Handle gracefully with user-friendly messages
-   **Uncompleted Lessons**: Track but don't block teaching
-   **New Session**: Problem statement and examples/constraints reappear at top
-   **Long Chat History**: Sticky problem statement remains visible, examples/constraints scroll away naturally

### Performance

-   Lazy load lesson content when teaching
-   Cache AI responses where appropriate
-   Optimize re-renders of chat messages
-   Consider virtual scrolling for long chat histories

### Accessibility

-   Proper ARIA labels for chat interface
-   Keyboard navigation for messages
-   Screen reader support for submission cards
-   Focus management when new messages arrive

### User Experience

-   Smooth auto-scrolling to new messages
-   Loading indicators during AI responses
-   Clear visual distinction between message types
-   Responsive design for different screen sizes

---

## 16. SEO Implementation

### Meta Tags

Add to page `<head>`:

-   `<title>`: Problem title
-   `<meta name="description">`: Problem statement summary
-   `<meta name="keywords">`: Topics/tags (comma-separated)
-   Structured data (JSON-LD) with:
    -   Problem title
    -   Difficulty level
    -   Topics/tags
    -   Problem statement content

### DOM Requirements

-   Problem statement HTML must be in DOM on initial render
-   Examples and constraints HTML must be in DOM on initial render
-   Both visible to crawlers without JavaScript execution
-   Use server-side rendering to ensure content is present

### Implementation

-   Add meta tags in page component (server-side)
-   Ensure problem statement and examples/constraints are rendered server-side
-   Test with crawler simulation tools

---

## 17. Future Enhancements (Out of Scope but Worth Noting)

-   **Code Diff View**: Show what changed between submissions
-   **Submission History**: Allow viewing previous submissions in chat
-   **Multi-language Support**: Teach lessons in different languages
-   **Voice Input**: Voice-to-text for chat messages
-   **Code Snippets**: Expandable code previews in submission messages
-   **AI Suggestions**: Proactive suggestions during coding (not just after submission)
-   **Collaborative Mode**: Share chat sessions with others
-   **Export Chat**: Export chat history as markdown/pdf

---

## Summary

This redesign transforms the algorithm workspace into a chat-first experience where:

-   The problem statement is presented as the first AI message (sticky at top)
-   Examples and constraints follow as the second message (scrollable)
-   Code submissions appear as user messages with test results (card-style, only different styling)
-   AI automatically responds to submissions with appropriate feedback
-   Lessons are taught directly in chat with completion tracking
-   Optimality reviews happen automatically after passing solutions (nudges only, no suggestions)
-   Examples/constraints available in both chat and tab panel
-   All chat messages use same styling except submission messages
-   Problem statement and examples/constraints are SEO-friendly (in DOM on initial render)
-   The interface feels like ChatGPT with a code editor

The key is making the AI feel like an active participant in the problem-solving process, not a separate tool that's disconnected from the main experience. Styling consistency is maintained throughout (except submissions), keeping the focus on content rather than visual differentiation.
