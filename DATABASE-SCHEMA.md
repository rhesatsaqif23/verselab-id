---
title: Database Schema
description: Verselab PostgreSQL data model — cattle tables, Better Auth tables, and the learning profile.
---

# Database Schema

Drizzle migrations are the source of truth; this page is fallback documentation rendered from the schema in `apps/api/src/database/`.

Schema files:

```txt
apps/api/src/database/auth-schema.ts   # Better Auth tables: user, session, account, verification
apps/api/src/database/schema.ts        # domain tables: user_profiles (+ daily_goal enum)
```

## ERD

```mermaid
erDiagram
  USER {
    text id PK
    text name
    text email UK
    boolean email_verified
    text image
    timestamp created_at
    timestamp updated_at
  }

  SESSION {
    text id PK
    text token UK
    timestamp expires_at
    text ip_address
    text user_agent
    text user_id FK
    timestamp created_at
    timestamp updated_at
  }

  ACCOUNT {
    text id PK
    text account_id
    text provider_id
    text user_id FK
    text access_token
    text refresh_token
    text id_token
    timestamp access_token_expires_at
    timestamp refresh_token_expires_at
    text scope
    text password
    timestamp created_at
    timestamp updated_at
  }

  VERIFICATION {
    text id PK
    text identifier
    text value
    timestamp expires_at
    timestamp created_at
    timestamp updated_at
  }

  USER_PROFILES {
    text user_id PK FK
    text display_name
    text start_unit_id
    daily_goal daily_goal
    timestamp onboarded_at
    timestamp updated_at
  }

  USER ||--o{ SESSION : owns
  USER ||--o{ ACCOUNT : owns
  USER ||--o{ VERIFICATION : owns
  USER ||--o| USER_PROFILES : has
```

## Table explain

| Table           | Purpose                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `user`          | Account identity. Better Auth user: name, email, verification flag.                                   |
| `session`       | Better Auth session: token, expiry, device ip/user-agent. Cascade-deletes with the user.              |
| `account`       | Better Auth account/credential rows. Holds the password hash for email+password sign-in.              |
| `verification`  | Better Auth verification rows (email verification / password reset tokens when enabled).              |
| `user_profiles` | Verselab learning profile, one row per user: display name, starting unit, daily goal, onboarded flag. |

## Relationship notes

- `user` is the account root. Every other table references `user.id`.
- `session` and `account` cascade-delete when the owning user is removed.
- `user_profiles.user_id` is the primary key (one profile per user) and references `user.id` without cascade — delete a user first, then the profile.
- `daily_goal` is a Postgres enum (`casual`, `regular`, `serious`). The API client-facing values are validated by `dailyGoalSchema` in `packages/shared`.
- `start_unit_id` is stored as free text in the DB but validated against `unitIdSchema` (`keuangan` | `akuntansi` | `manajemen-produk` | `kewirausahaan`) at the API boundary via `onboardingSchema`.

## Table details

### `user`

| Column           | Explain                                          |
| ---------------- | ------------------------------------------------ |
| `id`             | Primary key (Better Auth generated id).          |
| `name`           | Display name.                                    |
| `email`          | Unique login email.                              |
| `email_verified` | Whether the email was verified (disabled in v1). |
| `image`          | Optional avatar URL.                             |
| `created_at`     | Creation timestamp.                              |
| `updated_at`     | Last account update timestamp.                   |

### `session`

| Column       | Explain                        |
| ------------ | ------------------------------ |
| `id`         | Primary key.                   |
| `expires_at` | Session expiry.                |
| `token`      | Unique session token.          |
| `created_at` | Session creation timestamp.    |
| `updated_at` | Last session update timestamp. |
| `ip_address` | Client IP snapshot.            |
| `user_agent` | Client user-agent snapshot.    |
| `user_id`    | Owner user (cascade delete).   |

Index: `session_userId_idx` on `user_id`.

### `account`

