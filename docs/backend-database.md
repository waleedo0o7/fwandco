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

PostgreSQL 16.8 portable binaries are installed locally at
`D:\2027\.local\postgresql-16.8\pgsql`. The dedicated project cluster is stored in the ignored
`.local/postgres-data` directory and listens only on `127.0.0.1:55432`.

From the repository root:

```powershell
corepack pnpm db:start
corepack pnpm db:status
corepack pnpm db:stop
```

With `apps/cms/.env` configured for the dedicated non-production database:

```powershell
corepack pnpm --filter @poc/cms migrate:status
corepack pnpm --filter @poc/cms migrate
corepack pnpm --filter @poc/cms seed
```

The seed is repeatable. It updates or reuses records selected by stable unique fields instead of
creating duplicates. Test account credentials come from the `SEED_ADMIN_*` and `SEED_EDITOR_*`
environment variables.

Schema changes must be represented by a new Payload migration and reviewed before execution. Runtime
schema push is disabled. Never point migration or seed commands at an existing production database.

## Local verification results

Verified locally with Node.js 24.13.0 and PostgreSQL 16.8:

- Initial migration applied successfully.
- Migration `up`, `down`, then `up` succeeded on an isolated temporary database.
- Repeatable seed executed twice without duplicating domain records.
- Admin and editor authentication and role restrictions passed.
- Draft editing preserved the published page, and publishing restored the updated public document.
- Person/group/phone/address/task-assignment relationships returned correctly through REST.
- Public reads, private contact-submission reads, and content write restrictions passed.
- Contact submission validation, CORS rejection, restricted standard REST writes, and persistence
  passed.
- Image upload, public retrieval, administrative deletion, and file cleanup passed.
- Database restart retained seeded content, the contact submission, and migration history.
- Payload type generation, ESLint, TypeScript, Prettier, security audit, and production compile passed.

Real cPanel behavior remains unverified until the explicitly approved server-validation phase.
