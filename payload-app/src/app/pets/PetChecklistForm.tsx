'use client'

import { useState } from 'react'

export default function PetChecklistForm() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [petName, setPetName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setDone(false)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/pets/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          owner_name: ownerName,
          pet_name: petName,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Failed to generate checklist. Please try again.')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pet_checklist_${petName.replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDone(true)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
      >
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {done && (
          <div className="bg-green-900/30 border border-green-700 text-green-300 rounded-lg px-4 py-3 text-sm">
            ✓ PDF checklist downloaded! Check your downloads folder.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Origin Country
            </label>
            <input
              type="text"
              placeholder="e.g. US"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Destination Country
            </label>
            <input
              type="text"
              placeholder="e.g. AU"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Owner Name
            </label>
            <input
              type="text"
              placeholder="e.g. Jane Smith"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Pet Name
            </label>
            <input
              type="text"
              placeholder="e.g. Buddy"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Destinations AU and NZ include a 10-day quarantine requirement in the checklist.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
        >
          {loading ? 'Generating PDF…' : 'Generate & Download Checklist'}
        </button>
      </form>
    </div>
  )
}
