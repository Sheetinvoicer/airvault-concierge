/**
 * Tests for the global site chrome (nav header + footer).
 *
 * The auth screens (/login, /signup) are standalone, full-screen centered
 * cards, so the global nav/footer must NOT wrap them. Every other route keeps
 * the chrome.
 */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { SiteChrome } from '../app/SiteChrome'

// usePathname is the only thing SiteChrome needs from the router.
let mockPathname = '/'
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

// Render next/link as a plain anchor so we don't need a router provider.
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

afterEach(() => cleanup())

describe('SiteChrome — auth routes render without chrome', () => {
  for (const path of ['/login', '/signup']) {
    it(`hides the header, nav and footer on ${path}`, () => {
      mockPathname = path
      render(
        <SiteChrome userEmail={null}>
          <div>page content</div>
        </SiteChrome>,
      )

      expect(screen.getByText('page content')).toBeInTheDocument()
      expect(screen.queryByRole('banner')).toBeNull() // <header>
      expect(screen.queryByRole('navigation')).toBeNull() // <nav>
      expect(screen.queryByRole('contentinfo')).toBeNull() // <footer>
    })
  }
})

describe('SiteChrome — app routes render with chrome', () => {
  it('shows the header, nav and footer on /dashboard', () => {
    mockPathname = '/dashboard'
    render(
      <SiteChrome userEmail={null}>
        <div>page content</div>
      </SiteChrome>,
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText('page content')).toBeInTheDocument()
  })

  it('shows Login / Sign Up links when logged out', () => {
    mockPathname = '/'
    render(
      <SiteChrome userEmail={null}>
        <div>home</div>
      </SiteChrome>,
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('shows the user email and a logout button when logged in', () => {
    mockPathname = '/'
    render(
      <SiteChrome userEmail="jane@example.com">
        <div>home</div>
      </SiteChrome>,
    )

    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
    expect(screen.queryByText('Login')).toBeNull()
  })
})
