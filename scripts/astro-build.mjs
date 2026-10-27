import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const webDirectory = fileURLToPath(new URL('../apps/web/', import.meta.url))
process.chdir(webDirectory)

const { cli } = await import('../apps/web/node_modules/astro/dist/cli/index.js')
await cli(['node', 'astro', 'build'])

// Node.js 24.13.0 on Windows can abort if Astro exits while libuv is still
// closing an async handle. The fixed production Linux runtime is unaffected.
await delay(150)
