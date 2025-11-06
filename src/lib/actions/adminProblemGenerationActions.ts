"use server";

import OpenAI from "openai";
import { requireAdmin } from "@/lib/auth";
import { AlgoProblemDetail } from "@/types/algorithm-types";
import { TestCase } from "@/types/algorithm-types";
import { getTypeDefinitionsCode } from "@/lib/utils/typeConverters";

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
	parameters: { name: string; type: string }[];
	returnType: string;
	functionName: string;
	judge?: any; // Optional - only for edge cases requiring custom validation
	startingCode: { [language: string]: string };
	passingCode: { [language: string]: string };
	secondaryPassingCode: { [language: string]: string };
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
		const prompt = `Generate a complete LeetCode-style algorithm problem for: "${problemName}"

Required fields:

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
16. **secondaryPassingCode**: Object with \`javascript\` key containing CORRECT but DIFFERENT algorithm
    - ⚠️ CRITICAL: Must use different approach (e.g., O(n²) vs O(n), brute force vs optimized)
    - Must be syntactically correct and executable
17. **outputOrderMatters**: Boolean (true for most problems)

CRITICAL: secondaryPassingCode MUST use a different algorithm/approach than passingCode.

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
  "secondaryPassingCode": { "javascript": "function twoSum(nums, target) { /* different algorithm */ }" },
  "outputOrderMatters": true
}`;

		// Yield before OpenAI API call
		await yieldToEventLoop(20);

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"You are an expert at creating algorithm problems. Generate complete, accurate problem data in valid JSON format. The secondaryPassingCode must use a different algorithm/approach than passingCode.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.2,
			response_format: { type: "json_object" },
		});

		// Yield after OpenAI API call
		await yieldToEventLoop(20);

		const aiResponse = completion.choices[0]?.message?.content;
		if (!aiResponse) {
			return { success: false, error: "No response from AI" };
		}

		// Parse JSON directly - trust response_format to ensure valid JSON
		let parsed: ProblemGenerationData & { order?: number };
		try {
			parsed = JSON.parse(aiResponse.trim());
		} catch (error) {
			console.error("AI Response that failed JSON parsing:", aiResponse);
			return {
				success: false,
				error: `Invalid JSON response: ${
					error instanceof Error ? error.message : "Unknown error"
				}`,
			};
		}

		// Yield after JSON parsing
		await yieldToEventLoop(20);

		// Ensure title doesn't have the number prefix (safety check in case AI didn't follow instructions)
		if (parsed.title) {
			// Remove leading number patterns from title if present
			parsed.title = parsed.title.replace(/^\d+[.\-) ]*\s*/, "").trim();
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

		// Log generated data for debugging
		console.log("\n=== Generated Problem Data ===");
		console.log(`Problem: ${parsed.title}`);
		console.log(`Slug: ${parsed.slug}`);
		console.log(`Topics: ${parsed.topics.join(", ")}`);
		console.log(`\n--- Passing Code ---`);
		console.log(parsed.passingCode.javascript);
		console.log(`\n--- Secondary Passing Code ---`);
		console.log(parsed.secondaryPassingCode.javascript);
		console.log(`\n--- Parameters ---`);
		console.log(JSON.stringify(parsed.parameters, null, 2));
		console.log(`\n--- Return Type ---`);
		console.log(parsed.returnType);
		console.log(`\n=== End of Generated Data ===\n`);

		return { success: true, data: parsed };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Generate a test case generator function using LLM
 * The LLM creates a JavaScript function that we can execute to generate test cases
 */
