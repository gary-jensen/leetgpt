# Algorithm Workspace Testing

This directory contains comprehensive tests for the algorithm workspace functionality.

## Test Structure

### 1. Workspace Component Tests (`workspace.test.tsx`)

Tests the core workspace components and their behavior:

-   **WorkspaceLayout**: Tests problem information display, topic rendering
-   **TestResultsDisplay**: Tests test summary display, individual test results, empty states
-   **TestCaseItem**: Tests passed/failed test case rendering, error display
-   **Data Structure Validation**: Ensures proper TypeScript interfaces and data flow

### 2. Integration Tests (`integration.test.ts`)

Tests the data layer and business logic:

-   **Data Loading**: Verifies problems and lessons load without errors
-   **Filtering**: Tests filtering by difficulty, topic, and search terms
-   **Individual Retrieval**: Tests getting specific problems/lessons by ID
-   **Data Structure Validation**: Ensures all required properties exist
-   **Error Handling**: Tests graceful handling of invalid inputs

## Test Coverage

### Components Tested

-   ✅ WorkspaceLayout component
-   ✅ TestResultsDisplay component
-   ✅ TestCaseItem component
-   ✅ Data loading and filtering functions
-   ✅ TypeScript type validation

### Scenarios Covered

-   ✅ Happy path rendering
-   ✅ Error states and edge cases
-   ✅ Data filtering and search
-   ✅ Component interaction
-   ✅ Type safety validation

## Running Tests

```bash
# Run all algorithm tests
npm test -- src/features/algorithms/__tests__/

# Run specific test file
npm test -- src/features/algorithms/__tests__/workspace.test.tsx

# Run with coverage
npm run test:coverage
```

## Test Data

The tests use mock data that matches the real data structure:

```typescript
const mockProblem: AlgoProblemDetail = {
	id: "two-sum",
	title: "Two Sum",
	topics: ["arrays", "hashmap"],
	difficulty: "easy",
	tests: [
		{ input: [[2, 7, 11, 15], 9], output: [0, 1] },
		{ input: [[3, 2, 4], 6], output: [1, 2] },
	],
	startingCode: {
		javascript: "function twoSum(nums, target) {\n  // Your code here\n}",
	},
};
```

## Key Testing Principles

1. **Component Isolation**: Each component is tested independently
2. **Data Validation**: Ensures TypeScript interfaces are properly implemented
3. **Error Handling**: Tests graceful degradation and error states
4. **User Experience**: Focuses on what users see and interact with
5. **Integration**: Tests how components work together with real data

## Future Test Additions

-   [ ] Hook testing (`useAlgoProblemExecution`)
-   [ ] Server action testing (`algoProgress`, `algoCoach`)
-   [ ] End-to-end user workflows
-   [ ] Performance testing
-   [ ] Accessibility testing
