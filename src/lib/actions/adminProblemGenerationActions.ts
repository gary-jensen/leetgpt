"use server";

import OpenAI from "openai";
import { requireAdmin } from "@/lib/auth";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { TestCase } from "@/types/algorithm-types";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Yield to event loop with actual delay to allow other requests to process
 * This is critical for preventing server freezing
 */
function yieldToEventLoop(ms: number = 10): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

interface ProblemGenerationData {
	slug: string;
	title: string;
	statementMd: string;
	examplesAndConstraintsMd: string | null;
	topics: string[];
	difficulty: "easy" | "medium" | "hard";
	languages: string[];
	rubric: { optimal_time: string; acceptable_time: string[] };
	parameterNames: string[];
	startingCode: { [language: string]: string };
	passingCode: { [language: string]: string };
	secondaryPassingCode: { [language: string]: string };
	systemCode?: { [language: string]: string }; // Optional: Execution wrapper for type conversions
	outputOrderMatters: boolean;
	order?: number;
}

/**
 * Generate complete problem data from a problem name
 * This is the first AI call that generates everything except test cases
 */
export async function generateProblemData(problemName: string): Promise<{
	success: boolean;
	data?: ProblemGenerationData & { order?: number };
	error?: string;
}> {
	// Yield before auth check to prevent blocking
	await yieldToEventLoop(10);

	requireAdmin();

	// Yield after auth check
	await yieldToEventLoop(10);

	try {
		const prompt = `You are an expert at creating algorithm problems for coding interviews. Generate a complete problem based on the following problem name: "${problemName}"

Generate a complete LeetCode-style algorithm problem with ALL of the following fields:

1. **slug**: kebab-case version of the problem name (e.g., "two-sum" for "Two Sum")
2. **title**: Full problem title (if the problem name started with a number, DO NOT include that number in the title - use only the clean problem name)
3. **order**: (OPTIONAL) If the problem name started with a number, extract and return that number here. If no number prefix exists, omit this field or set to null.
3. **statementMd**: Complete problem statement in markdown format. Must include:
   - Clear problem description
   - Examples with \`#### Example X:\` headers (not \`###\`)
   - Blockquotes for input/output: \`> **Input:** \`...\`\`
   - Constraints with \`^\` superscript notation: \`10^5^\` not \`\`10^5\`\`
5. **examplesAndConstraintsMd**: Additional examples and constraints in markdown format
6. **topics**: Array of topic strings (e.g., ["Array", "Hash Table"])
7. **difficulty**: One of "easy", "medium", or "hard"
8. **languages**: Array with ["javascript"]
9. **rubric**: Object with:
   - \`optimal_time\`: String describing optimal time complexity (e.g., "O(n)")
   - \`acceptable_time\`: Array of acceptable time complexities (e.g., ["O(n log n)", "O(n²)"])
10. **parameterNames**: Array of parameter names in order (e.g., ["nums", "target"])
11. **startingCode**: Object with \`javascript\` key containing JSDoc-commented function stub
12. **passingCode**: Object with \`javascript\` key containing optimal passing solution
13. **secondaryPassingCode**: Object with \`javascript\` key containing a NON-OPTIMAL but CORRECT solution
    - CRITICAL: This MUST use a DIFFERENT algorithm/approach than passingCode
    - Examples: O(n²) vs O(n), brute force vs optimized, nested loops vs single pass
    - It should be intentionally suboptimal but still correct
14. **systemCode**: (OPTIONAL) Object with \`javascript\` key containing execution wrapper function
    - REQUIRED if problem uses ListNode, TreeNode, or any custom data structures
    - The function should be named \`systemExecute\` and take two parameters: \`userFunction\` and \`testCase\`
    - CRITICAL: SystemCode must be COMPLETELY SELF-CONTAINED:
      - Define all data structures (ListNode, TreeNode, etc.) at the TOP LEVEL (outside systemExecute)
      - Define all conversion functions (arrayToListNode, listNodeToArray, etc.) at the TOP LEVEL (outside systemExecute)
      - These must be globally accessible so userFunction can use them (e.g., \`new ListNode()\`)
      - Do NOT rely on any external utilities - everything must be defined within systemCode
    - Handle type conversions (array ↔ ListNode, array ↔ TreeNode, etc.)
    - testCase.input is an ARRAY of parameters: testCase.input[0] is the first parameter, testCase.input[1] is the second, etc.
    - CRITICAL: Handle edge cases properly:
      - If testCase.input is empty array [], handle gracefully (typically means no parameters)
      - If testCase.input[0] is undefined/null, handle gracefully
      - For ListNode problems, testCase.input[0] should be an array like [1,2,3] that gets converted to ListNode
      - Always validate inputs before converting
    - Example for ListNode problem (SINGLE parameter):
      \`\`\`javascript
      // Define ListNode structure at TOP LEVEL (globally accessible)
      function ListNode(val, next) {
        this.val = (val === undefined ? 0 : val);
        this.next = (next === undefined ? null : next);
      }
      // Define conversion functions at TOP LEVEL (globally accessible)
      function arrayToListNode(arr) {
        if (arr.length === 0) return null;
        const head = new ListNode(arr[0]);
        let current = head;
        for (let i = 1; i < arr.length; i++) {
          current.next = new ListNode(arr[i]);
          current = current.next;
        }
        return head;
      }
      function listNodeToArray(node) {
        if (!node) return [];
        const result = [];
        let current = node;
        while (current) {
          result.push(current.val);
          current = current.next;
        }
        return result;
      }
      // SystemExecute function uses the global definitions
      // NOTE: userFunction will be available in the execution context, but we pass it as parameter for compatibility
      function systemExecute(userFunction, testCase) {
        // testCase.input is an array of parameters: [param1, param2, ...]
        // For single-parameter ListNode problems: testCase.input[0] should be the array to convert
        // Handle edge cases: empty input array, undefined, or null
        let head = null;
        if (testCase.input && testCase.input.length > 0) {
          // Check if testCase.input itself is the array (incorrect format but handle gracefully)
          // If testCase.input[0] is a number, then testCase.input is the array directly
          if (testCase.input.length > 1 && typeof testCase.input[0] === 'number' && !Array.isArray(testCase.input[0])) {
            // Incorrect format: testCase.input = [1,2,3] instead of [[1,2,3]]
            // Treat the entire testCase.input as the array to convert
            head = arrayToListNode(testCase.input);
          } else if (testCase.input[0] !== undefined && testCase.input[0] !== null) {
            // Correct format: testCase.input[0] is the array parameter
            if (Array.isArray(testCase.input[0])) {
              head = arrayToListNode(testCase.input[0]);
            } else {
              // Single value (edge case)
              head = arrayToListNode([testCase.input[0]]);
            }
          }
        }
        // Call user function (can use ListNode if needed - ListNode is in same scope)
        const result = userFunction(head);
        // Convert result back to array (handles null/undefined automatically)
        return listNodeToArray(result);
      }
      \`\`\`
    - For problems without custom data structures, you can omit systemCode or use a simple pass-through:
      \`\`\`javascript
      function systemExecute(userFunction, testCase) {
        return userFunction(...testCase.input);
      }
      \`\`\`
15. **outputOrderMatters**: Boolean indicating if output order matters (true for most problems)

CRITICAL REQUIREMENTS:
- The secondaryPassingCode MUST be different from passingCode in algorithm/approach
- Use different time complexity (e.g., O(n²) instead of O(n))
- Use different strategy (e.g., brute force instead of optimized)
- Both codes must be syntactically correct and executable
- All code must be valid JavaScript that can be executed directly

Return JSON in this exact format (CRITICAL: Must be valid JSON with proper escaping):
{
  "slug": "problem-slug",
  "title": "Problem Title",
  "order": 1,
  "statementMd": "## Problem Description\\n\\n...",
  "examplesAndConstraintsMd": "#### Example 1:\\n\\n> **Input:** ...",
  "topics": ["Array", "Hash Table"],
  "difficulty": "easy",
  "languages": ["javascript"],
  "rubric": {
    "optimal_time": "O(n)",
    "acceptable_time": ["O(n log n)"]
  },
  "parameterNames": ["nums", "target"],
  "startingCode": {
    "javascript": "/**\\n * @param {number[]} nums\\n * @param {number} target\\n * @return {number[]}\\n */\\nfunction twoSum(nums, target) {\\n    \\n}"
  },
  "passingCode": {
    "javascript": "function twoSum(nums, target) { /* optimal solution */ }"
  },
  "secondaryPassingCode": {
    "javascript": "function twoSum(nums, target) { /* non-optimal but correct solution */ }"
  },
  "systemCode": {
    "javascript": "function systemExecute(userFunction, testCase) { return userFunction(...testCase.input); }"
  },
  "outputOrderMatters": true
}

CRITICAL JSON RULES:
- All strings must be properly escaped (use \\\\ for backslashes, \\" for quotes, \\n for newlines)
- Newlines within string values MUST be escaped as \\n (not actual line breaks)
- No trailing commas
- No comments in JSON
- All property names must be in double quotes
- Return ONLY the JSON object, no markdown code blocks, no explanations, no text before or after
- The JavaScript code strings (startingCode, passingCode, secondaryPassingCode) must have all newlines escaped as \\n (see example above)

Note: The "order" field is optional - only include it if the problem name started with a number. If no number prefix exists, you can omit "order" or set it to null.`;

		// Yield before OpenAI API call
		await yieldToEventLoop(20);

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"You are an expert at creating algorithm problems. Generate complete, accurate problem data in valid JSON format. CRITICAL: Return ONLY valid JSON with all strings properly escaped (newlines as \\n, quotes as \\\", backslashes as \\\\). Do NOT include markdown code blocks or any text outside the JSON object. Ensure secondaryPassingCode uses a different algorithm approach than passingCode. If the problem name starts with a number (e.g., '1. Two Sum'), extract that number for the 'order' field and exclude it from the 'title' field.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.3,
			// Note: response_format: { type: "json_object" } could be used here,
			// but it requires the prompt to explicitly mention JSON, which we do.
			// However, some models may still wrap in markdown, so we handle that in parsing.
		});

		// Yield after OpenAI API call
		await yieldToEventLoop(20);

		const aiResponse = completion.choices[0]?.message?.content;
		if (!aiResponse) {
			return { success: false, error: "No response from AI" };
		}

		// Yield before JSON parsing (can be CPU-intensive for large responses)
		await yieldToEventLoop(30);

		// Parse JSON (remove markdown code blocks if present)
		let parsed: ProblemGenerationData;
		try {
			let cleanedResponse = aiResponse.trim();

			// Remove markdown code blocks if present
			if (cleanedResponse.startsWith("```")) {
				cleanedResponse = cleanedResponse.replace(
					/^```(?:json)?\n?/,
					""
				);
				cleanedResponse = cleanedResponse.replace(/\n?```$/, "");
			}

			// Try to extract JSON if it's wrapped in other text
			// Look for JSON object boundaries
			const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				cleanedResponse = jsonMatch[0];
			}

			parsed = JSON.parse(cleanedResponse);

			// Yield after JSON parsing
			await yieldToEventLoop(20);

			// Ensure title doesn't have the number prefix (safety check in case AI didn't follow instructions)
			if (parsed.title) {
				// Remove leading number patterns from title if present
				parsed.title = parsed.title
					.replace(/^\d+[.\-) ]*\s*/, "")
					.trim();
			}
		} catch (error) {
			// Yield in error handling
			await yieldToEventLoop(20);
			console.error("AI Response that failed JSON parsing:", aiResponse);
			console.error("Cleaned response length:", aiResponse.trim().length);
			console.error("Error details:", error);
			// Extract cleaned response for additional debugging
			let cleanedForDebug = aiResponse.trim();
			if (cleanedForDebug.startsWith("```")) {
				cleanedForDebug = cleanedForDebug.replace(
					/^```(?:json)?\n?/,
					""
				);
				cleanedForDebug = cleanedForDebug.replace(/\n?```$/, "");
			}
			const jsonMatch = cleanedForDebug.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				cleanedForDebug = jsonMatch[0];
			}
			console.error(
				"Cleaned response (first 1000 chars):",
				cleanedForDebug.substring(0, 1000)
			);
			return {
				success: false,
				error: `Invalid JSON response: ${
					error instanceof Error ? error.message : "Unknown error"
				}. Raw response logged to console.`,
			};
		}

		// Yield before field validation
		await yieldToEventLoop(10);

		// Validate required fields
		if (!parsed.slug || !parsed.title || !parsed.statementMd) {
			return {
				success: false,
				error: "Missing required fields: slug, title, or statementMd",
			};
		}

		if (
			!parsed.passingCode?.javascript ||
			!parsed.secondaryPassingCode?.javascript
		) {
			return {
				success: false,
				error: "Missing passingCode or secondaryPassingCode for javascript",
			};
		}

		// Validate code syntax (yield before CPU-intensive validation)
		// Use actual delay to yield to event loop before synchronous validation
		await yieldToEventLoop(30);

		try {
			new Function(parsed.passingCode.javascript);
			// Yield between validations
			await yieldToEventLoop(20);
			new Function(parsed.secondaryPassingCode.javascript);
			if (parsed.startingCode?.javascript) {
				await yieldToEventLoop(20);
				new Function(parsed.startingCode.javascript);
			}
		} catch (syntaxError) {
			return {
				success: false,
				error: `Generated code has syntax errors: ${
					syntaxError instanceof Error
						? syntaxError.message
						: "Unknown syntax error"
				}`,
			};
		}

		return { success: true, data: parsed };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Generate a batch of test cases for a problem
 * Includes all existing test cases in the prompt to avoid duplicates
 */
