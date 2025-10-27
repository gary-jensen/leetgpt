# BitSchool Cursor Guidelines

Please use these notes as a guide for the project structure and rules

## React / Next.js Best Practices

### Server-Side Pages

-   **All `page.tsx` files MUST be server-side only** - no client-side hooks, interactivity, or browser APIs
-   Client-side interactivity should be extracted into sub-components
-   Use `"use client"` directive ONLY on sub-components, never on `page.tsx` files
-   Prefer server-side data fetching - fetch data in `page.tsx` and pass as props to client components

### Data Fetching

-   Fetch data server-side in `page.tsx` files whenever possible
-   Avoid `useEffect` for data fetching; prefer fetching in `getServerSideProps` / `getStaticProps` (Pages Router) or directly in server components (App Router)
-   Prefer to only use `useEffect` for client-side effects that truly require it (e.g., event listeners, subscriptions)
-   Pass fetched data as props to client components

### Component Organization

-   Break large components into subcomponents
-   Extract helper logic to respective `utils/` files
-   Keep `page.tsx` files clean; logic should mostly be in components or hooks
-   Use named exports for components and utils

## Project Structure

/components → globally used components
/hooks → globally used hooks
/utils → globally used helper functions
/pages → Next.js pages
/features → feature-specific code

### Features Folder

Each feature has its own folder:

/features/FeatureName
/components → components only used by this feature
/hooks → hooks only used by this feature
/utils → utils only used by this feature

**Rules:**

-   Only place files that are used exclusively by that feature inside the feature folder.
-   Any component, hook, or util used across multiple features should go in the root `/components`, `/hooks`, or `/utils` folders.

### Naming Conventions

-   Components: PascalCase
-   Hooks: useCamelCase
-   Utils: camelCase

### APIs and Server functions

-   I do not want to use APIs at all
-   We shall use only server functions
