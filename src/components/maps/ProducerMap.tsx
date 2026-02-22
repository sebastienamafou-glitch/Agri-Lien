"use client";

import { MapContainer, TileLayer, Polygon, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Correction du bug d'icône par défaut de Leaflet dans Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

// Coordonnées par défaut (Zone Cacao Soubré, CI)
const DEFAULT_CENTER: [number, number] = [5.7855, -6.6066]; 
const DEFAULT_ZOOM = 13;

type ProducerMapProps = {
  plots: any[]; // On typerra mieux quand on aura PostGIS activé
};

export default function ProducerMap({ plots }: ProducerMapProps) {
  
  useEffect(() => {
    // Appliquer l'icône par défaut au chargement
    (async function init() {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl,
        iconRetinaUrl,
        shadowUrl,
      });
    })();
  }, []);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden z-0 relative">
      <MapContainer 
        center={DEFAULT_CENTER} 
        zoom={DEFAULT_ZOOM} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false} // Pour ne pas gêner le scroll de la page
      >
        {/* Fond de carte Satellite (Esri World Imagery) pour bien voir les champs */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Optionnel : Une couche "Routes/Noms" par dessus pour se repérer */}
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png"
          opacity={0.5} // Transparence pour voir la forêt dessous
        />

        {/* Ici, nous dessinerons les polygones plus tard. 
            Pour l'instant, on met un marqueur fictif pour l'exemple visuel */}
        <Marker position={DEFAULT_CENTER} icon={defaultIcon}>
          <Popup>
            <strong>Zone de Production</strong><br />
            Géolocalisation en attente.
          </Popup>
        </Marker>

      </MapContainer>

      {/* Petit encart légende par dessus la carte */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg z-[1000] text-xs">
         <p className="font-bold text-gray-800">Légende</p>
         <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
            <span>Position estimée</span>
         </div>
      </div>
    </div>
  );
}
