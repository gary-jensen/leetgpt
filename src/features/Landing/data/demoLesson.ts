import { Lesson } from "@/features/Workspace/lesson-data/lesson-types";

export const demoLesson: Lesson = {
	id: "demo-lesson",
	title: "Interactive Demo",
	skillNodeId: "demo",
	xpReward: 0,
	stepXpReward: 0,
	steps: [
		{
			id: "step-1",
			content: `## 👋 Welcome to BitSchool!

This is our AI-powered coding workspace. Let's try it out!

---

**Your first task:** Type this code and click **Run**:

\`\`\`javascript
console.log("Hello, BitSchool!")
\`\`\``,
			tests: [
				{
					type: "consoleLogs",
					expectedOutput: ["Hello, BitSchool!"],
				},
			],
		},
		{
			id: "step-2",
			content: `## 🎉 Great job!

You just ran your first code! Notice how the output appeared in the console below.

---

Now let's create a **variable**. Type this:

\`\`\`javascript
let myName = "Your Name"
console.log(myName)
\`\`\`

*(Replace "Your Name" with your actual name)*`,
			tests: [
				{
					type: "variableAssignment",
					variableName: "myName",
					expectedValue: { expected: "__any__" },
				},
				{
					type: "consoleLogVariable",
					expectedOutput: "__any__",
					variableName: "myName",
				},
			],
		},
		{
			id: "step-3",
			content: `## 💪 Awesome!

Now let's try something more interesting. Create a **function** that adds two numbers:

\`\`\`javascript
function add(a, b) {
  return a + b
}

console.log(add(5, 3))
\`\`\`

This function should output **8** in the console.`,
			tests: [
				{
					type: "functionDeclaration",
					functionName: "add",
					parameters: ["a", "b"],
				},
				{
					type: "consoleLogs",
					expectedOutput: ["8"],
				},
			],
		},
		{
			id: "step-4",
			content: `## 🚀 Incredible work!

You've just experienced BitSchool's interactive workspace with:

✅ Real-time code execution  
✅ Instant AI feedback  
✅ Smart test validation  

---

**Ready to learn JavaScript for real?**

Sign up now and start your coding journey with AI-powered guidance!`,
			tests: [],
		},
	],
};

// Note: AI feedback is now handled by the real AI system
// No need for pre-written feedback templates
