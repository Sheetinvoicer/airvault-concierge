export default async function FlightsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/flights`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return <div className="p-8 text-red-600">Failed to load flights.</div>
  }

  const data = await res.json()
  const flights = data.docs || []

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Flights</h1>
      {flights.length === 0 ? (
        <p>No flights available yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Airline</th>
                <th className="border p-3 text-left">Origin</th>
                <th className="border p-3 text-left">Destination</th>
                <th className="border p-3 text-left">Departure</th>
                <th className="border p-3 text-left">Arrival</th>
                <th className="border p-3 text-right">Price ($)</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight: any) => (
                <tr key={flight.id} className="hove :bg-gray-50">
                  <td className="border p-3">{flight.airline}</td>
                  <td className="border p-3">{flight.origin}</td>
                  <td className="border p-3">{flight.destination}</td>
                  <td className="border p-3">{new Date(flight.departure).toLocaleString()}</td>
                  <td className="border p-3">{new Date(flight.arrival).toLocaleString()}</td>
                  <td className="border p-3 text-right">{flight.price}</td>
                </tr>
              ))}
                                                               
    </div>
  )
}
