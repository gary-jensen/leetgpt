import { AlgoProblemDetail } from "@/types/algorithm-types";
import { roundTo5Decimals } from "@/utils/numberUtils";
import { getTypeDefinitionsCode } from "@/lib/utils/typeConverters";
import { CodeExecutor } from "./codeExecutor";

export interface AlgoTestResult {
	case: number;
	passed: boolean;
	input: any[];
	expected: any;
	actual?: any;
	error?: string;
	runtime?: number; // Runtime in milliseconds for this specific test case
}

export interface AlgoExecutionResult {
	status: "ok" | "error";
	results: AlgoTestResult[];
	runMs?: number;
	message?: string;
}

/**
 * Execute algorithm problem tests against user code using CodeExecutor (iframe-based sandboxing)
 * @param timeoutMs - Maximum execution time in milliseconds (default: 10000 = 10 seconds)
 * @param codeExecutor - CodeExecutor instance for iframe-based execution (required)
 * @throws Error if codeExecutor is not provided or if called server-side
 */
export async function executeAlgoTests(
	problem: AlgoProblemDetail,
	code: string,
	language: string = "javascript",
	timeoutMs: number = 10000,
	codeExecutor?: CodeExecutor,
	maxTests?: number
): Promise<AlgoExecutionResult> {
	if (!codeExecutor) {
		return {
			status: "error",
			results: [],
			message:
				"CodeExecutor is required. Algorithm test execution must run client-side with an iframe.",
		};
	}

	return executeAlgoTestsWithCodeExecutor(
		problem,
		code,
		timeoutMs,
		codeExecutor,
		maxTests
	);
}

/**
 * Execute algorithm tests using CodeExecutor (iframe-based sandboxing)
 */
async function executeAlgoTestsWithCodeExecutor(
	problem: AlgoProblemDetail,
	code: string,
	timeoutMs: number,
	codeExecutor: CodeExecutor,
	maxTests?: number
): Promise<AlgoExecutionResult> {
	// Generate execution script
	const executionScript = generateAlgoTestExecutionScript(
		problem,
		code,
		timeoutMs,
		maxTests
	);

	// Execute using CodeExecutor with custom script
	let executionResult;
	try {
		executionResult = await codeExecutor.executeCode(
			code,
			false,
			executionScript,
			timeoutMs
		);
	} catch (error) {
		return {
			status: "error",
			results: [],
			message: error instanceof Error ? error.message : String(error),
		};
	}

	// Parse result from CodeExecutor format to AlgoExecutionResult format
	if (executionResult.error) {
		return {
			status: "error",
			results: [],
			message: executionResult.error,
		};
	}

	// Check if execution was cancelled (timeout)
	if (executionResult.cancelled) {
		return {
			status: "error",
			results: [],
			message: `Execution timed out after ${Math.round(
				timeoutMs / 1000
			)} seconds`,
		};
	}

	// Extract algorithm test results from ExecutionResult
	// The result structure from our execution script is: { status: 'ok', results: [...], runMs: ... }
	const resultData = executionResult.result;

	// Check if we have the expected structure
	if (!resultData || !resultData.results) {
		// Try to extract from logs or other fields
		const errorMessage =
			executionResult.logs?.join("\n") ||
			"Execution completed but result structure was unexpected.";

		return {
			status: "error",
			results: [],
			message: errorMessage,
		};
	}

	const algoResults = resultData.results || [];
	const runMs = resultData.runMs;

	// Convert to AlgoExecutionResult format
	// Normalize actual values: if expected is an array but actual is {returnValue, array}, extract the array
	return {
		status:
			resultData.status === "ok" && executionResult.success
				? "ok"
				: "error",
		results: algoResults.map((r: any) => {
			let normalizedActual = r.actual;
			let normalizedExpected = r.expected;

			// Handle mutating-array-with-k pattern: both actual and expected might be objects with {returnValue, array}
			// Extract just the array for display if the expected from problem is an array
			if (
				r.actual &&
				typeof r.actual === "object" &&
				!Array.isArray(r.actual) &&
				"array" in r.actual &&
				Array.isArray(r.actual.array)
			) {
				// Check if expected is also an object with array property, or if it's just an array
				if (
					r.expected &&
					typeof r.expected === "object" &&
					!Array.isArray(r.expected) &&
					"array" in r.expected
				) {
					// Both are objects, extract arrays from both
					normalizedActual = r.actual.array;
					normalizedExpected = r.expected.array;
				} else if (Array.isArray(r.expected)) {
					// Expected is just an array, extract array from actual
					normalizedActual = r.actual.array;
				}
			}

			return {
				case: r.case,
				passed: r.passed,
				input: r.input,
				expected: normalizedExpected,
				actual: normalizedActual,
				error: r.error,
				runtime: r.runtime,
			};
		}),
		runMs,
		message:
			resultData.status === "ok"
				? undefined
				: resultData.message || "Execution failed",
	};
}

