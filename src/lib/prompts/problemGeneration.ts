/**
 * Problem Generation Prompts
 * 
 * These prompts are used to generate complete algorithm problems from a problem name,
 * including problem data and test case generator functions.
 */

import { TestCase } from "@/types/algorithm-types";

interface ProblemGenerationData {
	slug: string;
	title: string;
	statementMd: string;
	examplesAndConstraintsMd: string | null;
	topics: string[];
	difficulty: "easy" | "medium" | "hard";
	languages: string[];
	rubric: { optimal_time: string; acceptable_time: string[] };
	parameters: { name: string; type: string }[];
	returnType: string;
	functionName: string;
	judge?: any;
	startingCode: { [language: string]: string };
	passingCode: { [language: string]: string };
	secondaryPassingCode?: { [language: string]: string };
	outputOrderMatters: boolean;
	order?: number;
}

/**
 * System prompt for problem data generation
 */
export function getProblemGenerationSystemPrompt(): string {
	return "You are an expert at creating algorithm problems. Generate complete, accurate problem data in valid JSON format.";
}

/**
 * Build prompt for generating complete problem data
 * 
 * @param problemName - Name of the problem to generate
 * @param previousError - Optional error from previous generation attempt
 * @returns Complete prompt for problem data generation
 */
export function buildProblemDataPrompt(
	problemName: string,
	previousError?: string
): string {
	let prompt = `Generate a complete LeetCode-style algorithm problem for: "${problemName}"`;

	// Include previous error if this is a retry
	if (previousError) {
		prompt += `\n\n⚠️ PREVIOUS ATTEMPT FAILED. Please fix the following issue:\n${previousError}\n\nPlease address this error and regenerate the problem data.`;
	}

	prompt += `\n\nRequired fields:

1. **slug**: kebab-case version (e.g., "two-sum" for "Two Sum")
2. **title**: Full problem title. If problem name starts with a number, extract it to "order" field and exclude from title.
3. **order**: (optional) Extract number from problem name if present, otherwise omit.
4. **statementMd**: Problem description in markdown. ⚠️ ONLY description - NO examples or constraints here.
5. **examplesAndConstraintsMd**: ALL examples and constraints in markdown (REQUIRED)
   - Examples: Use \`#### Example X:\` headers with blockquotes: \`> **Input:** ...\` and \`> **Output:** ...\`
   - Constraints: Plain markdown (NOT in code blocks), use \`^text^\` for superscript (e.g., \`10^5^\` for 10⁵)
   - Example: \`- 2 <= nums.length <= 10^4^\` (no backticks around constraints)
6. **topics**: Array of topic strings (e.g., ["Array", "Hash Table"])
7. **difficulty**: One of "easy", "medium", or "hard"
8. **languages**: ["javascript"]
9. **rubric**: Object with \`optimal_time\` (string) and \`acceptable_time\` (array of strings)
   - Example: { "optimal_time": "O(n)", "acceptable_time": ["O(n log n)", "O(n²)"] }
10. **parameters**: Array of { name: string, type: string } objects
    - Extract types from JSDoc @param annotations in startingCode
    - Types: "ListNode", "TreeNode", "number[]", "number", "string", "boolean", "number[][]", etc.
    - Example: [{ "name": "head", "type": "ListNode" }, { "name": "k", "type": "number" }]
11. **returnType**: String return type extracted from JSDoc @return annotation
    - Types: "ListNode", "TreeNode", "number[]", "number", "string", "boolean", "number[][]", "void", etc.
12. **functionName**: Function name from startingCode declaration
13. **judge**: (OPTIONAL - omit for 95%+ of problems)
    - Judge determines how test case validation works. Default (no judge) compares return value to expected.
    - Only include if problem requires custom validation beyond simple return value comparison.
    - Three judge types:
      a) **"return-value"**: Default behavior (usually omit this, just don't include judge field)
        - Format: { "kind": "return-value" }
      b) **"mutating-array-with-k"**: For problems that mutate array in-place AND return a count
        - Example: "Remove Element" - checks both return value (k) AND modified array contents
        - Format: { "kind": "mutating-array-with-k", "arrayParamIndex": 0, "kIsReturnValue": true, "ignoreOrder": false }
        - \`arrayParamIndex\`: Which parameter is the array (0-indexed)
        - \`kIsReturnValue\`: Whether k is the return value (true) or a separate parameter (false)
        - \`ignoreOrder\`: Whether to sort array before comparing (default: false)
      c) **"custom-script"**: For complex validation logic that doesn't fit standard patterns
        - Format: { "kind": "custom-script", "script": "JavaScript validation code" }
        - Script must define a \`judge\` function that receives:
          * \`args\`: Array of function arguments (the inputs passed to the user's function)
          * \`returnValue\`: The value returned by the user's function
          * \`expected\`: The expected output from the test case
        - Available helpers: \`roundTo5Decimals(value)\`, \`deepEqual(a, b, orderMatters)\`
        - Must return: { pass: boolean, actual: any, expected: any }
        - Example script:
          \`\`\`javascript
          function judge(args, returnValue, expected) {
            // Example: Check if return value matches AND some custom condition
            const [nums, target] = args;
            const isValid = returnValue === expected && nums.length > 0;
            return { 
              pass: isValid, 
              actual: returnValue, 
              expected: expected 
            };
          }
          \`\`\`
14. **startingCode**: Object with \`javascript\` key containing JSDoc-commented function stub
    - MUST include @param and @return annotations with correct types
    - Example: "/**\\n * @param {number[]} nums\\n * @param {number} target\\n * @return {number[]}\\n */\\nfunction twoSum(nums, target) {\\n    \\n}"
15. **passingCode**: Object with \`javascript\` key containing optimal solution
16. **outputOrderMatters**: Boolean (true for most problems)

Example JSON structure:
{
  "slug": "two-sum",
  "title": "Two Sum",
  "order": 1,
  "statementMd": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\\n\\nYou may assume that each input would have exactly one solution.",
  "examplesAndConstraintsMd": "#### Example 1:\\n\\n> **Input:** nums = [2,7,11,15], target = 9\\n> **Output:** [0,1]\\n> **Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].\\n\\n#### Constraints:\\n\\n- 2 <= nums.length <= 10^4^\\n- -10^9^ <= nums[i] <= 10^9^",
  "topics": ["Array", "Hash Table"],
  "difficulty": "easy",
  "languages": ["javascript"],
  "rubric": { "optimal_time": "O(n)", "acceptable_time": ["O(n log n)"] },
  "parameters": [{ "name": "nums", "type": "number[]" }, { "name": "target", "type": "number" }],
  "returnType": "number[]",
  "functionName": "twoSum",
  "startingCode": { "javascript": "/**\\n * @param {number[]} nums\\n * @param {number} target\\n * @return {number[]}\\n */\\nfunction twoSum(nums, target) {\\n    \\n}" },
  "passingCode": { "javascript": "function twoSum(nums, target) { /* optimal solution */ }" },
  "outputOrderMatters": true
}`;

	return prompt;
}

