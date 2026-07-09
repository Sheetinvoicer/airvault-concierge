'use client'

import { useState } from 'react'
import { SEAT_ROWS, SEAT_LETTERS } from '@/lib/formOptions'
import { useFlights } from '@/lib/useFlights'

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
  const { flights } = useFlights()
  const [open, setOpen] = useState(false)
  const [flightId, setFlightId] = useState('')
  const [seatRow, setSeatRow] = useState('')
  const [seatLetter, setSeatLetter] = useState('')
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
          seat_number: `${seatRow}${seatLetter}`,
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
          <select
            value={flightId}
            onChange={(e) => setFlightId(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">
              {flights.length === 0 ? 'No flights available' : 'Select flight'}
            </option>
            {flights.map((f) => (
              <option key={f.id} value={f.flightNumber}>
                {f.flightNumber} ({f.origin}-{f.destination})
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={seatRow}
              onChange={(e) => setSeatRow(e.target.value)}
              required
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Row</option>
              {SEAT_ROWS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={seatLetter}
              onChange={(e) => setSeatLetter(e.target.value)}
              required
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">Seat</option>
              {SEAT_LETTERS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
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
