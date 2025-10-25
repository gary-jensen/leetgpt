import { AlgoProblemDetail } from "@/types/algorithm-types";

export const algoProblems: AlgoProblemDetail[] = [
	{
		id: "two-sum",
		slug: "two-sum",
		title: "Two Sum",
		statementMd: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

## Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

## Example 2:
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

## Example 3:
\`\`\`
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\`

## Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
		topics: ["arrays", "hashmap"],
		difficulty: "easy",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n log n)"],
		},
		tests: [
			{ input: [[2, 7, 11, 15], 9], output: [0, 1] },
			{ input: [[3, 2, 4], 6], output: [1, 2] },
			{ input: [[3, 3], 6], output: [0, 1] },
			{ input: [[1, 2, 3, 4, 5], 8], output: [2, 4] },
			{ input: [[-1, -2, -3, -4, -5], -8], output: [2, 4] },
		],
		startingCode: {
			javascript: `function twoSum(nums, target) {
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
		id: "valid-palindrome",
		slug: "valid-palindrome",
		title: "Valid Palindrome",
		statementMd: `# Valid Palindrome

A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

## Example 1:
\`\`\`
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
\`\`\`

## Example 2:
\`\`\`
Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.
\`\`\`

## Example 3:
\`\`\`
Input: s = " "
Output: true
Explanation: s is an empty string "" after removing non-alphanumeric characters.
Since an empty string reads the same forward and backward, it is a palindrome.
\`\`\`

## Constraints:
- 1 <= s.length <= 2 * 10^5
- s consists only of printable ASCII characters.`,
		topics: ["strings", "two-pointers"],
		difficulty: "easy",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		tests: [
			{ input: ["A man, a plan, a canal: Panama"], output: true },
			{ input: ["race a car"], output: false },
			{ input: [" "], output: true },
			{ input: ["racecar"], output: true },
			{ input: ["hello"], output: false },
		],
		startingCode: {
			javascript: `function isPalindrome(s) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function isPalindrome(s) {
  // Clean the string: remove non-alphanumeric characters and convert to lowercase
  const cleaned = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Use two pointers approach
  let left = 0;
  let right = cleaned.length - 1;
  
  while (left < right) {
    if (cleaned[left] !== cleaned[right]) {
      return false;
    }
    left++;
    right--;
  }
  
  return true;
}`,
		},
	},
	{
		id: "max-subarray",
		slug: "max-subarray",
		title: "Maximum Subarray",
		statementMd: `# Maximum Subarray

Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

## Example 1:
\`\`\`
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
\`\`\`

## Example 2:
\`\`\`
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.
\`\`\`

## Example 3:
\`\`\`
Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.
\`\`\`

## Constraints:
- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4

**Follow up:** If you have figured out the O(n) solution, try coding another solution using the **divide and conquer** approach, which is more subtle.`,
		topics: ["arrays", "dynamic-programming", "sliding-window"],
		difficulty: "medium",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n log n)"],
		},
		tests: [
			{ input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], output: 6 },
			{ input: [[1]], output: 1 },
			{ input: [[5, 4, -1, 7, 8]], output: 23 },
			{ input: [[-1]], output: -1 },
			{ input: [[-2, -1]], output: -1 },
		],
		startingCode: {
			javascript: `function maxSubArray(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function maxSubArray(nums) {
  // Kadane's Algorithm - O(n) time, O(1) space
  let maxSoFar = nums[0];
  let maxEndingHere = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }
  
  return maxSoFar;
}`,
		},
	},
	{
		id: "contains-duplicate",
		slug: "contains-duplicate",
		title: "Contains Duplicate",
		statementMd: `# Contains Duplicate

Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.

## Example 1:
\`\`\`
Input: nums = [1,2,3,1]
Output: true
\`\`\`

## Example 2:
\`\`\`
Input: nums = [1,2,3,4]
Output: false
\`\`\`

## Example 3:
\`\`\`
Input: nums = [1,1,1,3,3,4,3,2,4,2]
Output: true
\`\`\`

## Constraints:
- 1 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9`,
		topics: ["arrays", "hashmap"],
		difficulty: "easy",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n log n)"],
		},
		tests: [
			{ input: [[1, 2, 3, 1]], output: true },
			{ input: [[1, 2, 3, 4]], output: false },
			{ input: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], output: true },
			{ input: [[1]], output: false },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], output: false },
		],
		startingCode: {
			javascript: `function containsDuplicate(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function containsDuplicate(nums) {
  const seen = new Set();
  
  for (const num of nums) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }
  
  return false;
}`,
		},
	},
	{
		id: "valid-anagram",
		slug: "valid-anagram",
		title: "Valid Anagram",
		statementMd: `# Valid Anagram

Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

## Example 1:
\`\`\`
Input: s = "anagram", t = "nagaram"
Output: true
\`\`\`

## Example 2:
\`\`\`
Input: s = "rat", t = "car"
Output: false
\`\`\`

## Constraints:
- 1 <= s.length, t.length <= 5 * 10^4
- s and t consist of lowercase English letters only.

**Follow up:** What if the inputs contain Unicode characters? How would you adapt your solution to such a case?`,
		topics: ["strings", "hashmap"],
		difficulty: "easy",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n log n)"],
		},
		tests: [
			{ input: ["anagram", "nagaram"], output: true },
			{ input: ["rat", "car"], output: false },
			{ input: ["listen", "silent"], output: true },
			{ input: ["hello", "world"], output: false },
			{ input: ["a", "a"], output: true },
		],
		startingCode: {
			javascript: `function isAnagram(s, t) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  
  const charCount = {};
  
  // Count characters in s
  for (const char of s) {
    charCount[char] = (charCount[char] || 0) + 1;
  }
  
  // Subtract characters in t
  for (const char of t) {
    if (!charCount[char]) return false;
    charCount[char]--;
  }
  
  return true;
}`,
		},
	},
	{
		id: "group-anagrams",
		slug: "group-anagrams",
		title: "Group Anagrams",
		statementMd: `# Group Anagrams

Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

## Example 1:
\`\`\`
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
\`\`\`

## Example 2:
\`\`\`
Input: strs = [""]
Output: [[""]]
\`\`\`

## Example 3:
\`\`\`
Input: strs = ["a"]
Output: [["a"]]
\`\`\`

## Constraints:
- 1 <= strs.length <= 10^4
- 0 <= strs[i].length <= 100
- strs[i] consists of lowercase English letters only.`,
		topics: ["strings", "hashmap"],
		difficulty: "medium",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n * m log m)",
			acceptable_time: ["O(n * m log m)"],
		},
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
		],
		startingCode: {
			javascript: `function groupAnagrams(strs) {
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
		id: "top-k-frequent",
		slug: "top-k-frequent",
		title: "Top K Frequent Elements",
		statementMd: `# Top K Frequent Elements

Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements. You may return the answer in any order.

## Example 1:
\`\`\`
Input: nums = [1,1,1,2,2,3], k = 2
Output: [1,2]
\`\`\`

## Example 2:
\`\`\`
Input: nums = [1], k = 1
Output: [1]
\`\`\`

## Constraints:
- 1 <= nums.length <= 10^5
- k is in the range [1, the number of unique elements in the array].
- It is guaranteed that the answer is unique.

**Follow up:** Your algorithm's time complexity must be better than O(n log n), where n is the array's size.`,
		topics: ["arrays", "hashmap", "sorting"],
		difficulty: "medium",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n log n)"],
		},
		tests: [
			{ input: [[1, 1, 1, 2, 2, 3], 2], output: [1, 2] },
			{ input: [[1], 1], output: [1] },
			{ input: [[1, 2], 2], output: [1, 2] },
			{ input: [[4, 1, -1, 2, -1, 2, 3], 2], output: [-1, 2] },
		],
		startingCode: {
			javascript: `function topKFrequent(nums, k) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function topKFrequent(nums, k) {
  const frequency = {};
  
  // Count frequencies
  for (const num of nums) {
    frequency[num] = (frequency[num] || 0) + 1;
  }
  
  // Convert to array and sort by frequency
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([num]) => parseInt(num));
  
  return sorted;
}`,
		},
	},
	{
		id: "product-except-self",
		slug: "product-except-self",
		title: "Product of Array Except Self",
		statementMd: `# Product of Array Except Self

Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operator.

## Example 1:
\`\`\`
Input: nums = [1,2,3,4]
Output: [24,12,8,6]
\`\`\`

## Example 2:
\`\`\`
Input: nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]
\`\`\`

## Constraints:
- 2 <= nums.length <= 10^5
- -30 <= nums[i] <= 30
- The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

**Follow up:** Can you solve the problem in O(1) extra space complexity? (The output array does not count as extra space for space complexity analysis.)`,
		topics: ["arrays", "prefix-sum"],
		difficulty: "medium",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		tests: [
			{ input: [[1, 2, 3, 4]], output: [24, 12, 8, 6] },
			{ input: [[-1, 1, 0, -3, 3]], output: [0, 0, 9, 0, 0] },
			{ input: [[2, 3, 4, 5]], output: [60, 40, 30, 24] },
			{ input: [[1, 2]], output: [2, 1] },
		],
		startingCode: {
			javascript: `function productExceptSelf(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function productExceptSelf(nums) {
  const result = new Array(nums.length);
  
  // Calculate left products
  result[0] = 1;
  for (let i = 1; i < nums.length; i++) {
    result[i] = result[i - 1] * nums[i - 1];
  }
  
  // Calculate right products and multiply
  let rightProduct = 1;
  for (let i = nums.length - 1; i >= 0; i--) {
    result[i] = result[i] * rightProduct;
    rightProduct *= nums[i];
  }
  
  return result;
}`,
		},
	},
	{
		id: "longest-consecutive",
		slug: "longest-consecutive",
		title: "Longest Consecutive Sequence",
		statementMd: `# Longest Consecutive Sequence

Given an unsorted array of integers \`nums\`, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in O(n) time.

## Example 1:
\`\`\`
Input: nums = [100,4,200,1,3,2]
Output: 4
Explanation: The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.
\`\`\`

## Example 2:
\`\`\`
Input: nums = [0,3,7,2,5,8,4,6,0,1]
Output: 9
\`\`\`

## Constraints:
- 0 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9`,
		topics: ["arrays", "hashmap"],
		difficulty: "medium",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n log n)"],
		},
		tests: [
			{ input: [[100, 4, 200, 1, 3, 2]], output: 4 },
			{ input: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], output: 9 },
			{ input: [[1, 2, 3, 4, 5]], output: 5 },
			{ input: [[1, 3, 5, 7, 9]], output: 1 },
			{ input: [[1, 2, 0, 1]], output: 3 },
		],
		startingCode: {
			javascript: `function longestConsecutive(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function longestConsecutive(nums) {
  if (nums.length === 0) return 0;
  
  const numSet = new Set(nums);
  let maxLength = 0;
  
  for (const num of numSet) {
    // Only start counting if this is the beginning of a sequence
    if (!numSet.has(num - 1)) {
      let currentNum = num;
      let currentLength = 1;
      
      // Count consecutive numbers
      while (numSet.has(currentNum + 1)) {
        currentNum++;
        currentLength++;
      }
      
      maxLength = Math.max(maxLength, currentLength);
    }
  }
  
  return maxLength;
}`,
		},
	},
	{
		id: "merge-intervals",
		slug: "merge-intervals",
		title: "Merge Intervals",
		statementMd: `# Merge Intervals

Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

## Example 1:
\`\`\`
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
\`\`\`

## Example 2:
\`\`\`
Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]
Explanation: Intervals [1,4] and [4,5] are considered overlapping.
\`\`\`

## Constraints:
- 1 <= intervals.length <= 10^4
- intervals[i].length == 2
- 0 <= starti <= endi <= 10^4`,
		topics: ["arrays", "sorting"],
		difficulty: "medium",
		languages: ["javascript"],
		rubric: {
			optimal_time: "O(n log n)",
			acceptable_time: ["O(n log n)"],
		},
		tests: [
			{
				input: [
					[
						[1, 3],
						[2, 6],
						[8, 10],
						[15, 18],
					],
				],
				output: [
					[1, 6],
					[8, 10],
					[15, 18],
				],
			},
			{
				input: [
					[
						[1, 4],
						[4, 5],
					],
				],
				output: [[1, 5]],
			},
			{
				input: [
					[
						[1, 4],
						[2, 3],
					],
				],
				output: [[1, 4]],
			},
			{
				input: [
					[
						[1, 4],
						[0, 4],
					],
				],
				output: [[0, 4]],
			},
			{
				input: [
					[
						[1, 4],
						[0, 1],
					],
				],
				output: [[0, 4]],
			},
		],
		startingCode: {
			javascript: `function merge(intervals) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  
  // Sort intervals by start time
  intervals.sort((a, b) => a[0] - b[0]);
  
  const merged = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const lastMerged = merged[merged.length - 1];
    
    // If current interval overlaps with the last merged interval
    if (current[0] <= lastMerged[1]) {
      // Merge them by updating the end time
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      // No overlap, add current interval
      merged.push(current);
    }
  }
  
  return merged;
}`,
		},
	},
];
