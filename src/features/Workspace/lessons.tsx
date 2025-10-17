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
				content: `That line of code tells JavaScript to *log* the message \`"Hello, world!"\` to the console.

You can see the message in the console now!

---

If you want to log multiple things, you can use a comma to separate them.
This will print each item (called arguments) seperated by a space!

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
		id: "lesson-3",
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
Try logging these different numbers:

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

Now try some math operations:

\`\`\`javascript
console.log(5 + 3)
console.log(10 - 2)
console.log(4 * 2)
\`\`\`

Type those 3 lines into the console. Run the code to see the output.`,
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
		id: "lesson-4",
		title: "Strings",
		skillNodeId: "intro",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 📝 Working with Text

Text in JavaScript is called a **string**. Strings are wrapped in quotes.

You can use single quotes \`'...'\` or double quotes \`"..."\` - both work the same!

---
Try logging some text:

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

\`\`\`javascript
console.log("I love 'JavaScript'")
console.log('He said "Hello!"')
\`\`\`

Try running that code!`,
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
		id: "lesson-5",
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
Try logging boolean values:

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

Try some comparisons that result in booleans:

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
		id: "lesson-6",
		title: "Your First Variable",
		skillNodeId: "variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 📦 Storing Data

**Variables** are like *labeled boxes* where you can store data to use later.

