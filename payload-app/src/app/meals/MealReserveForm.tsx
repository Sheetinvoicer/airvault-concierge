'use client'

import { useState } from 'react'

interface Props {
  mealId: string
  mealName: string
}

interface ReserveResult {
  booking_ref: string
  flight_id: string
  meal_id: string
  seat_number: string
  confirmed: boolean
}

export default function MealReserveForm({ mealId, mealName }: Props) {
  const [open, setOpen] = useState(false)
  const [flightId, setFlightId] = useState('')
  const [seatNumber, setSeatNumber] = useState('')
  const [result, setResult] = useState<ReserveResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/meals/reserve', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_id: flightId,
          meal_id: mealId,
          seat_number: seatNumber,
        }),
      })

      const data = (await res.json()) as ReserveResult & { error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Reservation failed. Please try again.')
        return
      }

      setResult(data)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="mt-3 bg-green-900/30 border border-green-700 rounded-lg p-4 text-sm">
        <p className="text-green-300 font-semibold mb-1">✓ Reserved: {mealName}</p>
        <p className="text-gray-400">
          Booking Ref: <span className="text-white font-mono">{result.booking_ref}</span>
        </p>
        <p className="text-gray-400">
          Seat: <span className="text-white">{result.seat_number}</span>
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition"
        >
          Reserve
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}
          <input
            type="text"
            placeholder="Flight ID (e.g. AA1234)"
            value={flightId}
            onChange={(e) => setFlightId(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Seat Number (e.g. 12A)"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm transition"
            >
              {loading ? 'Reserving…' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-300 text-sm px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
