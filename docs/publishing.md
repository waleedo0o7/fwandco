# Publishing Strategy

Payload publication does not update previously generated Astro HTML. Pages read from Payload during the Astro build and require a new static build and upload after publishing.

Contact submissions are stored at runtime through `POST /cms/api/contact` and do not require a frontend rebuild.

The target hosting does not perform server-side builds. Automated publishing would require an external CI workflow, which is intentionally outside this base infrastructure.
