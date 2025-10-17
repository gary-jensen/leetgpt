<!-- 586af83c-258d-490d-b250-9a1787f1b96c 2029a9f6-f739-42b8-8f5c-f6713e5fc92b -->
# JavaScript Course Outline

## Course Structure Philosophy

Based on your requirements and the lesson guidelines, this course will:

- Progress naturally without time constraints
- Use quick context → action → explanation pattern
- Keep lessons to 3-4 steps for quick wins and momentum
- Focus on deep fundamentals before advancing
- Use `prompt()` sparingly for early interactivity
- Apply Hormozi's value equation to maximize perceived value and achievement

## Proposed Skill Nodes (Chapters)

### 1. **Intro** (skillNodeId: "intro")

*Dream outcome: "You'll write your first lines of real code and understand how computers store different types of information"*

**Lesson 1: Hello World** (2 steps)

- Step 1: Quick intro to console.log, immediate action (already exists)
- Step 2: Multiple console logs with multiple arguments (already exists)

**Lesson 2: Logging Multiple Statements** (3 steps)

- Step 1: Log multiple separate console.log statements
- Step 2: Explain how each statement runs in order
- Step 3: Challenge - create your own message sequence

**Lesson 3: Numbers** (3 steps)

- Step 1: Log different numbers (integers, decimals, negative)
- Step 2: Explanation of number data type
- Step 3: Challenge - log numbers of different types

**Lesson 4: Strings** (3 steps)

- Step 1: Log text with quotes
- Step 2: Explanation of strings and quote types
- Step 3: Challenge - log your own strings

**Lesson 5: Booleans** (3 steps)

- Step 1: Log true and false
- Step 2: Explanation of boolean data type
- Step 3: Challenge - log booleans with labels

### 2. **Variables** (skillNodeId: "variables")

*Dream outcome: "You'll store and manipulate data like every real program does"*

**Lesson 6: Your First Variable** (3 steps)

- Step 1: Create first variable with `let` (already partially exists)
- Step 2: Explanation of variables (labeled boxes for data)
- Step 3: Log the variable

**Lesson 7: Multiple Variables** (3 steps)

- Step 1: Create multiple variables
- Step 2: Log them together
- Step 3: Challenge - create and log your own variables

**Lesson 8: Basic Math** (3 steps)

- Step 1: Addition and subtraction with numbers
- Step 2: Multiplication and division
- Step 3: Challenge - calculate something

**Lesson 9: Math with Variables** (4 steps)

- Step 1: Store calculation result in variable
- Step 2: Use variables in math (variable + variable)
- Step 3: Explanation of expressions
- Step 4: Challenge - multi-step calculation

**Lesson 10: More Operators** (3 steps)

- Step 1: Modulo operator (%)
- Step 2: Order of operations (PEMDAS)
- Step 3: Challenge - complex calculation

**Lesson 11: Combining Strings** (3 steps)

- Step 1: String concatenation with +
- Step 2: Combine variables with strings
- Step 3: Challenge - build a complete sentence

**Lesson 12: Building Sentences** (3 steps)

- Step 1: Multi-part string concatenation
- Step 2: Creating personalized messages
- Step 3: Challenge - create your own greeting

**Lesson 13: Declaring vs Initializing** (4 steps)

- Step 1: Declare variable without value (`let x;`)
- Step 2: Check what undefined means
- Step 3: Initialize after declaration
- Step 4: Declare with value (initialization)

**Lesson 14: Understanding Undefined** (3 steps)

- Step 1: Variables without values are undefined
- Step 2: Explanation of when to use each approach
- Step 3: Challenge - experiment with declaration styles

### 3. **Variable Scope and Redefinition** (skillNodeId: "scope-basics")

*Dream outcome: "You'll understand how JavaScript tracks and protects your variables"*

**Lesson 15: Changing Variables** (3 steps)

- Step 1: Reassign variable to new value
- Step 2: Use old value to calculate new value
- Step 3: Challenge - update variable multiple times

**Lesson 16: const vs let** (4 steps)

- Step 1: Introduce const (constant variables)
- Step 2: Try to reassign const (see error)
- Step 3: When to use const vs let
- Step 4: Challenge - decide const or let for scenarios

**Lesson 17: The += Operator** (3 steps)

- Step 1: Add to variable with +=
- Step 2: Compare `x = x + 5` vs `x += 5`
- Step 3: Challenge - use += in calculation

**Lesson 18: More Assignment Operators** (3 steps)

- Step 1: -=, *=, /= operators
- Step 2: When to use each
- Step 3: Challenge - use multiple operators

**Lesson 19: Increment and Decrement** (3 steps)

- Step 1: ++ and -- operators
- Step 2: Compare `x++` vs `x += 1` vs `x = x + 1`
- Step 3: Challenge - counter with increment/decrement

