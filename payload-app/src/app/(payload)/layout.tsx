/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

// NOTE: We intentionally do NOT use <RootLayout> here because the root
// app/layout.tsx already provides <html> and <body>. Wrapping with RootLayout
// would produce nested <html>/<body> tags and trigger a React hydration error.
const Layout = ({ children }: Args) => <>{children}</>

export default Layout