'use client'

import { useState } from 'react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        let msg = 'Signup failed'
        try {
          const data = await res.json()
          if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            msg = data.errors.map((e: { message?: string }) => e.message).filter(Boolean).join(', ') || data.message || msg
          } else {
            msg = data.message || msg
          }
        } catch {}
        setError(msg)
        setLoading(false)
        return
      }

      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!loginRes.ok) {
        setError('Account created but login failed. Please log in manually.')
        window.location.href = '/login'
        return
      }

      window.location.href = '/dashboard'
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-950 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">✈️</div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-gray-400 text-sm mt-1">Join AirVault Concierge for free</p>
        </div>
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
