# AGENTS.md

## Project

Verselab (verselab.id) is a gamified interactive-learning web app inspired by Brilliant.org / Duolingo. Users learn through short interactive screens (choice, numeric, allocation, concept), earning XP and streaks to keep them returning daily.

The product is NOT a finance app. It is a learning engine — personal finance is only the first material because numeric questions are cheap to build and check. The engine must be reusable for any future domain without rewriting it.

Single app: TanStack Start + React + Vite. No backend, no database, no login. All progress is stored in the browser via `localStorage` (PRD section 8.3).

## Architecture: engine / domain split

This is the single most important concept in the project (PRD section 3.2). See [CONCEPT.md](CONCEPT.md) for a detailed explanation and glossary of terms (Screen, Lesson, Unit, Renderer, Mastery, XP), and [ARCHITECTURE.md](ARCHITECTURE.md) for the full technical deep-dive.

```
src/
├── engine/                  Must never know the subject matter
│   ├── player/              Lesson UI: LessonPlayer, LessonHeader, LessonControls, ProgressBar, ExplanationDialog, lessonStore
│   ├── progress/            XP, streak, mastery, daily goal: progressStore, streak, decay, masteryRead
│   ├── path/                nextLesson: unit ordering and unlock rules
│   └── types.ts             Screen (union), Lesson, Unit type definitions
├── domains/
│   └── personal-finance/
│       ├── math.ts          All finance calculations (futureValue, monthlyPayment, monthsToTarget)
│       ├── screens/         Renderer per screen type: Choice, Numeric, Allocation, Concept
│       └── components/      Charts and other visual components (BarChart)
├── features/                Feature-scoped modules around the engine/domains core
│   ├── layout/              App chrome: Header, Footer, ThemeToggle (+ constants)
│   ├── home/                Dashboard: CourseCard, CourseGrid, StreakTracker, DailyGoalCard (+ constants)
│   ├── lesson/              Lesson page wiring: renderScreen, checkAnswer
│   ├── lesson-complete/     Completion summary page + store/
│   ├── profile/             Profile stats page
│   └── about/               Static about page
├── libs/                    Subject-agnostic shared app code
│   ├── utils.ts             cn() class merge helper
│   ├── date.ts              Date helpers: todayString, addDays, daysBetween, ...
│   ├── theme.ts             Theme mode types, init script, apply helpers
│   └── hooks/               use-mobile
├── content/                 Lesson data as TS: units.ts, index.ts, lessons/
├── components/ui/           shadcn/ui primitives
├── routes/                  Thin route files delegating to features
├── stories/                 Storybook stories (shadcn primitives)
└── styles/                  globals.css
tests/                       Unit tests mirroring src/ (root tests/ dir)
```

Rules:

- If code mentions money, interest, salary, or installments → `domains/personal-finance/`. Otherwise → `engine/`.
- The engine passes one screen's data to the domain; the domain renders it and calls back `onAnswer(true)` or `onAnswer(false)`.
- The engine never knows what a question is about — only that it was answered right or wrong.
- If you find yourself writing `if (material === 'keuangan')` inside `engine/`, something is wrong. Stop and ask.

## Screen types

There are 4 screen types in v1 (PRD section 4). Each has its own renderer component and typed data. The `Screen` type in `src/engine/types.ts` is a union type, so TypeScript narrows the available fields per type.

- `concept` — introduces a concept name after the user has felt its effect. Max 1 per lesson.
- `choice` — multiple choice; cards with a blue border on selection. Max 30% of screens per lesson.
- `numeric` — user types a number; answers checked by range, not exact value. Correct answer is computed from `math.ts`, never hardcoded.
- `allocation` — sliders summing to 100%; checked against a rule (e.g. savings min 20%).

## Commands

```sh
npm run dev                  # Vite dev server on port 3000
npm run build                # production build
npm run preview              # preview the production build
npm run generate-routes      # tsr generate (route tree)
npm run storybook            # Storybook dev server on port 6006
npm run build-storybook      # Storybook build
```

There is no lint or test script configured. Typecheck with:

```sh
npx tsc --noEmit
```

Drizzle scripts (`db:generate`, `db:migrate`, `db:push`, `db:pull`, `db:studio`) exist from the starter template but the app has no backend — do not use them for product code.

