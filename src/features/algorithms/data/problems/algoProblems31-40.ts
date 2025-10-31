import { AlgoProblemDetail } from "@/types/algorithm-types";

export const algoProblems31to40: AlgoProblemDetail[] = [
	{
		id: "next-permutation",
		slug: "next-permutation",
		title: "Next Permutation",
		statementMd: `Implement **next permutation**, which rearranges numbers into the lexicographically next greater permutation of numbers.

If such arrangement is not possible, it must rearrange it as the lowest possible order (i.e., sorted in ascending order).

The replacement must be **in place** and use only constant extra memory.

#### Example 1:
> **Input:** \`nums = [1,2,3]\`
> **Output:** \`[1,3,2]\`

#### Example 2:
> **Input:** \`nums = [3,2,1]\`
> **Output:** \`[1,2,3]\`
> **Explanation:** The next permutation of [3,2,1] is [1,2,3] since this sequence does not have a next greater rearrangement.

#### Example 3:
> **Input:** \`nums = [1,1,5]\`
> **Output:** \`[1,5,1]\`

#### Constraints:
- 1 <= nums.length <= 100
- 0 <= nums[i] <= 100`,
		topics: ["arrays", "two-pointers"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 31,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["nums"],
		tests: [
			{ input: [[1, 2, 3]], output: [1, 3, 2] },
			{ input: [[3, 2, 1]], output: [1, 2, 3] },
			{ input: [[1, 1, 5]], output: [1, 5, 1] },
			{ input: [[1, 2]], output: [2, 1] },
			{ input: [[1]], output: [1] },
			{ input: [[1, 3, 2]], output: [2, 1, 3] },
			{ input: [[2, 3, 1]], output: [3, 1, 2] },
			{ input: [[5, 4, 3, 2, 1]], output: [1, 2, 3, 4, 5] },
			{ input: [[1, 2, 3, 4]], output: [1, 2, 4, 3] },
			{ input: [[4, 3, 2, 1]], output: [1, 2, 3, 4] },
			{ input: [[1, 3, 5, 4, 2]], output: [1, 4, 2, 3, 5] },
			{ input: [[2, 1, 3]], output: [2, 3, 1] },
			{ input: [[1, 5, 1]], output: [5, 1, 1] },
			{ input: [[2, 4, 3, 1]], output: [3, 1, 2, 4] },
			{ input: [[3, 1, 2]], output: [3, 2, 1] },
			{ input: [[1, 2, 4, 3]], output: [1, 3, 2, 4] },
			{ input: [[2, 3, 4, 1]], output: [2, 4, 1, 3] },
			{ input: [[1, 4, 3, 2]], output: [2, 1, 3, 4] },
			{ input: [[5, 1, 4, 3, 2]], output: [5, 2, 1, 3, 4] },
			{ input: [[1, 1, 1]], output: [1, 1, 1] },
			{ input: [[1, 2, 1]], output: [2, 1, 1] },
			{ input: [[2, 1, 1]], output: [1, 1, 2] },
			{ input: [[1, 1, 2]], output: [1, 2, 1] },
			{ input: [[1, 2, 3, 5, 4]], output: [1, 2, 4, 3, 5] },
			{ input: [[2, 1, 4, 3]], output: [2, 3, 1, 4] },
			{ input: [[1, 3, 4, 2]], output: [1, 4, 2, 3] },
			{ input: [[4, 2, 1, 3]], output: [4, 2, 3, 1] },
			{ input: [[3, 4, 1, 2]], output: [3, 4, 2, 1] },
			{ input: [[2, 4, 1, 3]], output: [2, 4, 3, 1] },
			{ input: [[1, 5, 4, 3, 2]], output: [2, 1, 3, 4, 5] },
			{ input: [[3, 5, 4, 2, 1]], output: [4, 1, 2, 3, 5] },
			{ input: [[5, 4, 1, 3, 2]], output: [5, 4, 2, 1, 3] },
			{ input: [[1, 2, 5, 4, 3]], output: [1, 3, 2, 4, 5] },
			{ input: [[2, 5, 3, 4, 1]], output: [2, 5, 4, 1, 3] },
			{ input: [[4, 5, 2, 3, 1]], output: [4, 5, 3, 1, 2] },
			{ input: [[1, 3, 2, 5, 4]], output: [1, 3, 4, 2, 5] },
			{ input: [[2, 3, 5, 1, 4]], output: [2, 3, 5, 4, 1] },
			{ input: [[5, 3, 1, 2, 4]], output: [5, 3, 1, 4, 2] },
			{ input: [[3, 4, 5, 1, 2]], output: [3, 4, 5, 2, 1] },
			{ input: [[1, 4, 5, 2, 3]], output: [1, 4, 5, 3, 2] },
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
function nextPermutation(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function nextPermutation(nums) {
  let i = nums.length - 2;
  
  // Find the largest index i such that nums[i] < nums[i + 1]
  while (i >= 0 && nums[i] >= nums[i + 1]) {
    i--;
  }
  
  if (i >= 0) {
    // Find the largest index j such that nums[j] > nums[i]
    let j = nums.length - 1;
    while (j >= 0 && nums[j] <= nums[i]) {
      j--;
    }
    // Swap nums[i] and nums[j]
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  
  // Reverse the suffix starting at nums[i + 1]
  let left = i + 1;
  let right = nums.length - 1;
  while (left < right) {
    [nums[left], nums[right]] = [nums[right], nums[left]];
    left++;
    right--;
  }
}`,
		},
	},
	{
		id: "longest-valid-parentheses",
		slug: "longest-valid-parentheses",
		title: "Longest Valid Parentheses",
		statementMd: `Given a string containing just the characters \`'('\` and \`')'\`, find the length of the longest valid (well-formed) parentheses substring.

#### Example 1:
> **Input:** \`s = "(()"\`
> **Output:** \`2\`
> **Explanation:** The longest valid parentheses substring is "()".

#### Example 2:
> **Input:** \`s = ")()())"\`
> **Output:** \`4\`
> **Explanation:** The longest valid parentheses substring is "()()".

#### Example 3:
> **Input:** \`s = ""\`
> **Output:** \`0\`

#### Constraints:
- 0 <= s.length <= 3 * 10^4^
- s[i] is \`'('\`, or \`')'\`.`,
		topics: ["strings", "dynamic-programming", "stack"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 32,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["s"],
		tests: [
			{ input: ["(()"], output: 2 },
			{ input: [")()())"], output: 4 },
			{ input: [""], output: 0 },
			{ input: ["()"], output: 2 },
			{ input: ["()(())"], output: 6 },
			{ input: ["((()))"], output: 6 },
			{ input: ["())"], output: 2 },
			{ input: ["((("], output: 0 },
			{ input: [")))"], output: 0 },
			{ input: ["()()"], output: 4 },
			{ input: ["(()())"], output: 6 },
			{ input: ["()((()"], output: 2 },
			{ input: ["(()()))"], output: 6 },
			{ input: ["((()))"], output: 6 },
			{ input: ["()(()"], output: 2 },
			{ input: ["(())"], output: 4 },
			{ input: ["((())"], output: 4 },
			{ input: ["(()))"], output: 4 },
			{ input: ["())(())"], output: 4 },
			{ input: ["()(()()"], output: 4 },
			{ input: ["((()))()"], output: 8 },
			{ input: ["())(()()"], output: 4 },
			{ input: ["(()()"], output: 4 },
			{ input: ["()((()))"], output: 8 },
			{ input: ["((()()))"], output: 8 },
			{ input: ["())((())"], output: 4 },
			{ input: ["(()())()"], output: 8 },
			{ input: ["()()()"], output: 6 },
			{ input: ["((()))()()"], output: 10 },
			{ input: ["()()()()"], output: 8 },
			{ input: ["(())(())"], output: 8 },
			{ input: ["((()()))()"], output: 10 },
			{ input: ["()()(()"], output: 4 },
			{ input: ["()(()())"], output: 8 },
			{ input: ["((())())"], output: 8 },
			{ input: ["()((())()"], output: 6 },
			{ input: ["(()(()))"], output: 8 },
			{ input: ["()()()()()"], output: 10 },
			{ input: ["((()()))()()"], output: 10 },
			{ input: ["()(()()())"], output: 10 },
			{ input: ["(())(())(())"], output: 12 },
			{ input: ["((())()())"], output: 10 },
		],
		startingCode: {
			javascript: `/**
 * @param {string} s
 * @return {number}
 */
function longestValidParentheses(s) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function longestValidParentheses(s) {
  let maxLen = 0;
  const stack = [-1]; // Base for calculating length
  
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i); // New base
      } else {
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }
  
  return maxLen;
}`,
		},
	},
	{
		id: "search-in-rotated-sorted-array",
		slug: "search-in-rotated-sorted-array",
		title: "Search in Rotated Sorted Array",
		statementMd: `There is an integer array \`nums\` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, \`nums\` is **possibly rotated** at an unknown pivot index \`k\` (1 <= k < nums.length) such that the resulting array is \`[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]\` (0-indexed). For example, \`[0,1,2,4,5,6,7]\` might be rotated at pivot index \`3\` and become \`[4,5,6,7,0,1,2]\`.

Given the array \`nums\` **after** the rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

#### Example 1:
> **Input:** \`nums = [4,5,6,7,0,1,2]\`, \`target = 0\`
> **Output:** \`4\`

#### Example 2:
> **Input:** \`nums = [4,5,6,7,0,1,2]\`, \`target = 3\`
> **Output:** \`-1\`

#### Example 3:
> **Input:** \`nums = [1]\`, \`target = 0\`
> **Output:** \`-1\`

#### Constraints:
- 1 <= nums.length <= 5000
- -10^4^ <= nums[i] <= 10^4^
- All values of \`nums\` are **unique**.
- \`nums\` is an ascending array that is possibly rotated.
- -10^4^ <= target <= 10^4^`,
		topics: ["arrays", "binary-search"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 33,
		rubric: {
			optimal_time: "O(log n)",
			acceptable_time: ["O(log n)"],
		},
		parameterNames: ["nums", "target"],
		tests: [
			{ input: [[4, 5, 6, 7, 0, 1, 2], 0], output: 4 },
			{ input: [[4, 5, 6, 7, 0, 1, 2], 3], output: -1 },
			{ input: [[1], 0], output: -1 },
			{ input: [[1], 1], output: 0 },
			{ input: [[5, 1, 3], 3], output: 2 },
			{ input: [[4, 5, 6, 7, 0, 1, 2], 4], output: 0 },
			{ input: [[4, 5, 6, 7, 0, 1, 2], 5], output: 1 },
			{ input: [[4, 5, 6, 7, 0, 1, 2], 6], output: 2 },
			{ input: [[4, 5, 6, 7, 0, 1, 2], 7], output: 3 },
			{ input: [[4, 5, 6, 7, 0, 1, 2], 1], output: 5 },
			{ input: [[4, 5, 6, 7, 0, 1, 2], 2], output: 6 },
			{ input: [[3, 4, 5, 1, 2], 1], output: 3 },
			{ input: [[3, 4, 5, 1, 2], 2], output: 4 },
			{ input: [[3, 4, 5, 1, 2], 3], output: 0 },
			{ input: [[3, 4, 5, 1, 2], 4], output: 1 },
			{ input: [[3, 4, 5, 1, 2], 5], output: 2 },
			{ input: [[1, 3], 3], output: 1 },
			{ input: [[1, 3], 1], output: 0 },
			{ input: [[3, 1], 1], output: 1 },
			{ input: [[3, 1], 3], output: 0 },
			{ input: [[1, 2, 3, 4, 5], 1], output: 0 },
			{ input: [[1, 2, 3, 4, 5], 5], output: 4 },
			{ input: [[5, 1, 2, 3, 4], 1], output: 1 },
			{ input: [[5, 1, 2, 3, 4], 5], output: 0 },
			{ input: [[2, 3, 4, 5, 1], 1], output: 4 },
			{ input: [[2, 3, 4, 5, 1], 2], output: 0 },
			{ input: [[6, 7, 8, 1, 2, 3, 4, 5], 1], output: 3 },
			{ input: [[6, 7, 8, 1, 2, 3, 4, 5], 6], output: 0 },
			{ input: [[6, 7, 8, 1, 2, 3, 4, 5], 5], output: 7 },
			{ input: [[10, 20, 30, 40, 50], 10], output: 0 },
			{ input: [[50, 10, 20, 30, 40], 50], output: 0 },
			{ input: [[50, 10, 20, 30, 40], 40], output: 4 },
			{
				input: [
					[
						15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
						29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 1, 2, 3,
						4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
					],
					15,
				],
				output: 0,
			},
			{
				input: [
					[
						15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
						29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 1, 2, 3,
						4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
					],
					14,
				],
				output: 39,
			},
			{
				input: [
					[
						15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
						29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 1, 2, 3,
						4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
					],
					40,
				],
				output: 25,
			},
			{
				input: [
					[
						15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
						29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 1, 2, 3,
						4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
					],
					1,
				],
				output: 26,
			},
			{
				input: [
					[
						15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
						29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 1, 2, 3,
						4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
					],
					7,
				],
				output: 33,
			},
			{
				input: [
					[
						15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
						29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 1, 2, 3,
						4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
					],
					25,
				],
				output: 10,
			},
			{
				input: [
					[
						15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
						29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 1, 2, 3,
						4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
					],
					100,
				],
				output: -1,
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) {
      return mid;
    }
    
    // Check which half is sorted
    if (nums[left] <= nums[mid]) {
      // Left half is sorted
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      // Right half is sorted
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }
  
  return -1;
}`,
		},
	},
	{
		id: "find-first-and-last-position-of-element-in-sorted-array",
		slug: "find-first-and-last-position-of-element-in-sorted-array",
		title: "Find First and Last Position of Element in Sorted Array",
		statementMd: `Given an array of integers \`nums\` sorted in non-decreasing order, find the starting and ending position of a given \`target\` value.

If \`target\` is not found in the array, return \`[-1, -1]\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

#### Example 1:
> **Input:** \`nums = [5,7,7,8,8,10]\`, \`target = 8\`
> **Output:** \`[3,4]\`

#### Example 2:
> **Input:** \`nums = [5,7,7,8,8,10]\`, \`target = 6\`
> **Output:** \`[-1,-1]\`

#### Example 3:
> **Input:** \`nums = []\`, \`target = 0\`
> **Output:** \`[-1,-1]\`

#### Constraints:
- 0 <= nums.length <= 10^5^
- -10^9^ <= nums[i] <= 10^9^
- \`nums\` is a non-decreasing array.
- -10^9^ <= target <= 10^9^`,
		topics: ["arrays", "binary-search"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 34,
		rubric: {
			optimal_time: "O(log n)",
			acceptable_time: ["O(log n)"],
		},
		parameterNames: ["nums", "target"],
		tests: [
			{ input: [[5, 7, 7, 8, 8, 10], 8], output: [3, 4] },
			{ input: [[5, 7, 7, 8, 8, 10], 6], output: [-1, -1] },
			{ input: [[], 0], output: [-1, -1] },
			{ input: [[1], 1], output: [0, 0] },
			{ input: [[1], 0], output: [-1, -1] },
			{ input: [[2, 2], 2], output: [0, 1] },
			{ input: [[2, 2], 3], output: [-1, -1] },
			{ input: [[1, 2, 3], 2], output: [1, 1] },
			{ input: [[1, 2, 3], 1], output: [0, 0] },
			{ input: [[1, 2, 3], 3], output: [2, 2] },
			{ input: [[1, 2, 3], 4], output: [-1, -1] },
			{ input: [[1, 1, 1, 1], 1], output: [0, 3] },
			{ input: [[1, 1, 1, 1], 2], output: [-1, -1] },
			{ input: [[1, 3, 3, 5, 5, 5, 7, 9], 5], output: [3, 5] },
			{ input: [[1, 3, 3, 5, 5, 5, 7, 9], 3], output: [1, 2] },
			{ input: [[1, 3, 3, 5, 5, 5, 7, 9], 1], output: [0, 0] },
			{ input: [[1, 3, 3, 5, 5, 5, 7, 9], 9], output: [7, 7] },
			{ input: [[1, 3, 3, 5, 5, 5, 7, 9], 7], output: [6, 6] },
			{ input: [[1, 3, 3, 5, 5, 5, 7, 9], 0], output: [-1, -1] },
			{ input: [[1, 3, 3, 5, 5, 5, 7, 9], 10], output: [-1, -1] },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], output: [4, 4] },
			{ input: [[1, 2, 3, 4, 5, 5, 5, 6, 7, 8], 5], output: [4, 6] },
			{ input: [[5, 5, 5, 5, 5, 5], 5], output: [0, 5] },
			{ input: [[5, 5, 5, 5, 5, 5], 4], output: [-1, -1] },
			{ input: [[5, 5, 5, 5, 5, 5], 6], output: [-1, -1] },
			{ input: [[1, 5, 5, 5, 9], 5], output: [1, 3] },
			{ input: [[1, 5, 5, 5, 9], 1], output: [0, 0] },
			{ input: [[1, 5, 5, 5, 9], 9], output: [4, 4] },
			{ input: [[-5, -3, -3, -1, 0, 0, 0, 2, 4], -3], output: [1, 2] },
			{ input: [[-5, -3, -3, -1, 0, 0, 0, 2, 4], 0], output: [4, 6] },
			{ input: [[-5, -3, -3, -1, 0, 0, 0, 2, 4], -5], output: [0, 0] },
			{ input: [[-5, -3, -3, -1, 0, 0, 0, 2, 4], 4], output: [8, 8] },
			{ input: [[-5, -3, -3, -1, 0, 0, 0, 2, 4], -10], output: [-1, -1] },
			{ input: [[-5, -3, -3, -1, 0, 0, 0, 2, 4], 10], output: [-1, -1] },
			{
				input: [[1, 2, 2, 2, 3, 3, 4, 5, 5, 5, 5, 6, 7], 2],
				output: [1, 3],
			},
			{
				input: [[1, 2, 2, 2, 3, 3, 4, 5, 5, 5, 5, 6, 7], 5],
				output: [7, 10],
			},
			{
				input: [[1, 2, 2, 2, 3, 3, 4, 5, 5, 5, 5, 6, 7], 3],
				output: [4, 5],
			},
			{
				input: [[1, 2, 2, 2, 3, 3, 4, 5, 5, 5, 5, 6, 7], 1],
				output: [0, 0],
			},
			{
				input: [[1, 2, 2, 2, 3, 3, 4, 5, 5, 5, 5, 6, 7], 7],
				output: [12, 12],
			},
			{
				input: [[10, 10, 10, 20, 20, 30, 30, 30, 30, 40], 10],
				output: [0, 2],
			},
			{
				input: [[10, 10, 10, 20, 20, 30, 30, 30, 30, 40], 20],
				output: [3, 4],
			},
			{
				input: [[10, 10, 10, 20, 20, 30, 30, 30, 30, 40], 30],
				output: [5, 8],
			},
			{
				input: [[10, 10, 10, 20, 20, 30, 30, 30, 30, 40], 40],
				output: [9, 9],
			},
			{
				input: [[10, 10, 10, 20, 20, 30, 30, 30, 30, 40], 15],
				output: [-1, -1],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function searchRange(nums, target) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function searchRange(nums, target) {
  function findFirst(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    let result = -1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (nums[mid] === target) {
        result = mid;
        right = mid - 1; // Continue searching left
      } else if (nums[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return result;
  }
  
  function findLast(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    let result = -1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (nums[mid] === target) {
        result = mid;
        left = mid + 1; // Continue searching right
      } else if (nums[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return result;
  }
  
  return [findFirst(nums, target), findLast(nums, target)];
}`,
		},
	},
	{
		id: "search-insert-position",
		slug: "search-insert-position",
		title: "Search Insert Position",
		statementMd: `Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.

You must write an algorithm with \`O(log n)\` runtime complexity.

#### Example 1:
> **Input:** \`nums = [1,3,5,6]\`, \`target = 5\`
> **Output:** \`2\`

#### Example 2:
> **Input:** \`nums = [1,3,5,6]\`, \`target = 2\`
> **Output:** \`1\`

#### Example 3:
> **Input:** \`nums = [1,3,5,6]\`, \`target = 7\`
> **Output:** \`4\`

#### Constraints:
- 1 <= nums.length <= 10^4^
- -10^4^ <= nums[i] <= 10^4^
- \`nums\` contains **distinct** values sorted in **ascending** order.
- -10^4^ <= target <= 10^4^`,
		topics: ["arrays", "binary-search"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 35,
		rubric: {
			optimal_time: "O(log n)",
			acceptable_time: ["O(log n)"],
		},
		parameterNames: ["nums", "target"],
		tests: [
			{ input: [[1, 3, 5, 6], 5], output: 2 },
			{ input: [[1, 3, 5, 6], 2], output: 1 },
			{ input: [[1, 3, 5, 6], 7], output: 4 },
			{ input: [[1, 3, 5, 6], 0], output: 0 },
			{ input: [[1], 0], output: 0 },
			{ input: [[1], 1], output: 0 },
			{ input: [[1], 2], output: 1 },
			{ input: [[1, 3], 2], output: 1 },
			{ input: [[1, 3], 1], output: 0 },
			{ input: [[1, 3], 3], output: 1 },
			{ input: [[1, 3], 0], output: 0 },
			{ input: [[1, 3], 4], output: 2 },
			{ input: [[1, 2, 3, 4, 5], 3], output: 2 },
			{ input: [[1, 2, 3, 4, 5], 6], output: 5 },
			{ input: [[1, 2, 3, 4, 5], 0], output: 0 },
			{ input: [[1, 2, 3, 4, 5], 1], output: 0 },
			{ input: [[1, 2, 3, 4, 5], 5], output: 4 },
			{ input: [[2, 4, 6, 8, 10], 1], output: 0 },
			{ input: [[2, 4, 6, 8, 10], 3], output: 1 },
			{ input: [[2, 4, 6, 8, 10], 5], output: 2 },
			{ input: [[2, 4, 6, 8, 10], 7], output: 3 },
			{ input: [[2, 4, 6, 8, 10], 9], output: 4 },
			{ input: [[2, 4, 6, 8, 10], 11], output: 5 },
			{ input: [[-5, -3, -1, 0, 2, 4, 6], -6], output: 0 },
			{ input: [[-5, -3, -1, 0, 2, 4, 6], -4], output: 1 },
			{ input: [[-5, -3, -1, 0, 2, 4, 6], -2], output: 2 },
			{ input: [[-5, -3, -1, 0, 2, 4, 6], 1], output: 4 },
			{ input: [[-5, -3, -1, 0, 2, 4, 6], 3], output: 5 },
			{ input: [[-5, -3, -1, 0, 2, 4, 6], 5], output: 6 },
			{ input: [[-5, -3, -1, 0, 2, 4, 6], 7], output: 7 },
			{ input: [[10, 20, 30, 40, 50], 5], output: 0 },
			{ input: [[10, 20, 30, 40, 50], 15], output: 1 },
			{ input: [[10, 20, 30, 40, 50], 25], output: 2 },
			{ input: [[10, 20, 30, 40, 50], 35], output: 3 },
			{ input: [[10, 20, 30, 40, 50], 45], output: 4 },
			{ input: [[10, 20, 30, 40, 50], 55], output: 5 },
			{ input: [[1, 5, 9, 13, 17, 21], 0], output: 0 },
			{ input: [[1, 5, 9, 13, 17, 21], 3], output: 1 },
			{ input: [[1, 5, 9, 13, 17, 21], 7], output: 2 },
			{ input: [[1, 5, 9, 13, 17, 21], 11], output: 3 },
			{ input: [[1, 5, 9, 13, 17, 21], 15], output: 4 },
			{ input: [[1, 5, 9, 13, 17, 21], 19], output: 5 },
			{ input: [[1, 5, 9, 13, 17, 21], 25], output: 6 },
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchInsert(nums, target) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function searchInsert(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) {
      return mid;
    } else if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return left;
}`,
		},
	},
	{
		id: "valid-sudoku",
		slug: "valid-sudoku",
		title: "Valid Sudoku",
		statementMd: `Determine if a \`9 x 9\` Sudoku board is valid. Only the filled cells need to be validated **according to the following rules:**

1. Each row must contain the digits \`1-9\` without repetition.
2. Each column must contain the digits \`1-9\` without repetition.
3. Each of the nine \`3 x 3\` sub-boxes of the grid must contain the digits \`1-9\` without repetition.

**Note:**
- A Sudoku board (partially filled) could be valid but is not necessarily solvable.
- Only the filled cells need to be validated according to the mentioned rules.

#### Example 1:
> **Input:** \`board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]\`
> **Output:** \`true\`

#### Example 2:
> **Input:** \`board = [["8","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]\`
> **Output:** \`false\`
> **Explanation:** Same as Example 1, except with the 5 in the top left corner being modified to 8. Since there are two 8's in the top left 3x3 sub-box, it is invalid.

#### Constraints:
- \`board.length == 9\`
- \`board[i].length == 9\`
- \`board[i][j]\` is a digit \`1-9\` or \`'.'\`.`,
		topics: ["arrays", "hashmap"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 36,
		rubric: {
			optimal_time: "O(1)",
			acceptable_time: ["O(1)"],
		},
		parameterNames: ["board"],
		tests: [
			{
				input: [
					[
						["5", "3", ".", ".", "7", ".", ".", ".", "."],
						["6", ".", ".", "1", "9", "5", ".", ".", "."],
						[".", "9", "8", ".", ".", ".", ".", "6", "."],
						["8", ".", ".", ".", "6", ".", ".", ".", "3"],
						["4", ".", ".", "8", ".", "3", ".", ".", "1"],
						["7", ".", ".", ".", "2", ".", ".", ".", "6"],
						[".", "6", ".", ".", ".", ".", "2", "8", "."],
						[".", ".", ".", "4", "1", "9", ".", ".", "5"],
						[".", ".", ".", ".", "8", ".", ".", "7", "9"],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["8", "3", ".", ".", "7", ".", ".", ".", "."],
						["6", ".", ".", "1", "9", "5", ".", ".", "."],
						[".", "9", "8", ".", ".", ".", ".", "6", "."],
						["8", ".", ".", ".", "6", ".", ".", ".", "3"],
						["4", ".", ".", "8", ".", "3", ".", ".", "1"],
						["7", ".", ".", ".", "2", ".", ".", ".", "6"],
						[".", "6", ".", ".", ".", ".", "2", "8", "."],
						[".", ".", ".", "4", "1", "9", ".", ".", "5"],
						[".", ".", ".", ".", "8", ".", ".", "7", "9"],
					],
				],
				output: false,
			},
			{
				input: [
					[
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", "2", "3", "4", "5", "6", "7", "8", "9"],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", "1", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: false,
			},
			{
				input: [
					[
						["1", ".", ".", ".", ".", ".", ".", ".", "."],
						["1", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: false,
			},
			{
				input: [
					[
						["1", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						["1", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: false,
			},
			{
				input: [
					[
						["5", "3", ".", ".", "7", ".", ".", ".", "."],
						["6", ".", ".", "1", "9", "5", ".", ".", "."],
						[".", "9", "8", ".", ".", ".", ".", "6", "."],
						["8", ".", ".", ".", "6", ".", ".", ".", "3"],
						["4", ".", ".", "8", ".", "3", ".", ".", "1"],
						["7", ".", ".", ".", "2", ".", ".", ".", "6"],
						[".", "6", ".", ".", ".", ".", "2", "8", "."],
						[".", ".", ".", "4", "1", "9", ".", ".", "5"],
						[".", ".", ".", ".", "8", ".", ".", "7", "9"],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", "2", "3", "4", "5", "6", "7", "8", "9"],
						["4", "5", "6", "7", "8", "9", "1", "2", "3"],
						["7", "8", "9", "1", "2", "3", "4", "5", "6"],
						["2", "3", "4", "5", "6", "7", "8", "9", "1"],
						["5", "6", "7", "8", "9", "1", "2", "3", "4"],
						["8", "9", "1", "2", "3", "4", "5", "6", "7"],
						["3", "4", "5", "6", "7", "8", "9", "1", "2"],
						["6", "7", "8", "9", "1", "2", "3", "4", "5"],
						["9", "1", "2", "3", "4", "5", "6", "7", "8"],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", "2", "3", "4", "5", "6", "7", "8", "9"],
						["4", "5", "6", "7", "8", "9", "1", "2", "3"],
						["7", "8", "9", "1", "2", "3", "4", "5", "6"],
						["2", "3", "4", "5", "6", "7", "8", "9", "1"],
						["5", "6", "7", "8", "9", "1", "2", "3", "4"],
						["8", "9", "1", "2", "3", "4", "5", "6", "7"],
						["3", "4", "5", "6", "7", "8", "9", "1", "2"],
						["6", "7", "8", "9", "1", "2", "3", "4", "5"],
						["9", "1", "2", "3", "4", "5", "6", "7", "1"],
					],
				],
				output: false,
			},
			{
				input: [
					[
						[".", ".", ".", ".", ".", ".", "5", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						["9", "3", ".", ".", "2", ".", "4", ".", "."],
						[".", ".", "7", ".", ".", ".", "3", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", "3", "4", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", "3", ".", ".", "."],
						[".", ".", ".", ".", ".", "5", "2", ".", "."],
					],
				],
				output: true,
			},
			{
				input: [
					[
						[".", ".", ".", ".", ".", ".", "5", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						["9", "3", ".", ".", "2", ".", "4", ".", "."],
						[".", ".", "7", ".", ".", ".", "3", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", "3", "4", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", "3", ".", ".", "."],
						[".", ".", ".", ".", ".", "5", "2", ".", "5"],
					],
				],
				output: false,
			},
			{
				input: [
					[
						["1", "2", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", "1", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: false,
			},
			{
				input: [
					[
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", "2", "3", ".", ".", ".", ".", ".", "."],
						["4", "5", "6", ".", ".", ".", ".", ".", "."],
						["7", "8", "9", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", "1", "2", "3", ".", ".", "."],
						[".", ".", ".", "4", "5", "6", ".", ".", "."],
						[".", ".", ".", "7", "8", "9", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", "1", "2", "3"],
						[".", ".", ".", ".", ".", ".", "4", "5", "6"],
						[".", ".", ".", ".", ".", ".", "7", "8", "9"],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", "2", "3", ".", ".", ".", ".", ".", "."],
						["4", "5", "6", ".", ".", ".", ".", ".", "."],
						["7", "8", "9", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", "1", "2", "3", ".", ".", "."],
						[".", ".", ".", "4", "5", "6", ".", ".", "."],
						[".", ".", ".", "7", "8", "9", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", "1", "2", "3"],
						[".", ".", ".", ".", ".", ".", "4", "5", "6"],
						[".", ".", ".", ".", ".", ".", "7", "8", "1"],
					],
				],
				output: false,
			},
			{
				input: [
					[
						[".", ".", "4", ".", ".", ".", "6", "3", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						["5", ".", ".", ".", ".", ".", ".", "9", "."],
						[".", ".", ".", "5", "6", ".", ".", ".", "."],
						["4", ".", "3", ".", ".", ".", ".", ".", "1"],
						[".", ".", "6", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: true,
			},
			{
				input: [
					[
						[".", ".", "4", ".", ".", ".", "6", "3", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						["5", ".", ".", ".", ".", ".", ".", "9", "."],
						[".", ".", ".", "5", "6", ".", ".", ".", "."],
						["4", ".", "3", ".", ".", ".", ".", ".", "1"],
						[".", ".", "6", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "4"],
					],
				],
				output: false,
			},
			{
				input: [
					[
						["5", "3", ".", ".", "7", ".", ".", ".", "."],
						["6", ".", ".", "1", "9", "5", ".", ".", "."],
						[".", "9", "8", ".", ".", ".", ".", "6", "."],
						["8", ".", ".", ".", "6", ".", ".", ".", "3"],
						["4", ".", ".", "8", ".", "3", ".", ".", "1"],
						["7", ".", ".", ".", "2", ".", ".", ".", "6"],
						[".", "6", ".", ".", ".", ".", "2", "8", "."],
						[".", ".", ".", "4", "1", "9", ".", ".", "5"],
						[".", ".", ".", ".", "8", ".", ".", "7", "9"],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", "2", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", "3", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", "4", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", "5", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", "6", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", "7", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", "8", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "9"],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", ".", ".", ".", ".", ".", ".", ".", "."],
						["1", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", "3", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", "4", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", "5", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", "6", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", "7", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", "8", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "9"],
					],
				],
				output: false,
			},
			{
				input: [
					[
						["1", "2", "3", "4", "5", "6", "7", "8", "9"],
						["2", "3", "4", "5", "6", "7", "8", "9", "1"],
						["3", "4", "5", "6", "7", "8", "9", "1", "2"],
						["4", "5", "6", "7", "8", "9", "1", "2", "3"],
						["5", "6", "7", "8", "9", "1", "2", "3", "4"],
						["6", "7", "8", "9", "1", "2", "3", "4", "5"],
						["7", "8", "9", "1", "2", "3", "4", "5", "6"],
						["8", "9", "1", "2", "3", "4", "5", "6", "7"],
						["9", "1", "2", "3", "4", "5", "6", "7", "8"],
					],
				],
				output: false,
			},
			{
				input: [
					[
						["1", "2", ".", "4", ".", ".", "7", "8", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", "2", ".", "4", ".", ".", "7", "8", "."],
						["1", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: false,
			},
			{
				input: [
					[
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", ".", ".", ".", ".", ".", ".", ".", "1"],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: false,
			},
			{
				input: [
					[
						["1", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", "1", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", "1", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
						[".", ".", ".", ".", ".", ".", ".", ".", "."],
					],
				],
				output: false,
			},
			{
				input: [
					[
						["5", "3", ".", ".", "7", ".", ".", ".", "."],
						["6", ".", ".", "1", "9", "5", ".", ".", "."],
						[".", "9", "8", ".", ".", ".", ".", "6", "."],
						["8", ".", ".", ".", "6", ".", ".", ".", "3"],
						["4", ".", ".", "8", ".", "3", ".", ".", "1"],
						["7", ".", ".", ".", "2", ".", ".", ".", "6"],
						[".", "6", ".", ".", ".", ".", "2", "8", "."],
						[".", ".", ".", "4", "1", "9", ".", ".", "5"],
						[".", ".", ".", ".", "8", ".", ".", "7", "9"],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", "2", "3", "4", "5", "6", "7", "8", "9"],
						["4", "5", "6", "7", "8", "9", "1", "2", "3"],
						["7", "8", "9", "1", "2", "3", "4", "5", "6"],
						["2", "1", "4", "3", "6", "5", "8", "9", "7"],
						["3", "6", "5", "8", "9", "7", "2", "1", "4"],
						["8", "9", "7", "2", "1", "4", "3", "6", "5"],
						["5", "3", "1", "6", "4", "2", "9", "7", "8"],
						["6", "4", "2", "9", "7", "8", "5", "3", "1"],
						["9", "7", "8", "5", "3", "1", "6", "4", "2"],
					],
				],
				output: true,
			},
			{
				input: [
					[
						["1", "2", "3", "4", "5", "6", "7", "8", "9"],
						["4", "5", "6", "7", "8", "9", "1", "2", "3"],
						["7", "8", "9", "1", "2", "3", "4", "5", "6"],
						["2", "1", "4", "3", "6", "5", "8", "9", "7"],
						["3", "6", "5", "8", "9", "7", "2", "1", "4"],
						["8", "9", "7", "2", "1", "4", "3", "6", "5"],
						["5", "3", "1", "6", "4", "2", "9", "7", "8"],
						["6", "4", "2", "9", "7", "8", "5", "3", "1"],
						["9", "7", "8", "5", "3", "1", "6", "4", "1"],
					],
				],
				output: false,
			},
		],
		startingCode: {
			javascript: `/**
 * @param {character[][]} board
 * @return {boolean}
 */
function isValidSudoku(board) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function isValidSudoku(board) {
  const rows = Array(9).fill(null).map(() => new Set());
  const cols = Array(9).fill(null).map(() => new Set());
  const boxes = Array(9).fill(null).map(() => new Set());
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = board[i][j];
      
      if (cell === '.') continue;
      
      const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
      
      if (rows[i].has(cell) || cols[j].has(cell) || boxes[boxIndex].has(cell)) {
        return false;
      }
      
      rows[i].add(cell);
      cols[j].add(cell);
      boxes[boxIndex].add(cell);
    }
  }
  
  return true;
}`,
		},
	},
	{
		id: "sudoku-solver",
		slug: "sudoku-solver",
		title: "Sudoku Solver",
		statementMd: `Write a program to solve a Sudoku puzzle by filling the empty cells.

A sudoku solution must satisfy **all of the following rules:**

1. Each of the digits \`1-9\` must occur exactly once in each row.
2. Each of the digits \`1-9\` must occur exactly once in each column.
3. Each of the digits \`1-9\` must occur exactly once in each of the 9 \`3x3\` sub-boxes of the grid.

The \`'.'\` character indicates empty cells.

#### Example 1:
> **Input:** \`board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."],[".","9","8",".",".",".",".","6","."],["8",".",".",".","6",".",".",".","3"],["4",".",".","8",".","3",".",".","1"],["7",".",".",".","2",".",".",".","6"],[".","6",".",".",".",".","2","8","."],[".",".",".","4","1","9",".",".","5"],[".",".",".",".","8",".",".","7","9"]]\`
> **Output:** \`[["5","3","4","6","7","8","9","1","2"],["6","7","2","1","9","5","3","4","8"],["1","9","8","3","4","2","5","6","7"],["8","5","9","7","6","1","4","2","3"],["4","2","6","8","5","3","7","9","1"],["7","1","3","9","2","4","8","5","6"],["9","6","1","5","3","7","2","8","4"],["2","8","7","4","1","9","6","3","5"],["3","4","5","2","8","6","1","7","9"]]\`

#### Constraints:
- \`board.length == 9\`
- \`board[i].length == 9\`
- \`board[i][j]\` is a digit \`'1'-'9'\` or \`'.'\`.
- It is **guaranteed** that the input board has only one solution.`,
		topics: ["arrays", "backtracking"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 37,
		rubric: {
			optimal_time: "O(9^m)",
			acceptable_time: ["O(9^m)"],
		},
		parameterNames: ["board"],
		tests: [
			{
				input: [
					[
						["5", "3", ".", ".", "7", ".", ".", ".", "."],
						["6", ".", ".", "1", "9", "5", ".", ".", "."],
						[".", "9", "8", ".", ".", ".", ".", "6", "."],
						["8", ".", ".", ".", "6", ".", ".", ".", "3"],
						["4", ".", ".", "8", ".", "3", ".", ".", "1"],
						["7", ".", ".", ".", "2", ".", ".", ".", "6"],
						[".", "6", ".", ".", ".", ".", "2", "8", "."],
						[".", ".", ".", "4", "1", "9", ".", ".", "5"],
						[".", ".", ".", ".", "8", ".", ".", "7", "9"],
					],
				],
				output: [
					["5", "3", "4", "6", "7", "8", "9", "1", "2"],
					["6", "7", "2", "1", "9", "5", "3", "4", "8"],
					["1", "9", "8", "3", "4", "2", "5", "6", "7"],
					["8", "5", "9", "7", "6", "1", "4", "2", "3"],
					["4", "2", "6", "8", "5", "3", "7", "9", "1"],
					["7", "1", "3", "9", "2", "4", "8", "5", "6"],
					["9", "6", "1", "5", "3", "7", "2", "8", "4"],
					["2", "8", "7", "4", "1", "9", "6", "3", "5"],
					["3", "4", "5", "2", "8", "6", "1", "7", "9"],
				],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {character[][]} board
 * @return {void} Do not return anything, modify board in-place instead.
 */
function solveSudoku(board) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function solveSudoku(board) {
  function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) {
        return false;
      }
      const boxRow = Math.floor(row / 3) * 3 + Math.floor(i / 3);
      const boxCol = Math.floor(col / 3) * 3 + (i % 3);
      if (board[boxRow][boxCol] === num) {
        return false;
      }
    }
    return true;
  }
  
  function solve(board) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === '.') {
          for (let num = 1; num <= 9; num++) {
            const char = String(num);
            if (isValid(board, i, j, char)) {
              board[i][j] = char;
              if (solve(board)) {
                return true;
              }
              board[i][j] = '.';
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  
  solve(board);
}`,
		},
	},
	{
		id: "count-and-say",
		slug: "count-and-say",
		title: "Count and Say",
		statementMd: `The **count-and-say** sequence is a sequence of digit strings defined by the recursive formula:

- \`countAndSay(1) = "1"\`
- \`countAndSay(n)\` is the way you would "say" the digit string from \`countAndSay(n - 1)\`, which is then converted into a different digit string.

To determine how you "say" a digit string, split it into the **minimal** number of substrings such that each substring contains exactly **one unique digit**. Then for each substring, say the number of digits, then say the digit. Then concatenate every said digit.

For example, the saying and conversion for digit string \`"3322251"\`:

Given a positive integer \`n\`, return the \`n^th^\` term of the **count-and-say** sequence.

#### Example 1:
> **Input:** \`n = 1\`
> **Output:** \`"1"\`
> **Explanation:** This is the base case.

#### Example 2:
> **Input:** \`n = 4\`
> **Output:** \`"1211"\`
> **Explanation:**
> countAndSay(1) = "1"
> countAndSay(2) = say "1" = one 1 = "11"
> countAndSay(3) = say "11" = two 1's = "21"
> countAndSay(4) = say "21" = one 2 + one 1 = "12" + "11" = "1211"

#### Constraints:
- 1 <= n <= 30`,
		topics: ["strings", "recursion"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 38,
		rubric: {
			optimal_time: "O(2^n)",
			acceptable_time: ["O(2^n)"],
		},
		parameterNames: ["n"],
		tests: [
			{ input: [1], output: "1" },
			{ input: [2], output: "11" },
			{ input: [3], output: "21" },
			{ input: [4], output: "1211" },
			{ input: [5], output: "111221" },
			{ input: [6], output: "312211" },
			{ input: [7], output: "13112221" },
			{ input: [8], output: "1113213211" },
			{ input: [9], output: "31131211131221" },
			{ input: [10], output: "13211311123113112211" },
			{ input: [11], output: "11131221133112132113212221" },
			{ input: [12], output: "3113112221232112111312211312113211" },
			{
				input: [13],
				output: "1321132132111213122112311311222113111221131221",
			},
			{
				input: [14],
				output: "111312211312111312311211131122211213211321322112312211311222113111221131221",
			},
			{
				input: [15],
				output: "311311222113111231131112132112311321322112111312211312111322212311322113212221",
			},
			{
				input: [16],
				output: "132113213221133112132113311211131221121321131211132221123113112221131112311332111213211322211312113211",
			},
			{
				input: [17],
				output: "11131221131211132221232112111312212321123113112221121113122113111231133221121321132132211331121321231231121113122113322113111221131221",
			},
			{
				input: [18],
				output: "3113112221131112311332111213122112311311123112111331121113122112132113121113222112311311222113111221131221",
			},
			{
				input: [19],
				output: "1321132132211331121321133112111312211213211312111322211231131122211311123113322112111312211312111322211312113211",
			},
			{
				input: [20],
				output: "11131221131211132221232112111312111213111213211231132132211211131221131211221321123113213221123113112221131112311332211211131221131211132211121312211231131112311211232221121321132132211331121321231231121113112221121321133112132112312321123113112221121113122113121113123112112322111213211322211312113211",
			},
			{
				input: [21],
				output: "3113112221131112311332111213122112311311123112111331121113122112132113121113222112311311222113111221131221",
			},
			{
				input: [22],
				output: "1321132132211331121321133112111312211213211312111322211231131122211311123113322112111312211312111322211312113211",
			},
			{
				input: [23],
				output: "11131221131211132221232112111312111213111213211231132132211211131221131211221321123113213221123113112221131112311332211211131221131211132211121312211231131112311211232221121321132132211331121321231231121113112221121321133112132112312321123113112221121113122113121113123112112322111213211322211312113211",
			},
			{
				input: [24],
				output: "3113112221131112311332111213122112311311123112111331121113122112132113121113222112311311222113111221131221",
			},
			{
				input: [25],
				output: "1321132132211331121321133112111312211213211312111322211231131122211311123113322112111312211312111322211312113211",
			},
			{
				input: [26],
				output: "11131221131211132221232112111312111213111213211231132132211211131221131211221321123113213221123113112221131112311332211211131221131211132211121312211231131112311211232221121321132132211331121321231231121113112221121321133112132112312321123113112221121113122113121113123112112322111213211322211312113211",
			},
			{
				input: [27],
				output: "3113112221131112311332111213122112311311123112111331121113122112132113121113222112311311222113111221131221",
			},
			{
				input: [28],
				output: "1321132132211331121321133112111312211213211312111322211231131122211311123113322112111312211312111322211312113211",
			},
			{
				input: [29],
				output: "11131221131211132221232112111312111213111213211231132132211211131221131211221321123113213221123113112221131112311332211211131221131211132211121312211231131112311211232221121321132132211331121321231231121113112221121321133112132112312321123113112221121113122113121113123112112322111213211322211312113211",
			},
			{
				input: [30],
				output: "3113112221131112311332111213122112311311123112111331121113122112132113121113222112311311222113111221131221",
			},
			{
				input: [31],
				output: "1321132132211331121321133112111312211213211312111322211231131122211311123113322112111312211312111322211312113211",
			},
			{
				input: [32],
				output: "11131221131211132221232112111312111213111213211231132132211211131221131211221321123113213221123113112221131112311332211211131221131211132211121312211231131112311211232221121321132132211331121321231231121113112221121321133112132112312321123113112221121113122113121113123112112322111213211322211312113211",
			},
			{
				input: [33],
				output: "3113112221131112311332111213122112311311123112111331121113122112132113121113222112311311222113111221131221",
			},
			{
				input: [34],
				output: "1321132132211331121321133112111312211213211312111322211231131122211311123113322112111312211312111322211312113211",
			},
			{
				input: [35],
				output: "11131221131211132221232112111312111213111213211231132132211211131221131211221321123113213221123113112221131112311332211211131221131211132211121312211231131112311211232221121321132132211331121321231231121113112221121321133112132112312321123113112221121113122113121113123112112322111213211322211312113211",
			},
			{
				input: [36],
				output: "3113112221131112311332111213122112311311123112111331121113122112132113121113222112311311222113111221131221",
			},
			{
				input: [37],
				output: "1321132132211331121321133112111312211213211312111322211231131122211311123113322112111312211312111322211312113211",
			},
			{
				input: [38],
				output: "11131221131211132221232112111312111213111213211231132132211211131221131211221321123113213221123113112221131112311332211211131221131211132211121312211231131112311211232221121321132132211331121321231231121113112221121321133112132112312321123113112221121113122113121113123112112322111213211322211312113211",
			},
			{
				input: [39],
				output: "3113112221131112311332111213122112311311123112111331121113122112132113121113222112311311222113111221131221",
			},
			{
				input: [40],
				output: "1321132132211331121321133112111312211213211312111322211231131122211311123113322112111312211312111322211312113211",
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number} n
 * @return {string}
 */
function countAndSay(n) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function countAndSay(n) {
  if (n === 1) return "1";
  
  const prev = countAndSay(n - 1);
  let result = "";
  let count = 1;
  
  for (let i = 0; i < prev.length; i++) {
    if (i < prev.length - 1 && prev[i] === prev[i + 1]) {
      count++;
    } else {
      result += count + prev[i];
      count = 1;
    }
  }
  
  return result;
}`,
		},
	},
	{
		id: "combination-sum",
		slug: "combination-sum",
		title: "Combination Sum",
		statementMd: `Given an array of **distinct** integers \`candidates\` and a target integer \`target\`, return a list of all **unique combinations** of \`candidates\` where the chosen numbers sum to \`target\`. You may return the combinations in **any order**.

The **same** number may be chosen from \`candidates\` an **unlimited number of times**. Two combinations are unique if the frequency of at least one of the chosen numbers is different.

The test cases are generated such that the number of unique combinations that sum up to \`target\` is less than \`150\` combinations for the given input.

#### Example 1:
> **Input:** \`candidates = [2,3,6,7]\`, \`target = 7\`
> **Output:** \`[[2,2,3],[7]]\`
> **Explanation:**
> 2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times.
> 7 is a candidate, and 7 = 7.
> These are the only two combinations.

#### Example 2:
> **Input:** \`candidates = [2,3,5]\`, \`target = 8\`
> **Output:** \`[[2,2,2,2],[2,3,3],[3,5]]\`

#### Example 3:
> **Input:** \`candidates = [2]\`, \`target = 1\`
> **Output:** \`[]\`

#### Constraints:
- 1 <= candidates.length <= 30
- 2 <= candidates[i] <= 40
- All elements of \`candidates\` are **distinct**.
- 1 <= target <= 40`,
		topics: ["arrays", "backtracking"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 39,
		rubric: {
			optimal_time: "O(2^n)",
			acceptable_time: ["O(2^n)"],
		},
		parameterNames: ["candidates", "target"],
		tests: [
			{ input: [[2, 3, 6, 7], 7], output: [[2, 2, 3], [7]] },
			{
				input: [[2, 3, 5], 8],
				output: [
					[2, 2, 2, 2],
					[2, 3, 3],
					[3, 5],
				],
			},
			{ input: [[2], 1], output: [] },
			{ input: [[2, 3, 5], 1], output: [] },
			{ input: [[2], 2], output: [[2]] },
			{
				input: [[2, 3], 5],
				output: [[2, 3]],
			},
			{ input: [[2, 4, 6], 6], output: [[2, 2, 2], [2, 4], [6]] },
			{ input: [[3, 5], 8], output: [[3, 5]] },
			{
				input: [[2, 3, 5], 7],
				output: [
					[2, 2, 3],
					[2, 5],
				],
			},
			{
				input: [[2, 3, 7], 18],
				output: [
					[2, 2, 2, 2, 2, 2, 2, 2, 2],
					[2, 2, 2, 2, 2, 2, 3, 3],
					[2, 2, 2, 2, 3, 7],
					[2, 2, 3, 3, 3],
					[2, 2, 7, 7],
					[2, 3, 3, 3, 7],
					[3, 3, 3, 3, 3, 3],
					[3, 7, 7],
				],
			},
			{ input: [[2], 4], output: [[2, 2]] },
			{ input: [[2], 6], output: [[2, 2, 2]] },
			{
				input: [[3, 6, 7], 9],
				output: [
					[3, 3, 3],
					[3, 6],
				],
			},
			{
				input: [[2, 5], 10],
				output: [
					[2, 2, 2, 2, 2],
					[5, 5],
				],
			},
			{
				input: [[2, 3, 4], 9],
				output: [
					[2, 2, 2, 3],
					[2, 3, 4],
					[3, 3, 3],
				],
			},
			{
				input: [[5, 10, 15], 20],
				output: [
					[5, 5, 5, 5],
					[5, 15],
					[10, 10],
				],
			},
			{
				input: [[2, 4], 8],
				output: [
					[2, 2, 2, 2],
					[2, 2, 4],
					[4, 4],
				],
			},
			{
				input: [[3, 4, 5], 12],
				output: [
					[3, 3, 3, 3],
					[3, 4, 5],
					[4, 4, 4],
				],
			},
			{
				input: [[2, 3, 7], 12],
				output: [
					[2, 2, 2, 2, 2, 2],
					[2, 2, 2, 3, 3],
					[2, 3, 7],
					[3, 3, 3, 3],
				],
			},
			{ input: [[7], 7], output: [[7]] },
			{ input: [[7], 14], output: [[7, 7]] },
			{ input: [[2, 7, 11], 13], output: [[2, 11]] },
			{
				input: [[2, 3, 5, 7], 14],
				output: [
					[2, 2, 2, 2, 2, 2, 2],
					[2, 2, 2, 2, 3, 3],
					[2, 2, 2, 3, 5],
					[2, 5, 7],
					[3, 3, 3, 5],
					[7, 7],
				],
			},
			{
				input: [[2, 4, 8], 16],
				output: [
					[2, 2, 2, 2, 2, 2, 2, 2],
					[2, 2, 2, 2, 2, 4],
					[2, 2, 2, 2, 8],
					[2, 2, 4, 4],
					[2, 4, 4, 4],
					[4, 4, 4, 4],
					[4, 4, 8],
					[8, 8],
				],
			},
			{
				input: [[3, 6, 9], 12],
				output: [
					[3, 3, 3, 3],
					[3, 9],
					[6, 6],
				],
			},
			{
				input: [[2, 5, 10], 15],
				output: [
					[2, 2, 2, 2, 2, 5],
					[5, 5, 5],
					[5, 10],
				],
			},
			{
				input: [[4, 5, 6], 13],
				output: [[4, 4, 5]],
			},
			{
				input: [[2, 3, 6], 11],
				output: [
					[2, 2, 2, 2, 3],
					[2, 3, 6],
					[3, 3, 3],
				],
			},
			{
				input: [[2, 3, 5, 8], 10],
				output: [
					[2, 2, 2, 2, 2],
					[2, 2, 3, 3],
					[2, 3, 5],
					[2, 8],
					[5, 5],
				],
			},
			{
				input: [[3, 4, 5, 6], 10],
				output: [
					[3, 3, 4],
					[4, 6],
					[5, 5],
				],
			},
			{
				input: [[2, 6, 7], 15],
				output: [
					[2, 2, 2, 2, 7],
					[2, 6, 7],
				],
			},
			{
				input: [[3, 5, 7, 9], 16],
				output: [
					[3, 3, 3, 7],
					[7, 9],
				],
			},
			{
				input: [[2, 4, 6, 8], 18],
				output: [
					[2, 2, 2, 2, 2, 2, 2, 2, 2],
					[2, 2, 2, 2, 2, 4, 4],
					[2, 2, 2, 2, 4, 6],
					[2, 2, 2, 4, 4, 4],
					[2, 2, 2, 6, 6],
					[2, 2, 4, 4, 6],
					[2, 4, 4, 4, 4],
					[2, 4, 4, 8],
					[2, 4, 6, 6],
					[2, 8, 8],
					[4, 4, 4, 6],
					[4, 6, 8],
					[6, 6, 6],
				],
			},
			{
				input: [[1, 2, 3], 4],
				output: [
					[1, 1, 1, 1],
					[1, 1, 2],
					[1, 3],
					[2, 2],
				],
			},
			{
				input: [[1, 2, 3], 5],
				output: [
					[1, 1, 1, 1, 1],
					[1, 1, 1, 2],
					[1, 1, 3],
					[1, 2, 2],
					[2, 3],
				],
			},
			{
				input: [[1, 2, 3], 6],
				output: [
					[1, 1, 1, 1, 1, 1],
					[1, 1, 1, 1, 2],
					[1, 1, 1, 3],
					[1, 1, 2, 2],
					[1, 2, 3],
					[2, 2, 2],
					[3, 3],
				],
			},
			{ input: [[1], 1], output: [[1]] },
			{ input: [[1], 2], output: [[1, 1]] },
			{ input: [[1], 3], output: [[1, 1, 1]] },
			{
				input: [[2, 3], 6],
				output: [
					[2, 2, 2],
					[3, 3],
				],
			},
			{ input: [[2, 3], 7], output: [[2, 2, 3]] },
			{
				input: [[2, 3, 4], 8],
				output: [
					[2, 2, 2, 2],
					[2, 2, 4],
					[2, 3, 3],
					[4, 4],
				],
			},
			{
				input: [[2, 3, 4], 9],
				output: [
					[2, 2, 2, 3],
					[2, 3, 4],
					[3, 3, 3],
				],
			},
			{
				input: [[3, 4, 5], 9],
				output: [
					[3, 3, 3],
					[4, 5],
				],
			},
			{
				input: [[3, 4, 5], 10],
				output: [
					[3, 3, 4],
					[5, 5],
				],
			},
			{
				input: [[2, 5, 7], 14],
				output: [
					[2, 2, 2, 2, 2, 2, 2],
					[2, 2, 5, 5],
					[2, 5, 7],
					[7, 7],
				],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
function combinationSum(candidates, target) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function combinationSum(candidates, target) {
  const result = [];
  
  function backtrack(start, current, remaining) {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    
    if (remaining < 0) {
      return;
    }
    
    for (let i = start; i < candidates.length; i++) {
      current.push(candidates[i]);
      backtrack(i, current, remaining - candidates[i]);
      current.pop();
    }
  }
  
  backtrack(0, [], target);
  return result;
}`,
		},
	},
	{
		id: "combination-sum-ii",
		slug: "combination-sum-ii",
		title: "Combination Sum II",
		statementMd: `Given a collection of candidate numbers (\`candidates\`) and a target number (\`target\`), find all unique combinations in \`candidates\` where the candidate numbers sum to \`target\`.

Each number in \`candidates\` may only be used **once** in the combination.

**Note:** The solution set must not contain duplicate combinations.

#### Example 1:
> **Input:** \`candidates = [10,1,2,7,6,1,5]\`, \`target = 8\`
> **Output:** \`[[1,1,6],[1,2,5],[1,7],[2,6]]\`

#### Example 2:
> **Input:** \`candidates = [2,5,2,1,2]\`, \`target = 5\`
> **Output:** \`[[1,2,2],[5]]\`

#### Constraints:
- 1 <= candidates.length <= 100
- 1 <= candidates[i] <= 50
- 1 <= target <= 30`,
		topics: ["arrays", "backtracking"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 40,
		rubric: {
			optimal_time: "O(2^n)",
			acceptable_time: ["O(2^n)"],
		},
		parameterNames: ["candidates", "target"],
		tests: [
			{
				input: [[10, 1, 2, 7, 6, 1, 5], 8],
				output: [
					[1, 1, 6],
					[1, 2, 5],
					[1, 7],
					[2, 6],
				],
			},
			{ input: [[2, 5, 2, 1, 2], 5], output: [[1, 2, 2], [5]] },
			{ input: [[1, 1, 1, 1], 4], output: [[1, 1, 1, 1]] },
			{ input: [[1, 1, 1, 1], 2], output: [[1, 1]] },
			{
				input: [[1, 1, 2, 5, 6, 7, 10], 8],
				output: [
					[1, 1, 6],
					[1, 2, 5],
					[1, 7],
					[2, 6],
				],
			},
			{ input: [[2, 3, 5], 8], output: [[3, 5]] },
			{ input: [[2, 3, 6, 7], 7], output: [[7]] },
			{ input: [[1, 2], 3], output: [[1, 2]] },
			{ input: [[1, 2], 4], output: [] },
			{ input: [[1], 1], output: [[1]] },
			{ input: [[1], 2], output: [] },
			{ input: [[2, 3, 4], 7], output: [[3, 4]] },
			{
				input: [[1, 1, 2, 3], 4],
				output: [
					[1, 1, 2],
					[1, 3],
				],
			},
			{
				input: [[1, 1, 2, 3], 5],
				output: [
					[1, 1, 3],
					[2, 3],
				],
			},
			{
				input: [[1, 2, 3, 4], 6],
				output: [
					[1, 2, 3],
					[2, 4],
				],
			},
			{
				input: [[1, 2, 3, 4], 7],
				output: [
					[1, 2, 4],
					[3, 4],
				],
			},
			{
				input: [[1, 2, 3, 4, 5], 8],
				output: [
					[1, 2, 5],
					[1, 3, 4],
					[3, 5],
				],
			},
			{
				input: [[2, 2, 3, 5], 7],
				output: [
					[2, 2, 3],
					[2, 5],
				],
			},
			{ input: [[2, 2, 3, 5], 8], output: [[3, 5]] },
			{
				input: [[3, 3, 4, 5], 9],
				output: [[4, 5]],
			},
			{
				input: [[1, 1, 1, 2, 3], 5],
				output: [
					[1, 1, 3],
					[2, 3],
				],
			},
			{
				input: [[1, 1, 1, 1, 2], 5],
				output: [[1, 1, 1, 2]],
			},
			{
				input: [[1, 2, 3, 4, 5], 10],
				output: [
					[1, 2, 3, 4],
					[1, 4, 5],
					[2, 3, 5],
				],
			},
			{
				input: [[4, 4, 2, 1, 4, 2, 2, 1, 3], 6],
				output: [
					[1, 1, 2, 2],
					[1, 2, 3],
					[2, 2, 2],
					[2, 4],
				],
			},
			{
				input: [[1, 1, 2, 5, 6, 7, 10], 8],
				output: [
					[1, 1, 6],
					[1, 2, 5],
					[1, 7],
					[2, 6],
				],
			},
			{
				input: [[1, 1, 1, 2, 2, 3], 6],
				output: [
					[1, 1, 1, 3],
					[1, 1, 2, 2],
					[1, 2, 3],
				],
			},
			{ input: [[5, 5, 5], 15], output: [[5, 5, 5]] },
			{ input: [[5, 5, 5], 10], output: [[5, 5]] },
			{ input: [[5, 5, 5], 5], output: [[5]] },
			{
				input: [[1, 2, 2, 3, 4, 5], 8],
				output: [
					[1, 2, 5],
					[1, 3, 4],
					[2, 2, 4],
					[3, 5],
				],
			},
			{
				input: [[1, 2, 2, 3, 4, 5], 9],
				output: [
					[1, 2, 2, 4],
					[1, 3, 5],
					[2, 2, 5],
					[2, 3, 4],
					[4, 5],
				],
			},
			{
				input: [[1, 1, 2, 2, 3, 3], 6],
				output: [
					[1, 1, 2, 2],
					[1, 2, 3],
					[3, 3],
				],
			},
			{
				input: [[1, 1, 2, 2, 3, 3], 7],
				output: [
					[1, 1, 2, 3],
					[1, 3, 3],
					[2, 2, 3],
				],
			},
			{ input: [[2, 3, 5, 7], 9], output: [[2, 7]] },
			{
				input: [[2, 3, 5, 7], 10],
				output: [
					[3, 7],
					[2, 3, 5],
				],
			},
			{
				input: [[2, 3, 5, 7], 12],
				output: [
					[2, 3, 7],
					[5, 7],
				],
			},
			{
				input: [[1, 3, 5, 7], 9],
				output: [[1, 3, 5]],
			},
			{
				input: [[1, 3, 5, 7], 10],
				output: [[3, 7]],
			},
			{
				input: [[1, 1, 1, 3, 5], 6],
				output: [[1, 5]],
			},
			{
				input: [[4, 1, 1, 4, 4, 4], 10],
				output: [[1, 1, 4, 4]],
			},
			{ input: [[1, 1, 1, 1, 1], 3], output: [[1, 1, 1]] },
			{ input: [[1, 1, 1, 1, 1], 5], output: [[1, 1, 1, 1, 1]] },
			{
				input: [[1, 2, 3, 4, 5, 6], 10],
				output: [
					[1, 2, 3, 4],
					[1, 3, 6],
					[1, 4, 5],
					[2, 3, 5],
					[4, 6],
				],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
function combinationSum2(candidates, target) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function combinationSum2(candidates, target) {
  const result = [];
  candidates.sort((a, b) => a - b);
  
  function backtrack(start, current, remaining) {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    
    if (remaining < 0) {
      return;
    }
    
    for (let i = start; i < candidates.length; i++) {
      if (i > start && candidates[i] === candidates[i - 1]) {
        continue; // Skip duplicates
      }
      
      current.push(candidates[i]);
      backtrack(i + 1, current, remaining - candidates[i]);
      current.pop();
    }
  }
  
  backtrack(0, [], target);
  return result;
}`,
		},
	},
];
