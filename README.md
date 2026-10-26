# cPanel Full-Stack Compatibility POC

A small monorepo used to prove Astro, Payload CMS, Next.js, and PostgreSQL deployment on the target
cPanel shared-hosting environment.

## Applications

- `apps/web` — Astro static frontend.
- `apps/cms` — Payload CMS, Next.js admin, and REST API.

## Required runtime

- Node.js 24.13.0
- pnpm 11.25.0
- PostgreSQL 16.8 for database phases

## Commands

| Command                      | Purpose                                                                  |
| ---------------------------- | ------------------------------------------------------------------------ |
| `corepack pnpm db:start`     | Start the dedicated local PostgreSQL 16.8 cluster.                       |
| `corepack pnpm db:status`    | Check whether the local PostgreSQL cluster is accepting connections.     |
| `corepack pnpm db:stop`      | Stop the dedicated local PostgreSQL cluster cleanly.                     |
| `corepack pnpm install`      | Install the exact locked dependency graph.                               |
| `corepack pnpm dev`          | Run both applications in development mode.                               |
| `corepack pnpm lint`         | Lint both applications.                                                  |
| `corepack pnpm typecheck`    | Type-check both applications.                                            |
| `corepack pnpm format:check` | Check formatting.                                                        |
| `corepack pnpm build:web`    | Generate the static Astro artifact.                                      |
| `corepack pnpm build:cms`    | Compile the Payload/Next application without database-backed generation. |
| `corepack pnpm validate`     | Run the local quality gate.                                              |

Copy each application's `.env.example` to `.env` only when that application needs to run. Never
commit credentials.

Backend schema, access rules, migration, seed, and the current database verification boundary are
documented in [`docs/backend-database.md`](docs/backend-database.md).
