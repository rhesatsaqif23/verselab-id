# Verselab Architecture

Technical deep-dive into how Verselab is built. Read [PRD.md](PRD.md) for *what* the product is, [CONCEPT.md](CONCEPT.md) for the core ideas and glossary, and this document for *how* the code is organized and why.

---

## 1. Overview

Verselab is a gamified interactive-learning web app inspired by Brilliant.org / Duolingo. Users learn through short interactive screens (choice, numeric, allocation, concept), earning XP and streaks to keep them returning daily.

- **Single app:** TanStack Start + React + Vite. No backend, no database, no login.
- **Persistence:** all progress lives in the browser via `localStorage` (PRD §8.3).
- **First domain:** personal finance. The engine must stay reusable for any future domain.

---

## 2. Design principles (from PRD §2)

These are rules, not suggestions. Architecture decisions exist to satisfy them:

1. **No passive screens** — every screen must make the user do something.
2. **Feel first, name later** — questions come before the concept name.
3. **Wrong is not punishment** — every answer (right or wrong) shows a 2-sentence explanation.
4. **One screen, one idea.**
5. **Wrong still proceeds** — no retries, no lives; mastery just drops.
6. **Max 2 sentences of text per screen.**
7. **A lesson takes 3–5 minutes.**

The technical consequence of rule 1 is the strict **engine/domain split** below.

---

## 3. The engine/domain split (the core idea)

This is the single most important architectural rule (PRD §3.2). The codebase is deliberately divided into two halves:

### Engine — subject-agnostic

Code that does **not** know what the material is about:

- Lesson UI (progress bar, buttons, feedback panel) — `src/engine/player/`
- XP, streak, mastery, daily goal — `src/engine/progress/`
- Unit ordering and unlock rules — `src/engine/path/`
- The `Screen`/`Lesson`/`Unit` type definitions — `src/engine/types.ts`

If tomorrow the material changes from finance to cooking, `src/engine/` is not touched.

### Domain — the material

Code that is about the subject matter. Today that is personal finance:

- Lesson questions — `src/content/`
- Finance calculations — `src/domains/personal-finance/math.ts`
- Screen renderers and charts — `src/domains/personal-finance/screens/` and `components/`

New materials are added as new sibling folders; the engine is untouched.

### How to decide where code goes

Ask one question: *does this code mention money, interest, salary, or installments?*

- **Yes** → `domains/personal-finance/` (or the relevant domain folder).
- **No** → `engine/`.

### The binding contract

- The engine passes **one screen's data** to the domain; the domain renders it and calls back `onAnswer(true)` or `onAnswer(false)`.
- The engine never knows what a question is about — only that it was answered right or wrong.
- If you find yourself writing `if (material === 'keuangan')` inside `engine/`, something is wrong. Stop and ask.

---

## 4. Directory structure

