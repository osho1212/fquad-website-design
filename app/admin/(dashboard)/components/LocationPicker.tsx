'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const useMapEvents = (handlers: any) => {
  const mod = require('react-leaflet');
  return mod.useMapEvents(handlers);
};

interface LocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number, address?: string) => void;
}

// Hyderabad — sensible default center when no pin is set yet
const DEFAULT_CENTER: [number, number] = [17.385, 78.4867];

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number, address?: string) => void }) {
  useMapEvents({
    async click(e: any) {
      const { lat, lng } = e.latlng;
      onChange(lat, lng);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data?.display_name) {
          onChange(lat, lng, data.display_name);
        }
      } catch {
        // Reverse geocoding is a nice-to-have — if it fails, the pin still works fine.
      }
    },
  });
  return null;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const [ready, setReady] = useState(false);
  const [icon, setIcon] = useState<any>(null);

  useEffect(() => {
    // Leaflet's default marker icon needs manual setup in a bundler context
    import('leaflet').then((L) => {
      const markerIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      setIcon(markerIcon);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div style={{ height: 280, background: '#F0EEE8', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9C9890', fontSize: 13 }}>
        Loading map…
      </div>
    );
  }



const center: [number, number] = lat !== null && lng !== null ? [lat, lng] : DEFAULT_CENTER;

  return (
    <div>
      <div style={{ height: 280, width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #DEDBD4' }}>
        <MapContainer
          center={center}
          zoom={lat !== null ? 15 : 12}
          style={{ height: '280px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <ClickHandler onChange={onChange} />
          {lat !== null && lng !== null && <Marker position={[lat, lng]} icon={icon} />}
        </MapContainer>
      </div>
      <p style={{ fontSize: 12, color: '#9C9890', marginTop: 8 }}>
        Click anywhere on the map to drop or move the pin.
        {lat !== null && lng !== null && (
          <span> Current: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
        )}
      </p>
    </div>
  );
}
    