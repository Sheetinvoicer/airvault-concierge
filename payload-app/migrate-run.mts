// Must run in ESM context (tsx treats .mts files as ESM), which supports top-level await
// and allows async import() of packages that use top-level await (e.g. @payloadcms/richtext-lexical).

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// ── 1. Load .env manually (avoids @/env CJS/ESM interop bug in tsx) ──────
try {
  const envFile = readFileSync(resolve(__dirname, '.env'), 'utf8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && !(key in process.env)) process.env[key] = val
  }
  console.log('[migrate] .env loaded')
} catch {
  console.warn('[migrate] No .env file found — relying on environment variables already set')
}

// ── 2. Fix @/env CJS interop (module sets __esModule:true but default:undefined) ─
// Pre-require and patch the module so `import EnvImport from '@/env'` in
// payload/dist/bin/loadEnv.js gets a valid .default (the exports object itself).
const require = createRequire(import.meta.url)
const EnvPath = require.resolve('@/env')
const Env = require(EnvPath)
if (Env && Env.__esModule && Env.default === undefined) {
  // Webpack bundles set __esModule:true but forget to set .default — fix it
  Env.default = Env
  // Also patch the require cache entry directly so loadEnv.js gets the fixed version
  if (require.cache[EnvPath]) {
    require.cache[EnvPath]!.exports.default = Env
  }
}

// ── 3. Import Payload and run migrations ──────────────────────────────────────
const { getPayload } = await import('payload')
const configMod = await import('./src/payload.config.ts')
const config = configMod.default ?? configMod

console.log('[migrate] Initialising Payload...')
const payload = await getPayload({ config, disableOnInit: true })

console.log('[migrate] Running pending migrations...')
await payload.db.migrate()
console.log('[migrate] Migrations complete.')

await payload.db.destroy()
