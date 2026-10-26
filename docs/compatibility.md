# Compatibility Baseline

## Fixed server environment

- Linux x86-64, Apache, and cPanel 134.
- Node.js 24.13.0 through Node.js App Manager.
- PostgreSQL 16.8.
- 1 GB account memory limit.
- Builds run locally on Windows; cPanel receives prepared production artifacts.

## Selected dependency line

Payload 3.92.0 does not support the fixed Node.js runtime. Payload 3.91.0 is the most recent stable
Payload line whose declared engine supports Node.js 24.13.0. All Payload packages remain aligned at
3.91.0.

The CMS foundation starts from the official Payload 3.91.0 blank-template dependency line. Security
patches take precedence over copying the template verbatim: Next.js is pinned to 16.4.3 and Sharp to
0.35.5 because the older template versions have published vulnerabilities. Both patched versions
support Node.js 24.13.0 and satisfy Payload's peer ranges.

Narrow pnpm overrides patch vulnerable transitive copies of DOMPurify, Undici, Happy DOM, and the
legacy esbuild copy pulled through Drizzle Kit. The resolved production graph currently reports no
known vulnerabilities and no peer-dependency errors.

## Pending real-server proof

- Passenger startup behavior for the Next.js standalone artifact.
- Linux x64 native dependency loading, especially Sharp.
- PostgreSQL connectivity, permissions, transactions, and migrations.
- Runtime memory consumption under the 1 GB limit.
- Persistent writable media storage across restart and redeploy.
- Apache request-size, timeout, CORS, SSL, and proxy behavior.
