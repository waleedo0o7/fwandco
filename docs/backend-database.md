# Backend and Database

## Data model

- `users` stores Payload authentication accounts with `admin` and `editor` roles.
- `groups` and `people` model public fictional staff records.
- `phone-numbers` and `addresses` are one-to-many children of people.
- `tasks` and `task-assignments` implement the people-to-tasks many-to-many relationship.
- `contact-submissions` stores validated form submissions and is readable only by admins.
- `media` stores image metadata and upload records.
- `pages` stores the About and Contact content, SEO fields, drafts, and published versions.

Public people records are deliberately separate from authenticated CMS users.

## Access policy

- Anonymous requests can read public records and published pages only.
- Editors can create and update ordinary content but cannot manage roles or contact submissions.
- Admins can manage users, delete content, and review contact submissions.
- Standard REST creation for contact submissions is disabled. `POST /api/contact` is the only public
  write path and applies schema validation, an origin check, a honeypot, a minimum completion time,
  and a bounded in-memory rate limit.

The in-memory rate limit is suitable for this single-process POC. It resets when the Node process
restarts and is not a replacement for infrastructure-level rate limiting.

## Database workflow

From the repository root, with `apps/cms/.env` configured for a dedicated non-production database:

```powershell
pnpm --filter @poc/cms migrate:status
pnpm --filter @poc/cms migrate
pnpm --filter @poc/cms seed
```

The seed is repeatable. It updates or reuses records selected by stable unique fields instead of
creating duplicates. Its administrator email and password come from `SEED_ADMIN_EMAIL` and
`SEED_ADMIN_PASSWORD`.

Schema changes must be represented by a new Payload migration and reviewed before execution. Runtime
schema push is disabled. Never point migration or seed commands at an existing production database.

## Current verification boundary

The initial migration was generated from the Payload schema, and types, lint, and the production
compile pass on Node.js 24.13.0. No PostgreSQL service is installed or listening on this development
machine, so applying the migration, running the seed, CRUD verification, login, and persistence tests
remain unverified. These results must not be reported as passed until a dedicated PostgreSQL database
is provided.
