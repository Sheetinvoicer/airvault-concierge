import Link from 'next/link'

const services = [
  {
    icon: '✈️',
    title: 'Flights',
    description: 'Search last-minute flights and compare prices instantly.',
    href: '/flights',
  },
  {
    icon: '💼',
    title: 'Claims',
    description: 'File delay-compensation claims in seconds — no paper forms.',
    href: '/claims',
  },
  {
    icon: '🚗',
    title: 'Rides',
    description: 'Request the right-sized vehicle for your luggage.',
    href: '/rides',
  },
  {
    icon: '🍽',
    title: 'Meals',
    description: 'Pre-select your in-flight meal before boarding.',
    href: '/meals',
  },
  {
    icon: '🐾',
    title: 'Pets',
    description: 'Generate a PDF compliance checklist for pet travel.',
    href: '/pets',
  },
  {
    icon: '🛠',
    title: 'Admin',
    description: 'Manage collections, users, and content via PayloadCMS.',
    href: '/admin',
  },
]

export default function Home() {
  return (
    <div className="bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-950 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">✈️</div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
            AirVault Concierge
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Your all-in-one travel companion. Last-minute flights, delay compensation, ride-hailing,
            in-flight meals, and pet travel — seamlessly connected.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/flights"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-lg transition text-lg"
            >
              Search Flights
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition text-lg border border-gray-700"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-200 mb-10">
          Everything you need, in one place
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500 rounded-xl p-6 flex flex-col gap-3 transition"
            >
              <div className="text-4xl">{service.icon}</div>
              <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition">
                {service.title}
              </h3>
              <p className="text-sm text-gray-400">{service.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
