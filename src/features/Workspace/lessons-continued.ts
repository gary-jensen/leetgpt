import { Lesson } from "./lesson-types";

const lessonsContinued: Lesson[] = [
	// ===== CONDITIONAL THINKING NODE =====
	{
		id: "lesson-20",
		title: "Your First If Statement",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🤔 Making Decisions

Your code can make decisions! Use \`if\` statements to check conditions.

Type this code to check if a score is high:

\`\`\`javascript
let score = 85
if (score > 80) {
  console.log("Great job!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 85 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>\\s*80",
						bodyPattern: "console\\.log\\(.*Great job.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Great job!"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 How If Statements Work

**What just happened:**
- \`if (score > 80)\` checks if score is greater than 80
- If true, the code inside \`{}\` runs
- If false, it skips the code block

**The condition:** \`score > 80\` is either true or false

---
Try changing the score to see what happens:

\`\`\`javascript
let score = 75
if (score > 80) {
  console.log("Great job!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 75 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>\\s*80",
						bodyPattern: "console\\.log\\(.*Great job.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: [],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Your Turn!

Create your own if statement:

**Requirements:**
- Create a variable \`age\` with value \`16\`
- Write an if statement that checks if age is 18 or older
- If true, log "You can vote!"
- Run the code to see what happens

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 16 },
					},
					{
						type: "ifStatement",
						pattern: "age\\s*>=\\s*18",
						bodyPattern: "console\\.log\\(.*You can vote.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: [],
					},
				],
			},
		],
	},
	{
		id: "lesson-21",
		title: "More Comparisons",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 📊 Different Comparison Operators

You can compare numbers in many ways:

Type this code to try different comparisons:

\`\`\`javascript
let temperature = 25

if (temperature < 0) {
  console.log("Freezing!")
}

if (temperature >= 30) {
  console.log("Hot!")
}

if (temperature <= 10) {
  console.log("Cold!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "temperature",
						expectedValue: { expected: 25 },
					},
					{
						type: "ifStatement",
						pattern: "temperature\\s*<\\s*0",
						bodyPattern: "console\\.log\\(.*Freezing.*\\)",
					},
					{
						type: "ifStatement",
						pattern: "temperature\\s*>=\\s*30",
						bodyPattern: "console\\.log\\(.*Hot.*\\)",
					},
					{
						type: "ifStatement",
						pattern: "temperature\\s*<=\\s*10",
						bodyPattern: "console\\.log\\(.*Cold.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: [],
					},
				],
			},
			{
				id: "step-2",
				content: `## 🔍 Understanding the Operators

**Comparison operators:**
- \`<\` - less than
- \`>\` - greater than  
- \`<=\` - less than or equal to
- \`>=\` - greater than or equal to

**Why none printed?** 25 is not < 0, not >= 30, and not <= 10

---
Try changing the temperature to see different messages:

\`\`\`javascript
let temperature = 35

if (temperature < 0) {
  console.log("Freezing!")
}

if (temperature >= 30) {
  console.log("Hot!")
}

if (temperature <= 10) {
  console.log("Cold!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "temperature",
						expectedValue: { expected: 35 },
					},
					{
						type: "ifStatement",
						pattern: "temperature\\s*<\\s*0",
						bodyPattern: "console\\.log\\(.*Freezing.*\\)",
					},
					{
						type: "ifStatement",
						pattern: "temperature\\s*>=\\s*30",
						bodyPattern: "console\\.log\\(.*Hot.*\\)",
					},
					{
						type: "ifStatement",
						pattern: "temperature\\s*<=\\s*10",
						bodyPattern: "console\\.log\\(.*Cold.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Hot!"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Range Check Challenge!

Create a program that checks if a number is in a specific range:

**Requirements:**
- Create a variable \`number\` with value \`15\`
- Check if the number is between 10 and 20 (inclusive)
- If true, log "In range!"
- If false, log "Out of range!"

**Hint:** Use \`>= 10\` AND \`<= 20\`

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "number",
						expectedValue: { expected: 15 },
					},
					{
						type: "ifStatement",
						pattern:
							"number\\s*>=\\s*10\\s*&&\\s*number\\s*<=\\s*20",
						bodyPattern: "console\\.log\\(.*In range.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["In range!"],
					},
				],
			},
		],
	},
	{
		id: "lesson-22",
		title: "If-Else",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔀 Either/Or Logic

Use \`else\` to handle the opposite case:

Type this code to check if someone is an adult:

\`\`\`javascript
let age = 17

if (age >= 18) {
  console.log("Adult")
} else {
  console.log("Minor")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 17 },
					},
					{
						type: "ifStatement",
						pattern: "age\\s*>=\\s*18",
						elsePattern: "console\\.log\\(.*Minor.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Minor"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 How If-Else Works

**What happened:**
- \`if (age >= 18)\` - if true, run "Adult"
- \`else\` - if false, run "Minor"
- Only one block runs, never both

**The logic:** Either you're 18+ (Adult) OR you're not (Minor)

---
Try changing the age to see the other result:

\`\`\`javascript
let age = 21

if (age >= 18) {
  console.log("Adult")
} else {
  console.log("Minor")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 21 },
					},
					{
						type: "ifStatement",
						pattern: "age\\s*>=\\s*18",
						bodyPattern: "console\\.log\\(.*Adult.*\\)",
						elsePattern: "console\\.log\\(.*Minor.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Adult"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Positive or Negative Challenge!

Create a program that categorizes numbers:

**Requirements:**
- Create a variable \`number\` with value \`-5\`
- If the number is positive (>= 0), log "Positive"
- If the number is negative (< 0), log "Negative"

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "number",
						expectedValue: { expected: -5 },
					},
					{
						type: "ifStatement",
						pattern: "number\\s*>=\\s*0",
						bodyPattern: "console\\.log\\(.*Positive.*\\)",
						elsePattern: "console\\.log\\(.*Negative.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Negative"],
					},
				],
			},
		],
	},
	{
		id: "lesson-23",
		title: "Multiple Scenarios",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔄 Different If-Else Scenarios

You can have multiple if statements that run independently:

Type this code to check different conditions:

\`\`\`javascript
let score = 85

if (score >= 90) {
  console.log("A grade")
}

if (score >= 80) {
  console.log("B grade")
}

if (score >= 70) {
  console.log("C grade")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 85 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*90",
						bodyPattern: "console\\.log\\(.*A grade.*\\)",
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*80",
						bodyPattern: "console\\.log\\(.*B grade.*\\)",
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*70",
						bodyPattern: "console\\.log\\(.*C grade.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["B grade", "C grade"],
					},
				],
			},
			{
				id: "step-2",
				content: `## ⚠️ The Problem with Multiple Ifs

**What happened:** Both "B grade" and "C grade" printed!

**Why:** 85 is >= 80 AND >= 70, so both conditions are true

**The issue:** We want only ONE grade, not multiple

---
Try a score that should only print one grade:

\`\`\`javascript
let score = 95

if (score >= 90) {
  console.log("A grade")
}

if (score >= 80) {
  console.log("B grade")
}

if (score >= 70) {
  console.log("C grade")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 95 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*90",
						bodyPattern: "console\\.log\\(.*A grade.*\\)",
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*80",
						bodyPattern: "console\\.log\\(.*B grade.*\\)",
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*70",
						bodyPattern: "console\\.log\\(.*C grade.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["A grade", "B grade", "C grade"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Fix the Grade System!

Create a better grade system that only prints ONE grade:

**Requirements:**
- Create a variable \`score\` with value \`75\`
- Use if-else statements so only one grade prints
- Check for A (>= 90), B (>= 80), C (>= 70), F (< 70)

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 75 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*90",
						bodyPattern: "console\\.log\\(.*A.*\\)",
						elseIfPatterns: [
							{
								condition: "score\\s*>=\\s*80",
								body: "console\\.log\\(.*B.*\\)",
							},
							{
								condition: "score\\s*>=\\s*70",
								body: "console\\.log\\(.*C.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*F.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["C"],
					},
				],
			},
		],
	},
	{
		id: "lesson-24",
		title: "Equality Operators",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## ⚖️ Checking for Exact Matches

Use \`===\` to check if two values are exactly the same:

Type this code to check for exact equality:

\`\`\`javascript
let password = "secret123"

if (password === "secret123") {
  console.log("Access granted!")
}

if (password === "wrong") {
  console.log("Access denied!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "password",
						expectedValue: { expected: "secret123" },
					},
					{
						type: "ifStatement",
						pattern: 'password\\s*===\\s*"secret123"',
						bodyPattern: "console\\.log\\(.*Access granted.*\\)",
					},
					{
						type: "ifStatement",
						pattern: 'password\\s*===\\s*"wrong"',
						bodyPattern: "console\\.log\\(.*Access denied.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Access granted!"],
					},
				],
			},
			{
				id: "step-2",
				content: `## ❌ Checking for Differences

Use \`!==\` to check if two values are NOT the same:

Type this code to check for inequality:

\`\`\`javascript
let userInput = "hello"

if (userInput !== "goodbye") {
  console.log("Not saying goodbye")
}

if (userInput !== "hello") {
  console.log("Not saying hello")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "userInput",
						expectedValue: { expected: "hello" },
					},
					{
						type: "ifStatement",
						pattern: 'userInput\\s*!==\\s*"goodbye"',
						bodyPattern:
							"console\\.log\\(.*Not saying goodbye.*\\)",
					},
					{
						type: "ifStatement",
						pattern: 'userInput\\s*!==\\s*"hello"',
						bodyPattern: "console\\.log\\(.*Not saying hello.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Not saying goodbye"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Login System Challenge!

Create a simple login system:

**Requirements:**
- Create a variable \`username\` with value \`"admin"\`
- Create a variable \`password\` with value \`"password123"\`
- Check if username is "admin" AND password is "password123"
- If both match, log "Login successful!"
- If either is wrong, log "Login failed!"

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "username",
						expectedValue: { expected: "admin" },
					},
					{
						type: "variableAssignment",
						variableName: "password",
						expectedValue: { expected: "password123" },
					},
					{
						type: "ifStatement",
						pattern:
							'username\\s*===\\s*"admin"\\s*&&\\s*password\\s*===\\s*"password123"',
						bodyPattern: "console\\.log\\(.*Login successful.*\\)",
						elsePattern: "console\\.log\\(.*Login failed.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Login successful!"],
					},
				],
			},
		],
	},
	{
		id: "lesson-25",
		title: "Why Strict Equality",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## ⚠️ The Problem with ==

JavaScript has two equality operators: \`==\` and \`===\`

Type this code to see the difference:

\`\`\`javascript
let number = 5
let string = "5"

console.log("Using ==:", number == string)
console.log("Using ===", number === string)
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "number",
						expectedValue: { expected: 5 },
					},
					{
						type: "variableAssignment",
						variableName: "string",
						expectedValue: { expected: "5" },
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "Using ==: true",
						pattern:
							/console\.log\("Using ==:",\s*number\s*==\s*string\)/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "Using === false",
						pattern:
							/console\.log\("Using ===",\s*number\s*===\s*string\)/,
					},
				],
			},
			{
				id: "step-2",
				content: `## 🤔 Why the Difference?

**\`==\` (loose equality):**
- Converts types before comparing
- \`5 == "5"\` becomes \`5 == 5\` → true
- Can cause unexpected results

**\`===\` (strict equality):**
- Compares both value AND type
- \`5 === "5"\` → false (number vs string)
- More predictable and safer

---
Try more examples to see the pattern:

\`\`\`javascript
console.log("0 == false:", 0 == false)
console.log("0 === false:", 0 === false)
console.log("'' == false:", "" == false)
console.log("'' === false:", "" === false)
\`\`\``,
				tests: [
					{
						type: "consoleLogPattern",
						expectedOutput: "0 == false: true",
						pattern:
							/console\.log\("0 == false:",\s*0\s*==\s*false\)/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "0 === false: false",
						pattern:
							/console\.log\("0 === false:",\s*0\s*===\s*false\)/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "'' == false: true",
						pattern:
							/console\.log\("'' == false:",\s*""\s*==\s*false\)/,
					},
					{
						type: "consoleLogPattern",
						expectedOutput: "'' === false: false",
						pattern:
							/console\.log\("'' === false:",\s*""\s*===\s*false\)/,
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Always Use === Challenge!

Practice using strict equality in a real scenario:

**Requirements:**
- Create a variable \`userAge\` with value \`"18"\` (as a string)
- Create a variable \`requiredAge\` with value \`18\` (as a number)
- Check if userAge === requiredAge (should be false)
- If true, log "Access granted!"
- If false, log "Access denied! (age must be a number)"

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "userAge",
						expectedValue: { expected: "18" },
					},
					{
						type: "variableAssignment",
						variableName: "requiredAge",
						expectedValue: { expected: 18 },
					},
					{
						type: "ifStatement",
						pattern: "userAge\\s*===\\s*requiredAge",
						bodyPattern: "console\\.log\\(.*Access granted.*\\)",
						elsePattern:
							"console\\.log\\(.*Access denied.*age must be a number.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: [
							"Access denied! (age must be a number)",
						],
					},
				],
			},
		],
	},
	{
		id: "lesson-26",
		title: "Comparing Strings",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 📝 String Equality

You can compare strings with \`===\` for exact matches:

Type this code to check string equality:

\`\`\`javascript
let userInput = "hello"

if (userInput === "hello") {
  console.log("You said hello!")
}

if (userInput === "goodbye") {
  console.log("You said goodbye!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "userInput",
						expectedValue: { expected: "hello" },
					},
					{
						type: "ifStatement",
						pattern: 'userInput\\s*===\\s*"hello"',
						bodyPattern: "console\\.log\\(.*You said hello.*\\)",
					},
					{
						type: "ifStatement",
						pattern: 'userInput\\s*===\\s*"goodbye"',
						bodyPattern: "console\\.log\\(.*You said goodbye.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["You said hello!"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 🔤 Case Sensitivity Matters

String comparison is case-sensitive - "Hello" ≠ "hello":

Type this code to see case sensitivity:

\`\`\`javascript
let greeting = "Hello"

if (greeting === "hello") {
  console.log("Lowercase match!")
}

if (greeting === "Hello") {
  console.log("Exact match!")
}

if (greeting === "HELLO") {
  console.log("Uppercase match!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "greeting",
						expectedValue: { expected: "Hello" },
					},
					{
						type: "ifStatement",
						pattern: 'greeting\\s*===\\s*"hello"',
						bodyPattern: "console\\.log\\(.*Lowercase match.*\\)",
					},
					{
						type: "ifStatement",
						pattern: 'greeting\\s*===\\s*"Hello"',
						bodyPattern: "console\\.log\\(.*Exact match.*\\)",
					},
					{
						type: "ifStatement",
						pattern: 'greeting\\s*===\\s*"HELLO"',
						bodyPattern: "console\\.log\\(.*Uppercase match.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Exact match!"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Password Validation Challenge!

Create a password checker that's case-sensitive:

**Requirements:**
- Create a variable \`password\` with value \`"Secret123"\`
- Check if password equals "secret123" (lowercase)
- Check if password equals "Secret123" (exact case)
- If lowercase matches, log "Password accepted (case ignored)"
- If exact case matches, log "Password accepted (exact match)"
- If neither matches, log "Password rejected"

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "password",
						expectedValue: { expected: "Secret123" },
					},
					{
						type: "ifStatement",
						pattern: 'password\\s*===\\s*"secret123"',
						bodyPattern:
							"console\\.log\\(.*Password accepted.*case ignored.*\\)",
						elseIfPatterns: [
							{
								condition: 'password\\s*===\\s*"Secret123"',
								body: "console\\.log\\(.*Password accepted.*exact match.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*Password rejected.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Password accepted (exact match)"],
					},
				],
			},
		],
	},
	{
		id: "lesson-27",
		title: "Else-If Introduction",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔗 Multiple Conditions with Else-If

Use \`else if\` to check multiple conditions in order:

Type this code to categorize a score:

\`\`\`javascript
let score = 85

if (score >= 90) {
  console.log("A grade")
} else if (score >= 80) {
  console.log("B grade")
} else if (score >= 70) {
  console.log("C grade")
} else {
  console.log("F grade")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 85 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*90",
						bodyPattern: "console\\.log\\(.*A grade.*\\)",
						elseIfPatterns: [
							{
								condition: "score\\s*>=\\s*80",
								body: "console\\.log\\(.*B grade.*\\)",
							},
							{
								condition: "score\\s*>=\\s*70",
								body: "console\\.log\\(.*C grade.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*F grade.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["B grade"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 How Else-If Works

**The order matters:**
1. Check if score >= 90 → A grade
2. If not, check if score >= 80 → B grade  
3. If not, check if score >= 70 → C grade
4. If none match → F grade

**Only the FIRST matching condition runs!**

---
Try a different score to see another grade:

\`\`\`javascript
let score = 95

if (score >= 90) {
  console.log("A grade")
} else if (score >= 80) {
  console.log("B grade")
} else if (score >= 70) {
  console.log("C grade")
} else {
  console.log("F grade")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 95 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*90",
						bodyPattern: "console\\.log\\(.*A grade.*\\)",
						elseIfPatterns: [
							{
								condition: "score\\s*>=\\s*80",
								body: "console\\.log\\(.*B grade.*\\)",
							},
							{
								condition: "score\\s*>=\\s*70",
								body: "console\\.log\\(.*C grade.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*F grade.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["A grade"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Temperature Categorizer Challenge!

Create a temperature categorizer with multiple conditions:

**Requirements:**
- Create a variable \`temperature\` with value \`25\`
- If temp >= 30, log "Hot"
- Else if temp >= 20, log "Warm"  
- Else if temp >= 10, log "Cool"
- Else log "Cold"

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "temperature",
						expectedValue: { expected: 25 },
					},
					{
						type: "ifStatement",
						pattern: "temperature\\s*>=\\s*30",
						bodyPattern: "console\\.log\\(.*Hot.*\\)",
						elseIfPatterns: [
							{
								condition: "temperature\\s*>=\\s*20",
								body: "console\\.log\\(.*Warm.*\\)",
							},
							{
								condition: "temperature\\s*>=\\s*10",
								body: "console\\.log\\(.*Cool.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*Cold.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Warm"],
					},
				],
			},
		],
	},
	{
		id: "lesson-28",
		title: "Order Matters",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## ⚠️ Wrong Order Problem

The order of your conditions matters! Watch what happens with wrong order:

Type this code with the wrong order:

\`\`\`javascript
let score = 95

if (score >= 70) {
  console.log("C grade")
} else if (score >= 80) {
  console.log("B grade")
} else if (score >= 90) {
  console.log("A grade")
} else {
  console.log("F grade")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 95 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*70",
						bodyPattern: "console\\.log\\(.*C grade.*\\)",
						elseIfPatterns: [
							{
								condition: "score\\s*>=\\s*80",
								body: "console\\.log\\(.*B grade.*\\)",
							},
							{
								condition: "score\\s*>=\\s*90",
								body: "console\\.log\\(.*A grade.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*F grade.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["C grade"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 😱 What Went Wrong?

**The problem:** 95 >= 70 is true, so it prints "C grade" and stops!

**Why:** JavaScript checks conditions from top to bottom and stops at the first match.

**The fix:** Put the most specific conditions first (highest numbers first).

---
Fix the order by putting the highest conditions first:

\`\`\`javascript
let score = 95

if (score >= 90) {
  console.log("A grade")
} else if (score >= 80) {
  console.log("B grade")
} else if (score >= 70) {
  console.log("C grade")
} else {
  console.log("F grade")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 95 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*90",
						bodyPattern: "console\\.log\\(.*A grade.*\\)",
						elseIfPatterns: [
							{
								condition: "score\\s*>=\\s*80",
								body: "console\\.log\\(.*B grade.*\\)",
							},
							{
								condition: "score\\s*>=\\s*70",
								body: "console\\.log\\(.*C grade.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*F grade.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["A grade"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Fix the Order Challenge!

Fix this broken age categorizer by putting conditions in the right order:

**Current broken code:**
- if (age >= 13) → "Teen"
- else if (age >= 18) → "Adult"  
- else if (age >= 65) → "Senior"
- else → "Child"

**Requirements:**
- Create a variable \`age\` with value \`20\`
- Fix the order so 20-year-olds get "Adult" not "Teen"
- Test with your fixed code

\`\`\`javascript
// Type your fixed code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 20 },
					},
					{
						type: "ifStatement",
						pattern: "age\\s*>=\\s*65",
						bodyPattern: "console\\.log\\(.*Senior.*\\)",
						elseIfPatterns: [
							{
								condition: "age\\s*>=\\s*18",
								body: "console\\.log\\(.*Adult.*\\)",
							},
							{
								condition: "age\\s*>=\\s*13",
								body: "console\\.log\\(.*Teen.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*Child.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Adult"],
					},
				],
			},
		],
	},
	{
		id: "lesson-29",
		title: "Grade Calculator",
		skillNodeId: "conditionals",
		xpReward: 200,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 📊 Complete Grade Calculator

Let's build a comprehensive grade calculator with multiple tiers:

Type this complete grade calculator:

\`\`\`javascript
let score = 87

if (score >= 97) {
  console.log("A+")
} else if (score >= 93) {
  console.log("A")
} else if (score >= 90) {
  console.log("A-")
} else if (score >= 87) {
  console.log("B+")
} else if (score >= 83) {
  console.log("B")
} else if (score >= 80) {
  console.log("B-")
} else if (score >= 77) {
  console.log("C+")
} else if (score >= 73) {
  console.log("C")
} else if (score >= 70) {
  console.log("C-")
} else if (score >= 67) {
  console.log("D+")
} else if (score >= 65) {
  console.log("D")
} else {
  console.log("F")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 87 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*97",
						bodyPattern: "console\\.log\\(.*A\\+.*\\)",
						elseIfPatterns: [
							{
								condition: "score\\s*>=\\s*93",
								body: "console\\.log\\(.*A.*\\)",
							},
							{
								condition: "score\\s*>=\\s*90",
								body: "console\\.log\\(.*A-.*\\)",
							},
							{
								condition: "score\\s*>=\\s*87",
								body: "console\\.log\\(.*B\\+.*\\)",
							},
							{
								condition: "score\\s*>=\\s*83",
								body: "console\\.log\\(.*B.*\\)",
							},
							{
								condition: "score\\s*>=\\s*80",
								body: "console\\.log\\(.*B-.*\\)",
							},
							{
								condition: "score\\s*>=\\s*77",
								body: "console\\.log\\(.*C\\+.*\\)",
							},
							{
								condition: "score\\s*>=\\s*73",
								body: "console\\.log\\(.*C.*\\)",
							},
							{
								condition: "score\\s*>=\\s*70",
								body: "console\\.log\\(.*C-.*\\)",
							},
							{
								condition: "score\\s*>=\\s*67",
								body: "console\\.log\\(.*D\\+.*\\)",
							},
							{
								condition: "score\\s*>=\\s*65",
								body: "console\\.log\\(.*D.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*F.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["B+"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 🎯 Test Different Scores

Try different scores to see how the calculator works:

Type this code to test multiple scores:

\`\`\`javascript
let score = 95

if (score >= 97) {
  console.log("A+")
} else if (score >= 93) {
  console.log("A")
} else if (score >= 90) {
  console.log("A-")
} else if (score >= 87) {
  console.log("B+")
} else if (score >= 83) {
  console.log("B")
} else if (score >= 80) {
  console.log("B-")
} else if (score >= 77) {
  console.log("C+")
} else if (score >= 73) {
  console.log("C")
} else if (score >= 70) {
  console.log("C-")
} else if (score >= 67) {
  console.log("D+")
} else if (score >= 65) {
  console.log("D")
} else {
  console.log("F")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "score",
						expectedValue: { expected: 95 },
					},
					{
						type: "ifStatement",
						pattern: "score\\s*>=\\s*97",
						bodyPattern: "console\\.log\\(.*A\\+.*\\)",
						elseIfPatterns: [
							{
								condition: "score\\s*>=\\s*93",
								body: "console\\.log\\(.*A.*\\)",
							},
							{
								condition: "score\\s*>=\\s*90",
								body: "console\\.log\\(.*A-.*\\)",
							},
							{
								condition: "score\\s*>=\\s*87",
								body: "console\\.log\\(.*B\\+.*\\)",
							},
							{
								condition: "score\\s*>=\\s*83",
								body: "console\\.log\\(.*B.*\\)",
							},
							{
								condition: "score\\s*>=\\s*80",
								body: "console\\.log\\(.*B-.*\\)",
							},
							{
								condition: "score\\s*>=\\s*77",
								body: "console\\.log\\(.*C\\+.*\\)",
							},
							{
								condition: "score\\s*>=\\s*73",
								body: "console\\.log\\(.*C.*\\)",
							},
							{
								condition: "score\\s*>=\\s*70",
								body: "console\\.log\\(.*C-.*\\)",
							},
							{
								condition: "score\\s*>=\\s*67",
								body: "console\\.log\\(.*D\\+.*\\)",
							},
							{
								condition: "score\\s*>=\\s*65",
								body: "console\\.log\\(.*D.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*F.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["A"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Create Your Own Tier System!

Design your own categorization system:

**Requirements:**
- Create a variable \`rating\` with value \`8\`
- Create a tier system for ratings 1-10:
  - 9-10: "Excellent"
  - 7-8: "Good"  
  - 5-6: "Average"
  - 3-4: "Poor"
  - 1-2: "Terrible"
- Use if-else-if statements
- Test your system

\`\`\`javascript
// Type your tier system here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "rating",
						expectedValue: { expected: 8 },
					},
					{
						type: "ifStatement",
						pattern: "rating\\s*>=\\s*9",
						bodyPattern: "console\\.log\\(.*Excellent.*\\)",
						elseIfPatterns: [
							{
								condition: "rating\\s*>=\\s*7",
								body: "console\\.log\\(.*Good.*\\)",
							},
							{
								condition: "rating\\s*>=\\s*5",
								body: "console\\.log\\(.*Average.*\\)",
							},
							{
								condition: "rating\\s*>=\\s*3",
								body: "console\\.log\\(.*Poor.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*Terrible.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Good"],
					},
				],
			},
		],
	},
	{
		id: "lesson-30",
		title: "AND Operator",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔗 Multiple Conditions with AND

Use \`&&\` to check if BOTH conditions are true:

Type this code to check multiple requirements:

\`\`\`javascript
let age = 20
let hasLicense = true

if (age >= 18 && hasLicense === true) {
  console.log("You can drive!")
} else {
  console.log("You cannot drive!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 20 },
					},
					{
						type: "variableAssignment",
						variableName: "hasLicense",
						expectedValue: { expected: true },
					},
					{
						type: "ifStatement",
						pattern:
							"age\\s*>=\\s*18\\s*&&\\s*hasLicense\\s*===\\s*true",
						bodyPattern: "console\\.log\\(.*You can drive.*\\)",
						elsePattern: "console\\.log\\(.*You cannot drive.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["You can drive!"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 How AND Works

**\`&&\` means "AND":**
- Both conditions must be true
- If either is false, the whole thing is false
- Only runs the code if BOTH are true

**Examples:**
- \`true && true\` → true
- \`true && false\` → false  
- \`false && true\` → false
- \`false && false\` → false

---
Try changing one condition to see what happens:

\`\`\`javascript
let age = 20
let hasLicense = false

if (age >= 18 && hasLicense === true) {
  console.log("You can drive!")
} else {
  console.log("You cannot drive!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 20 },
					},
					{
						type: "variableAssignment",
						variableName: "hasLicense",
						expectedValue: { expected: false },
					},
					{
						type: "ifStatement",
						pattern:
							"age\\s*>=\\s*18\\s*&&\\s*hasLicense\\s*===\\s*true",
						bodyPattern: "console\\.log\\(.*You can drive.*\\)",
						elsePattern: "console\\.log\\(.*You cannot drive.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["You cannot drive!"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Multiple AND Conditions Challenge!

Create a complex eligibility checker:

**Requirements:**
- Create a variable \`age\` with value \`25\`
- Create a variable \`income\` with value \`50000\`
- Create a variable \`creditScore\` with value \`750\`
- Check if age >= 21 AND income >= 30000 AND creditScore >= 700
- If all true, log "Loan approved!"
- If any false, log "Loan denied!"

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 25 },
					},
					{
						type: "variableAssignment",
						variableName: "income",
						expectedValue: { expected: 50000 },
					},
					{
						type: "variableAssignment",
						variableName: "creditScore",
						expectedValue: { expected: 750 },
					},
					{
						type: "ifStatement",
						pattern:
							"age\\s*>=\\s*21\\s*&&\\s*income\\s*>=\\s*30000\\s*&&\\s*creditScore\\s*>=\\s*700",
						bodyPattern: "console\\.log\\(.*Loan approved.*\\)",
						elsePattern: "console\\.log\\(.*Loan denied.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Loan approved!"],
					},
				],
			},
		],
	},
	{
		id: "lesson-31",
		title: "OR Operator",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🔀 Either Condition with OR

Use \`||\` to check if EITHER condition is true:

Type this code to check flexible requirements:

\`\`\`javascript
let day = "Saturday"

if (day === "Saturday" || day === "Sunday") {
  console.log("It's the weekend!")
} else {
  console.log("It's a weekday!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "day",
						expectedValue: { expected: "Saturday" },
					},
					{
						type: "ifStatement",
						pattern:
							'day\\s*===\\s*"Saturday"\\s*\\|\\|\\s*day\\s*===\\s*"Sunday"',
						bodyPattern:
							"console\\.log\\(.*It\\'s the weekend.*\\)",
						elsePattern: "console\\.log\\(.*It\\'s a weekday.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["It's the weekend!"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 How OR Works

**\`||\` means "OR":**
- Either condition can be true
- If both are false, the whole thing is false
- Runs the code if EITHER is true

**Examples:**
- \`true || true\` → true
- \`true || false\` → true
- \`false || true\` → true
- \`false || false\` → false

---
Try a weekday to see the difference:

\`\`\`javascript
let day = "Monday"

if (day === "Saturday" || day === "Sunday") {
  console.log("It's the weekend!")
} else {
  console.log("It's a weekday!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "day",
						expectedValue: { expected: "Monday" },
					},
					{
						type: "ifStatement",
						pattern:
							'day\\s*===\\s*"Saturday"\\s*\\|\\|\\s*day\\s*===\\s*"Sunday"',
						bodyPattern:
							"console\\.log\\(.*It\\'s the weekend.*\\)",
						elsePattern: "console\\.log\\(.*It\\'s a weekday.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["It's a weekday!"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Flexible Access Control Challenge!

Create a system that allows access with multiple valid options:

**Requirements:**
- Create a variable \`userType\` with value \`"guest"\`
- Create a variable \`hasInvite\` with value \`true\`
- Allow access if userType === "admin" OR userType === "member" OR hasInvite === true
- If any condition is true, log "Access granted!"
- If all are false, log "Access denied!"

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "userType",
						expectedValue: { expected: "guest" },
					},
					{
						type: "variableAssignment",
						variableName: "hasInvite",
						expectedValue: { expected: true },
					},
					{
						type: "ifStatement",
						pattern:
							'userType\\s*===\\s*"admin"\\s*\\|\\|\\s*userType\\s*===\\s*"member"\\s*\\|\\|\\s*hasInvite\\s*===\\s*true',
						bodyPattern: "console\\.log\\(.*Access granted.*\\)",
						elsePattern: "console\\.log\\(.*Access denied.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Access granted!"],
					},
				],
			},
		],
	},
	{
		id: "lesson-32",
		title: "NOT Operator",
		skillNodeId: "conditionals",
		xpReward: 150,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## ❌ Inverting Conditions with NOT

Use \`!\` to flip a condition from true to false:

Type this code to check the opposite of a condition:

\`\`\`javascript
let isLoggedIn = false

if (!isLoggedIn) {
  console.log("Please log in!")
} else {
  console.log("Welcome back!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "isLoggedIn",
						expectedValue: { expected: false },
					},
					{
						type: "ifStatement",
						pattern: "!isLoggedIn",
						bodyPattern: "console\\.log\\(.*Please log in.*\\)",
						elsePattern: "console\\.log\\(.*Welcome back.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Please log in!"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 How NOT Works

**\`!\` means "NOT":**
- \`!true\` → false
- \`!false\` → true
- Flips any boolean value

**Common use:** Check if something is NOT true

---
Try with a logged-in user to see the difference:

\`\`\`javascript
let isLoggedIn = true

if (!isLoggedIn) {
  console.log("Please log in!")
} else {
  console.log("Welcome back!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "isLoggedIn",
						expectedValue: { expected: true },
					},
					{
						type: "ifStatement",
						pattern: "!isLoggedIn",
						bodyPattern: "console\\.log\\(.*Please log in.*\\)",
						elsePattern: "console\\.log\\(.*Welcome back.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Welcome back!"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Double Negation Challenge!

Use NOT operator to check for invalid states:

**Requirements:**
- Create a variable \`isValid\` with value \`false\`
- Create a variable \`isBlocked\` with value \`true\`
- Check if NOT isValid OR isBlocked
- If true, log "Account has issues!"
- If false, log "Account is good!"

\`\`\`javascript
// Type your code here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "isValid",
						expectedValue: { expected: false },
					},
					{
						type: "variableAssignment",
						variableName: "isBlocked",
						expectedValue: { expected: true },
					},
					{
						type: "ifStatement",
						pattern: "!isValid\\s*\\|\\|\\s*isBlocked",
						bodyPattern:
							"console\\.log\\(.*Account has issues.*\\)",
						elsePattern: "console\\.log\\(.*Account is good.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Account has issues!"],
					},
				],
			},
		],
	},
	{
		id: "lesson-33",
		title: "Combining Logical Operators",
		skillNodeId: "conditionals",
		xpReward: 200,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🧩 Complex Conditions

You can combine AND, OR, and NOT with parentheses for complex logic:

Type this code with complex conditions:

\`\`\`javascript
let age = 25
let hasLicense = true
let hasInsurance = false

if ((age >= 18 && hasLicense) || hasInsurance) {
  console.log("You can drive!")
} else {
  console.log("You cannot drive!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 25 },
					},
					{
						type: "variableAssignment",
						variableName: "hasLicense",
						expectedValue: { expected: true },
					},
					{
						type: "variableAssignment",
						variableName: "hasInsurance",
						expectedValue: { expected: false },
					},
					{
						type: "ifStatement",
						pattern:
							"\\(age\\s*>=\\s*18\\s*&&\\s*hasLicense\\)\\s*\\|\\|\\s*hasInsurance",
						bodyPattern: "console\\.log\\(.*You can drive.*\\)",
						elsePattern: "console\\.log\\(.*You cannot drive.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["You can drive!"],
					},
				],
			},
			{
				id: "step-2",
				content: `## 💡 How Parentheses Work

**Parentheses control order:**
- \`(A && B) || C\` - A AND B, OR C
- \`A && (B || C)\` - A AND (B OR C)

**In our example:**
- \`(age >= 18 && hasLicense)\` - must be 18+ AND have license
- \`|| hasInsurance\` - OR have insurance
- So: (adult with license) OR (anyone with insurance)

---
Try without insurance to see the difference:

\`\`\`javascript
let age = 16
let hasLicense = false
let hasInsurance = false

if ((age >= 18 && hasLicense) || hasInsurance) {
  console.log("You can drive!")
} else {
  console.log("You cannot drive!")
}
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 16 },
					},
					{
						type: "variableAssignment",
						variableName: "hasLicense",
						expectedValue: { expected: false },
					},
					{
						type: "variableAssignment",
						variableName: "hasInsurance",
						expectedValue: { expected: false },
					},
					{
						type: "ifStatement",
						pattern:
							"\\(age\\s*>=\\s*18\\s*&&\\s*hasLicense\\)\\s*\\|\\|\\s*hasInsurance",
						bodyPattern: "console\\.log\\(.*You can drive.*\\)",
						elsePattern: "console\\.log\\(.*You cannot drive.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["You cannot drive!"],
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Complex Eligibility Challenge!

Create a complex eligibility system:

**Requirements:**
- Create variables: \`age\` = 22, \`income\` = 40000, \`creditScore\` = 650, \`hasCosigner\` = true
- Allow loan if: (age >= 21 AND income >= 30000) OR (creditScore >= 700) OR hasCosigner
- If eligible, log "Loan approved!"
- If not eligible, log "Loan denied!"

\`\`\`javascript
// Type your complex condition here!
\`\`\``,
				tests: [
					{
						type: "variableAssignment",
						variableName: "age",
						expectedValue: { expected: 22 },
					},
					{
						type: "variableAssignment",
						variableName: "income",
						expectedValue: { expected: 40000 },
					},
					{
						type: "variableAssignment",
						variableName: "creditScore",
						expectedValue: { expected: 650 },
					},
					{
						type: "variableAssignment",
						variableName: "hasCosigner",
						expectedValue: { expected: true },
					},
					{
						type: "ifStatement",
						pattern:
							"\\(age\\s*>=\\s*21\\s*&&\\s*income\\s*>=\\s*30000\\)\\s*\\|\\|\\s*\\(creditScore\\s*>=\\s*700\\)\\s*\\|\\|\\s*hasCosigner",
						bodyPattern: "console\\.log\\(.*Loan approved.*\\)",
						elsePattern: "console\\.log\\(.*Loan denied.*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["Loan approved!"],
					},
				],
			},
		],
	},
	{
		id: "lesson-34",
		title: "Mini Project: Should I Go Outside?",
		skillNodeId: "conditionals",
		xpReward: 250,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				content: `## 🌤️ Weather Decision Maker

Let's build a program that decides if you should go outside!

Type this code to get weather information:

\`\`\`javascript
let weather = prompt("What's the weather? (sunny, rainy, cloudy)")
let temperature = prompt("What's the temperature? (enter a number)")

console.log("Weather:", weather)
console.log("Temperature:", temperature)
\`\`\``,
				tests: [
					{
						type: "codeContains",
						pattern:
							/prompt\("What's the weather\?.*sunny.*rainy.*cloudy.*"\)/,
					},
					{
						type: "codeContains",
						pattern:
							/prompt\("What's the temperature\?.*enter a number.*"\)/,
					},
					{
						type: "codeContains",
						pattern: /console\.log\("Weather:",\s*weather\)/,
					},
					{
						type: "codeContains",
						pattern:
							/console\.log\("Temperature:",\s*temperature\)/,
					},
				],
			},
			{
				id: "step-2",
				content: `## 🤔 Add Decision Logic

Now add if-else statements to make the decision:

Type this code to add the decision logic:

\`\`\`javascript
let weather = prompt("What's the weather? (sunny, rainy, cloudy)")
let temperature = prompt("What's the temperature? (enter a number)")

console.log("Weather:", weather)
console.log("Temperature:", temperature)

if (weather === "sunny" && temperature > 20) {
  console.log("Perfect day! Go outside!")
} else if (weather === "sunny" && temperature <= 20) {
  console.log("Sunny but cold. Maybe stay inside.")
} else if (weather === "rainy") {
  console.log("It's raining. Stay inside!")
} else if (weather === "cloudy" && temperature > 15) {
  console.log("Cloudy but warm. You could go outside.")
} else {
  console.log("Not ideal weather. Stay inside!")
}
\`\`\``,
				tests: [
					{
						type: "codeContains",
						pattern:
							/prompt\("What's the weather\?.*sunny.*rainy.*cloudy.*"\)/,
					},
					{
						type: "codeContains",
						pattern:
							/prompt\("What's the temperature\?.*enter a number.*"\)/,
					},
					{
						type: "ifStatement",
						pattern:
							'weather\\s*===\\s*"sunny"\\s*&&\\s*temperature\\s*>\\s*20',
						bodyPattern:
							"console\\.log\\(.*Perfect day.*Go outside.*\\)",
						elseIfPatterns: [
							{
								condition:
									'weather\\s*===\\s*"sunny"\\s*&&\\s*temperature\\s*<=\\s*20',
								body: "console\\.log\\(.*Sunny but cold.*\\)",
							},
							{
								condition: 'weather\\s*===\\s*"rainy"',
								body: "console\\.log\\(.*It\\'s raining.*\\)",
							},
							{
								condition:
									'weather\\s*===\\s*"cloudy"\\s*&&\\s*temperature\\s*>\\s*15',
								body: "console\\.log\\(.*Cloudy but warm.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*Not ideal weather.*\\)",
					},
				],
			},
			{
				id: "step-3",
				content: `## 🎯 Test Your Program!

Run your program and test different scenarios:

**Test these combinations:**
1. Weather: "sunny", Temperature: "25" → Should say "Perfect day!"
2. Weather: "sunny", Temperature: "15" → Should say "Sunny but cold"
3. Weather: "rainy", Temperature: "30" → Should say "It's raining"
4. Weather: "cloudy", Temperature: "18" → Should say "Cloudy but warm"

**Run the program and try each combination!**

\`\`\`javascript
// Your complete weather decision program
\`\`\``,
				tests: [
					{
						type: "codeContains",
						pattern:
							/prompt\("What's the weather\?.*sunny.*rainy.*cloudy.*"\)/,
					},
					{
						type: "codeContains",
						pattern:
							/prompt\("What's the temperature\?.*enter a number.*"\)/,
					},
					{
						type: "ifStatement",
						pattern:
							'weather\\s*===\\s*"sunny"\\s*&&\\s*temperature\\s*>\\s*20',
						bodyPattern:
							"console\\.log\\(.*Perfect day.*Go outside.*\\)",
						elseIfPatterns: [
							{
								condition:
									'weather\\s*===\\s*"sunny"\\s*&&\\s*temperature\\s*<=\\s*20',
								body: "console\\.log\\(.*Sunny but cold.*\\)",
							},
							{
								condition: 'weather\\s*===\\s*"rainy"',
								body: "console\\.log\\(.*It\\'s raining.*\\)",
							},
							{
								condition:
									'weather\\s*===\\s*"cloudy"\\s*&&\\s*temperature\\s*>\\s*15',
								body: "console\\.log\\(.*Cloudy but warm.*\\)",
							},
						],
						elsePattern: "console\\.log\\(.*Not ideal weather.*\\)",
					},
				],
			},
		],
	},
];
