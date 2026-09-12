---
title: Development commands
description: Workspace-owned commands for local development.
---

# Development

Local development runs the **web** (port 3000), the **API** (port 3001), and a **Dockerized PostgreSQL** (port 5432).

```sh
docker start verselab-postgres   # start local Postgres (postgres:16)
bun install                      # install workspace dependencies
bun run dev:api                  # API on http://localhost:3001
bun run dev                      # web on http://localhost:3000
```

## Environment files

Environment files live where they are consumed.

| Owner      | Purpose                | Setup                                    |
| ---------- | ---------------------- | ---------------------------------------- |
| `apps/api` | API runtime + Drizzle  | `cp apps/api/.env.example apps/api/.env` |
| `apps/web` | Vite public client env | `cp apps/web/.env.example apps/web/.env` |

`apps/api/.env` is required — `apps/api/src/config/env.ts` parses it with Zod at import time and the app fails fast if keys are missing or malformed. `apps/web/.env` only supplies the API origin; missing keys surface as `undefined` at runtime, so keep the example file in sync.

### API env

`apps/api/.env` owns auth + database runtime config:

| Key                  | Purpose                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | Better Auth secret. Min 32 chars; use a long random value outside local dev.                 |
| `BETTER_AUTH_URL`    | Public API origin, e.g. `http://localhost:3001`.                                             |
| `WEB_ORIGIN`         | Public web origin allowed by CORS, e.g. `http://localhost:3000`.                             |
| `DATABASE_URL`       | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/verselab`. |
| `PORT`               | API port (default `3001`).                                                                   |
| `NODE_ENV`           | `development` / `production` / `test` (default `development`).                               |

### Web env

`apps/web/.env` supplies Vite public client env:

| Key               | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| `VITE_API_ORIGIN` | API origin the browser fetches, `http://localhost:3001`. |

## PostgreSQL

Local PostgreSQL runs in Docker (`verselab-postgres`, postgres:16, port 5432, database `verselab`).

```sh
docker start verselab-postgres
docker exec -it verselab-postgres psql -U postgres -d verselab
```

### Drizzle

| Purpose             | Command                              |
| ------------------- | ------------------------------------ |
| Generate migration  | `bun run --cwd apps/api db:generate` |
| Apply migrations    | `bun run --cwd apps/api db:migrate`  |
| Push schema (dev)   | `bun run --cwd apps/api db:push`     |
| Open Drizzle Studio | `bun run --cwd apps/api db:studio`   |

Set `DATABASE_URL` in `apps/api/.env` first. Drizzle reads `apps/api/drizzle.config.ts` for schema glob, migration folder, and credentials.

## Commands

Root commands:

```sh
bun run dev              # web dev server on port 3000
bun run dev:api          # API dev server on port 3001 (bun --hot)
bun run build            # production web build (vite build)
bun run check-types      # tsc across api, web, shared
bun run lint             # Oxlint
bun run lint:fix         # Oxlint with auto-fix
bun run fmt              # Oxfmt — format all files
bun run fmt:check        # Oxfmt — check without writing
bun run test             # api (bun test) + web (vitest)
```

API (`apps/api`):

```sh
bun run --cwd apps/api dev                # bun --hot, port 3001
bun run --cwd apps/api start              # run without hot reload
bun run --cwd apps/api check-types
bun run --cwd apps/api test               # bun test tests/
bun run --cwd apps/api db:generate
bun run --cwd apps/api db:migrate
bun run --cwd apps/api db:push
bun run --cwd apps/api db:studio
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

## Storybook

Storybook lives in `apps/web` only.

| Workspace  | Purpose             | Command                                  |
| ---------- | ------------------- | ---------------------------------------- |
| `apps/web` | Web Storybook       | `bun run --cwd apps/web storybook`       |
| `apps/web` | Build web Storybook | `bun run --cwd apps/web build-storybook` |

- Uses `@storybook/tanstack-react`.
- Port `6006`.

## Before handoff

```sh
bun run fmt && bun run check-types && bun run lint && bun run test
```
