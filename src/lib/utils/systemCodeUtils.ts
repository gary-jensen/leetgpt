/**
 * Utility functions available in systemCode execution context
 * These handle type conversions between test case format (arrays) and data structures (ListNode, TreeNode)
 */

/**
 * ListNode structure for linked list problems
 */
export interface ListNode {
	val: number;
	next: ListNode | null;
}

/**
 * TreeNode structure for binary tree problems
 */
export interface TreeNode {
	val: number;
	left: TreeNode | null;
	right: TreeNode | null;
}

/**
 * Convert an array to a ListNode
 * Example: [1,2,3] -> ListNode{val:1, next:{val:2, next:{val:3, next:null}}}
 */
export function arrayToListNode(arr: number[]): ListNode | null {
	if (arr.length === 0) return null;

	const head: ListNode = { val: arr[0], next: null };
	let current = head;

	for (let i = 1; i < arr.length; i++) {
		current.next = { val: arr[i], next: null };
		current = current.next;
	}

	return head;
}

/**
 * Convert a ListNode to an array
 * Example: ListNode{val:1, next:{val:2, next:null}} -> [1,2]
 */
export function listNodeToArray(head: ListNode | null): number[] {
	if (!head) return [];

	const result: number[] = [];
	let current: any = head;

	while (current !== null && current !== undefined) {
		if (current.val !== undefined) {
			result.push(current.val);
			current = current.next;
		} else {
			break;
		}
	}

	return result;
}

/**
 * Convert an array representation to a TreeNode (level-order traversal)
 * Example: [3,9,20,null,null,15,7] creates a binary tree
 */
export function arrayToTreeNode(arr: (number | null)[]): TreeNode | null {
	if (arr.length === 0 || arr[0] === null) return null;

	const root: TreeNode = { val: arr[0], left: null, right: null };
	const queue: (TreeNode | null)[] = [root];
	let i = 1;

	while (queue.length > 0 && i < arr.length) {
		const node = queue.shift();
		if (!node) continue;

		// Left child
		if (i < arr.length && arr[i] !== null) {
			node.left = { val: arr[i]!, left: null, right: null };
			queue.push(node.left);
		}
		i++;

		// Right child
		if (i < arr.length && arr[i] !== null) {
			node.right = { val: arr[i]!, right: null, left: null };
			queue.push(node.right);
		}
		i++;
	}

	return root;
}

/**
 * Convert a TreeNode to an array (level-order traversal)
 */
export function treeNodeToArray(root: TreeNode | null): (number | null)[] {
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

		if (queue.every((n) => n === null)) {
			break;
		}
	}

	// Remove trailing nulls from the end
	while (result.length > 0 && result[result.length - 1] === null) {
		result.pop();
	}

	return result;
}

/**
 * Get the utilities code string to inject into systemCode execution context
 */
export function getSystemCodeUtilities(): string {
	return `
		// ListNode structure
		function ListNode(val, next) {
			this.val = (val === undefined ? 0 : val);
			this.next = (next === undefined ? null : next);
		}
		
		// TreeNode structure
		function TreeNode(val, left, right) {
			this.val = (val === undefined ? 0 : val);
			this.left = (left === undefined ? null : left);
			this.right = (right === undefined ? null : right);
		}
		
		// Convert array to ListNode
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
		
		// Convert ListNode to array
		function listNodeToArray(head) {
			if (!head) return [];
			const result = [];
			let current = head;
			while (current !== null && current !== undefined) {
				result.push(current.val);
				current = current.next;
			}
			return result;
		}
		
		// Convert array to TreeNode (level-order)
		function arrayToTreeNode(arr) {
			if (arr.length === 0 || arr[0] === null) return null;
			const root = new TreeNode(arr[0]);
			const queue = [root];
			let i = 1;
			while (queue.length > 0 && i < arr.length) {
				const node = queue.shift();
				if (!node) continue;
				if (i < arr.length && arr[i] !== null) {
					node.left = new TreeNode(arr[i]);
					queue.push(node.left);
				}
				i++;
				if (i < arr.length && arr[i] !== null) {
					node.right = new TreeNode(arr[i]);
					queue.push(node.right);
				}
				i++;
			}
			return root;
		}
		
		// Convert TreeNode to array (level-order)
		function treeNodeToArray(root) {
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
				if (queue.every(n => n === null)) break;
			}
			while (result.length > 0 && result[result.length - 1] === null) {
				result.pop();
			}
			return result;
		}
	`;
}
