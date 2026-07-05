#!/usr/bin/env node
// ESM-based Payload migration runner.
// Spawns tsx CLI to execute migrate-run.mts in full ESM mode (.mts extension
// forces tsx to use ESM output format, avoiding Node 20 CJS/ESM interop issues
// with top-level-await packages like @payloadcms/richtext-lexical).
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const tsxBin = path.resolve(dirname, 'node_modules', '.bin', 'tsx')
const runnerScript = path.resolve(dirname, 'migrate-run.mts')

const child = spawn(
  tsxBin,
  [runnerScript],
  { stdio: 'inherit', env: process.env }
)

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
