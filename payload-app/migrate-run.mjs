// This helper runs INSIDE tsx's ESM hook context (loaded via tsImport in migrate.mjs).
// By the time this module executes, tsx is already registered as an ESM loader,
// so the plain dynamic import() below correctly handles .ts files with top-level await.
import { pathToFileURL } from 'node:url'
import { findConfig } from 'payload/dist/config/find.js'
import { migrate } from 'payload/dist/bin/migrate.js'

const configPath = process.env.PAYLOAD_CONFIG_PATH
  ? new URL(process.env.PAYLOAD_CONFIG_PATH, pathToFileURL(process.cwd()) + '/')
  : pathToFileURL(findConfig())

let configMod = await import(configPath.toString())
let config = configMod.default ?? configMod

await migrate({ config, parsedArgs: { _: ['migrate'], force: true } })
