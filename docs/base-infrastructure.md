# Base Infrastructure Boundary

## Preserved

- Monorepo, exact dependency pins, Node.js 24.13.0 compatibility, and local PostgreSQL tooling.
- Astro static output, shared layout, responsive styling, SEO metadata, and CMS build integration.
- Payload/Next admin, authentication, roles, media with Sharp, Lexical rich text, pages, contact submissions, REST API, and environment validation.
- Clean database baseline, standalone CMS output, and cPanel release packaging.

## Removed

- Operational dashboard UI and runtime people/task data fetches.
- People, groups, phone numbers, addresses, tasks, and task assignments.
- Fictional seed script, seed credentials, seed assets, and generated test media.
- POC naming and test-specific documentation.

## Migration policy

The active migration index contains only the clean reusable baseline. The original POC migration remains in `docs/legacy-migrations/poc` for traceability and must not be executed by new projects.

The clean baseline is for a new empty PostgreSQL database only. No migration was run against the local POC database or the deployed database during this cleanup.
