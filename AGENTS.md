# Engineering Instructions

## Runtime constraints

- Production is fixed to Node.js 24.13.0 on cPanel 134.
- Payload and every `@payloadcms/*` package must remain exactly 3.91.0.
- Critical dependency versions are exact; do not introduce `^` or `~` ranges.
- PostgreSQL 16.8 is the production database target.

## Architecture

- `apps/web` is the Astro static public website.
- `apps/cms` is the Payload CMS, Next.js admin, and REST API.
- The browser never connects directly to PostgreSQL.
- Public people records and CMS authentication users are separate concepts.
- Do not add a second backend, ORM, CMS, paid service, Docker requirement, or server-side build.

## Delivery rules

- Read `docs/phase-status.md` before changing the project.
- Work on one approved phase at a time and stop at its review gate.
- Never deploy or modify an existing database without explicit approval.
- Distinguish local verification from real cPanel verification.
- Preserve strict TypeScript, linting, formatting, environment validation, and secure defaults.
