/**
 * Tests for the route-guarding middleware.
 *
 * Unauthenticated visitors are redirected to /signup (the app entry point).
 * Public paths (/login, /signup, /api/*, /admin/*) bypass the check.
 * Authenticated users visiting /signup or /login are redirected to /dashboard.
 */
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

function makeRequest(pathname: string, hasCookie = false): NextRequest {
  const url = `http://localhost:3000${pathname}`
  const req = new NextRequest(url)
  if (hasCookie) {
    req.cookies.set('payload-token', 'fake-jwt-token')
  }
  return req
}

describe('middleware — unauthenticated', () => {
  it('redirects / to /signup when no cookie', () => {
    const res = middleware(makeRequest('/'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch('/signup')
  })

  it('redirects /dashboard to /signup when no cookie', () => {
    const res = middleware(makeRequest('/dashboard'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch('/signup')
  })

  it('redirects /claims to /signup when no cookie', () => {
    const res = middleware(makeRequest('/claims'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch('/signup')
  })

  it('preserves the original path in the `from` query param', () => {
    const res = middleware(makeRequest('/rides'))
    const location = res.headers.get('location') ?? ''
    expect(location).toContain('from=%2Frides')
  })
})

describe('middleware — authenticated', () => {
  it('allows / through when cookie present', () => {
    const res = middleware(makeRequest('/', true))
    expect(res.status).toBe(200)
  })

  it('allows /dashboard through when cookie present', () => {
    const res = middleware(makeRequest('/dashboard', true))
    expect(res.status).toBe(200)
  })

  it('redirects /signup to /dashboard when cookie present', () => {
    const res = middleware(makeRequest('/signup', true))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch('/dashboard')
  })

  it('redirects /login to /dashboard when cookie present', () => {
    const res = middleware(makeRequest('/login', true))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch('/dashboard')
  })
})

describe('middleware — public paths (no cookie needed)', () => {
  const publicPaths = [
    '/login',
    '/signup',
    '/admin/login',
    '/admin/create-first-user',
    '/api/users/login',
    '/api/users',
    '/api/v1/claims',
  ]

  for (const path of publicPaths) {
    it(`allows ${path} without a cookie`, () => {
      const res = middleware(makeRequest(path))
      expect(res.status).toBe(200)
    })
  }
})