# Agent Task: Implement Problems 31-40 (algoProblems31-40.ts)

## File to Create/Edit

`src/features/algorithms/data/problems/algoProblems31-40.ts`

## Current Status

-   ⏳ Empty file, need to implement Problems 31-40

## Problems to Implement

### Problem 31: Next Permutation (Medium) - order: 31

**Description:** Implement next permutation, which rearranges numbers into the lexicographically next greater permutation of numbers.

### Problem 32: Longest Valid Parentheses (Hard) - order: 32

**Description:** Given a string containing just the characters '(' and ')', find the length of the longest valid (well-formed) parentheses substring.

### Problem 33: Search in Rotated Sorted Array (Medium) - order: 33

**Description:** There is an integer array nums sorted in ascending order. Given the array nums after the possible rotation, return the index of target if it is in nums, or -1 if it is not in nums.

### Problem 34: Find First and Last Position of Element in Sorted Array (Medium) - order: 34

**Description:** Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.

### Problem 35: Search Insert Position (Easy) - order: 35

**Description:** Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

### Problem 36: Valid Sudoku (Medium) - order: 36

**Description:** Determine if a 9 x 9 Sudoku board is valid.

### Problem 37: Sudoku Solver (Hard) - order: 37

**Description:** Write a program to solve a Sudoku puzzle by filling the empty cells.

### Problem 38: Count and Say (Medium) - order: 38

**Description:** The count-and-say sequence is a sequence of digit strings defined by the recursive formula.

### Problem 39: Combination Sum (Medium) - order: 39

**Description:** Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.

### Problem 40: Combination Sum II (Medium) - order: 40

**Description:** Given a collection of candidate numbers (candidates) and a target number (target), find all unique combinations in candidates where the candidate numbers sum to target.

## Requirements for Each Problem

1. **Required Fields:**

    - `id`: kebab-case slug (e.g., "next-permutation")
    - `slug`: same as id
    - `title`: Full problem title
    - `order`: Number from 31-40
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

export const algoProblems31to40: AlgoProblemDetail[] = [
	// Implement problems 31-40 here
];
```

## Notes

-   Research each problem from LeetCode to get accurate problem statements
-   Ensure all test cases are valid and follow constraints
-   Use proper markdown formatting for statements
-   Include comprehensive test coverage
-   For Sudoku problems, use 2D array representation
