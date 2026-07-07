export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-950 text-white">
      <h1 className="text-4xl font-bold mb-4">✈️ AirVault Concierge</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Last-minute flights, delay compensation, ride-hailing, pet travel, and in-flight meals —
        all powered by PayloadCMS + .js.
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        <a
          href="/admin"
          className="bg-indigo-600 hover:bg-indigo-500 rounded-lg p-4 text-center font-medium transition"
        >
          🛠 Admin Panel
        </a>
        <a
          href="/api/health"
          className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center font-medium transition"
        >
          ❤️ Health Check
        </a>
        <a
          href="/api/v1/meals"
          className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center font-medium transition"
        >
          🍽 Meals API
        </a>
        <a
          href="/api/graphql"
          className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center font-medium transition"
        >
          ⚡ GraphQL
        </a>
      </div>
    </main>
  )
}
