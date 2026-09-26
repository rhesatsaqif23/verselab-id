# AGENTS.md

## Project

Verselab (verselab.id) is a gamified interactive-learning web app inspired by Brilliant.org / Duolingo. Users learn through short interactive screens (choice, numeric, allocation, concept), earning XP and streaks to keep them returning daily.

The product is NOT a finance app. It is a learning engine — personal finance is only the first material because numeric questions are cheap to build and check. The engine must be reusable for any future domain without rewriting it.

Verselab is a **Bun workspace monorepo**: a TanStack Start web app, an Elysia API, and a shared schemas package.

```txt
apps/web        TanStack Start + React 19 SSR app (port 3000)
apps/api        Bun + Elysia + Better Auth + Drizzle/PostgreSQL API (port 3001)
packages/shared shared Zod schemas/types reused by web and api
```

Auth, accounts, and the learning profile are server-side (PostgreSQL). Game progress (XP, streak, mastery, curriculum edits) stays client-side in `localStorage` via Zustand (PRD section 8.3).

## Package manager

Use Bun only.

```sh
bun install
```

- Use existing `bun.lock`; do not add npm/yarn/pnpm lockfiles.

## Workspace layout

```txt
apps/web        TanStack Start + React + Vite
apps/api        Elysia API + Better Auth + Drizzle PostgreSQL
packages/shared shared Zod schemas/types
```

## Root commands

```sh
bun run dev              # web dev server on port 3000
bun run dev:api          # API dev server on port 3001
bun run build            # production web build (vite build)
bun run check-types      # tsc across api, web, shared
bun run lint             # Oxlint
bun run lint:fix         # Oxlint with auto-fix
bun run fmt              # Oxfmt — format all files
bun run fmt:check        # Oxfmt — check without writing
bun run test             # api (bun test) + web (vitest)
```

Before handoff, normally run:

```sh
bun run fmt && bun run check-types && bun run lint && bun run test
```

## Per-package commands

API (`apps/api`):

```sh
bun run --cwd apps/api dev                # bun --hot, port 3001
bun run --cwd apps/api start              # run without hot reload
bun run --cwd apps/api check-types
bun run --cwd apps/api test               # bun test tests/
bun run --cwd apps/api db:generate        # drizzle-kit generate
bun run --cwd apps/api db:migrate         # drizzle-kit migrate
bun run --cwd apps/api db:push            # drizzle-kit push
bun run --cwd apps/api db:studio          # drizzle-kit studio UI
```

Web (`apps/web`):

```sh
bun run --cwd apps/web dev                # vite dev, port 3000
bun run --cwd apps/web build
bun run --cwd apps/web generate-routes    # tsr generate (route tree)
bun run --cwd apps/web check-types
bun run --cwd apps/web test               # vitest run
bun run --cwd apps/web storybook          # port 6006
bun run --cwd apps/web build-storybook
bun run --cwd apps/web preview
```

Shared (`packages/shared`):

```sh
bun run --cwd packages/shared check-types
```

## Running a single test

Web tests use Vitest with jsdom; API tests use `bun test`.

```sh
cd apps/web && bunx vitest run tests/engine/progress/streak.test.ts
cd apps/web && bunx vitest run -t "keeps streak on same day"
cd apps/api && bunx vitest run tests/...
```

Do not put API tests under `src`; use `apps/api/tests`.

## Environment files

Environment files live where they are consumed.

