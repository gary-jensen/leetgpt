# Multi-Agent Parallel Implementation Guide

## Overview
This document outlines how to delegate the implementation of 50 algorithm problems across 5 agents working in parallel.

## File Structure
```
src/features/algorithms/data/problems/
├── algoProblems.ts              # Index file (✅ COMPLETED)
├── algoProblems1-10.ts          # Agent 1 task (✅ Partially done - has Two Sum)
├── algoProblems11-20.ts         # Agent 2 task (⏳ Empty)
├── algoProblems21-30.ts         # Agent 3 task (⏳ Empty)
├── algoProblems31-40.ts          # Agent 4 task (⏳ Empty)
└── algoProblems41-50.ts         # Agent 5 task (⏳ Empty)
```

## Agent Assignments

### Agent 1: Problems 1-10
- **File:** `.cursor/agents/agent-1-problems-1-10.md`
- **Status:** Two Sum (Problem 1) already implemented
- **Tasks:** Implement Problems 2-10
- **Total:** 9 problems remaining

### Agent 2: Problems 11-20
- **File:** `.cursor/agents/agent-2-problems-11-20.md`
- **Status:** Empty file
- **Tasks:** Implement Problems 11-20
- **Total:** 10 problems

### Agent 3: Problems 21-30
- **File:** `.cursor/agents/agent-3-problems-21-30.md`
- **Status:** Empty file
- **Tasks:** Implement Problems 21-30
- **Total:** 10 problems

### Agent 4: Problems 31-40
- **File:** `.cursor/agents/agent-4-problems-31-40.md`
- **Status:** Empty file
- **Tasks:** Implement Problems 31-40
- **Total:** 10 problems

### Agent 5: Problems 41-50
- **File:** `.cursor/agents/agent-5-problems-41-50.md`
- **Status:** Empty file
- **Tasks:** Implement Problems 41-50 (move Group Anagrams from old file)
- **Total:** 10 problems

## How to Use These Agent Files

1. **For each agent, open the corresponding agent file:**
   - Agent 1: `.cursor/agents/agent-1-problems-1-10.md`
   - Agent 2: `.cursor/agents/agent-2-problems-11-20.md`
   - Agent 3: `.cursor/agents/agent-3-problems-21-30.md`
   - Agent 4: `.cursor/agents/agent-4-problems-31-40.md`
   - Agent 5: `.cursor/agents/agent-5-problems-41-50.md`

2. **Provide the agent file as context** and ask the agent to implement the problems listed in that file.

3. **Each agent should:**
   - Read the agent-specific instruction file
   - Reference the template in `src/features/algorithms/data/old_algoProblems.ts`
   - Implement all problems listed in their file
   - Follow the exact format and requirements specified
   - Generate at least 40 test cases per problem

## Common Requirements (All Agents)

1. **Format Requirements:**
   - Use `#### Example X:` (4 hashes, not 3)
   - Constraints use superscript: `10^5^` not `` `10^5` ``
   - Blockquotes: `> **Input:** \`...\``
   - JSDoc comments in startingCode

2. **Test Cases:**
   - Minimum 40 test cases per problem
   - Cover edge cases
   - Ensure only 1 valid answer per test case
   - All test cases must follow constraints

3. **Code Quality:**
   - Proper JSDoc comments
   - Working passingCode solution
   - Correct parameter names
   - Appropriate topics and difficulty

## Verification Checklist

After all agents complete their work:

- [ ] All 5 files are populated with problems
- [ ] Each problem has proper format (statementMd, tests, code)
- [ ] Each problem has at least 40 test cases
- [ ] Index file (algoProblems.ts) imports all 5 files correctly
- [ ] Group Anagrams moved to algoProblems41-50.ts with order 49
- [ ] All problems have correct order numbers (1-50)
- [ ] No TypeScript/linting errors

## Next Steps

1. Delegate each agent file to a separate Cursor Composer session
2. Each agent implements their assigned problems independently
3. Verify all files compile and tests pass
4. Update any test files that import algoProblems directly

