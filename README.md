# Verselab

> Interactive skill learning, gamified like Duolingo. Learn through short interactive screens — choice, numeric, allocation, and concept — earning XP and maintaining daily streaks.

Verselab (verselab.id) is a gamified interactive-learning web app inspired by Brilliant.org / Duolingo. It is **not** a finance app: personal finance is just the first domain because numeric questions are cheap to build and check. The learning engine is domain-agnostic and reusable for any future subject.

## Tech stack

| What        | How                                                             |
| ----------- | --------------------------------------------------------------- |
| Framework   | [TanStack Start](https://tanstack.com/start) (React 19)         |
| Routing     | [TanStack Router](https://tanstack.com/router), file-based      |
| Styling     | [Tailwind CSS v4](https://tailwindcss.com/) (CSS `@theme`)      |
| State       | [Zustand](https://zustand.docs.pmnd.rs/) + `persist` middleware |
| Persistence | `localStorage` in the browser (no backend, no login)            |
| UI          | [shadcn/ui](https://ui.shadcn.com/) (new-york, lucide icons)    |
| Testing     | [Vitest](https://vitest.dev/) + Testing Library                 |
| Storybook   | [Storybook](https://storybook.js.org/) for shadcn primitives    |

## Getting started

```sh
npm install
npm run dev        # Vite dev server on port 3000
```

No backend, database, or env variables are required. All progress is stored locally in your browser.

## Scripts

```sh
npm run dev              # Vite dev server on port 3000
npm run build            # production build
npm run preview          # preview the production build
npm run generate-routes  # tsr generate (route tree)
npm run storybook        # Storybook dev server on port 6006
npm run build-storybook  # Storybook build
```

There is no lint or test script. Typecheck with `npx tsc --noEmit`; run tests with `npx vitest run`.

## Project structure

The codebase is split into a subject-agnostic **engine** and the **domain** (currently personal finance).

```
src/
├── engine/                  Must never know the subject matter (player, progress, path, types)
├── domains/
│   └── personal-finance/    Finance math, screen renderers, chart components
├── features/                Pages: layout, home, lesson, lesson-complete, profile, about
├── libs/                    Shared helpers: cn(), date, theme, hooks
├── content/                 Lesson content as TS (units, lessons)
├── components/ui/           shadcn/ui primitives
├── routes/                  Thin TanStack Router routes
└── styles/                  globals.css (semantic theme tokens)
tests/                       Unit tests mirroring src/ (root-level)
```

## Documentation

- [PRD.md](PRD.md) — product requirements (Indonesian)
- [CONCEPT.md](CONCEPT.md) — core concepts and glossary (Indonesian)
- [ARCHITECTURE.md](ARCHITECTURE.md) — technical deep-dive: structure, data flow, state, content authoring
- [AGENTS.md](AGENTS.md) — project conventions for AI agents and contributors
- [docs/CONVENTIONAL_COMMITS.md](docs/CONVENTIONAL_COMMITS.md) — commit conventions
