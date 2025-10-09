# BitSchool Cursor Guidelines

Please use these notes as a guide for the project structure and rules

## React / Next.js Best Practices

-   Avoid `useEffect` unless necessary; prefer data fetching in `getServerSideProps` / `getStaticProps`.
-   Break large components into subcomponents.
-   Extract helper logic to respective `utils/` files.
-   Keep pages clean; logic should mostly be in components or hooks.
-   Use named exports for components and utils.

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
