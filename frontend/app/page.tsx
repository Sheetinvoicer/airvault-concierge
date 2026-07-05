export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-800">AirVault Concierge</h1>
        <p className="mt-4 text-gray-600">Your smart travel companion</p>
        <a href="/dashboard" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
