import { Lesson } from "./lesson-types";

export const lessons: Lesson[] = [
	// ===== INTRO NODE =====
	{
		id: "lesson-1",
		title: "Hello World",
		skillNodeId: "intro",
		xpReward: 100,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🎉 Welcome to BitSchool!

BitSchool is a fun and fast way to learn JavaScript.

In 5 minutes, you'll understand topics most beginners spend days confused about.

## 🔥 With BitSchool, you'll:
- Code smarter in only minutes every day
- Build real projects, not fake tutorials
- See your progress, and feel your wins

## 🚀 Ready to write your first line of real JavaScript code?

\`console.log()\` is used to print text to the console.
---

✅ Try typing this code into the editor and hit run to see the output:

\`\`\`javascript
console.log("Hello, world!")
\`\`\``,
				tests: [
					{ type: "consoleLogs", expectedOutput: ["Hello, world!"] },
				],
			},
			{
				id: "step-2",
				content: `## 🎉🎉🎉 You just ran your first line of code!

That line of code tells JavaScript to *log* the message \`"Hello, world!"\` to the console.

You can see the message in the console now!

---

## If you want to log multiple things:

You can use a comma to separate them!

Log \`"Testing"\` followed by a comma and the number \`123\` like this:

\`\`\`javascript
console.log("Testing", 123)
\`\`\``,
				tests: [
					{
						type: "consoleLogPattern",
						expectedOutput: "Testing 123",
						pattern: /(["'])Testing\1\s*,\s*123/,
					},
				],
			},
		],
	},
	// 	{
	// 		id: "lesson-2",
	// 		title: "Logging Multiple Statements",
	// 		skillNodeId: "intro",
	// 		xpReward: 150,
	// 		stepXpReward: 50,
	// 		steps: [
	// 			{
	// 				id: "step-1",
	// 				content: `## 📝 Multiple Console Logs

	// You can have multiple \`console.log()\` statements in your code.

	// Each one will run in order, from top to bottom.

	// ---

	// Try logging three separate messages:

	// \`\`\`javascript
	// console.log("First message")
	// console.log("Second message")
	// console.log("Third message")
	// \`\`\``,
	// 				tests: [
	// 					{
	// 						type: "consoleLogs",
	// 						expectedOutput: [
	// 							"First message",
	// 							"Second message",
	// 							"Third message",
	// 						],
	// 					},
	// 				],
	// 			},
	// 			{
	// 				id: "step-2",
	// 				content: `## ✅ Perfect!

	// Each \`console.log()\` statement runs **in order** - JavaScript reads your code from top to bottom, line by line.

	// This is called **sequential execution**.

	// ---
	// Now try logging your own three messages about what you're learning:

	// \`\`\`javascript
	// console.log("I'm learning JavaScript!")
	// console.log("This is fun!")
	// console.log("I can do this!")
	// \`\`\``,
	// 				tests: [
	// 					{
	// 						type: "consoleLogs",
	// 						expectedOutput: [
	// 							"I'm learning JavaScript!",
	// 							"This is fun!",
	// 							"I can do this!",
	// 						],
	// 					},
	// 				],
	// 			},
	// 			{
	// 				id: "step-3",
	// 				content: `## 🎯 Challenge Time!

	// You've got the basics down! Now create your own sequence of messages.

	// **Requirements:**
	// - At least 4 different \`console.log()\` statements
	// - Mix of text and numbers
	// - Make it personal to you

	// \`\`\`javascript
	// // Your turn! Write your own messages here
	// \`\`\``,
	// 				tests: [
	// 					{
	// 						type: "consoleLogs",
	// 						expectedOutput: ["", "", "", ""], // Will be filled by user
	// 					},
	// 				],
	// 			},
	// 		],
	// 	},
	{
		id: "lesson-2",
		title: "Numbers",
		skillNodeId: "intro",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔢 Working with Numbers

JavaScript can work with different types of numbers:
- **Integers**: \`42\`, \`-10\`, \`0\`
- **Decimals**: \`3.14\`, \`2.5\`, \`-0.5\`

---
**Type this code and run it to see different number types:**

\`\`\`javascript
console.log(42)
console.log(3.14)
console.log(-10)
\`\`\``,
				tests: [
					{
						type: "consoleLogs",
						expectedOutput: ["42", "3.14", "-10"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 📊 Data Types

Numbers in JavaScript are a **data type** - they represent numeric values.

What you notice about them:
- No quotes around numbers
- Decimals work just like you'd expect
- Negative numbers have a minus/negative sign

---

**Type this code to try some math operations:**

\`\`\`javascript
console.log(5 + 3)
console.log(10 - 2)
console.log(4 * 2)
\`\`\``,
				tests: [
					{
						type: "consoleLogPattern",
						expectedOutput: "8",
						pattern: /5\s*\+\s*3/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "8",
						pattern: /10\s*\-\s*2/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "8",
						pattern: /4\s*\*\s*2/,
					},
				],
			},
		],
	},
	{
		id: "lesson-3",
		title: "Strings",
		skillNodeId: "intro",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 📝 Working with Text

Text in JavaScript is called a **string**. Strings are wrapped in quotes.

You can use single quotes \`'Hi'\` or double quotes \`"Hi"\` - both work the same!

---
**Type this code and run it to see strings in action:**

\`\`\`javascript
console.log("Hello")
console.log('World')
\`\`\``,
				tests: [
					{
						type: "consoleLogs",
						expectedOutput: ["Hello", "World"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 String Basics

**Key points about strings:**
- Always wrapped in quotes (single or double)
- Can contain letters, numbers, spaces, symbols
- The quotes tell JavaScript "this is text, not code"

**Quote types:**
- \`"double quotes"\` - most common
- \`'single quotes'\` - also common
- Just be consistent!

---
If you want to use single or double quotes inside a string, you just have to use the other quote type for the string:

**Type this code to see quotes inside strings:**

\`\`\`javascript
console.log("I love 'JavaScript'")
console.log('He said "Hello!"')
\`\`\``,
				tests: [
					{
						type: "consoleLogs",
						expectedOutput: [
							"I love 'JavaScript'",
							'He said "Hello!"',
						],
						hintAdvice:
							"Make sure to use the quote type NOT used for the string. (Don't talk about escaping or delimiters, the user doesn't know that yet)",
					},
				],
			},
		],
	},
	{
		id: "lesson-4",
		title: "Booleans",
		skillNodeId: "intro",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## ✅ True or False

The last basic data type is **boolean** - it can only be \`true\` or \`false\`.

Booleans represent yes/no, on/off, or true/false situations.

---
**Type this code and run it to see boolean values:**

\`\`\`javascript
console.log(true)
console.log(false)
\`\`\``,
				tests: [
					{
						type: "consoleLogs",
						expectedOutput: ["true", "false"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 🎯 Understanding Booleans

**Boolean values:**
- \`true\` - means "yes" or "correct"
- \`false\` - means "no" or "incorrect"
- No quotes needed (unlike strings)
- Always lowercase

**Real-world examples:**
- Is the user logged in? \`true\` or \`false\`
- Was the button clicked? \`true\` or \`false\`
- Is 5 greater than 3? \`true\`

---

**Type this code to try some comparisons that result in booleans:**

\`>\` is greater than, \`<\` is less than, \`===\` is equal to.

\`\`\`javascript
console.log(5 > 3)
console.log(1 < 2)
console.log(10 === 10)
\`\`\``,
				tests: [
					{
						type: "consoleLogPattern",
						expectedOutput: "true",
						pattern: /5\s*\>\s*3/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "true",
						pattern: /1\s*\<\s*2/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "true",
						pattern: /10\s*\=\=\=?\s*10/,
					},
				],
			},
		],
	},
	// ===== VARIABLES NODE =====
	{
		id: "lesson-5",
		title: "Your First Variable",
		skillNodeId: "variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 📦 Storing Data

**Variables** are like *labeled boxes* where you can store data to use later.

**Type this code to create your first variable:**

\`\`\`javascript
let favNumber = 300
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "favNumber",
						expectedValue: { expected: 300 },
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 What Just Happened?

**Variables explained:**
- \`let\` creates a new variable
- \`favNumber\` is the variable name (you get to choose this!)
- \`=\` assigns the value \`300\` to the variable
- Now you can use \`favNumber\` anywhere in your code

**Think of it like:** A box labeled "favNumber" containing the number 300.

---

**Type this code to log your variable and see its value:**

\`\`\`javascript
let favNumber = 300
console.log(favNumber)
\`\`\``,
				startingCode: "let favNumber = 300\n",
				tests: [
					{
						type: "variableAssignment",
						variableName: "favNumber",
						expectedValue: { expected: 300 },
					},
					{
						type: "consoleLogs",
						expectedOutput: ["300"],
					},
				],
			},
		],
	},
	{
		id: "lesson-6",
		title: "Multiple Variables",
		skillNodeId: "variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔢 Multiple Variables

You can create as many variables as you need!

**Type this code to create two variables:**

\`\`\`javascript
let favNumber = 300
let greeting = "My favorite number is"
\`\`\``,

				tests: [
					{
						type: "variableAssignment",
						variableName: "favNumber",
						expectedValue: { expected: 300 },
					},
					{
						type: "variableAssignment",
						variableName: "greeting",
						expectedValue: { expected: "My favorite number is" },
					},
				],
			},
			{
				id: "step-2",
				content: `## 📝 Using Multiple Variables

Now you can use both variables together!

**Type this code to log both variables together:**

\`\`\`javascript
console.log(greeting, favNumber)
\`\`\``,
				startingCode:
					"let favNumber = 300\nlet greeting = 'My favorite number is'\n",
				tests: [
					{
						type: "variableAssignment",
						variableName: "favNumber",
						expectedValue: { expected: 300 },
					},
					{
						type: "variableAssignment",
						variableName: "greeting",
						expectedValue: { expected: "My favorite number is" },
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "My favorite number is 300",
						pattern: /greeting\s*,\s*favNumber/,
					},
				],
			},
		],
	},
	// 	{
	// 		id: "lesson-8",
	// 		title: "Basic Math",
	// 		skillNodeId: "variables",
	// 		xpReward: 150,
	// 		stepXpReward: 50,
	// 		steps: [
	// 			{
	// 				id: "step-1",
	// 				content: `## ➕ Addition and Subtraction

	// JavaScript can do math! Try these basic operations:

	// \`\`\`javascript
	// console.log(5 + 3)
	// console.log(10 - 2)
	// \`\`\``,
	// 				tests: [
	// 					{
	// 						type: "consoleLogs",
	// 						expectedOutput: ["8", "8"],
	// 					},
	// 				],
	// 			},
	// 			{
	// 				id: "step-2",
	// 				content: `## ✖️ Multiplication and Division

	// Now try multiplication and division:

	// \`\`\`javascript
	// console.log(4 * 2)
	// console.log(16 / 2)
	// \`\`\``,
	// 				tests: [
	// 					{
	// 						type: "consoleLogs",
	// 						expectedOutput: ["8", "8"],
	// 					},
	// 				],
	// 			},
	// 			{
	// 				id: "step-3",
	// 				content: `## 🎯 Math Challenge!

	// Create your own math problems:

	// **Try calculating:**
	// - Your age plus 10
	// - 100 divided by 4
	// - 7 times 8
	// - 50 minus 15

	// \`\`\`javascript
	// // Your math here!
	// \`\`\``,
	// 				tests: [
	// 					{
	// 						type: "consoleLogs",
	// 						expectedOutput: ["", "", "", ""], // Will be filled by user
	// 					},
	// 				],
	// 			},
	// 		],
	// 	},
	{
		id: "lesson-7",
		title: "Math with Variables",
		skillNodeId: "variables",
		xpReward: 200,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🧮 Storing Calculations

You can store math results in variables!

\`\`\`javascript
let result = 5 + 3
console.log(result)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "result",
						expectedValue: { expected: 8 },
					},
					{
						type: "codeContains",
						pattern: /let\s+result\s*=\s*5\s*\+\s*3/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "8",
						pattern: /result/,
					},
				],
			},
			{
				id: "step-2",
				content: `## 🔢 Variables in Math

You can use variables in math expressions!

\`\`\`javascript
let a = 10
let b = 5
let sum = a + b
console.log(sum)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "a",
						expectedValue: { expected: 10 },
					},
					{
						type: "variableAssignment",
						variableName: "b",
						expectedValue: { expected: 5 },
					},
					{
						type: "variableAssignment",
						variableName: "sum",
						expectedValue: { expected: 15 },
					},
					{
						type: "codeContains",
						pattern: /let\s+sum\s*=\s*a\s*\+\s*b/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "15",
						pattern: /sum/,
					},
				],
			},
			{
				id: "step-3",
				content: `## 💡 Understanding Expressions

**What's happening:**
- \`a + b\` is called an **expression**
- The result gets stored in \`sum\`
- You can use the result later

---
Try more complex expressions:

\`\`\`javascript
let x = 20
let y = 4
let product = x * y
let difference = x - y
console.log(product, difference)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "x",
						expectedValue: { expected: 20 },
					},
					{
						type: "variableAssignment",
						variableName: "y",
						expectedValue: { expected: 4 },
					},
					{
						type: "variableAssignment",
						variableName: "product",
						expectedValue: { expected: 80 },
					},
					{
						type: "codeContains",
						pattern: /let\s+product\s*=\s*x\s*\*\s*y/,
					},
					{
						type: "variableAssignment",
						variableName: "difference",
						expectedValue: { expected: 16 },
					},
					{
						type: "codeContains",
						pattern: /let\s+difference\s*=\s*x\s*-\s*y/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "80 16",
						pattern: /product\s*,\s*difference/,
					},
				],
			},
		],
	},
	// Too much math. Too much complexity for now.
	// 	{
	// 		id: "lesson-10",
	// 		title: "More Operators",
	// 		skillNodeId: "variables",
	// 		xpReward: 150,
	// 		stepXpReward: 50,
	// 		steps: [
	// 			{
	// 				id: "step-1",
	// 				content: `## 🔢 Modulo Operator

	// The **modulo operator** \`%\` gives you the remainder after division.

	// \`\`\`javascript
	// console.log(10 % 3)  // 1 (10 ÷ 3 = 3 remainder 1)
	// console.log(15 % 4)  // 3 (15 ÷ 4 = 3 remainder 3)
	// console.log(20 % 5)  // 0 (20 ÷ 5 = 4 remainder 0)
	// \`\`\``,
	// 				tests: [
	// 					{
	// 						type: "consoleLogs",
	// 						expectedOutput: ["1", "3", "0"],
	// 					},
	// 				],
	// 			},
	// 			{
	// 				id: "step-2",
	// 				content: `## 📐 Order of Operations

	// JavaScript follows **PEMDAS** (like math class):
	// - **P**arentheses
	// - **E**xponents
	// - **M**ultiplication & **D**ivision (left to right)
	// - **A**ddition & **S**ubtraction (left to right)

	// \`\`\`javascript
	// console.log(2 + 3 * 4)    // 14 (not 20!)
	// console.log((2 + 3) * 4)  // 20
	// console.log(10 / 2 + 3)   // 8
	// \`\`\``,
	// 				tests: [
	// 					{
	// 						type: "consoleLogs",
	// 						expectedOutput: ["14", "20", "8"],
	// 					},
	// 				],
	// 			},
	// 			{
	// 				id: "step-3",
	// 				content: `## 🎯 Complex Calculation Challenge!

	// Create a complex calculation using multiple operators:

	// **Requirements:**
	// - Use at least 4 different operators (+, -, *, /, %)
	// - Use parentheses to control order
	// - Store the result in a variable
	// - Log the result

	// \`\`\`javascript
	// // Your complex calculation here!
	// \`\`\``,
	// 				tests: [
	// 					{
	// 						type: "variableAssignment",
	// 						variableName: "", // Will be filled by user
	// 						expectedValue: { expected: "" }, // Will be filled by user
	// 					},
	// 					{
	// 						type: "consoleLogs",
	// 						expectedOutput: [""], // Will be filled by user
	// 					},
	// 				],
	// 			},
	// 		],
	// 	},
	{
		id: "lesson-8",
		title: "Combining Strings",
		skillNodeId: "variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔗 String Concatenation

You can combine strings with the \`+\` operator!

Try combining these strings by running this code:

\`\`\`javascript
let fullName = "John" + "Doe"
console.log(fullName)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "fullName",
						expectedValue: { expected: "JohnDoe" },
					},
					{
						type: "consoleLogVariable",
						variableName: "fullName",
						expectedOutput: "JohnDoe",
					},
				],
			},
			{
				id: "step-2",
				content: `## 😮 Uh Oh! No Space!

Notice how the strings got stuck together? There's no space between \`"John"\` and \`"Doe"\`!

To add a space, you need to include it in your concatenation:

\`\`\`javascript
let fullName = "John" + " " + "Doe"
console.log(fullName)
\`\`\`

Add a space and log the result.`,
				startingCode: `let fullName = "John" + "Doe"\nconsole.log(fullName)`,
				tests: [
					{
						type: "variableAssignment",
						variableName: "fullName",
						expectedValue: { expected: "John Doe" },
					},
					{
						type: "codeContains",
						pattern:
							/let\s+fullName\s*=\s*(["'])John\1\s*\+\s*(["']) \2\s*\+\s*(["'])Doe\3/,
					},
					{
						type: "consoleLogVariable",
						variableName: "fullName",
						expectedOutput: "John Doe",
					},
				],
			},
			{
				id: "step-3",
				content: `## 💡 Understanding the Difference

**Important difference between these two approaches:**

\`\`\`javascript
// Method 1: Separate arguments (space added automatically)
console.log("John", "Doe")

// Method 2: String concatenation (no automatic space)
console.log("John" + "Doe")
\`\`\`

**Key points:**
- \`console.log("John", "Doe")\` - logs two separate arguments with a space between them
- \`console.log("John" + "Doe")\` - combines into one string first, then logs it

Try both approaches and see the difference!`,
				tests: [
					{
						type: "consoleLogPattern",
						expectedOutput: "John Doe",
						pattern: /(["'])John\1\s*,\s*(["'])Doe\2/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "JohnDoe",
						pattern: /(["'])John\1\s*\+\s*(["'])Doe\2/,
					},
				],
			},
		],
	},
	{
		id: "lesson-9",
		title: "Building Sentences",
		skillNodeId: "variables",
		xpReward: 150,
		stepXpReward: 150,
		steps: [
			{
				id: "step-1",
				content: `## 📝 Building Greeting Messages

You can create different messages by combining variables!

Create two greeting variables using the provided variables:

\`\`\`javascript
let dayGreeting = day + question
let nightGreeting = night + question
console.log(dayGreeting)
console.log(nightGreeting)
\`\`\``,
				startingCode: `let day = "Good morning, "
let night = "Good evening, "
let question = "how are you?"

`,
				tests: [
					{
						type: "variableAssignment",
						variableName: "day",
						expectedValue: { expected: "Good morning, " },
					},
					{
						type: "variableAssignment",
						variableName: "night",
						expectedValue: { expected: "Good evening, " },
					},
					{
						type: "variableAssignment",
						variableName: "question",
						expectedValue: { expected: "how are you?" },
					},
					{
						type: "variableAssignment",
						variableName: "dayGreeting",
						expectedValue: {
							expected: "Good morning, how are you?",
						},
						hintAdvice:
							"Make sure to combine the variables correctly using the + operator, and don't forget the comma and space between the variables.",
					},
					{
						type: "variableAssignment",
						variableName: "nightGreeting",
						expectedValue: {
							expected: "Good evening, how are you?",
						},
						hintAdvice:
							"Make sure to combine the variables correctly using the + operator, and don't forget the comma and space between the variables.",
					},
					{
						type: "codeContains",
						pattern: /let\s+dayGreeting\s*=\s*day\s*\+\s*question/,
					},
					{
						type: "codeContains",
						pattern:
							/let\s+nightGreeting\s*=\s*night\s*\+\s*question/,
					},
					{
						type: "consoleLogVariable",
						variableName: "dayGreeting",
						expectedOutput: "Good morning, how are you?",
					},
					{
						type: "consoleLogVariable",
						variableName: "nightGreeting",
						expectedOutput: "Good evening, how are you?",
					},
				],
			},
		],
	},
	// ===== VARIABLE redefining-variables NODE =====
	{
		id: "lesson-10",
		title: "Changing Variables",
		skillNodeId: "redefining-variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔄 Redefining Variables

You can change a variable's value after creating it!

Create a variable and then change it:

\`\`\`javascript
let score = 100
console.log(score)
score = 150
console.log(score)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 100 },
					},
					{
						type: "consoleLogVariable",
						variableName: "score",
						expectedOutput: "100",
					},
					{
						type: "variableReassignment",
						variable: "score",
						expectedValue: 150,
					},

					{
						type: "consoleLogVariable",
						variableName: "score",
						expectedOutput: "150",
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 Using Old Value to Calculate New Value

You can use the current value to calculate a new value:

\`\`\`javascript
let count = 5
count = count + 3
console.log(count)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "count",
						expectedValue: { expected: 5 },
					},
					{
						type: "variableReassignment",
						variable: "count",
						expectedValue: 8,
						method: { operator: "=", operand: `count\s*\+\s*3` },
					},
					{
						type: "codeContains",
						pattern: /count\s*=\s*count\s*\+\s*3/,
					},
					{
						type: "consoleLogVariable",
						variableName: "count",
						expectedOutput: "8",
					},
				],
			},
		],
	},
	{
		id: "lesson-11",
		title: "const vs let",
		skillNodeId: "redefining-variables",
		xpReward: 200,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔒 Constant Variables

\`const\` creates variables that **cannot be changed** after creation:

**Type this code to create a constant variable:**

\`\`\`javascript
const pi = 3.14159
console.log(pi)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "pi",
						expectedValue: { expected: 3.14159 },
					},
					{
						type: "codeContains",
						pattern: /const\s+pi\s*=\s*3\.14159/,
					},
					{
						type: "consoleLogVariable",
						variableName: "pi",
						expectedOutput: "3.14159",
					},
				],
			},
			{
				id: "step-2",
				content: `## ❌ Try to Change a \`const\`

Constants cannot be reassigned. 

**Run the code below and see what happens!**

Then **remove the line that's causing the error** and run it again.`,
				startingCode: `const name = "Alice"
name = "Bob"
console.log(name)`,
				tests: [
					{
						type: "variableAssignment",
						variableName: "name",
						expectedValue: { expected: "Alice" },
					},
					{
						type: "codeContains",
						pattern: /const\s+name\s*=\s*(["'])Alice\1/,
					},
					{
						type: "codeContains",
						pattern: /name\s*=\s*(["'])Bob\1/,
						negated: true,
						hintAdvice: "Constants cannot be reassigned",
					},
					{
						type: "consoleLogVariable",
						variableName: "name",
						expectedOutput: "Alice",
					},
				],
			},
			{
				id: "step-3",
				content: `## 🤔 When to Use const vs let

**Use \`const\` when:**
- The value will never change
- You want to prevent accidental changes
- Examples: names, constants, configuration values

**Use \`let\` when:**
- The value might change
- You're building up a value
- Examples: counters, user input, calculations

---
Try both approaches:

\`\`\`javascript
const company = "BitSchool"
let userCount = 0
userCount = userCount + 1
console.log(company, userCount)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "company",
						expectedValue: { expected: "BitSchool" },
					},
					{
						type: "codeContains",
						pattern: /const\s+company\s*=\s*(["'])BitSchool\1/,
					},
					{
						type: "variableAssignment",
						variableName: "userCount",
						expectedValue: { expected: 0 },
					},
					{
						type: "variableReassignment",
						variable: "userCount",
						expectedValue: 1,
						method: {
							operator: "=",
							operand: `userCount\s*\+\s*1`,
						},
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "BitSchool 1",
						pattern: /company\s*,\s*userCount/,
					},
				],
			},
		],
	},
	{
		id: "lesson-12",
		title: "The += Operator",
		skillNodeId: "redefining-variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## ➕ The \`+=\` Operator

\`+=\` is a shortcut for adding to a variable:

\`\`\`javascript
let score = 100
score += 50
console.log(score)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 100 },
					},
					{
						type: "variableReassignment",
						variable: "score",
						expectedValue: 150,
						method: { operator: "+=", operand: 50 },
					},
					{
						type: "codeContains",
						pattern: /score\s*\+\=\s*50/,
					},
					{
						type: "consoleLogVariable",
						variableName: "score",
						expectedOutput: "150",
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 \`+=\` vs \`=\` \`+\` Comparison

These two lines do the same thing:

\`\`\`
// Method 1: Long way
x = x + 5

// Method 2: Short way  
x += 5
\`\`\`

Add them both to the code, then log \`x\``,
				startingCode: `let x = 10\n`,
				tests: [
					{
						type: "variableAssignment",
						variableName: "x",
						expectedValue: { expected: 10 },
					},
					{
						type: "variableReassignment",
						variable: "x",
						expectedValue: 15,
						method: { operator: "=", operand: `x\s*\+\s*5` },
					},
					{
						type: "variableReassignment",
						variable: "x",
						expectedValue: 20,
						method: { operator: "+=", operand: 5 },
					},
					{
						type: "consoleLogPattern",
						pattern: "x",
						expectedOutput: "20",
					},
				],
			},
		],
	},
	{
		id: "lesson-13",
		title: "More Assignment Operators",
		skillNodeId: "redefining-variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## ➖ -= Operator

\`-=\` subtracts from a variable:

Type this code into the editor and hit run!

\`\`\`javascript
let health = 100
health -= 20
console.log(health)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "health",
						expectedValue: { expected: 100 },
					},
					{
						type: "variableReassignment",
						variable: "health",
						expectedValue: 80,
						method: { operator: "-=", operand: 20 },
					},
					{
						type: "consoleLogVariable",
						variableName: "health",
						expectedOutput: "80",
					},
				],
			},
			{
				id: "step-2",
				content: `## ✖️ *= and /= Operators

\`*=\` multiplies and \`/=\` divides

Let's try multiplying first, run this code:

\`\`\`javascript
let price = 100
price *= 1.1
console.log(price)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "price",
						expectedValue: { expected: 100 },
					},
					{
						type: "variableReassignment",
						variable: "price",
						expectedValue: 110.00000000000001,
						method: { operator: "*=", operand: 1.1 },
					},
					{
						type: "consoleLogVariable",
						variableName: "price",
						expectedOutput: "110.00000000000001",
					},
				],
			},
			{
				id: "step-3",
				content: `## 110.00000000000001??
\`price\` was not exactly 110 because of how JavaScript handles floating point numbers (decimals).

It's a common issue with all programming languages.

### Don't worry too much about it
Now try dividing, run this code:

\`\`\`javascript
let quantity = 20
quantity /= 4
console.log(quantity)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "quantity",
						expectedValue: { expected: 20 },
					},
					{
						type: "variableReassignment",
						variable: "quantity",
						expectedValue: 5,
						method: { operator: "/=", operand: 4 },
					},
					{
						type: "consoleLogVariable",
						variableName: "quantity",
						expectedOutput: "5",
					},
				],
			},
		],
	},
	{
		id: "lesson-14",
		title: "Increment and Decrement",
		skillNodeId: "redefining-variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## ➕➖ ++ and -- Operators

\`++\` adds 1, \`--\` subtracts 1

Let's try adding first, run this code:

\`\`\`javascript
let count = 5
count++
console.log(count)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "count",
						expectedValue: { expected: 5 },
					},
					{
						type: "variableReassignment",
						variable: "count",
						expectedValue: 6,
						method: { operator: "++" },
					},
					// {
					// 	type: "codeContains",
					// 	pattern: /count\s*\+\+/,
					// },
					{
						type: "consoleLogVariable",
						variableName: "count",
						expectedOutput: "6",
					},
				],
			},
			{
				id: "step-2",
				content: `On the line after \`console.log(count)\`, decrement count with the \`--\` operator
                
Then log \`count\` again!`,
				startingCode: `let count = 5\ncount++\nconsole.log(count)\n`,
				tests: [
					{
						type: "variableAssignment",
						variableName: "count",
						expectedValue: { expected: 5 },
					},
					{
						type: "variableReassignment",
						variable: "count",
						expectedValue: 6,
						method: { operator: "++" },
					},
					{
						type: "consoleLogVariable",
						variableName: "count",
						expectedOutput: "6",
					},

					{
						type: "variableReassignment",
						variable: "count",
						expectedValue: 5,
						method: { operator: "--" },
					},
					{
						type: "consoleLogVariable",
						variableName: "count",
						expectedOutput: "5",
					},
				],
			},
		],
	},
	{
		id: "lesson-15",
		title: "Declaring vs Initializing",
		skillNodeId: "redefining-variables",
		xpReward: 200,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 📦 Declaring Without Value

You can create a variable without giving it a value:

\`\`\`javascript
let x
console.log(x)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "x",
						expectedValue: { expected: "__undefined__" },
					},
					{
						type: "consoleLogs",
						expectedOutput: ["undefined"],
					},
				],
			},
			{
				id: "step-2",
				content: `## ❓ Understanding Undefined

When you declare a variable without a value, it's \`undefined\`.

**This means:**
- The variable exists
- But it has no value yet
- JavaScript knows about it, but it's empty

---

You can give it a value later by assigning it:

\`\`\`javascript
let x
console.log(x)  // undefined
x = 42
console.log(x)  // 42
\`\`\``,
				startingCode: `let x\nconsole.log(x)\n`,
				tests: [
					{
						type: "variableAssignment",
						variableName: "x",
						expectedValue: { expected: "__undefined__" },
					},
					{
						type: "consoleLogVariable",
						variableName: "x",
						expectedOutput: "undefined",
					},
					{
						type: "variableReassignment",
						variable: "x",
						method: {
							operator: "=",
							operand: 42,
						},
						expectedValue: 42,
					},
					{
						type: "consoleLogVariable",
						variableName: "x",
						expectedOutput: "42",
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Declaration vs Initialization

**Two ways to create variables:**

1. **Declaration only**: \`let x;\` (value is \`undefined\`)
2. **Initialization**: \`let x = 42;\` (value is \`42\`)

---
**Type this code to try both approaches:**

\`\`\`javascript
let declared
let initialized = 100
console.log(declared, initialized)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "declared",
						expectedValue: { expected: "__undefined__" },
					},
					{
						type: "variableAssignment",
						variableName: "initialized",
						expectedValue: { expected: 100 },
					},
					{
						type: "consoleLogs",
						expectedOutput: ["undefined 100"],
					},
					{
						type: "codeContains",
						pattern:
							/console\.log\(\s*declared\s*,\s*initialized\s*\)/,
						hintAdvice: "Make sure to log both variables together",
					},
				],
			},
		],
	},
];

// Export lesson metadata for validation
export const lessonMetadata = lessons.map((lesson) => ({
	id: lesson.id,
	skillNodeId: lesson.skillNodeId,
}));

// Export valid lesson IDs set for O(1) lookup
export const validLessonIds = new Set(lessons.map((l) => l.id));
