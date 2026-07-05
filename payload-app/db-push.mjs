/**
 * db-push.mjs — run at container startup BEFORE node server.js
 *
 * Initialises Payload with NODE_ENV=development so that @payloadcms/db-sqlite
 * triggers pushDevSchema (Drizzle schema push), which creates / updates all
 * tables without needing pre-generated migration files.
 *
 * After the push finishes we disconnect and exit, then the CMD continues with
 * `NODE_ENV=production node server.js`.
 */
import { getPayload } from 'payload'
import { tsImport } from 'tsx/esm/api'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

// Force dev mode so connect.js calls pushDevSchema
process.env.NODE_ENV = 'development'
process.env.PAYLOAD_MIGRATING = 'false'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const baseUrl = pathToFileURL(dirname).toString() + '/'

async function main() {
  console.log('[db-push] Pushing schema to SQLite...')
  try {
    const mod = await tsImport('./src/payload.config.ts', baseUrl)
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
