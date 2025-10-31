# Agent Task: Implement Problems 21-30 (algoProblems21-30.ts)

## File to Create/Edit
`src/features/algorithms/data/problems/algoProblems21-30.ts`

## Current Status
- ⏳ Empty file, need to implement Problems 21-30

## Problems to Implement

### Problem 21: Merge Two Sorted Lists (Easy) - order: 21
**Description:** Merge two sorted linked lists and return it as a sorted list.

**Note:** Linked lists represented as arrays in test cases.

### Problem 22: Generate Parentheses (Medium) - order: 22
**Description:** Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

### Problem 23: Merge k Sorted Lists (Hard) - order: 23
**Description:** You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.

**Note:** Linked lists represented as arrays in test cases.

### Problem 24: Swap Nodes in Pairs (Medium) - order: 24
**Description:** Given a linked list, swap every two adjacent nodes and return its head.

**Note:** Linked lists represented as arrays in test cases.

### Problem 25: Reverse Nodes in k-Group (Hard) - order: 25
**Description:** Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.

**Note:** Linked lists represented as arrays in test cases.

### Problem 26: Remove Duplicates from Sorted Array (Easy) - order: 26
**Description:** Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once.

### Problem 27: Remove Element (Easy) - order: 27
**Description:** Given an integer array nums and an integer val, remove all occurrences of val in-place.

### Problem 28: Find the Index of the First Occurrence in a String (Easy) - order: 28
**Description:** Given two strings needle and haystack, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.

### Problem 29: Divide Two Integers (Medium) - order: 29
**Description:** Given two integers dividend and divisor, divide two integers without using multiplication, division, and mod operator.

### Problem 30: Substring with Concatenation of All Words (Hard) - order: 30
**Description:** You are given a string s and an array of strings words. Find all starting indices of substring(s) in s that is a concatenation of each word in words exactly once.

## Requirements for Each Problem

1. **Required Fields:**
   - `id`: kebab-case slug (e.g., "merge-two-sorted-lists")
   - `slug`: same as id
   - `title`: Full problem title
   - `order`: Number from 21-30
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

export const algoProblems21to30: AlgoProblemDetail[] = [
	// Implement problems 21-30 here
];
```

## Notes
- Research each problem from LeetCode to get accurate problem statements
- Ensure all test cases are valid and follow constraints
- Use proper markdown formatting for statements
- Include comprehensive test coverage
- For linked list problems, use array representation in test cases

