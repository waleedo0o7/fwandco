# Publishing Strategy

Payload publication does not update previously generated Astro HTML. The two public content pages
are static; frequently changing operational data is fetched at runtime.

## What updates automatically

| Surface                         | Update method                                        | Rebuild required |
| ------------------------------- | ---------------------------------------------------- | ---------------- |
| Home dashboard people and tasks | Browser fetch to Payload REST at page load           | No               |
| Contact form submissions        | Browser `POST` to `/api/contact`                     | No               |
| Published About and Contact     | Astro reads Payload during `corepack pnpm build:web` | Yes              |
| Page images used in SSG HTML    | Absolute media URLs are baked into the static output | Yes              |

Draft About and Contact documents remain invisible to the public website and to the unauthenticated
REST read used at build time.

## Local rebuild

1. Publish the About or Contact document in Payload.
2. Keep the CMS running so the Astro build can read published REST data.
3. Run `corepack pnpm build:web`.
4. Deploy the new `apps/web/dist` files to the website document root.

## Automated deployment

This hosting target does not allow server-side builds. Automatic HTML refresh after a Payload
publish would need an extra capability that is not part of the current cPanel constraint set, such
as an external CI job that builds on Windows and uploads static files. Until that exists, content
editors must request a rebuild and upload.

The dashboard and contact form do not wait on that rebuild path.

Production mounts Payload at `https://fwandco.com/cms`; REST endpoints use
`https://fwandco.com/cms/api` without a separate subdomain.
