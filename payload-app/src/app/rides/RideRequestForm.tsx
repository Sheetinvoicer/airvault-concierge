'use client'

import { useState } from 'react'

interface RideResult {
  ride_id: string
  vehicle: string
  fee: number
  pickup: string
  dropoff: string
}

export default function RideRequestForm() {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [luggageVolume, setLuggageVolume] = useState('')
  const [luggageWeight, setLuggageWeight] = useState('')
  const [result, setResult] = useState<RideResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/rides/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          dropoff,
          luggage_volume: Number(luggageVolume),
          luggage_weight: Number(luggageWeight),
        }),
      })

      const data = (await res.json()) as RideResult & { error?: string }

      if (!res.ok) {
        if (data.error?.toLowerCase().includes('no vehicle')) {
          setError(
            'No vehicle could accommodate your luggage. Try reducing the volume or weight.',
          )
        } else {
          setError(data.error ?? 'Failed to book ride. Please try again.')
        }
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
          <div className="text-3xl mb-2">🚗</div>
          <h3 className="text-lg font-semibold text-green-300 mb-1">Ride Confirmed!</h3>
          <p className="text-gray-300 mb-5">Your vehicle has been matched and is being arranged.</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 uppercase tracking-wide text-xs">Booking ID</p>
              <p className="text-white font-mono">{result.ride_id}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wide text-xs">Vehicle</p>
              <p className="text-white">{result.vehicle}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wide text-xs">Pickup</p>
              <p className="text-white">{result.pickup}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-wide text-xs">Dropoff</p>
              <p className="text-white">{result.dropoff}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 uppercase tracking-wide text-xs">Total Fee</p>
              <p className="text-green-400 font-bold text-2xl">${result.fee.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => { setResult(null); setPickup(''); setDropoff(''); setLuggageVolume(''); setLuggageWeight('') }}
            className="mt-5 text-sm text-indigo-400 hover:text-indigo-300 underline"
          >
            Book another ride
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                Pickup Location
              </label>
              <input
                type="text"
                placeholder="e.g. Terminal 2, JFK Airport"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                Dropoff Location
              </label>
              <input
                type="text"
                placeholder="e.g. Manhattan Midtown Hotel"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                Luggage Volume (Liters)
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={luggageVolume}
                onChange={(e) => setLuggageVolume(e.target.value)}
                min={0}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
                Luggage Weight (lbs)
              </label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={luggageWeight}
                onChange={(e) => setLuggageWeight(e.target.value)}
                min={0}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Vehicles available: Sedan (30L / 50 lbs), Lyft SUV (60L / 80 lbs), UberXL (80L / 100 lbs).
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Finding your ride…' : 'Request Ride'}
          </button>
        </form>
      )}
    </div>
  )
}
