import { AlgoProblemDetail } from "@/types/algorithm-types";

export const algoProblems11to20: AlgoProblemDetail[] = [
	{
		id: "container-with-most-water",
		slug: "container-with-most-water",
		title: "Container With Most Water",
		statementMd: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i^th^\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return *the maximum amount of water a container can store*.

**Notice** that you may not slant the container.

#### Example 1:
> **Input:** \`height = [1,8,6,2,5,4,8,3,7]\`
> **Output:** \`49\`
> **Explanation:** The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.

#### Example 2:
> **Input:** \`height = [1,1]\`
> **Output:** \`1\`

#### Constraints:
- \`n == height.length\`
- 2 <= n <= 10^5^
- 0 <= height[i] <= 10^4^`,
		topics: ["arrays", "two-pointers", "greedy"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 11,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n^2)"],
		},
		parameterNames: ["height"],
		tests: [
			{ input: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], output: 49 },
			{ input: [[1, 1]], output: 1 },
			{ input: [[1, 2, 1]], output: 2 },
			{ input: [[4, 3, 2, 1, 4]], output: 16 },
			{ input: [[1, 2, 4, 3]], output: 4 },
			{ input: [[1, 3, 2, 5, 25, 24, 5]], output: 24 },
			{ input: [[2, 3, 4, 5, 18, 17, 6]], output: 17 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], output: 25 },
			{ input: [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]], output: 25 },
			{ input: [[8, 1, 6, 2, 5, 4, 8, 3, 7]], output: 56 },
			{ input: [[5, 4, 3, 2, 1]], output: 6 },
			{ input: [[1, 2, 3, 4, 5]], output: 6 },
			{ input: [[1, 8, 6, 2, 5, 4, 8, 3, 7, 1]], output: 49 },
			{ input: [[6, 2, 5, 4, 9, 6, 7]], output: 42 },
			{ input: [[1, 3, 2, 5, 25, 24, 5, 3]], output: 48 },
			{ input: [[2, 3, 10, 5, 7, 8, 9]], output: 36 },
			{ input: [[1, 1, 1, 1, 1, 1, 1]], output: 6 },
			{ input: [[7, 1, 7, 1, 7, 1, 7]], output: 42 },
			{ input: [[1, 100, 6, 2, 5, 4, 8, 3, 7]], output: 49 },
			{ input: [[2, 3, 4, 5, 18, 17, 6, 2]], output: 17 },
			{ input: [[1, 8, 100, 2, 100, 4, 8, 3, 7]], output: 200 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]], output: 30 },
			{ input: [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]], output: 25 },
			{ input: [[5, 5, 5, 5, 5]], output: 20 },
			{ input: [[1, 50, 2, 50]], output: 50 },
			{ input: [[50, 1, 50, 2]], output: 150 },
			{ input: [[3, 9, 3, 4, 7, 2, 12, 6]], output: 45 },
			{ input: [[1, 0, 0, 0, 0, 0, 0, 2, 3]], output: 16 },
			{ input: [[1, 8, 6, 2, 5, 4, 8, 3, 7, 2, 1]], output: 49 },
			{ input: [[2, 1, 3, 4, 5, 2, 1, 3, 4, 5]], output: 25 },
			{ input: [[10, 1, 1, 1, 1, 1, 1, 10]], output: 70 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]], output: 36 },
			{ input: [[12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]], output: 36 },
			{ input: [[1, 2, 4, 3, 2, 1, 5, 6, 4, 3]], output: 27 },
			{ input: [[6, 4, 2, 1, 3, 5, 7, 9, 8, 6]], output: 42 },
			{ input: [[1, 1, 1, 1, 100, 1, 1, 1, 1, 100]], output: 900 },
			{ input: [[100, 1, 1, 1, 1, 1, 1, 1, 1, 100]], output: 900 },
			{
				input: [
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
				],
				output: 50,
			},
			{ input: [[2, 5, 3, 1, 4, 6, 8, 7, 9, 2, 5, 4]], output: 40 },
			{ input: [[1, 3, 2, 5, 25, 24, 5, 3, 2, 1]], output: 48 },
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;
  
  while (left < right) {
    const width = right - left;
    const minHeight = Math.min(height[left], height[right]);
    const currentArea = width * minHeight;
    maxWater = Math.max(maxWater, currentArea);
    
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }
  
  return maxWater;
}`,
		},
	},
	{
		id: "integer-to-roman",
		slug: "integer-to-roman",
		title: "Integer to Roman",
		statementMd: `Roman numerals are represented by seven different symbols: \`I\`, \`V\`, \`X\`, \`L\`, \`C\`, \`D\` and \`M\`.

| Symbol | Value |
|--------|-------|
| I      | 1     |
| V      | 5     |
| X      | 10    |
| L      | 50    |
| C      | 100   |
| D      | 500   |
| M      | 1000  |

For example, \`2\` is written as \`II\` in Roman numeral, just two ones added together. \`12\` is written as \`XII\`, which is simply \`X + II\`. The number \`27\` is written as \`XXVII\`, which is \`XX + V + II\`.

Roman numerals are usually written largest to smallest from left to right. However, the numeral for four is not \`IIII\`. Instead, the number four is written as \`IV\`. Because the one is before the five we subtract it making four. The same principle applies to the number nine, which is written as \`IX\`. There are six instances where subtraction is used:

- \`I\` can be placed before \`V\` (5) and \`X\` (10) to make 4 and 9.
- \`X\` can be placed before \`L\` (50) and \`C\` (100) to make 40 and 90.
- \`C\` can be placed before \`D\` (500) and \`M\` (1000) to make 400 and 900.

Given an integer, convert it to a Roman numeral.

#### Example 1:
> **Input:** \`num = 3\`
> **Output:** \`"III"\`
> **Explanation:** 3 is represented as 3 ones.

#### Example 2:
> **Input:** \`num = 58\`
> **Output:** \`"LVIII"\`
> **Explanation:** L = 50, V = 5, III = 3.

#### Example 3:
> **Input:** \`num = 1994\`
> **Output:** \`"MCMXCIV"\`
> **Explanation:** M = 1000, CM = 900, XC = 90 and IV = 4.

#### Constraints:
- 1 <= num <= 3999`,
		topics: ["math", "hash-table", "string"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 12,
		rubric: {
			optimal_time: "O(1)",
			acceptable_time: ["O(log n)"],
		},
		parameterNames: ["num"],
		tests: [
			{ input: [3], output: "III" },
			{ input: [58], output: "LVIII" },
			{ input: [1994], output: "MCMXCIV" },
			{ input: [1], output: "I" },
			{ input: [4], output: "IV" },
			{ input: [5], output: "V" },
			{ input: [9], output: "IX" },
			{ input: [10], output: "X" },
			{ input: [40], output: "XL" },
			{ input: [50], output: "L" },
			{ input: [90], output: "XC" },
			{ input: [100], output: "C" },
			{ input: [400], output: "CD" },
			{ input: [500], output: "D" },
			{ input: [900], output: "CM" },
			{ input: [1000], output: "M" },
			{ input: [2], output: "II" },
			{ input: [6], output: "VI" },
			{ input: [7], output: "VII" },
			{ input: [8], output: "VIII" },
			{ input: [11], output: "XI" },
			{ input: [14], output: "XIV" },
			{ input: [15], output: "XV" },
			{ input: [19], output: "XIX" },
			{ input: [20], output: "XX" },
			{ input: [27], output: "XXVII" },
			{ input: [49], output: "XLIX" },
			{ input: [99], output: "XCIX" },
			{ input: [144], output: "CXLIV" },
			{ input: [199], output: "CXCIX" },
			{ input: [444], output: "CDXLIV" },
			{ input: [999], output: "CMXCIX" },
			{ input: [1499], output: "MCDXCIX" },
			{ input: [1999], output: "MCMXCIX" },
			{ input: [3999], output: "MMMCMXCIX" },
			{ input: [3998], output: "MMMCMXCVIII" },
			{ input: [3997], output: "MMMCMXCVII" },
			{ input: [2000], output: "MM" },
			{ input: [2001], output: "MMI" },
			{ input: [3888], output: "MMMDCCCLXXXVIII" },
			{ input: [1234], output: "MCCXXXIV" },
		],
		startingCode: {
			javascript: `/**
 * @param {number} num
 * @return {string}
 */
function intToRoman(num) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function intToRoman(num) {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const symbols = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
  
  let result = "";
  
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const symbol = symbols[i];
    
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  
  return result;
}`,
		},
	},
	{
		id: "roman-to-integer",
		slug: "roman-to-integer",
		title: "Roman to Integer",
		statementMd: `Roman numerals are represented by seven different symbols: \`I\`, \`V\`, \`X\`, \`L\`, \`C\`, \`D\` and \`M\`.

| Symbol | Value |
|--------|-------|
| I      | 1     |
| V      | 5     |
| X      | 10    |
| L      | 50    |
| C      | 100   |
| D      | 500   |
| M      | 1000  |

For example, \`2\` is written as \`II\` in Roman numeral, just two ones added together. \`12\` is written as \`XII\`, which is simply \`X + II\`. The number \`27\` is written as \`XXVII\`, which is \`XX + V + II\`.

Roman numerals are usually written largest to smallest from left to right. However, the numeral for four is not \`IIII\`. Instead, the number four is written as \`IV\`. Because the one is before the five we subtract it making four. The same principle applies to the number nine, which is written as \`IX\`. There are six instances where subtraction is used:

- \`I\` can be placed before \`V\` (5) and \`X\` (10) to make 4 and 9.
- \`X\` can be placed before \`L\` (50) and \`C\` (100) to make 40 and 90.
- \`C\` can be placed before \`D\` (500) and \`M\` (1000) to make 400 and 900.

Given a Roman numeral, convert it to an integer.

#### Example 1:
> **Input:** \`s = "III"\`
> **Output:** \`3\`
> **Explanation:** III = 3.

#### Example 2:
> **Input:** \`s = "LVIII"\`
> **Output:** \`58\`
> **Explanation:** L = 50, V = 5, III = 3.

#### Example 3:
> **Input:** \`s = "MCMXCIV"\`
> **Output:** \`1994\`
> **Explanation:** M = 1000, CM = 900, XC = 90 and IV = 4.

#### Constraints:
- 1 <= s.length <= 15
- \`s\` contains only the characters \`('I', 'V', 'X', 'L', 'C', 'D', 'M')\`.
- It is **guaranteed** that \`s\` is a valid Roman numeral in the range \`[1, 3999]\`.`,
		topics: ["hash-table", "math", "string"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 13,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["s"],
		tests: [
			{ input: ["III"], output: 3 },
			{ input: ["LVIII"], output: 58 },
			{ input: ["MCMXCIV"], output: 1994 },
			{ input: ["I"], output: 1 },
			{ input: ["IV"], output: 4 },
			{ input: ["V"], output: 5 },
			{ input: ["IX"], output: 9 },
			{ input: ["X"], output: 10 },
			{ input: ["XL"], output: 40 },
			{ input: ["L"], output: 50 },
			{ input: ["XC"], output: 90 },
			{ input: ["C"], output: 100 },
			{ input: ["CD"], output: 400 },
			{ input: ["D"], output: 500 },
			{ input: ["CM"], output: 900 },
			{ input: ["M"], output: 1000 },
			{ input: ["II"], output: 2 },
			{ input: ["VI"], output: 6 },
			{ input: ["VII"], output: 7 },
			{ input: ["VIII"], output: 8 },
			{ input: ["XI"], output: 11 },
			{ input: ["XIV"], output: 14 },
			{ input: ["XV"], output: 15 },
			{ input: ["XIX"], output: 19 },
			{ input: ["XX"], output: 20 },
			{ input: ["XXVII"], output: 27 },
			{ input: ["XLIX"], output: 49 },
			{ input: ["XCIX"], output: 99 },
			{ input: ["CXLIV"], output: 144 },
			{ input: ["CXCIX"], output: 199 },
			{ input: ["CDXLIV"], output: 444 },
			{ input: ["CMXCIX"], output: 999 },
			{ input: ["MCDXCIX"], output: 1499 },
			{ input: ["MCMXCIX"], output: 1999 },
			{ input: ["MMMCMXCIX"], output: 3999 },
			{ input: ["MMMCMXCVIII"], output: 3998 },
			{ input: ["MMMCMXCVII"], output: 3997 },
			{ input: ["MM"], output: 2000 },
			{ input: ["MMI"], output: 2001 },
			{ input: ["MMMDCCCLXXXVIII"], output: 3888 },
			{ input: ["MCCXXXIV"], output: 1234 },
			{ input: ["MMCDXLIV"], output: 2444 },
			{ input: ["MMM"], output: 3000 },
			{ input: ["MCM"], output: 1900 },
			{ input: ["DCXXI"], output: 621 },
			{ input: ["MDCCCLXXXVIII"], output: 1888 },
		],
		startingCode: {
			javascript: `/**
 * @param {string} s
 * @return {number}
 */
function romanToInt(s) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function romanToInt(s) {
  const romanMap = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
  };
  
  let result = 0;
  
  for (let i = 0; i < s.length; i++) {
    const current = romanMap[s[i]];
    const next = romanMap[s[i + 1]];
    
    if (next && current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  
  return result;
}`,
		},
	},
	{
		id: "longest-common-prefix",
		slug: "longest-common-prefix",
		title: "Longest Common Prefix",
		statementMd: `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string \`""\`.

#### Example 1:
> **Input:** \`strs = ["flower","flow","flight"]\`
> **Output:** \`"fl"\`

#### Example 2:
> **Input:** \`strs = ["dog","racecar","car"]\`
> **Output:** \`""\`
> **Explanation:** There is no common prefix among the input strings.

#### Constraints:
- 1 <= strs.length <= 200
- 0 <= strs[i].length <= 200
- \`strs[i]\` consists of only lowercase English letters.`,
		topics: ["string", "trie"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 14,
		rubric: {
			optimal_time: "O(S)",
			acceptable_time: ["O(S log n)"],
		},
		parameterNames: ["strs"],
		tests: [
			{ input: [["flower", "flow", "flight"]], output: "fl" },
			{ input: [["dog", "racecar", "car"]], output: "" },
			{ input: [["a"]], output: "a" },
			{ input: [["ab", "a"]], output: "a" },
			{ input: [["ab", "ab"]], output: "ab" },
			{ input: [["abc", "ab", "a"]], output: "a" },
			{ input: [["abc", "abd", "abe"]], output: "ab" },
			{ input: [["", "b"]], output: "" },
			{ input: [["", ""]], output: "" },
			{ input: [["a", "a", "a"]], output: "a" },
			{ input: [["aa", "aa", "aa"]], output: "aa" },
			{ input: [["aaa", "aa", "aaa"]], output: "aa" },
			{ input: [["abab", "aba", "abc"]], output: "ab" },
			{ input: [["flower", "flower", "flower"]], output: "flower" },
			{
				input: [["interspecies", "interstellar", "interstate"]],
				output: "inters",
			},
			{ input: [["throne", "throne", "throne"]], output: "throne" },
			{ input: [["throne", "dungeon"]], output: "" },
			{ input: [["prefix", "preface", "prepare"]], output: "pre" },
			{ input: [["reflower", "flow"]], output: "" },
			{ input: [["c", "c"]], output: "c" },
			{ input: [["c", "acc", "ccc"]], output: "" },
			{ input: [["abca", "abc"]], output: "abc" },
			{ input: [["abc", "abca"]], output: "abc" },
			{ input: [["a", "ab", "abc"]], output: "a" },
			{ input: [["abc", "ab", "a"]], output: "a" },
			{ input: [["reject", "reject", "reject"]], output: "reject" },
			{ input: [["prefix", "pre", "preview"]], output: "pre" },
			{ input: [["leetcode", "leet", "leetcodes"]], output: "leet" },
			{ input: [["abcdef", "abcde", "abcd"]], output: "abcd" },
			{ input: [["abcd", "abcde", "abcdef"]], output: "abcd" },
			{ input: [["z", "z", "z"]], output: "z" },
			{ input: [["test", "testing", "tested"]], output: "test" },
			{ input: [["hello", "hell", "he"]], output: "he" },
			{ input: [["he", "hell", "hello"]], output: "he" },
			{ input: [["world", "word", "work"]], output: "wor" },
			{
				input: [["program", "programming", "programmer"]],
				output: "program",
			},
			{
				input: [["common", "commonly", "commonplace"]],
				output: "common",
			},
			{ input: [["short", "shorter", "shortest"]], output: "short" },
			{ input: [["prefix", "prefixes", "prefixed"]], output: "prefix" },
		],
		startingCode: {
			javascript: `/**
 * @param {string[]} strs
 * @return {string}
 */
function longestCommonPrefix(strs) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function longestCommonPrefix(strs) {
  if (strs.length === 0) return "";
  if (strs.length === 1) return strs[0];
  
  let prefix = strs[0];
  
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }
  
  return prefix;
}`,
		},
	},
	{
		id: "3sum",
		slug: "3sum",
		title: "3Sum",
		statementMd: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.

#### Example 1:
> **Input:** \`nums = [-1,0,1,2,-1,-4]\`
> **Output:** \`[[-1,-1,2],[-1,0,1]]\`
> **Explanation:**
> nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
> nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
> The distinct triplets are [-1,0,1] and [-1,-1,2].
> Notice that the order of the output and the order of the triplets does not matter.

#### Example 2:
> **Input:** \`nums = [0,1,1]\`
> **Output:** \`[]\`
> **Explanation:** The only possible triplet does not sum up to 0.

#### Example 3:
> **Input:** \`nums = [0,0,0]\`
> **Output:** \`[[0,0,0]]\`
> **Explanation:** The only possible triplet sums up to 0.

#### Constraints:
- 3 <= nums.length <= 3000
- -10^5^ <= nums[i] <= 10^5^`,
		topics: ["array", "two-pointers", "sorting"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 15,
		rubric: {
			optimal_time: "O(n^2)",
			acceptable_time: ["O(n^3)"],
		},
		parameterNames: ["nums"],
		tests: [
			{
				input: [[-1, 0, 1, 2, -1, -4]],
				output: [
					[-1, -1, 2],
					[-1, 0, 1],
				],
			},
			{ input: [[0, 1, 1]], output: [] },
			{ input: [[0, 0, 0]], output: [[0, 0, 0]] },
			{
				input: [[-2, 0, 1, 1, 2]],
				output: [
					[-2, 0, 2],
					[-2, 1, 1],
				],
			},
			{ input: [[-1, 0, 1]], output: [[-1, 0, 1]] },
			{ input: [[1, 2, -2, -1]], output: [] },
			{ input: [[-1, 0, 1, 0]], output: [[-1, 0, 1]] },
			{
				input: [[3, 0, -2, -1, 1, 2]],
				output: [
					[-2, -1, 3],
					[-2, 0, 2],
					[-1, 0, 1],
				],
			},
			{
				input: [[-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6]],
				output: [
					[-4, -2, 6],
					[-4, 0, 4],
					[-4, 1, 3],
					[-4, 2, 2],
					[-2, -2, 4],
					[-2, 0, 2],
					[-2, 1, 1],
				],
			},
			{ input: [[0, 0, 0, 0]], output: [[0, 0, 0]] },
			{
				input: [[-1, -1, -1, 1, 1, 1]],
				output: [
					[-1, -1, 2],
					[-1, 0, 1],
				],
			},
			{
				input: [[-5, -3, -2, -1, 0, 1, 2, 3, 5]],
				output: [
					[-5, 0, 5],
					[-5, 2, 3],
					[-3, -2, 5],
					[-3, -1, 4],
					[-3, 0, 3],
					[-3, 1, 2],
					[-2, -1, 3],
					[-2, 0, 2],
					[-2, 1, 1],
					[-1, 0, 1],
				],
			},
			{ input: [[1, -1, -1, 0]], output: [[-1, 0, 1]] },
			{
				input: [[-1, 0, 1, 2, -1, -4, -2, -3, 3, 0, 4]],
				output: [
					[-4, 0, 4],
					[-4, 1, 3],
					[-3, -1, 4],
					[-3, 0, 3],
					[-3, 1, 2],
					[-2, -1, 3],
					[-2, 0, 2],
					[-1, -1, 2],
					[-1, 0, 1],
				],
			},
			{ input: [[0, 0]], output: [] },
			{ input: [[-1, -1, 0, 1]], output: [[-1, 0, 1]] },
			{ input: [[1, 1, -2]], output: [] },
			{ input: [[-2, 0, 0, 2, 2]], output: [[-2, 0, 2]] },
			{
				input: [[-4, -1, -1, 0, 1, 2]],
				output: [
					[-1, -1, 2],
					[-1, 0, 1],
				],
			},
			{
				input: [
					[
						-5, -1, -5, -3, 2, 5, 0, 4, -7, -8, -7, -8, -5, -4, -5,
						-5, -4, -5, -2, -3,
					],
				],
				output: [
					[-8, 3, 5],
					[-8, 4, 4],
					[-7, 2, 5],
					[-7, 3, 4],
					[-7, 4, 3],
					[-5, 0, 5],
					[-5, 1, 4],
					[-5, 2, 3],
					[-4, -1, 5],
					[-4, 0, 4],
					[-4, 1, 3],
					[-3, -2, 5],
					[-3, -1, 4],
					[-3, 0, 3],
					[-3, 1, 2],
					[-2, -1, 3],
					[-2, 0, 2],
					[-1, 0, 1],
				],
			},
			{
				input: [[-1, 0, 1, 2, -1, -4, -2, -3]],
				output: [
					[-3, 1, 2],
					[-2, 0, 2],
					[-2, 1, 1],
					[-1, -1, 2],
					[-1, 0, 1],
				],
			},
			{
				input: [[-2, -1, 0, 1, 2]],
				output: [
					[-2, 0, 2],
					[-1, 0, 1],
				],
			},
			{ input: [[-10, -10, -10, 10, 10, 10]], output: [[-10, 0, 10]] },
			{
				input: [[-10, -5, 5, 10]],
				output: [
					[-10, 0, 10],
					[-5, -5, 10],
				],
			},
			{ input: [[1, 2, 3, 4, 5]], output: [] },
			{ input: [[-5, -4, -3, -2, -1]], output: [] },
			{
				input: [[-1, 0, 0, 1]],
				output: [
					[-1, 0, 1],
					[0, 0, 0],
				],
			},
			{
				input: [[-2, 0, 1, 1, 2]],
				output: [
					[-2, 0, 2],
					[-2, 1, 1],
				],
			},
			{
				input: [[-1, -1, 0, 1, 1]],
				output: [
					[-1, 0, 1],
					[0, 0, 0],
				],
			},
			{
				input: [[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]],
				output: [
					[-5, 0, 5],
					[-5, 1, 4],
					[-5, 2, 3],
					[-4, -1, 5],
					[-4, 0, 4],
					[-4, 1, 3],
					[-4, 2, 2],
					[-3, -2, 5],
					[-3, -1, 4],
					[-3, 0, 3],
					[-3, 1, 2],
					[-2, -1, 3],
					[-2, 0, 2],
					[-2, 1, 1],
					[-1, 0, 1],
				],
			},
			{
				input: [[-3, -2, -1, 0, 1, 2, 3]],
				output: [
					[-3, 0, 3],
					[-3, 1, 2],
					[-2, -1, 3],
					[-2, 0, 2],
					[-2, 1, 1],
					[-1, 0, 1],
				],
			},
			{ input: [[0, 0, 0, 0, 0, 0]], output: [[0, 0, 0]] },
			{ input: [[-10, 5, 5]], output: [] },
			{ input: [[-10, 5, 5, 0]], output: [[-10, 5, 5]] },
			{ input: [[-1, -1, -1, 2]], output: [] },
			{ input: [[1, 1, -2]], output: [] },
			{ input: [[-2, 1, 1]], output: [] },
			{ input: [[-10, -10, 20]], output: [] },
			{ input: [[-10, -10, 20, 0]], output: [[-10, -10, 20]] },
			{
				input: [[-1, 0, 1, 2, -1, -4, -2, -3, 3, 0, 4, -4]],
				output: [
					[-4, 0, 4],
					[-4, 1, 3],
					[-3, -1, 4],
					[-3, 0, 3],
					[-3, 1, 2],
					[-2, -2, 4],
					[-2, -1, 3],
					[-2, 0, 2],
					[-2, 1, 1],
					[-1, -1, 2],
					[-1, 0, 1],
				],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    
    let left = i + 1;
    let right = nums.length - 1;
    
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  
  return result;
}`,
		},
	},
	{
		id: "3sum-closest",
		slug: "3sum-closest",
		title: "3Sum Closest",
		statementMd: `Given an integer array \`nums\` of length \`n\` and an integer \`target\`, find three integers in \`nums\` such that the sum is closest to \`target\`.

Return *the sum of the three integers*.

You may assume that each input would have exactly one solution.

#### Example 1:
> **Input:** \`nums = [-1,2,1,-4]\`, \`target = 1\`
> **Output:** \`2\`
> **Explanation:** The sum that is closest to the target is 2. (-1 + 2 + 1 = 2).

#### Example 2:
> **Input:** \`nums = [0,0,0]\`, \`target = 1\`
> **Output:** \`0\`
> **Explanation:** The sum that is closest to the target is 0. (0 + 0 + 0 = 0).

#### Constraints:
- 3 <= nums.length <= 500
- -1000 <= nums[i] <= 1000
- -10^4^ <= target <= 10^4^`,
		topics: ["array", "two-pointers", "sorting"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 16,
		rubric: {
			optimal_time: "O(n^2)",
			acceptable_time: ["O(n^3)"],
		},
		parameterNames: ["nums", "target"],
		tests: [
			{ input: [[-1, 2, 1, -4], 1], output: 2 },
			{ input: [[0, 0, 0], 1], output: 0 },
			{ input: [[1, 1, 1, 0], -100], output: 2 },
			{ input: [[1, 1, 1, 0], 100], output: 3 },
			{ input: [[-1, 0, 1, 2], 3], output: 3 },
			{ input: [[-1, 0, 1, 2], 0], output: 0 },
			{ input: [[-1, 2, 1, -4], 1], output: 2 },
			{ input: [[1, 1, 1, 0], -1], output: 2 },
			{ input: [[0, 2, 1, -3], 1], output: 0 },
			{ input: [[1, 2, 5, 10, 11], 12], output: 13 },
			{ input: [[-4, -1, 1, 2], 1], output: 2 },
			{ input: [[1, 2, 4, 8, 16, 32, 64, 128], 82], output: 82 },
			{ input: [[-1, 2, 1, -4], 2], output: 2 },
			{ input: [[0, 1, 2], 3], output: 3 },
			{ input: [[-10, -5, 0, 5, 10], 7], output: 5 },
			{ input: [[-10, -5, 0, 5, 10], -7], output: -5 },
			{ input: [[-10, -5, 0, 5, 10], 0], output: 0 },
			{ input: [[1, 2, 3], 100], output: 6 },
			{ input: [[1, 2, 3], -100], output: 6 },
			{ input: [[-1, 0, 1], 0], output: 0 },
			{ input: [[-1, 0, 1], 1], output: 0 },
			{ input: [[-1, 0, 1], -1], output: 0 },
			{ input: [[1, 1, 1], 1], output: 3 },
			{ input: [[1, 1, 1], 5], output: 3 },
			{ input: [[-3, -2, -1, 0, 1, 2, 3], 0], output: 0 },
			{ input: [[-3, -2, -1, 0, 1, 2, 3], 5], output: 6 },
			{ input: [[-3, -2, -1, 0, 1, 2, 3], -5], output: -6 },
			{ input: [[-100, -50, -25, 0, 25, 50, 100], 75], output: 75 },
			{ input: [[-100, -50, -25, 0, 25, 50, 100], -75], output: -75 },
			{
				input: [
					[0, 5, -1, -2, 4, -1, 0, -3, 2, -5, 1, -4, 4, 6, -3],
					0,
				],
				output: 0,
			},
			{ input: [[1, 2, 4, 8, 16], 10], output: 7 },
			{ input: [[-10, 5, 3, 1, -5], 3], output: 3 },
			{ input: [[-10, 5, 3, 1, -5], -3], output: -4 },
			{ input: [[1, 2, 3, 4, 5], 9], output: 9 },
			{ input: [[1, 2, 3, 4, 5], 8], output: 9 },
			{ input: [[1, 2, 3, 4, 5], 10], output: 9 },
			{ input: [[-5, -4, -3, -2, -1], -10], output: -12 },
			{ input: [[-5, -4, -3, -2, -1], -8], output: -9 },
			{ input: [[10, 20, 30, 40, 50], 60], output: 60 },
			{ input: [[10, 20, 30, 40, 50], 100], output: 90 },
			{ input: [[0, 1, 2, 3, 4, 5], 6], output: 6 },
			{ input: [[0, 1, 2, 3, 4, 5], 7], output: 9 },
			{ input: [[-1, 0, 1, 2, -1, -4], 1], output: 2 },
			{ input: [[-1, 0, 1, 2, -1, -4], 0], output: 0 },
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function threeSumClosest(nums, target) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function threeSumClosest(nums, target) {
  nums.sort((a, b) => a - b);
  let closestSum = nums[0] + nums[1] + nums[2];
  const n = nums.length;
  
  for (let i = 0; i < n - 2; i++) {
    let left = i + 1;
    let right = n - 1;
    
    while (left < right) {
      const currentSum = nums[i] + nums[left] + nums[right];
      
      if (Math.abs(currentSum - target) < Math.abs(closestSum - target)) {
        closestSum = currentSum;
      }
      
      if (currentSum < target) {
        left++;
      } else if (currentSum > target) {
        right--;
      } else {
        return currentSum;
      }
    }
  }
  
  return closestSum;
}`,
		},
	},
	{
		id: "letter-combinations-of-a-phone-number",
		slug: "letter-combinations-of-a-phone-number",
		title: "Letter Combinations of a Phone Number",
		statementMd: `Given a string containing digits from \`2-9\` inclusive, return all possible letter combinations that the number could represent. Return the answer in **any order**.

A mapping of digits to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.

| Digit | Letters |
|-------|---------|
| 2     | abc     |
| 3     | def     |
| 4     | ghi     |
| 5     | jkl     |
| 6     | mno     |
| 7     | pqrs    |
| 8     | tuv     |
| 9     | wxyz    |

#### Example 1:
> **Input:** \`digits = "23"\`
> **Output:** \`["ad","ae","af","bd","be","bf","cd","ce","cf"]\`

#### Example 2:
> **Input:** \`digits = ""\`
> **Output:** \`[]\`

#### Example 3:
> **Input:** \`digits = "2"\`
> **Output:** \`["a","b","c"]\`

#### Constraints:
- 0 <= digits.length <= 4
- \`digits[i]\` is a digit in the range \`['2', '9']\`.`,
		topics: ["hash-table", "string", "backtracking"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 17,
		rubric: {
			optimal_time: "O(4^n)",
			acceptable_time: ["O(4^n)"],
		},
		parameterNames: ["digits"],
		tests: [
			{
				input: ["23"],
				output: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"],
			},
			{ input: [""], output: [] },
			{ input: ["2"], output: ["a", "b", "c"] },
			{ input: ["3"], output: ["d", "e", "f"] },
			{ input: ["4"], output: ["g", "h", "i"] },
			{ input: ["5"], output: ["j", "k", "l"] },
			{ input: ["6"], output: ["m", "n", "o"] },
			{ input: ["7"], output: ["p", "q", "r", "s"] },
			{ input: ["8"], output: ["t", "u", "v"] },
			{ input: ["9"], output: ["w", "x", "y", "z"] },
			{
				input: ["22"],
				output: ["aa", "ab", "ac", "ba", "bb", "bc", "ca", "cb", "cc"],
			},
			{
				input: ["24"],
				output: ["ag", "ah", "ai", "bg", "bh", "bi", "cg", "ch", "ci"],
			},
			{
				input: ["27"],
				output: [
					"ap",
					"aq",
					"ar",
					"as",
					"bp",
					"bq",
					"br",
					"bs",
					"cp",
					"cq",
					"cr",
					"cs",
				],
			},
			{
				input: ["29"],
				output: [
					"aw",
					"ax",
					"ay",
					"az",
					"bw",
					"bx",
					"by",
					"bz",
					"cw",
					"cx",
					"cy",
					"cz",
				],
			},
			{
				input: ["234"],
				output: [
					"adg",
					"adh",
					"adi",
					"aeg",
					"aeh",
					"aei",
					"afg",
					"afh",
					"afi",
					"bdg",
					"bdh",
					"bdi",
					"beg",
					"beh",
					"bei",
					"bfg",
					"bfh",
					"bfi",
					"cdg",
					"cdh",
					"cdi",
					"ceg",
					"ceh",
					"cei",
					"cfg",
					"cfh",
					"cfi",
				],
			},
			{
				input: ["567"],
				output: [
					"jmp",
					"jmq",
					"jmr",
					"jms",
					"jnp",
					"jnq",
					"jnr",
					"jns",
					"jop",
					"joq",
					"jor",
					"jos",
					"kmp",
					"kmq",
					"kmr",
					"kms",
					"knp",
					"knq",
					"knr",
					"kns",
					"kop",
					"koq",
					"kor",
					"kos",
					"lmp",
					"lmq",
					"lmr",
					"lms",
					"lnp",
					"lnq",
					"lnr",
					"lns",
					"lop",
					"loq",
					"lor",
					"los",
				],
			},
			{
				input: ["789"],
				output: [
					"ptw",
					"ptx",
					"pty",
					"ptz",
					"puw",
					"pux",
					"puy",
					"puz",
					"pvw",
					"pvx",
					"pvy",
					"pvz",
					"qtw",
					"qtx",
					"qty",
					"qtz",
					"quw",
					"qux",
					"quy",
					"quz",
					"qvw",
					"qvx",
					"qvy",
					"qvz",
					"rtw",
					"rtx",
					"rty",
					"rtz",
					"ruw",
					"rux",
					"ruy",
					"ruz",
					"rvw",
					"rvx",
					"rvy",
					"rvz",
					"stw",
					"stx",
					"sty",
					"stz",
					"suw",
					"sux",
					"suy",
					"suz",
					"svw",
					"svx",
					"svy",
					"svz",
				],
			},
			{
				input: ["2345"],
				output: [
					"adgj",
					"adgk",
					"adgl",
					"adhj",
					"adhk",
					"adhl",
					"adij",
					"adik",
					"adil",
					"aegj",
					"aegk",
					"aegl",
					"aehj",
					"aehk",
					"aehl",
					"aeij",
					"aeik",
					"aeil",
					"afgj",
					"afgk",
					"afgl",
					"afhj",
					"afhk",
					"afhl",
					"afij",
					"afik",
					"afil",
					"bdgj",
					"bdgk",
					"bdgl",
					"bdhj",
					"bdhk",
					"bdhl",
					"bdij",
					"bdik",
					"bdil",
					"begj",
					"begk",
					"begl",
					"behj",
					"behk",
					"behl",
					"beij",
					"beik",
					"beil",
					"bfgj",
					"bfgk",
					"bfgl",
					"bfhj",
					"bfhk",
					"bfhl",
					"bfij",
					"bfik",
					"bfil",
					"cdgj",
					"cdgk",
					"cdgl",
					"cdhj",
					"cdhk",
					"cdhl",
					"cdij",
					"cdik",
					"cdil",
					"cegj",
					"cegk",
					"cegl",
					"cehj",
					"cehk",
					"cehl",
					"ceij",
					"ceik",
					"ceil",
					"cfgj",
					"cfgk",
					"cfgl",
					"cfhj",
					"cfhk",
					"cfhl",
					"cfij",
					"cfik",
					"cfil",
				],
			},
			{
				input: ["9999"],
				output: (() => {
					const letters = ["w", "x", "y", "z"];
					const result = [];
					for (let a = 0; a < 4; a++) {
						for (let b = 0; b < 4; b++) {
							for (let c = 0; c < 4; c++) {
								for (let d = 0; d < 4; d++) {
									result.push(
										letters[a] +
											letters[b] +
											letters[c] +
											letters[d]
									);
								}
							}
						}
					}
					return result;
				})(),
			},
			{
				input: ["79"],
				output: [
					"pw",
					"px",
					"py",
					"pz",
					"qw",
					"qx",
					"qy",
					"qz",
					"rw",
					"rx",
					"ry",
					"rz",
					"sw",
					"sx",
					"sy",
					"sz",
				],
			},
			{
				input: ["46"],
				output: ["gm", "gn", "go", "hm", "hn", "ho", "im", "in", "io"],
			},
			{
				input: ["58"],
				output: ["jt", "ju", "jv", "kt", "ku", "kv", "lt", "lu", "lv"],
			},
			{
				input: ["67"],
				output: [
					"mp",
					"mq",
					"mr",
					"ms",
					"np",
					"nq",
					"nr",
					"ns",
					"op",
					"oq",
					"or",
					"os",
				],
			},
			{
				input: ["38"],
				output: ["dt", "du", "dv", "et", "eu", "ev", "ft", "fu", "fv"],
			},
			{
				input: ["92"],
				output: [
					"wa",
					"wb",
					"wc",
					"xa",
					"xb",
					"xc",
					"ya",
					"yb",
					"yc",
					"za",
					"zb",
					"zc",
				],
			},
			{
				input: ["235"],
				output: [
					"adj",
					"adk",
					"adl",
					"aej",
					"aek",
					"ael",
					"afj",
					"afk",
					"afl",
					"bdj",
					"bdk",
					"bdl",
					"bej",
					"bek",
					"bel",
					"bfj",
					"bfk",
					"bfl",
					"cdj",
					"cdk",
					"cdl",
					"cej",
					"cek",
					"cel",
					"cfj",
					"cfk",
					"cfl",
				],
			},
			{
				input: ["237"],
				output: [
					"adp",
					"adq",
					"adr",
					"ads",
					"aep",
					"aeq",
					"aer",
					"aes",
					"afp",
					"afq",
					"afr",
					"afs",
					"bdp",
					"bdq",
					"bdr",
					"bds",
					"bep",
					"beq",
					"ber",
					"bes",
					"bfp",
					"bfq",
					"bfr",
					"bfs",
					"cdp",
					"cdq",
					"cdr",
					"cds",
					"cep",
					"ceq",
					"cer",
					"ces",
					"cfp",
					"cfq",
					"cfr",
					"cfs",
				],
			},
			{
				input: ["238"],
				output: [
					"adt",
					"adu",
					"adv",
					"aet",
					"aeu",
					"aev",
					"aft",
					"afu",
					"afv",
					"bdt",
					"bdu",
					"bdv",
					"bet",
					"beu",
					"bev",
					"bft",
					"bfu",
					"bfv",
					"cdt",
					"cdu",
					"cdv",
					"cet",
					"ceu",
					"cev",
					"cft",
					"cfu",
					"cfv",
				],
			},
			{
				input: ["239"],
				output: [
					"adw",
					"adx",
					"ady",
					"adz",
					"aew",
					"aex",
					"aey",
					"aez",
					"afw",
					"afx",
					"afy",
					"afz",
					"bdw",
					"bdx",
					"bdy",
					"bdz",
					"bew",
					"bex",
					"bey",
					"bez",
					"bfw",
					"bfx",
					"bfy",
					"bfz",
					"cdw",
					"cdx",
					"cdy",
					"cdz",
					"cew",
					"cex",
					"cey",
					"cez",
					"cfw",
					"cfx",
					"cfy",
					"cfz",
				],
			},
			{
				input: ["246"],
				output: [
					"agm",
					"agn",
					"ago",
					"ahm",
					"ahn",
					"aho",
					"aim",
					"ain",
					"aio",
					"bgm",
					"bgn",
					"bgo",
					"bhm",
					"bhn",
					"bho",
					"bim",
					"bin",
					"bio",
					"cgm",
					"cgn",
					"cgo",
					"chm",
					"chn",
					"cho",
					"cim",
					"cin",
					"cio",
				],
			},
			{
				input: ["267"],
				output: [
					"amp",
					"amq",
					"amr",
					"ams",
					"anp",
					"anq",
					"anr",
					"ans",
					"aop",
					"aoq",
					"aor",
					"aos",
					"bmp",
					"bmq",
					"bmr",
					"bms",
					"bnp",
					"bnq",
					"bnr",
					"bns",
					"bop",
					"boq",
					"bor",
					"bos",
					"cmp",
					"cmq",
					"cmr",
					"cms",
					"cnp",
					"cnq",
					"cnr",
					"cns",
					"cop",
					"coq",
					"cor",
					"cos",
				],
			},
			{
				input: ["289"],
				output: [
					"atw",
					"atx",
					"aty",
					"atz",
					"auw",
					"aux",
					"auy",
					"auz",
					"avw",
					"avx",
					"avy",
					"avz",
					"btw",
					"btx",
					"bty",
					"btz",
					"buw",
					"bux",
					"buy",
					"buz",
					"bvw",
					"bvx",
					"bvy",
					"bvz",
					"ctw",
					"ctx",
					"cty",
					"ctz",
					"cuw",
					"cux",
					"cuy",
					"cuz",
					"cvw",
					"cvx",
					"cvy",
					"cvz",
				],
			},
			{
				input: ["345"],
				output: [
					"dgj",
					"dgk",
					"dgl",
					"dhj",
					"dhk",
					"dhl",
					"dij",
					"dik",
					"dil",
					"egj",
					"egk",
					"egl",
					"ehj",
					"ehk",
					"ehl",
					"eij",
					"eik",
					"eil",
					"fgj",
					"fgk",
					"fgl",
					"fhj",
					"fhk",
					"fhl",
					"fij",
					"fik",
					"fil",
				],
			},
			{
				input: ["347"],
				output: [
					"dgp",
					"dgq",
					"dgr",
					"dgs",
					"dhp",
					"dhq",
					"dhr",
					"dhs",
					"dip",
					"diq",
					"dir",
					"dis",
					"egp",
					"egq",
					"egr",
					"egs",
					"ehp",
					"ehq",
					"ehr",
					"ehs",
					"eip",
					"eiq",
					"eir",
					"eis",
					"fgp",
					"fgq",
					"fgr",
					"fgs",
					"fhp",
					"fhq",
					"fhr",
					"fhs",
					"fip",
					"fiq",
					"fir",
					"fis",
				],
			},
			{
				input: ["349"],
				output: [
					"dgw",
					"dgx",
					"dgy",
					"dgz",
					"dhw",
					"dhx",
					"dhy",
					"dhz",
					"diw",
					"dix",
					"diy",
					"diz",
					"egw",
					"egx",
					"egy",
					"egz",
					"ehw",
					"ehx",
					"ehy",
					"ehz",
					"eiw",
					"eix",
					"eiy",
					"eiz",
					"fgw",
					"fgx",
					"fgy",
					"fgz",
					"fhw",
					"fhx",
					"fhy",
					"fhz",
					"fiw",
					"fix",
					"fiy",
					"fiz",
				],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {string} digits
 * @return {string[]}
 */
function letterCombinations(digits) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function letterCombinations(digits) {
  if (digits.length === 0) return [];
  
  const digitToLetters = {
    '2': 'abc',
    '3': 'def',
    '4': 'ghi',
    '5': 'jkl',
    '6': 'mno',
    '7': 'pqrs',
    '8': 'tuv',
    '9': 'wxyz'
  };
  
  const result = [];
  
  function backtrack(index, currentCombination) {
    if (index === digits.length) {
      result.push(currentCombination);
      return;
    }
    
    const digit = digits[index];
    const letters = digitToLetters[digit];
    
    for (let i = 0; i < letters.length; i++) {
      backtrack(index + 1, currentCombination + letters[i]);
    }
  }
  
  backtrack(0, '');
  return result;
}`,
		},
	},
	{
		id: "4sum",
		slug: "4sum",
		title: "4Sum",
		statementMd: `Given an array \`nums\` of \`n\` integers, return *an array of all the **unique** quadruplets* \`[nums[a], nums[b], nums[c], nums[d]]\` such that:

- \`0 <= a, b, c, d < n\`
- \`a\`, \`b\`, \`c\`, and \`d\` are **distinct**.
- \`nums[a] + nums[b] + nums[c] + nums[d] == target\`

You may return the answer in **any order**.

#### Example 1:
> **Input:** \`nums = [1,0,-1,0,-2,2]\`, \`target = 0\`
> **Output:** \`[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]\`

#### Example 2:
> **Input:** \`nums = [2,2,2,2,2]\`, \`target = 8\`
> **Output:** \`[[2,2,2,2]]\`

#### Constraints:
- 1 <= nums.length <= 200
- -10^9^ <= nums[i] <= 10^9^
- -10^9^ <= target <= 10^9^`,
		topics: ["array", "two-pointers", "sorting"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 18,
		rubric: {
			optimal_time: "O(n^3)",
			acceptable_time: ["O(n^4)"],
		},
		parameterNames: ["nums", "target"],
		tests: [
			{
				input: [[1, 0, -1, 0, -2, 2], 0],
				output: [
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-1, 0, 0, 1],
				],
			},
			{ input: [[2, 2, 2, 2, 2], 8], output: [[2, 2, 2, 2]] },
			{
				input: [[1, 0, -1, 0, -2, 2], 1],
				output: [
					[-2, 0, 1, 2],
					[-1, 0, 0, 2],
				],
			},
			{
				input: [[-2, -1, 0, 0, 1, 2], 0],
				output: [
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-1, 0, 0, 1],
				],
			},
			{
				input: [[1, 0, -1, 0, -2, 2], 0],
				output: [
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-1, 0, 0, 1],
				],
			},
			{
				input: [[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], 0],
				output: [
					[-5, -4, 4, 5],
					[-5, -3, 3, 5],
					[-5, -2, 2, 5],
					[-5, -2, 3, 4],
					[-5, -1, 1, 5],
					[-5, -1, 2, 4],
					[-5, 0, 0, 5],
					[-5, 0, 1, 4],
					[-5, 0, 2, 3],
					[-4, -3, 2, 5],
					[-4, -3, 3, 4],
					[-4, -2, 1, 5],
					[-4, -2, 2, 4],
					[-4, -2, 3, 3],
					[-4, -1, 0, 5],
					[-4, -1, 1, 4],
					[-4, -1, 2, 3],
					[-4, 0, 0, 4],
					[-4, 0, 1, 3],
					[-4, 0, 2, 2],
					[-4, 1, 1, 2],
					[-3, -2, 0, 5],
					[-3, -2, 1, 4],
					[-3, -2, 2, 3],
					[-3, -1, 0, 4],
					[-3, -1, 1, 3],
					[-3, -1, 2, 2],
					[-3, 0, 0, 3],
					[-3, 0, 1, 2],
					[-3, 1, 1, 1],
					[-2, -1, 0, 3],
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-2, 0, 1, 1],
					[-1, 0, 0, 1],
				],
			},
			{ input: [[1, 1, 1, 1], 4], output: [[1, 1, 1, 1]] },
			{ input: [[1, 1, 1, 1], 5], output: [] },
			{
				input: [[-3, -1, 0, 2, 4, 5], 0],
				output: [
					[-3, -1, 0, 4],
					[-3, -1, 2, 2],
					[-1, 0, 0, 1],
				],
			},
			{ input: [[-2, -1, 1, 2], 0], output: [[-2, -1, 1, 2]] },
			{ input: [[0, 0, 0, 0], 0], output: [[0, 0, 0, 0]] },
			{ input: [[0, 0, 0, 0], 1], output: [] },
			{
				input: [[1, -2, -5, -4, -3, 3, 3, 5], -11],
				output: [[-5, -4, -3, 1]],
			},
			{
				input: [[-1, 0, 1, 0, -2, 2], 0],
				output: [
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-1, 0, 0, 1],
				],
			},
			{
				input: [[-3, -2, -1, 0, 0, 1, 2, 3], 0],
				output: [
					[-3, -2, 2, 3],
					[-3, -1, 1, 3],
					[-3, 0, 0, 3],
					[-3, 0, 1, 2],
					[-2, -1, 0, 3],
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-2, 0, 1, 1],
					[-1, 0, 0, 1],
				],
			},
			{
				input: [[1, 0, -1, 0, -2, 2, 3], 0],
				output: [
					[-2, -1, 0, 3],
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-1, 0, 0, 1],
				],
			},
			{
				input: [
					[1000000000, 1000000000, 1000000000, 1000000000],
					-294967296,
				],
				output: [],
			},
			{
				input: [[-1, -5, -5, -3, 2, 5, 0, 4], -7],
				output: [
					[-5, -5, -1, 4],
					[-5, -3, -1, 2],
					[-5, -3, 0, 1],
				],
			},
			{
				input: [[-3, -2, -1, 0, 0, 1, 2, 3], 1],
				output: [
					[-3, -2, 3, 3],
					[-3, -1, 2, 3],
					[-3, 0, 1, 3],
					[-3, 0, 2, 2],
					[-3, 1, 1, 2],
					[-2, -1, 1, 3],
					[-2, -1, 2, 2],
					[-2, 0, 0, 3],
					[-2, 0, 1, 2],
					[-2, 1, 1, 1],
					[-1, 0, 0, 2],
					[-1, 0, 1, 1],
					[0, 0, 0, 1],
				],
			},
			{
				input: [[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4], 0],
				output: [
					[-5, -4, 1, 8],
					[-5, -4, 2, 7],
					[-5, -3, 0, 8],
					[-5, -3, 1, 7],
					[-5, -3, 2, 6],
					[-5, -2, -1, 8],
					[-5, -2, 0, 7],
					[-5, -2, 1, 6],
					[-5, -2, 2, 5],
					[-5, -1, 0, 6],
					[-5, -1, 1, 5],
					[-5, -1, 2, 4],
					[-5, 0, 1, 4],
					[-5, 0, 2, 3],
					[-5, 1, 2, 2],
					[-4, -3, -1, 8],
					[-4, -3, 0, 7],
					[-4, -3, 1, 6],
					[-4, -3, 2, 5],
					[-4, -2, 0, 6],
					[-4, -2, 1, 5],
					[-4, -2, 2, 4],
					[-4, -1, 0, 5],
					[-4, -1, 1, 4],
					[-4, -1, 2, 3],
					[-4, 0, 1, 3],
					[-4, 0, 2, 2],
					[-4, 1, 1, 2],
					[-3, -2, 0, 5],
					[-3, -2, 1, 4],
					[-3, -2, 2, 3],
					[-3, -1, 0, 4],
					[-3, -1, 1, 3],
					[-3, -1, 2, 2],
					[-3, 0, 1, 2],
					[-3, 1, 1, 1],
					[-2, -1, 0, 3],
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-2, 0, 1, 1],
					[-1, 0, 0, 1],
				],
			},
			{
				input: [[0, 1, 2, 3, 4, 5, 6, 7], 14],
				output: [
					[0, 1, 6, 7],
					[0, 2, 5, 7],
					[0, 2, 6, 6],
					[0, 3, 4, 7],
					[0, 3, 5, 6],
					[0, 4, 4, 6],
					[0, 4, 5, 5],
					[1, 1, 5, 7],
					[1, 1, 6, 6],
					[1, 2, 4, 7],
					[1, 2, 5, 6],
					[1, 3, 3, 7],
					[1, 3, 4, 6],
					[1, 3, 5, 5],
					[1, 4, 4, 5],
					[2, 2, 3, 7],
					[2, 2, 4, 6],
					[2, 2, 5, 5],
					[2, 3, 3, 6],
					[2, 3, 4, 5],
					[2, 4, 4, 4],
					[3, 3, 3, 5],
					[3, 3, 4, 4],
				],
			},
			{ input: [[-5, 5, -5, 5], 0], output: [[-5, -5, 5, 5]] },
			{ input: [[1, 2, 3, 4], 10], output: [[1, 2, 3, 4]] },
			{ input: [[1, 2, 3, 4], 10], output: [[1, 2, 3, 4]] },
			{
				input: [[-10, -5, 0, 5, 10], 0],
				output: [
					[-10, -5, 5, 10],
					[-10, 0, 0, 10],
					[-5, -5, 5, 5],
					[-5, 0, 0, 5],
				],
			},
			{
				input: [[-10, -5, 0, 5, 10], 5],
				output: [
					[-10, 0, 5, 10],
					[-10, 5, 5, 5],
					[-5, -5, 5, 10],
					[-5, 0, 0, 10],
					[-5, 0, 5, 5],
					[0, 0, 0, 5],
				],
			},
			{ input: [[-1, 0, -1, 2], 0], output: [[-1, -1, 0, 2]] },
			{ input: [[1, 1, 1, 1, 1, 1, 1, 1], 4], output: [[1, 1, 1, 1]] },
			{
				input: [[-1, 0, 1, 2, -1, -4], 0],
				output: [
					[-4, -1, 1, 4],
					[-4, 0, 0, 4],
					[-1, -1, 0, 2],
					[-1, 0, 0, 1],
				],
			},
			{
				input: [[-3, -1, 0, 2, 4, 5], 2],
				output: [
					[-3, -1, 2, 4],
					[-3, 0, 1, 4],
					[-1, 0, 0, 3],
					[-1, 0, 1, 2],
				],
			},
			{ input: [[0, 0, 0, 0, 0, 0, 0, 0], 0], output: [[0, 0, 0, 0]] },
			{
				input: [[-2, -1, 0, 1, 2], 0],
				output: [
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-1, 0, 0, 1],
				],
			},
			{
				input: [[-1, 0, 1, 2, -1, -4, -2, -3, 3, 0, 4], 0],
				output: [
					[-4, -3, 3, 4],
					[-4, -2, 2, 4],
					[-4, -1, 1, 4],
					[-4, 0, 0, 4],
					[-4, 0, 1, 3],
					[-4, 0, 2, 2],
					[-3, -2, 1, 4],
					[-3, -2, 2, 3],
					[-3, -1, 0, 4],
					[-3, -1, 1, 3],
					[-3, -1, 2, 2],
					[-3, 0, 0, 3],
					[-3, 0, 1, 2],
					[-3, 1, 1, 1],
					[-2, -1, 0, 3],
					[-2, -1, 1, 2],
					[-2, 0, 0, 2],
					[-2, 0, 1, 1],
					[-1, -1, 0, 2],
					[-1, 0, 0, 1],
				],
			},
			{
				input: [[-3, -1, 0, 2, 4, 5], 1],
				output: [
					[-3, -1, 2, 3],
					[-3, 0, 0, 4],
					[-3, 0, 1, 3],
					[-1, 0, 0, 2],
					[-1, 0, 1, 1],
				],
			},
			{
				input: [[1, 0, -1, 0, -2, 2], 2],
				output: [
					[-2, -1, 2, 3],
					[-2, 0, 1, 3],
					[-2, 0, 2, 2],
					[-1, 0, 0, 3],
					[-1, 0, 1, 2],
					[0, 0, 0, 2],
					[0, 0, 1, 1],
				],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8], 18],
				output: [
					[1, 2, 7, 8],
					[1, 3, 6, 8],
					[1, 3, 7, 7],
					[1, 4, 5, 8],
					[1, 4, 6, 7],
					[1, 5, 5, 7],
					[1, 5, 6, 6],
					[2, 2, 6, 8],
					[2, 2, 7, 7],
					[2, 3, 5, 8],
					[2, 3, 6, 7],
					[2, 4, 4, 8],
					[2, 4, 5, 7],
					[2, 4, 6, 6],
					[2, 5, 5, 6],
					[3, 3, 4, 8],
					[3, 3, 5, 7],
					[3, 3, 6, 6],
					[3, 4, 4, 7],
					[3, 4, 5, 6],
					[3, 5, 5, 5],
					[4, 4, 4, 6],
					[4, 4, 5, 5],
				],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
function fourSum(nums, target) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function fourSum(nums, target) {
  nums.sort((a, b) => a - b);
  const result = [];
  const n = nums.length;
  
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) continue;
      
      let left = j + 1;
      let right = n - 1;
      
      while (left < right) {
        const sum = nums[i] + nums[j] + nums[left] + nums[right];
        
        if (sum === target) {
          result.push([nums[i], nums[j], nums[left], nums[right]]);
          
          while (left < right && nums[left] === nums[left + 1]) left++;
          while (left < right && nums[right] === nums[right - 1]) right--;
          
          left++;
          right--;
        } else if (sum < target) {
          left++;
        } else {
          right--;
        }
      }
    }
  }
  
  return result;
}`,
		},
	},
	{
		id: "remove-nth-node-from-end-of-list",
		slug: "remove-nth-node-from-end-of-list",
		title: "Remove Nth Node From End of List",
		statementMd: `Given the head of a linked list, remove the \`n^th^\` node from the end of the list and return its head.

**Note:** In this implementation, linked lists are represented as arrays where each element is a node value. The function should return an array with the \`n^th^\` node from the end removed.

#### Example 1:
> **Input:** \`head = [1,2,3,4,5]\`, \`n = 2\`
> **Output:** \`[1,2,3,5]\`

#### Example 2:
> **Input:** \`head = [1]\`, \`n = 1\`
> **Output:** \`[]\`

#### Example 3:
> **Input:** \`head = [1,2]\`, \`n = 1\`
> **Output:** \`[1]\`

#### Constraints:
- The number of nodes in the list is \`sz\`.
- 1 <= sz <= 30
- 0 <= Node.val <= 100
- 1 <= n <= sz`,
		topics: ["linked-list", "two-pointers"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 19,
		rubric: {
			optimal_time: "O(L)",
			acceptable_time: ["O(L)"],
		},
		parameterNames: ["head", "n"],
		tests: [
			{ input: [[1, 2, 3, 4, 5], 2], output: [1, 2, 3, 5] },
			{ input: [[1], 1], output: [] },
			{ input: [[1, 2], 1], output: [1] },
			{ input: [[1, 2], 2], output: [2] },
			{ input: [[1, 2, 3], 1], output: [1, 2] },
			{ input: [[1, 2, 3], 2], output: [1, 3] },
			{ input: [[1, 2, 3], 3], output: [2, 3] },
			{ input: [[1, 2, 3, 4], 1], output: [1, 2, 3] },
			{ input: [[1, 2, 3, 4], 2], output: [1, 2, 4] },
			{ input: [[1, 2, 3, 4], 3], output: [1, 3, 4] },
			{ input: [[1, 2, 3, 4], 4], output: [2, 3, 4] },
			{ input: [[1, 2, 3, 4, 5, 6], 1], output: [1, 2, 3, 4, 5] },
			{ input: [[1, 2, 3, 4, 5, 6], 2], output: [1, 2, 3, 4, 6] },
			{ input: [[1, 2, 3, 4, 5, 6], 3], output: [1, 2, 3, 5, 6] },
			{ input: [[1, 2, 3, 4, 5, 6], 4], output: [1, 2, 4, 5, 6] },
			{ input: [[1, 2, 3, 4, 5, 6], 5], output: [1, 3, 4, 5, 6] },
			{ input: [[1, 2, 3, 4, 5, 6], 6], output: [2, 3, 4, 5, 6] },
			{ input: [[10, 20, 30, 40, 50], 1], output: [10, 20, 30, 40] },
			{ input: [[10, 20, 30, 40, 50], 2], output: [10, 20, 30, 50] },
			{ input: [[10, 20, 30, 40, 50], 3], output: [10, 20, 40, 50] },
			{ input: [[10, 20, 30, 40, 50], 4], output: [10, 30, 40, 50] },
			{ input: [[10, 20, 30, 40, 50], 5], output: [20, 30, 40, 50] },
			{ input: [[0], 1], output: [] },
			{ input: [[5, 10], 1], output: [5] },
			{ input: [[5, 10], 2], output: [10] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5],
				output: [1, 2, 3, 4, 5, 7, 8, 9, 10],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10],
				output: [2, 3, 4, 5, 6, 7, 8, 9, 10],
			},
			{ input: [[100], 1], output: [] },
			{ input: [[1, 2, 3, 4, 5, 6, 7], 4], output: [1, 2, 3, 5, 6, 7] },
			{ input: [[1, 2, 3, 4, 5, 6, 7], 7], output: [2, 3, 4, 5, 6, 7] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 1],
				output: [1, 2, 3, 4, 5, 6, 7, 8],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 9],
				output: [2, 3, 4, 5, 6, 7, 8, 9],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 5],
				output: [1, 2, 3, 4, 6, 7, 8, 9],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 3],
				output: [1, 2, 3, 4, 5, 7, 8, 9],
			},
			{ input: [[10, 20, 30], 1], output: [10, 20] },
			{ input: [[10, 20, 30], 2], output: [10, 30] },
			{ input: [[10, 20, 30], 3], output: [20, 30] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8], 1],
				output: [1, 2, 3, 4, 5, 6, 7],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8], 8],
				output: [2, 3, 4, 5, 6, 7, 8],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8], 4],
				output: [1, 2, 3, 4, 6, 7, 8],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} head
 * @param {number} n
 * @return {number[]}
 */
