"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";

// Fix Leaflet Icons
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  onLocationSelect: (type: 'pickup' | 'dropoff', lat: number, lng: number) => void;
  pickup: { lat: number; lng: number } | null;
  dropoff: { lat: number; lng: number } | null;
}

export default function LogisticsMap({ onLocationSelect, pickup, dropoff }: MapProps) {
  const [mode, setMode] = useState<'pickup' | 'dropoff'>('pickup');

  function MapEvents() {
    useMapEvents({
      click(e) {
        onLocationSelect(mode, e.latlng.lat, e.latlng.lng);
        if (mode === 'pickup') setMode('dropoff'); // UX: Passe automatiquement au dépôt
      },
    });
    return null;
  }

  const isValidLatLng = (point: { lat: number; lng: number } | null) => {
    return point && typeof point.lat === 'number' && typeof point.lng === 'number';
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col rounded-3xl overflow-hidden shadow-inner border border-slate-200">
      
      {/* Contrôles Flottants par-dessus la carte */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex gap-2">
        <button 
          type="button"
          onClick={() => setMode('pickup')}
          className={`flex-1 py-3 px-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg backdrop-blur-md ${
            mode === 'pickup' 
            ? 'bg-[#FF8200] text-white border-2 border-white' 
            : 'bg-white/90 text-slate-600 border-2 border-transparent hover:bg-white'
          }`}
        >
          <MapPin className="w-4 h-4" /> 1. Collecte
        </button>
        <button 
          type="button"
          onClick={() => setMode('dropoff')}
          className={`flex-1 py-3 px-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg backdrop-blur-md ${
            mode === 'dropoff' 
            ? 'bg-[#009A44] text-white border-2 border-white' 
            : 'bg-white/90 text-slate-600 border-2 border-transparent hover:bg-white'
          }`}
        >
          <Navigation className="w-4 h-4" /> 2. Magasin
        </button>
      </div>
      
      {/* La Carte Leaflet */}
      <MapContainer 
        center={[6.8276, -5.2767]} // Centre CI
        zoom={6} 
        className="flex-1 w-full h-full z-0"
        zoomControl={false} // On enlève les boutons de zoom moches par défaut
      >
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Fond de carte plus moderne (CartoDB)
          attribution='&copy; OpenStreetMap'
        />
        <MapEvents />
        
        {isValidLatLng(pickup) && (
          <Marker position={[pickup!.lat, pickup!.lng]}>
            <Popup className="font-sans font-bold text-[#FF8200]">Point de Collecte</Popup>
          </Marker>
        )}
        
        {isValidLatLng(dropoff) && (
          <Marker position={[dropoff!.lat, dropoff!.lng]}>
            <Popup className="font-sans font-bold text-[#009A44]">Coopérative</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
