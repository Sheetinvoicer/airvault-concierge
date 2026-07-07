import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../app/login/page'

// Mock window.location
const mockAssign = vi.fn()
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders email and password fields', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders the sign in button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('has autocomplete attributes on inputs', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'current-password')
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    // fetch never resolves so we can inspect loading state
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('redirects to /dashboard on successful login', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard')
    })
  })

  it('shows error message on failed login', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      }),
    )

    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('shows generic error on network failure', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')))

    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  it('calls /api/users/login with correct payload', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email/i), 'user@test.com')
    await user.type(screen.getByLabelText(/password/i), 'mypassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@test.com', password: 'mypassword' }),
      })
    })
  })

  it('has a link to the signup page', () => {
    render(<LoginPage />)
    const link = screen.getByRole('link', { name: /sign up/i })
    expect(link).toHaveAttribute('href', '/signup')
  })
})
