/**
 * Centralized type conversion utilities
 * Handles conversion between serialized formats (arrays) and runtime types (ListNode, TreeNode, etc.)
 * This replaces the error-prone systemCode approach with a standardized, maintainable system
 */

// ListNode class definition
class ListNode {
	val: number;
	next: ListNode | null;

	constructor(val?: number, next?: ListNode | null) {
		this.val = val === undefined ? 0 : val;
		this.next = next === undefined ? null : next;
	}
}

// TreeNode class definition
class TreeNode {
	val: number;
	left: TreeNode | null;
	right: TreeNode | null;

	constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
		this.val = val === undefined ? 0 : val;
		this.left = left === undefined ? null : left;
		this.right = right === undefined ? null : right;
	}
}

// _Node class definition (for problems with next pointers like "Populating Next Right Pointers")
class _Node {
	val: number;
	left: _Node | null;
	right: _Node | null;
	next: _Node | null;

	constructor(
		val?: number,
		left?: _Node | null,
		right?: _Node | null,
		next?: _Node | null
	) {
		this.val = val === undefined ? 0 : val;
		this.left = left === undefined ? null : left;
		this.right = right === undefined ? null : right;
		this.next = next === undefined ? null : next;
	}
}

/**
 * Convert array to ListNode (LeetCode format: [1,2,3] -> ListNode chain)
 */
function arrayToListNode(arr: number[]): ListNode | null {
	if (!arr || arr.length === 0) return null;

	const head = new ListNode(arr[0]);
	let current = head;

	for (let i = 1; i < arr.length; i++) {
		current.next = new ListNode(arr[i]);
		current = current.next;
	}

	return head;
}

/**
 * Convert ListNode to array (ListNode chain -> [1,2,3])
 */
function listNodeToArray(head: ListNode | null): number[] {
	const result: number[] = [];
	let current = head;

	while (current !== null) {
		result.push(current.val);
		current = current.next;
	}

	return result;
}

/**
 * Convert array to TreeNode (LeetCode format: [1,2,3] -> Binary Tree)
 * Uses level-order traversal (BFS)
 */
function arrayToTreeNode(arr: (number | null)[]): TreeNode | null {
	if (!arr || arr.length === 0 || arr[0] === null) return null;

	const root = new TreeNode(arr[0]);
	const queue: (TreeNode | null)[] = [root];
	let i = 1;

	while (queue.length > 0 && i < arr.length) {
		const node = queue.shift();

		if (node) {
			// Left child
			if (i < arr.length && arr[i] !== null) {
				node.left = new TreeNode(arr[i] as number);
				queue.push(node.left);
			} else {
				queue.push(null);
			}
			i++;

			// Right child
			if (i < arr.length && arr[i] !== null) {
				node.right = new TreeNode(arr[i] as number);
				queue.push(node.right);
			} else {
				queue.push(null);
			}
			i++;
		}
	}

	return root;
}

/**
 * Convert TreeNode to array (Binary Tree -> [1,2,3])
 * Uses level-order traversal (BFS)
 */
function treeNodeToArray(root: TreeNode | null): (number | null)[] {
	if (!root) return [];

	const result: (number | null)[] = [];
	const queue: (TreeNode | null)[] = [root];

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

/**
 * Convert array to _Node (for problems with next pointers)
 * Input format: [1,2,3,#,4,5,#] where # represents next pointer
 * Uses level-order traversal (BFS), but also handles next pointers
 */
function arrayTo_Node(arr: (number | string | null)[]): _Node | null {
	if (!arr || arr.length === 0 || arr[0] === null) return null;

	const root = new _Node(arr[0] as number);
	const queue: (_Node | null)[] = [root];
	let i = 1;

	while (queue.length > 0 && i < arr.length) {
		const node = queue.shift();

		if (node) {
			// Left child
			if (i < arr.length && arr[i] !== null && arr[i] !== "#") {
				node.left = new _Node(arr[i] as number);
				queue.push(node.left);
			} else {
				queue.push(null);
			}
			i++;

			// Right child
			if (i < arr.length && arr[i] !== null && arr[i] !== "#") {
				node.right = new _Node(arr[i] as number);
				queue.push(node.right);
			} else {
				queue.push(null);
			}
			i++;
		}
	}

	return root;
}

/**
 * Convert _Node to array with next pointer serialization
 * Output format: [1,2,3,#,4,5,#] where # represents next pointer
 * Uses level-order traversal (BFS), inserting # after each level
 */
function _NodeToArray(root: _Node | null): (number | string | null)[] {
	if (!root) return [];

	const result: (number | string | null)[] = [];
	const queue: (_Node | null)[] = [root];

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
		// Add # after each level to represent next pointer
		// Always add # if we processed any nodes in this level (even if next level is empty)
		if (hasNodesInLevel) {
			result.push("#");
		}
	}

	// Remove trailing nulls (but keep # markers as they mark level boundaries)
	while (result.length > 0 && result[result.length - 1] === null) {
		result.pop();
	}
	// Remove trailing # only if it's followed by nothing (shouldn't happen, but safety check)
	if (result.length > 1 && result[result.length - 1] === "#" && result[result.length - 2] === null) {
		result.pop();
	}

	return result;
}