export async function generateTestCases(
	problemData: ProblemGenerationData,
	existingTests: TestCase[],
	batchSize: number = 10
): Promise<{
	success: boolean;
	testCases?: TestCase[];
	error?: string;
}> {
	// Yield before auth check
	await yieldToEventLoop(10);

	requireAdmin();

	// Yield after auth check
	await yieldToEventLoop(10);

	try {
		const existingTestsText =
			existingTests.length > 0
				? `\n\nEXISTING TEST CASES (DO NOT DUPLICATE THESE):\n${existingTests
						.map(
							(test, i) =>
								`${i + 1}. Input: ${JSON.stringify(
									test.input
								)}, Output: ${JSON.stringify(test.output)}`
						)
						.join("\n")}`
				: "";

		// Include passing code so AI can understand what the function should return
		const passingCodeSnippet = problemData.passingCode.javascript.substring(
			0,
			500
		); // Limit to avoid token limits

		// Check if problem uses systemCode (ListNode/TreeNode problems)
		const hasSystemCode = !!problemData.systemCode?.javascript;
		const systemCodeNote = hasSystemCode
			? `\n\nCRITICAL INPUT FORMAT FOR THIS PROBLEM:
This problem uses systemCode (ListNode/TreeNode conversion). The "input" field MUST be an array of parameters.
- For single-parameter functions: "input" should be [[param1]] where param1 is the array/object
- For multi-parameter functions: "input" should be [param1, param2, ...] where each param is its value
- Example for function deleteDuplicates(head) where head is a ListNode:
  - CORRECT: "input": [[1,2,3]]  ← array containing one parameter (which is the array [1,2,3])
  - WRONG: "input": [1,2,3]  ← this is incorrect, it's not wrapped as a parameter
- Example for function twoSum(nums, target):
  - CORRECT: "input": [[1,2,3], 5]  ← array of two parameters
  - WRONG: "input": [1,2,3,5]  ← this is incorrect
- For empty ListNode: "input": [[]]  ← array containing empty array parameter
- For null ListNode: "input": [[null]] or "input": [[]] depending on problem requirements`
			: "";

		const prompt = `You are an expert at creating test cases for algorithm problems. Generate ${batchSize} NEW, UNIQUE test cases for this problem:

Problem: ${problemData.title}
${problemData.statementMd}

${
	problemData.examplesAndConstraintsMd
		? `\n\n⚠️ MANDATORY CONSTRAINTS (MUST FOLLOW THESE EXACTLY):\n${problemData.examplesAndConstraintsMd}\n`
		: ""
}

Function Signature: function ${problemData.parameterNames.join(", ")}
Parameters: ${problemData.parameterNames.join(", ")}${systemCodeNote}

PASSING CODE REFERENCE (use this to understand what the function should return):
\`\`\`javascript
${passingCodeSnippet}
\`\`\`

${existingTestsText}

🚨 CRITICAL SIZE LIMITATIONS (MANDATORY):
- Input arrays/strings must not exceed 100 elements/characters
- Output arrays/strings must not exceed 100 elements/characters
- If output is an array of arrays (e.g., multiple solutions), keep the number of sub-arrays reasonable:
  * Maximum 10-20 sub-arrays for most problems
  * For problems that return lists of solutions (like N-Queens), limit to 5-10 solutions maximum
  * Each sub-array should still follow the 100-element limit
- If output is a 2D array/matrix, total dimensions should be reasonable (e.g., 10x10 max for most cases)
- Total JSON size for a single test case should be under 10KB
- If constraints specify a maximum value (e.g., "1 <= n <= 9"), DO NOT exceed it, even if technically possible
- For recursive/backtracking problems that can produce many solutions, limit the output to a small representative set

⚠️ CONSTRAINTS ARE MANDATORY:
- ALL test cases MUST strictly adhere to the problem constraints shown above
- If constraints specify a range (e.g., "1 <= n <= 8"), ALL test cases must have n within that range
- If constraints specify maximum array length, DO NOT exceed it
- If constraints specify value ranges, DO NOT use values outside those ranges
- Constraints are NOT suggestions - they are HARD LIMITS that must be followed
- If the problem statement says "n is small" or similar, use small values (typically 4-8)

CRITICAL REQUIREMENTS:
- Generate EXACTLY ${batchSize} NEW test cases
- Each test case must be UNIQUE - do not duplicate any existing test cases
- Test cases MUST strictly follow ALL problem constraints (see above)
- Each test case must have EXACTLY ONE correct answer (no ambiguous outputs)
- Cover edge cases: empty inputs, single elements, minimum and maximum constraint values, etc.
- Test cases should be diverse and comprehensive, but ALWAYS within constraints
- Input and output must match the problem's parameter types
- IMPORTANT: The expected output MUST be what the passing code would return for the given input
- For in-place modification problems (function returns undefined/null), the output should be the modified input array/object
- For return value problems, the output should be the actual return value

Return JSON in this exact format (CRITICAL: Must be valid JSON with proper escaping):
{
  "testCases": [
    {
      "input": [/* array of parameter values - each parameter is an element in this array */],
      "output": /* expected output value - MUST match what passing code returns */
    }
  ]
}

CRITICAL JSON RULES:
- All strings must be properly escaped (use \\\\ for backslashes, \\" for quotes)
- No trailing commas
- No comments in JSON
- All property names must be in double quotes
- Return ONLY the JSON object, no markdown code blocks, no explanations, no text before or after
- For arrays/objects in output, ensure proper JSON formatting`;

		// Yield before OpenAI API call
		await yieldToEventLoop(20);

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"You are an expert at creating test cases. Generate unique, comprehensive test cases in valid JSON format. The expected output MUST match what the passing code would return for the given input. Always return valid, properly formatted JSON with no markdown code blocks.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.2, // Lower temperature for more consistent JSON output
			response_format: { type: "json_object" }, // Force JSON mode
		});

		// Yield after OpenAI API call
		await yieldToEventLoop(20);

		const aiResponse = completion.choices[0]?.message?.content;
		if (!aiResponse) {
			return { success: false, error: "No response from AI" };
		}

		// Yield before JSON parsing
		await yieldToEventLoop(30);

		// Parse JSON
		let parsed: { testCases: TestCase[] };
		try {
			let cleanedResponse = aiResponse.trim();

			// Remove markdown code blocks if present
			if (cleanedResponse.startsWith("```")) {
				cleanedResponse = cleanedResponse.replace(
					/^```(?:json)?\n?/,
					""
				);
				cleanedResponse = cleanedResponse.replace(/\n?```$/, "");
			}

			// Try to extract JSON if it's wrapped in other text
			// Look for JSON object boundaries - be more aggressive about finding the JSON
			let jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				// Try a more specific pattern
				jsonMatch = cleanedResponse.match(/\{[^}]*\{[\s\S]*\}[^}]*\}/);
			}
			if (jsonMatch) {
				cleanedResponse = jsonMatch[0];
			}

			// Try to fix common JSON issues
			// Remove trailing commas before closing braces/brackets
			cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, "$1");

			// Remove comments (in case AI added them)
			cleanedResponse = cleanedResponse.replace(/\/\/.*$/gm, "");
			cleanedResponse = cleanedResponse.replace(/\/\*[\s\S]*?\*\//g, "");

			parsed = JSON.parse(cleanedResponse);

			// Yield after JSON parsing
			await yieldToEventLoop(20);
		} catch (error) {
			// Yield in error handling
			await yieldToEventLoop(20);
			console.error("\n=== Test Case Generation JSON Parsing Error ===");
			console.error("Problem:", problemData.title);
			console.error("AI Response length:", aiResponse.trim().length);
			console.error(
				"Error:",
				error instanceof Error ? error.message : String(error)
			);
			console.error("\nFirst 500 chars of response:");
			console.error(aiResponse.substring(0, 500));
			console.error("\nLast 500 chars of response:");
			console.error(
				aiResponse.substring(Math.max(0, aiResponse.length - 500))
			);
			console.error("=== End of Error ===\n");

			return {
				success: false,
				error: `Invalid JSON response: ${
					error instanceof Error ? error.message : "Unknown error"
				}. Raw response logged to console.`,
			};
		}

		if (!parsed.testCases || !Array.isArray(parsed.testCases)) {
			console.error("\n=== Test Case Generation Validation Error ===");
			console.error("Problem:", problemData.title);
			console.error("Response does not include 'testCases' array");
			console.error("Parsed object keys:", Object.keys(parsed));
			console.error("=== End of Error ===\n");
			return {
				success: false,
				error: "Response must include 'testCases' array",
			};
		}

		// Validate test case structure
		for (let i = 0; i < parsed.testCases.length; i++) {
			const testCase = parsed.testCases[i];
			if (
				!Array.isArray(testCase.input) ||
				testCase.output === undefined
			) {
				console.error(
					"\n=== Test Case Generation Validation Error ==="
				);
				console.error("Problem:", problemData.title);
				console.error(`Test case ${i + 1} is invalid:`, testCase);
				console.error(
					`Has input array: ${Array.isArray(testCase.input)}`
				);
				console.error(`Has output: ${testCase.output !== undefined}`);
				console.error("=== End of Error ===\n");
				return {
					success: false,
					error: `Test case ${
						i + 1
					} must have 'input' array and 'output' value`,
				};
			}
		}

		return { success: true, testCases: parsed.testCases };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
