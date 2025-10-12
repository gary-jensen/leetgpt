import { ExecutionResult } from "./types";
import { transformUserCode } from "./babelTransform";

// Promise-based code execution - no more useEffect chains!
export class CodeExecutor {
	private iframe: HTMLIFrameElement | null = null;
	private pendingExecutions = new Map<
		string,
		{
			resolve: (result: ExecutionResult) => void;
			reject: (error: Error) => void;
			timeout: NodeJS.Timeout;
		}
	>();

	constructor() {
		// Listen for messages from iframe
		window.addEventListener("message", this.handleMessage.bind(this));
	}

	setIframe(iframe: HTMLIFrameElement) {
		this.iframe = iframe;
	}

	async executeCode(
		code: string,
		runTests: boolean = false
	): Promise<ExecutionResult> {
		if (!this.iframe) {
			throw new Error("No iframe available for code execution");
		}

		return new Promise((resolve, reject) => {
			const messageId = crypto.randomUUID();

			// Set up timeout
			const timeout = setTimeout(() => {
				// Send cancellation message to iframe
				if (this.iframe && this.iframe.contentWindow) {
					this.iframe.contentWindow.postMessage(
						{
							type: "cancel-execution",
							messageId: messageId,
						},
						"*"
					);
				}

				// Wait a moment for the iframe to respond with cancellation message
				setTimeout(() => {
					const pending = this.pendingExecutions.get(messageId);
					if (pending) {
						this.pendingExecutions.delete(messageId);
						// The iframe should have already displayed the timeout message
						// Just resolve with the timeout result
						pending.resolve({
							success: false,
							cancelled: true,
							logs: [], // Logs will be captured from iframe
							result: {},
							tracked: {
								variables: {},
								variableTrace: {},
								functions: {},
							},
						});
					}
				}, 200); // Give iframe 200ms to display message and respond
			}, 5000);

			// Store the promise resolvers
			this.pendingExecutions.set(messageId, { resolve, reject, timeout });

			// Transform the code using Babel before sending to iframe
			let transformedCode;
			try {
				transformedCode = transformUserCode(code);
			} catch (error) {
				// Handle Babel transformation errors (syntax errors)
				clearTimeout(timeout);
				this.pendingExecutions.delete(messageId);

				const errorMessage =
					error instanceof Error
						? error.message
						: "Unknown transformation error";
				resolve({
					success: false,
					error: errorMessage,
					logs: [],
					result: {},
					tracked: {
						variables: {},
						variableTrace: {},
						functions: {},
					},
				});
				return;
			}

			// Extract function names from the original code for global exposure
			// Match both regular functions and arrow functions
			const regularFunctionMatches =
				code.match(/function\s+(\w+)/g) || [];
			const arrowFunctionMatches =
				code.match(
					/(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\w+\s*=>)/g
				) || [];

			const regularFunctionNames = regularFunctionMatches
				.map((match) => {
					// Extract just the function name from "function functionName"
					const nameMatch = match.match(/function\s+(\w+)/);
					return nameMatch ? nameMatch[1] : "";
				})
				.filter((name) => name);

			const arrowFunctionNames = arrowFunctionMatches
				.map((match) => {
					const nameMatch = match.match(/(?:const|let|var)\s+(\w+)/);
					return nameMatch ? nameMatch[1] : "";
				})
				.filter((name) => name);

			const detectedFunctionNames = [
				...regularFunctionNames,
				...arrowFunctionNames,
			];

			// Create iframe content with the transformed code and detected functions
			const iframeContent = this.createIframeContent(
				transformedCode,
				messageId,
				runTests,
				detectedFunctionNames
			);
			if (this.iframe) {
				this.iframe.srcdoc = iframeContent;
			}
		});
	}

	private handleMessage(event: MessageEvent) {
		if (!event.data || typeof event.data !== "object") {
			return;
		}

		const { messageId, type, ...data } = event.data;

		if (!messageId || type !== "execution-complete") {
			return;
		}

		const pending = this.pendingExecutions.get(messageId);
		if (!pending) {
			return;
		}

		// Clear timeout and remove from pending
		clearTimeout(pending.timeout);
		this.pendingExecutions.delete(messageId);

		// Resolve with the result
		if (data.error) {
			// Even with errors, we still want to pass through tracked data
			// Some errors (like sessionStorage) are non-critical
			pending.resolve({
				success: false,
				error: data.error,
				logs: data.logs || [],
				result: data.result,
				tracked: data.tracked, // Include tracked data even with errors
				__bs_tracked: data.__bs_tracked, // Include old system tracked data
				__bs_calls: data.__bs_calls, // Include old system calls data
			});
		} else {
			const resolveData = {
				success: data.success !== false, // Check if execution was successful (not cancelled)
				result: data.result,
				logs: data.logs || [],
				tracked: data.tracked,
				cancelled: data.cancelled || false,
				__bs_tracked: data.__bs_tracked, // Include old system tracked data
				__bs_calls: data.__bs_calls, // Include old system calls data
			};
			pending.resolve(resolveData);
		}
	}

