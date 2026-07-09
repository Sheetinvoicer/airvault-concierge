import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Routes that are publicly accessible without a valid session.
 * Everything else requires the user to be signed in.
 */
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  // Payload admin panel (has its own auth)
  '/admin',
  // Payload REST + GraphQL API
  '/api',
  // Static assets
  '/_next',
  '/favicon.ico',
  '/public',
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?'))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths through unconditionally
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // Check for Payload's session cookie
  const token = request.cookies.get('payload-token')?.value

  if (!token) {
    // Redirect unauthenticated visitors to the sign-in page
    const loginUrl = new URL('/login', request.url)
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Run on every route except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