**Lesson 20: Global Scope** (3 steps)

- Step 1: Variables outside blocks are global
- Step 2: Global variables are accessible everywhere
- Step 3: Challenge - use global variable in different places

**Lesson 21: Block Scope** (4 steps)

- Step 1: Curly braces {} create blocks
- Step 2: Variables inside blocks are local to that block
- Step 3: Try to access block variable outside (error)
- Step 4: Challenge - predict accessibility

**Lesson 22: Variable Shadowing** (3 steps)

- Step 1: Same name in different scopes
- Step 2: Inner scope shadows outer scope
- Step 3: Challenge - understand shadowing behavior

**Lesson 23: Why Scope Matters** (3 steps)

- Step 1: Scope prevents naming conflicts
- Step 2: Real-world example of scope protecting data
- Step 3: Challenge - fix scope issues

### 4. **Conditional Thinking** (skillNodeId: "conditionals")

*Dream outcome: "You'll make your code make intelligent decisions"*

**Lesson 24: Your First If Statement** (3 steps)

- Step 1: Basic if with > operator (already partially exists)
- Step 2: Explanation of conditions
- Step 3: Challenge - write your own if statement

**Lesson 25: More Comparisons** (4 steps)

- Step 1: < operator
- Step 2: >= and <= operators
- Step 3: Testing different comparisons
- Step 4: Challenge - check if number is in range

**Lesson 26: If-Else** (3 steps)

- Step 1: Add else block (already partially exists)
- Step 2: Explanation of either/or logic
- Step 3: Challenge - categorize a number

**Lesson 27: Multiple Scenarios** (3 steps)

- Step 1: Different if-else scenarios
- Step 2: Explanation of flow control
- Step 3: Challenge - make multiple decisions

**Lesson 28: Equality Operators** (3 steps)

- Step 1: === (strict equality)
- Step 2: !== (strict inequality)
- Step 3: Challenge - check equality

**Lesson 29: Why Strict Equality** (3 steps)

- Step 1: Difference between === and ==
- Step 2: Why we use strict equality
- Step 3: Challenge - compare different types

**Lesson 30: Comparing Strings** (3 steps)

- Step 1: String equality with ===
- Step 2: Case sensitivity matters
- Step 3: Challenge - validate text input

**Lesson 31: Else-If Introduction** (3 steps)

- Step 1: Simple else-if structure
- Step 2: Multiple else-if conditions
- Step 3: Challenge - three-way categorization

**Lesson 32: Order Matters** (3 steps)

- Step 1: First matching condition wins
- Step 2: Demonstrate with examples
- Step 3: Challenge - fix ordering issues

**Lesson 33: Grade Calculator** (4 steps)

- Step 1: Multi-tier if-else-if chain
- Step 2: Assign letter grades
- Step 3: Add more tiers
- Step 4: Challenge - create your own tier system

**Lesson 34: AND Operator** (3 steps)

- Step 1: && operator - both must be true
- Step 2: Multiple AND conditions
- Step 3: Challenge - check multiple requirements

**Lesson 35: OR Operator** (3 steps)

- Step 1: || operator - either can be true
- Step 2: Multiple OR conditions
- Step 3: Challenge - flexible conditions

**Lesson 36: NOT Operator** (3 steps)

- Step 1: ! operator - invert condition
- Step 2: Double negation
- Step 3: Challenge - use NOT in conditions

**Lesson 37: Combining Logical Operators** (4 steps)

- Step 1: AND and OR together
- Step 2: Grouping with parentheses
- Step 3: Complex eligibility checks
- Step 4: Challenge - multi-factor validation

**Mini Project: Should I Go Outside?** (4 steps)

- Step 1: Get weather and temperature with `prompt()`
- Step 2: Use nested if-else for decisions
- Step 3: Combine logical operators for complex rules
- Step 4: Give personalized recommendation

### 5. **Function Basics** (skillNodeId: "functions")

*Dream outcome: "You'll create reusable code that does real work"*

**Lesson 38: Your First Function** (3 steps)

- Step 1: Function declaration with no parameters (already partially exists)
- Step 2: Call function multiple times
- Step 3: Challenge - create your own simple function

**Lesson 39: Understanding Code Reuse** (3 steps)

- Step 1: Why functions matter
- Step 2: Writing code once, using many times
- Step 3: Challenge - replace repeated code with function

**Lesson 40: Function with Parameter** (3 steps)

- Step 1: Function with one parameter (already partially exists)
- Step 2: Parameters are inputs/placeholders
- Step 3: Challenge - function with different inputs

**Lesson 41: Multiple Parameters** (4 steps)