async function generateTestCaseGeneratorFunction(
	problemData: ProblemGenerationData,
	existingTests: TestCase[]
): Promise<{
	success: boolean;
	generatorFunction?: string;
	error?: string;
}> {
	// Yield before auth check
	await yieldToEventLoop(10);

	requireAdmin();

	// Yield after auth check
	await yieldToEventLoop(10);

	try {
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

		const prompt = `Generate a JavaScript function that creates ALL test cases for this problem:

Problem: ${problemData.title}
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
- Generate as many unique test cases as constraints allow (target ~40, but if constraints only allow 9, generate 9)
- Return: [{input: [...], output: ...}]
- Input format: array of parameter values (e.g., [[nums], val])
- Deep clone inputs: JSON.parse(JSON.stringify(caseInput))
- Convert ListNode/TreeNode params using \`arrayToListNode\` (available in context)
- Convert ListNode outputs using \`listNodeToArray\` (available in context)
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
  // Example: for (let n = 1; n <= 9; n++) { cases.push([n]); }
  
  return cases.map((caseInput) => {
    const cloned = JSON.parse(JSON.stringify(caseInput));
    const converted = cloned.map((val, i) => 
      parameters[i]?.type === 'ListNode' && Array.isArray(val) 
        ? arrayToListNode(val) 
        : val
    );
    let output = passingCode(...converted);
    if (${JSON.stringify(problemData.returnType)} === 'ListNode' && output) {
      output = listNodeToArray(output);
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

Return ONLY the function code, no markdown or explanations.`;

		// Yield before OpenAI API call
		await yieldToEventLoop(20);

		// Create a timeout promise (60 seconds)
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => {
				reject(new Error("OpenAI API call timed out after 60 seconds"));
			}, 60000);
		});

		// Create the API call promise
		const apiCallPromise = openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"You are an expert at creating JavaScript functions that generate test cases. CRITICAL: ALL test cases MUST strictly follow the problem constraints - extract min/max values and NEVER exceed them. Violating constraints will cause system freezes. Return ONLY valid JavaScript function code, no markdown, no explanations.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.3,
			// Note: Not using response_format: "json_object" here because we want JavaScript code, not JSON
		});

		// Race between API call and timeout
		const completion = await Promise.race([apiCallPromise, timeoutPromise]);

		// Yield after OpenAI API call
		await yieldToEventLoop(20);

		const aiResponse = completion.choices[0]?.message?.content;
		if (!aiResponse) {
			return { success: false, error: "No response from AI" };
		}

		// Extract function code (remove markdown code blocks if present)
		let functionCode = aiResponse.trim();
		if (functionCode.startsWith("```")) {
			functionCode = functionCode.replace(
				/^```(?:javascript|js)?\n?/,
				""
			);
			functionCode = functionCode.replace(/\n?```$/, "");
		}

		return { success: true, generatorFunction: functionCode };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Generate all test cases for a problem using function generation
 * Generates all test cases at once (target 40+, but flexible based on constraints)
 */
