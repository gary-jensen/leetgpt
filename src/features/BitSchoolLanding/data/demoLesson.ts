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
			content: `## 🧪 Test Our AI Feedback System

Welcome to BitSchool! This demo showcases our intelligent testing and AI feedback.

**Try this:** Type the code below and click **Run**:

\`\`\`javascript
console.log("Hello, BitSchool!")
\`\`\`

💡 **Pro tip:** Try making mistakes on purpose to see our AI in action!`,
			tests: [
				{
					type: "consoleLogs",
					expectedOutput: ["Hello, BitSchool!"],
				},
			],
		},
		{
			id: "step-2",
			content: `## 🎯 Now Try Breaking It!

Great! You saw the output in the console.

**Challenge:** Try typing something wrong and click Run to see our AI feedback system in action.

Then fix it and try again:

\`\`\`javascript
let count = 10
console.log(count)
\`\`\`

💡 **Experiment:** Try typing the wrong variable name, or forgetting \`console.log()\``,
			tests: [
				{
					type: "variableAssignment",
					variableName: "count",
					expectedValue: { expected: 10 },
				},
				{
					type: "consoleLogs",
					expectedOutput: ["10"],
				},
			],
		},
		{
			id: "step-3",
			content: `## 🎉 You've Seen the Magic!

You just experienced BitSchool's powerful features:

✅ **Smart Testing** - Detects exactly what went wrong

✅ **AI Feedback** - Personalized hints for every mistake

✅ **Real-time Execution** - See results instantly

✅ **Intelligent Guidance** - Learns from your code


---

**Ready to learn JavaScript with AI that actually helps?**

Sign up now and start your coding journey!`,
			tests: [],
		},
	],
};

// Note: AI feedback is now handled by the real AI system
// No need for pre-written feedback templates
