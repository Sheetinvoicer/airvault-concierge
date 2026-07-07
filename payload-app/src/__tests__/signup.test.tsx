import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '../app/signup/page'

describe('SignupPage', () => {
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
    render(<SignupPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders the create account button', () => {
    render(<SignupPage />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('has autocomplete attributes on inputs', () => {
    render(<SignupPage />)
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('autocomplete', 'new-password')
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    render(<SignupPage />)
    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/password/i), 'newpass123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
  })

  it('calls /api/users with email and password only (no confirmPassword)', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    render(<SignupPage />)
    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/password/i), 'newpass123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      const firstCall = fetchMock.mock.calls[0]
      expect(firstCall[0]).toBe('/api/users')
      expect(firstCall[1].method).toBe('POST')
      const body = JSON.parse(firstCall[1].body)
      expect(body).toEqual({ email: 'new@example.com', password: 'newpass123' })
      expect(body).not.toHaveProperty('confirmPassword')
    })
  })

  it('auto-logs in and redirects to /dashboard after signup', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    render(<SignupPage />)
    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/password/i), 'newpass123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard')
    })
  })

  it('shows error when signup API returns an error', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Email already exists' }),
      }),
    )

    render(<SignupPage />)
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/password/i), 'somepass')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('shows error detail from Payload errors array', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          errors: [{ message: 'Password must be at least 8 characters' }],
        }),
      }),
    )

    render(<SignupPage />)
    await user.type(screen.getByLabelText(/email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/password/i), 'short')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  it('shows generic error on network failure', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')))

    render(<SignupPage />)
    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/password/i), 'newpass123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  it('redirects to /login if signup succeeds but auto-login fails', async () => {
    const user = userEvent.setup()
    // First call (signup) succeeds, second call (login) fails
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: false }),
    )

    render(<SignupPage />)
    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/password/i), 'newpass123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(window.location.href).toBe('/login')
    })
  })

  it('has a link to the login page', () => {
    render(<SignupPage />)
    const link = screen.getByRole('link', { name: /sign in/i })
    expect(link).toHaveAttribute('href', '/login')
  })
})