Create your first variable with the \`let\` keyword:

\`\`\`javascript
let favoriteNumber = 300
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "favoriteNumber",
						expectedValue: { expected: 300 },
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 What Just Happened?

**Variables explained:**
- \`let\` creates a new variable
- \`favoriteNumber\` is the variable name (you get to choose this!)
- \`=\` assigns the value \`300\` to the variable
- Now you can use \`favoriteNumber\` anywhere in your code

**Think of it like:** A box labeled "favoriteNumber" containing the number 300.

---

Now log your variable to see its value:

\`\`\`javascript
let favoriteNumber = 300
console.log(favoriteNumber)
\`\`\``,
				startingCode: "let favoriteNumber = 300\n",
				tests: [
					{
						type: "variableAssignment",
						variableName: "favoriteNumber",
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
		id: "lesson-7",
		title: "Multiple Variables",
		skillNodeId: "variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔢 Multiple Variables

You can create as many variables as you need!

Create two variables:

\`\`\`javascript
let favoriteNumber = 300
let greeting = "My favorite number is"
\`\`\``,

				tests: [
					{
						type: "variableAssignment",
						variableName: "favoriteNumber",
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

Log them both in one \`console.log()\` statement:

\`\`\`javascript
console.log(greeting, favoriteNumber)
\`\`\``,
				startingCode:
					"let favoriteNumber = 300\nlet greeting = 'My favorite number is'\n",
				tests: [
					{
						type: "variableAssignment",
						variableName: "favoriteNumber",
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
						pattern: /greeting\s*,\s*favoriteNumber/,
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
		id: "lesson-9",
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
		id: "lesson-11",
		title: "Combining Strings",
		skillNodeId: "variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔗 String Concatenation

You can combine strings with the \`+\` operator!

\`\`\`javascript
console.log("Hello" + " " + "World")
console.log("I love" + " JavaScript")
\`\`\``,
				tests: [
					{
						type: "consoleLogs",
						expectedOutput: ["Hello World", "I love JavaScript"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 📝 Variables and Strings

You can combine variables with strings:

\`\`\`javascript
let name = "Alice"
let greeting = "Hello, " + name
console.log(greeting)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "name",
						expectedValue: { expected: "Alice" },
					},
					{
						type: "variableAssignment",
						variableName: "greeting",
						expectedValue: { expected: "Hello, Alice" },
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Hello, Alice"],
					},
				],
			},
		],
	},
	{
		id: "lesson-12",
		title: "Building Sentences",
		skillNodeId: "variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 📝 Multi-Part String Concatenation

You can build complex sentences by combining multiple parts:

\`\`\`javascript
let firstName = "John"
let lastName = "Doe"
let age = 25
let message = "Hi, I'm " + firstName + " " + lastName + " and I'm " + age + " years old"
console.log(message)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "firstName",
						expectedValue: { expected: "John" },
					},
					{
						type: "variableAssignment",
						variableName: "lastName",
						expectedValue: { expected: "Doe" },
					},
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 25 },
					},
					{
						type: "variableAssignment",
						variableName: "message",
						expectedValue: {
							expected: "Hi, I'm John Doe and I'm 25 years old",
						},
					},
					{
						type: "consoleLogs",
						expectedOutput: [
							"Hi, I'm John Doe and I'm 25 years old",
						],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 Creating Personalized Messages

This is how you create dynamic, personalized messages!

**What's happening:**
- Each variable holds a piece of information
- The \`+\` operator combines them
- Spaces are added where needed
- Numbers are automatically converted to strings

---
Try a different example:

\`\`\`javascript
let product = "laptop"
let price = 999
let store = "TechStore"
let ad = "Buy a " + product + " for $" + price + " at " + store
console.log(ad)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "product",
						expectedValue: { expected: "laptop" },
					},
					{
						type: "variableAssignment",
						variableName: "price",
						expectedValue: { expected: 999 },
					},
					{
						type: "variableAssignment",
						variableName: "store",
						expectedValue: { expected: "TechStore" },
					},
					{
						type: "variableAssignment",
						variableName: "ad",
						expectedValue: {
							expected: "Buy a laptop for $999 at TechStore",
						},
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Buy a laptop for $999 at TechStore"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Personal Greeting Challenge!

Create your own personalized greeting:

**Requirements:**
- Use your name
- Include your age
- Include your favorite hobby
- Create a complete sentence
- Log the result

\`\`\`javascript
// Your personal greeting here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "", // Will be filled by user
						expectedValue: { expected: "" }, // Will be filled by user
					},
					{
						type: "consoleLogs",
						expectedOutput: [""], // Will be filled by user
					},
				],
			},
		],
	},
	{
		id: "lesson-13",
		title: "Declaring vs Initializing",
		skillNodeId: "variables",
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
Now give it a value:

\`\`\`javascript
let x
console.log(x)  // undefined
x = 42
console.log(x)  // 42
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "x",
						expectedValue: { expected: 42 },
					},
					{
						type: "consoleLogs",
						expectedOutput: ["undefined", "42"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Declaration vs Initialization

**Two ways to create variables:**

1. **Declaration only**: \`let x;\` (value is \`undefined\`)
2. **Declaration + Initialization**: \`let x = 42;\` (value is \`42\`)

---
Try both approaches:

\`\`\`javascript
let declaredOnly
let declaredAndInitialized = 100
console.log(declaredOnly, declaredAndInitialized)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "declaredOnly",
						expectedValue: { expected: "__undefined__" },
					},
					{
						type: "variableAssignment",
						variableName: "declaredAndInitialized",
						expectedValue: { expected: 100 },
					},
					{
						type: "consoleLogs",
						expectedOutput: ["undefined 100"],
					},
				],
			},
			{
				id: "step-4",
				content: `## 🎯 When to Use Each Approach

**Use declaration only when:**
- You need to create the variable first
- You'll assign a value later
- You're building up a value step by step

**Use initialization when:**
- You know the value right away
- You want to avoid \`undefined\`
- You're creating a complete variable

---
Try both approaches in one example:

\`\`\`javascript
// Declaration only
let result
result = 10 + 5

// Declaration + initialization
let answer = 10 + 5

console.log(result, answer)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "result",
						expectedValue: { expected: 15 },
					},
					{
						type: "variableAssignment",
						variableName: "answer",
						expectedValue: { expected: 15 },
					},
					{
						type: "consoleLogs",
						expectedOutput: ["15 15"],
					},
				],
			},
		],
	},
	{
		id: "lesson-14",
		title: "Understanding Undefined",
		skillNodeId: "variables",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## ❓ Variables Without Values

When variables don't have values, they're \`undefined\`.

\`\`\`javascript
let name
let age
let city
console.log(name, age, city)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "name",
						expectedValue: { expected: "__undefined__" },
					},
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: "__undefined__" },
					},
					{
						type: "variableAssignment",
						variableName: "city",
						expectedValue: { expected: "__undefined__" },
					},
					{
						type: "consoleLogs",
						expectedOutput: ["undefined undefined undefined"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 When to Use Each Approach

**Declaration only (\`let x;\`):**
- When you need to create the variable first
- When you'll assign a value later
- When you're building up a value step by step

**Initialization (\`let x = value;\`):**
- When you know the value right away
- When you want to avoid \`undefined\`
- When you're creating a complete variable

---
Try both approaches:

\`\`\`javascript
// Approach 1: Declaration only
let score
score = 100

// Approach 2: Initialization
let points = 100

console.log(score, points)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 100 },
					},
					{
						type: "variableAssignment",
						variableName: "points",
						expectedValue: { expected: 100 },
					},
					{
						type: "consoleLogs",
						expectedOutput: ["100 100"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Experiment Challenge!

Try different declaration styles and see what happens:

**Requirements:**
- Create 3 variables using declaration only
- Create 3 variables using initialization
- Assign values to the declaration-only variables
- Log all variables

\`\`\`javascript
// Your experiment here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "", // Will be filled by user
						expectedValue: { expected: "" }, // Will be filled by user
					},
					{
						type: "consoleLogs",
						expectedOutput: [""], // Will be filled by user
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
