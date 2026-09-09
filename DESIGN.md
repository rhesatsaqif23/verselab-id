---
# Verselab design system — DESIGN.md
name: "Verselab Design System"
version: "1.0.0"
theme: light
author: "Verselab"
description: >-
  Gamified interactive-learning web app inspired by Brilliant.org / Duolingo.
  Users learn through short interactive screens (choice, numeric, allocation,
  concept), earning XP and streaks. Friendly, energetic, and Ivory/Light
  educational brand.

# Design tokens — source of truth: apps/web/src/styles/globals.css
tokens:
  color:
    foreground: "#1a1a1a"
    background: "#f4f9fd"
    border: "#e5e7eb"
    headerBg: "rgba(255,255,255,0.88)"
    primary: "#2c5ead"
    primaryLight: "#1591dc"
    primaryBright: "#4bb8fa"
    primarySoft: "#c4e2f5"
    primaryForeground: "#ffffff"
    secondary: "#dbe756"
    secondaryForeground: "#1a1a1a"
    accent: "#1591dc"
    accentForeground: "#ffffff"
    destructive: "#ef4444"
    destructiveForeground: "#ffffff"
    success: "#22c55e"
    successForeground: "#ffffff"
    muted: "#6b7280"
    mutedForeground: "#6b7280"
    card: "#ffffff"
    cardForeground: "#1a1a1a"
    popover: "#ffffff"
    popoverForeground: "#1a1a1a"
    input: "#e5e7eb"
    ring: "#2c5ead"
    fireLight: "#fff3e0"
    fire: "#f97316"
    fireDark: "#783d0d"
    featureHover: "#d4cfc4"
  color-dark:
    foreground: "#f5f5f5"
    background: "#1a1f2e"
    border: "#2a3040"
    headerBg: "rgba(26,31,46,0.88)"
    primary: "#4bb8fa"
    primaryLight: "#1591dc"
    primaryBright: "#4bb8fa"
    primarySoft: "#c4e2f5"
    primaryForeground: "#1a1a1a"
    secondary: "#dbe756"
    secondaryForeground: "#1a1a1a"
    accent: "#4bb8fa"
    accentForeground: "#1a1a1a"
    destructive: "#f87171"
    destructiveForeground: "#1a1a1a"
    success: "#4ade80"
    successForeground: "#1a1a1a"
    muted: "#9ca3af"
    mutedForeground: "#9ca3af"
    card: "#212736"
    cardForeground: "#f5f5f5"
    popover: "#212736"
    popoverForeground: "#f5f5f5"
    input: "#2a3040"
    ring: "#4bb8fa"
    fire: "#f97316"
    fireDark: "#783d0d"
    featureHover: "#403c36"
  illustration:
    ink: "#141b2d"
    paper: "#f6f7f9"
    sand: "#e8e2d6"
    surface: "#ffffff"
    trackPetrol: "#146b63"
    trackIndigo: "#3446c4"
    trackOchre: "#a9720e"
    trackMoss: "#4a6b2a"
    trackPlum: "#7c3a6e"
  illustration-dark:
    ink: "#edeff4"
    paper: "#141b2d"
    sand: "#3a3730"
    surface: "#1e2533"
    trackPetrol: "#2fa095"
    trackIndigo: "#7488f0"
    trackOchre: "#d9a23c"
    trackMoss: "#86ad5c"
    trackPlum: "#b573a5"
  radius:
    base: "0.75rem"
    sm: "calc(0.75rem - 4px)"
    md: "calc(0.75rem - 2px)"
    lg: "0.75rem"
    xl: "calc(0.75rem + 4px)"
  font:
    sans: '"CoFo Brilliant", "Manrope", ui-sans-serif, system-ui, sans-serif'
    body-weight: 500            # global default (font-medium)
  animation:
    durationMs: 300

# Verselab Design System

## Overview & brand style

Verselab is a **gamified, interactive learning** product (inspired by Brilliant
and Duolingo) about personal finance. It is **friendly, energetic, and
optimistic** — never corporate or dense. The visual voice pairs a confident
**blue** primary with a playful **chartreuse** secondary, soft card surfaces,
rounded pill buttons with tactile "push-down" shadows, and a gentle
light-on-light background with faint brand-colored radial glows.

Three words that anchor every decision:

1. **Friendly** — rounded corners, generous whitespace, warm encouragement copy.
2. **Energetic** — gradients, motion, gamified feedback (streaks, XP, confetti,
   shake/pulse on answers).
3. **Clear** — one idea per screen, a strong emphasis hierarchy, and obvious
   interactive affordances.

## Foundations

### Color

