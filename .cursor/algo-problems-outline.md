# AI‑BitSchool Interview Prep — Implementation Context for Cursor

> Purpose: Implement the next iteration of BitSchool with a Problems List, an Integrated Workspace (problem + editor + tests + AI mentor), and Standalone Lesson pages (SEO‑friendly). **Exclude Progress and Mentor standalone pages** for now. Reuse existing BitSchool judge and auth where possible.

---

## 0) High‑level Goals

-   Teach core algorithm topics via **short lessons** and **guided problem solving**.
-   Provide **tiered, no‑spoiler hints** inside the workspace; only reveal full code on explicit request.
-   Keep a seperate page route for **SEO‑crawlable lessons**.
-   Use **BitSchool’s existing code runner/judge** and auth.
-   Ship fast: implement core loop, seed 10–20 original problems, instrument analytics.

---

## 1) Information Architecture / Routes

-   `/algorithms` — **Home/Dashboard (lightweight)**

    -   Cards: Continue (last problem/lesson), Quick links: Lessons, Problems.

-   `/algorithms/lessons` — **Lesson List** (public, SEO)
-   `/algorithms/lessons/[lessonId]` — **Standalone Lesson** (public, SEO‑ready SSG)
-   `/algorithms/problems` — **Problems List** (public browse; solving requires login)
-   `/algorithms/workspace/[problemId]` — **Integrated Workspace** (problem + editor + tests + AI chat)

---

## 2) Data Storage & Content Structure

### Database Models (Algorithm Progress Only)

**Note: We already have `UserProgress` table for JavaScript lessons. We'll add algorithm-specific progress tracking:**

```prisma
// Add to existing User model
model User {
  // ... existing fields ...
  algoProblemProgress AlgoProblemProgress[]
  algoLessonProgress  AlgoLessonProgress[]
}

// Single table for algorithm problem progress (progress + code + chat)
model AlgoProblemProgress {
  id          String   @id @default(cuid())
  userId      String
  problemId   String   // References hardcoded problem ID (e.g., "sum-to-target")
  language    String   // "javascript" | "python" | "typescript" | "java"
  status      String   // "not_started" | "in_progress" | "completed"
  currentCode String   @db.Text // Latest code (properly escaped)
  chatHistory Json    // Array of chat messages with AI
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  User        User     @relation(fields: [userId], references: [id])

  @@unique([userId, problemId, language])
}

// Separate table for algorithm lesson progress (simpler, no code/chat needed)
model AlgoLessonProgress {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String   // References hardcoded lesson ID (e.g., "hashmap-basics")
  status      String   // "not_started" | "in_progress" | "completed"
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  User        User     @relation(fields: [userId], references: [id])

  @@unique([userId, lessonId])
}
```

**Existing `UserProgress` table remains unchanged for JavaScript lessons:**

-   `lessonProgress` JSON field continues to track JavaScript lesson progress
-   New algorithm progress is tracked separately in `AlgoProblemProgress` and `AlgoLessonProgress`

### Hardcoded Content Structure

**All lessons and problems are hardcoded in TypeScript files:**

-   `/src/features/algorithms/data/algoLessons.ts` — All algorithm lesson content
-   `/src/features/algorithms/data/algoProblems.ts` — All algorithm problem content
-   `/src/features/algorithms/data/index.ts` — Content utilities and filtering

**Content Organization:**

```ts
// /src/features/algorithms/data/algoLessons.ts
export const algoLessons: AlgoLesson[] = [
  {
    id: "hashmap-basics",
    slug: "hashmap-basics",
    title: "Hash Maps: The O(1) Lookup",
    summary: "Learn how hash maps provide constant-time lookups and when to use them.",
    topics: ["hashmap", "arrays"],
    difficulty: "easy",
    readingMinutes: 3,
    bodyMd: "# Hash Maps: The O(1) Lookup\n\nHash maps..."
  },
  // ... more lessons
];

// /src/features/algorithms/data/algoProblems.ts
export const algoProblems: AlgoProblemDetail[] = [
  {
    id: "sum-to-target",
    slug: "sum-to-target",
    title: "Sum to Target",
    statementMd: "Given an array of integers...",
    topics: ["arrays", "hashmap"],
    difficulty: "easy",
    languages: ["javascript"], // MVP: JavaScript only
    rubric: { optimal_time: "O(n)", acceptable_time: ["O(n log n)"] },
    tests: [
      { input: [[2, 7, 11, 15], 9], output: [0, 1] }
    ],
    startingCode: {
      javascript: "function twoSum(nums, target) {\n  // Your code here\n}"
    }
    // Hints are AI-generated, not hardcoded
  },
  // ... more problems
];

// /src/features/algorithms/data/index.ts
export function getAlgoProblems(filters?: FilterOptions): AlgoProblemMeta[] { ... }
export function getAlgoLessons(filters?: FilterOptions): AlgoLesson[] { ... }
export function getAlgoProblem(id: string): AlgoProblemDetail | null { ... }
export function getAlgoLesson(id: string): AlgoLesson | null { ... }
```

