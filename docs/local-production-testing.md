# Local Production Test Results

Tested on Node.js 24.13.0 and local PostgreSQL 16.8 using the full Next.js standalone output and
Astro production preview.

## Passed

- ESLint, strict TypeScript, Prettier, full Payload/Next build, Astro SSG build, and production
  dependency audit.
- Static Home, About, and Contact routes returned HTTP 200.
- Payload Admin, public People REST API, and seeded media returned HTTP 200.
- Contact submission returned HTTP 201 and persisted in PostgreSQL.
- A disallowed Origin returned HTTP 403.
- CMS restart preserved API data, media, and the submitted contact record.
- Extracted portable CMS package started with no Windows reparse points.
- Local standalone working set was approximately 130 MB after smoke requests; the real cPanel
  memory result remains unverified.

## Packaging issue found and fixed

Next standalone tracing omitted two Windows Sharp DLLs and produced Windows-only junctions. The
release script now restores the DLLs for local validation, converts runtime dependencies into
physical portable files, verifies Linux x64 Sharp and libvips binaries, and excludes the real
`.env` file.

Node.js 24.13.0 also has an upstream Windows/libuv shutdown race that can abort immediately after
Astro reports a successful build. The repository build wrapper waits briefly after Astro finishes;
it does not change generated output and is unnecessary on the production Linux server.
