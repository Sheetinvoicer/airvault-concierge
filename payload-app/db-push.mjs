/**
 * db-push.mjs — run at container startup BEFORE node server.js
 *
 * Initialises Payload with NODE_ENV=development so that @payloadcms/db-postgres
 * triggers pushDevSchema (Drizzle schema push), which creates / updates all
 * tables without needing pre-generated migration files.
 *
 * After the push finishes we disconnect and exit, then the CMD continues with
 * `NODE_ENV=production node server.js`.
 */
import { getPayload } from 'payload'

// Force dev mode so connect.js calls pushDevSchema
process.env.NODE_ENV = 'development'
process.env.PAYLOAD_MIGRATING = 'false'

async function main() {
  console.log('[db-push] Pushing schema to Postgres...')
  try {
    const configPath = new URL('./dist/payload.config.mjs', import.meta.url)
    const mod = await import(configPath.toString())
    const config = mod.default ?? mod

    const payload = await getPayload({ config })
    console.log('[db-push] Schema push complete.')
    await payload.db.destroy()
  } catch (err) {
    console.error('[db-push] Schema push failed — continuing anyway:', err.message)
  }
  process.exit(0)
}

main()
