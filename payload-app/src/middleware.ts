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

/**
 * Routes where an authenticated user should be redirected to the dashboard
 * instead of seeing the page (avoids showing signup/login to logged-in users).
 */
const AUTH_REDIRECT_PATHS = ['/signup', '/login']

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?'))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for Payload's session cookie
  const token = request.cookies.get('payload-token')?.value

  // Authenticated users visiting signup/login should go straight to dashboard
  if (token && AUTH_REDIRECT_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow public paths through unconditionally
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // The root path '/' is the landing page — redirect unauthenticated visitors
  // straight to the signup page so the app starts there.
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/signup', request.url))
  }

  if (!token) {
    // Redirect unauthenticated visitors to the sign-up page
    const signupUrl = new URL('/signup', request.url)
    // Preserve the original destination so we can redirect back after sign-up
    signupUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(signupUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Run on every route except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
