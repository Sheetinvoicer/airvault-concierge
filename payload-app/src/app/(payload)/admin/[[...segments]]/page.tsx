import { RootPage } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../../importMap'

// Required for Payload admin in Next.js 15: prevents static caching and ensures
// redirect() calls inside RootPage RSC don't cause HTTP 500 errors.
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export default async function Page({ params, searchParams }: Args) {
  return RootPage({ config, importMap, params, searchParams })
}