/**
 * System prompt for test case generator function generation
 */
export function getTestCaseGeneratorSystemPrompt(): string {
	return "You are an expert at creating JavaScript functions that generate test cases. CRITICAL: ALL test cases MUST strictly follow the problem constraints - extract min/max values and NEVER exceed them. Violating constraints will cause system freezes. Return ONLY valid JavaScript function code, no markdown, no explanations.";
}

/**
 * Build prompt for generating test case generator function
 * 
 * @param problemData - The problem generation data
 * @param existingTests - Existing test cases to avoid duplicates
 * @param previousError - Optional error from previous generation attempt
 * @returns Complete prompt for test case generator function generation
 */
export function buildTestCaseGeneratorPrompt(
	problemData: ProblemGenerationData,
	existingTests: TestCase[],
	previousError?: string
): string {
	// Determine output structure based on judge config
	let outputStructureInstructions = "";
	if (problemData.judge) {
		if (problemData.judge.kind === "mutating-array-with-k") {
			const config = problemData.judge as any;
			const arrayParamName =
				problemData.parameters?.[config.arrayParamIndex]?.name ||
				"nums";
			outputStructureInstructions = `\n\n⚠️ CRITICAL OUTPUT STRUCTURE:
The test case output should be the modified ${arrayParamName} array (the first k elements), NOT the return value k.
- Input format: "input": [[${arrayParamName}], ...other params]
- Output format: "output": [/* modified ${arrayParamName} array with first k elements */]
- Example: For removeElement([3,2,2,3], 3), output should be [2,2] (the modified nums array), not 2 (the return value k)
- In your function, after calling passingCode(...input), return the modified ${arrayParamName} array: ${arrayParamName}.slice(0, k)`;
		} else if (problemData.judge.kind === "custom-script") {
			outputStructureInstructions = `\n\n⚠️ CRITICAL: This problem uses a custom judge. The output structure depends on the judge's requirements. Analyze the problem statement carefully to determine the correct output format.`;
		}
	}

	const existingTestsText =
		existingTests.length > 0
			? `\n\nEXISTING (avoid duplicates):\n${existingTests
					.map((t) => `Input: ${JSON.stringify(t.input)}`)
					.join("\n")}`
			: "";

	let prompt = `Generate a JavaScript function that creates ALL test cases for this problem:`;

	// Include previous error if this is a retry
	if (previousError) {
		prompt += `\n\n⚠️ PREVIOUS ATTEMPT FAILED. Please fix the following issue:\n${previousError}\n\nPlease address this error and regenerate the test case generator function.`;
	}

	prompt += `\n\nProblem: ${problemData.title}
${problemData.statementMd}

${
	problemData.examplesAndConstraintsMd
		? `⚠️ CRITICAL CONSTRAINTS (MUST FOLLOW EXACTLY - VIOLATIONS WILL CAUSE SYSTEM FREEZE):\n${problemData.examplesAndConstraintsMd}\n`
		: ""
}

Function: ${problemData.functionName}(${problemData.parameters
		.map((p) => p.name)
		.join(", ")}) → ${problemData.returnType}
Params: ${JSON.stringify(problemData.parameters)}

${outputStructureInstructions}

⚠️ CRITICAL REQUIREMENTS:
- Function name: \`generateTestCases({existingTests, constraints, parameters, passingCode, problemContext})\`
- ⚠️ ALL test cases MUST strictly follow the constraints above - extract min/max values and NEVER exceed them
- ⚠️ If constraints say "1 <= n <= 9", generate test cases ONLY for n=1 through n=9, NOT higher.
- ⚠️ If constraints limit array length to 100, NEVER generate arrays longer than 100
- 🎯 **CRITICAL: Generate AS MANY test cases as possible (up to 100) while staying within constraints**
- 🎯 **AIM FOR 80-100 test cases** - The system requires at least 6 passing test cases, but more is better
- Again though, you have to stay within the constraints. If the constraints only allow 9 test cases, then you can only generate 9 test cases.
- 🎯 **Generate diverse test cases**: edge cases, boundary values, typical inputs, and various combinations
- ⚠️ DO NOT generate all possible combinations - this will cause memory overflow. Instead, strategically sample to maximize coverage
- ⚠️ MAXIMUM 100 test cases - if constraints allow more, sample strategically to get close to 100 diverse cases
- Generate as many unique test cases as constraints allow (target 80-100, maximum 100)
- Return: [{input: [...], output: ...}]
- Input format: array of parameter values (e.g., [[nums], val])
- Deep clone inputs: JSON.parse(JSON.stringify(caseInput))
- Convert ListNode params using \`arrayToListNode(arr)\` (available in context)
- Convert ListNode outputs using \`listNodeToArray(head)\` (available in context)
- Convert TreeNode params using \`arrayToTreeNode(arr)\` (available in context)
- Convert TreeNode outputs using \`treeNodeToArray(root)\` or \`treeToArray(root)\` (both available in context)
- Convert _Node params using \`arrayTo_Node(arr)\` (available in context) - _Node has next pointer, input format may include # markers
- Convert _Node outputs using \`_NodeToArray(root)\` (available in context) - output format uses # to represent next pointers between levels
- For \`ListNode[]\` or \`TreeNode[]\` return types: convert each element in the array using \`output.map(node => node ? listNodeToArray(node) : [])\` or \`output.map(node => node ? treeNodeToArray(node) : [])\`
- ⚠️ CRITICAL: For \`void\` return type, the output should be the modified first parameter
  - Example: If function is \`sortColors(nums)\` with return type \`void\`, after calling \`passingCode(nums)\`, the output should be the modified \`nums\` array, not \`undefined\`
  - Example: If function is \`recoverTree(root)\` with return type \`void\` and first parameter is \`TreeNode\`, after calling \`passingCode(root)\`, the output should be the modified \`root\` TreeNode converted to array using \`treeNodeToArray(root)\`
  - Use: \`let output = passingCode(...converted); if (output === undefined || output === null) { output = converted[0]; if (parameters[0]?.type === 'TreeNode') { output = treeNodeToArray(output); } else if (parameters[0]?.type === 'ListNode') { output = listNodeToArray(output); } }\`
${
	problemData.judge?.kind === "mutating-array-with-k"
		? `- For mutating arrays: return modified array (first k elements), not the return value`
		: ""
}

Example structure (MUST respect constraints):
\`\`\`javascript
function generateTestCases({existingTests, constraints, parameters, passingCode, problemContext}) {
  // Extract constraint limits (e.g., if constraints say "1 <= n <= 9", use n from 1 to 9 only)
  // Example: const maxN = 9; // from constraints "1 <= n <= 9"
  const cases = [];
  // Generate cases within constraint limits only
  // ⚠️ DO NOT generate all combinations - sample strategically (edge cases, boundaries, typical values)
  // Example: for (let n = 1; n <= 9; n++) { cases.push([n]); }
  // ⚠️ If constraints allow many combinations, sample ~40-100 diverse cases, NOT all combinations
  
  return cases.map((caseInput) => {
    const cloned = JSON.parse(JSON.stringify(caseInput));
    const converted = cloned.map((val, i) => {
      const paramType = parameters[i]?.type;
      if (paramType === 'ListNode' && Array.isArray(val)) {
        return arrayToListNode(val);
      }
      if (paramType === 'TreeNode' && Array.isArray(val)) {
        return arrayToTreeNode(val);
      }
      if (paramType === '_Node' && Array.isArray(val)) {
        return arrayTo_Node(val);
      }
      return val;
    });
    let output = passingCode(...converted);
    // Handle void return type - output is the modified first parameter
    if (output === undefined || output === null) {
      output = converted[0];
      // For void return types, check if first parameter is TreeNode/ListNode/_Node and convert
      const firstParamType = parameters[0]?.type;
      if (firstParamType === 'TreeNode' && output) {
        output = treeNodeToArray(output);
      } else if (firstParamType === 'ListNode' && output) {
        output = listNodeToArray(output);
      } else if (firstParamType === '_Node' && output) {
        output = _NodeToArray(output);
      }
    }
    // Convert ListNode/TreeNode/_Node to array (for non-void return types)
    if (${JSON.stringify(problemData.returnType)} === 'ListNode' && output) {
      output = listNodeToArray(output);
    }
    if (${JSON.stringify(problemData.returnType)} === 'TreeNode' && output) {
      output = treeNodeToArray(output);
    }
    if (${JSON.stringify(problemData.returnType)} === '_Node' && output) {
      output = _NodeToArray(output);
    }
    // Convert array of ListNode/TreeNode to array of arrays
    if (${JSON.stringify(
		problemData.returnType
	)} === 'ListNode[]' && Array.isArray(output)) {
      output = output.map(node => node ? listNodeToArray(node) : []);
    }
    if (${JSON.stringify(
		problemData.returnType
	)} === 'TreeNode[]' && Array.isArray(output)) {
      output = output.map(node => node ? treeNodeToArray(node) : []);
    }
    ${
		problemData.judge?.kind === "mutating-array-with-k"
			? `const arr = converted[${
					(problemData.judge as any).arrayParamIndex || 0
			  }];
    return { input: caseInput, output: Array.isArray(arr) ? arr.slice(0, output) : output };`
			: `return { input: caseInput, output };`
	}
  });
}
\`\`\`

Return ONLY the function code, no markdown or explanations.${existingTestsText}`;

	return prompt;
}

