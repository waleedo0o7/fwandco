# cPanel Deployment

The deployment uses Apache, cPanel Node.js App Manager, PostgreSQL, and locally prepared artifacts. It requires no server-side build, Docker, VPS, or paid deployment service.

## Release

Run `corepack pnpm release:cpanel` locally. It creates ignored artifacts in `.artifacts/cpanel-release`:

- `web-static.zip`
- `cms-linux-x64.tar.gz`
- `SHA256SUMS.txt`
- `release-manifest.json`

The CMS archive contains no real `.env`; its startup file is `app.js`.

## New project deployment

1. Create a fresh PostgreSQL database and restricted application user.
2. Extract the CMS archive outside the public document root.
3. Create a Node.js 24.13.0 app with root set to that directory, URL path `/cms`, and startup file `app.js`.
4. Configure `DATABASE_URL`, `PAYLOAD_SECRET`, `CMS_PUBLIC_URL`, and `WEB_PUBLIC_URL`.
5. Restart the app and verify `/cms/admin`, `/cms/api/pages?limit=1`, and `/cms/api/media?limit=1`.
6. Extract `web-static.zip` into the website document root and verify the public routes.

## Persistent media and updates

Preserve `apps/cms/media` across releases. Upload new CMS versions into a separate directory, copy persistent media, apply environment variables, test, and only then switch application roots. Back up the database before every schema deployment.

The target cPanel stack has been validated with the original compatibility POC. Each derived product still requires its own smoke test, media upload test, restart test, and memory check.
