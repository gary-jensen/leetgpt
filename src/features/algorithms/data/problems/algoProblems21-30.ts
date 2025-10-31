import { AlgoProblemDetail } from "@/types/algorithm-types";

export const algoProblems21to30: AlgoProblemDetail[] = [
	{
		id: "merge-two-sorted-lists",
		slug: "merge-two-sorted-lists",
		title: "Merge Two Sorted Lists",
		statementMd: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

**Note:** Linked lists are represented as arrays in test cases.

#### Example 1:
> **Input:** \`list1 = [1,2,4]\`, \`list2 = [1,3,4]\`
> **Output:** \`[1,1,2,3,4,4]\`

#### Example 2:
> **Input:** \`list1 = []\`, \`list2 = []\`
> **Output:** \`[]\`

#### Example 3:
> **Input:** \`list1 = []\`, \`list2 = [0]\`
> **Output:** \`[0]\`

#### Constraints:
- The number of nodes in both lists is in the range [0, 50].
- -100 <= Node.val <= 100
- Both \`list1\` and \`list2\` are sorted in non-decreasing order.`,
		topics: ["linked-list", "recursion"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 21,
		rubric: {
			optimal_time: "O(n + m)",
			acceptable_time: ["O(n + m)"],
		},
		parameterNames: ["list1", "list2"],
		tests: [
			{
				input: [
					[1, 2, 4],
					[1, 3, 4],
				],
				output: [1, 1, 2, 3, 4, 4],
			},
			{ input: [[], []], output: [] },
			{ input: [[], [0]], output: [0] },
			{ input: [[1], []], output: [1] },
			{
				input: [
					[1, 2, 3],
					[4, 5, 6],
				],
				output: [1, 2, 3, 4, 5, 6],
			},
			{
				input: [
					[4, 5, 6],
					[1, 2, 3],
				],
				output: [1, 2, 3, 4, 5, 6],
			},
			{
				input: [
					[1, 3, 5],
					[2, 4, 6],
				],
				output: [1, 2, 3, 4, 5, 6],
			},
			{
				input: [
					[1, 1, 1],
					[2, 2, 2],
				],
				output: [1, 1, 1, 2, 2, 2],
			},
			{
				input: [
					[-10, -5, 0],
					[5, 10, 15],
				],
				output: [-10, -5, 0, 5, 10, 15],
			},
			{ input: [[1], [2, 3, 4, 5]], output: [1, 2, 3, 4, 5] },
			{ input: [[2, 3, 4, 5], [1]], output: [1, 2, 3, 4, 5] },
			{
				input: [
					[1, 2],
					[3, 4, 5, 6, 7],
				],
				output: [1, 2, 3, 4, 5, 6, 7],
			},
			{
				input: [
					[1, 3, 5, 7, 9],
					[2, 4],
				],
				output: [1, 2, 3, 4, 5, 7, 9],
			},
			{
				input: [
					[-100, -50, 0],
					[-25, 25, 50],
				],
				output: [-100, -50, -25, 0, 25, 50],
			},
			{
				input: [
					[0, 0, 0],
					[0, 0, 0],
				],
				output: [0, 0, 0, 0, 0, 0],
			},
			{
				input: [
					[1, 5],
					[2, 3, 4],
				],
				output: [1, 2, 3, 4, 5],
			},
			{
				input: [
					[1, 2, 3, 7, 8, 9],
					[4, 5, 6],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9],
			},
			{
				input: [
					[10, 20, 30],
					[15, 25],
				],
				output: [10, 15, 20, 25, 30],
			},
			{
				input: [
					[-5, -3, -1],
					[-4, -2, 0],
				],
				output: [-5, -4, -3, -2, -1, 0],
			},
			{ input: [[100], [1, 2, 3, 4, 5]], output: [1, 2, 3, 4, 5, 100] },
			{ input: [[1, 2, 3, 4, 5], [100]], output: [1, 2, 3, 4, 5, 100] },
			{
				input: [
					[1, 10],
					[2, 3, 4, 5, 6, 7, 8, 9],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			},
			{
				input: [
					[2, 3, 4, 5, 6, 7, 8, 9],
					[1, 10],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			},
			{
				input: [
					[-10, 10],
					[-5, 5, 0],
				],
				output: [-10, -5, 0, 5, 10],
			},
			{
				input: [
					[1, 1, 2, 2],
					[1, 1, 2, 2],
				],
				output: [1, 1, 1, 1, 2, 2, 2, 2],
			},
			{
				input: [
					[1, 50],
					[2, 3, 4, 5, 6, 7, 8, 9, 10],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 50],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [50]],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 50],
			},
			{
				input: [
					[-100, 100],
					[-50, 0, 50],
				],
				output: [-100, -50, 0, 50, 100],
			},
			{ input: [[1], [1]], output: [1, 1] },
			{
				input: [
					[0, 1, 2],
					[-1, 3],
				],
				output: [-1, 0, 1, 2, 3],
			},
			{
				input: [
					[1, 3, 5, 7, 9, 11, 13],
					[2, 4, 6, 8, 10, 12],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
			},
			{
				input: [
					[-99, -98, -97],
					[1, 2, 3],
				],
				output: [-99, -98, -97, 1, 2, 3],
			},
			{
				input: [
					[1, 2, 3],
					[-99, -98, -97],
				],
				output: [-99, -98, -97, 1, 2, 3],
			},
			{
				input: [
					[10, 20, 30, 40],
					[15, 25, 35],
				],
				output: [10, 15, 20, 25, 30, 35, 40],
			},
			{ input: [[1, 1, 1, 1, 1], [2]], output: [1, 1, 1, 1, 1, 2] },
			{ input: [[2], [1, 1, 1, 1, 1]], output: [1, 1, 1, 1, 1, 2] },
			{
				input: [
					[1, 2, 3, 99, 100],
					[4, 5, 6],
				],
				output: [1, 2, 3, 4, 5, 6, 99, 100],
			},
			{
				input: [
					[1, 25, 50, 75],
					[10, 20, 30, 40, 60],
				],
				output: [1, 10, 20, 25, 30, 40, 50, 60, 75],
			},
			{
				input: [
					[-50, -25, 0],
					[-75, -60, -40, -10],
				],
				output: [-75, -60, -50, -40, -25, -10, 0],
			},
			{
				input: [
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
					[16, 17, 18],
				],
				output: [
					1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
					18,
				],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} list1
 * @param {number[]} list2
 * @return {number[]}
 */
function mergeTwoLists(list1, list2) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function mergeTwoLists(list1, list2) {
  const result = [];
  let i = 0;
  let j = 0;
  
  while (i < list1.length && j < list2.length) {
    if (list1[i] <= list2[j]) {
      result.push(list1[i]);
      i++;
    } else {
      result.push(list2[j]);
      j++;
    }
  }
  
  while (i < list1.length) {
    result.push(list1[i]);
    i++;
  }
  
  while (j < list2.length) {
    result.push(list2[j]);
    j++;
  }
  
  return result;
}`,
		},
	},
	{
		id: "generate-parentheses",
		slug: "generate-parentheses",
		title: "Generate Parentheses",
		statementMd: `Given \`n\` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

#### Example 1:
> **Input:** \`n = 3\`
> **Output:** \`["((()))","(()())","(())()","()(())","()()()"]\`

#### Example 2:
> **Input:** \`n = 1\`
> **Output:** \`["()"]\`

#### Constraints:
- 1 <= n <= 8`,
		topics: ["string", "backtracking", "recursion"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 22,
		rubric: {
			optimal_time: "O(4^n / sqrt(n))",
			acceptable_time: ["O(4^n / sqrt(n))"],
		},
		parameterNames: ["n"],
		tests: [
			{ input: [1], output: ["()"] },
			{ input: [2], output: ["(())", "()()"] },
			{
				input: [3],
				output: ["((()))", "(()())", "(())()", "()(())", "()()()"],
			},
			{
				input: [4],
				output: [
					"(((())))",
					"((()()))",
					"((())())",
					"((()))()",
					"(()(()))",
					"(()()())",
					"(()())()",
					"(())(())",
					"(())()()",
					"()((()))",
					"()(()())",
					"()(())()",
					"()()(())",
					"()()()()",
				],
			},
			{
				input: [5],
				output: [
					"((((()))))",
					"(((()())))",
					"(((())()))",
					"(((()))())",
					"(((())))()",
					"((()(())))",
					"((()()()))",
					"((()())())",
					"((()()))()",
					"((())(()))",
					"((())()())",
					"((())())()",
					"((()))(())",
					"((()))()()",
					"(()((())))",
					"(()(()()))",
					"(()(())())",
					"(()(()))()",
					"(()()(()))",
					"(()()()())",
					"(()()())()",
					"(()())(())",
					"(()())()()",
					"(())((()))",
					"(())(()())",
					"(())(())()",
					"(())()(())",
					"(())()()()",
					"()(((())))",
					"()((()()))",
					"()((())())",
					"()((()))()",
					"()(()(()))",
					"()(()()())",
					"()(()())()",
					"()(())(())",
					"()(())()()",
					"()()((()))",
					"()()(()())",
					"()()(())()",
					"()()()(())",
					"()()()()()",
				],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function generateParenthesis(n) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function generateParenthesis(n) {
  const result = [];
  
  function backtrack(current, open, close) {
    if (current.length === 2 * n) {
      result.push(current);
      return;
    }
    
    if (open < n) {
      backtrack(current + '(', open + 1, close);
    }
    
    if (close < open) {
      backtrack(current + ')', open, close + 1);
    }
  }
  
  backtrack('', 0, 0);
  return result;
}`,
		},
	},
	{
		id: "merge-k-sorted-lists",
		slug: "merge-k-sorted-lists",
		title: "Merge k Sorted Lists",
		statementMd: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

**Note:** Linked lists are represented as arrays in test cases.

#### Example 1:
> **Input:** \`lists = [[1,4,5],[1,3,4],[2,6]]\`
> **Output:** \`[1,1,2,3,4,4,5,6]\`
> **Explanation:** The linked-lists are:
> - [1,4,5]
> - [1,3,4]
> - [2,6]
> Merging them into one sorted list: [1,1,2,3,4,4,5,6]

#### Example 2:
> **Input:** \`lists = []\`
> **Output:** \`[]\`

#### Example 3:
> **Input:** \`lists = [[]]\`
> **Output:** \`[]\`

#### Constraints:
- k == lists.length
- 0 <= k <= 10^4^
- 0 <= lists[i].length <= 500
- -10^4^ <= lists[i][j] <= 10^4^
- \`lists[i]\` is sorted in ascending order.
- The sum of \`lists[i].length\` will not exceed 10^4^.`,
		topics: ["linked-list", "divide-and-conquer", "heap"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 23,
		rubric: {
			optimal_time: "O(n log k)",
			acceptable_time: ["O(n log n)"],
		},
		parameterNames: ["lists"],
		tests: [
			{
				input: [
					[
						[1, 4, 5],
						[1, 3, 4],
						[2, 6],
					],
				],
				output: [1, 1, 2, 3, 4, 4, 5, 6],
			},
			{ input: [[]], output: [] },
			{ input: [[[]]], output: [] },
			{ input: [[[1], [2], [3]]], output: [1, 2, 3] },
			{ input: [[[1, 2, 3], [], [4, 5, 6]]], output: [1, 2, 3, 4, 5, 6] },
			{ input: [[[1], [1], [1]]], output: [1, 1, 1] },
			{
				input: [
					[
						[1, 3, 5],
						[2, 4, 6],
					],
				],
				output: [1, 2, 3, 4, 5, 6],
			},
			{ input: [[[1, 2, 3]]], output: [1, 2, 3] },
			{ input: [[[1], [3], [5], [2], [4]]], output: [1, 2, 3, 4, 5] },
			{
				input: [
					[
						[-1, 0, 1],
						[-2, 2],
					],
				],
				output: [-2, -1, 0, 1, 2],
			},
			{
				input: [
					[
						[1, 2],
						[3, 4],
						[5, 6],
					],
				],
				output: [1, 2, 3, 4, 5, 6],
			},
			{ input: [[[10], [20], [30], [40]]], output: [10, 20, 30, 40] },
			{
				input: [
					[
						[1, 1, 1],
						[2, 2, 2],
						[3, 3, 3],
					],
				],
				output: [1, 1, 1, 2, 2, 2, 3, 3, 3],
			},
			{
				input: [
					[
						[1, 5, 9],
						[2, 6, 10],
						[3, 7, 11],
						[4, 8, 12],
					],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			},
			{
				input: [
					[
						[-100, -50, 0],
						[25, 50, 75],
					],
				],
				output: [-100, -50, 0, 25, 50, 75],
			},
			{
				input: [[[1, 2, 3, 4, 5], [], [6, 7, 8, 9, 10]]],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			},
			{ input: [[[1, 3], [2], [4, 5, 6]]], output: [1, 2, 3, 4, 5, 6] },
			{ input: [[[1], [2], [3], [4], [5]]], output: [1, 2, 3, 4, 5] },
			{
				input: [
					[
						[1, 10, 20],
						[2, 11, 21],
						[3, 12, 22],
					],
				],
				output: [1, 2, 3, 10, 11, 12, 20, 21, 22],
			},
			{
				input: [
					[
						[0, 0, 0],
						[1, 1, 1],
					],
				],
				output: [0, 0, 0, 1, 1, 1],
			},
			{
				input: [[[100], [1], [50], [25], [75]]],
				output: [1, 25, 50, 75, 100],
			},
			{
				input: [
					[
						[1, 2, 3, 99, 100],
						[4, 5, 6],
					],
				],
				output: [1, 2, 3, 4, 5, 6, 99, 100],
			},
			{
				input: [
					[
						[-5, -4, -3],
						[-2, -1, 0],
						[1, 2, 3],
					],
				],
				output: [-5, -4, -3, -2, -1, 0, 1, 2, 3],
			},
			{
				input: [
					[
						[1, 4, 7],
						[2, 5, 8],
						[3, 6, 9],
					],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9],
			},
			{
				input: [
					[
						[1, 2, 3],
						[4, 5, 6],
						[7, 8, 9],
						[10, 11, 12],
					],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
			},
			{ input: [[[1], [2, 3], [4, 5, 6]]], output: [1, 2, 3, 4, 5, 6] },
			{
				input: [
					[
						[1, 1, 1, 1],
						[2, 2, 2, 2],
					],
				],
				output: [1, 1, 1, 1, 2, 2, 2, 2],
			},
			{
				input: [
					[
						[1, 3, 5, 7, 9],
						[2, 4, 6, 8, 10],
					],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			},
			{
				input: [
					[
						[1, 50],
						[2, 3, 4],
						[5, 6, 7, 8],
					],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 50],
			},
			{ input: [[[-10, 10], [-5, 5], [0]]], output: [-10, -5, 0, 5, 10] },
			{
				input: [
					[
						[1, 2, 3],
						[10, 20, 30],
						[100, 200, 300],
					],
				],
				output: [1, 2, 3, 10, 20, 30, 100, 200, 300],
			},
			{
				input: [[[1], [1], [1], [1], [1], [1]]],
				output: [1, 1, 1, 1, 1, 1],
			},
			{
				input: [
					[
						[1, 2],
						[3, 4],
						[5, 6],
						[7, 8],
						[9, 10],
					],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			},
			{
				input: [
					[
						[1, 3, 5],
						[2, 4],
						[6, 7, 8],
					],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8],
			},
			{
				input: [
					[
						[100, 200],
						[1, 2],
						[50, 150],
					],
				],
				output: [1, 2, 50, 100, 150, 200],
			},
			{
				input: [
					[
						[1, 1, 2, 2],
						[3, 3, 4, 4],
					],
				],
				output: [1, 1, 2, 2, 3, 3, 4, 4],
			},
			{
				input: [
					[
						[1, 5, 9],
						[2, 3, 4],
						[6, 7, 8],
					],
				],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9],
			},
			{
				input: [[[1, 2, 3, 4, 5], [6], [7, 8, 9, 10]]],
				output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
			},
			{
				input: [
					[
						[-1, 0, 1],
						[-2, -1, 0],
						[1, 2, 3],
					],
				],
				output: [-2, -1, -1, 0, 0, 1, 1, 2, 3],
			},
			{
				input: [
					[
						[1, 10, 100],
						[2, 20, 200],
						[3, 30, 300],
					],
				],
				output: [1, 2, 3, 10, 20, 30, 100, 200, 300],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[][]} lists
 * @return {number[]}
 */
function mergeKLists(lists) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function mergeKLists(lists) {
  if (lists.length === 0) return [];
  
  // Filter out empty lists
  const nonEmptyLists = lists.filter(list => list.length > 0);
  if (nonEmptyLists.length === 0) return [];
  
  const result = [];
  const pointers = new Array(nonEmptyLists.length).fill(0);
  
  while (true) {
    let minIndex = -1;
    let minValue = Infinity;
    
    // Find the minimum value among all current pointers
    for (let i = 0; i < nonEmptyLists.length; i++) {
      if (pointers[i] < nonEmptyLists[i].length) {
        if (nonEmptyLists[i][pointers[i]] < minValue) {
          minValue = nonEmptyLists[i][pointers[i]];
          minIndex = i;
        }
      }
    }
    
    // If no more elements, break
    if (minIndex === -1) break;
    
    result.push(minValue);
    pointers[minIndex]++;
  }
  
  return result;
}`,
		},
	},
	{
		id: "swap-nodes-in-pairs",
		slug: "swap-nodes-in-pairs",
		title: "Swap Nodes in Pairs",
		statementMd: `Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the list's nodes (i.e., only nodes themselves may be changed).

**Note:** Linked lists are represented as arrays in test cases.

#### Example 1:
> **Input:** \`head = [1,2,3,4]\`
> **Output:** \`[2,1,4,3]\`

#### Example 2:
> **Input:** \`head = []\`
> **Output:** \`[]\`

#### Example 3:
> **Input:** \`head = [1]\`
> **Output:** \`[1]\`

#### Constraints:
- The number of nodes in the list is in the range [0, 100].
- 0 <= Node.val <= 100`,
		topics: ["linked-list", "recursion"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 24,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["head"],
		tests: [
			{ input: [[1, 2, 3, 4]], output: [2, 1, 4, 3] },
			{ input: [[]], output: [] },
			{ input: [[1]], output: [1] },
			{ input: [[1, 2]], output: [2, 1] },
			{ input: [[1, 2, 3]], output: [2, 1, 3] },
			{ input: [[1, 2, 3, 4, 5]], output: [2, 1, 4, 3, 5] },
			{ input: [[1, 2, 3, 4, 5, 6]], output: [2, 1, 4, 3, 6, 5] },
			{ input: [[1, 2, 3, 4, 5, 6, 7]], output: [2, 1, 4, 3, 6, 5, 7] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8]],
				output: [2, 1, 4, 3, 6, 5, 8, 7],
			},
			{ input: [[0]], output: [0] },
			{ input: [[10, 20]], output: [20, 10] },
			{ input: [[10, 20, 30]], output: [20, 10, 30] },
			{ input: [[10, 20, 30, 40]], output: [20, 10, 40, 30] },
			{ input: [[5, 10, 15, 20, 25]], output: [10, 5, 20, 15, 25] },
			{
				input: [[5, 10, 15, 20, 25, 30]],
				output: [10, 5, 20, 15, 30, 25],
			},
			{ input: [[1, 1, 2, 2]], output: [1, 1, 2, 2] },
			{ input: [[1, 2, 1, 2]], output: [2, 1, 2, 1] },
			{ input: [[100, 50]], output: [50, 100] },
			{ input: [[-1, -2]], output: [-2, -1] },
			{ input: [[-1, -2, -3, -4]], output: [-2, -1, -4, -3] },
			{ input: [[0, 1, 2, 3]], output: [1, 0, 3, 2] },
			{ input: [[1, 3, 5, 7, 9]], output: [3, 1, 7, 5, 9] },
			{ input: [[2, 4, 6, 8, 10]], output: [4, 2, 8, 6, 10] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9]],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 9],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 10, 9],
			},
			{ input: [[11, 22, 33, 44]], output: [22, 11, 44, 33] },
			{ input: [[99, 88, 77, 66]], output: [88, 99, 66, 77] },
			{ input: [[50, 60, 70, 80, 90]], output: [60, 50, 80, 70, 90] },
			{ input: [[1, 10, 100]], output: [10, 1, 100] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 11],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11],
			},
			{ input: [[1, 1, 1, 1, 1, 1]], output: [1, 1, 1, 1, 1, 1] },
			{ input: [[1, 2, 1, 2, 1, 2]], output: [2, 1, 2, 1, 2, 1] },
			{
				input: [[10, 20, 30, 40, 50, 60, 70, 80]],
				output: [20, 10, 40, 30, 60, 50, 80, 70],
			},
			{ input: [[25, 50, 75, 100]], output: [50, 25, 100, 75] },
			{ input: [[-10, 10, -20, 20]], output: [10, -10, 20, -20] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13, 15],
			},
			{ input: [[100, 99, 98, 97]], output: [99, 100, 97, 98] },
			{ input: [[1, 3, 2, 4]], output: [3, 1, 4, 2] },
			{
				input: [
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
				],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13, 16, 15],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} head
 * @return {number[]}
 */
function swapPairs(head) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function swapPairs(head) {
  if (head.length === 0 || head.length === 1) {
    return head;
  }
  
  const result = [];
  
  for (let i = 0; i < head.length; i += 2) {
    if (i + 1 < head.length) {
      // Swap pair
      result.push(head[i + 1]);
      result.push(head[i]);
    } else {
      // Last odd element
      result.push(head[i]);
    }
  }
  
  return result;
}`,
		},
	},
	{
		id: "reverse-nodes-in-k-group",
		slug: "reverse-nodes-in-k-group",
		title: "Reverse Nodes in k-Group",
		statementMd: `Given the head of a linked list, reverse the nodes of the list \`k\` at a time, and return the modified list.

\`k\` is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of \`k\` then left-out nodes, in the end, should remain as it is.

You may not alter the values in the list's nodes, only nodes themselves may be changed.

**Note:** Linked lists are represented as arrays in test cases.

#### Example 1:
> **Input:** \`head = [1,2,3,4,5]\`, \`k = 2\`
> **Output:** \`[2,1,4,3,5]\`

#### Example 2:
> **Input:** \`head = [1,2,3,4,5]\`, \`k = 3\`
> **Output:** \`[3,2,1,4,5]\`

#### Constraints:
- The number of nodes in the list is \`n\`.
- 1 <= k <= n <= 5000
- 0 <= Node.val <= 1000`,
		topics: ["linked-list", "recursion"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 25,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["head", "k"],
		tests: [
			{ input: [[1, 2, 3, 4, 5], 2], output: [2, 1, 4, 3, 5] },
			{ input: [[1, 2, 3, 4, 5], 3], output: [3, 2, 1, 4, 5] },
			{ input: [[1, 2, 3, 4, 5], 1], output: [1, 2, 3, 4, 5] },
			{ input: [[1], 1], output: [1] },
			{ input: [[1, 2], 1], output: [1, 2] },
			{ input: [[1, 2], 2], output: [2, 1] },
			{ input: [[1, 2, 3, 4], 2], output: [2, 1, 4, 3] },
			{ input: [[1, 2, 3, 4], 4], output: [4, 3, 2, 1] },
			{ input: [[1, 2, 3, 4, 5, 6], 2], output: [2, 1, 4, 3, 6, 5] },
			{ input: [[1, 2, 3, 4, 5, 6], 3], output: [3, 2, 1, 6, 5, 4] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7], 2],
				output: [2, 1, 4, 3, 6, 5, 7],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7], 3],
				output: [3, 2, 1, 6, 5, 4, 7],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8], 2],
				output: [2, 1, 4, 3, 6, 5, 8, 7],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8], 3],
				output: [3, 2, 1, 6, 5, 4, 7, 8],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8], 4],
				output: [4, 3, 2, 1, 8, 7, 6, 5],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 2],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 9],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 3],
				output: [3, 2, 1, 6, 5, 4, 9, 8, 7],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 5],
				output: [5, 4, 3, 2, 1, 9, 8, 7, 6],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 10, 9],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5],
				output: [5, 4, 3, 2, 1, 10, 9, 8, 7, 6],
			},
			{ input: [[10, 20, 30, 40], 2], output: [20, 10, 40, 30] },
			{ input: [[10, 20, 30, 40], 4], output: [40, 30, 20, 10] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 3],
				output: [3, 2, 1, 6, 5, 4, 9, 8, 7, 11, 10],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 3],
				output: [3, 2, 1, 6, 5, 4, 9, 8, 7, 12, 11, 10],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 4],
				output: [4, 3, 2, 1, 8, 7, 6, 5, 12, 11, 10, 9],
			},
			{
				input: [[100, 200, 300, 400, 500], 2],
				output: [200, 100, 400, 300, 500],
			},
			{
				input: [[100, 200, 300, 400, 500], 3],
				output: [300, 200, 100, 500, 400],
			},
			{ input: [[0, 1, 2, 3, 4, 5], 3], output: [2, 1, 0, 5, 4, 3] },
			{ input: [[1, 1, 2, 2, 3, 3], 2], output: [1, 1, 2, 2, 3, 3] },
			{ input: [[1, 2, 1, 2, 1, 2], 2], output: [2, 1, 2, 1, 2, 1] },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 2],
				output: [2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 14, 13],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 7],
				output: [7, 6, 5, 4, 3, 2, 1, 14, 13, 12, 11, 10, 9, 8],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 3],
				output: [3, 2, 1, 6, 5, 4, 9, 8, 7, 12, 11, 10, 15, 14, 13],
			},
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 5],
				output: [5, 4, 3, 2, 1, 10, 9, 8, 7, 6, 15, 14, 13, 12, 11],
			},
			{ input: [[50, 60, 70, 80, 90], 2], output: [60, 50, 80, 70, 90] },
			{ input: [[50, 60, 70, 80, 90], 3], output: [70, 60, 50, 90, 80] },
			{
				input: [
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
					4,
				],
				output: [4, 3, 2, 1, 8, 7, 6, 5, 12, 11, 10, 9, 16, 15, 14, 13],
			},
			{
				input: [
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
					8,
				],
				output: [8, 7, 6, 5, 4, 3, 2, 1, 16, 15, 14, 13, 12, 11, 10, 9],
			},
			{ input: [[-1, -2, -3, -4, -5], 2], output: [-2, -1, -4, -3, -5] },
			{
				input: [
					[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
					4,
				],
				output: [
					4, 3, 2, 1, 8, 7, 6, 5, 12, 11, 10, 9, 16, 15, 14, 13, 17,
				],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} head
 * @param {number} k
 * @return {number[]}
 */
function reverseKGroup(head, k) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function reverseKGroup(head, k) {
  if (k === 1 || head.length === 0) {
    return head;
  }
  
  const result = [];
  const n = head.length;
  
  for (let i = 0; i < n; i += k) {
    const end = Math.min(i + k, n);
    
    // Check if we have a complete group of k
    if (end - i === k) {
      // Reverse the group
      for (let j = end - 1; j >= i; j--) {
        result.push(head[j]);
      }
    } else {
      // Leave remaining nodes as is
      for (let j = i; j < end; j++) {
        result.push(head[j]);
      }
    }
  }
  
  return result;
}`,
		},
	},
	{
		id: "remove-duplicates-from-sorted-array",
		slug: "remove-duplicates-from-sorted-array",
		title: "Remove Duplicates from Sorted Array",
		statementMd: `Given an integer array \`nums\` sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.

Since it is impossible to change the length of the array in some languages, you must instead have the result be placed in the first part of the array \`nums\`. More formally, if there are \`k\` elements after removing the duplicates, then the first \`k\` elements of \`nums\` should hold the final result. It does not matter what you leave beyond the first \`k\` elements.

Return \`k\` after placing the final result in the first \`k\` slots of \`nums\`.

Do not allocate extra space for another array. You must do this by modifying the input array in-place with O(1) extra memory.

#### Example 1:
> **Input:** \`nums = [1,1,2]\`
> **Output:** \`2\`, \`nums = [1,2,_]\`
> **Explanation:** Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively. It does not matter what you leave beyond the returned k (hence they are underscores).

#### Example 2:
> **Input:** \`nums = [0,0,1,1,1,2,2,3,3,4]\`
> **Output:** \`5\`, \`nums = [0,1,2,3,4,_,_,_,_,_]\`
> **Explanation:** Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively. It does not matter what you leave beyond the returned k (hence they are underscores).

#### Constraints:
- 1 <= nums.length <= 3 * 10^4^
- -100 <= nums[i] <= 100
- \`nums\` is sorted in non-decreasing order.`,
		topics: ["arrays", "two-pointers"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 26,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["nums"],
		tests: [
			{ input: [[1, 1, 2]], output: 2 },
			{ input: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], output: 5 },
			{ input: [[1, 1, 1, 1]], output: 1 },
			{ input: [[1, 2, 3]], output: 3 },
			{ input: [[1]], output: 1 },
			{ input: [[1, 1, 2, 2]], output: 2 },
			{ input: [[1, 2, 2, 3]], output: 3 },
			{ input: [[-1, -1, 0, 0, 1, 1]], output: 3 },
			{ input: [[0, 0, 0, 1, 1, 2, 2, 3]], output: 4 },
			{ input: [[1, 1, 1, 2, 2, 3, 3, 3, 4]], output: 4 },
			{ input: [[1, 2, 3, 4, 5]], output: 5 },
			{ input: [[1, 1, 1, 1, 1, 2]], output: 2 },
			{ input: [[-100, -100, -50, -50, 0, 0, 50, 50, 100]], output: 5 },
			{ input: [[1, 1, 2, 3, 3, 3, 4, 4, 5]], output: 5 },
			{ input: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], output: 10 },
			{ input: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], output: 1 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], output: 10 },
			{ input: [[1, 1, 2, 2, 3, 3, 4, 4, 5, 5]], output: 5 },
			{ input: [[10, 10, 20, 20, 30, 30]], output: 3 },
			{ input: [[-5, -5, -3, -3, 0, 0, 3, 3, 5, 5]], output: 5 },
			{ input: [[1, 1, 1, 2, 2, 2, 3, 3, 3]], output: 3 },
			{ input: [[1, 2, 3, 4, 5, 5, 5, 6, 7]], output: 7 },
			{ input: [[0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]], output: 6 },
			{ input: [[1, 1, 1, 1, 2, 2, 2, 3, 3, 4]], output: 4 },
			{ input: [[100, 100, 100]], output: 1 },
			{ input: [[-10, -10, -9, -9, -8, -8]], output: 3 },
			{ input: [[1, 2, 3, 3, 3, 4, 5, 5, 6]], output: 6 },
			{ input: [[0, 1, 1, 2, 3, 4, 4, 5, 6, 7]], output: 8 },
			{ input: [[1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]], output: 10 },
			{ input: [[-50, -50, -25, -25, 0, 0, 25, 25, 50, 50]], output: 5 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]], output: 11 },
			{ input: [[1, 1, 1, 2, 2, 3, 4, 5, 5, 5, 6]], output: 6 },
			{ input: [[0, 0, 0, 0, 1, 1, 1, 2, 2, 3]], output: 4 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]], output: 12 },
			{ input: [[1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]], output: 6 },
			{ input: [[-100, -99, -98, -97, -96]], output: 5 },
			{ input: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2]], output: 2 },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]],
				output: 13,
			},
			{ input: [[1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7]], output: 7 },
			{
				input: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
				output: 15,
			},
			{
				input: [[1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5]],
				output: 5,
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function removeDuplicates(nums) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  
  let writeIndex = 1;
  
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      nums[writeIndex] = nums[i];
      writeIndex++;
    }
  }
  
  return writeIndex;
}`,
		},
	},
	{
		id: "remove-element",
		slug: "remove-element",
		title: "Remove Element",
		statementMd: `Given an integer array \`nums\` and an integer \`val\`, remove all occurrences of \`val\` in \`nums\` in-place. The order of the elements may be changed. Then return the number of elements in \`nums\` which are not equal to \`val\`.

Consider the number of elements in \`nums\` which are not equal to \`val\` be \`k\`, to get accepted, you need to do the following things:

- Change the array \`nums\` such that the first \`k\` elements of \`nums\` contain the elements which are not equal to \`val\`. The elements beyond the first \`k\` elements are not important as well as the size of \`nums\`.
- Return \`k\`.

#### Example 1:
> **Input:** \`nums = [3,2,2,3]\`, \`val = 3\`
> **Output:** \`2\`, \`nums = [2,2,_,_]\`
> **Explanation:** Your function should return k = 2, with the first two elements of nums being 2. It does not matter what you leave beyond the returned k (hence they are underscores).

#### Example 2:
> **Input:** \`nums = [0,1,2,2,3,0,4,2]\`, \`val = 2\`
> **Output:** \`5\`, \`nums = [0,1,4,0,3,_,_,_]\`
> **Explanation:** Your function should return k = 5, with the first five elements of nums being 0, 1, 3, 0, and 4. Note that the order of those five elements can be arbitrary. It does not matter what you leave beyond the returned k (hence they are underscores).

#### Constraints:
- 0 <= nums.length <= 100
- 0 <= nums[i] <= 50
- 0 <= val <= 100`,
		topics: ["arrays", "two-pointers"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 27,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["nums", "val"],
		tests: [
			{ input: [[3, 2, 2, 3], 3], output: 2 },
			{ input: [[0, 1, 2, 2, 3, 0, 4, 2], 2], output: 5 },
			{ input: [[1], 1], output: 0 },
			{ input: [[1], 2], output: 1 },
			{ input: [[1, 2, 3], 4], output: 3 },
			{ input: [[1, 1, 1, 1], 1], output: 0 },
			{ input: [[1, 2, 3, 4], 5], output: 4 },
			{ input: [[5, 5, 5, 5], 5], output: 0 },
			{ input: [[1, 2, 3, 4, 5], 3], output: 4 },
			{ input: [[0, 0, 0, 0], 0], output: 0 },
			{ input: [[10, 20, 30], 10], output: 2 },
			{ input: [[10, 20, 30], 20], output: 2 },
			{ input: [[10, 20, 30], 30], output: 2 },
			{ input: [[1, 2, 3, 4, 5, 6], 1], output: 5 },
			{ input: [[1, 2, 3, 4, 5, 6], 6], output: 5 },
			{ input: [[-1, 0, 1, 2], 1], output: 3 },
			{ input: [[1, 2, 2, 3, 3, 3], 2], output: 4 },
			{ input: [[1, 2, 2, 3, 3, 3], 3], output: 3 },
			{ input: [[10, 20, 30, 40, 50], 25], output: 5 },
			{ input: [[1, 3, 5, 7, 9], 5], output: 4 },
			{ input: [[0, 1, 2, 3, 4, 5], 0], output: 5 },
			{ input: [[1, 1, 2, 2, 3, 3], 1], output: 4 },
			{ input: [[1, 1, 2, 2, 3, 3], 2], output: 4 },
			{ input: [[1, 1, 2, 2, 3, 3], 3], output: 4 },
			{ input: [[100, 200, 300], 100], output: 2 },
			{ input: [[100, 200, 300], 200], output: 2 },
			{ input: [[100, 200, 300], 300], output: 2 },
			{ input: [[50, 50, 50], 50], output: 0 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], output: 9 },
			{ input: [[0, 0, 1, 1, 2, 2], 0], output: 4 },
			{ input: [[0, 0, 1, 1, 2, 2], 1], output: 4 },
			{ input: [[0, 0, 1, 1, 2, 2], 2], output: 4 },
			{ input: [[10, 20, 30, 40, 50, 60], 35], output: 6 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 11], output: 10 },
			{ input: [[-5, -4, -3, -2, -1], -3], output: 4 },
			{ input: [[1, 1, 1, 2, 2, 2, 3, 3, 3], 1], output: 6 },
			{ input: [[1, 1, 1, 2, 2, 2, 3, 3, 3], 2], output: 6 },
			{ input: [[1, 1, 1, 2, 2, 2, 3, 3, 3], 3], output: 6 },
			{ input: [[25, 25, 25, 50, 50], 25], output: 2 },
			{ input: [[25, 25, 25, 50, 50], 50], output: 3 },
			{ input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 6], output: 11 },
			{ input: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5], output: 9 },
			{
				input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 7],
				output: 12,
			},
		],
		startingCode: {
			javascript: `/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
function removeElement(nums, val) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function removeElement(nums, val) {
  let writeIndex = 0;
  
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== val) {
      nums[writeIndex] = nums[i];
      writeIndex++;
    }
  }
  
  return writeIndex;
}`,
		},
	},
	{
		id: "find-the-index-of-the-first-occurrence-in-a-string",
		slug: "find-the-index-of-the-first-occurrence-in-a-string",
		title: "Find the Index of the First Occurrence in a String",
		statementMd: `Given two strings \`needle\` and \`haystack\`, return the index of the first occurrence of \`needle\` in \`haystack\`, or \`-1\` if \`needle\` is not part of \`haystack\`.

#### Example 1:
> **Input:** \`haystack = "sadbutsad"\`, \`needle = "sad"\`
> **Output:** \`0\`
> **Explanation:** "sad" occurs at index 0 and 6. The first occurrence is at index 0, so we return 0.

#### Example 2:
> **Input:** \`haystack = "leetcode"\`, \`needle = "leeto"\`
> **Output:** \`-1\`
> **Explanation:** "leeto" did not occur in "leetcode", so we return -1.

#### Constraints:
- 1 <= haystack.length, needle.length <= 10^4^
- \`haystack\` and \`needle\` consist of only lowercase English letters.`,
		topics: ["strings", "two-pointers", "string-matching"],
		difficulty: "easy",
		languages: ["javascript"],
		order: 28,
		rubric: {
			optimal_time: "O(n)",
			acceptable_time: ["O(n * m)"],
		},
		parameterNames: ["haystack", "needle"],
		tests: [
			{ input: ["sadbutsad", "sad"], output: 0 },
			{ input: ["leetcode", "leeto"], output: -1 },
			{ input: ["hello", "ll"], output: 2 },
			{ input: ["aaaaa", "bba"], output: -1 },
			{ input: ["a", "a"], output: 0 },
			{ input: ["abc", "c"], output: 2 },
			{ input: ["abc", "d"], output: -1 },
			{ input: ["hello", "lo"], output: 3 },
			{ input: ["mississippi", "issip"], output: 4 },
			{ input: ["hello", "hello"], output: 0 },
			{ input: ["hello", "helloworld"], output: -1 },
			{ input: ["", ""], output: 0 },
			{ input: ["a", ""], output: 0 },
			{ input: ["abc", "abc"], output: 0 },
			{ input: ["abcabc", "abc"], output: 0 },
			{ input: ["ababab", "abab"], output: 0 },
			{ input: ["leetcode", "code"], output: 4 },
			{ input: ["testtest", "test"], output: 0 },
			{ input: ["abcdef", "def"], output: 3 },
			{ input: ["programming", "gram"], output: 3 },
			{ input: ["algorithm", "rithm"], output: 3 },
			{ input: ["javascript", "script"], output: 4 },
			{ input: ["python", "th"], output: 2 },
			{ input: ["java", "av"], output: 1 },
			{ input: ["coding", "ing"], output: 3 },
			{ input: ["leetcode", "leet"], output: 0 },
			{ input: ["leetcode", "code"], output: 4 },
			{ input: ["leetcode", "e"], output: 1 },
			{ input: ["leetcode", "t"], output: 3 },
			{ input: ["leetcode", "le"], output: 0 },
			{ input: ["leetcode", "de"], output: 3 },
			{ input: ["programming", "mm"], output: 7 },
			{ input: ["abcdefghij", "def"], output: 3 },
			{ input: ["abcdefghij", "hij"], output: 7 },
			{ input: ["teststring", "string"], output: 4 },
			{ input: ["abababab", "abab"], output: 0 },
			{ input: ["abababab", "baba"], output: 1 },
			{ input: ["aaaaa", "aa"], output: 0 },
			{ input: ["aaaaa", "aaa"], output: 0 },
			{ input: ["hello world", "world"], output: 6 },
			{ input: ["hello world", " "], output: 5 },
			{ input: ["test", "t"], output: 0 },
			{ input: ["test", "est"], output: 1 },
			{ input: ["test", "st"], output: 2 },
			{ input: ["testtest", "est"], output: 1 },
			{ input: ["ababababab", "abab"], output: 0 },
			{ input: ["abcdefghijklmnop", "def"], output: 3 },
			{ input: ["abcdefghijklmnop", "mno"], output: 12 },
			{ input: ["leetcode", "leetcode"], output: 0 },
			{ input: ["leetcode", "leetcodeleetcode"], output: -1 },
		],
		startingCode: {
			javascript: `/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
function strStr(haystack, needle) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function strStr(haystack, needle) {
  if (needle.length === 0) return 0;
  if (needle.length > haystack.length) return -1;
  
  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let match = true;
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return i;
    }
  }
  
  return -1;
}`,
		},
	},
	{
		id: "divide-two-integers",
		slug: "divide-two-integers",
		title: "Divide Two Integers",
		statementMd: `Given two integers \`dividend\` and \`divisor\`, divide two integers without using multiplication, division, and mod operator.

The integer division should truncate toward zero, which means losing its fractional part. For example, 8.345 would be truncated to 8, and -2.7335 would be truncated to -2.

Return the quotient after dividing \`dividend\` by \`divisor\`.

**Note:** Assume we are dealing with an environment that could only store integers within the 32-bit signed integer range: [−2^31^, 2^31^ − 1]. For this problem, if the quotient is strictly greater than 2^31^ − 1, then return 2^31^ − 1, and if the quotient is strictly less than −2^31^, then return −2^31^.

#### Example 1:
> **Input:** \`dividend = 10\`, \`divisor = 3\`
> **Output:** \`3\`
> **Explanation:** 10/3 = 3.33333.. which is truncated to 3.

#### Example 2:
> **Input:** \`dividend = 7\`, \`divisor = -3\`
> **Output:** \`-2\`
> **Explanation:** 7/-3 = -2.33333.. which is truncated to -2.

#### Constraints:
- -2^31^ <= dividend, divisor <= 2^31^ - 1
- divisor != 0`,
		topics: ["math", "bit-manipulation"],
		difficulty: "medium",
		languages: ["javascript"],
		order: 29,
		rubric: {
			optimal_time: "O(log n)",
			acceptable_time: ["O(n)"],
		},
		parameterNames: ["dividend", "divisor"],
		tests: [
			{ input: [10, 3], output: 3 },
			{ input: [7, -3], output: -2 },
			{ input: [0, 1], output: 0 },
			{ input: [1, 1], output: 1 },
			{ input: [-1, 1], output: -1 },
			{ input: [1, -1], output: -1 },
			{ input: [-1, -1], output: 1 },
			{ input: [15, 3], output: 5 },
			{ input: [15, -3], output: -5 },
			{ input: [-15, 3], output: -5 },
			{ input: [-15, -3], output: 5 },
			{ input: [2147483647, 1], output: 2147483647 },
			{ input: [-2147483648, -1], output: 2147483647 },
			{ input: [-2147483648, 1], output: -2147483648 },
			{ input: [2147483647, -1], output: -2147483647 },
			{ input: [100, 25], output: 4 },
			{ input: [100, -25], output: -4 },
			{ input: [-100, 25], output: -4 },
			{ input: [-100, -25], output: 4 },
			{ input: [9, 3], output: 3 },
			{ input: [9, -3], output: -3 },
			{ input: [-9, 3], output: -3 },
			{ input: [-9, -3], output: 3 },
			{ input: [12, 4], output: 3 },
			{ input: [12, -4], output: -3 },
			{ input: [16, 4], output: 4 },
			{ input: [16, -4], output: -4 },
			{ input: [20, 5], output: 4 },
			{ input: [20, -5], output: -4 },
			{ input: [25, 5], output: 5 },
			{ input: [25, -5], output: -5 },
			{ input: [30, 6], output: 5 },
			{ input: [30, -6], output: -5 },
			{ input: [36, 6], output: 6 },
			{ input: [36, -6], output: -6 },
			{ input: [42, 7], output: 6 },
			{ input: [42, -7], output: -6 },
			{ input: [49, 7], output: 7 },
			{ input: [49, -7], output: -7 },
			{ input: [56, 8], output: 7 },
			{ input: [56, -8], output: -7 },
			{ input: [64, 8], output: 8 },
			{ input: [64, -8], output: -8 },
			{ input: [72, 9], output: 8 },
			{ input: [72, -9], output: -8 },
			{ input: [81, 9], output: 9 },
			{ input: [81, -9], output: -9 },
			{ input: [100, 10], output: 10 },
			{ input: [100, -10], output: -10 },
			{ input: [110, 11], output: 10 },
			{ input: [110, -11], output: -10 },
			{ input: [121, 11], output: 11 },
			{ input: [121, -11], output: -11 },
			{ input: [132, 12], output: 11 },
			{ input: [132, -12], output: -11 },
			{ input: [144, 12], output: 12 },
			{ input: [144, -12], output: -12 },
		],
		startingCode: {
			javascript: `/**
 * @param {number} dividend
 * @param {number} divisor
 * @return {number}
 */
function divide(dividend, divisor) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function divide(dividend, divisor) {
  // Handle edge case
  if (dividend === -2147483648 && divisor === -1) {
    return 2147483647;
  }
  
  const isNegative = (dividend < 0) !== (divisor < 0);
  let absDividend = Math.abs(dividend);
  const absDivisor = Math.abs(divisor);
  
  if (absDividend < absDivisor) {
    return 0;
  }
  
  let quotient = 0;
  let temp = 0;
  
  for (let i = 31; i >= 0; i--) {
    if (temp + (absDivisor << i) <= absDividend) {
      temp += absDivisor << i;
      quotient |= 1 << i;
    }
  }
  
  return isNegative ? -quotient : quotient;
}`,
		},
	},
	{
		id: "substring-with-concatenation-of-all-words",
		slug: "substring-with-concatenation-of-all-words",
		title: "Substring with Concatenation of All Words",
		statementMd: `You are given a string \`s\` and an array of strings \`words\`. All the strings of \`words\` are of the same length.

A concatenated substring in \`s\` is a substring that contains all the strings of any permutation of \`words\` concatenated.

- For example, if \`words = ["ab","cd","ef"]\`, then \`"abcdef"\`, \`"abefcd"\`, \`"cdabef"\`, \`"cdefab"\`, \`"efabcd"\`, and \`"efcdab"\` are all concatenated strings. \`"acdbef"\` is not a concatenated substring because it is not the concatenation of any permutation of \`words\`.

Return the starting indices of all the concatenated substrings in \`s\`. You can return the answer in any order.

#### Example 1:
> **Input:** \`s = "barfoothefoobarman"\`, \`words = ["foo","bar"]\`
> **Output:** \`[0,9]\`
> **Explanation:** Since words.length == 2 and words[i].length == 3, the concatenated substring has to be of length 6.
> The substring starting at 0 is "barfoo". It is the concatenation of ["bar","foo"] which is a permutation of words.
> The substring starting at 9 is "foobar". It is the concatenation of ["foo","bar"] which is a permutation of words.
> The output order does not matter. Returning [9,0] is fine too.

#### Example 2:
> **Input:** \`s = "wordgoodgoodgoodbestword"\`, \`words = ["word","good","best","word"]\`
> **Output:** \`[]\`
> **Explanation:** Since the length and frequency of "word" and "good" is 4, but the length of words[3] is 4, the concatenated substring has to be of length 16.
> There is no substring of length 16 in s that is equal to the concatenation of any permutation of words.
> We cannot match "goodgood" to "word" in words.

#### Example 3:
> **Input:** \`s = "barfoofoobarthefoobarman"\`, \`words = ["bar","foo","the"]\`
> **Output:** \`[6,9,12]\`
> **Explanation:** Since words.length == 3 and words[i].length == 3, the concatenated substring has to be of length 9.
> The substring starting at 6 is "foobarthe". It is the concatenation of ["foo","bar","the"].
> The substring starting at 9 is "barthefoo". It is the concatenation of ["bar","the","foo"].
> The substring starting at 12 is "thefoobar". It is the concatenation of ["the","foo","bar"].

#### Constraints:
- 1 <= s.length <= 10^4^
- 1 <= words.length <= 5000
- 1 <= words[i].length <= 30
- \`s\` and \`words[i]\` consist of lowercase English letters.`,
		topics: ["strings", "hashmap", "sliding-window"],
		difficulty: "hard",
		languages: ["javascript"],
		order: 30,
		rubric: {
			optimal_time: "O(n * m * k)",
			acceptable_time: ["O(n * m * k)"],
		},
		parameterNames: ["s", "words"],
		tests: [
			{ input: ["barfoothefoobarman", ["foo", "bar"]], output: [0, 9] },
			{
				input: [
					"wordgoodgoodgoodbestword",
					["word", "good", "best", "word"],
				],
				output: [],
			},
			{
				input: ["barfoofoobarthefoobarman", ["bar", "foo", "the"]],
				output: [6, 9, 12],
			},
			{ input: ["a", ["a"]], output: [0] },
			{ input: ["ab", ["a", "b"]], output: [0] },
			{ input: ["ab", ["b", "a"]], output: [0] },
			{ input: ["abc", ["a", "b"]], output: [0] },
			{ input: ["abcdef", ["ab", "cd", "ef"]], output: [0] },
			{ input: ["abcdef", ["ab", "ef", "cd"]], output: [0] },
			{ input: ["abcabc", ["abc", "abc"]], output: [0] },
			{ input: ["wordword", ["word", "word"]], output: [0] },
			{ input: ["testtest", ["test", "test"]], output: [0] },
			{ input: ["foobarfoo", ["foo", "bar"]], output: [0, 3] },
			{ input: ["barbarfoo", ["bar", "bar", "foo"]], output: [0] },
			{ input: ["foobarbaz", ["foo", "bar", "baz"]], output: [0] },
			{ input: ["testwordtest", ["test", "word"]], output: [0, 7] },
			{ input: ["abcdefghij", ["abc", "def", "ghi"]], output: [0] },
			{ input: ["abcdefghij", ["def", "ghi", "abc"]], output: [0] },
			{ input: ["testtesttest", ["test", "test"]], output: [0, 4] },
			{ input: ["abcabcabc", ["abc", "abc"]], output: [0, 3] },
			{ input: ["wordwordword", ["word", "word"]], output: [0, 4] },
			{ input: ["foobarfoobar", ["foo", "bar"]], output: [0, 6] },
			{ input: ["barbarfoofoo", ["bar", "foo"]], output: [0, 3, 6, 9] },
			{ input: ["testwordtestword", ["test", "word"]], output: [0, 8] },
			{ input: ["abcdefabcdef", ["abc", "def"]], output: [0, 3, 6] },
			{ input: ["abcdabcdabcd", ["ab", "cd"]], output: [0, 4, 8] },
			{ input: ["aabbcc", ["aa", "bb", "cc"]], output: [0] },
			{ input: ["aabbcc", ["bb", "cc", "aa"]], output: [0] },
			{ input: ["testtesttest", ["test"]], output: [0, 4, 8] },
			{ input: ["abcabcabcabc", ["abc"]], output: [0, 3, 6, 9] },
			{ input: ["word", ["word"]], output: [0] },
			{ input: ["foobar", ["foo", "bar"]], output: [0] },
			{ input: ["barbarfoo", ["bar", "foo"]], output: [3] },
			{ input: ["foofoofoo", ["foo"]], output: [0, 3, 6] },
			{ input: ["testwordtestword", ["word", "test"]], output: [0, 8] },
			{ input: ["abcdefghijkl", ["abc", "def", "ghi"]], output: [0] },
			{
				input: ["wordwordwordword", ["word", "word"]],
				output: [0, 4, 8],
			},
			{
				input: ["foobarbazfoobarbaz", ["foo", "bar", "baz"]],
				output: [0, 9],
			},
			{
				input: ["testtesttesttesttest", ["test", "test"]],
				output: [0, 4, 8, 12],
			},
			{
				input: ["abcabcabcabcabc", ["abc", "abc"]],
				output: [0, 3, 6, 9],
			},
		],
		startingCode: {
			javascript: `/**
 * @param {string} s
 * @param {string[]} words
 * @return {number[]}
 */
function findSubstring(s, words) {
  // Your code here
}`,
		},
		passingCode: {
			javascript: `function findSubstring(s, words) {
  if (words.length === 0 || s.length === 0) return [];
  
  const wordLen = words[0].length;
  const totalLen = wordLen * words.length;
  const result = [];
  
  if (s.length < totalLen) return [];
  
  // Create word frequency map
  const wordMap = {};
  for (const word of words) {
    wordMap[word] = (wordMap[word] || 0) + 1;
  }
  
  // Check each possible starting position
  for (let i = 0; i <= s.length - totalLen; i++) {
    const seen = {};
    let matched = 0;
    
    // Check words in chunks
    for (let j = 0; j < words.length; j++) {
      const start = i + j * wordLen;
      const word = s.substring(start, start + wordLen);
      
      if (!wordMap[word]) break;
      
      seen[word] = (seen[word] || 0) + 1;
      if (seen[word] > wordMap[word]) break;
      
      matched++;
    }
    
    if (matched === words.length) {
      result.push(i);
    }
  }
  
  return result;
}`,
		},
	},
];
