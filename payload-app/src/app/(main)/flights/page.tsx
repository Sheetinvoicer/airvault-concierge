import FlightSearchForm from './FlightSearchForm'

export default function FlightsPage() {
  return (
    <div className="bg-gray-950 min-h-screen text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">✈️ Flight Search</h1>
          <p className="text-gray-400">Enter your route and departure date to find available flights.</p>
        </div>
        <FlightSearchForm />
      </div>
    </div>
  )
}