export async function generateTestCases(
	problemData: ProblemGenerationData,
	existingTests: TestCase[]
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
		// Step 1: Generate the test case generator function
		const generatorResult = await generateTestCaseGeneratorFunction(
			problemData,
			existingTests
		);

		if (!generatorResult.success || !generatorResult.generatorFunction) {
			return {
				success: false,
				error:
					generatorResult.error ||
					"Failed to generate test case generator function",
			};
		}

		const generatorFunction = generatorResult.generatorFunction;

		// Step 2: Create a temporary problem object for creating the passing code function
		const tempProblem: AlgoProblemDetail = {
			id: "temp",
			slug: problemData.slug,
			title: problemData.title,
			topics: problemData.topics,
			difficulty: problemData.difficulty,
			languages: problemData.languages,
			order: 0,
			statementMd: problemData.statementMd,
			examplesAndConstraintsMd: problemData.examplesAndConstraintsMd,
			rubric: problemData.rubric,
			tests: [],
			parameters: problemData.parameters || undefined,
			returnType: problemData.returnType || undefined,
			functionName: problemData.functionName || undefined,
			judge: problemData.judge || undefined,
			startingCode: problemData.startingCode,
			passingCode: problemData.passingCode,
			secondaryPassingCode: problemData.secondaryPassingCode,
			outputOrderMatters: problemData.outputOrderMatters,
		};

		// Step 3: Create the passing code function
		const passingCodeFunction = createPassingCodeFunction(
			problemData.passingCode.javascript,
			tempProblem
		);

		if (!passingCodeFunction) {
			return {
				success: false,
				error: "Failed to create passing code function",
			};
		}

		// Step 4: Execute the generated function to create all test cases at once
		console.log(
			`\n[generateTestCases] Executing generator for: ${problemData.title}`
		);
		console.log(
			`[generateTestCases] Function signature: ${
				problemData.functionName
			}(${problemData.parameters.map((p) => p.name).join(", ")})`
		);
		console.log(
			`[generateTestCases] Parameters: ${JSON.stringify(
				problemData.parameters
			)}`
		);
		console.log(
			`[generateTestCases] Return type: ${problemData.returnType}`
		);
		if (problemData.judge) {
			console.log(
				`[generateTestCases] Judge config: ${JSON.stringify(
					problemData.judge
				)}`
			);
		}

		console.log(
			`\n[generateTestCases] Generated function code:\n${generatorFunction}\n`
		);

		const testCases = await executeGeneratorFunction(generatorFunction, {
			existingTests,
			constraints: problemData.examplesAndConstraintsMd || "",
			parameters: problemData.parameters,
			passingCode: passingCodeFunction,
			problemContext: {
				title: problemData.title,
				statement: problemData.statementMd,
				judge: problemData.judge,
			},
		});

		console.log(
			`[generateTestCases] Successfully generated ${testCases.length} test cases for: ${problemData.title}\n`
		);

		return {
			success: true,
			testCases,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Create a passing code function from code string
 * Similar to createFunctionFromCode but simplified for our use case
 */
function createPassingCodeFunction(
	code: string,
	problem: AlgoProblemDetail
): ((...args: any[]) => any) | null {
	try {
		const functionName =
			problem.functionName ||
			extractFunctionNameFromCode(code) ||
			getMainFunctionName(problem);

		// Check if we need to inject ListNode/TreeNode
		const needsDataStructures =
			problem.parameters?.some(
				(p) => p.type === "ListNode" || p.type === "TreeNode"
			) ||
			problem.returnType === "ListNode" ||
			problem.returnType === "TreeNode" ||
			problem.topics.some(
				(t) =>
					t.includes("Linked List") ||
					t.includes("Tree") ||
					t.includes("Binary")
			);

		const utilities = needsDataStructures ? getTypeDefinitionsCode() : "";

		const wrappedCode =
			utilities +
			code +
			`
			
			// Return the main function
			if (typeof ${functionName} === 'function') {
				return ${functionName};
			}
			
			return null;
		`;

		const func = new Function(wrappedCode);
		return func();
	} catch (error) {
		console.error("Error creating passing code function:", error);
		return null;
	}
}

/**
 * Extract function name directly from code
 */
function extractFunctionNameFromCode(code: string): string | null {
	const excludedNames = new Set([
		"ListNode",
		"TreeNode",
		"arrayToListNode",
		"listNodeToArray",
		"arrayToTreeNode",
		"treeNodeToArray",
		"convertInput",
		"convertOutput",
	]);

	const functionMatch = code.match(/function\s+(\w+)\s*\(/);
	if (functionMatch && !excludedNames.has(functionMatch[1])) {
		return functionMatch[1];
	}

	const arrowMatch = code.match(
		/(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)/
	);
	if (arrowMatch && !excludedNames.has(arrowMatch[1])) {
		return arrowMatch[1];
	}

	return null;
}

/**
 * Get the main function name from the problem
 */
function getMainFunctionName(problem: AlgoProblemDetail): string {
	const startingCode = problem.startingCode.javascript || "";
	const functionMatch = startingCode.match(/function\s+(\w+)/);
	if (functionMatch) {
		return functionMatch[1];
	}

	const arrowMatch = startingCode.match(/(?:const|let|var)\s+(\w+)\s*=/);
	if (arrowMatch) {
		return arrowMatch[1];
	}

	return "solution";
}

/**
 * Execute the generated test case generator function
 */
async function executeGeneratorFunction(
	generatorFunctionCode: string,
	options: {
		existingTests: TestCase[];
		constraints: string;
		parameters: { name: string; type: string }[];
		passingCode: (...args: any[]) => any;
		problemContext: {
			title: string;
			statement: string;
			judge?: any;
		};
	}
): Promise<TestCase[]> {
	try {
		// Import type conversion utilities

		// Check if we need ListNode/TreeNode utilities
		const needsDataStructures = options.parameters.some(
			(p) => p.type === "ListNode" || p.type === "TreeNode"
		);

		const typeUtilities = needsDataStructures
			? getTypeDefinitionsCode()
			: "";

		// Create a safe execution context with type utilities
		// Wrap the function code to ensure it returns the function
		const wrappedCode = `
			${typeUtilities}
			
			// Helper function: arrayToListNode
			function arrayToListNode(arr) {
				if (!arr || arr.length === 0) return null;
				let head = ListNode(arr[0]);
				let current = head;
				for (let i = 1; i < arr.length; i++) {
					current.next = ListNode(arr[i]);
					current = current.next;
				}
				return head;
			}
			
			// Helper function: listNodeToArray (convert ListNode back to array)
			function listNodeToArray(head) {
				if (!head) return [];
				const result = [];
				let current = head;
				while (current) {
					result.push(current.val);
					current = current.next;
				}
				return result;
			}
			
			${generatorFunctionCode}
			
			// If the code just defines the function, return it
			if (typeof generateTestCases === 'function') {
				return generateTestCases;
			}
			
			// If it's an IIFE or expression, evaluate it
			return (${generatorFunctionCode});
		`;

		const generatorFn = new Function(wrappedCode)();

		if (typeof generatorFn !== "function") {
			throw new Error(
				"Generated code did not return a function. Got: " +
					typeof generatorFn
			);
		}

		// Execute the function with the provided options
		console.log("\n[TestCaseGenerator] Executing generator function...");
		console.log(
			`[TestCaseGenerator] Parameters: ${JSON.stringify(
				options.parameters.map((p) => `${p.name}: ${p.type}`)
			)}`
		);
		console.log(
			`[TestCaseGenerator] Return type: ${
				options.parameters.some((p) => p.type.includes("ListNode"))
					? "ListNode"
					: "other"
			}`
		);

		// Execute generator with timeout to catch constraint violations
		// Note: We can't easily timeout synchronous code, but we can at least log and fail fast
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => {
				reject(
					new Error(
						"Generator function execution timed out after 30 seconds - likely constraint violations causing expensive computations"
					)
				);
			}, 30000);
		});

		const executionPromise = new Promise<TestCase[]>((resolve, reject) => {
			try {
				const result = generatorFn(options);
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});

		const testCases = await Promise.race([
			executionPromise,
			timeoutPromise,
		]);

		console.log(
			`[TestCaseGenerator] Generated ${testCases.length} test cases`
		);

		// Validate the result
		if (!Array.isArray(testCases)) {
			throw new Error(
				"Generator function did not return an array. Got: " +
					typeof testCases
			);
		}

		// Validate each test case structure and log first few
		const samplesToLog = Math.min(3, testCases.length);
		for (let i = 0; i < samplesToLog; i++) {
			const testCase = testCases[i];
			console.log(
				`[TestCaseGenerator] Sample ${i + 1}: Input: ${JSON.stringify(
					testCase.input
				)}, Output: ${JSON.stringify(testCase.output)}`
			);
		}

		// Validate each test case structure
		for (let i = 0; i < testCases.length; i++) {
			const testCase = testCases[i];
			if (
				!testCase ||
				typeof testCase !== "object" ||
				!Array.isArray(testCase.input) ||
				testCase.output === undefined
			) {
				console.error(
					`[TestCaseGenerator] Invalid test case at index ${i}:`,
					testCase
				);
				throw new Error(
					`Invalid test case structure at index ${i}. Expected: {input: any[], output: any}, got: ${JSON.stringify(
						testCase
					)}`
				);
			}
		}

		console.log(
			`[TestCaseGenerator] All ${testCases.length} test cases validated successfully\n`
		);

		return testCases;
	} catch (error) {
		console.error("Error executing generator function:", error);
		throw new Error(
			`Failed to execute generator function: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
}