```sh
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

`apps/api/.env` is required — `config/env.ts` parses it with Zod at import time. `apps/web/.env` supplies `VITE_API_ORIGIN`. See [DEVELOPMENT.md](DEVELOPMENT.md) for the full key tables.

## Database

Drizzle commands live in `apps/api`. Set `DATABASE_URL` in `apps/api/.env` first.

Database schema lives in:

```txt
apps/api/src/database/schema.ts       # domain tables (user_profiles)
apps/api/src/database/auth-schema.ts  # Better Auth tables (user, session, account, verification)
```

Use lazy DB access through `getDb()` (`apps/api/src/database/index.ts`) so importing the app in tests does not require `DATABASE_URL`. The connection initializes only when a service actually queries.

Local PostgreSQL runs in Docker (`verselab-postgres`, postgres:16, port 5432). Access it with:

```sh
docker start verselab-postgres
docker exec -it verselab-postgres psql -U postgres -d verselab
```

## Auth

Auth is owned by **Better Auth** mounted inside the Elysia API at `/api/auth/*` (`apps/api/src/auth/index.ts`). Email + password is enabled; email verification is disabled. Sessions persist in the Postgres `session` table.

The web app relays sessions through TanStack Start server functions (`apps/web/src/libs/session.ts`): it forwards the browser's cookies to the API and copies Better Auth cookies back. Route guards use `resolveSession()` / `requireAuth()` in `beforeLoad`. Client-side auth mutations use the Better Auth React client (`apps/web/src/libs/auth-client.ts`).

## Shared schemas

Use `packages/shared` for schemas/types reused by frontend and backend. Zod is the source of truth for JSON DTOs — do not duplicate DTOs in app packages.

```txt
packages/shared/src/schemas/profile.ts   # unitId, dailyGoal, onboarding, profile
```

Elysia validates request bodies directly with shared Zod schemas:

```ts
body: onboardingSchema,
```

Web uses the same schemas for form validation and DTO types. Export schema and inferred type together.

## Architecture: engine / domain split

This is the single most important concept in the web app (PRD section 3.2). See [CONCEPT.md](CONCEPT.md) and [ARCHITECTURE.md](ARCHITECTURE.md).

```txt
apps/web/src/
├── engine/                  Must never know the subject matter
│   ├── player/              Lesson UI: LessonPlayer, LessonHeader, LessonControls, ProgressBar, ExplanationDialog, lessonStore
│   ├── progress/            XP, streak, mastery, daily goal: progressStore, streak, decay, masteryRead
│   ├── path/                nextLesson: unit ordering and unlock rules
│   └── types.ts             Screen (union), Lesson, Unit type definitions
├── domains/
│   └── personal-finance/    math.ts, screens/ (renderers), components/ (BarChart)
├── features/                Feature-scoped modules: layout, home, unit-detail, lesson, lesson-complete, profile, about, admin, auth, onboarding, landing
├── libs/                    Shared app code: env.ts, auth-client.ts, session.ts, utils.ts, date.ts, theme.ts, hooks/
├── content/                 Lesson data as TS: units.ts, index.ts, lessons/ (4 units)
├── components/ui/           shadcn/ui primitives
├── routes/                  Thin route files delegating to features
├── stories/                 Storybook stories
└── styles/                  globals.css (theme) + styles.css
tests/                       Vitest tests mirroring src/ (apps/web/tests)
```

Rules:

- If code mentions money, interest, salary, or installments → `domains/personal-finance/`. Otherwise → `engine/`.
- The engine passes one screen's data to the domain; the domain renders it and calls back `onAnswer(true)` or `onAnswer(false)`.
- The engine never knows what a question is about — only that it was answered right or wrong.
- If you find yourself writing `if (material === 'keuangan')` inside `engine/`, something is wrong. Stop and ask.
- Auth/onboarding live in the API and in `features/auth` / `features/onboarding`; they never reference subject matter.

## Screen types

There are 4 screen types in v1 (PRD section 4). The `Screen` type in `apps/web/src/engine/types.ts` is a union type, so TypeScript narrows the available fields per type.

- `concept` — introduces a concept name after the user has felt its effect. Max 1 per lesson.
- `choice` — multiple choice; cards with a blue border on selection. Max 30% of screens per lesson.
- `numeric` — user types a number; answers checked by range, not exact value. Correct answer is computed from `math.ts`, never hardcoded.
- `allocation` — sliders summing to 100%; checked against a rule (e.g. savings min 20%).

## API module design

Follow the Elysia feature-based shape under `apps/api/src/modules/<feature>/`:

```txt
index.ts   Elysia controller (happy path)
service.ts business logic (target — see docs/backend-refactor.md)
```

- Use an Elysia instance as the controller. `body` is validated by the relevant shared Zod schema.
- Response helpers live in `apps/api/src/libs/response.ts`:

```ts
ok(data); // { ok: true, data }
fail({ code, message }); // { ok: false, error: { code, message } }
```

- The target error model (from the refactor plan) is `AppError` + a global `onError` mapping; controllers stay happy-path only and never check `if (!result.ok)`.

## Storybook

Storybook lives in `apps/web` only (there is no `packages/ui`). It documents feature components and shadcn primitives.

```txt
apps/web/.storybook   BOTH/Storybook config
apps/web/stories      stories
```

- Uses `@storybook/tanstack-react`.
- Port `6006`.
- Do not place stories beside component source; keep them in `apps/web/stories`.

## Path aliases

- `#/*` and `@/*` map to `./src/*` (web).
- `@verselab/shared/*` maps to `packages/shared/src/*`.

## shadcn/ui

Shared UI components live in `apps/web/src/components/ui/` (new-york style, lucide icons). Add new ones with:

```sh
bunx shadcn@latest add <component>
```

## State

Use Zustand for client state (XP, streak, answers, selected unit, daily-goal minutes). Persist to `localStorage` with Zustand's `persist` middleware — do not write manual save/load logic. Account/profile data comes from the API, never duplicated in persistent stores.

## Routing

File-based routing in `apps/web/src/routes/`. Keep route files thin: a route defines the loader/`beforeLoad` and delegates rendering to a feature under `apps/web/src/features/<feature>/`. Regenerate the tree with `bun run --cwd apps/web generate-routes`.

Auth-guarded flows use `resolveSession()` in `beforeLoad`:

- anonymous → `redirect({ to: "/login" })`
- authenticated but not onboarded → `/onboarding`
- onboarded → dashboard

## Formatting and linting

Formatting is **Oxfmt**, not Prettier.

- 2 spaces, semicolons, double quotes, trailing commas
- Import sorting by Oxfmt
- Print width 100
- Tailwind CSS class sorting enabled

Linting is **Oxlint**, not ESLint.

- React + TypeScript plugins enabled
- Config in `oxlintrc.json`

Do not add ESLint/Prettier configs.

## TypeScript

- Strict mode, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noEmit`.
- Prefer inferred return types for simple functions; add explicit types for public contracts (e.g. the `Screen` union, shared schema-derived `Profile`, store shapes).
- Avoid `any`; model unknown data with `unknown` then narrow.
- Local TS imports use `.ts` suffixes (bundler-style). Configs use Bundler resolution.

## Commit convention

Follow Conventional Commits: `<type>(<scope>): <summary>`. Use `feat`, `fix`, `refactor`, `style`, `chore`, `docs`, `test`, `perf`. Scopes: `api`, `web`, `shared`, `db`, `docs`. No quotes, no emoji. Body describes what changed (why belongs in a PR).

## What not to add

- No ESLint/Prettier configs (Oxfmt and Oxlint are used instead). Delete stray `.prettierignore` if found.
- No `tailwind.config.js` — colors are defined in `apps/web/src/styles/globals.css`.
- No duplicated DTO schemas between web and API — use `packages/shared`.
- No live listeners in tests — use `app.handle(new Request(...))` and injected fakes.
- No backend/server/database logic in `features/` beyond the auth relay and `submitOnboarding` server functions.
- No engine code that knows the subject matter, and no domain logic in `engine/`.

<!-- intent-skills:start -->

# TanStack Intent - before editing files, run the matching guidance command.

tanstackIntent:

- id: "@tanstack/devtools#devtools-app-setup"
  run: "npx @tanstack/intent@latest load @tanstack/devtools#devtools-app-setup"
  for: "Install TanStack Devtools, pick framework adapter (React/Vue/Solid/Preact), register plugins via plugins prop, configure shell (position, hotkeys, theme, hideUntilHover, requireUrlFlag, eventBusConfig). TanStackDevtools component, defaultOpen, localStorage persistence."
- id: "@tanstack/devtools#devtools-marketplace"
  run: "npx @tanstack/intent@latest load @tanstack/devtools#devtools-marketplace"
  for: "Publish plugin to npm and submit to TanStack Devtools Marketplace. PluginMetadata registry format, plugin-registry.ts, pluginImport (importName, type), requires (packageName, minVersion), framework tagging, multi-framework submissions, featured plugins."
- id: "@tanstack/devtools#devtools-plugin-panel"
  run: "npx @tanstack/intent@latest load @tanstack/devtools#devtools-plugin-panel"
  for: "Build devtools panel components that display emitted event data. Listen via EventClient.on(), handle theme (light/dark), use @tanstack/devtools-ui components. Plugin registration (name, render, id, defaultOpen), lifecycle (mount, activate, destroy), max 3 active plugins. Two paths: Solid.js core with devtools-ui for multi-framework support, or framework-specific panels."
- id: "@tanstack/devtools#devtools-production"
  run: "npx @tanstack/intent@latest load @tanstack/devtools#devtools-production"
  for: "Handle devtools in production vs development. removeDevtoolsOnBuild, devDependency vs regular dependency, conditional imports, NoOp plugin variants for tree-shaking, non-Vite production exclusion patterns."
- id: "@tanstack/devtools-event-client#devtools-bidirectional"
  run: "npx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-bidirectional"
  for: "Two-way event patterns between devtools panel and application. App-to-devtools observation, devtools-to-app commands, time-travel debugging with snapshots and revert. structuredClone for snapshot safety, distinct event suffixes for observation vs commands, serializable payloads only."
- id: "@tanstack/devtools-event-client#devtools-event-client"
  run: "npx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-event-client"
  for: "Create typed EventClient for a library. Define event maps with typed payloads, pluginId auto-prepend namespacing, emit()/on()/onAll()/onAllPluginEvents() API. Connection lifecycle (5 retries, 300ms), event queuing, enabled/disabled state, SSR fallbacks, singleton pattern. Unique pluginId requirement to avoid event collisions."
- id: "@tanstack/devtools-event-client#devtools-instrumentation"
  run: "npx @tanstack/intent@latest load @tanstack/devtools-event-client#devtools-instrumentation"
  for: "Analyze library codebase for critical architecture and debugging points, add strategic event emissions. Identify middleware boundaries, state transitions, lifecycle hooks. Consolidate events (1 not 15), debounce high-frequency updates, DRY shared payload fields, guard emit() for production. Transparent server/client event bridging."
- id: "@tanstack/devtools-vite#devtools-vite-plugin"
  run: "npx @tanstack/intent@latest load @tanstack/devtools-vite#devtools-vite-plugin"
  for: "Configure @tanstack/devtools-vite for source inspection (data-tsd-source, inspectHotkey, ignore patterns), console piping (client-to-server, client-to-server, levels), enhanced logging, server event bus (port, host, HTTPS), production stripping (removeDevtoolsOnBuild), editor integration (launch-editor, custom editor.open). Must be FIRST plugin in Vite config. Vite ^6 || ^7 only."
- id: "@tanstack/react-start#lifecycle/migrate-from-nextjs"
  run: "npx @tanstack/intent@latest load @tanstack/react-start#lifecycle/migrate-from-nextjs"
  for: "Step-by-step migration from Next.js App Router to TanStack Start: route definition conversion, API endpoint mapping, Server Action conversion, middleware conversion, data fetching pattern changes."
- id: "@tanstack/react-start#react-start"
  run: "npx @tanstack/intent@latest load @tanstack/react-start#react-start"
  for: "React bindings for TanStack Start: createStart, StartClient, StartServer, React-specific imports, re-exports from @tanstack/react-router, full project setup with React, useServerFn hook."
- id: "@tanstack/react-start#react-start/server-components"
  run: "npx @tanstack/intent@latest load @tanstack/react-start#react-start/server-components"
  for: "Implement, review, debug, and refactor TanStack Start React Server Components in React 19 apps. Use when tasks mention @tanstack/react-start/rsc, renderServerComponent, createCompositeComponent, CompositeComponent, renderToReadableStream, createFromReadableStream, createFromFetch, Composite Components, React Flight streams, loader or query owned RSC caching, router.invalidate, structuralSharing: false, selective SSR, stale names like renderRsc or .validator, or migration from Next App Router RSC patterns. Do not use for generic SSR or non-TanStack RSC frameworks except brief comparison."
- id: "@tanstack/router-core#router-core"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core"
  for: "Framework-agnostic core concepts for TanStack Router: route trees, createRouter, createRoute, createRootRoute, createRootRouteWithContext, addChildren, Register type declaration, route matching, route sorting, file naming conventions. Entry point for all router skills."
- id: "@tanstack/router-core#router-core/auth-and-guards"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/auth-and-guards"
  for: "Route protection with beforeLoad, redirect()/throw redirect(), isRedirect helper, authenticated layout routes (_authenticated), non-redirect auth (inline login), RBAC with roles and permissions, auth provider integration (Auth0, Clerk, Supabase), router context for auth state."
- id: "@tanstack/router-core#router-core/code-splitting"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/code-splitting"
  for: "Automatic code splitting (autoCodeSplitting), .lazy.tsx convention, createLazyFileRoute, createLazyRoute, lazyRouteComponent, getRouteApi for typed hooks in split files, codeSplitGroupings per-route override, splitBehavior programmatic config, critical vs non-critical properties."
- id: "@tanstack/router-core#router-core/data-loading"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/data-loading"
  for: "Route loader option, loaderDeps for cache keys, staleTime/gcTime/ defaultPreloadStaleTime SWR caching, pendingComponent/pendingMs/ pendingMinMs, errorComponent/onError/onCatch, beforeLoad, router context and createRootRouteWithContext DI pattern, router.invalidate, Await component, deferred data loading with unawaited promises."
- id: "@tanstack/router-core#router-core/navigation"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/navigation"
  for: "Link component, useNavigate, Navigate component, router.navigate, ToOptions/NavigateOptions/LinkOptions, from/to relative navigation, activeOptions/activeProps, preloading (intent/viewport/render), preloadDelay, navigation blocking (useBlocker, Block), createLink, linkOptions helper, scroll restoration, MatchRoute."
- id: "@tanstack/router-core#router-core/not-found-and-errors"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/not-found-and-errors"
  for: "notFound() function, notFoundComponent, defaultNotFoundComponent, notFoundMode (fuzzy/root), errorComponent, CatchBoundary, CatchNotFound, isNotFound, NotFoundRoute (deprecated), route masking (mask option, createRouteMask, unmaskOnReload)."
- id: "@tanstack/router-core#router-core/path-params"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/path-params"
  for: "Dynamic path segments ($paramName), splat routes ($ / _splat), optional params ({-$paramName}), prefix/suffix patterns ({$param}.ext), pathParamsAllowedCharacters, i18n locale patterns."
- id: "@tanstack/router-core#router-core/search-params"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/search-params"
  for: "validateSearch, search param validation with Zod/Valibot/ArkType adapters, fallback(), search middlewares (retainSearchParams, stripSearchParams), custom serialization (parseSearch, stringifySearch), search param inheritance, loaderDeps for cache keys, reading and writing search params."
- id: "@tanstack/router-core#router-core/ssr"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/ssr"
  for: "Non-streaming and streaming SSR, RouterClient/RouterServer, renderRouterToString/renderRouterToStream, createRequestHandler, defaultRenderHandler/defaultStreamHandler, HeadContent/Scripts components, head route option (meta/links/styles/scripts), ScriptOnce, automatic loader dehydration/hydration, memory history on server, data serialization, document head management."
- id: "@tanstack/router-core#router-core/type-safety"
  run: "npx @tanstack/intent@latest load @tanstack/router-core#router-core/type-safety"
  for: "Full type inference philosophy (never cast, never annotate inferred values), Register module declaration, from narrowing on hooks and Link, strict:false for shared components, getRouteApi for code-split typed access, addChildren with object syntax for TS perf, LinkProps and ValidateLinkOptions type utilities, as const satisfies pattern."
- id: "@tanstack/router-plugin#router-plugin"
  run: "npx @tanstack/intent@latest load @tanstack/router-plugin#router-plugin"
  for: "TanStack Router bundler plugin for route generation and automatic code splitting. Supports Vite, Webpack, Rspack, and esbuild. Configures autoCodeSplitting, routesDirectory, target framework, and code split groupings."
- id: "@tanstack/start-client-core#start-core"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core"
  for: "Core overview for TanStack Start: tanstackStart() Vite plugin, getRouter() factory, root route document shell (HeadContent, Scripts, Outlet), client/server entry points, routeTree.gen.ts, tsconfig configuration. Entry point for all Start skills."
- id: "@tanstack/start-client-core#start-core/auth-server-primitives"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/auth-server-primitives"
  for: "Server-side authentication primitives for TanStack Start: session cookies (HttpOnly, Secure, SameSite, __Host- prefix), session read/issue/destroy via createServerFn and middleware, OAuth authorization-code flow with state and PKCE, password-reset enumeration defense, CSRF for non-GET RPCs, rate limiting auth endpoints, session rotation on privilege change. Pairs with router-core/auth-and-guards for the routing side."
- id: "@tanstack/start-client-core#start-core/deployment"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/deployment"
  for: "Deploy to Cloudflare Workers, Netlify, Vercel, Node.js/Docker, Bun, Railway. Selective SSR (ssr option per route), SPA mode, static prerendering, ISR with Cache-Control headers, SEO and head management."
- id: "@tanstack/start-client-core#start-core/execution-model"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/execution-model"
  for: "Isomorphic-by-default principle, environment boundary functions (createServerFn, createServerOnlyFn, createClientOnlyFn, createIsomorphicFn), ClientOnly component, useHydrated hook, import protection, dead code elimination, environment variable safety (VITE_ prefix, process.env)."
- id: "@tanstack/start-client-core#start-core/middleware"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/middleware"
  for: "createMiddleware, request middleware (.server only), server function middleware (.client + .server), context passing via next({ context }), sendContext for client-server transfer, global middleware via createStart in src/start.ts, middleware factories, method order enforcement, fetch override precedence."
- id: "@tanstack/start-client-core#start-core/server-functions"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/server-functions"
  for: "createServerFn (GET/POST), validator (Zod or function), useServerFn hook, server context utilities (getRequest, getRequestHeader, setResponseHeader, setResponseStatus), error handling (throw errors, redirect, notFound), streaming, FormData handling, file organization (.functions.ts, .server.ts)."
- id: "@tanstack/start-client-core#start-core/server-routes"
  run: "npx @tanstack/intent@latest load @tanstack/start-client-core#start-core/server-routes"
  for: "Server-side API endpoints using the server property on createFileRoute, HTTP method handlers (GET, POST, PUT, DELETE), createHandlers for per-handler middleware, handler context (request, params, context), request body parsing, response helpers, file naming for API routes."
- id: "@tanstack/start-server-core#start-server-core"
  run: "npx @tanstack/intent@latest load @tanstack/start-server-core#start-server-core"
  for: "Server-side runtime for TanStack Start: createStartHandler, request/response utilities (getRequest, setResponseHeader, setCookie, getCookie, useSession), three-phase request handling, AsyncLocalStorage context."
- id: "@tanstack/virtual-file-routes#virtual-file-routes"
  run: "npx @tanstack/intent@latest load @tanstack/virtual-file-routes#virtual-file-routes"
  for: "Programmatic route tree building as an alternative to filesystem conventions: rootRoute, index, route, layout, physical, defineVirtualSubtreeConfig. Use with TanStack Router plugin's virtualRouteConfig option."
- id: "dotenv#dotenv"
  run: "npx @tanstack/intent@latest load dotenv#dotenv"
  for: "Load environment variables from a .env file into process.env for Node.js applications. Use when configuring apps with secrets, setting up local development environments, managing API keys and database URLs, parsing .env file contents, or populating environment variables programmatically. Always use this skill when the user mentions .env, even for simple tasks like \"set up dotenv\" — the skill contains critical gotchas (encrypted keys, variable expansion, command substitution) that prevent common production issues."
- id: "dotenv#dotenvx"
  run: "npx @tanstack/intent@latest load dotenv#dotenvx"
  for: "Use dotenvx to run commands with environment variables, manage multiple .env files, expand variables, and encrypt env files for safe commits and CI/CD."

<!-- intent-skills:end -->