```
src/
├── client.tsx / server.tsx / router.tsx   TanStack Start entry points
├── engine/                                Subject-agnostic core. Never knows the material.
│   ├── types.ts                           Screen (union), Lesson, Unit type definitions
│   ├── player/                            Lesson UI: progress bar, buttons, feedback, "Kenapa?" dialog
│   │   ├── LessonPlayer.tsx               Orchestrates one screen at a time via lessonStore
│   │   ├── LessonHeader.tsx               Exit button, ProgressBar, live XP badge
│   │   ├── LessonControls.tsx             Bottom buttons per phase (concept/answering/checked)
│   │   ├── ProgressBar.tsx                Screen index progress bar
│   │   ├── ExplanationDialog.tsx          "Kenapa?" explanation modal
│   │   └── lessonStore.ts                 Per-lesson session state (in-memory)
│   ├── progress/                          XP, streak, mastery, daily goal
│   │   ├── progressStore.ts               Global persisted store + award actions
│   │   ├── streak.ts                      Streak + freeze rules (pure functions)
│   │   ├── decay.ts                       Mastery decay over inactive weeks
│   │   └── masteryRead.ts                 Display helpers (started, decayed value)
│   └── path/
│       └── nextLesson.ts                  Picks the next unit/lesson to open
├── domains/                               The material. One folder per domain.
│   └── personal-finance/
│       ├── math.ts                        Pure finance functions (futureValue, monthlyPayment, ...)
│       ├── screens/                       One renderer per screen type
│       │   ├── ChoiceRenderer.tsx
│       │   ├── NumericRenderer.tsx
│       │   ├── AllocationRenderer.tsx
│       │   └── ConceptRenderer.tsx
│       └── components/
│           └── BarChart.tsx               Simple bar chart for allocation preview
├── content/                               Lesson data as TS. The only place screens are written.
│   ├── index.ts                           units export + findLesson() registry
│   ├── units.ts                           Ordered unit list (learning path)
│   └── lessons/
│       └── why-save-early.ts              The first real lesson
├── features/                              Feature-scoped modules wrapping the engine/domains core
│   ├── layout/                            App chrome
│   │   ├── constants.ts                   navItems for the header
│   │   └── components/                    Header, Footer, ThemeToggle
│   ├── home/                              Dashboard
│   │   ├── constants.ts                   WEEKDAY_LABELS
│   │   ├── index.tsx                      HomePage composition
│   │   └── components/                    CourseCard, CourseGrid, DailyGoalCard, StreakTracker
│   ├── lesson/                            Lesson page wiring
│   │   ├── index.tsx                      LessonPage: connects player to progress/content
│   │   ├── renderScreen.tsx               Dispatches Screen type → domain renderer
│   │   └── checkAnswer.ts                 Correctness rules per screen type
│   ├── lesson-complete/                   Completion summary
│   │   ├── index.tsx                      LessonCompletePage
│   │   └── store/lessonCompleteStore.ts   Last-completed-lesson summary (in-memory)
│   ├── profile/                           Profile stats page
│   └── about/                             Static about page
├── libs/                                  Subject-agnostic shared app code
│   ├── utils.ts                           cn() class merge helper
│   ├── date.ts                            todayString, addDays, daysBetween, getWeekDates, ...
│   ├── theme.ts                           Theme mode types, init script, apply helpers
│   └── hooks/use-mobile.ts                Mobile viewport detection
├── contentless? no — see content/ above
├── components/ui/                         shadcn/ui primitives (new-york style, lucide icons)
├── routes/                                Thin file-based routes delegating to features
├── stories/                               Storybook stories (shadcn primitives + Configure.mdx)
└── styles/
    └── globals.css                        Semantic color tokens (light + dark) via @theme

tests/                                     Unit tests mirroring src/ (root-level)
```

Path aliases: `#/*` and `@/*` both map to `./src/*`.

---

## 5. Domain model

```ts
Unit    → { id, title, lessons: readonly Lesson[] }
Lesson  → { id, title, screens: readonly Screen[] }
Screen  → a discriminated union (see §6)
```

- **Unit** — one topic, e.g. "Bunga berbunga". A unit has 3–5 lessons.
- **Lesson** — one sitting, 3–5 minutes. A lesson has 6–8 screens.
- **Screen** — the smallest unit; one interactive question or (rarely) one concept intro.

The union type in `src/engine/types.ts` is the public contract between engine and domain. TypeScript narrows available fields per screen type, so a renderer only ever sees the fields it needs.

---

## 6. Screen types

| Type       | Purpose                                              | Answer checking                                    | Limit per lesson |
| ---------- | ---------------------------------------------------- | -------------------------------------------------- | ---------------- |
| `concept`  | Name a concept after the user felt its effect        | none (just "Lanjut")                               | max 1            |
| `choice`   | Multiple choice; blue border on selected card        | `answer === correctId`                             | max 30%          |
| `numeric`  | User types a number                                  | within `acceptRange` (range, not exact)            | —                |
| `allocation`| Sliders summing to 100% with live chart             | rule: `{ category, min?, max? }` on one category   | —                |

Key rules from PRD §4:

- **numeric** answers are checked by **range** (`acceptRange: [min, max]`), never exact value. The point is magnitude ("oh, 60 juta becomes 82 juta"), not rupiah precision.
- **numeric** correct answers are **computed from `math.ts`**, never hardcoded in the data — so fixing a formula can't silently leave a stale answer in a lesson.
- **allocation** has many correct answers by design (real life has no single "right" way to split a salary). Correctness is a constraint on one category (e.g. savings ≥ 20%).

---

## 7. Runtime data flow (one screen)

1. Route `/lesson/$lessonId` validates the id via `findLesson()` and calls `lessonStore.startLesson(screenCount)` in `beforeLoad`.
2. `LessonPage` (features/lesson) renders `LessonPlayer`, passing `screens`, `renderScreen`, `checkAnswer`, `onExit`, `onComplete`, and the current earned XP.
3. `LessonPlayer` reads `index`, `answers`, `results` from `lessonStore` and renders the current screen through `renderScreen(screen, onChange, checked)`.
4. `renderScreen` dispatches on `screen.type` to the matching **domain renderer** (e.g. `NumericRenderer`). The engine never knows which renderer is chosen or what the screen is about.
5. The user interacts; the renderer calls `onChange(answer)`, which writes into `lessonStore.answers[index]`. The Check button becomes enabled.
6. "Cek Jawaban" → `LessonPlayer.handleCheck` → `checkAnswer(screen, answer)` → `lessonStore.checkResult(index, correct)`.
7. `checked` becomes `true|false`, and the renderer shows green/red feedback inline (never a modal over the question — PRD §5).
8. "Lanjut" → `handleContinue`. If there are more screens, `index` increments; if this was the last screen, `onComplete(finalResults)` fires with every `AnswerResult`.
9. `LessonPage.handleComplete` awards per-screen mastery + XP, awards lesson completion (+50 XP, streak), writes the summary to `lessonCompleteStore`, and navigates to `/lesson-complete`.

