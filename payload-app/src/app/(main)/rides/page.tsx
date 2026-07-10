import RideRequestForm from './RideRequestForm'

export default function RidesPage() {
  return (
    <div className="bg-gray-950 min-h-screen text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">🚗 Request a Ride</h1>
          <p className="text-gray-400">
            Tell us your pickup, dropoff, and luggage details — we&apos;ll match you with the right vehicle.
          </p>
        </div>
        <RideRequestForm />
      </div>
    </div>
  )
}
