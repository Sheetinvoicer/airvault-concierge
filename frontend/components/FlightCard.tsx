export default function FlightCard({ data }: { data?: any }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="font-bold text-lg">Your Flight</h3>
      {data ? (
        <p className="text-gray-600">{data.flight_id} – {data.status}</p>
      ) : (
        <p className="text-gray-600">Loading...</p>
      )}
      <p className="text-sm text-green-600">On time</p>
    </div>
  );
}
