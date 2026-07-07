'use client'

import { useState } from 'react'

interface Flight {
  id: string
  airline: string
  departure: string
  arrival: string
  price: number
  currency: string
}

export default function FlightSearchForm() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFlights([])
    setSearched(false)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, departure_date: date }),
      })

      const data = (await res.json()) as { flights?: Flight[]; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Search failed. Please try again.')
        return
      }

      setFlights(data.flights ?? [])
      setSearched(true)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return iso
    }
  }

  return (
    <div>
      {/* Search Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Origin (IATA)
            </label>
            <input
              type="text"
              placeholder="e.g. JFK"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              maxLength={3}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Destination (IATA)
            </label>
            <input
              type="text"
              placeholder="e.g. LHR"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              maxLength={3}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Departure Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'Searching…' : 'Search Flights'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="text-center text-gray-400 py-12">
          <div className="text-4xl animate-pulse mb-3">✈️</div>
          <p>Searching available flights…</p>
        </div>
      )}

      {/* Results */}
      {!loading && searched && flights.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No flights found for this route and date. Try a different search.
        </div>
      )}

      {!loading && flights.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">{flights.length} flight(s) found</p>
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-white text-lg">{flight.airline}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {fmt(flight.departure)} → {fmt(flight.arrival)}
                </p>
                <p className="text-gray-500 text-xs mt-1">{flight.id}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-400">
                  {flight.currency} {flight.price.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">incl. concierge fee</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
