# AI‑BitSchool Interview Prep — Implementation Context for Cursor

> Purpose: Implement the next iteration of BitSchool with a Problems List, an Integrated Workspace (problem + editor + tests + AI mentor), and Standalone Lesson pages (SEO‑friendly). **Exclude Progress and Mentor standalone pages** for now. Reuse existing BitSchool judge and auth where possible.

## 📊 Implementation Status

### ✅ Completed (~65%)

-   **Data Storage & Admin**: Database models (AlgoProblem, AlgoLesson), CRUD admin pages, markdown-to-HTML processing, database seeding
-   **Routing**: All pages implemented (/problems, /lessons, /workspace/[slug], /lessons/[slug])
-   **Components**: Refactored monolithic components into modular pieces, two-tab test cases system, enhanced diffs
-   **Performance**: Pre-processed HTML for zero loading time, SSG with generateStaticParams, server-side rendering
-   **Test Cases**: LeetCode-style display (first 5 visible, first failure auto-revealed, pass count based on first failure)
-   **Test Coverage**: Added 40 test cases for "Two Sum" problem, all with unique solutions and correct zero-based indexing

### 🔄 In Progress

-   Progress tracking (AlgoProblemProgress, AlgoLessonProgress tables not yet created)

### ❌ Not Started (~35%)

-   AI Coach functions (`getHint()`, `reviewOptimality()`)
-   Analytics tracking
-   Code persistence/autosave
-   Keyboard shortcuts
-   Edge case handling
-   SEO optimization
-   Home/Dashboard page

### 📝 Recent Changes

-   **2025-01**: Migrated content from hardcoded files to PostgreSQL database
-   **2025-01**: Implemented full admin CRUD for problems and lessons
-   **2025-01**: Refactored WorkspaceLayout into modular components
-   **2025-01**: Converted all routing to use `slug` instead of `id`
-   **2025-01**: Implemented pre-processed HTML for zero loading time
-   **2025-01**: Implemented LeetCode-style test case display (first 5 visible, first failure revealed, accurate pass counting)
-   **2025-01**: Added 40 verified test cases for "Two Sum" problem, all with unique solutions

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

### Database Models

**✅ Status: Content tables implemented, progress tables pending**

**Content Tables (Implemented):**

```prisma
// ✅ COMPLETED: Content storage in database
model AlgoProblem {
  id             String   @id @default(cuid())
  slug           String   @unique
  title          String
  statementMd    String   @db.Text
  statementHtml  String?  @db.Text  // Pre-processed HTML for zero loading time
  topics         String[]
  difficulty     String
  languages      String[]
  rubric         Json
  parameterNames String[]
  tests          Json
  startingCode   Json
  passingCode    Json
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([difficulty])
  @@index([slug])
}

model AlgoLesson {
  id             String   @id @default(cuid())
  slug           String   @unique
  title          String
  summary        String
  topics         String[]
  difficulty     String
  readingMinutes Int
  bodyMd         String   @db.Text
  bodyHtml       String?  @db.Text  // Pre-processed HTML
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([difficulty])
  @@index([slug])
}
```

**Progress Tables (TODO - Not yet implemented):**

```prisma
// ❌ TODO: Algorithm progress tracking
model AlgoProblemProgress {
  id          String   @id @default(cuid())
  userId      String
  problemId   String   // References problem slug or ID
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

model AlgoLessonProgress {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String   // References lesson slug or ID
  status      String   // "not_started" | "in_progress" | "completed"
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  User        User     @relation(fields: [userId], references: [id])

  @@unique([userId, lessonId])
}
```

**Note:** Existing `UserProgress` table remains unchanged for JavaScript lessons

### Content Files (Mixed Approach)

**Hardcoded TypeScript files (used for seeding):**

-   `/src/features/algorithms/data/algoLessons.ts` — All algorithm lesson content
-   `/src/features/algorithms/data/algoProblems.ts` — All algorithm problem content
-   `/src/features/algorithms/data/index.ts` — Content utilities (now fetches from database)