---

## 8. State management

Zustand, with the `persist` middleware for anything that must survive reload. No manual save/load logic.

| Store                       | Scope                        | Persisted?    | Storage key            |
| --------------------------- | ---------------------------- | ------------- | ---------------------- |
| `engine/player/lessonStore` | Current lesson session       | No            | —                      |
| `engine/progress/progressStore` | Global XP/streak/mastery/goal | Yes (`persist`) | `verselab-progress-v1` |
| `lesson-complete/lessonCompleteStore` | Last finished lesson summary | No         | —                      |

- `lessonStore` is deliberately **not persisted**: leaving a lesson is "start over" by design (PRD §2 rule 5 — no lives, no retries).
- `progressStore` is the single source of truth for gamification. All award actions (`awardScreenResult`, `awardLessonCompletion`, `awardXp`, `registerActivity`, `setDailyGoal`) live there; pure functions in `streak.ts` / `decay.ts` do the math.
- Persisted state is versioned (`verselab-progress-v1`) so schema changes can be migrated.

Reading persisted state: components subscribe via `useProgressStore((s) => s.xp)` etc. Derive display values with `masteryForDisplay` / `decayedMastery` rather than reading `mastery` raw.

---

## 9. Gamification model

| Concept            | Rule                                                          | Constant / location                    |
| ------------------ | ------------------------------------------------------------- | -------------------------------------- |
| XP                 | +10 per correct screen, +50 per completed lesson. Never decreases. | `XP_PER_SCREEN`, `XP_PER_LESSON` in `progressStore.ts` |
| Mastery            | 0–100 per unit. +2 correct, −1 wrong, −2 per full inactive week. | `MASTERY_*`, `DECAY_PER_WEEK` in `progressStore.ts` / `decay.ts` |
| Streak             | Consecutive days reaching the daily goal. +1 freeze every 7-day streak. | `streakOnActivity()` in `streak.ts` |
| Streak freeze      | 1 free missed day per 7-day streak; a freeze day consumes it.  | `streak.ts`                            |
| Daily goal         | User-picked: 3, 10, or 20 minutes.                            | `DailyGoalMinutes` in `progressStore.ts` |

Intentional omissions (PRD §6.4): no lives/hearts, no per-question timer, no XP penalty for wrong answers.

---

## 10. Rendering pipeline

```
Route (thin)
  → feature page            (e.g. features/lesson → LessonPage)
    → engine player         (LessonPlayer — knows nothing of the material)
      → renderScreen()      (features/lesson — maps Screen.type → renderer)
        → domain renderer   (domains/personal-finance/screens/* — knows the material)
          → onChange(answer) / checked feedback
```

`checkAnswer()` (features/lesson) is the correctness rulebook: exact match for `choice`, range for `numeric`, rule check for `allocation`. `concept` screens are never checked (always "continue").

---

## 11. Content authoring

Content is TypeScript under `src/content/`:

- `units.ts` exports the ordered `units` array (the learning path). Units can contain placeholder lessons (`dummyLesson`).
- Each real lesson lives in `src/content/lessons/<slug>.ts` and is imported into `units.ts`.
- `findLesson(id)` walks all units to locate a lesson regardless of unit.

Authoring rules (PRD §4.3, §9):

- Write lessons **after** the screen types exist — the available types shape the lesson, not the reverse.
- Never hardcode a numeric answer; derive the `acceptRange` from `math.ts` output.
- Follow the rhythm: *make them curious (choice) → name the concept (concept) → practice (numeric/allocation) → apply to a real situation (choice)*.
- Respect per-lesson limits: ≤ 1 concept screen, ≤ 30% choice screens, 6–8 screens total.

---

## 12. Routing

File-based routing under `src/routes/`. Routes stay thin — a route validates params and delegates rendering to a feature.

