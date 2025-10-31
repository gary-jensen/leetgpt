# Agent Task: Implement Problems 41-50 (algoProblems41-50.ts)

## File to Create/Edit
`src/features/algorithms/data/problems/algoProblems41-50.ts`

## Current Status
- ⏳ Empty file, need to implement Problems 41-50
- ⚠️ Note: Group Anagrams (order: 49) already exists in old_algoProblems.ts - move it here

## Problems to Implement

### Problem 41: First Missing Positive (Hard) - order: 41
**Description:** Given an unsorted integer array nums, return the smallest missing positive integer.

### Problem 42: Trapping Rain Water (Hard) - order: 42
**Description:** Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

### Problem 43: Multiply Strings (Medium) - order: 43
**Description:** Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also represented as a string.

### Problem 44: Wildcard Matching (Hard) - order: 44
**Description:** Given an input string (s) and a pattern (p), implement wildcard pattern matching with support for '?' and '*'.

### Problem 45: Jump Game II (Medium) - order: 45
**Description:** You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Return the minimum number of jumps to reach nums[n - 1].

### Problem 46: Permutations (Medium) - order: 46
**Description:** Given an array nums of distinct integers, return all the possible permutations.

### Problem 47: Permutations II (Medium) - order: 47
**Description:** Given a collection of numbers, nums, that might contain duplicates, return all the possible unique permutations.

### Problem 48: Rotate Image (Medium) - order: 48
**Description:** You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).

### Problem 49: Group Anagrams (Medium) - order: 49
**Description:** Given an array of strings strs, group the anagrams together.

**⚠️ IMPORTANT:** This problem already exists in `src/features/algorithms/data/old_algoProblems.ts`. Move it here and update its order to 49.

### Problem 50: Pow(x, n) (Medium) - order: 50
**Description:** Implement pow(x, n), which calculates x raised to the power n.

## Requirements for Each Problem

1. **Required Fields:**
   - `id`: kebab-case slug (e.g., "first-missing-positive")
   - `slug`: same as id
   - `title`: Full problem title
   - `order`: Number from 41-50
   - `statementMd`: Markdown with:
     - `#### Example X:` headers (not `###`)
     - Blockquotes: `> **Input:** \`...\``
     - Constraints with `^` superscript: `10^5^` not `` `10^5` ``
   - `topics`: Array of topic strings
   - `difficulty`: "easy" | "medium" | "hard"
   - `languages`: ["javascript"]
   - `rubric`: Object with `optimal_time` and `acceptable_time` (string array)
   - `parameterNames`: Array of parameter names in order
   - `tests`: Array with **at least 40 test cases**
   - `startingCode`: Object with `javascript` key containing JSDoc-commented function
   - `passingCode`: Object with `javascript` key containing working solution

2. **Test Cases:**
   - Minimum 40 test cases per problem
   - Cover edge cases
   - Ensure only 1 valid answer per test case
   - All test cases must follow constraints

3. **Template Reference:**
   - Use `src/features/algorithms/data/old_algoProblems.ts` as template
   - Follow exact format from existing problems

## Current File Structure

```typescript
import { AlgoProblemDetail } from "@/types/algorithm-types";

export const algoProblems41to50: AlgoProblemDetail[] = [
	// Implement problems 41-50 here
	// Move Group Anagrams from old_algoProblems.ts here
];
```

## Notes
- Research each problem from LeetCode to get accurate problem statements
- Ensure all test cases are valid and follow constraints
- Use proper markdown formatting for statements
- Include comprehensive test coverage
- For Group Anagrams, move the existing implementation from old_algoProblems.ts and update order to 49

