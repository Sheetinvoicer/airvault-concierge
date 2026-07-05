"use client";

import { useEffect, useState } from 'react';
import RealTimeMap from '../../components/RealTimeMap';
import FlightCard from '../../components/FlightCard';
import PetStatusWidget from '../../components/PetStatusWidget';

export default function DashboardPage() {
  const [flightData, setFlightData] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/flight-track');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFlightData(data);
    };
    return () => ws.close();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-800 text-white p-4">
        <h1 className="text-2xl font-bold">AirVault Concierge Dashboard</h1>
      </header>
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="md:col-span-2">
          <RealTimeMap />
        </div>
        <div className="space-y-4">
          <FlightCard data={flightData} />
          <PetStatusWidget />
        </div>
      </main>
    </div>
  );
}
