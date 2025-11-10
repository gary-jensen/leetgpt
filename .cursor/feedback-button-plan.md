# Feedback Button Implementation Plan

## Overview

Add a feedback button in the editor footer (next to Hint and Reset buttons) that opens a dialog form for users to submit feedback about algorithm problems.

## Components

### 1. Database Schema

**File**: `prisma/schema.prisma`

Add a new `AlgoProblemFeedback` model:

```prisma
model AlgoProblemFeedback {
    id                String   @id @default(uuid())
    userId            String?  // Optional - allow anonymous feedback
    problemId         String   // References problem ID
    issues            String[] // Array of selected issue types
    additionalFeedback String? @db.Text
    createdAt         DateTime @default(now())
    user              User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

    @@index([problemId])
    @@index([createdAt])
}
```

Update User model to include feedback relation:

```prisma
algoProblemFeedback AlgoProblemFeedback[]
```

**Migration**: Create migration file after schema update

---

### 2. Server Action

**File**: `src/lib/actions/feedback.ts` (new file)

Create server action to save feedback:

-   Function: `submitProblemFeedback`
-   Parameters:
    -   `problemId: string`
    -   `issues: string[]` (array of selected issue types)
    -   `additionalFeedback?: string`
-   Returns: `{ success: boolean, error?: string }`
-   Uses `getServerSession` to get user (optional - allow anonymous)
-   Saves to database using Prisma

---

### 3. Feedback Dialog Component

**File**: `src/features/algorithms/components/FeedbackDialog.tsx` (new file)

**Props**:

-   `open: boolean`
-   `onOpenChange: (open: boolean) => void`
-   `problemId: string`
-   `problemTitle: string`

**Features**:

-   Dialog with title "Feedback" and close button (X)
-   Problem name display: "Problem: [Title]"
-   Issues section with checkboxes:
    1. "Description or examples are unclear or incorrect"
    2. "Difficulty is inaccurate"
    3. "Testcases are missing or incorrect"
    4. "Runtime is too strict"
    5. "Edge cases are too frustrating to solve"
    6. "Other"
-   Additional feedback textarea (multi-line)
-   Cancel button (outline variant)
-   Submit button (primary/green variant)
-   Form validation: at least one issue must be selected
-   Loading state during submission
-   Success/error toast notifications
-   Reset form on close/success

**UI Components Used**:

-   `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from `@/components/ui/dialog`
-   `Button` from `@/components/ui/button`
-   `Textarea` from `@/components/ui/textarea`
-   `Label` from `@/components/ui/label` (for accessibility)
-   Custom checkbox styling (or simple HTML checkboxes with styling)

---

### 4. Update EditorPanel Component

**File**: `src/features/algorithms/components/EditorPanel.tsx`

**Changes**:

-   Add feedback button in the editor footer toolbar (after Reset button, before Show Solution)
-   Import `FeedbackDialog` component
-   Add state for feedback dialog: `const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)`
-   Add button with icon (e.g., `MessageSquare` or `Feedback` from lucide-react)
-   Button should match styling of Hint/Reset buttons (outline variant)
-   Pass `problem.id` and `problem.title` to FeedbackDialog

**Button placement**: Between Reset and Show Solution (if admin) buttons

---

### 5. Type Definitions

**File**: `src/types/algorithm-types.ts` (if needed)

Add feedback-related types if needed for type safety.

---

## Implementation Steps

1. **Database Schema**

    - Update `prisma/schema.prisma` with `AlgoProblemFeedback` model
    - Run migration: `npx prisma migrate dev --name add_problem_feedback`

2. **Server Action**

    - Create `src/lib/actions/feedback.ts`
    - Implement `submitProblemFeedback` function
    - Handle optional user authentication
    - Add error handling and validation

3. **Feedback Dialog Component**

    - Create `src/features/algorithms/components/FeedbackDialog.tsx`
    - Implement form with checkboxes and textarea
    - Add form validation
    - Integrate with server action
    - Add loading and success states
    - Style to match existing dialogs (dark theme)

4. **Update EditorPanel**

    - Add feedback button to toolbar
    - Import and integrate FeedbackDialog
    - Add state management for dialog open/close

5. **Testing**
    - Test with authenticated user
    - Test with anonymous user (if allowed)
    - Test form validation
    - Test submission success/error cases
    - Verify feedback is saved to database

---

## Design Notes

-   **Button Icon**: Use `MessageSquare` or `FileText` from lucide-react
-   **Button Text**: "Feedback" or just icon (if space is tight)
-   **Dialog Width**: Match existing dialogs (max-w-lg or similar)
-   **Checkbox Styling**: Use custom styled checkboxes to match dark theme
-   **Submit Button**: Green/primary variant to match screenshot
-   **Form Layout**: Vertical layout with proper spacing
-   **Accessibility**: Proper labels, keyboard navigation, focus management

---

## Files to Create/Modify

**New Files**:

-   `src/lib/actions/feedback.ts`
-   `src/features/algorithms/components/FeedbackDialog.tsx`

**Modified Files**:

-   `prisma/schema.prisma`
-   `src/features/algorithms/components/EditorPanel.tsx`

**Migration File** (auto-generated):

-   `prisma/migrations/[timestamp]_add_problem_feedback/migration.sql`

---

## Future Enhancements (Not in MVP)

-   Admin dashboard to view feedback
-   Feedback analytics
-   Email notifications for feedback
-   Feedback categories/tags
-   Ability to respond to feedback
