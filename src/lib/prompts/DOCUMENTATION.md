# Prompts Documentation

This document provides detailed documentation for all OpenAI API prompts used in the BitSchool application.

## Table of Contents

1. [Algorithm Coach Prompts](#algorithm-coach-prompts)
2. [Admin AI Fix Prompts](#admin-ai-fix-prompts)
3. [Problem Generation Prompts](#problem-generation-prompts)
4. [Secondary Code Prompts](#secondary-code-prompts)
5. [AI Feedback Prompts](#ai-feedback-prompts)

---

## Algorithm Coach Prompts

**File:** `algoCoach.ts`

The algorithm coach helps students solve algorithm problems through hints, chat, and submission feedback.

### `getCoachSystemPrompt()`

Returns the system prompt that defines the coach's role and behavior.

**Purpose:** Establishes the AI's persona as a coding mentor that guides without revealing solutions.

**Key Characteristics:**
- Keeps responses short (2-4 sentences max)
- Uses markdown formatting for readability
- Prefers Socratic questions over direct statements
- Never outputs full code unless explicitly requested
- Focuses on guiding students to discover solutions

**Usage:**
```typescript
const systemPrompt = getCoachSystemPrompt();
```

### `buildHintContext(problem, code?, chatHistory?, failureSummary?)`

Builds context for hint generation.

**Parameters:**
- `problem: AlgoProblemDetail` - The algorithm problem details
- `code?: string` - Optional user's current code
- `chatHistory?: ChatMessage[]` - Optional previous conversation messages
- `failureSummary?: string` - Optional summary of test failures

**Returns:** Formatted context string for hint generation

**Usage:**
```typescript
const context = buildHintContext(problem, userCode, chatHistory, failureSummary);
```

### `buildChatContext(problem, userMessage, code?, chatHistory?, testResults?)`

Builds context for chat responses.

**Parameters:**
- `problem: AlgoProblemDetail` - The algorithm problem details
- `userMessage: string` - The user's question/message
- `code?: string` - Optional user's current code
- `chatHistory?: ChatMessage[]` - Optional previous conversation messages
- `testResults?: any[]` - Optional test execution results

**Returns:** Formatted context string for chat responses

**Usage:**
```typescript
const context = buildChatContext(problem, userMessage, code, chatHistory, testResults);
```

### `buildStreamContext(problem, type, userMessage?, code?, chatHistory?, failureSummary?, submissionData?)`

Builds context for streaming chat/hint/submission responses.

**Parameters:**
- `problem: AlgoProblemDetail | null` - The algorithm problem details (optional)
- `type: "chat" | "hint" | "submission"` - Type of request
- `userMessage?: string` - Optional user's question/message
- `code?: string` - Optional user's current code
- `chatHistory?: ChatMessage[]` - Optional previous conversation messages
- `failureSummary?: string` - Optional summary of test failures (for hints)
- `submissionData?: { allPassed: boolean; testsPassed: number; testsTotal: number }` - Optional submission data

**Returns:** Formatted context string

**Usage:**
```typescript
const context = buildStreamContext(
  problem,
  "hint",
  userMessage,
  code,
  chatHistory,
  failureSummary,
  submissionData
);
```

### `buildSubmissionSuccessPrompt(context, optimalityInfo?)`

Builds prompt for submission response when all tests pass.

**Parameters:**
- `context: string` - Base context string
- `optimalityInfo?: string` - Optional optimality review information

**Returns:** Formatted prompt for successful submissions

**Usage:**
```typescript
const prompt = buildSubmissionSuccessPrompt(context, optimalityInfo);
```

### `buildSubmissionFailurePrompt(context, testsPassed, testsTotal)`

Builds prompt for submission response when some tests fail.

**Parameters:**
- `context: string` - Base context string
- `testsPassed: number` - Number of tests that passed
- `testsTotal: number` - Total number of tests

**Returns:** Formatted prompt for failed submissions

**Usage:**
```typescript
const prompt = buildSubmissionFailurePrompt(context, testsPassed, testsTotal);
```

### `buildSubmissionBaseContext(problem, submissionData, code?, chatHistory?)`

Builds base context for submission responses.

**Parameters:**
- `problem: AlgoProblemDetail` - The algorithm problem details
- `submissionData: { allPassed: boolean; testsPassed: number; testsTotal: number; runtime?: number }` - Submission test results
- `code?: string` - Optional user's code
- `chatHistory?: ChatMessage[]` - Optional previous conversation messages

**Returns:** Base context string

**Usage:**
```typescript
const context = buildSubmissionBaseContext(problem, submissionData, code, chatHistory);
```

---

## Admin AI Fix Prompts

**File:** `adminAIFix.ts`

These prompts are used by admins to automatically fix algorithm problems when test cases fail or code has bugs.

### `getAIFixSystemPrompt()`

Returns the system prompt for AI fix generation.

**Purpose:** Instructs the AI on how to analyze and fix problems, emphasizing that test cases must have unique expected outputs.

**Key Characteristics:**
- Expert at fixing algorithm test cases and code
- Ensures every test case has exactly ONE correct answer
- Returns valid JSON

**Usage:**
```typescript
const systemPrompt = getAIFixSystemPrompt();
```

### `buildAIFixUserPrompt(fixPrompt)`

Builds the complete user prompt with JSON format instructions.

**Parameters:**
- `fixPrompt: string` - The detailed fix analysis prompt

**Returns:** Complete user prompt with JSON format instructions

**Usage:**
```typescript
const userPrompt = buildAIFixUserPrompt(fixPrompt);
```

### `buildFixPrompt(problem, language, failedTestCases, secondaryFailedTestCases?)`

Builds the detailed fix analysis prompt.

**Parameters:**
- `problem: AlgoProblemDetail` - The algorithm problem details
- `language: string` - Programming language (e.g., "javascript")
- `failedTestCases: Array<{ case: number; input: any[]; expected: any; actual?: any; error?: string }>` - Array of failed test cases for primary code
- `secondaryFailedTestCases?: Array<{ case: number; input: any[]; expected: any; actual?: any; error?: string }>` - Optional array of failed test cases for secondary code

**Returns:** Detailed prompt for AI to analyze and fix

**Usage:**
```typescript
const fixPrompt = buildFixPrompt(problem, "javascript", failedTestCases, secondaryFailedTestCases);
```

**Fix Types:**
- `"testCases"` - Fix test cases only
- `"passingCode"` - Fix primary passing code only
- `"secondaryPassingCode"` - Fix secondary passing code only
- `"both"` - Fix both test cases and primary code
- `"bothCodes"` - Fix both primary and secondary codes

---

## Problem Generation Prompts

**File:** `problemGeneration.ts`

These prompts are used to generate complete algorithm problems from a problem name, including problem data and test case generator functions.

### `getProblemGenerationSystemPrompt()`

Returns the system prompt for problem data generation.

**Purpose:** Instructs the AI to generate complete, accurate problem data in valid JSON format.

**Usage:**
```typescript
const systemPrompt = getProblemGenerationSystemPrompt();
```

### `buildProblemDataPrompt(problemName, previousError?)`

Builds prompt for generating complete problem data.

**Parameters:**
- `problemName: string` - Name of the problem to generate
- `previousError?: string` - Optional error from previous generation attempt

**Returns:** Complete prompt for problem data generation

**Usage:**
```typescript
const prompt = buildProblemDataPrompt("Two Sum", previousError);
```

**Generated Fields:**
- `slug` - Kebab-case version (e.g., "two-sum")
- `title` - Full problem title
- `order` - Optional number extracted from problem name
- `statementMd` - Problem description in markdown (NO examples or constraints)
- `examplesAndConstraintsMd` - ALL examples and constraints in markdown
- `topics` - Array of topic strings
- `difficulty` - "easy", "medium", or "hard"
- `languages` - ["javascript"]
- `rubric` - Object with `optimal_time` and `acceptable_time`
- `parameters` - Array of { name, type } objects
- `returnType` - String return type
- `functionName` - Function name
- `judge` - Optional judge configuration
- `startingCode` - Object with JSDoc-commented function stub
- `passingCode` - Object with optimal solution
- `outputOrderMatters` - Boolean

**Judge Types:**
1. **"return-value"** (default, usually omitted)
2. **"mutating-array-with-k"** - For problems that mutate array in-place AND return a count
3. **"custom-script"** - For complex validation logic

### `getTestCaseGeneratorSystemPrompt()`

Returns the system prompt for test case generator function generation.

**Purpose:** Instructs the AI to create JavaScript functions that generate test cases, emphasizing strict constraint adherence.

**Key Characteristics:**
- Expert at creating JavaScript functions that generate test cases
- ALL test cases MUST strictly follow problem constraints
- Violating constraints will cause system freezes
- Returns ONLY valid JavaScript function code

**Usage:**
```typescript
const systemPrompt = getTestCaseGeneratorSystemPrompt();
```

### `buildTestCaseGeneratorPrompt(problemData, existingTests, previousError?)`

Builds prompt for generating test case generator function.

**Parameters:**
- `problemData: ProblemGenerationData` - The problem generation data
- `existingTests: TestCase[]` - Existing test cases to avoid duplicates
- `previousError?: string` - Optional error from previous generation attempt

**Returns:** Complete prompt for test case generator function generation

**Usage:**
```typescript
const prompt = buildTestCaseGeneratorPrompt(problemData, existingTests, previousError);
```

**Key Requirements:**
- Function name: `generateTestCases({existingTests, constraints, parameters, passingCode, problemContext})`
- Must strictly follow constraints (extract min/max values, never exceed)
- Generate 80-100 test cases (maximum 100)
- Generate diverse test cases: edge cases, boundary values, typical inputs
- Handle ListNode, TreeNode, _Node conversions
- Handle void return types (output is modified first parameter)
- Return: `[{input: [...], output: ...}]`

---

## Secondary Code Prompts

**File:** `secondaryCode.ts`

These prompts are used to generate non-optimal but correct solutions for algorithm problems.

### `getSecondaryCodeSystemPrompt()`

Returns the system prompt for secondary code generation.

**Purpose:** Instructs the AI to generate non-optimal but correct solutions that pass all test cases.

**Key Characteristics:**
- Expert at writing algorithm solutions
- Generates intentionally suboptimal solutions (e.g., O(n²) instead of O(n))
- Uses brute force instead of elegant solutions when appropriate

**Usage:**
```typescript
const systemPrompt = getSecondaryCodeSystemPrompt();
```

### `buildSecondaryCodeUserPrompt(prompt)`

Builds the complete user prompt with JSON format instructions.

**Parameters:**
- `prompt: string` - The detailed problem prompt

**Returns:** Complete user prompt with JSON format instructions

**Usage:**
```typescript
const userPrompt = buildSecondaryCodeUserPrompt(problemPrompt);
```

**JSON Format:**
```json
{
  "javascript": "function name() { /* non-optimal but correct solution */ }"
}
```

### `buildSecondaryCodePrompt(problem)`

Builds the detailed prompt for secondary code generation.

**Parameters:**
- `problem: AlgoProblemDetail` - The algorithm problem details

**Returns:** Detailed prompt for generating secondary code

**Usage:**
```typescript
const prompt = buildSecondaryCodePrompt(problem);
```

**Includes:**
- Problem title and statement
- Examples and constraints
- Optimal solution (for reference, not to use)
- Sample test cases
- Requirements for non-optimal but correct solution

---

## AI Feedback Prompts

**File:** `aiFeedback.ts`

These prompts are used to provide AI-powered feedback to students working on JavaScript coding exercises.

### `getAIFeedbackSystemPrompt()`

Returns the system prompt for AI feedback generation.

**Purpose:** Establishes the AI as a JavaScript coding tutor that gives specific and brief instructions.

**Usage:**
```typescript
const systemPrompt = getAIFeedbackSystemPrompt();
```

### `buildSyntaxErrorPrompt(stepContent, sanitizedCode, errorMessage)`

Builds prompt for syntax error feedback.

**Parameters:**
- `stepContent: string` - The step/lesson content
- `sanitizedCode: string` - The user's code (sanitized)
- `errorMessage: string` - The error message from execution

**Returns:** Formatted prompt for syntax error feedback

**Usage:**
```typescript
const prompt = buildSyntaxErrorPrompt(stepContent, sanitizedCode, errorMessage);
```

### `buildTestFailurePrompt(stepContent, sanitizedCode, testResults, failedTest)`

Builds prompt for test failure feedback.

**Parameters:**
- `stepContent: string` - The step/lesson content
- `sanitizedCode: string` - The user's code (sanitized)
- `testResults: TestResult[]` - All test results (passed and failed)
- `failedTest: TestResult` - The first failed test result

**Returns:** Formatted prompt for test failure feedback

**Usage:**
```typescript
const prompt = buildTestFailurePrompt(stepContent, sanitizedCode, testResults, failedTest);
```

**Test Types Supported:**
- `consoleLogs` - Console output tests
- `variableAssignment` - Variable assignment tests
- `consoleLogVariable` - Console log variable tests
- `consoleLogPattern` - Console log with regex pattern tests
- `variableReassignment` - Variable reassignment tests
- `function` - Function tests
- `functionCall` - Function call tests
- `functionDeclaration` - Function declaration tests
- `codeContains` - Code regex pattern tests
- `ifStatement` - If statement regex pattern tests
- `forLoop` - For loop regex pattern tests

**Key Features:**
- Provides one sentence hint about what needs to be fixed
- Focuses on the first failed test only
- Looks at ALL test results to understand what's correct vs missing
- Wraps code, numbers, and data in backticks for markdown formatting
- Does not reveal regex patterns to users (they don't know what regex is)

---

## Best Practices

### When Adding New Prompts

1. **Create a function** that takes variables as parameters
2. **Use template literals** to build the prompt string
3. **Add JSDoc documentation** explaining parameters and return values
4. **Export the function** from the appropriate file
5. **Update this documentation** with the new prompt details

### Prompt Design Guidelines

1. **Be specific** - Include clear instructions and examples
2. **Use consistent formatting** - Follow existing patterns for structure
3. **Include constraints** - Specify output format, length limits, etc.
4. **Document variables** - Make it clear what each parameter represents
5. **Keep prompts focused** - Each function should have a single, clear purpose
6. **Handle edge cases** - Consider optional parameters and error scenarios

### Testing Prompts

When modifying prompts:

1. Test with various input combinations
2. Verify output format matches expectations
3. Check that all variables are properly interpolated
4. Ensure prompts work with both empty and populated optional parameters
5. Validate that prompts produce the expected AI behavior

---

## Common Patterns

### System Prompts

System prompts establish the AI's role and behavior. They are typically short and focused on the AI's persona.

```typescript
export function getSystemPrompt(): string {
  return `You are an expert at [task]. [Instructions].`;
}
```

### Context Building

Context building functions assemble information from multiple sources into a coherent prompt.

```typescript
export function buildContext(
  primary: Type1,
  secondary?: Type2,
  optional?: Type3
): string {
  let context = `Primary: ${primary}\n`;
  if (secondary) {
    context += `Secondary: ${secondary}\n`;
  }
  // ... more context building
  return context;
}
```

### User Prompts with Format Instructions

User prompts often include format instructions for structured outputs (JSON, code, etc.).

```typescript
export function buildUserPrompt(data: string): string {
  return `${data}\n\nReturn JSON in this exact format:
{
  "field1": "value1",
  "field2": "value2"
}

CRITICAL RULES:
- Rule 1
- Rule 2
- Rule 3`;
}
```

---

## Version History

- **2024-01-XX** - Initial prompt extraction and organization
- All prompts moved from inline strings to centralized functions
- Comprehensive documentation added

---

## Support

For questions or issues with prompts:

1. Check this documentation first
2. Review the prompt function implementation
3. Test with various inputs to understand behavior
4. Consult the team for prompt design decisions