All UI colors are exposed as semantic CSS variables in
`src/styles/globals.css` and mapped into Tailwind v4 via `@theme inline` in the
same file. **Never hardcode hex values in components** — always use a variable
(e.g. `bg-card`, `text-primary`, `border-border`, `text-muted`). If a color is
missing, add both its light and dark values in `globals.css` first.

- **Primary (blue)** — `#2c5ead` (light) / `#4bb8fa` (dark). Actions, links,
  active states, brand. Always read as "the thing you can press."
- **Accent (sky)** — `#1591dc` / `#4bb8fa`. Secondary emphasis, gradient
  endpoint, illustration highlights, focus rings.
- **Secondary (chartreuse)** — `#dbe756`. Playful highlight / XP / flame accent.
- **Success (green)** — `#22c55e` / `#4ade80`. Correct answers, completed, streaks.
- **Destructive (red)** — `#ef4444` / `#f87171`. Errors, wrong answers, danger.
- **Fire / streak (orange)** — `#f97316` with `#fff3e0` light base. Streak
  flame, urgency.
- **Neutrals** — `background` `#f4f9fd` / `#1a1f2e`, `card` white /
  `#212736`, `foreground` near-black / near-white, `muted` gray. Cards sit on a
  slightly tinted background so they read as raised surfaces.
- **Track palette** (illustrations) — `petrol`, `indigo`, `ochre`, `moss`,
  `plum`. Use only inside bespoke illustrations/charts, not for interactive UI.

**Dark mode** is a first-class target, toggled via `.dark` on `<html>` and a
localStorage-driven init script. Reversed-color surfaces: cards become
`#212736` on a `#1a1f2e` background, and the primary flips to a lighter sky blue
for contrast on dark surfaces.

**Background treatment:** the page body uses a soft vertical fade
(`color-mix(black 2%, var(--background))`) plus two extremely faint radial
glows in primary/accent. Keep these subtle — they should never fight with
content.

### Typography

- **Family** — `"CoFo Brilliant"` primary, falling back to `Manrope`, loaded
  from Google Fonts (`Fraunces` + `Manrope`). Headings and body share the sans
  stack for a cohesive, modern look.
- **Weight** — global body default is `500` (font-medium). Headlines lean on
  `700`–`900` (`font-bold`, `font-black`) and often use `tracking-tight`.
- **Display titles** — a `.display-title` helper aligns the stack; used for
  large hero text.
- **Kickers / eyebrows** — the `.island-kicker` pattern: `uppercase`,
  `letter-spacing: 0.14em`, `font-weight: 700`, `font-size: 0.68rem`, tinted
  with `--primary`. Use for section labels above headings.
- **Type scale** follows Tailwind defaults (`text-xs` … `text-4xl`); prefer
  `text-base`/`text-lg` for body copy across feature sections.
- Links use `underline-offset-2` and a 1px underline thickness by default.

### Layout & spacing

- **Page width** — the `.page-wrap` container is `min(1120px, 100% - 2rem)`,
  centered with `margin-inline: auto`. Use it for top-level page content.
- **Header** — sticky top nav, `h-16`, `border-b`, `bg-card`, horizontal
  padding `px-4 md:px-16`. Active/hover nav links animate a 2px gradient
  underline (see nav component).
- **Footer** — `.site-footer`, `border-t-2`, offset with `mt-20`, generous
  `py-16`. Multi-column: a 6-col brand/intro block + repeated 3-col link groups
  on `md:grid-cols-12`.
- **Spacing** — Tailwind's default spacing scale (4px base). Favor
  `gap-*` over manual margins; use `px-4`/`md:px-16` for responsive gutters.
- **Vertical rhythm** — sections flow with `mt-16`/`mt-20`; cards group with
  even `gap-*`. Keep breathing room; never crowd.

### Elevation & surfaces

- Cards are **flat surfaces** distinguished from the background by color
  (`bg-card`, `border-border` 2px), not heavy shadows. The `.island-shell` and
  `.feature-card` utilities add a 2px border. Hover lifts the card by
  `translateY(-2px)` and shifts `border-color` to a warm hover tone.
- **Buttons are the exception** — they carry a chunky "3D press" shadow
  (`0 5px 0 0` drop shadow) and translate down on press. This tactile behavior
  is the single most distinctive interaction trait; preserve it everywhere.

## Components

### Buttons

Truly the hero of the system. See `components/ui/button.tsx`.

- **Shape** — always `rounded-full` pills. Never square corners.
- **Variants** — `default` (primary gradient `from(--btn-from) to(--btn-to)`),
  `secondary`, `outline` (`border-2`), `ghost`, `shadowless`, `destructive`
  (red gradient), `link`.
- **Sizes** — `xs`, `sm` (`h-8`), `default` (`h-11 px-6`), `lg` (`h-12 px-8`),
  plus `icon`, `icon-sm`, `icon-lg`, `icon-xs`.
