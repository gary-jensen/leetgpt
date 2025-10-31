import { AlgoProblemDetail } from "@/types/algorithm-types";

export const algoProblems1to10: AlgoProblemDetail[] = [
	{
		id: "two-sum",
		slug: "two-sum",
		title: "Two Sum",
		statementMd: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

#### Example 1:
> **Input:** \`nums = [2,7,11,15]\`, \`target = 9\`
> **Output:** \`[0,1]\`
> **Explanation:** Because \`nums[0] + nums[1] == 9\`, we return \`[0, 1]\`.

#### Example 2:
> **Input:** \`nums = [3,2,4]\`, \`target = 6\`
> **Output:** \`[1,2]\`

#### Example 3:
> **Input:** \`nums = [3,3]\`, \`target = 6\`
> **Output:** \`[0,1]\`

#### Constraints:
- 2 <= nums.length <= 10^4^
- -10^9^ <= nums[i] <= 10^9^
- -10^9^ <= target <= 10^9^
- **Only one valid answer exists.**`,
		topics: ["arrays", "hashmap"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 1,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n log n)"],
		},
		parameterNames: ["nums", "target"],
		tests: [
			{ input: [[2, 7, 11, 15], 9], output: [0, 1] },
			{ input: [[3, 2, 4], 6], output: [1, 2] },
			{ input: [[3, 3], 6], output: [0, 1] },
			{ input: [[1, 2, 3, 4, 5], 8], output: [2, 4] },
			{ input: [[-1, -2, -3, -4, -5], -8], output: [2, 4] },
			{ input: [[0, 4, 3, 0], 0], output: [0, 3] },
			{ input: [[-3, 4, 3, 90], 0], output: [0, 2] },
			{ input: [[5, 75, 25], 100], output: [1, 2] },
			{ input: [[2, 5, 5, 11], 10], output: [1, 2] },
			{ input: [[1, 5, 9, 14], 10], output: [0, 2] },
			{ input: [[8, 7, 2, 15], 9], output: [1, 2] },
			{ input: [[1, 3, 4, 2], 6], output: [2, 3] },
			{ input: [[10, 26, 30, 31, 47, 60], 40], output: [0, 2] },
			{ input: [[0, 1, 2, 3, 4, 5], 9], output: [4, 5] },
			{ input: [[1000000, 999999, 2, 3], 1999999], output: [0, 1] },
			{ input: [[-5, -10, 5, 20], 10], output: [1, 3] },
			{
				input: [[1000000, 2, 3, 7, 11, 13, 17, 19], 1000019],
				output: [0, 7],
			},
			{ input: [[0, 1, 2, 4, 8, 16], 17], output: [1, 5] },
			{
				input: [[-93, -77, -45, -41, 29, 54, -94, 43], 13],
				output: [3, 5],
			},
			{
				input: [[66, 79, 39, 7, -44, 14, 50, -29, -99], 89],
				output: [2, 6],
			},
			{
				input: [[54, -33, -89, 86, 17, 37, -69, -4, -80, 41], 54],
				output: [4, 5],
			},
			{ input: [[47, -51, 80, -83, -89, 69], 29], output: [1, 2] },
			{ input: [[-59, -6, -10, -47, 71, -32, 79], 47], output: [5, 6] },
			{
				input: [[-82, 55, 62, -57, 36, 86, -38, -59], -116],
				output: [3, 7],
			},
			{
				input: [[-31, 63, 76, 42, -44, 75, -17, 96, 98], 11],
				output: [0, 3],
			},
			{
				input: [[-92, -20, 2, -32, -84, -46, 45, 83, 67, 27], 128],
				output: [6, 7],
			},
			{ input: [[-64, -33, -65, -37, 90, 43], 25], output: [2, 4] },
			{ input: [[91, 49, 9, 2, -8, -44, -65], -6], output: [3, 4] },
			{
				input: [[-77, 93, -88, -72, -61, 60, -60, 74], -121],
				output: [4, 6],
			},
			{
				input: [[-84, -2, -3, 52, 19, 35, -36, 41, -98], 17],
				output: [1, 4],
			},
			{
				input: [[96, 64, -13, -72, -25, 11, -60, 16, -100, 84], -125],
				output: [4, 8],
			},
			{ input: [[95, -55, 29, -73, 60, -24], 36], output: [4, 5] },
			{ input: [[55, -50, -61, -5, 95, -59, 38], 133], output: [4, 6] },
			{
				input: [[-100, 53, -18, 25, -96, -72, -8, -22], -75],
				output: [0, 3],
			},
			{
				input: [[-39, 45, -80, -79, 87, 24, -83, 94, 36], -44],
				output: [2, 8],
			},
			{
				input: [[68, 21, 40, -58, -33, 35, 55, 8, -46, 38], -91],
				output: [3, 4],
			},
			{
				input: [
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
					29,
				],
				output: [14, 15],
			},
			{ input: [[-1, -2, -3, -4, -5], -6], output: [1, 4] },
			{ input: [[100, 200, 300, 400], 500], output: [1, 2] },
			{
				input: [
					[
						1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
						1, 2,
					],
					3,
				],
				output: [0, 20],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function twoSum(nums, target) {
  const numMap = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (numMap.has(complement)) {
      return [numMap.get(complement), i];
    }
    
    numMap.set(nums[i], i);
  }
  
  return [];
}`,
		},
	},
	{
		id: "add-two-numbers",
		slug: "add-two-numbers",
		title: "Add Two Numbers",
		statementMd: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

**Note:** Linked lists are represented as arrays in test cases. For example, \`[2,4,3]\` represents the number 342.

#### Example 1:
> **Input:** \`l1 = [2,4,3]\`, \`l2 = [5,6,4]\`
> **Output:** \`[7,0,8]\`
> **Explanation:** 342 + 465 = 807.

#### Example 2:
> **Input:** \`l1 = [0]\`, \`l2 = [0]\`
> **Output:** \`[0]\`

#### Example 3:
> **Input:** \`l1 = [9,9,9,9,9,9,9]\`, \`l2 = [9,9,9,9]\`
> **Output:** \`[8,9,9,9,0,0,0,1]\`

#### Constraints:
- The number of nodes in each linked list is in the range [1, 100].
- 0 <= Node.val <= 9
- It is guaranteed that the list represents a number that does not have leading zeros.`,
		topics: ["linked-list", "math", "recursion"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 2,
		rubric: {
			optimal_time: "O(max(m,n))",
			acceptable_time: ["O(max(m,n))"],
		},
		parameterNames: ["l1", "l2"],
		tests: [
			{
				input: [
					[2, 4, 3],
					[5, 6, 4],
				],
				output: [7, 0, 8],
			},
			{ input: [[0], [0]], output: [0] },
			{
				input: [
					[9, 9, 9, 9, 9, 9, 9],
					[9, 9, 9, 9],
				],
				output: [8, 9, 9, 9, 0, 0, 0, 1],
			},
			{
				input: [
					[2, 4],
					[5, 6, 4],
				],
				output: [7, 0, 5],
			},
			{
				input: [
					[5, 6, 4],
					[2, 4],
				],
				output: [7, 0, 5],
			},
			{ input: [[1], [9, 9]], output: [0, 0, 1] },
			{ input: [[1, 8], [0]], output: [1, 8] },
			{ input: [[0], [1, 8]], output: [1, 8] },
			{ input: [[9, 9], [1]], output: [0, 0, 1] },
			{ input: [[1], [9, 9, 9]], output: [0, 0, 0, 1] },
			{
				input: [
					[3, 4, 2],
					[4, 6, 5],
				],
				output: [7, 0, 8],
			},
			{
				input: [
					[7, 1, 6],
					[5, 9, 2],
				],
				output: [2, 1, 9],
			},
			{
				input: [
					[1, 2, 3],
					[4, 5, 6],
				],
				output: [5, 7, 9],
			},
			{ input: [[9], [9]], output: [8, 1] },
			{ input: [[5], [5]], output: [0, 1] },
			{ input: [[8], [8]], output: [6, 1] },
			{ input: [[1, 0, 0], [1]], output: [2, 0, 0] },
			{
				input: [
					[9, 9],
					[9, 9],
				],
				output: [8, 9, 1],
			},
			{
				input: [
					[1, 2, 3, 4],
					[5, 6, 7],
				],
				output: [6, 8, 0, 5],
			},
			{
				input: [
					[5, 6, 7],
					[1, 2, 3, 4],
				],
				output: [6, 8, 0, 5],
			},
			{
				input: [
					[2, 5, 3],
					[5, 4, 2],
				],
				output: [7, 9, 5],
			},
			{
				input: [
					[7, 2],
					[3, 4, 5],
				],
				output: [0, 7, 5],
			},
			{
				input: [
					[3, 4, 5],
					[7, 2],
				],
				output: [0, 7, 5],
			},
			{
				input: [
					[9, 8, 7],
					[1, 2, 3],
				],
				output: [0, 1, 1, 1],
			},
			{
				input: [
					[1, 1, 1],
					[9, 9, 9],
				],
				output: [0, 1, 1, 1],
			},
			{
				input: [
					[6, 7, 8],
					[4, 5, 6],
				],
				output: [0, 3, 4, 1],
			},
			{
				input: [
					[1, 2, 3, 4, 5],
					[5, 4, 3, 2, 1],
				],
				output: [6, 6, 6, 6, 6],
			},
			{
				input: [
					[9, 9, 9],
					[9, 9, 9, 9, 9],
				],
				output: [8, 9, 9, 0, 0, 1],
			},
			{ input: [[7, 8, 9], [1]], output: [8, 8, 9] },
			{ input: [[1], [7, 8, 9]], output: [8, 8, 9] },
			{
				input: [
					[4, 5, 6, 7],
					[8, 9],
				],
				output: [2, 5, 7, 7],
			},
			{
				input: [
					[8, 9],
					[4, 5, 6, 7],
				],
				output: [2, 5, 7, 7],
			},
			{
				input: [
					[2, 3, 4],
					[7, 8, 9, 1, 2],
				],
				output: [9, 1, 4, 2, 2],
			},
			{
				input: [
					[7, 8, 9, 1, 2],
					[2, 3, 4],
				],
				output: [9, 1, 4, 2, 2],
			},
			{
				input: [
					[1, 2, 3, 4, 5, 6],
					[6, 5, 4, 3, 2, 1],
				],
				output: [7, 7, 7, 7, 7, 7],
			},
			{ input: [[9, 9, 9, 9], [1]], output: [0, 0, 0, 0, 1] },
			{ input: [[1], [9, 9, 9, 9]], output: [0, 0, 0, 0, 1] },
			{
				input: [
					[5, 4, 3, 2, 1],
					[1, 2, 3, 4, 5],
				],
				output: [6, 6, 6, 6, 6],
			},
			{
				input: [
					[8, 7, 6],
					[2, 3, 4],
				],
				output: [0, 1, 1, 1],
			},
			{
				input: [
					[2, 3, 4],
					[8, 7, 6],
				],
				output: [0, 1, 1, 1],
			},
			{
				input: [
					[1, 0, 0, 0, 0],
					[9, 9, 9],
				],
				output: [0, 0, 0, 0, 1],
			},
			{
				input: [
					[9, 9, 9],
					[1, 0, 0, 0, 0],
				],
				output: [0, 0, 0, 0, 1],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} l1
 * @param {number[]} l2
 * @return {number[]}
 */
function addTwoNumbers(l1, l2) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function addTwoNumbers(l1, l2) {
  const result = [];
  let carry = 0;
  let i = 0;
  
  while (i < l1.length || i < l2.length || carry) {
    const val1 = i < l1.length ? l1[i] : 0;
    const val2 = i < l2.length ? l2[i] : 0;
    const sum = val1 + val2 + carry;
    
    result.push(sum % 10);
    carry = Math.floor(sum / 10);
    i++;
  }
  
  return result;
}`,
		},
	},
	{
		id: "longest-substring-without-repeating-characters",
		slug: "longest-substring-without-repeating-characters",
		title: "Longest Substring Without Repeating Characters",
		statementMd: `Given a string \`s\`, find the length of the longest substring without repeating characters.

#### Example 1:
> **Input:** \`s = "abcabcbb"\`
> **Output:** \`3\`
> **Explanation:** The answer is "abc", with the length of 3.

#### Example 2:
> **Input:** \`s = "bbbbb"\`
> **Output:** \`1\`
> **Explanation:** The answer is "b", with the length of 1.

#### Example 3:
> **Input:** \`s = "pwwkew"\`
> **Output:** \`3\`
> **Explanation:** The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.

#### Constraints:
- 0 <= s.length <= 5 * 10^4^
- s consists of English letters, digits, symbols and spaces.`,
		topics: ["hashmap", "sliding-window", "two-pointers"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 3,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["s"],
		tests: [
			{ input: ["abcabcbb"], output: 3 },
			{ input: ["bbbbb"], output: 1 },
			{ input: ["pwwkew"], output: 3 },
			{ input: [""], output: 0 },
			{ input: [" "], output: 1 },
			{ input: ["dvdf"], output: 3 },
			{ input: ["aab"], output: 2 },
			{ input: ["au"], output: 2 },
			{ input: ["tmmzuxt"], output: 5 },
			{ input: ["abcde"], output: 5 },
			{ input: ["abccba"], output: 3 },
			{ input: ["abcdefghijklmnopqrstuvwxyz"], output: 26 },
			{ input: ["abba"], output: 2 },
			{ input: ["a"], output: 1 },
			{ input: ["aa"], output: 1 },
			{ input: ["ab"], output: 2 },
			{ input: ["abc"], output: 3 },
			{ input: ["abcd"], output: 4 },
			{ input: ["abcabc"], output: 3 },
			{ input: ["bbbbbbbb"], output: 1 },
			{ input: ["abcdefabcdef"], output: 6 },
			{ input: ["qwertyuiop"], output: 10 },
			{ input: ["asdfghjkl"], output: 9 },
			{ input: ["zxcvbnm"], output: 7 },
			{ input: ["1234567890"], output: 10 },
			{ input: ["abcdefghijklmnopqrstuvwxyz0123456789"], output: 36 },
			{ input: ["thequickbrownfoxjumpsoverthelazydog"], output: 25 },
			{ input: ["aabbccddeeff"], output: 2 },
			{
				input: ["abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"],
				output: 26,
			},
			{ input: ["a1b2c3d4e5f6g7h8i9j0"], output: 20 },
			{ input: ["abacabadabacaba"], output: 3 },
			{ input: ["hijklmnopqrstuvwxyzabcdefghijklmnop"], output: 26 },
			{ input: ["abcdefghijklmnopqrstuvwxyz!@#$%^&*()"], output: 26 },
			{ input: ["a b c d e f"], output: 6 },
			{ input: ["abc def ghi jkl"], output: 7 },
			{
				input: ["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"],
				output: 52,
			},
			{ input: ["123abc456def789"], output: 9 },
			{ input: ["abcdefabcdefghijklmnop"], output: 12 },
		],
		startingCode: {
			javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function lengthOfLongestSubstring(s) {
  if (s.length === 0) return 0;
  
  const charMap = new Map();
  let maxLength = 0;
  let left = 0;
  
  for (let right = 0; right < s.length; right++) {
    if (charMap.has(s[right]) && charMap.get(s[right]) >= left) {
      left = charMap.get(s[right]) + 1;
    }
    charMap.set(s[right], right);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  
  return maxLength;
}`,
		},
	},
	{
		id: "median-of-two-sorted-arrays",
		slug: "median-of-two-sorted-arrays",
		title: "Median of Two Sorted Arrays",
		statementMd: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

#### Example 1:
> **Input:** \`nums1 = [1,3]\`, \`nums2 = [2]\`
> **Output:** \`2.00000\`
> **Explanation:** merged array = [1,2,3] and median is 2.

#### Example 2:
> **Input:** \`nums1 = [1,2]\`, \`nums2 = [3,4]\`
> **Output:** \`2.50000\`
> **Explanation:** merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.

#### Constraints:
- nums1.length == m
- nums2.length == n
- 0 <= m <= 1000
- 0 <= n <= 1000
- 1 <= m + n <= 2000
- -10^6^ <= nums1[i], nums2[i] <= 10^6^`,
		topics: ["arrays", "binary-search", "divide-and-conquer"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 4,
		rubric: {
			optimal_time: "O(log(m+n))",
			acceptable_time: ["O(m+n)", "O((m+n) log(m+n))"],
		},
		parameterNames: ["nums1", "nums2"],
		tests: [
			{ input: [[1, 3], [2]], output: 2.0 },
			{
				input: [
					[1, 2],
					[3, 4],
				],
				output: 2.5,
			},
			{ input: [[], [1]], output: 1.0 },
			{ input: [[1], []], output: 1.0 },
			{ input: [[], [1, 2]], output: 1.5 },
			{ input: [[1, 2], []], output: 1.5 },
			{
				input: [
					[0, 0],
					[0, 0],
				],
				output: 0.0,
			},
			{ input: [[1], [1]], output: 1.0 },
			{
				input: [
					[1, 2],
					[1, 2],
				],
				output: 1.5,
			},
			{
				input: [
					[1, 3, 5],
					[2, 4, 6],
				],
				output: 3.5,
			},
			{
				input: [
					[1, 2, 3],
					[4, 5, 6],
				],
				output: 3.5,
			},
			{
				input: [
					[1, 3, 5, 7],
					[2, 4, 6],
				],
				output: 4.0,
			},
			{
				input: [
					[1, 2, 3, 4],
					[5, 6, 7],
				],
				output: 4.0,
			},
			{ input: [[1], [2, 3, 4, 5, 6]], output: 3.5 },
			{ input: [[1, 2, 3, 4, 5], [6]], output: 3.5 },
			{
				input: [
					[-1, 0],
					[1, 2],
				],
				output: 0.5,
			},
			{
				input: [
					[1, 2],
					[-1, 0],
				],
				output: 0.5,
			},
			{
				input: [
					[-5, -3, -1],
					[-4, -2, 0],
				],
				output: -2.0,
			},
			{
				input: [
					[1, 2, 3, 4, 5, 6, 7, 8],
					[9, 10],
				],
				output: 5.5,
			},
			{
				input: [
					[9, 10],
					[1, 2, 3, 4, 5, 6, 7, 8],
				],
				output: 5.5,
			},
			{
				input: [
					[1, 3, 5, 7, 9],
					[2, 4, 6, 8, 10],
				],
				output: 5.5,
			},
			{
				input: [
					[2, 4, 6, 8, 10],
					[1, 3, 5, 7, 9],
				],
				output: 5.5,
			},
			{
				input: [
					[1, 5],
					[2, 3, 4, 6, 7, 8],
				],
				output: 4.5,
			},
			{
				input: [
					[2, 3, 4, 6, 7, 8],
					[1, 5],
				],
				output: 4.5,
			},
			{
				input: [
					[1, 2, 3],
					[4, 5, 6, 7, 8, 9, 10],
				],
				output: 5.5,
			},
			{
				input: [
					[4, 5, 6, 7, 8, 9, 10],
					[1, 2, 3],
				],
				output: 5.5,
			},
			{
				input: [
					[1, 1, 1, 1],
					[2, 2, 2, 2],
				],
				output: 1.5,
			},
			{
				input: [
					[2, 2, 2, 2],
					[1, 1, 1, 1],
				],
				output: 1.5,
			},
			{
				input: [
					[1, 1, 2, 2],
					[3, 3, 4, 4],
				],
				output: 2.5,
			},
			{
				input: [
					[3, 3, 4, 4],
					[1, 1, 2, 2],
				],
				output: 2.5,
			},
			{ input: [[1, 2, 3, 4, 5, 6], [7]], output: 4.0 },
			{ input: [[7], [1, 2, 3, 4, 5, 6]], output: 4.0 },
			{
				input: [
					[1, 2, 3, 4, 5],
					[6, 7, 8, 9, 10],
				],
				output: 5.5,
			},
			{
				input: [
					[6, 7, 8, 9, 10],
					[1, 2, 3, 4, 5],
				],
				output: 5.5,
			},
			{
				input: [
					[1, 3, 5, 7, 9, 11],
					[2, 4, 6, 8, 10],
				],
				output: 6.5,
			},
			{
				input: [
					[2, 4, 6, 8, 10],
					[1, 3, 5, 7, 9, 11],
				],
				output: 6.5,
			},
			{
				input: [
					[1, 2, 3, 4],
					[5, 6, 7, 8, 9, 10, 11, 12],
				],
				output: 6.5,
			},
			{
				input: [
					[5, 6, 7, 8, 9, 10, 11, 12],
					[1, 2, 3, 4],
				],
				output: 6.5,
			},
			{
				input: [
					[-10, -5, 0, 5, 10],
					[-8, -3, 2, 7, 12],
				],
				output: 1.0,
			},
			{
				input: [
					[-8, -3, 2, 7, 12],
					[-10, -5, 0, 5, 10],
				],
				output: 1.0,
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Merge arrays
  const merged = [];
  let i = 0, j = 0;
  
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] <= nums2[j]) {
      merged.push(nums1[i++]);
    } else {
      merged.push(nums2[j++]);
    }
  }
  
  while (i < nums1.length) merged.push(nums1[i++]);
  while (j < nums2.length) merged.push(nums2[j++]);
  
  // Find median
  const n = merged.length;
  if (n % 2 === 0) {
    return (merged[n / 2 - 1] + merged[n / 2]) / 2;
  } else {
    return merged[Math.floor(n / 2)];
  }
}`,
		},
	},
	{
		id: "longest-palindromic-substring",
		slug: "longest-palindromic-substring",
		title: "Longest Palindromic Substring",
		statementMd: `Given a string \`s\`, return the longest palindromic substring in \`s\`.

#### Example 1:
> **Input:** \`s = "babad"\`
> **Output:** \`"bab"\`
> **Explanation:** "aba" is also a valid answer.

#### Example 2:
> **Input:** \`s = "cbbd"\`
> **Output:** \`"bb"\`

#### Constraints:
- 1 <= s.length <= 1000
- s consist of only digits and English letters.`,
		topics: ["strings", "dynamic-programming"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 5,
		rubric: {
			optimal_time: "O(n^2)",
			acceptable_time: ["O(n^2)", "O(n^3)"],
		},
		parameterNames: ["s"],
		tests: [
			{ input: ["babad"], output: "bab" },
			{ input: ["cbbd"], output: "bb" },
			{ input: ["a"], output: "a" },
			{ input: ["ac"], output: "a" },
			{ input: ["racecar"], output: "racecar" },
			{ input: ["noon"], output: "noon" },
			{ input: ["abc"], output: "a" },
			{ input: ["aba"], output: "aba" },
			{ input: ["abba"], output: "abba" },
			{ input: ["abacaba"], output: "abacaba" },
			{ input: ["forgeeksskeegfor"], output: "geeksskeeg" },
			{ input: ["geeks"], output: "ee" },
			{ input: ["geek"], output: "ee" },
			{ input: ["abcdcb"], output: "bcdcb" },
			{ input: ["abcdcba"], output: "abcdcba" },
			{ input: ["abccba"], output: "abccba" },
			{ input: ["abcbca"], output: "abcba" },
			{ input: ["abcdef"], output: "a" },
			{ input: ["aaa"], output: "aaa" },
			{ input: ["aa"], output: "aa" },
			{ input: ["abcba"], output: "abcba" },
			{ input: ["madam"], output: "madam" },
			{ input: ["level"], output: "level" },
			{ input: ["rotator"], output: "rotator" },
			{ input: ["deified"], output: "deified" },
			{ input: ["civic"], output: "civic" },
			{ input: ["radar"], output: "radar" },
			{ input: ["refer"], output: "refer" },
			{ input: ["aabbaa"], output: "aabbaa" },
			{ input: ["abacab"], output: "bacab" },
			{ input: ["tattarrattat"], output: "tattarrattat" },
			{ input: ["abracadabra"], output: "aca" },
			{ input: ["palindrome"], output: "p" },
			{ input: ["abababa"], output: "abababa" },
			{ input: ["12321"], output: "12321" },
			{ input: ["1221"], output: "1221" },
			{ input: ["aabbcc"], output: "aa" },
			{ input: ["abcdefedcba"], output: "abcdefedcba" },
			{ input: ["abcdefgh"], output: "a" },
			{ input: ["abcdefghijk"], output: "a" },
			{ input: ["xyzyx"], output: "xyzyx" },
			{ input: ["xabbay"], output: "abba" },
		],
		startingCode: {
			javascript: `/**
 * @param {string} s
 * @return {string}
 */
function longestPalindrome(s) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function longestPalindrome(s) {
  if (s.length === 0) return "";
  if (s.length === 1) return s;
  
  let start = 0;
  let maxLen = 1;
  
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      left--;
      right++;
    }
    return right - left - 1;
  }
  
  for (let i = 0; i < s.length; i++) {
    const len1 = expandAroundCenter(i, i);
    const len2 = expandAroundCenter(i, i + 1);
    const len = Math.max(len1, len2);
    
    if (len > maxLen) {
      maxLen = len;
      start = i - Math.floor((len - 1) / 2);
    }
  }
  
  return s.substring(start, start + maxLen);
}`,
		},
	},
	{
		id: "zigzag-conversion",
		slug: "zigzag-conversion",
		title: "Zigzag Conversion",
		statementMd: `The string \`"PAYPALISHIRING"\` is written in a zigzag pattern on a given number of rows like this: (you may want to display this pattern in a fixed font for better legibility)

\`\`\`
P   A   H   N
A P L S I I G
Y   I   R
\`\`\`

And then read line by line: \`"PAHNAPLSIIGYIR"\`

Write the code that will take a string and make this conversion given a number of rows:

\`convert(s, numRows)\`

#### Example 1:
> **Input:** \`s = "PAYPALISHIRING"\`, \`numRows = 3\`
> **Output:** \`"PAHNAPLSIIGYIR"\`

#### Example 2:
> **Input:** \`s = "PAYPALISHIRING"\`, \`numRows = 4\`
> **Output:** \`"PINALSIGYAHRPI"\`
> **Explanation:**
> \`\`\`
> P     I    N
> A   L S  I G
> Y A   H R
> P     I
> \`\`\`

#### Example 3:
> **Input:** \`s = "A"\`, \`numRows = 1\`
> **Output:** \`"A"\`

#### Constraints:
- 1 <= s.length <= 1000
- s consists of English letters (lower-case and upper-case), ',' and '.'.
- 1 <= numRows <= 1000`,
		topics: ["strings", "simulation"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 6,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["s", "numRows"],
		tests: [
			{ input: ["PAYPALISHIRING", 3], output: "PAHNAPLSIIGYIR" },
			{ input: ["PAYPALISHIRING", 4], output: "PINALSIGYAHRPI" },
			{ input: ["A", 1], output: "A" },
			{ input: ["AB", 1], output: "AB" },
			{ input: ["AB", 2], output: "AB" },
			{ input: ["ABC", 2], output: "ACB" },
			{ input: ["ABCD", 2], output: "ACBD" },
			{ input: ["ABCDE", 3], output: "AEBDC" },
			{ input: ["ABCDEF", 3], output: "AEBDFC" },
			{ input: ["ABCDEFG", 3], output: "AEBDFCG" },
			{ input: ["ABCDEFGH", 3], output: "AEBDFHCG" },
			{ input: ["ABCDEFGHI", 4], output: "AGBFHCEID" },
			{ input: ["LEETCODEISHIRING", 3], output: "LCIRETOESIIGEDHN" },
			{ input: ["LEETCODEISHIRING", 4], output: "LDREOEIIECIHNTSG" },
			{ input: ["TEST", 1], output: "TEST" },
			{ input: ["TEST", 2], output: "TSET" },
			{ input: ["TEST", 3], output: "TSTE" },
			{ input: ["TEST", 4], output: "TEST" },
			{ input: ["HELLO", 2], output: "HLOEL" },
			{ input: ["HELLO", 3], output: "HOELL" },
			{ input: ["HELLO", 4], output: "HOELL" },
			{ input: ["WORLD", 2], output: "WRLOD" },
			{ input: ["WORLD", 3], output: "WOLRD" },
			{ input: ["WORLD", 4], output: "WOLRD" },
			{ input: ["ALGORITHM", 2], output: "AGRTMLOIH" },
			{ input: ["ALGORITHM", 3], output: "AORGLIMTH" },
			{ input: ["ALGORITHM", 4], output: "AIGLOMRTH" },
			{ input: ["PYTHON", 2], output: "PTOYHN" },
			{ input: ["PYTHON", 3], output: "PHYOTN" },
			{ input: ["PYTHON", 4], output: "PHYOTN" },
			{ input: ["JAVASCRIPT", 3], output: "JSIAPCVTARH" },
			{ input: ["JAVASCRIPT", 4], output: "JPIASVCTARH" },
			{ input: ["ABCDEFGHIJKLMNOP", 3], output: "AEIMBDFHJLNPCGKO" },
			{ input: ["ABCDEFGHIJKLMNOP", 4], output: "AGMBFHNLCEIKODJP" },
			{ input: ["ABCDEFGHIJKLMNOP", 5], output: "AIKBHJLCGMDFNEOP" },
			{ input: ["1234567890", 2], output: "1357924680" },
			{ input: ["1234567890", 3], output: "1592468370" },
			{ input: ["1234567890", 4], output: "1726835940" },
			{ input: ["A", 5], output: "A" },
			{ input: ["ABCD", 1], output: "ABCD" },
			{ input: ["ABCD", 3], output: "ABDC" },
		],
		startingCode: {
			javascript: `/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
function convert(s, numRows) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function convert(s, numRows) {
  if (numRows === 1 || numRows >= s.length) return s;
  
  const rows = Array(numRows).fill("");
  let currentRow = 0;
  let goingDown = false;
  
  for (const char of s) {
    rows[currentRow] += char;
    
    if (currentRow === 0 || currentRow === numRows - 1) {
      goingDown = !goingDown;
    }
    
    currentRow += goingDown ? 1 : -1;
  }
  
  return rows.join("");
}`,
		},
	},
	{
		id: "reverse-integer",
		slug: "reverse-integer",
		title: "Reverse Integer",
		statementMd: `Given a signed 32-bit integer \`x\`, return \`x\` with its digits reversed. If reversing \`x\` causes the value to go outside the signed 32-bit integer range [-2^31^, 2^31^ - 1], then return 0.

**Assume the environment does not allow you to store 64-bit integers (signed or unsigned).**

#### Example 1:
> **Input:** \`x = 123\`
> **Output:** \`321\`

#### Example 2:
> **Input:** \`x = -123\`
> **Output:** \`-321\`

#### Example 3:
> **Input:** \`x = 120\`
> **Output:** \`21\`

#### Constraints:
- -2^31^ <= x <= 2^31^ - 1`,
		topics: ["math"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 7,
		rubric: {
			optimal_time: "O(log(n))",
			acceptable_time: ["O(log(n))"],
		},
		parameterNames: ["x"],
		tests: [
			{ input: [123], output: 321 },
			{ input: [-123], output: -321 },
			{ input: [120], output: 21 },
			{ input: [0], output: 0 },
			{ input: [1], output: 1 },
			{ input: [-1], output: -1 },
			{ input: [10], output: 1 },
			{ input: [-10], output: -1 },
			{ input: [1534236469], output: 0 },
			{ input: [-2147483648], output: 0 },
			{ input: [2147483647], output: 0 },
			{ input: [2147483646], output: 0 },
			{ input: [-2147483647], output: 0 },
			{ input: [12345], output: 54321 },
			{ input: [-12345], output: -54321 },
			{ input: [100], output: 1 },
			{ input: [-100], output: -1 },
			{ input: [102], output: 201 },
			{ input: [-102], output: -201 },
			{ input: [900000], output: 9 },
			{ input: [-900000], output: -9 },
			{ input: [1563847412], output: 0 },
			{ input: [-1563847412], output: 0 },
			{ input: [1463847412], output: 2147483641 },
			{ input: [-1463847412], output: -2147483641 },
			{ input: [2147483412], output: 2143847412 },
			{ input: [-2147483412], output: -2143847412 },
			{ input: [999999999], output: 999999999 },
			{ input: [-999999999], output: -999999999 },
			{ input: [123456789], output: 987654321 },
			{ input: [-123456789], output: -987654321 },
			{ input: [1111111111], output: 1111111111 },
			{ input: [-1111111111], output: -1111111111 },
			{ input: [12321], output: 12321 },
			{ input: [-12321], output: -12321 },
			{ input: [101], output: 101 },
			{ input: [-101], output: -101 },
			{ input: [1001], output: 1001 },
			{ input: [-1001], output: -1001 },
			{ input: [543210], output: 12345 },
			{ input: [-543210], output: -12345 },
			{ input: [987654321], output: 123456789 },
			{ input: [-987654321], output: -123456789 },
		],
		startingCode: {
			javascript: `/**
 * @param {number} x
 * @return {number}
 */
function reverse(x) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function reverse(x) {
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;
  
  let reversed = 0;
  
  while (x !== 0) {
    const digit = x % 10;
    x = Math.trunc(x / 10);
    
    if (reversed > Math.floor(INT_MAX / 10) || 
        (reversed === Math.floor(INT_MAX / 10) && digit > 7)) {
      return 0;
    }
    
    if (reversed < Math.ceil(INT_MIN / 10) || 
        (reversed === Math.ceil(INT_MIN / 10) && digit < -8)) {
      return 0;
    }
    
    reversed = reversed * 10 + digit;
  }
  
  return reversed;
}`,
		},
	},
	{
		id: "string-to-integer-atoi",
		slug: "string-to-integer-atoi",
		title: "String to Integer (atoi)",
		statementMd: `Implement the \`myAtoi(string s)\` function, which converts a string to a 32-bit signed integer (similar to C/C++'s \`atoi\` function).

The algorithm for \`myAtoi(string s)\` is as follows:

1. Read in and ignore any leading whitespace.
2. Check if the next character (if not already at the end of the string) is '-' or '+'. Read this character in if it is either. This determines if the final result is negative or positive respectively. Assume the result is positive if neither is present.
3. Read in next the characters until the next non-digit character or the end of the input is reached. The rest of the string is ignored.
4. Convert these digits into an integer (i.e. "123" -> 123, "0032" -> 32). If no digits were read, then the integer is 0. Change the sign as necessary (from step 2).
5. If the integer is out of the 32-bit signed integer range [-2^31^, 2^31^ - 1], then clamp the integer so that it remains in the range. Specifically, integers less than -2^31^ should be clamped to -2^31^, and integers greater than 2^31^ - 1 should be clamped to 2^31^ - 1.
6. Return the integer as the final result.

**Note:**
- Only the space character ' ' is considered a whitespace character.
- Do not ignore any characters other than the leading whitespace or the rest of the string after the digits.

#### Example 1:
> **Input:** \`s = "42"\`
> **Output:** \`42\`
> **Explanation:** The underlined characters are what is read in, the caret is the current reader position.
> Step 1: "42" (no characters read because there is no leading whitespace)
> Step 2: "42" (no characters read because there is neither '-' nor '+')
> Step 3: "42" ("42" is read in)

#### Example 2:
> **Input:** \`s = "   -42"\`
> **Output:** \`-42\`
> **Explanation:**
> Step 1: "   -42" (leading whitespace is read and ignored)
> Step 2: "   -42" ('-' is read, so the result should be negative)
> Step 3: "   -42" ("42" is read in)

#### Example 3:
> **Input:** \`s = "4193 with words"\`
> **Output:** \`4193\`
> **Explanation:**
> Step 3 stops because the next character is not a numeric digit.

#### Constraints:
- 0 <= s.length <= 200
- s consists of English letters (lower-case and upper-case), digits (0-9), ' ', '+', '-', and '.'.`,
		topics: ["strings"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 8,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["s"],
		tests: [
			{ input: ["42"], output: 42 },
			{ input: ["   -42"], output: -42 },
			{ input: ["4193 with words"], output: 4193 },
			{ input: ["words and 987"], output: 0 },
			{ input: ["-91283472332"], output: -2147483648 },
			{ input: ["91283472332"], output: 2147483647 },
			{ input: ["   +42"], output: 42 },
			{ input: ["   +0 123"], output: 0 },
			{ input: ["-2147483648"], output: -2147483648 },
			{ input: ["2147483647"], output: 2147483647 },
			{ input: ["-2147483649"], output: -2147483648 },
			{ input: ["2147483648"], output: 2147483647 },
			{ input: ["  0000000000012345678"], output: 12345678 },
			{ input: ["0000000000000   "], output: 0 },
			{ input: ["0-1"], output: 0 },
			{ input: ["+-12"], output: 0 },
			{ input: ["-+12"], output: 0 },
			{ input: ["+1"], output: 1 },
			{ input: ["-1"], output: -1 },
			{ input: ["0"], output: 0 },
			{ input: ["   123"], output: 123 },
			{ input: ["   -123"], output: -123 },
			{ input: ["123abc"], output: 123 },
			{ input: ["abc123"], output: 0 },
			{ input: ["-abc"], output: 0 },
			{ input: ["+abc"], output: 0 },
			{ input: ["  0000000000000"], output: 0 },
			{ input: ["  -0000000000000"], output: 0 },
			{ input: ["  +0000000000000"], output: 0 },
			{ input: ["   -0000000000012345678"], output: -12345678 },
			{ input: ["   +0000000000012345678"], output: 12345678 },
			{ input: ["20000000000000000000"], output: 2147483647 },
			{ input: ["-20000000000000000000"], output: -2147483648 },
			{ input: ["   000000000000123  456"], output: 123 },
			{ input: ["   +0 123"], output: 0 },
			{ input: ["   -0 123"], output: 0 },
			{ input: ["   + 123"], output: 0 },
			{ input: ["   - 123"], output: 0 },
			{ input: ["123  456"], output: 123 },
			{ input: ["-123  456"], output: -123 },
			{ input: ["+123  456"], output: 123 },
			{ input: ["    -88827   5655  U"], output: -88827 },
			{ input: ["   +115200273523523"], output: 2147483647 },
			{ input: ["   -115200273523523"], output: -2147483648 },
		],
		startingCode: {
			javascript: `/**
 * @param {string} s
 * @return {number}
 */
function myAtoi(s) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function myAtoi(s) {
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;
  
  let i = 0;
  let sign = 1;
  let result = 0;
  
  // Step 1: Skip whitespace
  while (i < s.length && s[i] === ' ') {
    i++;
  }
  
  // Step 2: Check for sign
  if (i < s.length && (s[i] === '-' || s[i] === '+')) {
    sign = s[i] === '-' ? -1 : 1;
    i++;
  }
  
  // Step 3: Read digits
  while (i < s.length && s[i] >= '0' && s[i] <= '9') {
    const digit = parseInt(s[i]);
    
    // Step 5: Check for overflow before multiplying
    if (result > Math.floor(INT_MAX / 10) || 
        (result === Math.floor(INT_MAX / 10) && digit > INT_MAX % 10)) {
      return sign === 1 ? INT_MAX : INT_MIN;
    }
    
    result = result * 10 + digit;
    i++;
  }
  
  return result * sign;
}`,
		},
	},
	{
		id: "palindrome-number",
		slug: "palindrome-number",
		title: "Palindrome Number",
		statementMd: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

#### Example 1:
> **Input:** \`x = 121\`
> **Output:** \`true\`
> **Explanation:** 121 reads as 121 from left to right and from right to left.

#### Example 2:
> **Input:** \`x = -121\`
> **Output:** \`false\`
> **Explanation:** From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.

#### Example 3:
> **Input:** \`x = 10\`
> **Output:** \`false\`
> **Explanation:** Reads 01 from right to left. Therefore it is not a palindrome.

#### Constraints:
- -2^31^ <= x <= 2^31^ - 1

**Follow up:** Could you solve it without converting the integer to a string?`,
		topics: ["math"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 9,
		rubric: {
			optimal_time: "O(log(n))",
			acceptable_time: ["O(log(n))"],
		},
		parameterNames: ["x"],
		tests: [
			{ input: [121], output: true },
			{ input: [-121], output: false },
			{ input: [10], output: false },
			{ input: [0], output: true },
			{ input: [1], output: true },
			{ input: [-1], output: false },
			{ input: [11], output: true },
			{ input: [12], output: false },
			{ input: [121], output: true },
			{ input: [1221], output: true },
			{ input: [12321], output: true },
			{ input: [123321], output: true },
			{ input: [1234321], output: true },
			{ input: [12344321], output: true },
			{ input: [100], output: false },
			{ input: [101], output: true },
			{ input: [111], output: true },
			{ input: [1001], output: true },
			{ input: [1021], output: false },
			{ input: [11211], output: true },
			{ input: [21312], output: false },
			{ input: [2147483647], output: false },
			{ input: [-2147483648], output: false },
			{ input: [2147447412], output: true },
			{ input: [12345], output: false },
			{ input: [54345], output: true },
			{ input: [99999], output: true },
			{ input: [9999], output: true },
			{ input: [999], output: true },
			{ input: [99], output: true },
			{ input: [9], output: true },
			{ input: [22], output: true },
			{ input: [222], output: true },
			{ input: [2222], output: true },
			{ input: [22222], output: true },
			{ input: [1000], output: false },
			{ input: [2002], output: true },
			{ input: [2012], output: false },
			{ input: [2112], output: true },
			{ input: [1234321], output: true },
			{ input: [12344321], output: true },
			{ input: [123454321], output: true },
			{ input: [987656789], output: true },
			{ input: [98766789], output: true },
		],
		startingCode: {
			javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function isPalindrome(x) {
  if (x < 0) return false;
  if (x < 10) return true;
  if (x % 10 === 0) return false;
  
  let reversed = 0;
  let original = x;
  
  while (x > 0) {
    reversed = reversed * 10 + (x % 10);
    x = Math.floor(x / 10);
  }
  
  return original === reversed;
}`,
		},
	},
	{
		id: "regular-expression-matching",
		slug: "regular-expression-matching",
		title: "Regular Expression Matching",
		statementMd: `Given an input string \`s\` and a pattern \`p\`, implement regular expression matching with support for \`'.'\` and \`'*'\` where:

- \`'.'\` Matches any single character.
- \`'*'\` Matches zero or more of the preceding element.

The matching should cover the **entire** input string (not partial).

#### Example 1:
> **Input:** \`s = "aa"\`, \`p = "a"\`
> **Output:** \`false\`
> **Explanation:** "a" does not match the entire string "aa".

#### Example 2:
> **Input:** \`s = "aa"\`, \`p = "a*"\`
> **Output:** \`true\`
> **Explanation:** '*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes "aa".

#### Example 3:
> **Input:** \`s = "ab"\`, \`p = ".*"\`
> **Output:** \`true\`
> **Explanation:** ".*" means "zero or more (*) of any character (.)".

#### Constraints:
- 1 <= s.length <= 20
- 1 <= p.length <= 30
- s contains only lowercase English letters.
- p contains only lowercase English letters, '.', and '*'.
- It is guaranteed for each appearance of the character '*', there will be a previous valid character to match.`,
		topics: ["strings", "dynamic-programming", "recursion"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 10,
		rubric: {
			optimal_time: "O(m*n)",
			acceptable_time: ["O(m*n)", "O(2^(m+n))"],
		},
		parameterNames: ["s", "p"],
		tests: [
			{ input: ["aa", "a"], output: false },
			{ input: ["aa", "a*"], output: true },
			{ input: ["ab", ".*"], output: true },
			{ input: ["aa", "a"], output: false },
			{ input: ["aa", "aa"], output: true },
			{ input: ["a", "a*"], output: true },
			{ input: ["a", ".*"], output: true },
			{ input: ["a", "a"], output: true },
			{ input: ["a", "."], output: true },
			{ input: ["", "a*"], output: true },
			{ input: ["", ".*"], output: true },
			{ input: ["", ""], output: true },
			{ input: ["abc", "abc"], output: true },
			{ input: ["abc", "a.c"], output: true },
			{ input: ["abc", "ab."], output: true },
			{ input: ["abc", ".bc"], output: true },
			{ input: ["aab", "c*a*b"], output: true },
			{ input: ["mississippi", "mis*is*p*."], output: false },
			{ input: ["mississippi", "mis*is*ip*."], output: true },
			{ input: ["aaa", "a*a"], output: true },
			{ input: ["aaa", "a*"], output: true },
			{ input: ["aaa", "ab*a*c*a"], output: true },
			{ input: ["aaa", "ab*ac*a"], output: true },
			{ input: ["a", "ab*"], output: true },
			{ input: ["a", "ab*c*"], output: true },
			{ input: ["a", ".*"], output: true },
			{ input: ["ab", ".*"], output: true },
			{ input: ["abc", ".*"], output: true },
			{ input: ["abcd", ".*"], output: true },
			{ input: ["ab", ".*c"], output: false },
			{ input: ["abc", ".*c"], output: true },
			{ input: ["abcd", ".*d"], output: true },
			{ input: ["aa", "a"], output: false },
			{ input: ["aa", "aa"], output: true },
			{ input: ["aaa", "aa"], output: false },
			{ input: ["aaa", "a*"], output: true },
			{ input: ["aaa", "a*a"], output: true },
			{ input: ["aaa", "ab*a"], output: false },
			{ input: ["aaa", "ab*ac*a"], output: true },
			{ input: ["a", "a*"], output: true },
			{ input: ["", "a*"], output: true },
			{ input: ["", ".*"], output: true },
			{ input: ["", "a*b*"], output: true },
			{ input: ["abc", "a.c"], output: true },
			{ input: ["abc", "a.*c"], output: true },
			{ input: ["abc", ".*c"], output: true },
			{ input: ["abc", ".*"], output: true },
			{ input: ["abc", "a.*"], output: true },
			{ input: ["abc", ".*b.*"], output: true },
			{ input: ["abc", ".*c"], output: true },
			{ input: ["abc", ".*d"], output: false },
			{ input: ["aa", "a*"], output: true },
			{ input: ["ab", ".*"], output: true },
			{ input: ["aab", "c*a*b"], output: true },
			{ input: ["mississippi", "mis*is*p*."], output: false },
		],
		startingCode: {
			javascript: `/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
function isMatch(s, p) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function isMatch(s, p) {
  const m = s.length;
  const n = p.length;
  
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(false));
  dp[0][0] = true;
  
  // Handle patterns like a*, a*b*, a*b*c*
  for (let j = 1; j <= n; j++) {
    if (p[j - 1] === '*') {
      dp[0][j] = dp[0][j - 2];
    }
  }
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === s[i - 1] || p[j - 1] === '.') {
        dp[i][j] = dp[i - 1][j - 1];
      } else if (p[j - 1] === '*') {
        dp[i][j] = dp[i][j - 2]; // Zero occurrences
        if (p[j - 2] === s[i - 1] || p[j - 2] === '.') {
          dp[i][j] = dp[i][j] || dp[i - 1][j]; // One or more occurrences
        }
      }
    }
  }
  
  return dp[m][n];
}`,
		},
	},
];
