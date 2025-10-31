import { AlgoProblemDetail } from "@/types/algorithm-types";

export const algoProblems41to50: AlgoProblemDetail[] = [
	{
		id: "first-missing-positive",
		slug: "first-missing-positive",
		title: "First Missing Positive",
		statementMd: `Given an unsorted integer array \`nums\`, return the smallest missing positive integer.

You must implement an algorithm that runs in O(n) time and uses O(1) extra space.

#### Example 1:
> **Input:** \`nums = [1,2,0]\`
> **Output:** \`3\`
> **Explanation:** The numbers in the range [1,2] are all in the array.

#### Example 2:
> **Input:** \`nums = [3,4,-1,1]\`
> **Output:** \`2\`
> **Explanation:** 1 is in the array but 2 is missing.

#### Example 3:
> **Input:** \`nums = [7,8,9,11,12]\`
> **Output:** \`1\`
> **Explanation:** The smallest positive integer 1 is missing.

#### Constraints:
- 1 <= nums.length <= 10^5^
- -2^31^ <= nums[i] <= 2^31^ - 1`,
		topics: ["arrays", "hashmap"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 41,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n log n)", "O(n)"],
		},
		parameterNames: ["nums"],
		tests: [
			{ input: [[1, 2, 0]], output: 3 },
			{ input: [[3, 4, -1, 1]], output: 2 },
			{ input: [[7, 8, 9, 11, 12]], output: 1 },
			{ input: [[1]], output: 2 },
			{ input: [[2]], output: 1 },
			{ input: [[-1, -2, -3]], output: 1 },
			{ input: [[0]], output: 1 },
			{ input: [[1, 2, 3, 4, 5]], output: 6 },
			{ input: [[1, 1]], output: 2 },
			{ input: [[2, 2]], output: 1 },
			{ input: [[1, 3]], output: 2 },
			{ input: [[2, 3, 4]], output: 1 },
			{ input: [[1, 2, 3, 4, 6]], output: 5 },
			{ input: [[100]], output: 1 },
			{ input: [[-5, -10, 0, 5, 10]], output: 1 },
			{ input: [[1, 1000]], output: 2 },
			{ input: [[2, 1]], output: 3 },
			{ input: [[1, 2, 6, 3, 5, 4]], output: 7 },
			{ input: [[-1, 4, 2, 1, 9, 10]], output: 3 },
			{ input: [[0, -1, 3, 1]], output: 2 },
			{ input: [[-10, -20, 1]], output: 2 },
			{ input: [[5, 4, 3, 2, 1]], output: 6 },
			{ input: [[1, 2, 3, 4, 5, 7, 8, 9]], output: 6 },
			{ input: [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]], output: 11 },
			{ input: [[1, 3, 5, 7, 9]], output: 2 },
			{ input: [[2, 4, 6, 8]], output: 1 },
			{ input: [[1, 2, 4]], output: 3 },
			{ input: [[3, 1]], output: 2 },
			{ input: [[1, 2, 3, 5, 6, 7]], output: 4 },
			{ input: [[-1, 0, 1, 2, 3]], output: 4 },
			{ input: [[100, 99, 98, 97]], output: 1 },
			{ input: [[1, 1, 2, 2, 3, 3]], output: 4 },
			{ input: [[2, 2, 2, 2]], output: 1 },
			{ input: [[1, 1, 1, 1]], output: 2 },
			{ input: [[4, 5, 6, 7]], output: 1 },
			{ input: [[1, 2, 3, 4, 4, 5]], output: 6 },
			{ input: [[-1000, 1, 1000]], output: 2 },
			{ input: [[0, 1, 2]], output: 3 },
			{ input: [[-5, 1, 3, 5]], output: 2 },
			{ input: [[1, 2, 3, 10, 11, 12]], output: 4 },
			{ input: [[2147483647]], output: 1 },
			{ input: [[-2147483648, 1, 2, 3]], output: 4 },
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function firstMissingPositive(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function firstMissingPositive(nums) {
  const n = nums.length;
  
  // First pass: mark numbers that are out of range as n + 1
  for (let i = 0; i < n; i++) {
    if (nums[i] <= 0 || nums[i] > n) {
      nums[i] = n + 1;
    }
  }
  
  // Second pass: use array as hashmap by marking presence with negative sign
  for (let i = 0; i < n; i++) {
    const num = Math.abs(nums[i]);
    if (num <= n) {
      nums[num - 1] = -Math.abs(nums[num - 1]);
    }
  }
  
  // Third pass: find first positive index
  for (let i = 0; i < n; i++) {
    if (nums[i] > 0) {
      return i + 1;
    }
  }
  
  // All numbers from 1 to n are present
  return n + 1;
}`,
		},
	},
	{
		id: "trapping-rain-water",
		slug: "trapping-rain-water",
		title: "Trapping Rain Water",
		statementMd: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

#### Example 1:
> **Input:** \`height = [0,1,0,2,1,0,1,3,2,1,2,1]\`
> **Output:** \`6\`
> **Explanation:** The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.

#### Example 2:
> **Input:** \`height = [4,2,0,3,2,5]\`
> **Output:** \`9\`

#### Constraints:
- n == height.length
- 1 <= n <= 2 * 10^4^
- 0 <= height[i] <= 10^5^`,
		topics: ["arrays", "two-pointers", "dynamic-programming", "stack"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 42,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)", "O(n^2^)"],
		},
		parameterNames: ["height"],
		tests: [
			{ input: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], output: 6 },
			{ input: [[4, 2, 0, 3, 2, 5]], output: 9 },
			{ input: [[1, 0, 1]], output: 1 },
			{ input: [[1, 1]], output: 0 },
			{ input: [[1]], output: 0 },
			{ input: [[3, 0, 2, 0, 4]], output: 7 },
			{ input: [[0, 1, 0, 2, 0, 1, 0]], output: 2 },
			{ input: [[5, 4, 1, 2]], output: 1 },
			{ input: [[2, 0, 2]], output: 2 },
			{ input: [[0, 2, 0]], output: 0 },
			{ input: [[4, 2, 3]], output: 1 },
			{ input: [[1, 2, 3, 4, 5]], output: 0 },
			{ input: [[5, 4, 3, 2, 1]], output: 0 },
			{ input: [[5, 0, 5]], output: 5 },
			{ input: [[6, 4, 2, 0, 3, 2, 0, 3, 1, 4, 5, 3, 2, 7, 5, 3, 0, 1, 2, 1, 3, 4, 6, 8, 1, 3]], output: 83 },
			{ input: [[0, 5, 0, 5]], output: 5 },
			{ input: [[2, 1, 0, 3]], output: 3 },
			{ input: [[3, 2, 1, 0, 1, 2, 3]], output: 9 },
			{ input: [[1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], output: 6 },
			{ input: [[5, 5, 5, 5, 5]], output: 0 },
			{ input: [[0, 0, 0, 0, 0]], output: 0 },
			{ input: [[1, 2, 3, 2, 1]], output: 0 },
			{ input: [[3, 2, 1, 2, 3]], output: 4 },
			{ input: [[6, 0, 0, 0, 6]], output: 18 },
			{ input: [[1, 3, 2, 1, 2, 1, 5, 3, 3, 4, 2]], output: 8 },
			{ input: [[4, 2, 3]], output: 1 },
			{ input: [[2, 4, 3]], output: 0 },
			{ input: [[1, 0, 0, 0, 1]], output: 3 },
			{ input: [[5, 2, 3, 4, 5, 3, 2, 1]], output: 6 },
			{ input: [[10, 5, 8, 3, 2, 1, 9, 7, 6, 4, 3, 5, 8, 10, 7]], output: 49 },
			{ input: [[0, 1, 2, 3, 4, 3, 2, 1, 0]], output: 0 },
			{ input: [[7, 0, 4, 2, 5, 0, 6, 4, 0, 5]], output: 25 },
			{ input: [[1, 2, 1, 3, 1, 2, 1, 4, 1, 3, 2, 1, 2, 1]], output: 7 },
			{ input: [[9, 8, 2, 6]], output: 4 },
			{ input: [[5, 3, 7, 7, 6, 8, 2, 1, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1]], output: 18 },
			{ input: [[2, 8, 5, 5, 6, 1, 7, 4, 5]], output: 11 },
			{ input: [[0, 7, 1, 4, 6]], output: 7 },
			{ input: [[4, 9, 4, 5, 3, 2]], output: 1 },
			{ input: [[1, 7, 8, 9, 2, 3, 6, 5, 4, 3, 7, 1]], output: 17 },
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function trap(height) {
  if (height.length <= 2) return 0;
  
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        water += leftMax - height[left];
      }
      left++;
    } else {
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        water += rightMax - height[right];
      }
      right--;
    }
  }
  
  return water;
}`,
		},
	},
	{
		id: "multiply-strings",
		slug: "multiply-strings",
		title: "Multiply Strings",
		statementMd: `Given two non-negative integers \`num1\` and \`num2\` represented as strings, return the product of \`num1\` and \`num2\`, also represented as a string.

**Note:** You must not use any built-in BigInteger library or convert the inputs to integer directly.

#### Example 1:
> **Input:** \`num1 = "2"\`, \`num2 = "3"\`
> **Output:** \`"6"\`

#### Example 2:
> **Input:** \`num1 = "123"\`, \`num2 = "456"\`
> **Output:** \`"56088"\`

#### Constraints:
- 1 <= num1.length, num2.length <= 200
- num1 and num2 consist of digits only.
- Both num1 and num2 do not contain any leading zero, except the number 0 itself.`,
		topics: ["strings", "math", "simulation"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 43,
		rubric: {
			optimal_time: "O(m * n)",
			acceptable_time: ["O(m * n)", "O(m * n * log(m * n))"],
		},
		parameterNames: ["num1", "num2"],
		tests: [
			{ input: ["2", "3"], output: "6" },
			{ input: ["123", "456"], output: "56088" },
			{ input: ["0", "0"], output: "0" },
			{ input: ["1", "1"], output: "1" },
			{ input: ["9", "9"], output: "81" },
			{ input: ["10", "10"], output: "100" },
			{ input: ["99", "99"], output: "9801" },
			{ input: ["123", "0"], output: "0" },
			{ input: ["0", "123"], output: "0" },
			{ input: ["5", "12"], output: "60" },
			{ input: ["12", "5"], output: "60" },
			{ input: ["11", "11"], output: "121" },
			{ input: ["999", "999"], output: "998001" },
			{ input: ["2", "500"], output: "1000" },
			{ input: ["456", "789"], output: "359784" },
			{ input: ["100", "100"], output: "10000" },
			{ input: ["1", "999"], output: "999" },
			{ input: ["999", "1"], output: "999" },
			{ input: ["25", "25"], output: "625" },
			{ input: ["1234", "5678"], output: "7006652" },
			{ input: ["9", "99"], output: "891" },
			{ input: ["99", "9"], output: "891" },
			{ input: ["777", "888"], output: "689976" },
			{ input: ["111", "111"], output: "12321" },
			{ input: ["50", "50"], output: "2500" },
			{ input: ["12345", "67890"], output: "838102050" },
			{ input: ["7", "142857"], output: "999999" },
			{ input: ["142857", "7"], output: "999999" },
			{ input: ["1000", "1000"], output: "1000000" },
			{ input: ["33", "33"], output: "1089" },
			{ input: ["111111", "111111"], output: "12345654321" },
			{ input: ["123456789", "987654321"], output: "121932631112635269" },
			{ input: ["1", "100000"], output: "100000" },
			{ input: ["100000", "1"], output: "100000" },
			{ input: ["19", "19"], output: "361" },
			{ input: ["37", "37"], output: "1369" },
			{ input: ["256", "256"], output: "65536" },
			{ input: ["1024", "1024"], output: "1048576" },
			{ input: ["123456", "654321"], output: "80779853376" },
			{ input: ["999999", "999999"], output: "999998000001" },
		],
		startingCode: {
			javascript: `/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */
function multiply(num1, num2) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function multiply(num1, num2) {
  if (num1 === "0" || num2 === "0") return "0";
  
  const m = num1.length;
  const n = num2.length;
  const result = new Array(m + n).fill(0);
  
  // Multiply each digit
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const mul = parseInt(num1[i]) * parseInt(num2[j]);
      const p1 = i + j;
      const p2 = i + j + 1;
      
      const sum = mul + result[p2];
      result[p2] = sum % 10;
      result[p1] += Math.floor(sum / 10);
    }
  }
  
  // Remove leading zeros
  let start = 0;
  while (start < result.length && result[start] === 0) {
    start++;
  }
  
  return result.slice(start).join('');
}`,
		},
	},
	{
		id: "wildcard-matching",
		slug: "wildcard-matching",
		title: "Wildcard Matching",
		statementMd: `Given an input string (\`s\`) and a pattern (\`p\`), implement wildcard pattern matching with support for \`?\` and \`*\` where:

- \`?\` Matches any single character.
- \`*\` Matches any sequence of characters (including the empty sequence).

The matching should cover the **entire** input string (not partial).

#### Example 1:
> **Input:** \`s = "aa"\`, \`p = "a"\`
> **Output:** \`false\`
> **Explanation:** "a" does not match the entire string "aa".

#### Example 2:
> **Input:** \`s = "aa"\`, \`p = "*"\`
> **Output:** \`true\`
> **Explanation:** '*' matches any sequence.

#### Example 3:
> **Input:** \`s = "cb"\`, \`p = "?a"\`
> **Output:** \`false\`
> **Explanation:** '?' matches 'c', but the second letter is 'a', which does not match 'b'.

#### Constraints:
- 0 <= s.length, p.length <= 2000
- s contains only lowercase English letters.
- p contains only lowercase English letters, \`?\`, or \`*\`.`,
		topics: ["strings", "dynamic-programming", "greedy", "recursion"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 44,
		rubric: {
			optimal_time: "O(m * n)",
			acceptable_time: ["O(m * n)", "O(m * n * log(m * n))"],
		},
		parameterNames: ["s", "p"],
		tests: [
			{ input: ["aa", "a"], output: false },
			{ input: ["aa", "*"], output: true },
			{ input: ["cb", "?a"], output: false },
			{ input: ["adceb", "*a*b"], output: true },
			{ input: ["acdcb", "a*c?b"], output: false },
			{ input: ["", ""], output: true },
			{ input: ["", "*"], output: true },
			{ input: ["a", ""], output: false },
			{ input: ["", "?"], output: false },
			{ input: ["a", "a"], output: true },
			{ input: ["a", "?"], output: true },
			{ input: ["ab", "??"], output: true },
			{ input: ["ab", "?*"], output: true },
			{ input: ["ab", "*?"], output: true },
			{ input: ["abc", "a?c"], output: true },
			{ input: ["abc", "a*c"], output: true },
			{ input: ["abc", "*b*"], output: true },
			{ input: ["abc", "a*b*c"], output: true },
			{ input: ["abc", "*abc"], output: true },
			{ input: ["abc", "abc*"], output: true },
			{ input: ["abc", "a?b"], output: false },
			{ input: ["abc", "a?c"], output: true },
			{ input: ["abc", "?bc"], output: true },
			{ input: ["abc", "ab?"], output: true },
			{ input: ["abc", "?b?"], output: true },
			{ input: ["abc", "???"], output: true },
			{ input: ["abc", "????"], output: false },
			{ input: ["abc", "**"], output: true },
			{ input: ["abc", "*?*"], output: true },
			{ input: ["hello", "h*o"], output: true },
			{ input: ["hello", "h?l*o"], output: true },
			{ input: ["hello", "h?l*"], output: true },
			{ input: ["hello", "*l*"], output: true },
			{ input: ["hello", "h*ll?"], output: true },
			{ input: ["hello", "h*ll??"], output: false },
			{ input: ["ab", "a*b"], output: true },
			{ input: ["aab", "a*b"], output: true },
			{ input: ["aab", "a**b"], output: true },
			{ input: ["aab", "a***b"], output: true },
			{ input: ["mississippi", "m??*ss*?i*pi"], output: false },
			{ input: ["mississippi", "mis*is*ip*"], output: true },
			{ input: ["aaabbbaabaaaaababaabaaabbabbbbbbbbaabababbabbbaaaaba", "a*******b"], output: false },
			{ input: ["babbbbaabababaabbababaababaabbaabababbaaababbababaaaaaabbabaaaabababbabababbbababbbbaaaaaabaababbbababbbbaabbbbaaabbaabaa", "b*bb*a*bba*b*a*bbb*aba*b"], output: false },
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
  
  // Handle patterns that start with *
  for (let j = 1; j <= n; j++) {
    if (p[j - 1] === '*') {
      dp[0][j] = dp[0][j - 1];
    }
  }
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (p[j - 1] === '*') {
        dp[i][j] = dp[i][j - 1] || dp[i - 1][j];
      } else if (p[j - 1] === '?' || s[i - 1] === p[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      }
    }
  }
  
  return dp[m][n];
}`,
		},
	},
	{
		id: "jump-game-ii",
		slug: "jump-game-ii",
		title: "Jump Game II",
		statementMd: `You are given a **0-indexed** array of integers \`nums\` of length \`n\`. You are initially positioned at \`nums[0]\`.

Each element \`nums[i]\` represents the maximum length of a forward jump from index \`i\`. In other words, if you are at \`nums[i]\`, you can jump to any \`nums[i + j]\` where:

- \`0 <= j <= nums[i]\` and
- \`i + j < n\`

Return the minimum number of jumps to reach \`nums[n - 1]\`. The test cases are generated such that you can reach \`nums[n - 1]\`.

#### Example 1:
> **Input:** \`nums = [2,3,1,1,4]\`
> **Output:** \`2\`
> **Explanation:** The minimum number of jumps to reach the last index is 2. Jump 1 step from index 0 to 1, then 3 steps to the last index.

#### Example 2:
> **Input:** \`nums = [2,3,0,1,4]\`
> **Output:** \`2\`

#### Constraints:
- 1 <= nums.length <= 10^4^
- 0 <= nums[i] <= 1000
- It's guaranteed that you can reach \`nums[n - 1]\`.`,
		topics: ["arrays", "dynamic-programming", "greedy"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 45,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)", "O(n^2^)"],
		},
		parameterNames: ["nums"],
		tests: [
			{ input: [[2, 3, 1, 1, 4]], output: 2 },
			{ input: [[2, 3, 0, 1, 4]], output: 2 },
			{ input: [[1, 1, 1, 1]], output: 3 },
			{ input: [[5, 4, 3, 2, 1]], output: 1 },
			{ input: [[1]], output: 0 },
			{ input: [[2, 1]], output: 1 },
			{ input: [[1, 2]], output: 1 },
			{ input: [[3, 2, 1]], output: 1 },
			{ input: [[1, 1, 1]], output: 2 },
			{ input: [[2, 2, 2, 2, 2]], output: 2 },
			{ input: [[1, 2, 3, 4, 5]], output: 2 },
			{ input: [[5, 1, 1, 1, 1, 1]], output: 1 },
			{ input: [[1, 3, 2, 1, 4]], output: 2 },
			{ input: [[2, 1, 1, 1, 4]], output: 3 },
			{ input: [[1, 5, 2, 1, 1, 1]], output: 2 },
			{ input: [[3, 1, 1, 1, 1]], output: 2 },
			{ input: [[1, 1, 2, 1, 1]], output: 3 },
			{ input: [[2, 0, 2, 0, 1]], output: 2 },
			{ input: [[2, 3, 1]], output: 1 },
			{ input: [[4, 1, 1, 3, 1, 1, 1]], output: 2 },
			{ input: [[1, 2, 1, 1, 1]], output: 3 },
			{ input: [[2, 3, 1, 1, 2, 4]], output: 3 },
			{ input: [[1, 2, 0, 1]], output: 2 },
			{ input: [[5, 9, 3, 2, 1, 0, 2, 3, 3, 1, 0, 0]], output: 3 },
			{ input: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], output: 9 },
			{ input: [[10, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], output: 1 },
			{ input: [[2, 1, 2, 1, 1]], output: 2 },
			{ input: [[3, 4, 3, 2, 5, 4, 3]], output: 3 },
			{ input: [[1, 3, 5, 8, 9, 2, 6, 7, 6, 8, 9]], output: 3 },
			{ input: [[1, 2, 1, 1, 4]], output: 3 },
			{ input: [[2, 3, 1, 1, 2, 4, 2, 0, 1, 1]], output: 4 },
			{ input: [[1, 1, 2, 2, 0, 1, 1]], output: 5 },
			{ input: [[3, 1, 4, 2, 1, 1, 1, 1]], output: 3 },
			{ input: [[2, 2, 2, 2, 2, 2, 2]], output: 3 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], output: 4 },
			{ input: [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]], output: 1 },
			{ input: [[1, 4, 3, 2, 1, 5]], output: 3 },
			{ input: [[2, 9, 6, 5, 7, 0, 7, 2, 7, 9, 3, 2, 2, 5, 7, 8, 1, 6, 6, 6, 3, 5, 2, 1, 8, 0, 1, 0, 6, 8]], output: 5 },
			{ input: [[8, 2, 4, 4, 4, 9, 5, 2, 5, 8, 8, 0, 8, 6, 9, 1, 1, 6, 3, 5, 1, 2, 6, 6, 0, 4, 8, 6, 0, 3, 2, 8, 7, 6, 5, 1, 7, 0, 3, 4, 8, 3, 5, 9, 0, 4, 0, 1, 0, 5, 9, 2, 0, 7, 0, 2, 1, 0, 8, 2, 5, 1, 2, 3, 9, 7, 4, 7, 0, 0, 1, 8, 5, 6, 7, 5, 1, 9, 9, 3, 5, 0, 7, 5]], output: 13 },
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function jump(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function jump(nums) {
  if (nums.length <= 1) return 0;
  
  let jumps = 0;
  let currentEnd = 0;
  let farthest = 0;
  
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
    }
  }
  
  return jumps;
}`,
		},
	},
	{
		id: "permutations",
		slug: "permutations",
		title: "Permutations",
		statementMd: `Given an array \`nums\` of distinct integers, return all the possible permutations. You can return the answer in any order.

#### Example 1:
> **Input:** \`nums = [1,2,3]\`
> **Output:** \`[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]\`

#### Example 2:
> **Input:** \`nums = [0,1]\`
> **Output:** \`[[0,1],[1,0]]\`

#### Example 3:
> **Input:** \`nums = [1]\`
> **Output:** \`[[1]]\`

#### Constraints:
- 1 <= nums.length <= 6
- -10 <= nums[i] <= 10
- All integers of \`nums\` are **unique**.`,
		topics: ["arrays", "backtracking"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 46,
		rubric: {
			optimal_time: "O(n! * n)",
			acceptable_time: ["O(n! * n)", "O(n! * n * log(n!))"],
		},
		parameterNames: ["nums"],
		tests: [
			{ input: [[1, 2, 3]], output: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
			{ input: [[0, 1]], output: [[0, 1], [1, 0]] },
			{ input: [[1]], output: [[1]] },
			{ input: [[1, 2]], output: [[1, 2], [2, 1]] },
			{ input: [[1, 2, 3, 4]], output: [[1, 2, 3, 4], [1, 2, 4, 3], [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3], [1, 4, 3, 2], [2, 1, 3, 4], [2, 1, 4, 3], [2, 3, 1, 4], [2, 3, 4, 1], [2, 4, 1, 3], [2, 4, 3, 1], [3, 1, 2, 4], [3, 1, 4, 2], [3, 2, 1, 4], [3, 2, 4, 1], [3, 4, 1, 2], [3, 4, 2, 1], [4, 1, 2, 3], [4, 1, 3, 2], [4, 2, 1, 3], [4, 2, 3, 1], [4, 3, 1, 2], [4, 3, 2, 1]] },
			{ input: [[-1, 0, 1]], output: [[-1, 0, 1], [-1, 1, 0], [0, -1, 1], [0, 1, -1], [1, -1, 0], [1, 0, -1]] },
			{ input: [[5, 4, 6]], output: [[5, 4, 6], [5, 6, 4], [4, 5, 6], [4, 6, 5], [6, 5, 4], [6, 4, 5]] },
			{ input: [[10, 20]], output: [[10, 20], [20, 10]] },
			{ input: [[0]], output: [[0]] },
			{ input: [[-5, 5]], output: [[-5, 5], [5, -5]] },
			{ input: [[2, 3, 1]], output: [[2, 3, 1], [2, 1, 3], [3, 2, 1], [3, 1, 2], [1, 2, 3], [1, 3, 2]] },
			{ input: [[0, -1, 1]], output: [[0, -1, 1], [0, 1, -1], [-1, 0, 1], [-1, 1, 0], [1, 0, -1], [1, -1, 0]] },
			{ input: [[1, 3, 2]], output: [[1, 3, 2], [1, 2, 3], [3, 1, 2], [3, 2, 1], [2, 1, 3], [2, 3, 1]] },
			{ input: [[100, 200]], output: [[100, 200], [200, 100]] },
			{ input: [[-10, -20]], output: [[-10, -20], [-20, -10]] },
			{ input: [[1, 0, -1]], output: [[1, 0, -1], [1, -1, 0], [0, 1, -1], [0, -1, 1], [-1, 1, 0], [-1, 0, 1]] },
			{ input: [[2, 4, 6]], output: [[2, 4, 6], [2, 6, 4], [4, 2, 6], [4, 6, 2], [6, 2, 4], [6, 4, 2]] },
			{ input: [[7, 8, 9]], output: [[7, 8, 9], [7, 9, 8], [8, 7, 9], [8, 9, 7], [9, 7, 8], [9, 8, 7]] },
			{ input: [[11, 22]], output: [[11, 22], [22, 11]] },
			{ input: [[3, 6, 9, 12]], output: [[3, 6, 9, 12], [3, 6, 12, 9], [3, 9, 6, 12], [3, 9, 12, 6], [3, 12, 6, 9], [3, 12, 9, 6], [6, 3, 9, 12], [6, 3, 12, 9], [6, 9, 3, 12], [6, 9, 12, 3], [6, 12, 3, 9], [6, 12, 9, 3], [9, 3, 6, 12], [9, 3, 12, 6], [9, 6, 3, 12], [9, 6, 12, 3], [9, 12, 3, 6], [9, 12, 6, 3], [12, 3, 6, 9], [12, 3, 9, 6], [12, 6, 3, 9], [12, 6, 9, 3], [12, 9, 3, 6], [12, 9, 6, 3]] },
			{ input: [[-2, -1, 0]], output: [[-2, -1, 0], [-2, 0, -1], [-1, -2, 0], [-1, 0, -2], [0, -2, -1], [0, -1, -2]] },
			{ input: [[50, 100]], output: [[50, 100], [100, 50]] },
			{ input: [[1, 4, 7]], output: [[1, 4, 7], [1, 7, 4], [4, 1, 7], [4, 7, 1], [7, 1, 4], [7, 4, 1]] },
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permute(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function permute(nums) {
  const result = [];
  
  function backtrack(current) {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      if (current.includes(nums[i])) continue;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
    }
  }
  
  backtrack([]);
  return result;
}`,
		},
	},
	{
		id: "permutations-ii",
		slug: "permutations-ii",
		title: "Permutations II",
		statementMd: `Given a collection of numbers, \`nums\`, that might contain duplicates, return all the possible unique permutations in any order.

#### Example 1:
> **Input:** \`nums = [1,1,2]\`
> **Output:** \`[[1,1,2],[1,2,1],[2,1,1]]\`

#### Example 2:
> **Input:** \`nums = [1,2,3]\`
> **Output:** \`[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]\`

#### Constraints:
- 1 <= nums.length <= 8
- -10 <= nums[i] <= 10`,
		topics: ["arrays", "backtracking"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 47,
		rubric: {
			optimal_time: "O(n! * n)",
			acceptable_time: ["O(n! * n)", "O(n! * n * log(n!))"],
		},
		parameterNames: ["nums"],
		tests: [
			{ input: [[1, 1, 2]], output: [[1, 1, 2], [1, 2, 1], [2, 1, 1]] },
			{ input: [[1, 2, 3]], output: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
			{ input: [[1, 1]], output: [[1, 1]] },
			{ input: [[1, 2]], output: [[1, 2], [2, 1]] },
			{ input: [[1]], output: [[1]] },
			{ input: [[1, 1, 1]], output: [[1, 1, 1]] },
			{ input: [[1, 1, 2, 2]], output: [[1, 1, 2, 2], [1, 2, 1, 2], [1, 2, 2, 1], [2, 1, 1, 2], [2, 1, 2, 1], [2, 2, 1, 1]] },
			{ input: [[2, 2, 1, 1]], output: [[1, 1, 2, 2], [1, 2, 1, 2], [1, 2, 2, 1], [2, 1, 1, 2], [2, 1, 2, 1], [2, 2, 1, 1]] },
			{ input: [[0, 1, 0]], output: [[0, 0, 1], [0, 1, 0], [1, 0, 0]] },
			{ input: [[-1, 0, 1]], output: [[-1, 0, 1], [-1, 1, 0], [0, -1, 1], [0, 1, -1], [1, -1, 0], [1, 0, -1]] },
			{ input: [[1, 1, 2, 3]], output: [[1, 1, 2, 3], [1, 1, 3, 2], [1, 2, 1, 3], [1, 2, 3, 1], [1, 3, 1, 2], [1, 3, 2, 1], [2, 1, 1, 3], [2, 1, 3, 1], [2, 3, 1, 1], [3, 1, 1, 2], [3, 1, 2, 1], [3, 2, 1, 1]] },
			{ input: [[2, 2, 2]], output: [[2, 2, 2]] },
			{ input: [[1, 2, 1]], output: [[1, 1, 2], [1, 2, 1], [2, 1, 1]] },
			{ input: [[3, 3, 0, 3]], output: [[0, 3, 3, 3], [3, 0, 3, 3], [3, 3, 0, 3], [3, 3, 3, 0]] },
			{ input: [[-1, -1, 0, 1]], output: [[-1, -1, 0, 1], [-1, -1, 1, 0], [-1, 0, -1, 1], [-1, 0, 1, -1], [-1, 1, -1, 0], [-1, 1, 0, -1], [0, -1, -1, 1], [0, -1, 1, -1], [0, 1, -1, -1], [1, -1, -1, 0], [1, -1, 0, -1], [1, 0, -1, -1]] },
			{ input: [[0, 0, 0]], output: [[0, 0, 0]] },
			{ input: [[1, 1, 1, 2]], output: [[1, 1, 1, 2], [1, 1, 2, 1], [1, 2, 1, 1], [2, 1, 1, 1]] },
			{ input: [[2, 1, 1]], output: [[1, 1, 2], [1, 2, 1], [2, 1, 1]] },
			{ input: [[5, 5, 5, 5]], output: [[5, 5, 5, 5]] },
			{ input: [[1, 2, 2, 3]], output: [[1, 2, 2, 3], [1, 2, 3, 2], [1, 3, 2, 2], [2, 1, 2, 3], [2, 1, 3, 2], [2, 2, 1, 3], [2, 2, 3, 1], [2, 3, 1, 2], [2, 3, 2, 1], [3, 1, 2, 2], [3, 2, 1, 2], [3, 2, 2, 1]] },
			{ input: [[-2, -2, 1, 1]], output: [[-2, -2, 1, 1], [-2, 1, -2, 1], [-2, 1, 1, -2], [1, -2, -2, 1], [1, -2, 1, -2], [1, 1, -2, -2]] },
			{ input: [[10, 10, 20]], output: [[10, 10, 20], [10, 20, 10], [20, 10, 10]] },
			{ input: [[0, 1, 1]], output: [[0, 1, 1], [1, 0, 1], [1, 1, 0]] },
			{ input: [[1, 1, 1, 1, 2]], output: [[1, 1, 1, 1, 2], [1, 1, 1, 2, 1], [1, 1, 2, 1, 1], [1, 2, 1, 1, 1], [2, 1, 1, 1, 1]] },
			{ input: [[2, 3, 3]], output: [[2, 3, 3], [3, 2, 3], [3, 3, 2]] },
			{ input: [[-5, -5, 5, 5]], output: [[-5, -5, 5, 5], [-5, 5, -5, 5], [-5, 5, 5, -5], [5, -5, -5, 5], [5, -5, 5, -5], [5, 5, -5, -5]] },
			{ input: [[1, 3, 3, 3]], output: [[1, 3, 3, 3], [3, 1, 3, 3], [3, 3, 1, 3], [3, 3, 3, 1]] },
			{ input: [[4, 4, 1, 4]], output: [[1, 4, 4, 4], [4, 1, 4, 4], [4, 4, 1, 4], [4, 4, 4, 1]] },
			{ input: [[0, 0, 1, 1]], output: [[0, 0, 1, 1], [0, 1, 0, 1], [0, 1, 1, 0], [1, 0, 0, 1], [1, 0, 1, 0], [1, 1, 0, 0]] },
			{ input: [[2, 2, 1, 1, 3]], output: [[1, 1, 2, 2, 3], [1, 1, 2, 3, 2], [1, 1, 3, 2, 2], [1, 2, 1, 2, 3], [1, 2, 1, 3, 2], [1, 2, 2, 1, 3], [1, 2, 2, 3, 1], [1, 2, 3, 1, 2], [1, 2, 3, 2, 1], [1, 3, 1, 2, 2], [1, 3, 2, 1, 2], [1, 3, 2, 2, 1], [2, 1, 1, 2, 3], [2, 1, 1, 3, 2], [2, 1, 2, 1, 3], [2, 1, 2, 3, 1], [2, 1, 3, 1, 2], [2, 1, 3, 2, 1], [2, 2, 1, 1, 3], [2, 2, 1, 3, 1], [2, 2, 3, 1, 1], [2, 3, 1, 1, 2], [2, 3, 1, 2, 1], [2, 3, 2, 1, 1], [3, 1, 1, 2, 2], [3, 1, 2, 1, 2], [3, 1, 2, 2, 1], [3, 2, 1, 1, 2], [3, 2, 1, 2, 1], [3, 2, 2, 1, 1]] },
			{ input: [[1, 1, 1, 2, 2]], output: [[1, 1, 1, 2, 2], [1, 1, 2, 1, 2], [1, 1, 2, 2, 1], [1, 2, 1, 1, 2], [1, 2, 1, 2, 1], [1, 2, 2, 1, 1], [2, 1, 1, 1, 2], [2, 1, 1, 2, 1], [2, 1, 2, 1, 1], [2, 2, 1, 1, 1]] },
			{ input: [[7, 7, 7, 7, 7]], output: [[7, 7, 7, 7, 7]] },
			{ input: [[-1, 0, 0, 1]], output: [[-1, 0, 0, 1], [-1, 0, 1, 0], [-1, 1, 0, 0], [0, -1, 0, 1], [0, -1, 1, 0], [0, 0, -1, 1], [0, 0, 1, -1], [0, 1, -1, 0], [0, 1, 0, -1], [1, -1, 0, 0], [1, 0, -1, 0], [1, 0, 0, -1]] },
			{ input: [[100, 100, 200]], output: [[100, 100, 200], [100, 200, 100], [200, 100, 100]] },
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permuteUnique(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function permuteUnique(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  const used = new Array(nums.length).fill(false);
  
  function backtrack(current) {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;
      
      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  }
  
  backtrack([]);
  return result;
}`,
		},
	},
	{
		id: "rotate-image",
		slug: "rotate-image",
		title: "Rotate Image",
		statementMd: `You are given an \`n x n\` 2D matrix representing an image, rotate the image by **90 degrees (clockwise)**.

You have to rotate the image **in-place**, which means you have to modify the input 2D matrix directly. **DO NOT** allocate another 2D matrix and do the rotation.

#### Example 1:
> **Input:** \`matrix = [[1,2,3],[4,5,6],[7,8,9]]\`
> **Output:** \`[[7,4,1],[8,5,2],[9,6,3]]\`

#### Example 2:
> **Input:** \`matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]\`
> **Output:** \`[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]\`

#### Constraints:
- n == matrix.length == matrix[i].length
- 1 <= n <= 20
- -1000 <= matrix[i][j] <= 1000`,
		topics: ["arrays", "math", "matrix"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 48,
		rubric: {
			optimal_time: "O(n^2^)",
			acceptable_time: ["O(n^2^)"],
		},
		parameterNames: ["matrix"],
		tests: [
			{ input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], output: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
			{ input: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], output: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
			{ input: [[[1]]], output: [[1]] },
			{ input: [[[1, 2], [3, 4]]], output: [[3, 1], [4, 2]] },
			{ input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]], output: [[13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3], [16, 12, 8, 4]] },
			{ input: [[[0, 1], [2, 3]]], output: [[2, 0], [3, 1]] },
			{ input: [[[-1, -2], [-3, -4]]], output: [[-3, -1], [-4, -2]] },
			{ input: [[[10, 20], [30, 40]]], output: [[30, 10], [40, 20]] },
			{ input: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], output: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
			{ input: [[[11, 12, 13], [14, 15, 16], [17, 18, 19]]], output: [[17, 14, 11], [18, 15, 12], [19, 16, 13]] },
			{ input: [[[100, 200], [300, 400]]], output: [[300, 100], [400, 200]] },
			{ input: [[[0, 0], [0, 0]]], output: [[0, 0], [0, 0]] },
			{ input: [[[1, 1], [1, 1]]], output: [[1, 1], [1, 1]] },
			{ input: [[[1, 3], [2, 4]]], output: [[2, 1], [4, 3]] },
			{ input: [[[5, 6, 7], [8, 9, 10], [11, 12, 13]]], output: [[11, 8, 5], [12, 9, 6], [13, 10, 7]] },
			{ input: [[[-1, -2, -3], [-4, -5, -6], [-7, -8, -9]]], output: [[-7, -4, -1], [-8, -5, -2], [-9, -6, -3]] },
			{ input: [[[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]]], output: [[21, 16, 11, 6, 1], [22, 17, 12, 7, 2], [23, 18, 13, 8, 3], [24, 19, 14, 9, 4], [25, 20, 15, 10, 5]] },
			{ input: [[[10, 20, 30], [40, 50, 60], [70, 80, 90]]], output: [[70, 40, 10], [80, 50, 20], [90, 60, 30]] },
			{ input: [[[0, 1, 2], [3, 4, 5], [6, 7, 8]]], output: [[6, 3, 0], [7, 4, 1], [8, 5, 2]] },
			{ input: [[[-10, -20], [-30, -40]]], output: [[-30, -10], [-40, -20]] },
			{ input: [[[1, 5], [9, 13]]], output: [[9, 1], [13, 5]] },
			{ input: [[[2, 4, 6], [8, 10, 12], [14, 16, 18]]], output: [[14, 8, 2], [16, 10, 4], [18, 12, 6]] },
			{ input: [[[100, 200, 300, 400], [500, 600, 700, 800], [900, 1000, 1100, 1200], [1300, 1400, 1500, 1600]]], output: [[1300, 900, 500, 100], [1400, 1000, 600, 200], [1500, 1100, 700, 300], [1600, 1200, 800, 400]] },
			{ input: [[[1, 0], [0, 1]]], output: [[0, 1], [1, 0]] },
			{ input: [[[1, 0], [-1, 0]]], output: [[-1, 1], [0, 0]] },
			{ input: [[[-5, -10], [-15, -20]]], output: [[-15, -5], [-20, -10]] },
			{ input: [[[3, 6], [9, 12]]], output: [[9, 3], [12, 6]] },
			{ input: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]], output: [[13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3], [16, 12, 8, 4]] },
			{ input: [[[50, 60], [70, 80]]], output: [[70, 50], [80, 60]] },
			{ input: [[[1, 1, 1], [2, 2, 2], [3, 3, 3]]], output: [[3, 2, 1], [3, 2, 1], [3, 2, 1]] },
			{ input: [[[7, 14], [21, 28]]], output: [[21, 7], [28, 14]] },
			{ input: [[[1, 4, 7, 10], [2, 5, 8, 11], [3, 6, 9, 12], [13, 14, 15, 16]]], output: [[13, 3, 2, 1], [14, 6, 5, 4], [15, 9, 8, 7], [16, 12, 11, 10]] },
			{ input: [[[1000, 2000], [3000, 4000]]], output: [[3000, 1000], [4000, 2000]] },
			{ input: [[[-100, -200, -300], [-400, -500, -600], [-700, -800, -900]]], output: [[-700, -400, -100], [-800, -500, -200], [-900, -600, -300]] },
		],
		startingCode: {
			javascript: `/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
function rotate(matrix) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function rotate(matrix) {
  const n = matrix.length;
  
  // Transpose the matrix
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  
  // Reverse each row
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
}`,
		},
	},
	{
		id: "group-anagrams",
		slug: "group-anagrams",
		title: "Group Anagrams",
		statementMd: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

#### Example 1:
> **Input:** \`strs = ["eat","tea","tan","ate","nat","bat"]\`
> **Output:** \`[["bat"],["nat","tan"],["ate","eat","tea"]]\`

#### Example 2:
> **Input:** \`strs = [""]\`
> **Output:** \`[[""]]\`

#### Example 3:
> **Input:** \`strs = ["a"]\`
> **Output:** \`[["a"]]\`

#### Constraints:
- 1 <= strs.length <= 10^4^
- 0 <= strs[i].length <= 100
- strs[i] consists of lowercase English letters only.`,
		topics: ["strings", "hashmap"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 49,
		rubric: {
			optimal_time: "O(n * m log m)",
			acceptable_time: ["O(n * m log m)"],
		},
		parameterNames: ["strs"],
		tests: [
			{
				input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
				output: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]],
			},
			{ input: [[""]], output: [[""]] },
			{ input: [["a"]], output: [["a"]] },
			{
				input: [["listen", "silent", "enlist"]],
				output: [["listen", "silent", "enlist"]],
			},
			{ input: [["a", "b"]], output: [["a"], ["b"]] },
			{ input: [["ab", "ba"]], output: [["ab", "ba"]] },
			{ input: [["abc", "bca", "cab"]], output: [["abc", "bca", "cab"]] },
			{ input: [["rat", "tar", "art"]], output: [["rat", "tar", "art"]] },
			{ input: [["cat", "act", "tac"]], output: [["cat", "act", "tac"]] },
			{ input: [["dog", "god", "odg"]], output: [["dog", "god", "odg"]] },
			{ input: [["stop", "pots", "spot", "tops"]], output: [["stop", "pots", "spot", "tops"]] },
			{ input: [["a", "a"]], output: [["a", "a"]] },
			{ input: [["abc", "abc", "def"]], output: [["abc", "abc"], ["def"]] },
			{ input: [["eat", "tea"]], output: [["eat", "tea"]] },
			{ input: [["bat", "tab", "abt"]], output: [["bat", "tab", "abt"]] },
			{ input: [["car", "arc", "rac"]], output: [["car", "arc", "rac"]] },
			{ input: [["elbow", "below", "bowel"]], output: [["elbow", "below", "bowel"]] },
			{ input: [["part", "trap", "prat"]], output: [["part", "trap", "prat"]] },
			{ input: [["state", "taste", "teats"]], output: [["state", "taste", "teats"]] },
			{ input: [["evil", "vile", "live"]], output: [["evil", "vile", "live"]] },
			{ input: [["post", "spot", "stop", "pots"]], output: [["post", "spot", "stop", "pots"]] },
			{ input: [["a", "b", "c"]], output: [["a"], ["b"], ["c"]] },
			{ input: [["ab", "cd", "ef"]], output: [["ab"], ["cd"], ["ef"]] },
			{ input: [["abc", "def", "ghi"]], output: [["abc"], ["def"], ["ghi"]] },
			{ input: [["eat", "bat", "cat", "tea"]], output: [["eat", "tea"], ["bat"], ["cat"]] },
			{ input: [["ab", "ba", "cd", "dc"]], output: [["ab", "ba"], ["cd", "dc"]] },
			{ input: [["abc", "bca", "xyz", "zyx"]], output: [["abc", "bca"], ["xyz", "zyx"]] },
			{ input: [["race", "care", "acre", "race"]], output: [["race", "care", "acre", "race"]] },
			{ input: [["act", "cat", "tac", "act"]], output: [["act", "cat", "tac", "act"]] },
			{ input: [["listen", "silent", "enlist", "tinsel"]], output: [["listen", "silent", "enlist", "tinsel"]] },
			{ input: [["a", "aa", "aaa"]], output: [["a"], ["aa"], ["aaa"]] },
			{ input: [["ab", "ab", "ab"]], output: [["ab", "ab", "ab"]] },
			{ input: [["abc", "bca", "cab", "def", "fed"]], output: [["abc", "bca", "cab"], ["def", "fed"]] },
			{ input: [["rat", "art", "tar", "bat", "tab"]], output: [["rat", "art", "tar"], ["bat", "tab"]] },
			{ input: [["stop", "pots", "spot", "post", "tops"]], output: [["stop", "pots", "spot", "post", "tops"]] },
			{ input: [["eat", "tea", "tan", "ate", "nat", "bat", "tab"]], output: [["eat", "tea", "ate"], ["tan", "nat"], ["bat", "tab"]] },
			{ input: [["a", "b", "a", "b"]], output: [["a", "a"], ["b", "b"]] },
			{ input: [["abc", "cba", "def", "fed", "ghi"]], output: [["abc", "cba"], ["def", "fed"], ["ghi"]] },
			{ input: [["listen", "silent", "enlist", "tinsel", "inlets"]], output: [["listen", "silent", "enlist", "tinsel", "inlets"]] },
			{ input: [["part", "trap", "prat", "rapt"]], output: [["part", "trap", "prat", "rapt"]] },
			{ input: [["state", "taste", "teats", "tates"]], output: [["state", "taste", "teats", "tates"]] },
			{ input: [["evil", "vile", "live", "veil"]], output: [["evil", "vile", "live", "veil"]] },
		],
		startingCode: {
			javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function groupAnagrams(strs) {
  const groups = {};
  
  for (const str of strs) {
    // Sort characters to create a key
    const key = str.split('').sort().join('');
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(str);
  }
  
  return Object.values(groups);
}`,
		},
	},
	{
		id: "powx-n",
		slug: "powx-n",
		title: "Pow(x, n)",
		statementMd: `Implement \`pow(x, n)\`, which calculates \`x\` raised to the power \`n\` (i.e., \`x^n^\`).

#### Example 1:
> **Input:** \`x = 2.00000\`, \`n = 10\`
> **Output:** \`1024.00000\`

#### Example 2:
> **Input:** \`x = 2.10000\`, \`n = 3\`
> **Output:** \`9.26100\`

#### Example 3:
> **Input:** \`x = 2.00000\`, \`n = -2\`
> **Output:** \`0.25000\`
> **Explanation:** 2^-2^ = 1/2^2^ = 1/4 = 0.25

#### Constraints:
- -100.0 < x < 100.0
- -2^31^ <= n <= 2^31^-1
- n is an integer.
- Either \`x\` is not zero or \`n > 0\`.
- -10^4^ <= x^n^ <= 10^4^`,
		topics: ["math", "recursion"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 50,
		rubric: {
			optimal_time: "O(log n)",
			acceptable_time: ["O(log n)", "O(n)"],
		},
		parameterNames: ["x", "n"],
		tests: [
			{ input: [2.0, 10], output: 1024.0 },
			{ input: [2.1, 3], output: 9.261 },
			{ input: [2.0, -2], output: 0.25 },
			{ input: [2.0, 0], output: 1.0 },
			{ input: [1.0, 100], output: 1.0 },
			{ input: [1.0, -100], output: 1.0 },
			{ input: [0.0, 5], output: 0.0 },
			{ input: [2.0, 1], output: 2.0 },
			{ input: [2.0, -1], output: 0.5 },
			{ input: [3.0, 3], output: 27.0 },
			{ input: [3.0, -3], output: 0.037037037037037035 },
			{ input: [0.5, 2], output: 0.25 },
			{ input: [0.5, -2], output: 4.0 },
			{ input: [10.0, 2], output: 100.0 },
			{ input: [10.0, -2], output: 0.01 },
			{ input: [-2.0, 2], output: 4.0 },
			{ input: [-2.0, 3], output: -8.0 },
			{ input: [-2.0, -2], output: 0.25 },
			{ input: [-2.0, -3], output: -0.125 },
			{ input: [4.0, 3], output: 64.0 },
			{ input: [4.0, -3], output: 0.015625 },
			{ input: [5.0, 4], output: 625.0 },
			{ input: [5.0, -4], output: 0.0016 },
			{ input: [1.5, 2], output: 2.25 },
			{ input: [1.5, -2], output: 0.4444444444444444 },
			{ input: [2.5, 3], output: 15.625 },
			{ input: [2.5, -3], output: 0.064 },
			{ input: [0.1, 2], output: 0.01 },
			{ input: [0.1, -2], output: 100.0 },
			{ input: [-1.0, 2147483647], output: -1.0 },
			{ input: [-1.0, -2147483648], output: 1.0 },
			{ input: [2.0, 31], output: 2147483648.0 },
			{ input: [2.0, -31], output: 4.6566128730773926e-10 },
			{ input: [1.00001, 100], output: 1.0010005001667084 },
			{ input: [1.00001, -100], output: 0.9990004998332916 },
			{ input: [0.00001, 1], output: 0.00001 },
			{ input: [0.00001, -1], output: 100000.0 },
			{ input: [99.0, 0], output: 1.0 },
			{ input: [-99.0, 1], output: -99.0 },
			{ input: [-99.0, 2], output: 9801.0 },
			{ input: [8.88023, 3], output: 700.2814829452681 },
		],
		startingCode: {
			javascript: `/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
function myPow(x, n) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function myPow(x, n) {
  if (n === 0) return 1;
  
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }
  
  let result = 1;
  let current = x;
  
  while (n > 0) {
    if (n % 2 === 1) {
      result *= current;
    }
    current *= current;
    n = Math.floor(n / 2);
  }
  
  return result;
}`,
		},
	},
];

