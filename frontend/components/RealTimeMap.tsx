import { useEffect, useRef } from 'react';

export default function RealTimeMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.innerHTML = '<div style="height:400px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;border-radius:8px;">Map placeholder</div>';
    }
  }, []);

  return <div ref={mapRef} className="h-96 bg-gray-200 rounded-lg" />;
}