### Problem JSON schema (source of truth)

```json
{
	"id": "sum-to-target-bs01",
	"slug": "sum-to-target",
	"title": "Sum to Target",
	"statementMd": "Given an array...",
	"topics": ["arrays", "hashmap"],
	"difficulty": "easy",
	"languages": ["javascript"], // MVP: JavaScript only
	"rubric": { "optimal_time": "O(n)", "acceptable_time": ["O(n log n)"] },
	"tests": [
		{
			"input": [[2, 7, 11, 15], 9],
			"output": [0, 1]
		}
	],
	"startingCode": {
		"javascript": "function twoSum(nums, target) {\n  // Your code here\n}"
	}
	// Hints are AI-generated, not stored in JSON
}
```

---

## 3) Pages — UX & Components

**All page here are sub-pages of the `/algorithms` route**

### `/problems` (Problems List)

**Features**

-   Filters: Topic (multi‑select), Difficulty, Status (Solved/Unsolved/Attempted — optional for later), Language.
-   Sort: Difficulty, A‑Z, Recently Added.
-   Search: title keywords.
-   Each row/card: Title, Difficulty badge, Topic tags, supported languages, CTA → "Solve".

**Components**

-   `<ProblemsFilters />`, `<ProblemsTable />`, `<DifficultyBadge />`, `<TopicTags />`.

### `/algorithms/workspace/[problemId]` (Integrated Workspace)

**Layout (3‑pane) - Reusing existing Workspace components**

-   **Left (collapsible):** Problem statement + related lesson preview (if exists).
-   **Center:** Monaco editor (reuse existing `Editor` component), toolbar: Run, Submit, Reset, Hint, "Try Optimal Approach" (visible after pass).
-   **Right:** AI Mentor Chat (reuse existing `Chat` components with AI input): shows prior hints, user messages, and system reminders.
-   **Bottom (full‑width):** Test results display + optional Console tab for debugging.

**Test Results Display:**

