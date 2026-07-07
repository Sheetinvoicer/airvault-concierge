import { RootPage } from '@payloadcms/next/views'
import config from '../../../../payload.config'
import { importMap } from '../../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export default async function Page({ params, searchParams }: Args) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  return RootPage({
    config,
    importMap,
    params: resolvedParams,
    searchParams: resolvedSearchParams,
  })
}