- Step 1: Function with two parameters
- Step 2: Function with three parameters
- Step 3: Order of parameters matters
- Step 4: Challenge - function with multiple inputs

**Lesson 42: Using Parameters** (3 steps)

- Step 1: Calculate with parameters
- Step 2: Combine parameters in strings
- Step 3: Challenge - complex parameter usage

**Lesson 43: Return Statement** (3 steps)

- Step 1: Basic return statement
- Step 2: Capture returned value in variable
- Step 3: Challenge - function that returns calculation

**Lesson 44: Using Return Values** (3 steps)

- Step 1: Use return value immediately
- Step 2: Pass return value to another function
- Step 3: Challenge - chain functions

**Lesson 45: Return vs Console.log** (4 steps)

- Step 1: Key difference explained
- Step 2: Return gives value back, console.log displays
- Step 3: When to use each
- Step 4: Challenge - refactor console.log to return

**Lesson 46: Function Scope** (3 steps)

- Step 1: Variables inside functions are local
- Step 2: Parameters are also local
- Step 3: Challenge - predict what's accessible

**Lesson 47: Global vs Local** (3 steps)

- Step 1: Functions can access global variables
- Step 2: Local variables shadow global ones
- Step 3: Challenge - scope within functions

**Mini Project: Calculator** (4 steps)

- Step 1: Create add, subtract, multiply, divide functions
- Step 2: Get numbers and operation with `prompt()`
- Step 3: Call correct function based on choice
- Step 4: Handle division by zero

### 6. **Advanced Functions** (skillNodeId: "functions-advanced")

*Dream outcome: "You'll write powerful, flexible code like professional developers"*

**Lesson 48: Arrow Function Syntax** (3 steps)

- Step 1: Convert regular function to arrow (already partially exists)
- Step 2: Arrow syntax variations
- Step 3: Challenge - write arrow functions

**Lesson 49: Implicit Return** (3 steps)

- Step 1: Arrow functions with one expression
- Step 2: No curly braces = automatic return
- Step 3: Challenge - refactor to implicit return

**Lesson 50: When to Use Arrows** (3 steps)

- Step 1: Arrow vs regular function comparison
- Step 2: Best use cases for each
- Step 3: Challenge - choose appropriate style

**Lesson 51: Default Parameters** (3 steps)

- Step 1: Set default parameter values
- Step 2: When defaults are used vs overridden
- Step 3: Challenge - function with sensible defaults

**Lesson 52: Multiple Defaults** (3 steps)

- Step 1: Function with multiple default parameters
- Step 2: Overriding some but not all
- Step 3: Challenge - complex defaults

**Lesson 53: Functions as Arguments** (3 steps)

- Step 1: Pass function to another function
- Step 2: Call the passed function
- Step 3: Challenge - simple callback

**Lesson 54: Higher-Order Functions** (4 steps)

- Step 1: Understanding higher-order functions
- Step 2: Create your own higher-order function
- Step 3: Why this pattern is powerful
- Step 4: Challenge - practical higher-order function

**Lesson 55: Function Expressions** (3 steps)

- Step 1: Store function in variable
- Step 2: Anonymous functions
- Step 3: Challenge - function expressions

**Lesson 56: Expression vs Declaration** (3 steps)

- Step 1: Key differences
- Step 2: When to use each
- Step 3: Challenge - refactor between styles

### 7. **Array Basics** (skillNodeId: "arrays")

*Dream outcome: "You'll organize and work with lists of data efficiently"*

**Lesson 57: Creating Arrays** (3 steps)

- Step 1: Array literal syntax
- Step 2: Arrays with different data types
- Step 3: Challenge - create your own arrays

**Lesson 58: Accessing Elements** (3 steps)

- Step 1: Access by index (0-based)
- Step 2: Array length property
- Step 3: Challenge - access different positions

**Lesson 59: Changing Elements** (3 steps)

- Step 1: Change element by index
- Step 2: Multiple changes
- Step 3: Challenge - update array values

**Lesson 60: Adding to End** (3 steps)

- Step 1: push() method
- Step 2: Multiple pushes
- Step 3: Challenge - build array with push

**Lesson 61: Removing from End** (3 steps)

- Step 1: pop() method
- Step 2: Capture popped value
- Step 3: Challenge - push and pop together

**Lesson 62: Start of Array** (3 steps)

- Step 1: shift() and unshift() methods
- Step 2: Difference from push/pop
- Step 3: Challenge - manipulate array start

**Lesson 63: For Loops with Arrays** (4 steps)

- Step 1: Loop through array with for loop
- Step 2: Access each element
- Step 3: Process array data
- Step 4: Challenge - transform array in loop

**Lesson 64: Building New Arrays** (3 steps)

- Step 1: Create new array from existing
- Step 2: Filter data while looping
- Step 3: Challenge - conditional array building

