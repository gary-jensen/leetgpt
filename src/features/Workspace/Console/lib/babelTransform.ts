// @ts-ignore - Babel standalone doesn't have proper TypeScript definitions
import * as Babel from "@babel/standalone";
// @ts-ignore
import * as t from "@babel/types";

// Babel plugin for variable tracking
function createVariableTrackingPlugin() {
	const processedNodes = new WeakSet();

	return {
		visitor: {
			VariableDeclarator(path: any) {
				if (path.node.id.type !== "Identifier") return;

				// Skip if already processed
				if (processedNodes.has(path.node)) return;

				// Skip tracking loop variables in for statements to avoid conflicts
				if (path.findParent((parent: any) => parent.isForStatement())) {
					return;
				}

				const name = path.node.id.name;

				// Mark as processed
				processedNodes.add(path.node);

				// Create tracking call: trackVariable("name", name) or trackVariable("name", undefined)
				const trackExpr = t.callExpression(
					t.identifier("trackVariable"),
					[
						t.stringLiteral(name),
						path.node.init ||
							t.unaryExpression("void", t.numericLiteral(0)), // Use void 0 for undefined
					]
				);
				const stmt = t.expressionStatement(trackExpr);
				processedNodes.add(stmt);

				// Insert after the variable declaration
				path.parentPath.insertAfter(stmt);
			},

			AssignmentExpression(path: any) {
				// Skip if already processed
				if (processedNodes.has(path.node)) return;

				// Track variable assignments: x = 5
				// Skip if this is inside a for loop declaration (handled by VariableDeclarator)
				if (
					path.node.left.type === "Identifier" &&
					!path.findParent((parent: any) => parent.isForStatement())
				) {
					const name = path.node.left.name;

					// Mark as processed
					processedNodes.add(path.node);

					const trackExpr = t.callExpression(
						t.identifier("trackVariable"),
						[t.stringLiteral(name), t.identifier(name)]
					);
					processedNodes.add(trackExpr);

					// Replace assignment with sequence: (x = 5, trackVariable("x", x))
					const newNode = t.sequenceExpression([
						path.node,
						trackExpr,
					]);
					processedNodes.add(newNode);
					path.replaceWith(newNode);
					path.skip();
				}
				// Track member expression assignments: obj.prop = value
				else if (
					path.node.left.type === "MemberExpression" &&
					t.isIdentifier(path.node.left.object) &&
					!path.findParent((parent: any) => parent.isForStatement())
				) {
					const objName = path.node.left.object.name;

					// Mark as processed
					processedNodes.add(path.node);

					// Track the object after property assignment
					const trackExpr = t.callExpression(
						t.identifier("trackVariable"),
						[t.stringLiteral(objName), t.identifier(objName)]
					);
					processedNodes.add(trackExpr);

					// Replace assignment with sequence: (obj.prop = value, trackVariable("obj", obj))
					const newNode = t.sequenceExpression([
						path.node,
						trackExpr,
					]);
					processedNodes.add(newNode);
					path.replaceWith(newNode);
					path.skip();
				}
			},
		},
	};
}

