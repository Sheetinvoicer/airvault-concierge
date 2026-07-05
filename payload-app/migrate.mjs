#!/usr/bin/env node
// ESM-based Payload migration runner.
// Replicates what payload/bin.js does: patches registerHooks so tsx falls back
// to its async module.register() worker path (avoids specifier-leakage bug on
// Node 22), then delegates to payload's own bin with argv set to 'migrate --force'.
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

// Mirror payload/bin.js: disable synchronous registerHooks (Node >=23.5 bug)
const nodeModule = await import('node:module')
if (typeof nodeModule.default.registerHooks === 'function') {
  nodeModule.default.registerHooks = undefined
}

// Set argv so payload's bin picks up 'migrate --force'
process.argv = [process.argv[0], process.argv[1], 'migrate', '--force']

const dirname = path.dirname(fileURLToPath(import.meta.url))
const url = pathToFileURL(dirname).toString() + '/'

const { tsImport } = await import('tsx/esm/api')
const { bin } = await tsImport('./node_modules/payload/dist/bin/index.js', url)
await bin()
