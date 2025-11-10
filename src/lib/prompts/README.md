# Prompts Directory

This directory contains all prompts and contexts used for OpenAI API calls throughout the application. Each file is organized by feature area and contains functions that generate prompts with variables as arguments.

## Structure

- **algoCoach.ts** - Prompts for the algorithm coach feature (hints, chat, submission feedback)
- **adminAIFix.ts** - Prompts for admin AI-powered problem fixing
- **problemGeneration.ts** - Prompts for generating algorithm problems and test cases
- **secondaryCode.ts** - Prompts for generating non-optimal but correct solutions
- **aiFeedback.ts** - Prompts for providing AI feedback on JavaScript exercises

## Design Philosophy

All prompts are organized as functions that take variables as arguments. This approach:

1. **Centralizes prompt management** - All prompts are in one place, making them easy to find and update
2. **Enables versioning** - Changes to prompts can be tracked and documented
3. **Improves testability** - Prompts can be tested independently
4. **Reduces duplication** - Shared prompt components can be reused
5. **Makes variables explicit** - Function parameters clearly show what data is needed

## Usage Example

```typescript
import { getCoachSystemPrompt, buildHintContext } from "@/lib/prompts/algoCoach";

// Get system prompt
const systemPrompt = getCoachSystemPrompt();

// Build context with variables
const context = buildHintContext(
  problem,
  userCode,
  chatHistory,
  failureSummary
);

// Use in OpenAI API call
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: context },
  ],
});
```

## Documentation

Each prompt file includes:

- **File-level documentation** - Explains the purpose of prompts in that file
- **Function documentation** - JSDoc comments explaining parameters and return values
- **Inline comments** - Clarify complex prompt logic

## Adding New Prompts

When adding new prompts:

1. Create a function that takes variables as parameters
2. Use template literals to build the prompt string
3. Add JSDoc documentation
4. Export the function
5. Update this README if adding a new file

## Prompt Guidelines

- **Be specific** - Include clear instructions and examples
- **Use consistent formatting** - Follow existing patterns for structure
- **Include constraints** - Specify output format, length limits, etc.
- **Document variables** - Make it clear what each parameter represents
- **Keep prompts focused** - Each function should have a single, clear purpose

