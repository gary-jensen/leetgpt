import { Lesson } from "./temp-types";

export const mockLessons: Lesson[] = [
	{
		id: "lesson-1",
		title: "Hello World",
		skillNodeId: "variables",
		xpReward: 50,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				stepType: "overview",
				content:
					'## 🎉 Welcome to BitSchool \n\n BitSchool is a fun and fast way to learn JavaScript.\n\nIn 5 minutes, you&apos;ll understand topics most beginners spend days confused about.\n\n## 🚀 Ready to write your first line of real JavaScript code?\n \n\n\n`console.log()` is used to print text to the console.\n---\n✅ Try typing this code into the editor and hit run to see the output:\n\n```\nconsole.log("Hello, world!")\n```',
				tests: [
					{ type: "consoleLogs", expectedOutput: [`Hello, world!`] },
				],
			},
			{
				id: "step-2",
				stepType: "explanation",
				content:
					'That line of code tells JavaScript to *log* the message `"Hello, world!"` to the console.\n\nYou can see the message in the console now!\n---\nNext, log `"Testing"` followed by a comma and the number `123` like this:\n```js\nconsole.log("Testing", 123)```',
				tests: [
					{
						type: "consoleLogPattern",
						expectedOutput: `Testing 123`,
						pattern: /(["'])Testing\1\s*,\s*123/,
					},
				],
			},
		],
	},
	{
		id: "lesson-2",
		title: "Variables and Math",
		skillNodeId: "variables",
		xpReward: 50,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				stepType: "overview",
				content:
					"## 🔥 You finished your first lesson!\n\nComplete all X lessons in this chapter to unlock the next topic.\n\nAs you saw, when you use a comma in a `console.log()` statement, it prints the data (called arguments) seperated by a space.\n## ⭐ Let&apos;s Learn Variables!\n\nVariables store data that you can use later. Create a variable called `favoriteNumber` and set it to `300` by running this code:\n```js\nlet favoriteNumber = 300\n```",
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
				stepType: "explanation",
				content:
					'# 🎉 Fantastic!\n\nNow on the second line, initialize a variable `greeting` to the string `"My favorite number is"` by adding this to the second line:\n```\nlet greeting = "My favorite number is"\n```',
				startingCode: `let favoriteNumber = 300\n`,
				tests: [
					{
						type: "variableAssignment",
						variableName: "favoriteNumber",
						expectedValue: {
							expected: 300,
						},
					},
					{
						type: "variableAssignment",
						variableName: "greeting",
						expectedValue: {
							expected: "My favorite number is",
						},
					},
				],
			},
			{
				id: "step-3",
				stepType: "explanation",
				content:
					"# 🎉 Last but not least\n\nOn the *third* line: log `greeting` and then `favoriteNumber` to the console, seperated by a comma so it prints a complete sentence like this:\n\n```\nconsole.log(greeting, favoriteNumber)```",
				startingCode: `let favoriteNumber = 300\nlet greeting = "My favorite number is"\n`,
				tests: [
					{
						type: "variableAssignment",
						variableName: "favoriteNumber",
						expectedValue: {
							expected: 300,
						},
					},
					{
						type: "variableAssignment",
						variableName: "greeting",
						expectedValue: {
							expected: "My favorite number is",
						},
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
	{
		id: "lesson-3",
		title: "Functions Basics",
		skillNodeId: "functions",
		xpReward: 140,
		stepXpReward: 35,
		steps: [
			{
				id: "step-1",
				stepType: "overview",
				content:
					'Functions are reusable blocks of code. Create a function called `greet` that takes a name and logs `"Hello, " + name`:\n```js\nfunction greet(name) {\n  console.log("Hello, " + name);\n}\n```',
				tests: [
					{
						type: "functionDeclaration",
						functionName: "greet",
						parameters: ["name"],
						functionType: "regular",
					},
				],
			},
			{
				id: "step-2",
				stepType: "explanation",
				content:
					'Now call your function with the name "Alice":\n```js\ngreet("Alice")\n```',
				startingCode: `function greet(name) {
  console.log("Hello, " + name);
}\n`,
				tests: [
					{
						type: "functionCall",
						functionName: "greet",
						expectedCount: 1,
						expectedArgs: [["Alice"]],
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
		id: "lesson-4",
		title: "Arrow Functions",
		skillNodeId: "functions",
		xpReward: 160,
		stepXpReward: 40,
		steps: [
			{
				id: "step-1",
				stepType: "overview",
				content:
					"Arrow functions are a shorter way to write functions. Create an arrow function called `add` that takes two numbers and returns their sum:\n```js\nconst add = (a, b) => a + b\n```",
				tests: [
					{
						type: "functionDeclaration",
						functionName: "add",
						parameters: ["a", "b"],
						functionType: "arrow",
					},
				],
			},
			{
				id: "step-2",
				stepType: "explanation",
				content:
					"Now call your function with the numbers 5 and 3, and log the result:\n```js\nconsole.log(add(5, 3))\n```",
				startingCode: `const add = (a, b) => a + b\n`,
				tests: [
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
				],
			},
		],
	},
	{
		id: "lesson-5",
		title: "For Loops",
		skillNodeId: "loops",
		xpReward: 180,
		stepXpReward: 45,
		steps: [
			{
				id: "step-1",
				stepType: "overview",
				content:
					"Loops repeat code multiple times. Create a for loop that counts from 1 to 5 and logs each number:\n```js\nfor (let i = 1; i <= 5; i++) {\n  console.log(i)\n}\n```",
				tests: [
					{
						type: "forLoop",
						pattern: "i\\s*<=\\s*5",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["1", "2", "3", "4", "5"],
					},
				],
			},
		],
	},
	{
		id: "lesson-6",
		title: "While Loops",
		skillNodeId: "loops",
		xpReward: 200,
		stepXpReward: 50,
		steps: [
			{
				id: "step-1",
				stepType: "overview",
				content:
					"While loops repeat as long as a condition is true. Create a while loop that counts down from 3 to 1:\n```js\nlet count = 3\nwhile (count > 0) {\n  console.log(count)\n  count--\n}\n```",
				tests: [
					{
						type: "codeContains",
						pattern: "while\\s*\\([^)]*\\)",
					},
					{
						type: "consoleLogs",
						expectedOutput: ["3", "2", "1"],
					},
				],
			},
		],
	},
	{
		id: "lesson-7",
		title: "If Statements",
		skillNodeId: "conditionals",
		xpReward: 220,
		stepXpReward: 55,
		steps: [
			{
				id: "step-1",
				stepType: "overview",
				content:
					'If statements make decisions in code. Create a variable `score` set to 85, then use an if statement to check if it\'s greater than 80 and log "Great job!":\n```js\nlet score = 85\nif (score > 80) {\n  console.log("Great job!")\n}\n```',
				tests: [
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
		],
	},
	{
		id: "lesson-8",
		title: "If-Else Statements",
		skillNodeId: "conditionals",
		xpReward: 240,
		stepXpReward: 60,
		steps: [
			{
				id: "step-1",
				stepType: "overview",
				content:
					'If-else statements handle two different cases. Create a variable `age` set to 17, then use if-else to check if age is 18 or older and log "Adult" or "Minor":\n```js\nlet age = 17\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}\n```',
				tests: [
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
		],
	},
	// fake repeated lessons to test skill tree overlay
	// {
	// 	id: "lesson-4",
	// 	title: "Arrow Functions",
	// 	skillNodeId: "functions2",
	// 	xpReward: 160,
	// 	stepXpReward: 40,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				"Arrow functions are a shorter way to write functions. Create an arrow function called `add` that takes two numbers and returns their sum:\n```js\nconst add = (a, b) => a + b\n```",
	// 			tests: [
	// 				{
	// 					type: "functionDeclaration",
	// 					functionName: "add",
	// 					parameters: ["a", "b"],
	// 					functionType: "arrow",
	// 				},
	// 			],
	// 		},
	// 		{
	// 			id: "step-2",
	// 			stepType: "explanation",
	// 			content:
	// 				"Now call your function with the numbers 5 and 3, and log the result:\n```js\nconsole.log(add(5, 3))\n```",
	// 			startingCode: `const add = (a, b) => a + b\n`,
	// 			tests: [
	// 				{
	// 					type: "functionCall",
	// 					functionName: "add",
	// 					expectedCount: 1,
	// 					expectedArgs: [[5, 3]],
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["8"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-5",
	// 	title: "For Loops",
	// 	skillNodeId: "loops2",
	// 	xpReward: 180,
	// 	stepXpReward: 45,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				"Loops repeat code multiple times. Create a for loop that counts from 1 to 5 and logs each number:\n```js\nfor (let i = 1; i <= 5; i++) {\n  console.log(i)\n}\n```",
	// 			tests: [
	// 				{
	// 					type: "forLoop",
	// 					pattern: "i\\s*<=\\s*5",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["1", "2", "3", "4", "5"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-6",
	// 	title: "While Loops",
	// 	skillNodeId: "loops2",
	// 	xpReward: 200,
	// 	stepXpReward: 50,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				"While loops repeat as long as a condition is true. Create a while loop that counts down from 3 to 1:\n```js\nlet count = 3\nwhile (count > 0) {\n  console.log(count)\n  count--\n}\n```",
	// 			tests: [
	// 				{
	// 					type: "codeContains",
	// 					pattern: "while\\s*\\([^)]*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["3", "2", "1"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-7",
	// 	title: "If Statements",
	// 	skillNodeId: "conditionals2",
	// 	xpReward: 220,
	// 	stepXpReward: 55,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				'If statements make decisions in code. Create a variable `score` set to 85, then use an if statement to check if it\'s greater than 80 and log "Great job!":\n```js\nlet score = 85\nif (score > 80) {\n  console.log("Great job!")\n}\n```',
	// 			tests: [
	// 				{
	// 					type: "ifStatement",
	// 					pattern: "score\\s*>\\s*80",
	// 					bodyPattern: "console\\.log\\(.*Great job.*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["Great job!"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-8",
	// 	title: "If-Else Statements",
	// 	skillNodeId: "conditionals2",
	// 	xpReward: 240,
	// 	stepXpReward: 60,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				'If-else statements handle two different cases. Create a variable `age` set to 17, then use if-else to check if age is 18 or older and log "Adult" or "Minor":\n```js\nlet age = 17\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}\n```',
	// 			tests: [
	// 				{
	// 					type: "ifStatement",
	// 					pattern: "age\\s*>=\\s*18",
	// 					elsePattern: "console\\.log\\(.*Minor.*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["Minor"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-8",
	// 	title: "If-Else Statements",
	// 	skillNodeId: "sd",
	// 	xpReward: 240,
	// 	stepXpReward: 60,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				'If-else statements handle two different cases. Create a variable `age` set to 17, then use if-else to check if age is 18 or older and log "Adult" or "Minor":\n```js\nlet age = 17\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}\n```',
	// 			tests: [
	// 				{
	// 					type: "ifStatement",
	// 					pattern: "age\\s*>=\\s*18",
	// 					elsePattern: "console\\.log\\(.*Minor.*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["Minor"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-8",
	// 	title: "If-Else Statements",
	// 	skillNodeId: "s322d",
	// 	xpReward: 240,
	// 	stepXpReward: 60,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				'If-else statements handle two different cases. Create a variable `age` set to 17, then use if-else to check if age is 18 or older and log "Adult" or "Minor":\n```js\nlet age = 17\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}\n```',
	// 			tests: [
	// 				{
	// 					type: "ifStatement",
	// 					pattern: "age\\s*>=\\s*18",
	// 					elsePattern: "console\\.log\\(.*Minor.*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["Minor"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-8",
	// 	title: "If-Else Statements",
	// 	skillNodeId: "s634d",
	// 	xpReward: 240,
	// 	stepXpReward: 60,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				'If-else statements handle two different cases. Create a variable `age` set to 17, then use if-else to check if age is 18 or older and log "Adult" or "Minor":\n```js\nlet age = 17\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}\n```',
	// 			tests: [
	// 				{
	// 					type: "ifStatement",
	// 					pattern: "age\\s*>=\\s*18",
	// 					elsePattern: "console\\.log\\(.*Minor.*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["Minor"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-8",
	// 	title: "If-Else Statements",
	// 	skillNodeId: "s1771d",
	// 	xpReward: 240,
	// 	stepXpReward: 60,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				'If-else statements handle two different cases. Create a variable `age` set to 17, then use if-else to check if age is 18 or older and log "Adult" or "Minor":\n```js\nlet age = 17\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}\n```',
	// 			tests: [
	// 				{
	// 					type: "ifStatement",
	// 					pattern: "age\\s*>=\\s*18",
	// 					elsePattern: "console\\.log\\(.*Minor.*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["Minor"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-8",
	// 	title: "If-Else Statements",
	// 	skillNodeId: "s34634d",
	// 	xpReward: 240,
	// 	stepXpReward: 60,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				'If-else statements handle two different cases. Create a variable `age` set to 17, then use if-else to check if age is 18 or older and log "Adult" or "Minor":\n```js\nlet age = 17\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}\n```',
	// 			tests: [
	// 				{
	// 					type: "ifStatement",
	// 					pattern: "age\\s*>=\\s*18",
	// 					elsePattern: "console\\.log\\(.*Minor.*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["Minor"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-8",
	// 	title: "If-Else Statements",
	// 	skillNodeId: "sd1613et",
	// 	xpReward: 240,
	// 	stepXpReward: 60,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				'If-else statements handle two different cases. Create a variable `age` set to 17, then use if-else to check if age is 18 or older and log "Adult" or "Minor":\n```js\nlet age = 17\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}\n```',
	// 			tests: [
	// 				{
	// 					type: "ifStatement",
	// 					pattern: "age\\s*>=\\s*18",
	// 					elsePattern: "console\\.log\\(.*Minor.*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["Minor"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	// {
	// 	id: "lesson-8",
	// 	title: "If-Else Statements",
	// 	skillNodeId: "24572sd",
	// 	xpReward: 240,
	// 	stepXpReward: 60,
	// 	steps: [
	// 		{
	// 			id: "step-1",
	// 			stepType: "overview",
	// 			content:
	// 				'If-else statements handle two different cases. Create a variable `age` set to 17, then use if-else to check if age is 18 or older and log "Adult" or "Minor":\n```js\nlet age = 17\nif (age >= 18) {\n  console.log("Adult")\n} else {\n  console.log("Minor")\n}\n```',
	// 			tests: [
	// 				{
	// 					type: "ifStatement",
	// 					pattern: "age\\s*>=\\s*18",
	// 					elsePattern: "console\\.log\\(.*Minor.*\\)",
	// 				},
	// 				{
	// 					type: "consoleLogs",
	// 					expectedOutput: ["Minor"],
	// 				},
	// 			],
	// 		},
	// 	],
	// },
];

// Export lesson metadata for validation
export const lessonMetadata = mockLessons.map((lesson) => ({
	id: lesson.id,
	skillNodeId: lesson.skillNodeId,
}));

// Export valid lesson IDs set for O(1) lookup
export const validLessonIds = new Set(mockLessons.map((l) => l.id));