/**
 * Create a function from user code by extracting the main function
 * Injects ListNode/TreeNode definitions if problem uses them
 */
export function createFunctionFromCode(
	code: string,
	problem: AlgoProblemDetail
): ((...args: any[]) => any) | null {
	try {
		// Priority 1: Use explicit functionName from problem metadata (most reliable)
		// Priority 2: Extract from user's code
		// Priority 3: Fall back to starting code or default
		const functionName =
			problem.functionName ||
			extractFunctionNameFromCode(code) ||
			getMainFunctionName(problem);

		// Check if we need to inject ListNode/TreeNode
		// Priority 1: If problem has parameters with ListNode/TreeNode types
		// Priority 2: Check if problem needs data structures
		// Priority 3: If topics suggest Linked List/Tree
		const needsDataStructures =
			problem.parameters?.some(
				(p) =>
					p.type === "ListNode" ||
					p.type === "TreeNode" ||
					p.type === "_Node"
			) ||
			problem.returnType === "ListNode" ||
			problem.returnType === "TreeNode" ||
			problem.returnType === "_Node" ||
			problem.topics.some(
				(t) =>
					t.includes("Linked List") ||
					t.includes("Tree") ||
					t.includes("Binary")
			);

		// Get utility functions if needed (use new type definitions)
		const utilities = needsDataStructures ? getTypeDefinitionsCode() : "";

		// Create a wrapper that includes utilities, user's code, and returns the function
		const wrappedCode =
			utilities +
			code +
			`
			
			// Return the main function
			if (typeof ${functionName} === 'function') {
				return ${functionName};
			}
			
			// If no function found, return null
			return null;
		`;

		// Use Function constructor to create the function
		const func = new Function(wrappedCode);
		return func();
	} catch (error) {
		// console.error("Error creating function from code:", error);
		return null;
	}
}

/**
 * Generate complete execution script for algorithm tests to run in iframe
 * This script includes type definitions, type converters, judge system, and test execution
 */