/**
 * Convert _Node-like object to array with next pointer serialization
 * Handles both _Node objects and TreeNode objects that have been modified to have next pointers
 */
function _NodeToArrayFromAny(root: any): (number | string | null)[] {
	if (!root) return [];

	const result: (number | string | null)[] = [];
	const queue: any[] = [root];

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
		// Add # after each level to represent next pointer
		// Always add # if we processed any nodes in this level (even if next level is empty)
		if (hasNodesInLevel) {
			result.push("#");
		}
	}

	// Remove trailing nulls (but keep # markers as they mark level boundaries)
	while (result.length > 0 && result[result.length - 1] === null) {
		result.pop();
	}
	// Remove trailing # only if it's followed by nothing (shouldn't happen, but safety check)
	if (result.length > 1 && result[result.length - 1] === "#" && result[result.length - 2] === null) {
		result.pop();
	}

	return result;
}

/**
 * Convert input value based on parameter type
 */
export function convertInput(value: any, paramType: string): any {
	switch (paramType) {
		case "ListNode":
			if (Array.isArray(value)) {
				return arrayToListNode(value);
			}
			return value; // Already ListNode or null
		case "TreeNode":
			if (Array.isArray(value)) {
				// Reject nested arrays - they indicate an error in input format
				if (value.length > 0 && Array.isArray(value[0])) {
					throw new Error(
						`Invalid TreeNode input: nested array detected. Expected flat array like [1,2,3], but got [[1,2,3]]. Did you accidentally wrap the array in extra brackets?`
					);
				}
				return arrayToTreeNode(value);
			}
			return value; // Already TreeNode or null
		case "_Node":
			if (Array.isArray(value)) {
				return arrayTo_Node(value);
			}
			return value; // Already _Node or null
		case "ListNode[]":
			// Convert array of arrays to array of ListNode objects
			if (Array.isArray(value)) {
				return value.map((arr: any) => {
					if (!Array.isArray(arr) || arr.length === 0) return null;
					return arrayToListNode(arr);
				});
			}
			return value;
		case "TreeNode[]":
			// Convert array of arrays to array of TreeNode objects
			if (Array.isArray(value)) {
				return value.map((arr: any) => {
					if (!Array.isArray(arr) || arr.length === 0 || arr[0] === null) return null;
					return arrayToTreeNode(arr);
				});
			}
			return value;
		case "_Node[]":
			// Convert array of arrays to array of _Node objects
			if (Array.isArray(value)) {
				return value.map((arr: any) => {
					if (!Array.isArray(arr) || arr.length === 0 || arr[0] === null) return null;
					return arrayTo_Node(arr);
				});
			}
			return value;
		case "number[]":
		case "string[]":
			// For arrays, return a shallow clone to prevent shared state
			return Array.isArray(value) ? [...value] : value;
		case "number[][]":
			// For 2D arrays, return a deep clone to prevent shared state
			return Array.isArray(value)
				? value.map((row: any) => (Array.isArray(row) ? [...row] : row))
				: value;
		case "string":
		case "number":
		case "boolean":
			// No conversion needed for primitive types
			return value;
		default:
			// Unknown type, return as-is
			return value;
	}
}

/**
 * Check if value is a ListNode-like object (has val and next properties)
 */
function isListNode(value: any): boolean {
	if (value === null || value === undefined) return true; // null is valid ListNode
	if (typeof value !== "object") return false;
	// Check if it has ListNode-like structure (val and next properties)
	return (
		"val" in value &&
		("next" in value || value.next === null || value.next === undefined)
	);
}