// Babel plugin for function call tracking
function createFunctionCallTrackingPlugin() {
	const processedNodes = new WeakSet();

	return {
		visitor: {
			CallExpression(path: any) {
				// Skip if this node was already processed to prevent infinite recursion
				if (processedNodes.has(path.node)) {
					return;
				}

				// Skip if we're already inside a tracking call to prevent recursion
				if (
					path.parentPath &&
					path.parentPath.isSequenceExpression() &&
					path.parentPath.node.expressions.length === 2 &&
					path.parentPath.node.expressions[1] === path.node &&
					t.isCallExpression(path.parentPath.node.expressions[0]) &&
					t.isIdentifier(
						path.parentPath.node.expressions[0].callee
					) &&
					path.parentPath.node.expressions[0].callee.name ===
						"trackFunctionCall"
				) {
					return;
				}

				// Skip if we're inside arguments of a tracking call
				let current = path;
				while (current.parentPath) {
					if (
						current.parentPath.isCallExpression() &&
						current.parentPath.node.callee &&
						t.isIdentifier(current.parentPath.node.callee) &&
						current.parentPath.node.callee.name ===
							"trackFunctionCall"
					) {
						return;
					}
					current = current.parentPath;
				}

				let functionName: string | undefined;

				// Handle simple function calls: functionName()
				if (t.isIdentifier(path.node.callee)) {
					functionName = path.node.callee.name;

					// Skip internal functions and built-ins
					if (
						[
							"trackVariable",
							"trackFunctionCall",
							"deepClone",
							"appendLog",
							"appendErrorLog",
							"console",
							"setTimeout",
							"setInterval",
							"clearTimeout",
							"clearInterval",
							"Promise",
							"eval",
							"resolve",
							"reject",
							"parseInt",
							"parseFloat",
							"isNaN",
							"isFinite",
							"encodeURI",
							"decodeURI",
							"Math",
							"Date",
							"Array",
							"Object",
							"String",
							"Number",
							"Boolean",
						].includes(functionName!)
					) {
						return;
					}
				}
				// Handle method calls: obj.method() - track array methods with proper recursion guards
				else if (
					t.isMemberExpression(path.node.callee) &&
					t.isIdentifier(path.node.callee.property)
				) {
					functionName = path.node.callee.property.name;
					const obj = path.node.callee.object;

					// Only track specific array methods
					if (
						t.isIdentifier(obj) &&
						[
							"push",
							"pop",
							"shift",
							"unshift",
							"splice",
							"sort",
							"reverse",
						].includes(functionName!)
					) {
						// Skip if already processed
						if (processedNodes.has(path.node)) return;

						// Skip methods with complex arguments (like arrow functions) for now
						const hasComplexArgs = path.node.arguments.some(
							(arg: any) =>
								t.isArrowFunctionExpression(arg) ||
								t.isFunctionExpression(arg)
						);

						if (hasComplexArgs) {
							// Skip methods with complex arguments to avoid transformation issues
							return; // Don't transform methods with function arguments
						}

						// Mark as processed immediately to prevent recursion
						processedNodes.add(path.node);

						// Track both the method call and the variable state after mutation
						const objName = obj.name;

						const trackCallExpr = t.callExpression(
							t.identifier("trackFunctionCall"),
							[
								t.stringLiteral(functionName!),
								t.arrayExpression(
									path.node.arguments.map((arg: any) =>
										t.cloneNode(arg)
									)
								),
							]
						);
						processedNodes.add(trackCallExpr);

						// Track the variable state after the method call
						const trackVarExpr = t.callExpression(
							t.identifier("trackVariable"),
							[t.stringLiteral(objName), t.identifier(objName)]
						);
						processedNodes.add(trackVarExpr);

						// Sequence: (trackFunctionCall("push", [args]), originalCall, trackVariable("numbers", numbers))
						const newNode = t.sequenceExpression([
							trackCallExpr,
							path.node,
							trackVarExpr,
						]);
						processedNodes.add(newNode);
						path.replaceWith(newNode);
						path.skip(); // Critical: skip traversing children
					}
					return; // Don't track other method calls (console.log, etc.)
				}

				if (!functionName) return;

				// Mark this node as processed to prevent infinite recursion
				processedNodes.add(path.node);

				// Create tracking call: trackFunctionCall("functionName", [args])
				const trackExpr = t.callExpression(
					t.identifier("trackFunctionCall"),
					[
						t.stringLiteral(functionName!),
						t.arrayExpression(
							path.node.arguments.map((arg: any) =>
								t.cloneNode(arg)
							)
						),
					]
				);

				// Mark the tracking call to prevent it from being processed
				processedNodes.add(trackExpr);

				// Replace with sequence expression: (trackFunctionCall(...), originalCall)
				const newNode = t.sequenceExpression([trackExpr, path.node]);
				processedNodes.add(newNode);
				path.replaceWith(newNode);

				// Skip traversing children to prevent recursion
				path.skip();
			},
		},
	};
}

