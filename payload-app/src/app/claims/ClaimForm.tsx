'use client'

import { useState } from 'react'

interface ClaimResult {
  id: string
  flightId: string
  passengerId: string
  delayMinutes: number
  payoutAmount: number
  status: string
}

export default function ClaimForm() {
  const [flightId, setFlightId] = useState('')
  const [passengerId, setPassengerId] = useState('')
  const [delayMinutes, setDelayMinutes] = useState('')
  const [result, setResult] = useState<ClaimResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_id: flightId,
          passenger_id: passengerId,
          delay_minutes: Number(delayMinutes),
        }),
      })

      const data = (await res.json()) as ClaimResult & { error?: string }

      if (res.status === 422) {
        setError("Your flight delay doesn't qualify — delays must be at least 60 minutes.")
        return
      }

      if (!res.ok) {
        setError(data.error ?? 'Failed to submit claim. Please try again.')
        return
      }

      setResult(data)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {result ? (
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-6">
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="text-lg font-semibold text-green-300 mb-1">Claim Submitted!</h3>
          <p className="text-gray-300 mb-4">
            Your claim has been received and is being processed.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 uppercase tracking-wide text-xs">Claim ID</p>
              <p className="text-white font-mono">{result.id}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wide text-xs">Flight</p>
              <p className="text-white">{result.flightId}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wide text-xs">Payout Amount</p>
              <p className="text-green-400 font-bold text-xl">${result.payoutAmount}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wide text-xs">Status</p>
              <p className="text-yellow-400 capitalize">{result.status}</p>
            </div>
          </div>
          <button
            onClick={() => { setResult(null); setFlightId(''); setPassengerId(''); setDelayMinutes('') }}
            className="mt-5 text-sm text-indigo-400 hover:text-indigo-300 underline"
          >
            Submit another claim
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">File a New Claim</h3>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Flight ID
            </label>
            <input
              type="text"
              placeholder="e.g. AA1234"
              value={flightId}
              onChange={(e) => setFlightId(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Passenger ID
            </label>
            <input
              type="text"
              placeholder="e.g. your user ID or booking reference"
              value={passengerId}
              onChange={(e) => setPassengerId(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Delay (minutes)
            </label>
            <input
              type="number"
              placeholder="e.g. 180"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(e.target.value)}
              min={1}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 60 minutes to qualify.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Submitting…' : 'Submit Claim'}
          </button>
        </form>
      )}
    </div>
  )
}
