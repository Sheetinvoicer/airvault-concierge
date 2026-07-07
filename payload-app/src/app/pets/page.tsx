import PetChecklistForm from './PetChecklistForm'

export default function PetsPage() {
  return (
    <div className="bg-gray-950 min-h-screen text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">🐾 Pet Travel Checklist</h1>
          <p className="text-gray-400">
            Generate a personalised PDF compliance checklist for travelling with your pet. Includes
            vaccination, microchip, quarantine, and approved carrier requirements.
          </p>
        </div>

        <PetChecklistForm />

        {/* Info Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-2">💉</div>
            <h3 className="font-semibold text-sm text-white mb-1">Vaccinations</h3>
            <p className="text-xs text-gray-400">Rabies and other vaccines may be required depending on your destination.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-2">📡</div>
            <h3 className="font-semibold text-sm text-white mb-1">Microchip</h3>
            <p className="text-xs text-gray-400">ISO 11784/11785 standard microchip required for most international routes.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-semibold text-sm text-white mb-1">Quarantine</h3>
            <p className="text-xs text-gray-400">AU and NZ require a 10-day quarantine period for all incoming pets.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
