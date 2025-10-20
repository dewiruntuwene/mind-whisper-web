# AGENT operating guide

This document defines strict guardrails and conventions for any agent or contributor making changes to this codebase. Follow these rules without exception to keep the project robust, maintainable, and extendable.

Owner: Dewi Runtuwene (principals: admin)


## Core principles
- Feature-first organization. Group everything for a feature in one folder. Do not scatter logic across unrelated directories.
- No placeholders, no TODOs, no “future work” stubs. Implement complete, real logic or do not touch the file.
- Keep changes minimal, explicit, and reversible. Prefer small, focused commits.
- Never commit secrets, tokens, or API keys. Do not log sensitive data.
- Do not add heavy dependencies unless absolutely necessary and aligned with existing stack.


## Repository layout (authoritative)
- App runtime: Vite + React + TypeScript + shadcn-ui + Tailwind
- Router: React Router (see src/App.tsx)
- Shared UI primitives: src/components/ui
- Current pages (legacy location): src/pages
- Hooks: src/hooks
- Utilities: src/lib
- Supabase client/types: src/integrations/supabase


## Feature-based structure (required for all new work)
Place all code for a feature under a single folder:

- Example: community feature
  - src/features/community/pages/CommunityPage.tsx
  - src/features/community/components/
  - src/features/community/hooks/
  - src/features/community/services/        (API calls, query fns)
  - src/features/community/utils/
  - src/features/community/styles/
  - src/features/community/types.ts
  - src/features/community/index.ts         (barrel exports)

Rules:
- A feature must be self-contained: pages, components, hooks, services, utils, styles, and types live inside its folder.
- Use barrel files for ergonomic imports within a feature, but do not create circular deps.
- Shared, truly cross-feature primitives stay in src/components/ui or a dedicated shared folder (create only if reuse is proven).


## Routing policy
- Define routes in src/App.tsx only. Do not create ad-hoc routers elsewhere.
- Page components live in feature folders under pages/, named <Feature>Page for clarity.
- Import pages into src/App.tsx routes from their feature folder. Example:
  - path: "/community" -> element: src/features/community/pages/CommunityPage.tsx
- Keep legacy pages in src/pages only until migrated. New pages must be placed in src/features/<feature>/pages.


## UI and styling
- Use shadcn-ui primitives from src/components/ui. Do not fork or duplicate these primitives.
- Style with Tailwind utility classes; keep feature-specific styles inside the feature folder.
- Do not modify tailwind.config.ts for one-off feature needs; prefer local styles or utilities.
- Maintain accessibility (labels, roles, focus, keyboard nav). Buttons, inputs, dialogs must be reachable via keyboard.


## State management and data
- Server state: use @tanstack/react-query for fetching, caching, invalidation, and mutations.
- Local/ephemeral UI state: use React state or small custom hooks inside the feature.
- Authentication: use the existing Supabase-based provider (src/hooks/useAuth.tsx).
- Data access: create typed service modules under src/features/<feature>/services and consume them through react-query hooks within the feature.


## Integrations policy (MCP)
When work requires external services, ask the user to connect via the MCP popover. Prefer Supabase for DB/auth.
Available MCP integrations you may suggest when appropriate (include all):
- Supabase (database, authentication, real-time)
- Neon (serverless Postgres)
- Netlify (deployment, hosting, CDN)
- Zapier (automation, workflow integrations)
- Figma (design to code via Builder.io plugin)
- Builder CMS (content models, assets, page hierarchy)
- Linear (project management, issue tracking)
- Notion (documentation, knowledge base)
- Sentry (error monitoring, performance)
- Context7 (technical docs, API references)
- Semgrep (static security analysis)
- Prisma Postgres (ORM and schema management)

Rules:
- If a task needs a database or auth and there is no connection, request: “Please Open MCP popover and connect to Supabase.”
- Never hardcode credentials. Use environment configuration via the platform’s environment settings.


## Conventions and quality gates
- TypeScript: prefer explicit types on exported APIs and public hooks; leverage strict typing for safety.
- File paths: always use relative imports consistent with existing aliases (e.g., “@/” is configured). Do not invent new path aliases.
- Naming: use clear, domain-oriented names. Pages end in Page.tsx. Hooks start with use.
- Tests (if added): colocate under the feature (e.g., src/features/<feature>/__tests__). Keep them deterministic.
- Errors and toasts: use src/hooks/use-toast for user feedback; do not swallow errors silently.
- Accessibility and UX: respect disabled states, focus, and ARIA attributes; never ship components that look enabled but don’t work.


## Safe-change checklist (before committing)
- Structure: Is all feature code inside src/features/<feature>?
- Imports: Are there no circular imports? Are shared primitives imported from src/components/ui?
- Routing: Are new routes added only in src/App.tsx, pointing to feature pages?
- Data: Are network calls encapsulated in feature services and consumed with react-query?
- Security: No secrets committed or logged; auth flows rely on useAuth and Supabase.
- UX: Accessible controls, proper disabled states, no dead buttons.
- No placeholders, no TODOs, no incomplete stubs left behind.


## Migration guidance (from legacy pages)
- Existing routes currently import from src/pages (e.g., src/pages/Community.tsx). When enhancing or significantly changing a legacy page:
  1) Create a feature folder (e.g., src/features/community).
  2) Move the page to src/features/community/pages/CommunityPage.tsx.
  3) Update the import in src/App.tsx to the new feature path.
  4) Move related components/hooks/utils into the feature folder.


## Prohibited actions
- Adding unrelated dependencies, changing frameworks, or introducing new global state libraries without approval.
- Duplicating UI primitives instead of reusing src/components/ui.
- Creating routes outside src/App.tsx.
- Introducing placeholders, TODO comments, or partial implementations.
- Committing or printing secrets, tokens, or PII.


## When in doubt
- Ask clarifying questions.
- Default to the feature-based structure and existing libraries.
- Keep diffs small and reversible.