| Column                     | Explain                                    |
| -------------------------- | ------------------------------------------ |
| `id`                       | Primary key.                               |
| `account_id`               | Provider account id.                       |
| `provider_id`              | Provider id (`credential` for local auth). |
| `user_id`                  | Owner user (cascade delete).               |
| `access_token`             | Provider access token (unused locally).    |
| `refresh_token`            | Provider refresh token (unused locally).   |
| `id_token`                 | Provider id token (unused locally).        |
| `access_token_expires_at`  | Access token expiry.                       |
| `refresh_token_expires_at` | Refresh token expiry.                      |
| `scope`                    | OAuth scopes granted.                      |
| `password`                 | BCrypt password hash for email+password.   |
| `created_at`               | Creation timestamp.                        |
| `updated_at`               | Last account update timestamp.             |

Index: `account_userId_idx` on `user_id`.

### `verification`

| Column       | Explain                                   |
| ------------ | ----------------------------------------- |
| `id`         | Primary key.                              |
| `identifier` | Verification target (e.g. email address). |
| `value`      | Verification payload.                     |
| `expires_at` | Token expiry.                             |
| `created_at` | Creation timestamp.                       |
| `updated_at` | Last update timestamp.                    |

Index: `verification_identifier_idx` on `identifier`.

### `user_profiles`

| Column          | Explain                                               |
| --------------- | ----------------------------------------------------- |
| `user_id`       | Primary key, references `user.id` (one profile/user). |
| `display_name`  | Chosen nickname shown in UI.                          |
| `start_unit_id` | Starting unit slug, validated by `unitIdSchema`.      |
| `daily_goal`    | `daily_goal` enum, default `regular`.                 |
| `onboarded_at`  | Set when onboarding completes; null until then.       |
| `updated_at`    | Last profile update timestamp (default now).          |

DB enum `daily_goal`: `casual`, `regular`, `serious`. Mapped to daily minutes (`5` / `10` / `20`) by `dailyGoalToMinutes` in `packages/shared`.

## DBML fallback

```text
// Enums

Enum daily_goal {
  casual
  regular
  serious
}

// Better Auth — account identity

Table user {
  id             text        [pk]
  name           text        [not null]
  email          text        [not null, unique]
  email_verified boolean     [not null, default: false]
  image          text
  created_at     timestamp   [not null, default: `now()`]
  updated_at     timestamp   [not null, default: `now()`]
}

Table session {
  id          text        [pk]
  expires_at  timestamp   [not null]
  token       text        [not null, unique]
  created_at  timestamp   [not null, default: `now()`]
  updated_at  timestamp   [not null]
  ip_address  text
  user_agent  text
  user_id     text        [not null, ref: > user.id, delete: cascade]

  Indexes {
    user_id
  }
}

Table account {
  id                      text        [pk]
  account_id              text        [not null]
  provider_id             text        [not null]
  user_id                 text        [not null, ref: > user.id, delete: cascade]
  access_token            text
  refresh_token           text
  id_token                text
  access_token_expires_at timestamp
  refresh_token_expires_at timestamp
  scope                   text
  password                text
  created_at              timestamp   [not null, default: `now()`]
  updated_at              timestamp   [not null]

  Indexes {
    user_id
  }
}

Table verification {
  id          text        [pk]
  identifier  text        [not null]
  value       text        [not null]
  expires_at  timestamp   [not null]
  created_at  timestamp   [not null, default: `now()`]
  updated_at  timestamp   [not null, default: `now()`]

  Indexes {
    identifier
  }
}

// Verselab — learning profile

Table user_profiles {
  user_id       text        [pk, ref: > user.id]
  display_name  text
  start_unit_id text
  daily_goal    daily_goal  [default: 'regular']
  onboarded_at  timestamp
  updated_at    timestamp   [not null, default: `now()`]
}
```

## Migrations

Migrations are generated with Drizzle Kit and live in `apps/api/drizzle/`:

```sh
bun run --cwd apps/api db:generate   # new migration from schema changes
bun run --cwd apps/api db:migrate    # apply pending migrations
```

Set `DATABASE_URL` in `apps/api/.env` first.
