/**
 * Type inference utilities for migrating problems to explicit parameter types
 * Uses multiple sources to infer types: JSDoc, systemCode, topics, and conventions
 */

import { AlgoProblemDetail, Parameter } from "@/types/algorithm-types";

// Type mapping from JSDoc types to our standard types
const JSDOC_TYPE_MAP: Record<string, string> = {
	"ListNode": "ListNode",
	"TreeNode": "TreeNode",
	"number[]": "number[]",
	"number[][]": "number[][]",
	"string[]": "string[]",
	"number": "number",
	"string": "string",
	"boolean": "boolean",
	"void": "void",
};

// Parameter name conventions for type inference
const TYPE_CONVENTIONS: Record<string, string[]> = {
	ListNode: ["head", "list", "node", "l1", "l2", "list1", "list2", "l"],
	TreeNode: ["root", "p", "q", "node", "tree"],
	"number[]": [
		"nums",
		"arr",
		"array",
		"digits",
		"board",
		"matrix",
		"height",
		"intervals",
		"candidates",
	],
	string: ["s", "str", "string", "haystack", "needle", "t"],
	number: ["k", "target", "n", "m", "val", "x", "y", "i", "j"],
};

export interface TypeInferenceResult {
	parameters: Parameter[];
	returnType?: string;
	confidence: "high" | "medium" | "low";
	source: string; // Which method was used for inference
}

/**
 * Parse JSDoc comments to extract parameter and return types
 */
function parseJSDocTypes(
	startingCode: string
): TypeInferenceResult | null {
	if (!startingCode) return null;

	// Extract JSDoc block
	const jsDocMatch = startingCode.match(/\/\*\*([\s\S]*?)\*\//);
	if (!jsDocMatch) return null;

	const jsDoc = jsDocMatch[1];
	const parameters: Parameter[] = [];
	let returnType: string | undefined;

	// Parse @param {type} name
	const paramRegex = /@param\s+\{([^}]+)\}\s+(\w+)/g;
	let paramMatch;
	while ((paramMatch = paramRegex.exec(jsDoc)) !== null) {
		const jsDocType = paramMatch[1].trim();
		const paramName = paramMatch[2].trim();

		// Map JSDoc type to our standard type
		const mappedType = JSDOC_TYPE_MAP[jsDocType] || jsDocType;

		parameters.push({
			name: paramName,
			type: mappedType,
		});
	}

	// Parse @return {type}
	const returnMatch = jsDoc.match(/@return\s+\{([^}]+)\}/);
	if (returnMatch) {
		const jsDocReturnType = returnMatch[1].trim();
		returnType = JSDOC_TYPE_MAP[jsDocReturnType] || jsDocReturnType;
	}

	if (parameters.length === 0) return null;

	return {
		parameters,
		returnType,
		confidence: "high",
		source: "jsdoc",
	};
}

/**
 * Infer types from systemCode by analyzing conversion functions used
 * @deprecated systemCode is no longer used - this function always returns null
 */
function inferFromSystemCode(
	problem: AlgoProblemDetail
): TypeInferenceResult | null {
	// systemCode is deprecated - return null
	return null;
}

/**
 * Infer type from parameter name using conventions
 */
function inferTypeFromName(
	paramName: string,
	topics: string[]
): string {
	const lowerName = paramName.toLowerCase();

	// Check conventions
	for (const [type, names] of Object.entries(TYPE_CONVENTIONS)) {
		if (names.includes(lowerName)) {
			return type;
		}
	}

	// Topic-based inference
	if (
		topics.some(
			(t) =>
				t.includes("Linked List") ||
				t.toLowerCase().includes("linkedlist")
		)
	) {
		if (TYPE_CONVENTIONS.ListNode.includes(lowerName)) {
			return "ListNode";
		}
	}

	if (
		topics.some(
			(t) =>
				t.includes("Tree") ||
				t.includes("Binary") ||
				t.toLowerCase().includes("tree")
		)
	) {
		if (TYPE_CONVENTIONS.TreeNode.includes(lowerName)) {
			return "TreeNode";
		}
	}

	// Default inference
	// If it looks like an array parameter (plural, common array names)
	if (
		lowerName.endsWith("s") ||
		["nums", "arr", "array", "digits", "board", "matrix"].includes(
			lowerName
		)
	) {
		return "number[]";
	}

	// Default to number for single-letter or common number names
	if (
		["k", "n", "m", "target", "val", "x", "y", "i", "j"].includes(
			lowerName
		)
	) {
		return "number";
	}

	// Default fallback
	return "number[]";
}

/**
 * Infer types from conventions and topics
 */
function inferFromConventions(
	problem: AlgoProblemDetail
): TypeInferenceResult {
	// Infer from function signature in startingCode if available
	const parameters: Parameter[] = [];
	
	// Try to extract parameter names from startingCode
	if (problem.startingCode?.javascript) {
		const code = problem.startingCode.javascript;
		// Try to find function signature
		const funcMatch = code.match(/function\s+\w+\s*\(([^)]*)\)/);
		if (funcMatch) {
			const paramString = funcMatch[1];
			const paramNames = paramString
				.split(",")
				.map((p) => p.trim())
				.filter((p) => p.length > 0);
			paramNames.forEach((name) => {
				parameters.push({
					name,
					type: inferTypeFromName(name, problem.topics),
				});
			});
		}
	}
	
	// Fallback: if no parameters found, return empty result
	if (parameters.length === 0) {
		return {
			parameters: [],
			returnType: undefined,
			confidence: "low",
			source: "conventions",
		};
	}

	// Infer return type from topics or parameter types
	let returnType: string | undefined;

	// If all parameters are ListNode, likely returns ListNode
	if (
		parameters.length > 0 &&
		parameters.every((p) => p.type === "ListNode")
	) {
		returnType = "ListNode";
	} else if (
		parameters.length > 0 &&
		parameters.every((p) => p.type === "TreeNode")
	) {
		returnType = "TreeNode";
	} else if (
		problem.topics.some(
			(t) =>
				t.includes("Linked List") ||
				t.toLowerCase().includes("linkedlist")
		)
	) {
		// Linked list problems often return ListNode
		returnType = "ListNode";
	} else if (
		problem.topics.some(
			(t) =>
				t.includes("Tree") ||
				t.includes("Binary") ||
				t.toLowerCase().includes("tree")
		)
	) {
		// Tree problems might return TreeNode or number[]
		returnType = "number[]"; // Default for tree traversal
	}

	return {
		parameters,
		returnType,
		confidence: "low",
		source: "conventions",
	};
}

/**
 * Main inference function - tries all methods in priority order
 */
export function inferParameterTypes(
	problem: AlgoProblemDetail
): TypeInferenceResult {
	// Priority 1: JSDoc parsing (most reliable)
	if (problem.startingCode?.javascript) {
		const jsDocResult = parseJSDocTypes(
			problem.startingCode.javascript
		);
		if (jsDocResult && jsDocResult.parameters.length > 0) {
			return jsDocResult;
		}
	}

	// Priority 2: SystemCode analysis (deprecated - skip)
	// if (problem.systemCode?.javascript) {
	// 	const systemCodeResult = inferFromSystemCode(problem);
	// 	if (systemCodeResult && systemCodeResult.parameters.length > 0) {
	// 		return systemCodeResult;
	// 	}
	// }

	// Priority 3: Conventions (fallback)
	return inferFromConventions(problem);
}

