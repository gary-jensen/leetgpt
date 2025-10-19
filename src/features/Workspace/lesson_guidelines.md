# BitSchool Lesson Guidelines

## Overview

BitSchool is a hands-on coding platform designed to teach beginners programming through doing first, explaining second.
Every lesson is made of small, focused steps that let learners build confidence through repetition, action, and gradual independence.

Please keep the type structures in mind, test-types.ts and lesson-types.ts

Each lesson contains multiple steps.
Each step:

Displays short content (instruction or explanation) - **SUPPORTS MARKDOWN**

Can include startingCode (optional)

Includes tests (not optional)
All teaching, explanation, and reflection must be written into the lesson content itself.

Hints and feedback for failed tests are provided by AI

Each step must have a question, so I would recommend ending a lesson with a challenge that the user should 100% understand. You could technically explain the challenge in the next lesson, but I'd advise not doing it.

## 📝 Markdown Content System

BitSchool now supports rich markdown formatting in lesson content. All `content` properties in lesson steps can use markdown syntax for enhanced readability and visual appeal.

### Supported Markdown Features

#### Text Formatting

-   **Bold text**: `**bold**` or `__bold__`
-   _Italic text_: `*italic*` or `_italic_`
-   ~~Strikethrough~~: `~~strikethrough~~`
-   ^Superscript^: `^superscript^`
-   ~Subscript~: `~subscript~`

#### Headings

-   `# Heading 1`
-   `## Heading 2`
-   `### Heading 3`
-   `#### Heading 4`
-   `##### Heading 5`
-   `###### Heading 6`

#### Code

-   `Inline code`: Use backticks around code
-   Code blocks with syntax highlighting:
    ```javascript
    function example() {
    	console.log("Hello World!");
    }
    ```

#### Lists

-   Unordered lists: `- Item` or `* Item` or `+ Item`
-   Ordered lists: `1. Item`
-   Nested lists supported with proper indentation

#### Blockquotes

-   `> This is a blockquote`
-   Great for highlighting important information or tips

#### Horizontal Rules

-   `---` for section breaks

#### Color Highlighting

-   Background highlighting: `==yellow:highlighted text==`
-   Text color: `@@red:colored text@@`
-   Supported colors: red, blue, green, yellow, orange, purple, pink, gray, black, white, cyan, and hex codes

#### Character Escaping

