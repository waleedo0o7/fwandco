# Phase Status

## Current phase

**Phase 6 — Deployment Preparation**

Status: complete locally; Phase 7 requires cPanel access for real-server validation.

## Approved versions

- Node.js 24.13.0 and pnpm 11.25.0.
- Payload packages 3.91.0.
- Next.js 16.4.3 and React 19.2.6.
- Astro 7.4.2 and Tailwind CSS 4.3.3.
- TypeScript 5.7.3.
- PostgreSQL 16.8 is the configured database target.

## Phase 5 and 6 implementation

- Full Payload/Next standalone and Astro production builds on Node.js 24.13.0.
- Production-mode API, CORS, contact persistence, media, restart, and static-route smoke tests.
- Reproducible cPanel release script with integrity hashes and no committed secrets.
- Portable physical CMS dependencies with Windows junctions removed and Linux x64 Sharp included.
- Static web archive, CMS runtime archive, deployment procedure, and local test report.

## Review gate

Completed locally on Node.js 24.13.0 and PostgreSQL 16.8:

- Full production build and extracted standalone runtime startup.
- Public pages, Admin, REST API, media, allowed/blocked CORS, and form persistence.
- Application restart without database or media loss.
- Portable archive checks for secrets, Windows links, Linux native binaries, and required files.
- ESLint, TypeScript, Prettier, Astro SSG build, and Payload/Next full production build.
- Production dependency audit with no known vulnerabilities.

Phase 7 is not complete until the release is deployed and tested on the real cPanel server.
