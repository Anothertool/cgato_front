# AGENTS.md

## Project conventions

This is a React frontend project.

Follow the existing architecture and conventions of the repository. Prefer small, focused changes over large refactors.

Do not introduce new patterns, libraries, or architectural changes unless they are necessary for the requested task.

## JavaScript

* Use JavaScript by default.
* Do NOT use TypeScript unless explicitly requested.
* Do not create `.ts` or `.tsx` files unless explicitly requested.
* Use `.js` / `.jsx` according to the existing project conventions.
* Prefer modern React and JavaScript patterns already supported by the project.

## React

* Use functional components and React hooks.
* Do not introduce class components.
* Reuse existing components before creating new ones.
* Keep components reasonably small and focused.
* Follow the existing folder structure and naming conventions.
* Do not refactor unrelated components while implementing a task.

## UI and styling

Chakra UI is the default UI and styling system.

* Use Chakra UI components for layout, styling, forms, modals, typography, responsive behavior, etc.
* Prefer components such as `Box`, `Flex`, `Grid`, `Stack`, `Text`, `Button`, `Input`, etc. over raw HTML elements.
* Use Chakra props and the project's existing theme/tokens for styling.
* Do NOT create separate CSS files unless explicitly requested.
* Do NOT use inline `style={{ ... }}` when the same result can be achieved with Chakra props.
* Do NOT introduce Tailwind, styled-components, CSS modules, Sass, or another styling system.
* Avoid raw HTML + CSS implementations when Chakra provides an appropriate component.
* Reuse existing design patterns from nearby screens/components before inventing a new UI pattern.

## Data fetching and HTTP

Use the libraries already established in the project.

* FOr mutations use our own useAuthMutate hook and when fetching use useAuthFetch
* Use `axios` for HTTP requests.
* Use TanStack React Query / React Query for server-state fetching, caching, mutations, invalidation, and synchronization where appropriate.
* Prefer `useQuery` for reads.
* Prefer `useMutation` for writes when React Query is already being used for that flow.
* Do not replace Axios with `fetch`.
* Do not introduce another HTTP or server-state library.
* Follow existing API client/helper patterns if the project already has them.
* Reuse existing query keys and invalidation patterns when possible.


## State

* Keep local UI state local with React hooks when appropriate.
* Use React Query for server state rather than duplicating fetched API data into local state unnecessarily.
* Do not introduce a new global state management library unless explicitly requested.

## Testing

Do NOT create, modify, or run tests unless explicitly requested.

Do not add:

* unit tests
* integration tests
* E2E tests
* testing libraries
* test configuration

If a task would normally benefit from tests, implement the requested change without adding tests unless the user specifically asks for them.

## Dependencies

* Do not install new dependencies unless they are genuinely necessary.
* Prefer existing dependencies and utilities.
* Before adding a dependency, check whether the project already has a library that solves the problem.
* Do not upgrade existing dependencies unless explicitly requested or strictly necessary for the task.
* Never perform broad dependency upgrades as part of an unrelated change.

## Scope of changes

Keep changes narrowly scoped to the requested task.

* Do not perform unrelated cleanup.
* Do not rename files or components without a reason.
* Do not reformat large unrelated sections of code.
* Do not perform architectural refactors unless explicitly requested.
* Preserve existing behavior unless the requested change requires modifying it.
* When fixing a bug, prefer fixing the root cause with the smallest reasonable change.

## Existing code is authoritative

Before implementing something:

1. Inspect the relevant existing components and nearby implementations.
2. Identify the patterns already used by the project.
3. Reuse those patterns when reasonable.
4. Only introduce a new approach when the existing approach cannot reasonably solve the task.

If the user's instruction conflicts with an existing project convention, the user's explicit instruction takes priority.

## Task execution

For small and well-defined tasks, implement the change directly.

For changes that could affect multiple parts of the application or introduce meaningful regression risk:

* inspect the relevant code first;
* explain the impact when useful;
* avoid expanding the scope unnecessarily.

Do not turn a small task into a large refactor.

## Code quality

* Write readable, straightforward code.
* Prefer clarity over clever abstractions.
* Avoid premature abstractions.
* Avoid creating helpers/components that are only used once unless they materially improve readability.
* Remove code made obsolete by your own change when safe to do so.
* Do not leave commented-out implementations or temporary debug code.
* Do not add unnecessary comments that merely restate the code.