/**
 * Check if value is a TreeNode-like object (has val, left, right properties)
 */
function isTreeNode(value: any): boolean {
	if (value === null || value === undefined) return true; // null is valid TreeNode
	if (typeof value !== "object") return false;
	// Check if it has TreeNode-like structure (val, left, right properties)
	return (
		"val" in value &&
		("left" in value || value.left === null || value.left === undefined) &&
		("right" in value || value.right === null || value.right === undefined)
	);
}

/**
 * Convert ListNode-like object to array
 */
function listNodeToArrayFromAny(head: any): number[] {
	const result: number[] = [];
	let current = head;

	// Handle null/undefined
	if (current === null || current === undefined) {
		return [];
	}

	// Handle if we received an array (shouldn't happen, but handle gracefully)
	if (Array.isArray(current)) {
		return current;
	}

	// Handle case where the head itself has a val that is a ListNode object
	// This can occur if the function incorrectly wraps the ListNode
	// In this case, the actual ListNode chain starts at head.val, not head
	if (
		current &&
		typeof current === "object" &&
		"val" in current &&
		current.val !== undefined &&
		current.val !== null &&
		typeof current.val === "object" &&
		"val" in current.val &&
		!Array.isArray(current.val)
	) {
		// Start traversal from the inner ListNode chain
		current = current.val;
	}

	// Traverse the linked list
	let iterations = 0;
	while (current !== null && current !== undefined) {
		iterations++;
		// Extract val property (handle both direct access and getter)
		const val = current.val !== undefined ? current.val : current.value;

		// Only push if val is a primitive (number, string, etc.), not an object
		if (val !== undefined && val !== null && typeof val !== "object") {
			result.push(val);
		}
		// Move to next node
		current = current.next;
		// Safety check to prevent infinite loops
		if (iterations > 10000) {
			console.warn(
				"ListNode conversion: Very long list detected, breaking"
			);
			break;
		}
	}

	return result;
}

/**
 * Convert TreeNode-like object to array
 */
