# Test Case Generation Function Approach

## Concept

Instead of having the LLM generate test cases directly (which requires multiple API calls and JSON parsing), have the LLM generate a JavaScript function that can generate test cases programmatically.

## Function Signature

```javascript
function generateTestCases(options) {
	const {
		count, // Number of test cases to generate
		existingTests, // Array of existing test cases to avoid duplicates
		constraints, // Problem constraints (from examplesAndConstraintsMd)
		parameters, // Function parameters [{name, type}]
		passingCode, // The passing code function (already executable)
		problemContext, // Additional context (title, statement, etc.)
	} = options;

	// Generate diverse inputs within constraints
	// Call passingCode to get expected outputs
	// Return: [{input: [...], output: ...}, ...]
}
```

## Implementation Strategy

### Step 1: LLM Generates the Function

```javascript
// Prompt to LLM:
"Generate a JavaScript function that creates test cases for this problem.
The function should:
1. Generate diverse inputs within the problem constraints
2. Call the passing code function to get expected outputs
3. Avoid duplicates from existing tests
4. Return an array of test cases: [{input: [...], output: ...}]

Function signature:
function generateTestCases({count, existingTests, constraints, parameters, passingCode, problemContext}) {
  // Your implementation here
}"
```

### Step 2: Execute the Function

```javascript
// In generateTestCases():
const generatorFunction = extractFunctionFromAIResponse(aiResponse);
const testCases = generatorFunction({
	count: batchSize,
	existingTests,
	constraints: problemData.examplesAndConstraintsMd,
	parameters: problemData.parameters,
	passingCode: userFunction, // Already created from passingCode.javascript
	problemContext: {
		title: problemData.title,
		statement: problemData.statementMd,
	},
});
```

## Edge Cases & Solutions

### ✅ Edge Case 1: Custom Judges (e.g., "Remove Element")

**Problem**: Function needs to check both return value AND modified array

**Solution**:

-   For custom judge problems, still generate test cases directly via LLM (fallback)
-   OR: Have the function generate both the expected return value AND expected array state
-   The judge system already handles this in validation

### ✅ Edge Case 2: In-place Modifications

**Problem**: Function returns `undefined` but modifies input array

**Solution**:

-   The generated function can call passingCode and then return the modified input array
-   Example:

```javascript
const result = passingCode(...input);
const output = result !== undefined ? result : input[0]; // Modified array
```

### ✅ Edge Case 3: Multiple Valid Outputs (N-Queens)

**Problem**: Multiple valid solutions for same input

**Solution**:

-   Function can pick one solution deterministically (e.g., first valid solution)
-   OR: Generate inputs that have unique solutions
-   OR: Return one solution and let validation ensure it's valid

### ✅ Edge Case 4: Complex Constraints

**Problem**: Hard to encode all constraints programmatically

**Solution**:

-   Pass constraints as structured data (from examplesAndConstraintsMd parsing)
-   Function can validate inputs before generating
-   Still validate against passing code (which respects constraints)

### ⚠️ Edge Case 5: Security

**Problem**: Running arbitrary generated code

**Solution**:

-   Already doing this (running user code)
-   Sandbox the function execution
-   Validate function output before using

## Hybrid Approach (Recommended)

1. **For standard problems**: Use function generation (fast, cheap, scalable)
2. **For custom judge problems**: Fall back to direct LLM generation
3. **Always validate**: Run all generated test cases against both passing codes

## Benefits

1. **Speed**: One API call instead of many batches
2. **Cost**: Much cheaper (one call vs 4+ calls for 40 test cases)
3. **Scalability**: Generate as many as needed without API limits
4. **No JSON parsing**: Direct function execution
5. **Deterministic**: Can seed for variety or determinism

## Implementation Example

```typescript
export async function generateTestCaseGenerator(
  problemData: ProblemGenerationData,
  existingTests: TestCase[]
): Promise<{
  success: boolean;
  generatorFunction?: string;
  error?: string;
}> {
  // LLM generates function code
  const prompt = `Generate a JavaScript function that creates test cases...`;
  const aiResponse = await openai.chat.completions.create({...});

  // Extract function from response
  const functionCode = extractFunction(aiResponse);

  return { success: true, generatorFunction: functionCode };
}

export async function generateTestCasesFromFunction(
  generatorFunctionCode: string,
  options: {
    count: number;
    existingTests: TestCase[];
    problemData: ProblemGenerationData;
  }
): Promise<TestCase[]> {
  // Create passing code function
  const passingCodeFn = createFunctionFromCode(
    options.problemData.passingCode.javascript,
    tempProblem
  );

  // Execute generator function
  const generatorFn = new Function(
    'return ' + generatorFunctionCode
  )();

  const testCases = generatorFn({
    count: options.count,
    existingTests: options.existingTests,
    constraints: parseConstraints(options.problemData.examplesAndConstraintsMd),
    parameters: options.problemData.parameters,
    passingCode: passingCodeFn,
    problemContext: {
      title: options.problemData.title,
      statement: options.problemData.statementMd
    }
  });

  return testCases;
}
```