function generateAlgoTestExecutionScript(
	problem: AlgoProblemDetail,
	code: string,
	timeoutMs: number,
	maxTests?: number
): string {
	const functionName =
		problem.functionName ||
		extractFunctionNameFromCode(code) ||
		getMainFunctionName(problem);

	// Get type definitions if needed
	const needsDataStructures =
		problem.parameters?.some(
			(p) =>
				p.type === "ListNode" ||
				p.type === "TreeNode" ||
				p.type === "_Node"
		) ||
		problem.returnType === "ListNode" ||
		problem.returnType === "TreeNode" ||
		problem.returnType === "_Node" ||
		problem.topics.some(
			(t) =>
				t.includes("Linked List") ||
				t.includes("Tree") ||
				t.includes("Binary")
		);

	const typeDefinitions = needsDataStructures ? getTypeDefinitionsCode() : "";

	// Escape code for embedding in template string
	// IMPORTANT: We only escape backticks and ${} expressions, NOT backslashes
	// This preserves regex patterns like \d, \., etc.
	const escapedCode = code.replace(/`/g, "\\`").replace(/\${/g, "\\${");

	// Serialize problem data for the script
	const problemData = JSON.stringify({
		tests: problem.tests,
		parameters: problem.parameters || [],
		returnType: problem.returnType || "void", // Default to "void" if not defined
		judge: problem.judge,
		outputOrderMatters: problem.outputOrderMatters ?? true,
	});

	// Generate the complete execution script
	// Note: This returns a template string that will be inserted into CodeExecutor's template
	// The ${functionName} and ${problemData} are evaluated here in TypeScript
	// We embed the user code directly (with only backticks and ${} escaped) to preserve regex patterns
	const scriptTemplate = `
		${typeDefinitions}
		
		// Mock storage and cache APIs to prevent errors in sandboxed iframe
		// In sandboxed iframes, accessing these properties throws an error
		// So we need to define them before any code tries to access them
		Object.defineProperty(window, 'sessionStorage', {
			value: {
				getItem: () => null,
				setItem: () => {},
				removeItem: () => {},
				clear: () => {},
				length: 0,
				key: () => null
			},
			writable: false,
			configurable: false
		});
		Object.defineProperty(window, 'localStorage', {
			value: {
				getItem: () => null,
				setItem: () => {},
				removeItem: () => {},
				clear: () => {},
				length: 0,
				key: () => null
			},
			writable: false,
			configurable: false
		});
		Object.defineProperty(window, 'caches', {
			value: {
				open: () => Promise.resolve({
					match: () => Promise.resolve(undefined),
					put: () => Promise.resolve(),
					delete: () => Promise.resolve(false),
					keys: () => Promise.resolve([])
				}),
				has: () => Promise.resolve(false),
				delete: () => Promise.resolve(false),
				keys: () => Promise.resolve([]),
				match: () => Promise.resolve(undefined)
			},
			writable: false,
			configurable: false
		});
		
		// User code - embed directly in the script (no eval needed!)
		${escapedCode}
		
		// Helper: Deep clone
		function deepClone(obj) {
			if (obj === null || typeof obj !== 'object') return obj;
			if (obj instanceof Date) return new Date(obj.getTime());
			if (Array.isArray(obj)) return obj.map(item => deepClone(item));
			const cloned = {};
			for (let key in obj) {
				if (obj.hasOwnProperty(key)) {
					cloned[key] = deepClone(obj[key]);
				}
			}
			return cloned;
		}
		
		// Helper: Round to 5 decimals
		function roundTo5Decimals(value) {
			// Preserve primitive types that don't need rounding
			if (typeof value === 'boolean' || typeof value === 'string' || value === null || value === undefined) {
				return value;
			}
			if (typeof value === 'number') {
				return Math.round(value * 100000) / 100000;
			}
			if (Array.isArray(value)) {
				return value.map(item => roundTo5Decimals(item));
			}
			if (value !== null && typeof value === 'object') {
				const rounded = {};
				for (let key in value) {
					rounded[key] = roundTo5Decimals(value[key]);
				}
				return rounded;
			}
			return value;
		}
		
		// Helper: Deep equality check
		function deepEqual(a, b, orderMatters = true) {
			const roundedA = roundTo5Decimals(a);
			const roundedB = roundTo5Decimals(b);
			
			// Strict equality check (handles primitives including booleans)
			if (roundedA === roundedB) return true;
			
			// Handle null/undefined
			if (roundedA == null || roundedB == null) return roundedA === roundedB;
			
			// Handle arrays
			if (Array.isArray(roundedA) && Array.isArray(roundedB)) {
				if (roundedA.length !== roundedB.length) return false;
				if (!orderMatters) {
					const sortedA = [...roundedA].sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
					const sortedB = [...roundedB].sort((x, y) => JSON.stringify(x).localeCompare(JSON.stringify(y)));
					return sortedA.every((val, idx) => deepEqual(val, sortedB[idx], orderMatters));
				}
				return roundedA.every((val, idx) => deepEqual(val, roundedB[idx], orderMatters));
			}
			
			// Handle objects (but not null, which is typeof 'object' in JavaScript)
			if (typeof roundedA === 'object' && typeof roundedB === 'object' && 
			    roundedA !== null && roundedB !== null &&
			    !Array.isArray(roundedA) && !Array.isArray(roundedB)) {
				const keysA = Object.keys(roundedA);
				const keysB = Object.keys(roundedB);
				if (keysA.length !== keysB.length) return false;
				return keysA.every(key => deepEqual(roundedA[key], roundedB[key], orderMatters));
			}
			
			return false;
		}
		
		// Type converters (matching typeConverters.ts logic)
		function convertInputValue(value, paramType) {
			switch (paramType) {
				case 'ListNode':
					if (Array.isArray(value)) {
						// Convert array to ListNode
						if (value.length === 0) return null;
						let head = new ListNode(value[0]);
						let current = head;
						for (let i = 1; i < value.length; i++) {
							current.next = new ListNode(value[i]);
							current = current.next;
						}
						return head;
					}
					return value; // Already ListNode or null
				case 'TreeNode':
					if (Array.isArray(value)) {
						// Reject nested arrays - they indicate an error in input format
						if (value.length > 0 && Array.isArray(value[0])) {
							throw new Error(
								'Invalid TreeNode input: nested array detected. Expected flat array like [1,2,3], but got [[1,2,3]]. Did you accidentally wrap the array in extra brackets?'
							);
						}
						// Convert array to TreeNode (level-order)
						if (value.length === 0 || value[0] === null) return null;
						const root = new TreeNode(value[0]);
						const queue = [root];
						let i = 1;
						while (queue.length > 0 && i < value.length) {
							const node = queue.shift();
							if (node) {
								if (i < value.length && value[i] !== null) {
									node.left = new TreeNode(value[i]);
									queue.push(node.left);
								} else {
									queue.push(null);
								}
								i++;
								if (i < value.length && value[i] !== null) {
									node.right = new TreeNode(value[i]);
									queue.push(node.right);
								} else {
									queue.push(null);
								}
								i++;
							}
						}
						return root;
					}
					return value; // Already TreeNode or null
				case '_Node':
					if (Array.isArray(value)) {
						// Convert array to _Node (level-order with # markers for next pointers)
						if (value.length === 0 || value[0] === null) return null;
						const root = new _Node(value[0]);
						const queue = [root];
						let i = 1;
						while (queue.length > 0 && i < value.length) {
							const node = queue.shift();
							if (node) {
								if (i < value.length && value[i] !== null && value[i] !== '#') {
									node.left = new _Node(value[i]);
									queue.push(node.left);
								} else {
									queue.push(null);
								}
								i++;
								if (i < value.length && value[i] !== null && value[i] !== '#') {
									node.right = new _Node(value[i]);
									queue.push(node.right);
								} else {
									queue.push(null);
								}
								i++;
							}
						}
						return root;
					}
					return value; // Already _Node or null
				case 'ListNode[]':
					// Convert array of arrays to array of ListNode objects
					if (Array.isArray(value)) {
						return value.map(arr => {
							if (!Array.isArray(arr) || arr.length === 0) return null;
							let head = new ListNode(arr[0]);
							let current = head;
							for (let i = 1; i < arr.length; i++) {
								current.next = new ListNode(arr[i]);
								current = current.next;
							}
							return head;
						});
					}
					return value;
				case 'TreeNode[]':
					// Convert array of arrays to array of TreeNode objects
					if (Array.isArray(value)) {
						return value.map(arr => {
							if (!Array.isArray(arr) || arr.length === 0 || arr[0] === null) return null;
							const root = new TreeNode(arr[0]);
							const queue = [root];
							let i = 1;
							while (queue.length > 0 && i < arr.length) {
								const node = queue.shift();
								if (node) {
									if (i < arr.length && arr[i] !== null) {
										node.left = new TreeNode(arr[i]);
										queue.push(node.left);
									} else {
										queue.push(null);
									}
									i++;
									if (i < arr.length && arr[i] !== null) {
										node.right = new TreeNode(arr[i]);
										queue.push(node.right);
									} else {
										queue.push(null);
									}
									i++;
								}
							}
							return root;
						});
					}
					return value;
				case '_Node[]':
					// Convert array of arrays to array of _Node objects
					if (Array.isArray(value)) {
						return value.map(arr => {
							if (!Array.isArray(arr) || arr.length === 0 || arr[0] === null) return null;
							const root = new _Node(arr[0]);
							const queue = [root];
							let i = 1;
							while (queue.length > 0 && i < arr.length) {
								const node = queue.shift();
								if (node) {
									if (i < arr.length && arr[i] !== null && arr[i] !== '#') {
										node.left = new _Node(arr[i]);
										queue.push(node.left);
									} else {
										queue.push(null);
									}
									i++;
									if (i < arr.length && arr[i] !== null && arr[i] !== '#') {
										node.right = new _Node(arr[i]);
										queue.push(node.right);
									} else {
										queue.push(null);
									}
									i++;
								}
							}
							return root;
						});
					}
					return value;
				case 'number[]':
				case 'string[]':
					// For arrays, return a shallow clone to prevent shared state
					return Array.isArray(value) ? [...value] : value;
				case 'number[][]':
					// For 2D arrays, return a deep clone to prevent shared state
					return Array.isArray(value) ? value.map(row => Array.isArray(row) ? [...row] : row) : value;
				case 'string':
				case 'number':
				case 'boolean':
					// No conversion needed for primitive types
					return value;
				default:
					// Unknown type, return as-is
					return value;
			}
		}
		
		// Helper: Convert ListNode-like object to array
		function listNodeToArrayFromAny(head) {
			const result = [];
			let current = head;
			
			if (current === null || current === undefined) return [];
			if (Array.isArray(current)) return current;
			
			// Handle case where head itself has a val that is a ListNode object
			if (current && typeof current === 'object' && 'val' in current && 
			    current.val !== undefined && current.val !== null && 
			    typeof current.val === 'object' && 'val' in current.val && 
			    !Array.isArray(current.val)) {
				current = current.val;
			}
			
			let iterations = 0;
			while (current !== null && current !== undefined) {
				iterations++;
				const val = current.val !== undefined ? current.val : current.value;
				if (val !== undefined && val !== null && typeof val !== 'object') {
					result.push(val);
				}
				current = current.next;
				if (iterations > 10000) break; // Safety check
			}
			return result;
		}
		
		// Helper: Convert TreeNode-like object to array
		function treeNodeToArrayFromAny(root) {
			if (!root) return [];
			const result = [];
			const queue = [root];
			while (queue.length > 0) {
				const node = queue.shift();
				if (node) {
					result.push(node.val);
					queue.push(node.left);
					queue.push(node.right);
				} else {
					result.push(null);
				}
			}
			// Remove trailing nulls
			while (result.length > 0 && result[result.length - 1] === null) {
				result.pop();
			}
			return result;
		}
		
		// Helper: Convert _Node-like object to array with next pointer serialization
		function _NodeToArrayFromAny(root) {
			if (!root) return [];
			const result = [];
			const queue = [root];
			while (queue.length > 0) {
				const levelSize = queue.length;
				let hasNodesInLevel = false;
				for (let i = 0; i < levelSize; i++) {
					const node = queue.shift();
					if (node) {
						result.push(node.val);
						hasNodesInLevel = true;
						queue.push(node.left);
						queue.push(node.right);
					} else {
						result.push(null);
					}
				}
				if (hasNodesInLevel) {
					result.push('#');
				}
			}
			// Remove trailing nulls
			while (result.length > 0 && result[result.length - 1] === null) {
				result.pop();
			}
			return result;
		}
		
		function convertOutputValue(value, returnType) {
			// Default to "void" if returnType is not provided
			if (!returnType) returnType = "void";
			
			switch (returnType) {
				case 'ListNode':
					// Always try to convert when returnType is ListNode
					if (value === null || value === undefined) return [];
					// If it's an array, check if it contains ListNode objects
					if (Array.isArray(value)) {
						if (value.length === 0) return [];
						const firstElement = value[0];
						if (firstElement && typeof firstElement === 'object' && 
						    ('val' in firstElement || 'next' in firstElement)) {
							// It's an array containing ListNode(s), convert the first one
							return listNodeToArrayFromAny(firstElement);
						}
						// Otherwise, it's already an array of values (numbers), return as-is
						return value;
					}
					// If it's an object, try to convert it (assume it's a ListNode)
					if (typeof value === 'object') {
						return listNodeToArrayFromAny(value);
					}
					return value;
				case 'TreeNode':
					// Always try to convert when returnType is TreeNode
					if (value === null || value === undefined) return [];
					// If it's already an array, check if it's a TreeNode array representation
					if (Array.isArray(value)) {
						if (value.length === 0) return [];
						const firstElement = value[0];
						if (firstElement && typeof firstElement === 'object' && 
						    !('length' in firstElement) && 
						    ('val' in firstElement || 'left' in firstElement || 'right' in firstElement)) {
							// It's an array containing TreeNode object(s), convert the first one
							return treeNodeToArrayFromAny(firstElement);
						}
						// Otherwise, it's already a TreeNode array representation (already converted)
						return value;
					}
					// If it's an object, try to convert it (assume it's a TreeNode)
					if (typeof value === 'object') {
						return treeNodeToArrayFromAny(value);
					}
					return value;
				case 'TreeNode[]':
					// Convert array of TreeNode objects to array of arrays
					if (value === null || value === undefined) return [];
					if (Array.isArray(value)) {
						return value.map(treeNode => {
							if (treeNode === null || treeNode === undefined) return [];
							if (Array.isArray(treeNode)) return treeNode;
							if (typeof treeNode === 'object') {
								return treeNodeToArrayFromAny(treeNode);
							}
							return treeNode;
						});
					}
					if (typeof value === 'object') {
						return [treeNodeToArrayFromAny(value)];
					}
					return value;
				case 'ListNode[]':
					// Convert array of ListNode objects to array of arrays
					if (value === null || value === undefined) return [];
					if (Array.isArray(value)) {
						return value.map(listNode => {
							if (listNode === null || listNode === undefined) return [];
							if (Array.isArray(listNode)) return listNode;
							if (typeof listNode === 'object') {
								return listNodeToArrayFromAny(listNode);
							}
							return listNode;
						});
					}
					if (typeof value === 'object') {
						return [listNodeToArrayFromAny(value)];
					}
					return value;
				case '_Node':
					// Convert _Node to array with next pointer serialization (# markers)
					if (value === null || value === undefined) return [];
					if (Array.isArray(value)) {
						if (value.length === 0) return [];
						const firstElement = value[0];
						if (firstElement && typeof firstElement === 'object' && 
						    !('length' in firstElement) && 
						    ('val' in firstElement || 'left' in firstElement || 'right' in firstElement || 'next' in firstElement)) {
							return _NodeToArrayFromAny(firstElement);
						}
						return value;
					}
					if (typeof value === 'object') {
						return _NodeToArrayFromAny(value);
					}
					return value;
				case 'number[]':
				case 'number[][]':
				case 'string':
				case 'string[]':
				case 'number':
				case 'boolean':
				case 'void':
					// No conversion needed for primitive types
					return value;
				default:
					// Unknown type, return as-is
					return value;
			}
		}
		
		// Simplified judge execution
		function executeJudge(judgeConfig, runtimeArgs, returnValue, expected, orderMatters) {
			if (!judgeConfig || judgeConfig.kind === 'return-value') {
				return {
					pass: deepEqual(roundTo5Decimals(returnValue), roundTo5Decimals(expected), orderMatters),
					actual: roundTo5Decimals(returnValue),
					expected: roundTo5Decimals(expected)
				};
			}
			
			if (judgeConfig.kind === 'mutating-array-with-k') {
				const k = returnValue;
				const expectedLength = Array.isArray(expected) ? expected.length : 0;
				const modifiedArray = runtimeArgs[0];
				const firstKElements = Array.isArray(modifiedArray) ? modifiedArray.slice(0, k) : [];
				
				return {
					pass: k === expectedLength && deepEqual(roundTo5Decimals(firstKElements), roundTo5Decimals(expected), orderMatters),
					actual: { returnValue: k, array: roundTo5Decimals(firstKElements) },
					expected: { returnValue: expectedLength, array: roundTo5Decimals(expected) }
				};
			}
			
			// Fallback to return-value
			return {
				pass: deepEqual(roundTo5Decimals(returnValue), roundTo5Decimals(expected), orderMatters),
				actual: roundTo5Decimals(returnValue),
				expected: roundTo5Decimals(expected)
			};
		}
		
		// Global cancellation flag
		let cancelled = false;
		
		// Listen for cancellation messages from parent
		window.addEventListener('message', (event) => {
			if (event.data && event.data.type === 'cancel-execution' && event.data.messageId === '__MESSAGE_ID_PLACEHOLDER__') {
				cancelled = true;
			}
		});
		
		// Main execution
		(async function() {
			try {
				const problem = ${problemData};
				const results = [];
				const startTime = Date.now();
				
				// Check for cancellation before starting
				if (cancelled) {
					throw new Error('Execution was cancelled before starting');
				}
				
				// Get user function - try multiple ways to find it
				const functionName = ${JSON.stringify(functionName)};
				let userFunction = null;
				
				// Try 1: Direct reference using eval (safest for finding functions)
				try {
					const func = eval(functionName);
					if (typeof func === 'function') {
						userFunction = func;
					}
				} catch (e) {
					// Function not found via direct eval, try other methods
				}
				
				// Try 2: Window object
				if (!userFunction && typeof window[functionName] === 'function') {
					userFunction = window[functionName];
				}
				
				// Try 3: Check if it's defined in current scope (using typeof check)
				if (!userFunction) {
					try {
						const funcCheck = 'typeof ' + functionName + ' !== "undefined"';
						if (eval(funcCheck)) {
							userFunction = eval(functionName);
						}
					} catch (e) {
						// Still not found
					}
				}
				
				if (!userFunction) {
					const available = Object.keys(window).filter(k => typeof window[k] === 'function' && !k.startsWith('_') && !['deepClone', 'roundTo5Decimals', 'deepEqual', 'convertInputValue', 'convertOutputValue', 'executeJudge'].includes(k)).slice(0, 10).join(', ');
					throw new Error('Function ' + functionName + ' not found. Available functions: ' + (available || 'none'));
				}
				
				// Run test cases (limited by maxTests if provided)
				${maxTests !== undefined ? `const maxTests = ${maxTests};` : ''}
				const testLimit = ${maxTests !== undefined ? `Math.min(problem.tests.length, ${maxTests})` : 'problem.tests.length'};
				for (let i = 0; i < testLimit; i++) {
					// Check for cancellation before each test
					if (cancelled) {
						break;
					}
					
					const testCase = problem.tests[i];
					const testStartTime = Date.now();
					
					try {
						// Clone input
						const clonedInput = deepClone(testCase.input);
						
						// Convert inputs based on parameter types
						const convertedInputs = [];
						for (let j = 0; j < clonedInput.length; j++) {
							const paramType = problem.parameters[j]?.type || 'any';
							convertedInputs.push(convertInputValue(clonedInput[j], paramType));
						}
						
						// Execute function
						const result = userFunction(...convertedInputs);
						
						// Convert output
						// Always convert the result first (convertOutputValue handles null/undefined correctly)
						// Default returnType to "void" if not defined
						const returnType = problem.returnType || 'void';
						let actual = convertOutputValue(result, returnType);
						
						// Only use in-place modification for void return types or mutating-array-with-k judge
						// For other return types (like ListNode), trust the return value even if it's null
						if ((result === undefined || result === null) && 
						    (returnType === 'void' || problem.judge?.kind === 'mutating-array-with-k') &&
						    convertedInputs.length > 0 && 
						    (Array.isArray(convertedInputs[0]) || typeof convertedInputs[0] === 'object')) {
							// This is an in-place modification problem
							const firstParam = problem.parameters[0];
							if (firstParam) {
								actual = convertOutputValue(convertedInputs[0], firstParam.type);
							}
						}
						
						// Judge
						const judgeResult = executeJudge(
							problem.judge,
							convertedInputs,
							actual,
							testCase.output,
							problem.outputOrderMatters
						);
						
						const runtime = Date.now() - testStartTime;
						
						results.push({
							case: i + 1,
							passed: judgeResult.pass,
							input: roundTo5Decimals(testCase.input),
							expected: judgeResult.expected,
							actual: judgeResult.actual,
							runtime: runtime
						});
					} catch (error) {
						const runtime = Date.now() - testStartTime;
						results.push({
							case: i + 1,
							passed: false,
							input: roundTo5Decimals(testCase.input),
							expected: roundTo5Decimals(testCase.output),
							error: error.message || String(error),
							runtime: runtime
						});
					}
				}
				
				const totalRuntime = Date.now() - startTime;
				
				// Check if execution was cancelled
				if (cancelled) {
					const msgId = '__MESSAGE_ID_PLACEHOLDER__';
					window.parent.postMessage({
						type: 'execution-complete',
						messageId: msgId,
						result: {
							status: 'error',
							results: results, // Send partial results if any
							runMs: totalRuntime
						},
						logs: ['Execution timed out'],
						success: false,
						cancelled: true,
						tracked: { variables: {}, variableTrace: {}, functions: {} }
					}, PARENT_ORIGIN);
					return;
				}
				
				// Send results back to parent (messageId will be replaced by CodeExecutor)
				// Use PARENT_ORIGIN constant (set by CodeExecutor) since srcdoc iframes have null origin
				const msgId = '__MESSAGE_ID_PLACEHOLDER__';
				window.parent.postMessage({
					type: 'execution-complete',
					messageId: msgId,
					result: {
						status: 'ok',
						results: results,
						runMs: totalRuntime
					},
					logs: [],
					success: true,
					cancelled: false,
					tracked: { variables: {}, variableTrace: {}, functions: {} }
				}, PARENT_ORIGIN);
			} catch (error) {
				const msgId = '__MESSAGE_ID_PLACEHOLDER__';
				const errorMessage = error instanceof Error ? error.message : String(error);
				const errorStack = error instanceof Error ? error.stack : '';
				// Use PARENT_ORIGIN constant (set by CodeExecutor) since srcdoc iframes have null origin
				window.parent.postMessage({
					type: 'execution-complete',
					messageId: msgId,
					error: errorMessage,
					logs: [errorMessage, errorStack].filter(Boolean),
					success: false,
					tracked: { variables: {}, variableTrace: {}, functions: {} }
				}, PARENT_ORIGIN);
			}
		})();
	`.trim();

	// Escape backticks for safe insertion into CodeExecutor's template literal
	// Note: ${} expressions are already evaluated by TypeScript, so we only need to escape backticks
	return scriptTemplate.replace(/`/g, "\\`");
}

/**
 * Extract function name directly from user code
 * Excludes system-defined names like ListNode, TreeNode, etc.
 */
function extractFunctionNameFromCode(code: string): string | null {
	// System-defined names to exclude
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

	// Try function declaration: function name(...)
	const functionMatch = code.match(/function\s+(\w+)\s*\(/);
	if (functionMatch && !excludedNames.has(functionMatch[1])) {
		return functionMatch[1];
	}

	// Try arrow function: const name = (...) => or const name = function(...)
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
 * This is a simple heuristic - in a real implementation, you might want to be more sophisticated
 */
function getMainFunctionName(problem: AlgoProblemDetail): string {
	// Try to extract function name from starting code
	const startingCode = problem.startingCode.javascript || "";
	const functionMatch = startingCode.match(/function\s+(\w+)/);
	if (functionMatch) {
		return functionMatch[1];
	}

	// Try arrow function
	const arrowMatch = startingCode.match(/(?:const|let|var)\s+(\w+)\s*=/);
	if (arrowMatch) {
		return arrowMatch[1];
	}

	// Fallback to a common pattern
	return "solution";
}

/**
 * Deep clone a value (handles arrays, objects, primitives)
 */
function deepClone(value: any): any {
	if (value === null || value === undefined) {
		return value;
	}
	if (typeof value === "function") {
		return value; // Functions can't be cloned, return as-is
	}
	if (typeof value !== "object") {
		return value; // Primitives don't need cloning
	}
	if (Array.isArray(value)) {
		return value.map(deepClone);
	}
	// Regular object
	const cloned: any = {};
	for (const key in value) {
		if (Object.prototype.hasOwnProperty.call(value, key)) {
			cloned[key] = deepClone(value[key]);
		}
	}
	return cloned;
}

// Removed: runSingleTest, executeWithTypeConverters, executeDirectly
// These functions are no longer needed - execution happens in iframe via CodeExecutor

/**
 * Normalize arrays for order-independent comparison
 * - Arrays of arrays: sorts each sub-array, then sorts the outer array lexicographically
 * - Arrays of primitives/strings: sorts the array
 * - Handles nested structures recursively
 */
export function normalizeArrayOfArrays(value: any): any {
	if (!Array.isArray(value)) {
		return value;
	}

	// Check if this is an array of arrays (all elements are arrays)
	// Empty array is treated as a regular array (not an array of arrays)
	const isArrayOfArrays =
		value.length > 0 && value.every((item) => Array.isArray(item));

	if (isArrayOfArrays) {
		// Sort each sub-array (normalize recursively in case of nested arrays)
		const sortedSubArrays = value.map((subArray) => {
			// Deep clone and normalize recursively
			const normalized = normalizeArrayOfArrays([...subArray]);
			// Sort the normalized sub-array
			const sorted = normalized.sort((a: any, b: any) => {
				// Handle different types for comparison
				if (typeof a === "number" && typeof b === "number") {
					return a - b;
				}
				if (typeof a === "string" && typeof b === "string") {
					return a.localeCompare(b);
				}
				// For mixed types, objects, or arrays, use JSON string comparison
				// This ensures consistent ordering
				return JSON.stringify(a).localeCompare(JSON.stringify(b));
			});
			return sorted;
		});

		// Sort the outer array lexicographically
		sortedSubArrays.sort((a, b) => {
			// Compare element by element
			const minLength = Math.min(a.length, b.length);
			for (let i = 0; i < minLength; i++) {
				const aVal = a[i];
				const bVal = b[i];

				// Compare values
				if (aVal < bVal) return -1;
				if (aVal > bVal) return 1;

				// If values are equal but might be objects/arrays, compare as JSON
				if (typeof aVal === "object" || typeof bVal === "object") {
					const aStr = JSON.stringify(aVal);
					const bStr = JSON.stringify(bVal);
					if (aStr !== bStr) {
						return aStr.localeCompare(bStr);
					}
				}
			}
			return a.length - b.length;
		});

		return sortedSubArrays;
	}

	// Regular array (array of primitives/strings/objects) - sort it
	// First normalize each element recursively in case it's a nested structure
	const normalized = value.map((item) => normalizeArrayOfArrays(item));

	// Sort the array (create a copy to avoid mutating)
	const sorted = [...normalized].sort((a: any, b: any) => {
		// Handle different types for comparison
		if (typeof a === "number" && typeof b === "number") {
			return a - b;
		}
		if (typeof a === "string" && typeof b === "string") {
			return a.localeCompare(b);
		}
		// For mixed types, objects, or arrays, use JSON string comparison
		return JSON.stringify(a).localeCompare(JSON.stringify(b));
	});

	return sorted;
}

/**
 * Deep equality comparison for test results
 * Numbers are rounded to 5 decimal places before comparison to avoid floating point issues
 * If outputOrderMatters is false, arrays of arrays are normalized for order-independent comparison
 */
function deepEqual(
	a: any,
	b: any,
	outputOrderMatters: boolean = true
): boolean {
	// Round both values to 5 decimal places before comparison
	const roundedA = roundTo5Decimals(a);
	const roundedB = roundTo5Decimals(b);

	if (roundedA === roundedB) return true;

	if (roundedA == null || roundedB == null) return roundedA === roundedB;

	if (Array.isArray(roundedA) && Array.isArray(roundedB)) {
		if (roundedA.length !== roundedB.length) return false;

		// If order doesn't matter, normalize both arrays before comparison
		if (!outputOrderMatters) {
			const normalizedA = normalizeArrayOfArrays(roundedA);
			const normalizedB = normalizeArrayOfArrays(roundedB);

			// Compare normalized versions using JSON stringify for deep comparison
			// This handles nested arrays of arrays correctly
			return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
		}

		// Default: order matters, compare element by element
		return roundedA.every((val, index) =>
			deepEqual(val, roundedB[index], outputOrderMatters)
		);
	}

	if (typeof roundedA === "object" && typeof roundedB === "object") {
		const keysA = Object.keys(roundedA);
		const keysB = Object.keys(roundedB);

		if (keysA.length !== keysB.length) return false;

		return keysA.every((key) =>
			deepEqual(roundedA[key], roundedB[key], outputOrderMatters)
		);
	}

	return false;
}