**Lesson 65: Finding Max/Min** (3 steps)

- Step 1: Find maximum value in array
- Step 2: Find minimum value
- Step 3: Challenge - find both max and min

**Lesson 66: Summing Arrays** (3 steps)

- Step 1: Calculate sum of array
- Step 2: Calculate average
- Step 3: Challenge - sum with condition

**Lesson 67: Checking Values** (3 steps)

- Step 1: Check if value exists in array
- Step 2: Count occurrences
- Step 3: Challenge - validate array contents

### 8. **Array Methods** (skillNodeId: "array-methods")

*Dream outcome: "You'll manipulate data powerfully with built-in tools"*

**Lesson 68: includes Method** (3 steps)

- Step 1: Check if element exists with includes()
- Step 2: Case sensitivity and exact matching
- Step 3: Challenge - validate with includes

**Lesson 69: indexOf Method** (3 steps)

- Step 1: Find position with indexOf()
- Step 2: What -1 means (not found)
- Step 3: Challenge - find and use index

**Lesson 70: indexOf vs includes** (3 steps)

- Step 1: Key differences
- Step 2: When to use each
- Step 3: Challenge - choose appropriate method

**Lesson 71: slice Method** (3 steps)

- Step 1: Copy portion of array with slice()
- Step 2: Different slice ranges
- Step 3: Challenge - extract array sections

**Lesson 72: concat Method** (3 steps)

- Step 1: Combine arrays with concat()
- Step 2: Multiple concatenations
- Step 3: Challenge - merge arrays

**Lesson 73: join Method** (3 steps)

- Step 1: Convert array to string with join()
- Step 2: Different separators
- Step 3: Challenge - format array output

**Lesson 74: reverse Method** (3 steps)

- Step 1: Reverse array order
- Step 2: Reverse modifies original array
- Step 3: Challenge - reverse and restore

**Lesson 75: forEach Method** (3 steps)

- Step 1: Basic forEach syntax
- Step 2: Access element and index
- Step 3: Challenge - process with forEach

**Lesson 76: forEach vs For Loop** (3 steps)

- Step 1: Compare forEach to for loop
- Step 2: When to use each
- Step 3: Challenge - convert between styles

**Lesson 77: map Method** (3 steps)

- Step 1: Transform array with map()
- Step 2: map returns new array
- Step 3: Challenge - data transformation

**Lesson 78: map vs forEach** (3 steps)

- Step 1: Key difference (return value)
- Step 2: When to use map vs forEach
- Step 3: Challenge - choose appropriate method

**Lesson 79: filter Method** (3 steps)

- Step 1: Keep elements that pass test
- Step 2: Multiple filter conditions
- Step 3: Challenge - complex filtering

**Lesson 80: Chaining Methods** (3 steps)

- Step 1: Chain filter with map
- Step 2: Multiple method chains
- Step 3: Challenge - multi-step transformation

**Lesson 81: find Method** (3 steps)

- Step 1: Find first matching element
- Step 2: What undefined means (not found)
- Step 3: Challenge - find with condition

**Lesson 82: findIndex Method** (3 steps)

- Step 1: Find position of match
- Step 2: findIndex vs indexOf
- Step 3: Challenge - find complex conditions

**Mini Project: Todo List Manager** (4 steps)

- Step 1: Array of todo objects, add/display with forEach
- Step 2: Mark complete with map
- Step 3: Remove todos with filter
- Step 4: Search with find, use `prompt()` for interaction

## Course Statistics

- **8 skill nodes** (chapters)
- **82 regular lessons** (3-4 steps each)
- **3 mini projects** (4 steps each)
- **Estimated total: ~85 lessons**
- **Estimated steps: ~260-270 steps**

## What Comes Next (Future Expansion)

After these 8 nodes, the course can continue with:

- **Loops** (for, while, do-while, loop control)
- **Objects** (object basics, methods, this keyword, nested objects)
- **Advanced Scope & Closures** (deep dive, IIFE, private variables)
- **Error Handling** (try-catch, throwing errors, debugging)
- **String Methods** (split, substring, toLowerCase, trim, etc.)
- **More Array Methods** (reduce, some, every, sort)
- **Final Capstone Project** (text-based RPG combining all concepts)

## Key Design Principles

1. **Short lessons** - 3-4 steps max for quick wins
2. **Immediate action** - Quick context then do
3. **Progressive complexity** - Each lesson builds slightly
4. **Clear momentum** - Every step ends pulling forward
5. **Real progress** - Each win connects to real skill

## Next Steps

1. Review and approve this outline
2. Begin creating detailed lesson content
3. Write engaging markdown following guidelines
4. Create comprehensive tests for each step
5. Add appropriate XP rewards

Ready to proceed with creating the lessons?