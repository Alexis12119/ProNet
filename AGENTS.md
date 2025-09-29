# AGENTS.md

## Build/Lint/Test Commands
- Build: `npm run build` (Next.js build)
- Lint: `npm run lint` (ESLint with Next.js)
- Test: No test script configured; add Jest/Vitest for testing. Single test: N/A currently. Recommend adding Vitest for unit tests.

## Code Style Guidelines
- **Language**: TypeScript with strict mode enabled.
- **Imports**: Use absolute paths with `@/*` (e.g., `@/components/ui/button`).
- **Formatting**: Follow shadcn/ui "new-york" style; use Prettier for consistency (no config found, assume defaults).
- **Types**: Explicit types required; use interfaces for component props.
- **Naming**: PascalCase for components/files; camelCase for variables/functions.
- **Error Handling**: Use try-catch in client components; throw errors for server-side handling.
- **Components**: Functional components with hooks; prefer RSC where possible.
- **Styling**: Tailwind CSS with CSS variables; use `cn()` utility for class merging.
- **State Management**: React hooks (useState, useRouter, etc.); no global state library.
- **Database**: Supabase for authentication and data management.
- **No Cursor/Copilot rules found**.
