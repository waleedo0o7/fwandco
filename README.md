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

| Command             | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `pnpm install`      | Install the exact locked dependency graph.                               |
| `pnpm dev`          | Run both applications in development mode.                               |
| `pnpm lint`         | Lint both applications.                                                  |
| `pnpm typecheck`    | Type-check both applications.                                            |
| `pnpm format:check` | Check formatting.                                                        |
| `pnpm build:web`    | Generate the static Astro artifact.                                      |
| `pnpm build:cms`    | Compile the Payload/Next application without database-backed generation. |
| `pnpm validate`     | Run the Phase 2 local quality gate.                                      |

Copy each application's `.env.example` to `.env` only when that application needs to run. Never
commit credentials.