- **3D shadow** — each tinted variant carries a darker "base" shadow
  (`--btn-shadow`, `--btn-destructive-shadow`, `--btn-outline-shadow`) making
  the press feel physical. On `active` translate down `2–3px` and shrink the
  shadow.
- **Shimmer** — `default`/`destructive`/`secondary` buttons animate a soft
  diagonal light sweep (`btn-shimmer`) for a premium energy. Disabled buttons
  drop opacity to 50%.
- Focus rings use `ring-[3px] ring-ring/50` and a `border-ring` on focus-visible.

### Cards

`components/ui/card.tsx` — shadcn `Card` primitives. Use `CardHeader`,
`CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`.
Cards are the primary grouping for lessons, units, stats, and dashboard tiles.

### Navigation

- **Top nav** (`.nav-link`) — gray text that turns `foreground` on hover/active,
  with an animated gradient underline that scales in from the left.
- **Nav items** use icons + labels with a subtle framer-motion active indicator
  under the Leaderboard/Home-style items.

### Lesson screens (engine)

Four interactive screen renderers under `src/domains/personal-finance/screens/`:

- **Choice** — multiple-choice cards; a blue border appears on selection;
  correct/wrong tint the border `success`/`destructive`.
- **Numeric** — a number input; correctness checked by range. Answers use a
  backspace-friendly input normalized to match button heights.
- **Allocation** — sliders summing to 100% against a rule (e.g. savings ≥ 20%).
- **Concept** — reveals a concept name after the learner has felt its effect.

All screens call back to the engine with `onAnswer(true/false)`; the engine
never knows the subject. Correct/wrong feedback uses
`--lesson-border-idle/correct/wrong`.

### Gamification elements

- **Streak / Flame** — uses the orange fire palette (`fire`, `fire-light`,
  `fire-dark`) and a `Flame` icon. Positive micro-interactions reinforce return.
- **XP** — shown as badges in the header; numeric progress.
- **Progress bar** — animated fill (`animate-progress-fill`, origin-left).
- **Feedback animations** — `shake` for wrong answers, `pulse-glow`
  (green ring) for correct, `bounce-in` for celebration. All defined in
  `globals.css` and guaranteed to respect `prefers-reduced-motion`.

## Motion

Motion is playful but fast and never blocks comprehension.

| Token | Timing | Use |
|---|---|---|
| `slide-up-enter` | 0.3s ease-out | content entering (cards, panels) |
| `slide-up-exit` | 0.2s ease-in | content leaving |
| `slide-in-right` | 0.35s ease-out | stepping forward in a flow |
| `slide-out-left` | 0.25s ease-in | stepping back |
| `progress-fill` | 0.4s ease-out | progress/streak bars |
| `shake` | 0.4s ease-in-out | wrong answer |
| `pulse-glow` | 0.6s ease-out | correct answer emphasis |
| `bounce-in` | 0.3s ease-out | celebration / reward |
| `fade-in` | 0.3s ease-out | general reveal |

Transitions on interactive elements default to `180ms` for background, color,
border, and transform. Micro-interactions should stay under ~350ms.

**Reduce motion** — a global `prefers-reduced-motion` block collapses all
animation durations to ~0.01ms. Never disable this.

## Dos and Don'ts

**Do**
- Use semantic tokens (`bg-card`, `text-primary`, `border-border`); never inline
  a hex in a component.
- Keep buttons pill-shaped with their tactile 3D press shadow — it defines the
  brand.
- Use `page-wrap` for page-level width and `gap-*` for alignment.
- Add both a light and dark value when introducing any new color token.
- Use `.island-kicker` for section eyebrows and uppercase tracking-tight for
  footer/panel headings.
- Provide visible focus rings (`ring-ring/50`) on every interactive element.
- Respect `prefers-reduced-motion`.

**Don't**
- Don't hardcode colors or use literal Tailwind color utilities like
  `bg-orange-500`, `text-blue-800`, `border-gray-600` — add a variable instead.
- Don't use square corners for buttons, and don't remove the press-down shadow.
- Don't make dark mode an afterthought — every page must work in both modes.
- Don't put interactive controls in the illustration track palette
  (petrol/indigo/ochre/moss/plum); those colors are for artwork only.
- Don't crowd cards — keep generous spacing and one primary action per surface.

## Source of truth

- **Tokens:** `apps/web/src/styles/globals.css` (CSS variables) and
  `@theme inline` mappings.
- **Base/app styles:** `apps/web/src/styles.css`.
- **UI primitives:** `apps/web/src/components/ui/*` (shadcn/ui, new-york style,
  lucide icons).
- **Theme init/apply:** `apps/web/src/libs/theme.ts`.

When updating the design system, keep this file in sync with `globals.css` so
both humans and AI agents read the same single source of truth.