// Babel plugin for loop yield points
function createLoopYieldPlugin() {
	return {
		visitor: {
			ForStatement(path: any) {
				// Inject yield point at the beginning of the loop body
				const yieldExpr = t.awaitExpression(
					t.newExpression(t.identifier("Promise"), [
						t.arrowFunctionExpression(
							[t.identifier("resolve")],
							t.callExpression(t.identifier("setTimeout"), [
								t.identifier("resolve"),
								t.numericLiteral(0),
							])
						),
					])
				);

				// Add cancellation check
				const cancelCheck = t.ifStatement(
					t.identifier("cancelled"),
					t.breakStatement()
				);

				const yieldStmt = t.expressionStatement(yieldExpr);

				if (t.isBlockStatement(path.node.body)) {
					path.node.body.body.unshift(cancelCheck, yieldStmt);
				} else {
					path.node.body = t.blockStatement([
						cancelCheck,
						yieldStmt,
						t.expressionStatement(path.node.body),
					]);
				}
			},

			WhileStatement(path: any) {
				// Similar to ForStatement
				const yieldExpr = t.awaitExpression(
					t.newExpression(t.identifier("Promise"), [
						t.arrowFunctionExpression(
							[t.identifier("resolve")],
							t.callExpression(t.identifier("setTimeout"), [
								t.identifier("resolve"),
								t.numericLiteral(0),
							])
						),
					])
				);

				const cancelCheck = t.ifStatement(
					t.identifier("cancelled"),
					t.breakStatement()
				);

				const yieldStmt = t.expressionStatement(yieldExpr);

				if (t.isBlockStatement(path.node.body)) {
					path.node.body.body.unshift(cancelCheck, yieldStmt);
				} else {
					path.node.body = t.blockStatement([
						cancelCheck,
						yieldStmt,
						t.expressionStatement(path.node.body),
					]);
				}
			},

			DoWhileStatement(path: any) {
				// Similar to ForStatement and WhileStatement
				const yieldExpr = t.awaitExpression(
					t.newExpression(t.identifier("Promise"), [
						t.arrowFunctionExpression(
							[t.identifier("resolve")],
							t.callExpression(t.identifier("setTimeout"), [
								t.identifier("resolve"),
								t.numericLiteral(0),
							])
						),
					])
				);

				const cancelCheck = t.ifStatement(
					t.identifier("cancelled"),
					t.breakStatement()
				);

				const yieldStmt = t.expressionStatement(yieldExpr);

				if (t.isBlockStatement(path.node.body)) {
					path.node.body.body.unshift(cancelCheck, yieldStmt);
				} else {
					path.node.body = t.blockStatement([
						cancelCheck,
						yieldStmt,
						t.expressionStatement(path.node.body),
					]);
				}
			},
		},
	};
}

// Main transformation function
export function transformUserCode(code: string): string {
	try {
		// For simple for loops, let's be more conservative and skip some transformations
		const isSimpleForLoop = /^\s*for\s*\(\s*let\s+\w+\s*=/.test(code);

		const plugins = [];

		// Always add function call tracking and loop yield points
		plugins.push(createFunctionCallTrackingPlugin());
		plugins.push(createLoopYieldPlugin());

		// Always add variable tracking - we need it for variable assignment tests
		plugins.push(createVariableTrackingPlugin());

		const result = Babel.transform(code, {
			plugins,
			parserOpts: {
				allowAwaitOutsideFunction: true,
				allowReturnOutsideFunction: true,
			},
		});

		return result.code || code;
	} catch (error) {
		// console.error("Babel transformation error:", error);
		// console.error("Original code:", code);
		// Fallback to original code if transformation fails
		return code;
	}
}
