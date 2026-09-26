# Verselab

> **Interactive skill learning, gamified like Duolingo, visual like Brilliant.org.**  
> Learn essential concepts through short interactive screens — concept, multiple choice, numeric calculation, and dynamic allocation — while earning XP and maintaining daily streaks.

Verselab ([verselab.id](https://verselab.id)) is an interactive learning web application designed around micro-learning and gamification. A **Bun workspace monorepo** serves a TanStack Start SSR web app (port 3000) and a Bun + Elysia API (port 3001) with PostgreSQL for accounts and learning profiles. In-game progress (XP, streak, mastery, curriculum edits) stays in the browser via `localStorage`.

While it launches with business and financial literacy materials (**Keuangan**, **Akuntansi**, **Manajemen Produk**, and **Kewirausahaan**), the core engine is completely domain-agnostic and built to support any future subject matter without architectural changes.

---

## Workspace layout

```txt
apps/web        TanStack Start + React 19 SSR app (port 3000)
apps/api        Bun + Elysia + Better Auth + Drizzle/PostgreSQL API (port 3001)
packages/shared shared Zod schemas/types reused by web and api
```

---

## Key Features

### 1. Interactive Question Types

The learning engine supports 4 interactive screen formats:

- **`concept`**: Introduces core ideas, mental models, and definitions after the user has experienced the intuition.
- **`choice`**: Multiple-choice scenario cards with instant feedback and explanations.
- **`numeric`**: Dynamic numerical input with tolerances checked against math calculations (never hardcoded answers).
- **`allocation`**: Interactive multi-slider controls that must sum to 100% and satisfy financial/budgeting constraints.

### 2. Interactive Whiteboard Map Canvas (`/units/$unitId`)

- Infinite-feel pannable and zoomable whiteboard canvas.
- Automatically centers and positions the current lesson with comfortable viewport margins.
- Visual sequential flow: dashed connector lines that become solid on completion with directional arrowheads.
- Collapsible unit details sidebar with search, topic filtering, and completion tracking.
- Floating bottom bar with progress percentage, XP rewards, and active lesson CTA.

### 3. Gamification Engine

- **XP System**: Earn XP for completing screens and lessons.
- **Daily Streaks**: Maintain active streak counts with automated decay and recovery mechanics.
- **Daily Goals**: Customizable daily target tracking (Casual, Regular, Serious).
- **Mastery Levels**: Dynamic unit mastery calculated from retention and completion history.

### 4. Accounts, Auth & Onboarding

- Email + password authentication via **Better Auth** on the Elysia API.
- Session relay through TanStack Start server functions with route guards.
- Onboarding profile: display name, starting unit, and daily goal persisted in PostgreSQL.

### 5. Curriculum Studio / Admin Mode (`/admin`)

- Complete in-browser curriculum editor to manage units, lessons, and interactive screens.
- Reorder screens with drag-and-drop or sequential buttons.
- Real-time preview panel to test newly authored screens before publishing.

### 6. Design & User Experience

- **Tailwind CSS v4**: Theme tokens defined via `@theme inline` in CSS (zero hardcoded hex colors).
- **Zero-FOUC Dark Mode**: Light, Dark, and Auto/System mode detection with pre-hydration theme script.
- **Sticky Glassmorphic Header**: Elevated navigation with live streak and XP counter badges.
- **High-Contrast Multi-Column Footer**: Streamlined navigation with direct deep-links to units and application routes.

---

## Curriculum Tracks

| Unit                 | Focus & Learning Outcomes                                                      | Lessons   |
| -------------------- | ------------------------------------------------------------------------------ | --------- |
| **Keuangan**         | Personal finance, compound interest, time value of money, budgeting, and loans | 4 Lessons |
| **Akuntansi**        | Balance sheet equation, double-entry bookkeeping, profit & loss, and cash flow | 4 Lessons |
| **Manajemen Produk** | Problem discovery, feature prioritization, product metrics, and MVP validation | 4 Lessons |
| **Kewirausahaan**    | Unit economics, break-even analysis, value-based pricing, and idea validation  | 4 Lessons |

---

## Tech Stack

| Layer                    | Technology                                                                    | Details                                                     |
| ------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Web framework**        | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev/) | Full-stack React framework powered by Vite                  |
| **Routing**              | [TanStack Router](https://tanstack.com/router)                                | 100% type-safe, file-based routing                          |
| **API**                  | [Elysia](https://elysiajs.com/) + [Bun](https://bun.sh/)                      | HTTP server on port 3001                                    |
| **Auth**                 | [Better Auth](https://better-auth.com/)                                       | Email + password, sessions in PostgreSQL                    |
| **Database**             | [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL                         | Lazy `getDb()` access, kitchen migrations                   |
| **Shared schemas**       | [Zod](https://zod.dev/)                                                       | Single source of truth in `packages/shared`                 |
| **Styling**              | [Tailwind CSS v4](https://tailwindcss.com/)                                   | Pure CSS `@theme` configuration with semantic CSS variables |
| **State**                | [Zustand](https://zustand.docs.pmnd.rs/)                                      | Client state with `persist` middleware to `localStorage`    |
| **UI Components**        | [shadcn/ui](https://ui.shadcn.com/)                                           | New-York style primitives with Lucide icons                 |
| **Linting & Formatting** | [Oxlint](https://oxc.rs/) & [Oxfmt](https://oxc.rs/)                          | High-performance Rust-based linter and formatter            |
| **Testing**              | [Vitest](https://vitest.dev/) + Testing Library                               | Web unit tests mirroring application structure              |
| **Design System**        | [Storybook](https://storybook.js.org/)                                        | Isolated component workbench (web only)                     |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/docs/installation) ≥ 1.x
- Docker (for local PostgreSQL)

### Installation

```sh
# Clone repository
git clone https://github.com/rhesatsaqif23/verselab-id.git
cd verselab-id

# Install dependencies (Bun workspaces)
bun install

# Copy environment templates
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Start local PostgreSQL (Docker)
docker start verselab-postgres   # create with: docker run -d --name verselab-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16

# Apply migrations
bun run --cwd apps/api db:migrate

# Start the API and web app
bun run dev:api                  # http://localhost:3001
bun run dev                      # http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000). See [DEVELOPMENT.md](DEVELOPMENT.md) for the full command and env-key reference, and [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md) for the data model.

---

## Available Scripts

```sh
# Development & Build
bun run dev              # Web dev server on port 3000
bun run dev:api          # API dev server on port 3001
bun run build            # Production web build (vite build)
bun run --cwd apps/web generate-routes  # Regenerate TanStack Router route tree (tsr generate)

# Database (Drizzle)
bun run --cwd apps/api db:generate
bun run --cwd apps/api db:migrate
bun run --cwd apps/api db:push
bun run --cwd apps/api db:studio

# Quality & Verification
bun run lint             # Run Oxlint
bun run lint:fix         # Run Oxlint with automated fixes
bun run fmt              # Format all files using Oxfmt
bun run fmt:check        # Check formatting without writing (CI)
bun run check-types      # Full TypeScript typecheck (api + web + shared)
bun run test             # Run API (bun test) + web (vitest) tests

# Storybook
bun run --cwd apps/web storybook   # Start Storybook on port 6006
bun run --cwd apps/web build-storybook
```

---

## Project Structure

```
apps/
├── api/                             # Bun + Elysia + Better Auth + Drizzle
│   ├── src/
│   │   ├── auth/                    # Better Auth instance
│   │   ├── config/                  # Zod-parsed env
│   │   ├── database/                # schema.ts, auth-schema.ts, lazy getDb()
│   │   ├── libs/response.ts         # ok() / fail() envelope
│   │   ├── middleware/auth.ts       # authContext macro ({ auth: true })
│   │   ├── modules/                 # health, user, onboarding controllers
│   │   └── plugins/logger.ts        # x-request-id + request/error logging
│   └── drizzle/                     # Drizzle migrations
└── web/                             # TanStack Start SSR app
    └── src/
        ├── engine/                  # Domain-agnostic learning engine (never references finance/business)
        ├── domains/                 # personal-finance (math + screen renderers)
        ├── features/                # home, lesson, unit-detail, admin, auth, onboarding, ...
        ├── content/                 # Seeded curriculum data (4 units, 16 lessons)
        ├── libs/                    # env.ts, session.ts (relay), auth-client.ts, utils, date, theme
        ├── components/ui/           # shadcn/ui primitives
        ├── routes/                  # Thin TanStack Router routes delegating to features
        ├── stories/                 # Storybook stories
        └── styles/                  # globals.css (semantic theme variables) & styles.css
packages/
└── shared/                          # Zod schemas/types (schemas/profile.ts)
```

---

## Architecture Rules & Principles

1. **Engine / Domain Boundary**: Code inside `apps/web/src/engine/` must never contain subject-matter terms (money, interest, salary, accounting, etc.). The engine only handles question flow, validation callbacks, XP, and streaks.
2. **Shared Zod Schemas**: DTOs live once in `packages/shared`; the API validates with them and the web types its forms from them. No duplication.
3. **Server-side Accounts, Client-side Progress**: Auth, accounts, and the learning profile live in PostgreSQL; XP, streak, mastery, and curriculum edits persist to `localStorage` via Zustand (PRD §8.3).
4. **Tailwind v4 Semantic Tokens**: Brand colors and component surfaces are defined using CSS variables in `apps/web/src/styles/globals.css` and mapped through `@theme inline`. Hardcoded Tailwind color utilities (e.g. `bg-blue-600`) are forbidden.
5. **Tooling**: Formatting is powered by **Oxfmt** and linting by **Oxlint** (do not add Prettier or ESLint configs). Package manager is **Bun**.

---

## Documentation

- [PRD.md](PRD.md) — Product requirements document (Indonesian)
- [CONCEPT.md](CONCEPT.md) — Conceptual model, learning philosophy, and core glossary
- [ARCHITECTURE.md](ARCHITECTURE.md) — Technical architecture: engine/domain split, request lifecycle, data flow
- [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md) — PostgreSQL data model (ERD, tables, enums)
- [DEVELOPMENT.md](DEVELOPMENT.md) — Commands, env keys, and local development
- [AGENTS.md](AGENTS.md) — Guidelines and conventions for AI assistants and contributors
- [docs/backend-refactor.md](docs/backend-refactor.md) — Backend refactor plan (target architecture)

---

## License

Private project. All rights reserved.