function removeNthFromEnd(head, n) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function removeNthFromEnd(head, n) {
  const dummy = { val: 0, next: null };
  let current = dummy;
  
  // Convert array to linked list
  for (let val of head) {
    current.next = { val, next: null };
    current = current.next;
  }
  
  let first = dummy;
  let second = dummy;
  
  // Move first pointer n+1 steps ahead
  for (let i = 0; i <= n; i++) {
    first = first.next;
  }
  
  // Move both pointers until first reaches end
  while (first !== null) {
    first = first.next;
    second = second.next;
  }
  
  // Remove the nth node
  second.next = second.next.next;
  
  // Convert linked list back to array
  const result = [];
  current = dummy.next;
  while (current !== null) {
    result.push(current.val);
    current = current.next;
  }
  
  return result;
}`,
		},
	},
	{
		id: "valid-parentheses",
		slug: "valid-parentheses",
		title: "Valid Parentheses",
		statementMd: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:

1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

#### Example 1:
> **Input:** \`s = "()"\`
> **Output:** \`true\`

#### Example 2:
> **Input:** \`s = "()[]{}"\`
> **Output:** \`true\`

#### Example 3:
> **Input:** \`s = "(]"\`
> **Output:** \`false\`

#### Example 4:
> **Input:** \`s = "([)]"\`
> **Output:** \`false\`

#### Example 5:
> **Input:** \`s = "{[]}"\`
> **Output:** \`true\`

#### Constraints:
- 1 <= s.length <= 10^4^
- \`s\` consists of parentheses only \`'()[]{}'\`.`,
		topics: ["string", "stack"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 20,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["s"],
		tests: [
			{ input: ["()"], output: true },
			{ input: ["()[]{}"], output: true },
			{ input: ["(]"], output: false },
			{ input: ["([)]"], output: false },
			{ input: ["{[]}"], output: true },
			{ input: [""], output: true },
			{ input: ["("], output: false },
			{ input: [")"], output: false },
			{ input: ["["], output: false },
			{ input: ["]"], output: false },
			{ input: ["{"], output: false },
			{ input: ["}"], output: false },
			{ input: ["()"], output: true },
			{ input: ["[]"], output: true },
			{ input: ["{}"], output: true },
			{ input: ["(())"], output: true },
			{ input: ["[[]]"], output: true },
			{ input: ["{{}}"], output: true },
			{ input: ["(()"], output: false },
			{ input: ["[[]"], output: false },
			{ input: ["{{}"], output: false },
			{ input: ["())"], output: false },
			{ input: ["[]]"], output: false },
			{ input: ["{}}"], output: false },
			{ input: ["((()))"], output: true },
			{ input: ["[[[]]]"], output: true },
			{ input: ["{{{}}}"], output: true },
			{ input: ["()[]{}"], output: true },
			{ input: ["([{}])"], output: true },
			{ input: ["([)]"], output: false },
			{ input: ["({[)]}"], output: false },
			{ input: ["([{}])"], output: true },
			{ input: ["({[]})"], output: true },
			{ input: ["([{}])"], output: true },
			{ input: ["((("], output: false },
			{ input: [")))"], output: false },
			{ input: ["[[["], output: false },
			{ input: ["]]]"], output: false },
			{ input: ["{{{"], output: false },
			{ input: ["}}}"], output: false },
			{ input: ["((()))"], output: true },
			{ input: ["[[[]]]"], output: true },
			{ input: ["{{{}}}"], output: true },
			{ input: ["()()()"], output: true },
			{ input: ["[][]"], output: true },
			{ input: ["{}{}"], output: true },
			{ input: ["([{}])"], output: true },
			{ input: ["({[]})"], output: true },
			{ input: ["([{()}])"], output: true },
			{ input: ["([)]"], output: false },
			{ input: ["(]"], output: false },
			{ input: ["([}"], output: false },
			{ input: ["{()}"], output: true },
			{ input: ["[()]"], output: true },
			{ input: ["({})"], output: true },
			{ input: ["{[()]}"], output: true },
			{ input: ["({[()]})"], output: true },
			{ input: ["((([[]])))"], output: true },
			{ input: ["(([)]))"], output: false },
			{ input: ["(([))"], output: false },
		],
		startingCode: {
			javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function isValid(s) {
  const stack = [];
  const mapping = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (let char of s) {
    if (char in mapping) {
      // Closing bracket
      if (stack.length === 0 || stack.pop() !== mapping[char]) {
        return false;
      }
    } else {
      // Opening bracket
      stack.push(char);
    }
  }
  
  return stack.length === 0;
}`,
		},
	},
];