## Package manager

Use npm only. There is an existing `package-lock.json`; do not add bun/yarn/pnpm lockfiles.

## Styling: Tailwind v4

Tailwind v4 is configured in CSS via `@theme`, not in a `tailwind.config.js`.

- Theme and all brand colors live as semantic CSS variables in `src/styles/globals.css`, imported by `src/styles.css`. Never hardcode hex colors in components.
- **Never use hardcoded Tailwind color utilities** like `bg-orange-500`, `text-blue-800`, `border-gray-600`, etc. Always use a CSS variable from `globals.css`. If the variable does not exist yet, add it there first (both light and dark values), expose it in `@theme inline`, then use it as `bg-fire`, `text-primary`, etc.
- Use Tailwind canonical classes only — keep the IntelliSense `suggestCanonicalClasses` panel clean:
  - `bg-linear-to-*`, not `bg-gradient-to-*`
  - `shrink-0`, not `flex-shrink-0`
  - `(--var)` shorthand, not `[var(--var)]`
  - `wrap-anywhere`, not `[overflow-wrap:anywhere]`
  - Semantic classes `text-primary` / `bg-card` / `border-border` / `text-accent` / `text-muted`, not `text-(--color-primary)`

## Path aliases

- `#/*` and `@/*` both map to `./src/*`.
- shadcn/ui aliases: `#/components/ui`, `#/lib/utils`, `#/lib`, `#/hooks`.

## shadcn/ui

Shared UI components live in `src/components/ui/` (new-york style, lucide icons). Add new ones with:

```sh
npx shadcn@latest add <component>
```

## State

Use Zustand for client state (XP, streak, answers, selected unit). Persist to `localStorage` with Zustand's `persist` middleware — do not write manual save/load logic.

## Routing

File-based routing in `src/routes/`. Keep route files thin: a route defines the loader/component and delegates rendering to a feature. Feature implementation belongs under `src/features/<feature>/`.

## TypeScript

- Strict mode, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noEmit`.
- Prefer inferred return types for simple functions; add explicit types for public contracts (e.g. the `Screen` union, stores).
- Avoid `any`.

## Commit convention

Follow `docs/CONVENTIONAL_COMMITS.md`: Conventional Commits, no quotes, no emoji, scope for context.

## What not to add

- No ESLint/Prettier configs (not set up in this project).
- No backend/server/database code in the product (PRD 8.3 — everything is localStorage).
- No engine code that knows the subject matter, and no domain logic in `engine/`.
- No `tailwind.config.js` — colors are defined in `src/styles/globals.css`.

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
    for: "Configure @tanstack/devtools-vite for source inspection (data-tsd-source, inspectHotkey, ignore patterns), console piping (client-to-server, server-to-client, levels), enhanced logging, server event bus (port, host, HTTPS), production stripping (removeDevtoolsOnBuild), editor integration (launch-editor, custom editor.open). Must be FIRST plugin in Vite config. Vite ^6 || ^7 only."
  - id: "@tanstack/react-start#lifecycle/migrate-from-nextjs"
    run: "npx @tanstack/intent@latest load @tanstack/react-start#lifecycle/migrate-from-nextjs"
    for: "Step-by-step migration from Next.js App Router to TanStack Start: route definition conversion, API mapping, server function conversion from Server Actions, middleware conversion, data fetching pattern changes."
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
    for: "Dynamic path segments ($paramName), splat routes ($ / _splat), optional params ({-$paramName}), prefix/suffix patterns ({$param}.ext), useParams, params.parse/stringify, pathParamsAllowedCharacters, i18n locale patterns."
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
    for: "Load environment variables from a .env file into process.env for Node.js applications. Use when configuring apps with secrets, setting up local development environments, managing API keys and database uRLs, parsing .env file contents, or populating environment variables programmatically. Always use this skill when the user mentions .env, even for simple tasks like \"set up dotenv\" — the skill contains critical gotchas (encrypted keys, variable expansion, command substitution) that prevent common production issues."
  - id: "dotenv#dotenvx"
    run: "npx @tanstack/intent@latest load dotenv#dotenvx"
    for: "Use dotenvx to run commands with environment variables, manage multiple .env files, expand variables, and encrypt env files for safe commits and CI/CD."
<!-- intent-skills:end -->
