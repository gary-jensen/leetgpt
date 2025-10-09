<!-- 909c4ba9-e602-46c3-9504-d8d9252425e9 51c37046-c900-4a13-be22-0c9cb7bee197 -->
# Continuous Flow Learning MVP

## Overview

Transform the workspace into an addictive, flow-state learning experience by removing interruptions, adding progressive rewards, and implementing continuous lesson advancement.

## Core Changes

### 1. XP and Leveling System

**Files to create:**

- `src/contexts/ProgressContext.tsx` - Global state for XP, level, current skill node
- `src/lib/progressionSystem.ts` - XP calculation, leveling logic, skill tree data structure

**Implementation:**

- XP bar component at top of workspace (next to skill node indicator)
- Small XP reward per step completion (e.g., 10-20 XP)
- Large XP reward per lesson completion (e.g., 50-100 XP)
- Level calculation based on XP (exponential curve)
- Animate XP bar on rewards with smooth fill animation

### 2. Skill Tree System

**Files to create:**

- `src/components/SkillTree/SkillTreeNode.tsx` - Individual node display
- `src/components/SkillTree/SkillTreePopup.tsx` - Full tree overlay animation
- `src/components/SkillTree/CurrentNodeIndicator.tsx` - Persistent node widget

**Implementation:**

- Each lesson belongs to a skill node
- Current node shows at top (left of XP bar) with progress ring
- Node fills up as lessons complete
- On node completion, trigger full skill tree popup with animation
- Popup shows entire tree, highlights completed path, then fades back to workspace

### 3. Auto-Advancement and Flow

**Files to modify:**

- `src/features/Workspace/hooks/useLessonStreaming.ts`
- `src/features/Workspace/Workspace.tsx`

**Changes:**

- On last step completion, auto-load next lesson after brief delay (500ms for reward animation)
- Clear chat messages when switching lessons
- Store chat history in context (for future history tab feature)
- Remove any manual "next lesson" buttons
- Smooth transitions between lessons

### 4. Reward Animations

**Files to create:**

- `src/components/Rewards/XPGainAnimation.tsx` - Floating +XP text
- `src/components/Rewards/LevelUpAnimation.tsx` - Level up celebration
- `src/components/Rewards/NodeCompleteAnimation.tsx` - Skill node completion

**Implementation:**

- Show floating "+10 XP" on step completion
- Show "+50 XP" + level progress on lesson completion
- If level up occurs, show celebratory animation overlay
- If node completes, trigger skill tree popup
- All animations are quick (1-2 seconds) to maintain flow

### 5. Top Bar UI

**Files to create:**

- `src/features/Workspace/components/ProgressBar.tsx` - Top bar with all progress indicators

**Structure:**

```
[Current Skill Node] [Level X] [========70%========] [350/500 XP]
```

- Current skill node (circular icon with progress ring)
- Level number
- XP progress bar (fills toward next level)
- XP fraction text

### 6. Mock Data Structure Updates

**Files to modify:**

- `src/features/Workspace/mock-lessons.tsx`

**Add to each lesson:**

- `skillNodeId: string` - Which skill node this lesson belongs to
- `xpReward: number` - XP given on lesson completion
- `stepXpReward: number` - XP given per step completion

**Create skill tree data:**

```typescript
skillTree = {
  nodes: [
    { id: "variables", name: "Variables", lessons: ["lesson-1", "lesson-2"] },
    { id: "functions", name: "Functions", lessons: ["lesson-3", "lesson-4"] },
    // ...
  ]
}
```

## Implementation Order

1. **Create ProgressContext** - State management for XP/level/node
2. **Build top bar UI** - Visual progress indicators
3. **Implement XP system** - Award XP, calculate levels, animate
4. **Add skill tree structure** - Data model and current node tracking
5. **Build skill tree popup** - Animated overlay for node completion
6. **Auto-advancement logic** - Clear chat, load next lesson automatically
7. **Reward animations** - Floating XP, level up, node complete
8. **Polish and timing** - Tune animation speeds, delays, XP amounts

## Key Technical Decisions

- Use React Context for global progress state (avoid prop drilling)
- CSS animations with Tailwind for smooth, performant transitions
- Store progress in localStorage for MVP (database later)
- Calculate XP requirements exponentially: `level * level * 100`
- Each skill node = 3-5 lessons to complete
- Clear chat on lesson change, preserve within lesson

## Testing Focus

Once implemented, test these engagement metrics:

- Time to complete 3 lessons in a row (should feel fast)
- Does the user notice time passing? (goal: no)
- Do animations feel rewarding or annoying? (tune accordingly)
- Is XP progression satisfying? (adjust if too slow/fast)

### To-dos

- [ ] Create ProgressContext with XP, level, and skill node state management
- [ ] Implement XP calculation, leveling system, and skill tree data structure
- [ ] Build ProgressBar component with level, XP bar, and current node indicator
- [ ] Integrate XP reward system into lesson completion flow
- [ ] Update mock-lessons with skillNodeId and create skill tree structure
- [ ] Build skill tree popup and node completion animations
- [ ] Implement auto-advancement between lessons with chat clearing
- [ ] Create XP gain, level up, and node complete animations
- [ ] Tune timing, animation speeds, and XP amounts for optimal engagement