-   **Test Cases Tab (default):** Shows pass/fail status for each test case with input/output
-   **Console Tab (optional):** Debug console with logs, errors, and execution details (like LeetCode's debugger)

**Test Case Component Design:**

```tsx
// TestResultsDisplay.tsx
interface TestResult {
	case: number;
	passed: boolean;
	input: any[];
	expected: any;
	actual?: any;
	error?: string;
}

// TestCaseItem.tsx - Individual test case display
interface TestCaseItemProps {
	result: TestResult;
	isExpanded?: boolean;
}
```

**Edge interactions**

-   Persist code locally (localStorage) + autosave to server on Submit.
-   Keyboard shortcuts: Ctrl/Cmd+Enter (Run), Shift+Enter (Submit), Ctrl/Cmd+H (Hint).
-   **AI Chat Input**: Users can type questions/hints directly to AI mentor (reuse existing chat input from learn workspace).
-   **Context-aware AI**: AI mentor has access to problem statement, user's code, test results, and chat history.

### `/lessons` (Lesson List)

-   Filter/sort by topic, difficulty, time.
-   Card list with title, summary, reading minutes, topics.

### `/lessons/[lessonId]` (Standalone Lesson)

-   Static SSG page; Markdown rendered; ToC; CTA: "Practice a related problem" → opens workspace with suggested problem.
-   SEO: static meta, JSON‑LD (`Article` or `Course`), internal linking to related lessons/problems.

### `/` (Home)

-   Cards: Continue last activity; Quick links to Problems & Lessons; 2–4 recommended items.

---

## 4) Server Functions (No API Routes)

### Client-side Code Execution

**Code execution happens entirely in the browser - no server functions needed**

```ts
// Client-side code execution utilities
export function executeCode(
	code: string,
	language: "javascript", // MVP: JavaScript only
	tests: TestCase[]
): Promise<{
	status: "ok" | "error";
	results: Array<{
		case: number;
		passed: boolean;
		input?: string;
		expected?: string;
		actual?: string;
	}>;
	runMs?: number;
	message?: string;
}>;

// Test case interface (matches existing FunctionTest structure)
export interface TestCase {
	input: any[]; // Array where each element is a parameter
	output: any; // Expected return value
}
```

### AI Coach Functions

**`getHint(problemId, code?, chatHistory?, failureSummary?)`**

```ts
// Server function in /src/lib/actions/coach.ts
export async function getHint(
	problemId: string,
	code?: string,
	chatHistory?: ChatMessage[],
	failureSummary?: string
): Promise<{
	message: string; // AI-generated hint (<= 200 chars; no code blocks)
	followUpQuestion?: string; // AI-generated Socratic nudge
}>;
```

**`reviewOptimality(problemId, code, language)`**

```ts
// Server function in /src/lib/actions/coach.ts
export async function reviewOptimality(
	problemId: string,
	code: string,
	language: string
): Promise<{
	isOptimal: boolean;
	summary: string; // AI-generated Big‑O and pattern name
	suggestion?: string; // AI-generated high‑level guidance, no full code
}>;
```

### Content Functions

**`getAlgoProblems(filters?)`** and **`getAlgoLessons(filters?)`**

```ts
// Server functions in /src/lib/actions/content.ts
export async function getAlgoProblems(filters?: {
	topic?: string;
	difficulty?: string;
	search?: string;
}): Promise<ProblemMeta[]>;

export async function getAlgoLessons(filters?: {
	topic?: string;
	difficulty?: string;
	search?: string;
}): Promise<Lesson[]>;

export async function getAlgoProblem(problemId: string): Promise<ProblemDetail>;
export async function getAlgoLesson(lessonId: string): Promise<Lesson>;
```

### Progress Functions

**`getAlgoProgress(userId)`** and **`updateAlgoProgress(userId, type, id, status)`**

```ts
// Server functions in /src/lib/actions/progress.ts
export async function getAlgoProgress(userId: string): Promise<{
	problemProgress: AlgoProblemProgress[];
	lessonProgress: AlgoLessonProgress[];
}>;

export async function updateAlgoLessonProgress(
	userId: string,
	lessonId: string,
	status: "not_started" | "in_progress" | "completed"
): Promise<void>;
```

### Progress Functions (Combined)

**`getAlgoProblemProgress(userId, problemId, language)`** and **`updateAlgoProblemProgress(userId, problemId, language, code, chatHistory, status?)`**

```ts
// Server functions in /src/lib/actions/progress.ts
export async function getAlgoProblemProgress(
	userId: string,
	problemId: string,
	language: string
): Promise<{
	status: "not_started" | "in_progress" | "completed";
	currentCode: string;
	chatHistory: ChatMessage[];
	completedAt?: Date;
} | null>;

export async function updateAlgoProblemProgress(
	userId: string,
	problemId: string,
	language: "javascript", // MVP: JavaScript only
	code: string,
	chatHistory: ChatMessage[],
	status?: "not_started" | "in_progress" | "completed"
): Promise<void>;

export async function addChatMessage(
	userId: string,
	problemId: string,
	language: "javascript", // MVP: JavaScript only
	message: ChatMessage
): Promise<void>;

export async function markProblemCompleted(
	userId: string,
	problemId: string,
	language: "javascript" // MVP: JavaScript only
): Promise<void>;

// Chat message structure
export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}
```

---

## 5) AI Mentor — Prompting & Policy

**System prompt (AI coach)**

```
You are a coding mentor inside an interview‑prep IDE. Your job is to guide without spoiling.
Rules:
1) Give at most ONE short hint per request (<= 200 characters). Prefer a question over a statement.
2) Never output full code unless the user has explicitly clicked "Show solution" (server flag allowSolution=true).
3) Use chat history to understand context and avoid repeating previous hints.
4) When asked "is this optimal?", describe Big‑O and name the higher‑level pattern, without code.
5) If tests fail, focus on the smallest failing case or likely bug location; ask a targeted question.
6) Be concise, friendly, and constructive.
7) All hints and feedback are generated dynamically based on the user's code and problem context.
8) Your job is to help guide the user to coming up with the solution on their own. This will be hard for them, but it's the best way to learn.
```

**Server‑side guardrails (in server functions)**

-   The server function uses chat history to maintain context and avoid repetition.
-   Rate limiting handled in server functions, not API routes.

---

## 6) UI States & Edge Cases

-   **Unauthenticated Submit:** redirect to login modal; allow Run with ephemeral storage.
-   **Network errors:** toast + retry button; preserve code locally.
-   **Long‑running code:** show spinner + cancel; enforce timeouts per language.
-   **Language switching:** persist per user/problem, keep separate code buffers per language.
-   **Hint abuse:** soft throttle (e.g., 1 hint / 10s) + "Consider reading the lesson" CTA after 3+ hints.
-   **Lesson Recap:** if the user is having troubles or is not understanding, we can pass the topics' lessons to the AI for it to give a recap lesson

---

## 7) Analytics/Telemetry

-   `problems_viewed`, `problem_opened`, `lesson_opened`
-   `run_clicked`, `submit_clicked`, `run_result` (pass rate), `submit_result`
-   `hint_requested`
-   Basic funnel: Problems → Workspace → Run → Submit → Pass → OptimalFlow

Store minimally and anonymize where possible.

---

## 8) SEO for Lessons

-   Render lessons with **SSG (getStaticParams / generateStaticParams)**.
-   `<head>`: unique `<title>`, meta description, canonical URL.
-   JSON‑LD (`Article`/`Course`).
-   Internal links to related lessons and problems.
-   Fast LCP: prefetch fonts, optimize images (next/image).

---

## 9) Component Inventory (React + Tailwind)

### **Reused Components (moved to root level)**

-   `Editor` → `/src/components/Editor` (from Workspace)
-   `Chat` → `/src/components/Chat` (from Workspace)
-   `Console` → `/src/components/Console` (from Workspace)
-   `CodeExecutor` → `/src/lib/codeExecutor` (from Workspace)
-   `useConsole` → `/src/hooks/useConsole` (from Workspace)

### **New Algorithm-Specific Components**

-   `PageShell` (header/nav, container)
-   `FiltersBar`, `SearchInput`, `PillTag`, `DifficultyBadge`
-   `ProblemsTable`, `ProblemCard`
-   `LessonCard`, `LessonContent` (Markdown renderer)
-   `WorkspaceLayout` (left/center/right/bottom regions)
-   `TestResultsDisplay` (test cases with pass/fail status)
-   `TestCaseItem` (individual test case display)
-   `ConsoleTab` (optional debug console - reuse existing Console component)
-   `ChatPanel` (AI coach with input)
-   `Toolbar` (Run/Submit/Reset/Hint/Optimal)
-   `Modal` (Optimal approach opt‑in)

---

## 10) Example TypeScript Types (frontend)

```ts
export type Difficulty = "easy" | "medium" | "hard";

export interface AlgoLesson {
	id: string;
	slug: string;
	title: string;
	summary: string;
	topics: string[];
	difficulty: Difficulty;
	readingMinutes: number;
	bodyMd: string;
}

export interface AlgoProblemMeta {
	id: string;
	slug: string;
	title: string;
	topics: string[];
	difficulty: Difficulty;
	languages: string[];
}

export interface AlgoProblemDetail extends AlgoProblemMeta {
	statementMd: string;
	rubric: { optimal_time: string; acceptable_time: string[] };
	tests: { input: any[]; output: any }[];
	startingCode: { [language: string]: string }; // Starting code for each language
	// Hints are AI-generated, not stored in hardcoded data
}

export interface AlgoProblemProgress {
	id: string;
	userId: string;
	problemId: string;
	language: "javascript"; // MVP: JavaScript only
	status: "not_started" | "in_progress" | "completed";
	currentCode: string;
	chatHistory: ChatMessage[];
	completedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface AlgoLessonProgress {
	id: string;
	userId: string;
	lessonId: string;
	status: "not_started" | "in_progress" | "completed";
	completedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
}

export interface RunRequest {
	problemId: string;
	language: string;
	code: string;
}
export interface RunResult {
	status: "ok" | "error";
	results?: {
		case: number;
		passed: boolean;
		input?: string;
		expected?: string;
		actual?: string;
	}[];
	runMs?: number;
	memoryKb?: number;
	message?: string;
}

export interface SubmitResult {
	status: "passed" | "failed" | "timeout" | "error";
	smallestFail?: { input: string; expected: string; actual: string };
	runMs?: number;
	memoryKb?: number;
}

export interface HintResponse {
	message: string;
	followUpQuestion?: string;
}
```

---

## 11) Client-side Code Execution

-   All code execution happens in the browser using existing code execution files
-   No server-side code execution or sandboxing needed
-   Both "Run" and "Submit" use the same test cases
-   Return per‑case results for all tests

### Test Structure

**All Tests (Client-side only):**

-   Stored in hardcoded `algoProblems` data
-   Both "Run" and "Submit" use the same test cases
-   Users can see all test results for debugging
-   No server-side code execution

**Note:** Since all code execution happens client-side, there's no distinction between "public" and "private" tests. All tests are visible to users, which is fine for a learning platform focused on understanding algorithms rather than preventing cheating.

---

## 12) Feature Flags / Env

-   `NEXT_PUBLIC_WORKSPACE_HINTS_ENABLED=true`
-   `HINT_RATE_LIMIT_PER_MIN=6`
-   `JUDGE_RUN_TIMEOUT_MS=5000` (language‑specific overrides allowed)
-   `COACH_MODEL=...` / `COACH_TEMPERATURE=0.2` / `COACH_MAX_TOKENS=512`
-   `ALLOW_SOLUTION=false` default; set true only after explicit user action.

---

## 13) Security & Compliance

-   Sanitize Markdown (lessons/statements) before render.
-   **Code Storage Security**: Properly escape and sanitize user code before storing in database to prevent injection attacks.
-   **Chat History Security**: Sanitize chat messages to prevent XSS and injection attacks.
-   Rate limit coach server functions to prevent abuse.
-   Avoid copying third‑party problem text; all statements/tests are original or generated by AI

### Code Storage Security

```ts
// Server function example for safe code storage
export async function saveUserCode(
	userId: string,
	problemId: string,
	language: string,
	code: string
): Promise<void> {
	// Escape code to prevent injection
	const escapedCode = escapeHtml(code);

	// Additional validation
	if (code.length > MAX_CODE_LENGTH) {
		throw new Error("Code too long");
	}

	// Store in database
	await prisma.algoProblemProgress.upsert({
		where: { userId_problemId_language: { userId, problemId, language } },
		update: { currentCode: escapedCode },
		create: {
			userId,
			problemId,
			language,
			currentCode: escapedCode,
			chatHistory: [],
		},
	});
}
```

---

## 14) QA Checklist (Acceptance Criteria)

-   Problems List loads with filters, search, sort; navigation to workspace works.
-   Workspace shows statement, editor, test output, and coach chat.
-   Run executes public tests; Submit executes all tests and persists submission.
-   Hint button returns tiered hints without code; respects throttling; preserves history.
-   After pass, user sees "Try Optimal Approach" and receives non‑code guidance.
-   Lessons render statically; have valid meta + JSON‑LD; link to related problems.
-   All pages responsive (≥360px).

---

## 15) Phased Delivery Plan

**Phase 1 (Core loop)**

-   `/problems`, `/workspace/[problemId]` basic, server functions for judge, hardcoded content.
-   Seed 10 original problems (arrays/hashmaps/strings/linked list) in TypeScript files.

**Phase 2 (Lessons + Coach)**

-   `/lessons`, `/lessons/[lessonId]` SSG, hardcoded lesson content.
-   Coach server functions with tiering + guardrails; ChatPanel UI.

**Phase 3 (Polish + Analytics)**

-   Optimal approach flow, throttling, autosave code per language, analytics events, SEO polish.

---

## 16) Sample UI Copy

-   Hint button tooltip: "Get a nudge (no spoilers)."
-   Empty state (Problems): "No matches. Try clearing filters or switching topic."

---

## 17) Nice‑to‑Have (backlog)

-   Keyboard shortcuts overlay
-   Diff viewer for attempts vs optimal outline
-   Problem variants for spaced repetition

---

**Notes for Cursor**

-   Use AGENTS.md for proper code standards
-   Use Next.js App Router, TypeScript, Tailwind, shadcn/ui where helpful.
-   Keep components small; co‑locate server functions with components.
-   Prefer SSG for lessons; SSR for workspace.
-   All content hardcoded in TypeScript files, no database storage for content.
-   Create and run tests (jest)

### **Code Reuse Strategy**

**Move to Root Level (shared across features):**

-   `/src/components/Editor/` - Monaco editor wrapper
-   `/src/components/Chat/` - Chat interface with AI input
-   `/src/components/Console/` - Code execution console (as optional tab)
-   `/src/lib/codeExecutor.ts` - Code execution logic
-   `/src/hooks/useConsole.ts` - Console execution hook
-   `/src/lib/testExecution.ts` - Test execution utilities
-   `/src/lib/functionTest.ts` - Function test execution (from Workspace)

**Algorithm-Specific (keep in features):**

-   `/src/features/algorithms/components/` - Problem-specific UI
-   `/src/features/algorithms/data/` - Hardcoded content
-   `/src/features/algorithms/hooks/` - Algorithm-specific hooks

**Future Language Support:**

-   Structure is designed to easily add Python, TypeScript, Java later
-   Language-specific starting code and execution logic can be added
-   Database schema supports multiple languages per problem