| Route                 | File                       | Purpose                                        |
| --------------------- | -------------------------- | ---------------------------------------------- |
| `/`                   | `index.tsx`                | Marketing landing page                         |
| `/_home`              | `_home.tsx`                | Layout route: Header + Outlet + Footer         |
| `/_home/home`         | `_home/home.tsx`           | Dashboard (default landing after login flow)   |
| `/_home/about`        | `_home/about.tsx`          | Static about page                              |
| `/_home/profile`      | `_home/profile.tsx`        | Stats page                                     |
| `/lesson/$lessonId`   | `lesson.$lessonId.tsx`     | Lesson player (guarded by `findLesson`)        |
| `/lesson-complete`    | `lesson-complete.tsx`      | Completion summary (guarded by summary presence) |

Guards are done in `beforeLoad` (redirect to `/home` for unknown lessons, `/` for no summary).

---

## 13. Styling & theming

- **Tailwind v4** configured via CSS `@theme`, **no** `tailwind.config.js`.
- Semantic color tokens live in `src/styles/globals.css` (light `:root` + `.dark` blocks) and are surfaced to Tailwind via `@theme inline`. **Never hardcode hex colors in components.**
- Theme mode (`light`/`dark`/`auto`) is managed by `libs/theme.ts` (init script + `applyThemeMode`), toggled by `features/layout/ThemeToggle`, persisted under the `theme` key.
- Use canonical Tailwind classes (see [AGENTS.md](AGENTS.md) §Styling) and semantic classes (`text-primary`, `bg-card`, `border-border`, `text-accent`, `text-muted`).

---

## 14. Testing

- Tests live at the **repo root** in `tests/`, mirroring `src/` one-to-one (`tests/engine/...`, `tests/features/...`, `tests/domains/...`, `tests/content/...`).
- Runner is **Vitest**, configured inside `vite.config.ts` (`environment: jsdom`, `globals: true`, `setupFiles: ['./tests/setup.ts']`).
- `tests/setup.ts` provides a `ResizeObserver` mock (needed by shadcn/ui components).
- There is **no `test` npm script**; run tests with `npx vitest run` (or `npm run storybook` for component stories).

---

## 15. Code standards & tooling

- **TypeScript:** strict, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noEmit`. Typecheck with `npx tsc --noEmit`. Avoid `any` (use `unknown` + narrow).
- **Imports:** path aliases `#/...` / `@/...` for `src/`. Local imports use explicit `.ts`/`.tsx` extensions (enabled by `allowImportingTsExtensions`).
- **Comments:** file-level `// Module purpose` header comments are used; keep them meaningful and updated.
- **Commits:** Conventional Commits, no quotes/emoji — see `docs/CONVENTIONAL_COMMITS.md`. Scope `web` for frontend work.
- **Package manager:** npm only. Do not add other lockfiles.
- **No lint/format configs** exist (per project decision). Typecheck is the gate.

---

## 16. Extending the platform

### Adding a new domain (e.g. cooking)

1. Create `src/domains/cooking/` with `math.ts`, `screens/`, `components/`.
2. Write lesson content under `src/content/lessons/` using existing `Screen` types.
3. Point `renderScreen.tsx` at the new domain's renderers (or write new ones implementing the same `Screen` union).
4. **Do not touch `engine/`.** The engine already speaks generic `Screen` data.

### Adding a new screen type (e.g. `matching`)

1. Extend the `Screen` union in `src/engine/types.ts`.
2. Implement `checkAnswer` for the new type.
3. Add a renderer in the domain `screens/` and dispatch it in `renderScreen.tsx`.
4. Add tests in `tests/` for the checker and renderer.

### Adding a lesson

1. Write `src/content/lessons/<slug>.ts` exporting a `Lesson`.
2. Register it in `src/content/units.ts`.
3. Derive numeric `acceptRange`s from `math.ts`.
4. Respect the per-lesson screen limits.

---

## 17. Things deliberately absent

- Backend, database, login, or any server code — all persistence is `localStorage` (PRD §8.3). The Drizzle scripts in `package.json` are starter-template leftovers; do not use them.
- TanStack Query / server state — there is no server state to fetch.
- Engine code that mentions the material, and domain logic in `engine/`.
- `tailwind.config.js` — theming is CSS-only.
- ESLint/Prettier configs.

---

## 18. Guardrails (quick checks)

- **I'm about to write `if (material === ...)` in `engine/`** → stop; put it in the domain.
- **Does this code mention money/interest/salary/installments?** → it belongs in `domains/personal-finance/`.
- **Am I hardcoding a numeric answer?** → derive it from `math.ts` instead.
- **More than 1 concept screen per lesson?** → split.
- **More than 30% choice screens per lesson?** → it's a quiz, not interactive learning.
- **Am I adding a modal over the question?** → no. Feedback must not hide the question (PRD §5).
