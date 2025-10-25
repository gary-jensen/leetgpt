import { AlgoLesson } from "@/types/algorithm-types";

export const algoLessons: AlgoLesson[] = [
	{
		id: "hashmap-basics",
		slug: "hashmap-basics",
		title: "Hash Maps: The O(1) Lookup",
		summary:
			"Learn how hash maps provide constant-time lookups and when to use them.",
		topics: ["hashmap", "arrays"],
		difficulty: "easy",
		readingMinutes: 3,
		bodyMd: `# Hash Maps: The O(1) Lookup

Hash maps (also called hash tables or dictionaries) are one of the most powerful data structures in computer science. They allow you to store and retrieve data in **constant time** - O(1) - which is incredibly fast!

## What is a Hash Map?

A hash map is a data structure that maps keys to values. Think of it like a real-world dictionary:
- **Key**: The word you're looking up
- **Value**: The definition of that word

In programming, keys and values can be any type of data.

## How Does It Work?

1. **Hash Function**: Takes your key and converts it to an index
2. **Array Storage**: Stores the value at that index
3. **Collision Handling**: Deals with cases where multiple keys map to the same index

## When to Use Hash Maps

Hash maps are perfect when you need to:
- Look up values quickly by key
- Check if something exists
- Count occurrences
- Store relationships between data

## Common Operations

- **Set**: \`map[key] = value\` or \`map.set(key, value)\`
- **Get**: \`map[key]\` or \`map.get(key)\`
- **Delete**: \`delete map[key]\` or \`map.delete(key)\`
- **Check existence**: \`key in map\` or \`map.has(key)\`

## Time Complexity

- **Insert**: O(1) average, O(n) worst case
- **Lookup**: O(1) average, O(n) worst case
- **Delete**: O(1) average, O(n) worst case

The "average" case is what you'll see in practice - the worst case is rare with good hash functions.

## Example Use Cases

- **Two Sum Problem**: Find two numbers that add up to a target
- **Character Counting**: Count how many times each character appears
- **Caching**: Store computed results to avoid recalculation
- **Grouping**: Group items by some property

Hash maps are your secret weapon for solving many algorithm problems efficiently!`,
	},
	{
		id: "two-pointers",
		slug: "two-pointers",
		title: "Two Pointers Technique",
		summary:
			"Master the two pointers technique for solving array problems efficiently.",
		topics: ["arrays", "two-pointers"],
		difficulty: "easy",
		readingMinutes: 4,
		bodyMd: `# Two Pointers Technique

The two pointers technique is a powerful approach for solving array and string problems. It uses two pointers that move through the data structure, often from different ends or at different speeds.

## What is Two Pointers?

Instead of using nested loops (which can be O(n²)), you use two pointers to traverse the array in a single pass (O(n)).

## Common Patterns

### 1. Opposite Ends
Start with one pointer at the beginning and one at the end, move them toward each other.

**Example**: Check if a string is a palindrome
\`\`\`javascript
function isPalindrome(s) {
  let left = 0;
  let right = s.length - 1;
  
  while (left < right) {
    if (s[left] !== s[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}
\`\`\`

### 2. Same Direction
Both pointers start at the beginning and move in the same direction at different speeds.

**Example**: Remove duplicates from sorted array
\`\`\`javascript
function removeDuplicates(nums) {
  let slow = 0;
  
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  
  return slow + 1;
}
\`\`\`

### 3. Sliding Window
Two pointers maintain a "window" of elements that meet certain criteria.

## When to Use Two Pointers

- **Sorted arrays**: Often the key to efficient solutions
- **Palindrome problems**: Check symmetry
- **Pair sum problems**: Find pairs that meet criteria
- **Remove duplicates**: Maintain order while removing
- **Subarray problems**: Find subarrays with specific properties

## Time Complexity

- **Time**: O(n) - single pass through the array
- **Space**: O(1) - only using a constant amount of extra space

## Key Benefits

1. **Efficiency**: Reduces time complexity from O(n²) to O(n)
2. **Space**: Often uses O(1) extra space
3. **Simplicity**: Clean, readable code
4. **Versatility**: Works with many problem types

## Common Mistakes

- Forgetting to handle edge cases (empty arrays, single elements)
- Not updating pointers correctly
- Off-by-one errors with array bounds
- Not considering the sorted property when applicable

The two pointers technique is essential for writing efficient array algorithms!`,
	},
	{
		id: "sliding-window",
		slug: "sliding-window",
		title: "Sliding Window Pattern",
		summary:
			"Learn the sliding window technique for solving subarray and substring problems.",
		topics: ["arrays", "sliding-window", "two-pointers"],
		difficulty: "medium",
		readingMinutes: 5,
		bodyMd: `# Sliding Window Pattern

The sliding window technique is a method for solving problems involving subarrays or substrings efficiently. Instead of checking every possible subarray (which would be O(n²)), you maintain a "window" that slides through the array.

## What is a Sliding Window?

A sliding window is a range of elements in an array that you maintain as you iterate. The window "slides" by moving one or both of its boundaries.

## Types of Sliding Windows

### 1. Fixed Size Window
The window size stays constant as it slides.

**Example**: Find maximum sum of subarray of size k
\`\`\`javascript
function maxSumSubarray(arr, k) {
  let windowSum = 0;
  let maxSum = 0;
  
  // Calculate sum of first window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;
  
  // Slide the window
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum - arr[i - k] + arr[i];
    maxSum = Math.max(maxSum, windowSum);
  }
  
  return maxSum;
}
\`\`\`

### 2. Variable Size Window
The window size changes based on certain conditions.

**Example**: Find smallest subarray with sum >= target
\`\`\`javascript
function minSubarrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let minLen = Infinity;
  
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    
    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }
  
  return minLen === Infinity ? 0 : minLen;
}
\`\`\`

## When to Use Sliding Window

- **Subarray problems**: Finding subarrays with specific properties
- **Substring problems**: Finding substrings that meet criteria
- **Optimization problems**: Finding maximum/minimum of something
- **Contiguous elements**: When you need consecutive elements

## Common Patterns

### Pattern 1: Expand and Contract
1. Expand the window by moving the right pointer
2. Contract the window by moving the left pointer when conditions are met

### Pattern 2: Fixed Window
1. Calculate the first window
2. Slide by removing the leftmost element and adding the rightmost element

## Time Complexity

- **Time**: O(n) - each element is visited at most twice
- **Space**: O(1) - only using a constant amount of extra space

## Key Benefits

1. **Efficiency**: Reduces time complexity from O(n²) to O(n)
2. **Space**: Uses O(1) extra space
3. **Elegant**: Clean, readable solutions
4. **Versatile**: Works with many problem types

## Common Mistakes

- Not handling edge cases (empty arrays, single elements)
- Incorrect window expansion/contraction logic
- Off-by-one errors with array indices
- Not considering the problem constraints

## Practice Problems

- Maximum sum subarray of size k
- Longest substring without repeating characters
- Minimum window substring
- Find all anagrams in a string
- Maximum number of vowels in a substring

The sliding window pattern is essential for efficient subarray and substring algorithms!`,
	},
];