-   Use HTML entities to display markdown characters literally:
    -   `&#42;` for asterisk (\*)
    -   `&#35;` for hash (#)
    -   `&#95;` for underscore (\_)
    -   `&#126;` for tilde (~)
    -   `&#96;` for backtick (`)
    -   `&#124;` for pipe (|)
    -   `&#94;` for caret (^)

### Markdown Best Practices for Lessons

1. **Use headings to structure content**:

    - `#` for main lesson titles
    - `##` for major sections
    - `###` for subsections

2. **Highlight important code with backticks**:

    - Use `console.log()` for function names
    - Use `"Hello World"` for strings
    - Use `let variableName` for variable declarations

3. **Use blockquotes for tips and important notes**:

    ```
    > 💡 **Tip**: Remember to use semicolons at the end of statements!
    ```

4. **Use color highlighting sparingly**:

    - `==yellow:Important==` for key concepts
    - `@@red:Error@@` for common mistakes to avoid

5. **Structure lists for step-by-step instructions**:

    ```
    To create a variable:
    1. Use the `let` keyword
    2. Choose a descriptive name
    3. Use `=` to assign a value
    ```

6. **Use horizontal rules for clear section breaks**:

    ```
    ## Basic Syntax
    Content here...

    ---

    ## Next Steps
    More content...
    ```

### Markdown Processing

The markdown content is processed by BitSchool's custom markdown processor which:

-   **Converts markdown to HTML** for display in the lesson interface
-   **Applies syntax highlighting** to code blocks using Monaco editor colors
-   **Preserves character escaping** for special markdown characters
-   **Supports custom color highlighting** with background and text colors
-   **Maintains proper spacing and formatting** for readability

**Processing Order:**

1. Character codes are protected from markdown processing
2. Code blocks are processed with syntax highlighting
3. Headers, lists, and other block elements are converted
4. Text formatting (bold, italic, etc.) is applied
5. Color highlighting is processed
6. Paragraphs are wrapped appropriately

**Note**: The markdown processor is designed to work seamlessly with BitSchool's lesson display system, ensuring consistent formatting across all lesson content.

### Migrating Existing Lessons to Markdown

If you have existing lessons with plain text content, you can gradually migrate them to use markdown:

**Before (Plain Text):**

```javascript
{
  id: "step1",
  content: "Let's start simple. Type this code and run it: console.log('Hello, world!')",
  tests: [...]
}
```

**After (Markdown):**

````javascript
{
  id: "step1",
  content: "## 🚀 Let's Start Simple\n\nType this code and run it:\n\n```javascript\nconsole.log('Hello, world!')\n```",
  tests: [...]
}
````

**Migration Tips:**

-   Start with the most important lessons first
-   Add headings to break up long content
-   Use code blocks for multi-line code examples
-   Add blockquotes for important tips and warnings
-   Use color highlighting sparingly for key concepts
-   Test the markdown rendering to ensure it looks good

**Backward Compatibility:**

-   Existing plain text content will still work
-   Markdown is processed automatically when detected
-   No breaking changes to existing lesson structure

## 🧪 Testing System

BitSchool features a comprehensive testing system that validates student code execution and learning outcomes. All lesson steps **must include tests** to ensure students understand the concepts.

### Test Execution Process

1. **Code Execution**: Student code runs in a sandboxed iframe environment
2. **Variable Tracking**: All variable assignments and changes are tracked
3. **Function Monitoring**: Function declarations and calls are captured
4. **Console Output**: All `console.log()` statements are captured
5. **Test Validation**: Each test validates specific aspects of the code
6. **Result Reporting**: Detailed feedback is provided for each test

### Available Test Types

#### 1. **Console Output Tests**

**`consoleLogs`** - Validates console output against expected patterns:

```javascript
{
  type: "consoleLogs",
  expectedOutput: ["Hello, world!", "42"],
  negated: false // Optional: if true, ensures these outputs DON'T appear
}
```

**`consoleLogPattern`** - Index-based console validation with code pattern matching.
expectedOutput is tested against the logs, and pattern is tested against the code:

```javascript
{
  type: "consoleLogPattern",
  expectedOutput: "Hello, world!",
  pattern: /console\.log\("Hello, world!"\)/ // Regex to match in code
}
```

**`consoleLogVariable`** - Ensures variables are logged (not hardcoded values)
Checks code to make sure variable is used inside the console.log:

```javascript
{
  type: "consoleLogVariable",
  expectedOutput: "42",
  variableName: "answer" // Specific variable to check
}
```

#### 2. **Variable Tests**

**`variableAssignment`** - Checks initial variable assignment
expected should be "\_\_undefined\_\_" if checking no initial assigned value:

```javascript
{
  type: "variableAssignment",
  variableName: "favoriteNumber",
  expectedValue: { expected: 300 }
}
```

**`variableReassignment`** - Validates variable reassignment with method checking:

```javascript
{
  type: "variableReassignment",
  variable: "count",
  expectedValue: 8,
  method: {
    operator: "+=",
    operand: 3
  }
}
```

#### 3. **Function Tests**

**`functionDeclaration`** - Validates function structure:

```javascript
{
  type: "functionDeclaration",
  functionName: "greet",
  parameters: ["name"],
  functionType: "arrow" // OPTIONAL: "arrow", "regular" (default is "regular")
}
```

**`functionCall`** - Tracks function calls and arguments. Each sub array in expectedArgs is the set of args for each call:

```javascript
{
  type: "functionCall",
  functionName: "greet",
  expectedCount: 2, // Optional, default 1
  expectedArgs: [["Alice"], ["Bob"]] // Optional (for no args)
}
```

**`function`** - LeetCode-style function testing that calls the function with test cases and validates both return values and console output. Both return output and console logs are optional, but provide at least one (or both) or the test does nothing.
This test type calls the function outside of the user sandbox:

```javascript
{
  type: "function",
  functionName: "add",
  testCases: [
    {
      input: [2, 3],
      output: 5, // Optional: Expected return value
      consoleTest: { // Optional: test console output during function execution
        expectedOutput: ["Adding 2 and 3"],
        negated: false
      }
    },
    {
      input: [10, -5],
      output: 5,
      consoleTest: {
        expectedOutput: ["Adding 10 and -5"]
      }
    }
  ]
}
```

#### 4. **Code Structure Tests**

**`codeContains`** - Validates code contains specific patterns. Avoid at all costs. Only use as last resort:

```javascript
{
  type: "codeContains",
  pattern: "\\blet\\b", // Regex pattern
  caseSensitive: true, // Optional (default: false)
  negated: false // Optional: if true, ensures pattern is NOT found
}
```

**`ifStatement`** - Validates if statement structure:

```javascript
{
  type: "ifStatement",
  pattern: "score\\s*>\\s*80", // Condition pattern
  bodyPattern: "console\\.log\\(.*Great.*\\)", // Optional pattern for contents inside the body block
  elsePattern: "console\\.log\\(.*Try again.*\\)" // Optional pattern for contents inside else block
}
```

**`forLoop`** - Validates for loop structure:

```javascript
{
  type: "forLoop",
  pattern: "i\\s*<\\s*10" // Loop condition pattern
}
```

### Test Best Practices

Any use of regex patterns, if you are checking strings use (["']) paired with the appropriate selection group numeric reference like \1
This way the user can use either quote type of their choice
Example:

```javascript
{
  type: "consoleLogPattern",
  expectedOutput: "John Doe",
  pattern: /(["'])John\1\s*,\s*(["'])Doe\2/,
},
```

#### **Variable Testing**

```javascript
// Test initial assignment
{
  type: "variableAssignment",
  variableName: "name",
  expectedValue: { expected: "Alice" }
}

// Test reassignment with method
{
  type: "variableReassignment",
  variable: "count",
  expectedValue: 15,
  method: { operator: "+=", operand: 5 }
}
```

#### **Function Testing**

```javascript
// Test function declaration
{
  type: "functionDeclaration",
  functionName: "add",
  parameters: ["a", "b"]
}

// Test function calls
{
  type: "functionCall",
  functionName: "add",
  expectedCount: 1,
  expectedArgs: [[5, 3]]
}

// LeetCode-style function testing (most comprehensive)
{
  type: "function",
  functionName: "calculateArea",
  testCases: [
    {
      input: [5, 3],
      output: 15, // Return value
      consoleTest: {
        expectedOutput: ["Calculating area: 5 * 3"]
      }
    },
    {
      input: [10, 0],
      output: 0,
      consoleTest: {
        expectedOutput: ["Calculating area: 10 * 0"]
      }
    }
  ]
}
```

#### **Code Structure Testing**

```javascript
// Test specific syntax usage (do not use)
{
  type: "codeContains",
  pattern: "\\blet\\b",
  caseSensitive: true
}

// Test control flow
{
  type: "ifStatement",
  pattern: "age\\s*>=\\s*18",
  elsePattern: "console\\.log\\(.*Minor.*\\)"
}
```

### Test Execution Environment

**Sandboxed Execution:**

-   Code runs in isolated iframe environment
-   5-second timeout protection
-   Variable and function tracking
-   Console output capture
-   Error handling and reporting
-   Allows prompt() and alert()

**Variable Tracking:**

-   All `let`, `const`, and `var` declarations tracked
-   Variable reassignments monitored
-   Deep equality checking for complex values
-   Support for undefined/null/not assigned values

**Function Monitoring:**

-   Function declarations captured (both arrow and regular)
-   Function calls tracked with arguments
-   Global function exposure for testing
-   Serialization for cross-frame communication

### Common Test Patterns

```javascript
// Step 1: Basic console output
{
  type: "consoleLogs",
  expectedOutput: ["Hello, world!"]
}

// Step 2: Variable assignment
{
  type: "variableAssignment",
  variableName: "name",
  expectedValue: { expected: "Alice" }
}

// Step 3: Variable logging
{
  type: "consoleLogVariable",
  expectedOutput: "Alice",
  variableName: "name"
}
```

```javascript
// Function declaration
{
  type: "functionDeclaration",
  functionName: "greet",
  parameters: ["name"],
  functionType: "regular"
}

// Function call
{
  type: "functionCall",
  functionName: "greet",
  expectedCount: 1,
  expectedArgs: [["Alice"]]
}

// Console output from function
{
  type: "consoleLogs",
  expectedOutput: ["Hello, Alice"]
}
```

```javascript
// Comprehensive function testing
{
  type: "function",
  functionName: "fibonacci",
  testCases: [
    {
      input: [0],
      output: 0
    },
    {
      input: [1],
      output: 1
    },
    {
      input: [5],
      output: 5
    },
    {
      input: [10],
      output: 55
    }
  ]
}

// Function with console output validation
{
  type: "function",
  functionName: "bubbleSort",
  testCases: [
    {
      input: [[3, 1, 4, 1, 5]],
      output: [1, 1, 3, 4, 5],
      consoleTest: {
        expectedOutput: ["Sorting array: 3,1,4,1,5", "Pass 1 complete", "Array sorted!"]
      }
    }
  ]
}
```

```javascript
// Complex if statement
{
  type: "ifStatement",
  pattern: "score\\s*>=\\s*90",
  bodyPattern: "console\\.log\\(.*A.*\\)",
  elseIfPatterns: [
    { condition: "score\\s*>=\\s*80", body: "console\\.log\\(.*B.*\\)" }
  ],
  elsePattern: "console\\.log\\(.*F.*\\)"
}

// For loop structure
{
  type: "forLoop",
  pattern: "i\\s*<\\s*10"
}
```

### Function Test Advantages

The `function` test type offers several advantages over other test types:

#### **1. Comprehensive Validation**

-   Tests both return values AND console output
-   Validates function behavior, not just structure
-   Can test multiple scenarios with different inputs

#### **2. LeetCode-Style Testing**

-   Perfect for algorithm and data structure lessons
-   Tests edge cases and boundary conditions
-   Provides immediate feedback on correctness

#### **3. Real Function Execution**

-   Actually calls the function with test inputs
-   Validates that the function works as intended
-   Catches runtime errors and logic mistakes

#### **4. Flexible Test Cases**

```javascript
// Can test multiple scenarios
{
  type: "function",
  functionName: "isEven",
  testCases: [
    { input: [2], output: true },
    { input: [3], output: false },
    { input: [0], output: true },
    { input: [-2], output: true }
  ]
}

// Can test console output during execution
{
  type: "function",
  functionName: "debugFunction",
  testCases: [
    {
      input: [5],
      output: 25,
      consoleTest: {
        expectedOutput: ["Input: 5", "Calculating...", "Result: 25"]
      }
    }
  ]
}
```

#### **5. When to Use Function Tests vs Other Types**

| Use Function Tests When:         | Use Other Tests When:        |
| -------------------------------- | ---------------------------- |
| Testing algorithm implementation | Testing basic syntax         |
| Validating return values         | Testing variable assignments |
| Multiple test scenarios needed   | Testing console output only  |
| Complex logic validation         | Testing function calls       |
| LeetCode-style problems          | Testing code structure       |

### Test Design Principles

#### **Test What Matters**

-   Focus on learning objectives, not syntax minutiae (like single or double quotes)
-   Test conceptual understanding over exact formatting
-   Validate student intent, not just output

#### **Multiple Validation Layers**

```javascript
// Test both code structure and behavior
[
	{
		type: "functionDeclaration",
		functionName: "add",
		parameters: ["a", "b"],
		functionType: "arrow",
	},
	{
		type: "functionCall",
		functionName: "add",
		expectedCount: 1,
		expectedArgs: [[5, 3]],
	},
	{
		type: "consoleLogs",
		expectedOutput: ["8"],
	},
];
```

## 🎯 BitSchool's Teaching Philosophy

1. Do First, Explain Second

The learner’s first interaction should always be hands-on.
They type, run, and see something happen — then the next step explains why it worked.

Example:

Step 1: “Type this code and run it.”

Step 2: “This code prints text using console.log(). The quotes tell JavaScript it’s text, not a variable.”

This rhythm creates engagement and curiosity.
Each step either acts or explains — never both at once.

2. Node-Based Progression

Each skillNodeId (node) represents a core topic, such as "variables", "loops", or "conditionals".
Nodes are self-contained chapters — never assume knowledge from other nodes.

Within a node:

Lesson 1: Show and guide (explicit instructions)

Lesson 2: Guide and ask (expect recall with small help)

Lesson 3: Ask and challenge (learner applies independently)

This creates a smooth curve: from full guidance → to practice → to mastery.

3. Lesson Design

Each lesson focuses on one clear learning goal.
It should contain 2–6 steps, where each step either:

Gives a task to complete, or

Explains what just happened.

A simple, effective pattern:

Action step: “Type this and run it.”

Explanation step: “Here’s what that did.”

Guided step: “Now try changing this part.”

Challenge step: “Now do it yourself.”

Lessons should feel like a conversation that builds momentum — not a textbook.

4. Step Content Rules

Each step’s content should be:

Short: 1–3 sentences max.

Conversational: Write how you’d talk to a beginner.

Sequential: Don’t mix actions and explanations.

Focused: One new idea or instruction per step.

### Example Lesson Steps with Markdown

Here are examples showing how to use markdown in lesson content:

````javascript
{
id: "step1",
  content: "## 🚀 Let's Start Simple\n\nType this code and run it:\n\n```javascript\nconsole.log(\"Hello, world!\")\n```",
startingCode: 'console.log("Hello, world!")',
tests: [...]
},
{
id: "step2",
  content: "## ✅ Great Job!\n\nThat line printed text using `console.log()`. The text inside quotes is called a **string**.\n\n> 💡 **Key Point**: Strings are text data that JavaScript can display and manipulate.",
  tests: [...]
},
{
id: "step3",
  content: "## 🎯 Your Turn\n\nNow log your name instead of `'Hello, world!'`.\n\n**Hint**: Replace the text between the quotes with your name!",
  tests: [...]
}
````

### Advanced Markdown Examples

**Complex lesson step with multiple markdown features:**

```javascript
{
  id: "step-advanced",
  content: `## 🔥 Advanced Variables

Let's learn about **variable reassignment**!

### What You'll Do:
1. Create a variable called \`score\`
2. Set it to \`100\` initially
3. **Reassign** it to \`150\` using \`+=\`

> ⚠️ **Important**: \`+=\` adds to the existing value, so \`score += 50\` means "add 50 to score"

\`\`\`javascript
let score = 100
score += 50
console.log(score)
\`\`\`

---

**Expected output**: \`150\` (because 100 + 50 = 150)`,
  tests: [...]
}
```

**Step with color highlighting and lists:**

```javascript
{
  id: "step-colors",
  content: `## 🎨 Working with Colors

JavaScript can handle different data types:

- ==yellow:**Numbers**==: \`42\`, \`3.14\`, \`-10\`
- ==green:**Strings**==: \`"Hello"\`, \`'World'\`, \`\`\`"JavaScript"\`\`\`
- ==blue:**Booleans**==: \`true\`, \`false\`

> 💡 **Remember**: Numbers don't need quotes, but strings do!

Try logging each type:

\`\`\`javascript
console.log(42)        // Number
console.log("Hello")   // String
console.log(true)      // Boolean
\`\`\``,
tests: [...]
}
```

5. Explanations

Explanations must be part of the next step’s content, never mixed with instructions.

Always connect the explanation to what the learner just did.

Keep explanations short and practical — focus on why it matters or what it does, not deep theory.

Example:

“That worked because let creates a variable — a place to store data in memory.”

If a concept is too complex for one step, introduce it gradually across several lessons within the same node.

6. Difficulty Progression (Within Each Node)

Difficulty scales within each node (chapter), not across the entire course.

Pattern for each node:

Lesson 1 — Show: Give full examples. Learner copies code exactly.

Lesson 2 — Guide: Ask learner to reproduce or modify existing patterns.

Lesson 3 — Challenge: Ask the learner to solve small tasks without showing the answer.

This creates a rhythm of familiar → guided → independent learning.
Avoid large jumps in complexity — always build on what was just learned.

7. Tests

Tests are used to check understanding and ensure success.
They should:

Focus on verifying outcomes, not formatting.

Be forgiving of valid variations.

Match the intent of the step (e.g., logging text, assigning a variable, etc.).

Tests are not meant to trick or grade harshly — they exist to validate learning.

8. XP and Rewards

Each lesson grants XP:

xpReward: total XP for finishing the lesson

stepXpReward: XP per completed step

XP creates a feedback loop that motivates consistency and small wins.
Lesson pacing should encourage users to think:

“I can do one more.”

9. Tone and Voice

Write in a friendly, supportive, and clear tone.

Avoid sounding academic or overly formal.

Use simple English and short sentences.

Encourage the learner with natural phrasing, not gamified fluff.

Good:

“Nice! You just made your first variable. Let’s see what happens if we change its value.”

Bad:

“Congratulations, you have successfully instantiated your first identifier.”

Keep the user feeling capable — never overwhelmed.

10. BitSchool’s Learning Style

BitSchool’s difference is its momentum-first approach:

You start coding immediately.

You see results instantly.

You understand concepts as you use them.

You grow through repetition and guided independence.

It’s not about memorizing syntax — it’s about building real confidence through small wins.

If a learner ends a lesson thinking:

“That was simple, and I actually learned something.”
then the lesson did its job.

## Increasing Engagement and Perceived Value (Alex Hormozi's Value Equation)

1. Show the “Dream Outcome” Early

Each lesson should remind learners what skill they’re unlocking and how it connects to something real or exciting.

Begin steps or lessons with small “what this enables you to do” teasers.

Frame tasks as creative actions, not chores.

Examples:

“By the end of this lesson, you’ll be printing your own messages to the console — the first step every real programmer takes.”

“You’re about to learn how to store information — the same idea used in every app you’ve ever used.”

👉 Goal: Connect every step to something they’ll be proud to say they can now do.

2. Raise Perceived Likelihood of Achievement

Tell the user exactly what success will look like in the next few minutes.
Example:

By the end of this step, you’ll make your first line of code run successfully.

Use language that builds confidence: “You’ll do this,” not “You’ll try.”

Preview upcoming progress to create momentum.
Example:

Next, you’ll take what you just wrote and make it respond to input.

3. Increase Expected Outcome

Show how each lesson connects to real-world skills or satisfying results.
Example:

You’re not just printing text—you’re learning how every program talks back to you.

Use vivid mini-previews of future power.
Example:

Soon, you’ll use this same command to debug your own apps.

4. Reduce Perceived Effort

Keep text short, direct, and visually scannable.

When introducing new concepts, use small, meaningful actions that create quick wins.
Example:

Run this code once. If it prints what you expect, you’ve already succeeded.

Reinforce that mistakes are part of the process.
Example:

If it doesn’t work, that’s good—you’re learning to fix real bugs.

5. Reduce Time Delay to Reward

Give the user something to see or feel immediately after each action.
Example:

Hit Run and watch your first message appear.

Design steps so progress feels constant, with no long setup before results.

End each step with a visible or emotional win: code working, a concept clicking, or a connection to what’s next.
Example:

That line just taught your computer to speak. Next, you’ll teach it to think.

6. Use momentum language

End steps with a clear next action that pulls the learner forward.
Example:

That worked. Now combine the two variables in one console.log.

7. Frame each win as real progress

Link small wins to the learner identity and concrete skill.
Example:

You just wrote code like a developer. Keep going.

8. Use short, memorable analogies

One-line analogies make abstract ideas concrete and stick.
Example:

A variable is a labeled box for data.

9. Close the loop on every action

Every action step must be followed by a step that explains its purpose or payoff.
Example sequence:

Step A: Print your name.
Step B: That print proves your program can produce output. Here is why that matters.

10. Foreshadow the next useful ability

Tell learners what they will be able to do next and why it matters.
Example:

Next you will learn loops, which let you repeat work automatically.
