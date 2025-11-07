/**
 * Web Worker for executing algorithm tests
 * This runs in a separate thread and can be terminated to stop infinite loops
 */

// Import map for dependencies (we'll need to bundle these or pass as strings)
// For now, we'll create a simplified version that can execute basic tests

self.onmessage = async function(e) {
	const { type, messageId, problem, code, language, timeoutMs } = e.data;
	
	if (type === "execute") {
		try {
			const result = await executeTests(problem, code, language, timeoutMs);
			self.postMessage({
				messageId,
				type: "result",
				result
			});
		} catch (error) {
			self.postMessage({
				messageId,
				type: "error",
				error: error.message || String(error)
			});
		}
	} else if (type === "cancel") {
		// Worker will be terminated by main thread
		self.close();
	}
};

async function executeTests(problem, code, language, timeoutMs) {
	const startTime = Date.now();
	const results = [];
	
	// Create function from code
	const userFunction = createFunctionFromCode(code, problem);
	
	if (!userFunction) {
		return {
			status: "error",
			results: [],
			message: "Could not extract function from code"
		};
	}
	
	// Execute each test case with timeout
	for (let i = 0; i < problem.tests.length; i++) {
		const testCase = problem.tests[i];
		const result = await runSingleTestWithTimeout(
			userFunction,
			testCase,
			i + 1,
			problem,
			timeoutMs / problem.tests.length
		);
		results.push(result);
	}
	
	return {
		status: "ok",
		results,
		runMs: Date.now() - startTime
	};
}

function createFunctionFromCode(code, problem) {
	try {
		const functionName = problem.functionName || extractFunctionName(code) || "solution";
		
		// Get type definitions if needed
		const needsDataStructures = problem.parameters?.some(p => 
			p.type === "ListNode" || p.type === "TreeNode" || p.type === "_Node"
		) || problem.returnType === "ListNode" || problem.returnType === "TreeNode";
		
		const utilities = needsDataStructures ? getTypeDefinitionsCode() : "";
		
		const wrappedCode = utilities + code + `
			if (typeof ${functionName} === 'function') {
				return ${functionName};
			}
			return null;
		`;
		
		const func = new Function(wrappedCode);
		return func();
	} catch (error) {
		return null;
	}
}

function extractFunctionName(code) {
	const functionMatch = code.match(/function\s+(\w+)\s*\(/);
	if (functionMatch) return functionMatch[1];
	
	const arrowMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)/);
	if (arrowMatch) return arrowMatch[1];
	
	return null;
}

function getTypeDefinitionsCode() {
	// Simplified type definitions - in production, import from typeConverters
	return `
		function ListNode(val, next) {
			this.val = val === undefined ? 0 : val;
			this.next = next === undefined ? null : next;
		}
		
		function TreeNode(val, left, right) {
			this.val = val === undefined ? 0 : val;
			this.left = left === undefined ? null : left;
			this.right = right === undefined ? null : right;
		}
		
		function _Node(val, left, right, next) {
			this.val = val === undefined ? 0 : val;
			this.left = left === undefined ? null : left;
			this.right = right === undefined ? null : right;
			this.next = next === undefined ? null : next;
		}
	`;
}

async function runSingleTestWithTimeout(userFunction, testCase, caseNumber, problem, timeoutMs) {
	const startTime = Date.now();
	
	try {
		// Execute with timeout
		const actual = await Promise.race([
			new Promise((resolve, reject) => {
				try {
					const result = userFunction(...testCase.input);
					if (result instanceof Promise) {
						result.then(resolve).catch(reject);
					} else {
						resolve(result);
					}
				} catch (error) {
					reject(error);
				}
			}),
			new Promise((_, reject) => {
				setTimeout(() => {
					reject(new Error(`Test case ${caseNumber} timed out after ${timeoutMs}ms`));
				}, timeoutMs);
			})
		]);
		
		// Simple comparison (would need full judge system in production)
		const passed = JSON.stringify(actual) === JSON.stringify(testCase.output);
		
		return {
			case: caseNumber,
			passed,
			input: testCase.input,
			expected: testCase.output,
			actual,
			runtime: Date.now() - startTime
		};
	} catch (error) {
		return {
			case: caseNumber,
			passed: false,
			input: testCase.input,
			expected: testCase.output,
			error: error.message || String(error),
			runtime: Date.now() - startTime
		};
	}
}