	private createIframeContent(
		code: string,
		messageId: string,
		runTests: boolean,
		detectedFunctionNames: string[] = []
	): string {
		// Enhanced execution with basic variable tracking
		const wrappedCode = `
      <body style="overflow:hidden; margin: 4px;">
        <div id="log" style="font-family: monospace; white-space: pre-wrap; overflow-y: auto; max-height: 100vh; color: white; font-size:15px;"></div>
        <script>
          const logs = [];
          const coloredLogs = []; // Track logs with color information
          const variables = {};
          const variableTrace = {}; // Track variable changes over time
          const functions = {}; // Track declared functions
          const functionCalls = []; // Track function calls with arguments
          const logEl = document.getElementById('log');
          
          // Old system compatibility - track all variable assignments
          const __bs = { tracked: [], calls: [], logs: [] };
          
          // Override console.log to capture output
          const originalLog = console.log;
          const originalError = console.error;
          
          function appendLog(msg, color = 'inherit') {
            const pEl = document.createElement("p");
            pEl.style = \`margin: 0 0 4px 0; color: \${color};\`;
            pEl.textContent = msg;
            logs.push(msg);
            coloredLogs.push({ message: msg, color: color });
            logEl.appendChild(pEl);
            logEl.scrollTop = logEl.scrollHeight;
          }
          
          function appendErrorLog(msg) {
            appendLog(msg, '#ff6b6b'); // Red color for errors/timeouts
          }
          
          console.log = function(...args) {
            // Check for cancellation before logging
            if (cancelled) {
              return; // Don't log anything if cancelled
            }
            const msg = args.join(' ');
            appendLog(msg, 'white');
            return originalLog.apply(console, args);
          };
          
          console.error = function(...args) {
            // Check for cancellation before logging
            if (cancelled) {
              return; // Don't log anything if cancelled
            }
            const msg = "Error: " + args.join(' ');
            appendLog(msg, '#ef4444');
            return originalError.apply(console, args);
          };

          // Deep cloning utility (similar to old console system)
          function deepClone(value) {
            if (value === undefined) return undefined;
            if (value === null) return null;
            if (typeof value === 'function') return '[Function]';
            if (typeof value === 'symbol') return value;
            if (typeof value === 'bigint') return value;
            try {
              return JSON.parse(JSON.stringify(value));
            } catch {
              return value;
            }
          }

          // Helper function to track variable changes (old system compatibility)
          function __bs_track(name, value) {
            // Ensure value is serializable for postMessage
            let serializableValue = value;
            if (value === undefined) {
              serializableValue = '__undefined__';
            } else if (value === null) {
              serializableValue = '__null__';
            } else {
              serializableValue = deepClone(value);
            }
            __bs.tracked.push({ name, value: serializableValue });
          }
          
          // Helper function to track variable changes
          function trackVariable(name, value) {
            if (!variableTrace[name]) {
              variableTrace[name] = [];
            }
            // Clone the value to prevent reference issues
            const clonedValue = deepClone(value);
            variableTrace[name].push(clonedValue);
            variables[name] = clonedValue;
            
            // Also track for old system compatibility
            __bs_track(name, clonedValue);
          }

          // Helper function to track function calls
          function trackFunctionCall(name, args) {
            // Clone the arguments to prevent reference issues
            const clonedArgs = deepClone(args);
            functionCalls.push({ name, args: clonedArgs });
            
            // Also track for old system compatibility
            __bs.calls.push({ name, args: clonedArgs });
          }

          // Global cancellation flag
          let cancelled = false;
          
          // Listen for cancellation messages from parent
          window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'cancel-execution' && event.data.messageId === '${messageId}') {
              cancelled = true;
              // Immediately display timeout message when cancellation is received
              appendErrorLog('Code execution timed out after 5 seconds');
            }
          });
          
          async function executeUserCode() {
            try {
              // Prevent sessionStorage access errors
              try {
                if (typeof Storage !== 'undefined') {
                  // Test sessionStorage access
                  sessionStorage.getItem('test');
                }
              } catch (e) {
                // Ignore sessionStorage errors - they're not critical for our execution
              }
              
              // Code is already transformed by Babel in the main thread
              let codeToExecute = \`${code.replace(/`/g, "\\`")}\`;
              
              // Add code to make functions globally available after they're declared
              // Use the detected function names passed from the main thread
              const passedFunctionNames = ${JSON.stringify(
					detectedFunctionNames
				)};
              
              // Use only the detected function names from regex parsing
              const allFunctionNames = [...new Set(passedFunctionNames)];
              
              const globalAssignments = allFunctionNames.map(name => 
                \`try { if (typeof \${name} !== 'undefined') { window.\${name} = \${name}; } } catch(e) {}\`
              ).join(' ');
              
              codeToExecute += '; ' + globalAssignments;
              
              
              // Execute the transformed code in an async context
              try {
                await eval(\`(async () => { \${codeToExecute} })()\`);
              } catch (executionError) {
                // Check if this is a cancellation due to timeout
                if (cancelled) {
                  // Don't throw the error, just log it and continue with cleanup
                  console.log('Code execution was cancelled due to timeout');
                } else {
                  // Re-throw other execution errors
                  throw executionError;
                }
              }
              
              // Capture any functions that were declared
              // We'll rely on the window scanning below to find all user-defined functions
              
              // Scan window object for any user-defined functions
              const systemFunctions = new Set([
                // Browser APIs
                'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
                'fetch', 'XMLHttpRequest', 'addEventListener', 'removeEventListener',
                // Our internal functions
                'trackVariable', 'trackFunctionCall', 'executeUserCode', 'appendLog', 'appendErrorLog',
                'deepClone',
                // Common globals that aren't user functions
                'console', 'window', 'document', 'location', 'navigator', 'history',
                'localStorage', 'sessionStorage', 'indexedDB',
                'requestAnimationFrame', 'cancelAnimationFrame',
                'postMessage', 'addEventListener', 'removeEventListener'
              ]);
              
              // Directly capture the functions we know we assigned to window
              const expectedFunctions = passedFunctionNames;
              
              expectedFunctions.forEach(name => {
                if (typeof window[name] === 'function') {
                  functions[name] = window[name];
                }
              });
              
              
              // Clean variables object - remove any functions
              const cleanVariables = {};
              for (const name in variables) {
                if (typeof variables[name] !== 'function') {
                  cleanVariables[name] = variables[name];
                }
              }
              
              // Convert functions to serializable format (function names only)
              const serializableFunctions = {};
              for (const name in functions) {
                if (typeof functions[name] === 'function') {
                  serializableFunctions[name] = {
                    name: name,
                    type: 'function',
                    toString: functions[name].toString()
                  };
                }
              }
              
              // Timeout message is already displayed when cancellation is received
              
              const messageData = {
                messageId: '${messageId}',
                type: 'execution-complete',
                result: cleanVariables,
                logs: logs,
                success: !cancelled,
                cancelled: cancelled,
                tracked: { 
                  variables: cleanVariables,
                  variableTrace: variableTrace,
                  functions: serializableFunctions,
                  functionCalls: functionCalls
                },
                // Old system compatibility - return tracked array
                __bs_tracked: __bs.tracked,
                __bs_calls: __bs.calls
              };
              
              // Send results back to parent
              window.parent.postMessage(messageData, '*');
            } catch (error) {
              // Check if this is a sessionStorage error (non-critical)
              const errorMessage = error.message || String(error);
              const isSessionStorageError = errorMessage.includes('sessionStorage') || errorMessage.includes('sandboxed');
              
              // Clean variables object for error cases too
              const errorCleanVariables = {};
              for (const name in variables) {
                if (typeof variables[name] !== 'function') {
                  errorCleanVariables[name] = variables[name];
                }
              }
              
              // Convert functions to serializable format for error cases too
              const errorSerializableFunctions = {};
              for (const name in functions) {
                if (typeof functions[name] === 'function') {
                  errorSerializableFunctions[name] = {
                    name: name,
                    type: 'function',
                    toString: functions[name].toString()
                  };
                }
              }
              
              if (isSessionStorageError) {
                // For sessionStorage errors, still send success with tracked data
                window.parent.postMessage({
                  messageId: '${messageId}',
                  type: 'execution-complete',
                  result: errorCleanVariables,
                  logs: logs,
                  tracked: { 
                    variables: errorCleanVariables,
                    variableTrace: variableTrace,
                    functions: errorSerializableFunctions,
                    functionCalls: functionCalls
                  },
                  __bs_tracked: __bs.tracked,
                  __bs_calls: __bs.calls
                }, '*');
              } else {
                // For other errors, send error but still include tracked data
                console.error(error.message);
                window.parent.postMessage({
                  messageId: '${messageId}',
                  type: 'execution-complete',
                  error: error.message,
                  logs: logs,
                  tracked: { 
                    variables: errorCleanVariables,
                    variableTrace: variableTrace,
                    functions: errorSerializableFunctions,
                    functionCalls: functionCalls
                  },
                  __bs_tracked: __bs.tracked,
                  __bs_calls: __bs.calls
                }, '*');
              }
            }
          }
          
          executeUserCode();
        </script>
      </body>
    `;

		return wrappedCode;
	}

	cleanup() {
		// Clear any pending executions
		this.pendingExecutions.forEach(({ timeout, reject }) => {
			clearTimeout(timeout);
			reject(new Error("CodeExecutor cleanup"));
		});
		this.pendingExecutions.clear();

		window.removeEventListener("message", this.handleMessage.bind(this));
	}
}
