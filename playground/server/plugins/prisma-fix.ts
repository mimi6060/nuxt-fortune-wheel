// Fix for Prisma __dirname issue in ESM
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

// Polyfill __dirname and __filename for ESM
if (typeof globalThis.__dirname === 'undefined') {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  // @ts-expect-error - Adding __dirname to globalThis for ESM compatibility
  globalThis.__dirname = __dirname
  // @ts-expect-error - Adding __filename to globalThis for ESM compatibility
  globalThis.__filename = __filename
}

export default defineNitroPlugin(() => {
  // Plugin just ensures the polyfill runs early
})
