# Verselab

> **Interactive skill learning, gamified like Duolingo, visual like Brilliant.org.**  
> Learn essential concepts through short interactive screens — concept, multiple choice, numeric calculation, and dynamic allocation — while earning XP and maintaining daily streaks.

Verselab ([verselab.id](https://verselab.id)) is an interactive learning web application designed around micro-learning and gamification. Everything runs **100% in the browser with zero backend, no login, and zero database setup** — all user progress is saved locally via `localStorage`.

While it launches with business and financial literacy materials (**Keuangan**, **Akuntansi**, **Manajemen Produk**, and **Kewirausahaan**), the core engine is completely domain-agnostic and built to support any future subject matter without architectural changes.

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

### 4. Curriculum Studio / Admin Mode (`/admin`)
- Complete in-browser curriculum editor to manage units, lessons, and interactive screens.
- Reorder screens with drag-and-drop or sequential buttons.
- Real-time preview panel to test newly authored screens before publishing.

### 5. Design & User Experience
- **Tailwind CSS v4**: Theme tokens defined via `@theme inline` in CSS (zero hardcoded hex colors).
- **Zero-FOUC Dark Mode**: Light, Dark, and Auto/System mode detection with pre-hydration theme script.
- **Sticky Glassmorphic Header**: Elevated navigation with live streak and XP counter badges.
- **High-Contrast Multi-Column Footer**: Streamlined navigation with direct deep-links to units and application routes.

---

## Curriculum Tracks

| Unit | Focus & Learning Outcomes | Lessons |
| ---- | ------------------------- | ------- |
| **Keuangan** | Personal finance, compound interest, time value of money, budgeting, and loans | 4 Lessons |
| **Akuntansi** | Balance sheet equation, double-entry bookkeeping, profit & loss, and cash flow | 4 Lessons |
| **Manajemen Produk** | Problem discovery, feature prioritization, product metrics, and MVP validation | 4 Lessons |
| **Kewirausahaan** | Unit economics, break-even analysis, value-based pricing, and idea validation | 4 Lessons |

---

## Tech Stack

| Layer | Technology | Details |
| ----- | ---------- | ------- |
| **Framework** | [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev/) | Full-stack React framework powered by Vite |
| **Routing** | [TanStack Router](https://tanstack.com/router) | 100% type-safe, file-based routing |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Pure CSS `@theme` configuration with semantic CSS variables |
| **State** | [Zustand](https://zustand.docs.pmnd.rs/) | Client state with `persist` middleware to `localStorage` |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) | New-York style primitives with Lucide icons |
| **Linting & Formatting** | [Oxlint](https://oxc.rs/) & [Oxfmt](https://oxc.rs/) | High-performance Rust-based linter and formatter |
| **Testing** | [Vitest](https://vitest.dev/) + Testing Library | Unit tests mirroring application structure |
| **Design System** | [Storybook](https://storybook.js.org/) | Isolated component workbench |

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm (do not use yarn/pnpm/bun to maintain lockfile consistency)

### Installation

```sh
# Clone repository
git clone https://github.com/rhesatsaqif23/verselab-id.git
cd verselab-id

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).  
No database, backend server, or `.env` configuration is required.

---

## Available Scripts

```sh
# Development & Build
npm run dev              # Start Vite dev server on port 3000
npm run build            # Create production bundle
npm run preview          # Locally preview production build
npm run generate-routes  # Regenerate TanStack Router route tree (tsr generate)

# Quality & Verification
npm run lint             # Run Oxlint (React + TypeScript rules)
npm run lint:fix         # Run Oxlint with automated fixes
npm run fmt              # Format all files using Oxfmt
npm run fmt:check        # Check formatting without writing (CI)
npx tsc --noEmit         # Full TypeScript typecheck
npx vitest run           # Run unit tests with Vitest

# Storybook
npm run storybook        # Start Storybook on port 6006
npm run build-storybook  # Build static Storybook site
```

---

## Project Structure

The project follows a strict architectural boundary separating the **generic learning engine** from the **domain-specific materials**:

```
src/
├── engine/                      # Domain-agnostic learning engine (never references finance/business)
│   ├── player/                  # Lesson UI: LessonPlayer, LessonHeader, LessonControls, ProgressBar
│   ├── progress/                # XP, streaks, decay rules, mastery scores, daily goals (Zustand)
│   ├── path/                    # Unit unlocking logic and next-lesson resolution
│   └── types.ts                 # Screen union type, Lesson, Unit definitions
├── domains/                     # Domain-specific logic & custom visualizers
│   └── personal-finance/        # Mathematical calculations (FV, installments) & custom screen renderers
├── features/                    # Feature modules delegating from routes
│   ├── landing/                 # Marketing hero, feature showcases, sticky header
│   ├── home/                    # Dashboard: Course cards, streak widget, daily goal cards
│   ├── unit-detail/             # Whiteboard canvas, pan/zoom hooks, lesson cards, connecting arrows
│   ├── lesson/                  # Lesson runtime screen dispatcher and answer validation
│   ├── lesson-complete/         # XP animation, streak celebration, next step navigation
│   ├── profile/                 # User progress dashboard and historical mastery metrics
│   ├── about/                   # Curriculum catalog and unit index
│   ├── admin/                   # In-browser curriculum studio and screen editor
│   └── layout/                  # Global chrome: Header, Footer, ThemeToggle
├── content/                     # Seeded curriculum data: units.ts, lessons/, contentStore.ts
├── components/ui/               # shadcn/ui primitives (button, card, dialog, input, etc.)
├── libs/                        # Subject-agnostic utilities: cn(), date helpers, theme scripts
├── routes/                      # Thin TanStack Router file routes delegating to features
└── styles/                      # globals.css (semantic theme variables) & styles.css
tests/                           # Unit tests mirroring the src/ directory
```

---

## Architecture Rules & Principles

1. **Engine / Domain Boundary**: Code inside `src/engine/` must never contain subject-matter terms (money, interest, salary, accounting, etc.). The engine only handles question flow, validation callbacks, XP, and streaks.
2. **Local-First & Client-Side**: There is no backend or database. All user progress, streaks, and curriculum modifications are persisted via browser storage.
3. **Tailwind v4 Semantic Tokens**: Brand colors and component surfaces are defined using CSS variables in `src/styles/globals.css` and mapped through `@theme inline`. Hardcoded Tailwind color utilities (e.g. `bg-blue-600`) are forbidden.
4. **Tooling**: Formatting is powered by **Oxfmt** and linting by **Oxlint** (do not add Prettier or ESLint configs).

---

## Documentation

- [PRD.md](PRD.md) — Product requirements document (Indonesian)
- [CONCEPT.md](CONCEPT.md) — Conceptual model, learning philosophy, and core glossary
- [ARCHITECTURE.md](ARCHITECTURE.md) — Technical architecture: state machine, screen lifecycle, data flow
- [AGENTS.md](AGENTS.md) — Guidelines and conventions for AI assistants and contributors
- [docs/CONVENTIONAL_COMMITS.md](docs/CONVENTIONAL_COMMITS.md) — Conventional commit standards

---

## License

Private project. All rights reserved.