function treeNodeToArrayFromAny(root: any): (number | null)[] {
	if (!root) return [];

	const result: (number | null)[] = [];
	const queue: any[] = [root];

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

/**
 * Convert output value based on return type
 */
export function convertOutput(value: any, returnType?: string): any {
	if (!returnType) return value;

	switch (returnType) {
		case "ListNode":
			// Always try to convert when returnType is ListNode
			// If it's null or undefined, return empty array
			if (value === null || value === undefined) {
				return [];
			}
			// If it's an array, check if it contains ListNode objects
			if (Array.isArray(value)) {
				// If array is empty, return empty array
				if (value.length === 0) {
					return [];
				}
				// If array contains ListNode objects, extract and convert the first one
				// (since returnType is ListNode, not ListNode[], we expect a single ListNode)
				const firstElement = value[0];
				if (
					firstElement &&
					typeof firstElement === "object" &&
					("val" in firstElement || "next" in firstElement)
				) {
					// It's an array containing ListNode(s), convert the first one
					return listNodeToArrayFromAny(firstElement);
				}
				// Otherwise, it's already an array of values (numbers), return as-is
				return value;
			}
			// If it's an object, try to convert it (assume it's a ListNode)
			if (typeof value === "object") {
				return listNodeToArrayFromAny(value);
			}
			// For primitives, return as-is (shouldn't happen for ListNode return type)
			return value;
		case "TreeNode":
			// Always try to convert when returnType is TreeNode (single TreeNode, not array)
			// If it's null or undefined, return empty array
			if (value === null || value === undefined) {
				return [];
			}
			// If it's already an array, check if it's a TreeNode array representation
			// (already converted) or if it's an array containing TreeNode objects
			if (Array.isArray(value)) {
				// If array is empty, return empty array
				if (value.length === 0) {
					return [];
				}
				// Check if first element is a TreeNode object (has val, left, right properties)
				const firstElement = value[0];
				if (
					firstElement &&
					typeof firstElement === "object" &&
					!("length" in firstElement) && // Not an array
					("val" in firstElement || "left" in firstElement || "right" in firstElement)
				) {
					// It's an array containing TreeNode object(s), convert the first one
					// (since returnType is TreeNode, not TreeNode[], we expect a single TreeNode)
					return treeNodeToArrayFromAny(firstElement);
				}
				// Otherwise, it's already a TreeNode array representation (already converted)
				return value;
			}
			// If it's an object, try to convert it (assume it's a TreeNode)
			if (typeof value === "object") {
				return treeNodeToArrayFromAny(value);
			}
			// For primitives, return as-is (shouldn't happen for TreeNode return type)
			return value;
		case "TreeNode[]":
			// Convert array of TreeNode objects to array of arrays
			if (value === null || value === undefined) {
				return [];
			}
			if (Array.isArray(value)) {
				// Convert each TreeNode in the array to its array representation
				return value.map((treeNode: any) => {
					if (treeNode === null || treeNode === undefined) {
						return [];
					}
					// If it's already an array, return as-is (already converted)
					if (Array.isArray(treeNode)) {
						return treeNode;
					}
					// If it's a TreeNode object, convert it
					if (typeof treeNode === "object") {
						return treeNodeToArrayFromAny(treeNode);
					}
					return treeNode;
				});
			}
			// If it's a single object, wrap it in an array and convert
			if (typeof value === "object") {
				return [treeNodeToArrayFromAny(value)];
			}
			return value;
		case "ListNode[]":
			// Convert array of ListNode objects to array of arrays
			if (value === null || value === undefined) {
				return [];
			}
			if (Array.isArray(value)) {
				// Convert each ListNode in the array to its array representation
				return value.map((listNode: any) => {
					if (listNode === null || listNode === undefined) {
						return [];
					}
					// If it's already an array, return as-is (already converted)
					if (Array.isArray(listNode)) {
						return listNode;
					}
					// If it's a ListNode object, convert it
					if (typeof listNode === "object") {
						return listNodeToArrayFromAny(listNode);
					}
					return listNode;
				});
			}
			// If it's a single object, wrap it in an array and convert
			if (typeof value === "object") {
				return [listNodeToArrayFromAny(value)];
			}
			return value;
		case "_Node":
			// Convert _Node to array with next pointer serialization (# markers)
			// If it's null or undefined, return empty array
			if (value === null || value === undefined) {
				return [];
			}
			// If it's already an array, check if it's a _Node array representation
			if (Array.isArray(value)) {
				// If array is empty, return empty array
				if (value.length === 0) {
					return [];
				}
				// Check if first element is a _Node object (has val, left, right, next properties)
				const firstElement = value[0];
				if (
					firstElement &&
					typeof firstElement === "object" &&
					!("length" in firstElement) && // Not an array
					("val" in firstElement || "left" in firstElement || "right" in firstElement || "next" in firstElement)
				) {
					// It's an array containing _Node object(s), convert the first one
					return _NodeToArrayFromAny(firstElement);
				}
				// Otherwise, it's already a _Node array representation (already converted)
				return value;
			}
			// If it's an object, try to convert it (assume it's a _Node)
			if (typeof value === "object") {
				return _NodeToArrayFromAny(value);
			}

			return value;
		case "number[]":
		case "number[][]":
		case "string":
		case "string[]":
		case "number":
		case "boolean":
		case "void":
			// No conversion needed for primitive types
			return value;
		default:
			// Unknown type, return as-is
			return value;
	}
}

/**
 * Get code string to inject ListNode/TreeNode definitions into execution context
 * This is used when executing user code that may need these classes
 * Uses function constructors (not ES6 classes) to allow calling with or without 'new'
 */
export function getTypeDefinitionsCode(): string {
	return `
function ListNode(val, next) {
	if (!(this instanceof ListNode)) {
		return new ListNode(val, next);
	}
	this.val = val === undefined ? 0 : val;
	this.next = next === undefined ? null : next;
}

function TreeNode(val, left, right) {
	if (!(this instanceof TreeNode)) {
		return new TreeNode(val, left, right);
	}
	this.val = val === undefined ? 0 : val;
	this.left = left === undefined ? null : left;
	this.right = right === undefined ? null : right;
}

function _Node(val, left, right, next) {
	if (!(this instanceof _Node)) {
		return new _Node(val, left, right, next);
	}
	this.val = val === undefined ? 0 : val;
	this.left = left === undefined ? null : left;
	this.right = right === undefined ? null : right;
	this.next = next === undefined ? null : next;
}
	`.trim();
}
