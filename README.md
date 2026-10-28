# Reusable Production Base

A production-ready monorepo foundation for static Astro websites backed by Payload CMS and PostgreSQL on the validated cPanel environment.

## Applications

- `apps/web` — Astro static frontend.
- `apps/cms` — Payload CMS, Next.js admin, REST API, authentication, media, pages, and contact submissions.

## Fixed runtime

- Node.js 24.13.0
- pnpm 11.25.0
- PostgreSQL 16.8
- Payload 3.91.0

## Commands

| Command                        | Purpose                                         |
| ------------------------------ | ----------------------------------------------- |
| `corepack pnpm db:start`       | Start the isolated local PostgreSQL cluster.    |
| `corepack pnpm db:status`      | Check local PostgreSQL.                         |
| `corepack pnpm db:stop`        | Stop local PostgreSQL.                          |
| `corepack pnpm install`        | Install the exact locked dependency graph.      |
| `corepack pnpm dev`            | Run the frontend and CMS in development.        |
| `corepack pnpm lint`           | Lint all applications.                          |
| `corepack pnpm typecheck`      | Type-check all applications.                    |
| `corepack pnpm build:web`      | Generate the Astro static output.               |
| `corepack pnpm build:cms:full` | Build the Payload/Next standalone runtime.      |
| `corepack pnpm release:cpanel` | Validate and create cPanel deployment archives. |

Copy each `.env.example` to `.env` only when required. Never commit credentials.

See `docs/base-infrastructure.md`, `docs/backend-database.md`, and `docs/cpanel-deployment.md` before extending or deploying the base.
