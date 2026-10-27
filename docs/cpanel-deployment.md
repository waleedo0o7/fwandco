# cPanel Deployment

The release uses only the existing cPanel account, Apache, Node.js App Manager, and PostgreSQL. It
does not require SSH, Docker, a VPS, or a paid deployment service.

## Release files

Run `corepack pnpm release:cpanel` locally while the CMS is available at `http://localhost:3000`.
The command validates the project and creates these ignored files in `.artifacts/cpanel-release`:

- `web-static.zip` — Astro files for the website document root.
- `cms-linux-x64.tar.gz` — portable Payload/Next standalone runtime with Linux Sharp binaries.
- `SHA256SUMS.txt` and `release-manifest.json` — integrity and version records.

The CMS archive contains no real `.env` file and no Windows junctions. Its startup file is
`app.js`. The included media directory contains only the fictional seed files.

## First deployment

1. Back up the target document root and PostgreSQL database; do not reuse an existing production
   database for this POC.
2. Create an empty PostgreSQL database and user in cPanel and grant that user full rights to the
   new database.
3. Extract `cms-linux-x64.tar.gz` into a dedicated directory outside the public document root.
4. Create a Node.js 24.13.0 application whose application root is that extracted directory and
   whose startup file is `app.js`.
5. Add `DATABASE_URL`, `PAYLOAD_SECRET`, `CMS_PUBLIC_URL`, and `WEB_PUBLIC_URL` in Node.js App
   Manager. Use a fresh random secret of at least 32 characters.
6. Map the Node.js application to the API subdomain, enable HTTPS, and restart it. The configured
   production migrations should create the empty schema on first startup.
7. Confirm `/admin`, `/api/people?limit=1`, and a media URL return successfully before uploading
   the frontend.
8. Extract `web-static.zip` into the website document root and verify the three public routes.

## Media and updates

- `apps/cms/media` is persistent application data. Never delete or replace it during an update.
- Keep database backups before every schema deployment.
- Upload a new CMS archive to a separate directory, preserve/copy the media directory, apply the
  environment variables, switch the app root, test, and only then remove the old release.
- Published About or Contact changes require a new Astro build and upload; dashboard data and
  contact submissions update through the API without rebuilding.

## Server validation still required

The release is locally verified, but cPanel must still prove Passenger startup, Linux Sharp
loading, PostgreSQL permissions, persistent media, SSL/CORS behavior, restart persistence, and
memory use under the real 1 GB account limit.
