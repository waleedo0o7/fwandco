# Backend and Database

## Reusable data model

- `users` provides Payload authentication with `admin` and `editor` roles.
- `media` provides public image delivery and authenticated image management.
- `pages` provides reusable rich-text content, SEO metadata, drafts, and publishing.
- `contact-submissions` stores validated enquiries and is readable only by admins.

The custom `POST /api/contact` route validates requests, checks origin, uses a honeypot and minimum completion time, and applies bounded in-memory rate limiting. Infrastructure-level rate limiting is still recommended for a final production product.

## Database workflow

PostgreSQL 16.8 is the fixed target. Runtime schema push is disabled; reviewed migrations are required.

```powershell
corepack pnpm db:start
corepack pnpm --filter @base/cms migrate:status
corepack pnpm --filter @base/cms migrate
```

`20261028_005912` is the clean baseline for a new database. The original POC migration is retained under `docs/legacy-migrations/poc` for audit history and is not imported by the runtime migration index.

Never apply the clean baseline to the existing POC or another populated database. Create a new database for a new project and back up every database before schema deployment.
