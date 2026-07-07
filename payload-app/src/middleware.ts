import { withPayload } from '@payloadcms/next/withPayload'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const middleware = (request: NextRequest) => {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all request paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}

export default withPayload(middleware)