**✅ Status**: Content migrated to database. Hardcoded files preserved for:

-   Seeding initial content (`prisma/seed-algo-content.ts`)
-   Creating new problems/lessons in code
-   Backup/reference

**Data Flow:**

1. Content stored in PostgreSQL database
2. Pages fetch via Prisma from database
3. Admin panel can create/edit/delete content
4. Markdown processed to HTML on save (for performance)

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

-   **Test Cases Tab:** Shows first 5 test case inputs (LeetCode-style)
-   **Test Results Tab:** Shows the first 5 test cases + first failed case (if any)
-   **Pass Counting:** Displays X/Y testcases passed, where X is the index of the first failure (or total if all pass)
-   **Diff Viewing:** Element-by-element comparison for arrays, with red/green highlighting for differences
-   **Auto-Selection:** Automatically opens to the first failed test case (or case 1 if all pass)
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

**✅ Completed:**

-   ✅ `WorkspaceLayout` — Refactored into modular components
-   ✅ `ProblemHeader` — Title, difficulty, topics, actions
-   ✅ `LeftColumnPanel` — Contains ProblemStatement + TestCasesPanel
-   ✅ `EditorPanel` — Code editor with toolbar
-   ✅ `AIChatPanel` — AI chat interface
-   ✅ `ProblemStatement` — Markdown renderer for problem descriptions
-   ✅ `TestCasesPanel` — Two-tab system (Test Cases / Test Results) with LeetCode-style display
-   ✅ `TestCaseTab` — Shows first 5 test case inputs with syntax highlighting
-   ✅ `TestResultsTab` — Shows first 5 + first failure, with accurate pass counting
-   ✅ Auto-selection of first failed test case
-   ✅ Element-by-element diff comparison with red/green highlighting
-   ✅ `ProblemForm`, `LessonForm` — Admin CRUD forms
-   ✅ `ProblemsList`, `LessonsList` — Client components for filtering
-   ✅ `ProblemsTableRow`, `LessonsTableRow` — Individual row components
-   ✅ `DeleteProblemButton`, `DeleteLessonButton` — Delete actions
-   ✅ `useTestTab` — Hook for managing test tab state and auto-switching
-   ✅ `useProcessedStatement` — Hook for optimized markdown processing
-   ✅ `diffUtils` — Utility for creating element-by-element diffs
-   ✅ `testStatusUtils` — Utility for calculating test status

**❌ Not Yet Implemented:**

-   ❌ `PageShell` (header/nav, container)
-   ❌ `FiltersBar`, `SearchInput`, `PillTag`, `DifficultyBadge` (standalone components)
-   ❌ `ConsoleTab` (optional debug console)
-   ❌ `ChatPanel` AI integration (infrastructure exists, needs AI coach functions)
-   ❌ `Modal` (Optimal approach opt‑in)

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

**Phase 1 (Core loop) - ✅ COMPLETED**

-   ✅ `/problems`, `/workspace/[problemSlug]` implemented with full UI
-   ✅ `/lessons`, `/lessons/[lessonSlug]` implemented with SSG
-   ✅ All pages are server components, fetch data from database
-   ✅ 10 original problems seeded in database (arrays/hashmaps/strings)
-   ✅ Admin CRUD interface for creating/editing/deleting content
-   ❌ Progress tracking database tables not yet created

**Phase 2 (Lessons + Coach) - 🟡 PARTIALLY COMPLETE**

-   ✅ `/lessons`, `/lessons/[lessonSlug]` SSG implemented
-   ✅ Lessons stored in database (not hardcoded)
-   ❌ Coach server functions (`getHint()`, `reviewOptimality()`) not implemented
-   ❌ ChatPanel AI integration not implemented

**Phase 3 (Polish + Analytics) - ❌ NOT STARTED**

-   ❌ Optimal approach flow
-   ❌ Throttling for hints
-   ❌ Autosave code per language
-   ❌ Analytics events tracking
-   ❌ SEO polish (meta tags, JSON-LD, etc.)

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
