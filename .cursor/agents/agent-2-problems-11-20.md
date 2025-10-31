# Agent Task: Implement Problems 11-20 (algoProblems11-20.ts)

## File to Create/Edit
`src/features/algorithms/data/problems/algoProblems11-20.ts`

## Current Status
- ⏳ Empty file, need to implement Problems 11-20

## Problems to Implement

### Problem 11: Container With Most Water (Medium) - order: 11
**Description:** You are given an integer array height of length n. Find two lines that together with the x-axis form a container that contains the most water.

### Problem 12: Integer to Roman (Medium) - order: 12
**Description:** Convert an integer to a Roman numeral.

### Problem 13: Roman to Integer (Easy) - order: 13
**Description:** Convert a Roman numeral to an integer.

### Problem 14: Longest Common Prefix (Easy) - order: 14
**Description:** Write a function to find the longest common prefix string amongst an array of strings.

### Problem 15: 3Sum (Medium) - order: 15
**Description:** Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

### Problem 16: 3Sum Closest (Medium) - order: 16
**Description:** Given an integer array nums and an integer target, find three integers in nums such that the sum is closest to target.

### Problem 17: Letter Combinations of a Phone Number (Medium) - order: 17
**Description:** Given a string containing digits from 2-9, return all possible letter combinations that the number could represent.

### Problem 18: 4Sum (Medium) - order: 18
**Description:** Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that a + b + c + d == target.

### Problem 19: Remove Nth Node From End of List (Medium) - order: 19
**Description:** Given the head of a linked list, remove the nth node from the end of the list and return its head.

**Note:** Linked lists represented as arrays in test cases.

### Problem 20: Valid Parentheses (Easy) - order: 20
**Description:** Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

## Requirements for Each Problem

1. **Required Fields:**
   - `id`: kebab-case slug (e.g., "container-with-most-water")
   - `slug`: same as id
   - `title`: Full problem title
   - `order`: Number from 11-20
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

export const algoProblems11to20: AlgoProblemDetail[] = [
	// Implement problems 11-20 here
];
```

## Notes
- Research each problem from LeetCode to get accurate problem statements
- Ensure all test cases are valid and follow constraints
- Use proper markdown formatting for statements
- Include comprehensive test coverage

