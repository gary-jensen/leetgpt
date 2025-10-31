# Agent Task: Implement Problems 1-10 (algoProblems1-10.ts)

## File to Create/Edit
`src/features/algorithms/data/problems/algoProblems1-10.ts`

## Current Status
- ✅ Two Sum (Problem 1) already implemented
- ⏳ Need to implement Problems 2-10

## Problems to Implement

### Problem 2: Add Two Numbers (Medium) - order: 2
**Description:** You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit. Add the two numbers and return the sum as a linked list.

**Note:** Linked lists are represented as arrays in test cases. Use helper functions to convert arrays to ListNode objects if needed, or represent as arrays directly.

### Problem 3: Longest Substring Without Repeating Characters (Medium) - order: 3
**Description:** Given a string s, find the length of the longest substring without repeating characters.

### Problem 4: Median of Two Sorted Arrays (Hard) - order: 4
**Description:** Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

### Problem 5: Longest Palindromic Substring (Medium) - order: 5
**Description:** Given a string s, return the longest palindromic substring in s.

### Problem 6: Zigzag Conversion (Medium) - order: 6
**Description:** The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows. Return the string read line by line.

### Problem 7: Reverse Integer (Medium) - order: 7
**Description:** Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.

### Problem 8: String to Integer (atoi) (Medium) - order: 8
**Description:** Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.

### Problem 9: Palindrome Number (Easy) - order: 9
**Description:** Given an integer x, return true if x is a palindrome integer.

### Problem 10: Regular Expression Matching (Hard) - order: 10
**Description:** Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.

## Requirements for Each Problem

1. **Required Fields:**
   - `id`: kebab-case slug (e.g., "add-two-numbers")
   - `slug`: same as id
   - `title`: Full problem title
   - `order`: Number from 2-10
   - `statementMd`: Markdown with:
     - `#### Example X:` headers (not `###`)
     - Blockquotes for input/output/explanation: `> **Input:** \`...\``
     - Constraints with `^` superscript notation: `10^5^` not `` `10^5` ``
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
   - Follow exact format from Two Sum problem above

## Current File Structure

```typescript
import { AlgoProblemDetail } from "@/types/algorithm-types";

export const algoProblems1to10: AlgoProblemDetail[] = [
	// Two Sum already here
	// Add problems 2-10 here
];
```

## Notes
- Research each problem from LeetCode to get accurate problem statements
- Ensure all test cases are valid and follow constraints
- Use proper markdown formatting for statements
- Include comprehensive test coverage

