'use client'

import { useEffect, useState } from 'react'

export interface FlightOption {
  id: number | string
  flightNumber: string
  airline: string
  origin: string
  destination: string
}

/**
 * Loads bookable flights live from the Payload Flights collection
 * (GET /api/flights — public read access). Used to populate the flight
 * pickers on the claim and meal-reservation forms with real data.
 */
export function useFlights(): { flights: FlightOption[]; loading: boolean } {
  const [flights, setFlights] = useState<FlightOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    fetch('/api/flights?limit=100&depth=0&sort=flightNumber')
      .then((r) => (r.ok ? r.json() : { docs: [] }))
      .then((data: { docs?: FlightOption[] }) => {
        if (active) setFlights(data.docs ?? [])
      })
      .catch(() => {
        if (active) setFlights([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { flights, loading }
}
