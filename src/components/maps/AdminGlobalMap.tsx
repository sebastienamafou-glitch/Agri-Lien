"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix indispensable pour afficher correctement les icônes
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// ✅ NOUVEAU COMPOSANT : Le "Cerveau" de la Caméra
function MapController({ plots, transportPoints }: { plots: any[], transportPoints: any[] }) {
  const map = useMap();

  useEffect(() => {
    // 1. Correction de la Bande Grise (On force la carte à recalculer sa taille après l'animation de la page)
    const timeoutId = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    // 2. Calcul du cadrage (Bounding Box) pour le Zoom Automatique
    const bounds = L.latLngBounds([]);
    let hasData = false;

    // Ajout des parcelles dans le calcul du cadrage
    plots.forEach((plot) => {
      if (plot.geojson) {
        const geoJsonLayer = L.geoJSON(plot.geojson);
        bounds.extend(geoJsonLayer.getBounds());
        hasData = true;
      }
    });

    // Ajout des camions dans le calcul du cadrage
    transportPoints.forEach((point) => {
      if (point.lat && point.lng) {
        bounds.extend([point.lat, point.lng]);
        hasData = true;
      }
    });

    // 3. Ordre à la caméra de s'adapter (avec une petite marge pour l'esthétique)
    if (hasData && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    return () => clearTimeout(timeoutId);
  }, [map, plots, transportPoints]);

  return null; // Ce composant est invisible, il ne fait que contrôler la vue
}


export default function AdminGlobalMap({ plots, transportPoints }: { plots: any[], transportPoints: any[] }) {
  
  const plotStyle = {
    color: "#009A44",
    weight: 2,
    opacity: 1,
    fillColor: "#009A44",
    fillOpacity: 0.2
  };

  return (
    // J'ai ajouté flex flex-col pour s'assurer que le conteneur prenne 100% de la largeur disponible
    <div className="relative w-full h-full min-h-[600px] flex flex-col rounded-[2rem] overflow-hidden shadow-inner border border-slate-200">
      
      <MapContainer 
        center={[5.8, -5.5]} // Centre par défaut si la base de données est vide
        zoom={7} 
        className="flex-1 w-full h-full z-0 outline-none" // flex-1 force la carte à remplir l'espace
        zoomControl={true}
      >
        {/* ✅ On intègre notre caméra intelligente ici */}
        <MapController plots={plots} transportPoints={transportPoints} />

        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap & CartoDB'
        />

        {plots.map((plot) => (
          plot.geojson && (
            <GeoJSON 
              key={`plot-${plot.id}`} 
              data={plot.geojson} 
              style={plotStyle}
            >
              <Popup className="font-sans rounded-xl">
                <div className="p-1 min-w-[150px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Parcelle</p>
                  <p className="font-black text-slate-900 leading-tight">{plot.name}</p>
                  <p className="text-sm text-[#009A44] font-black mt-1">{plot.areaHectares} Ha</p>
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Producteur</p>
                    <p className="text-xs font-black text-slate-700">{plot.producerName}</p>
                  </div>
                </div>
              </Popup>
            </GeoJSON>
          )
        ))}

        {transportPoints.map((point) => (
          <Marker key={`tp-${point.id}`} position={[point.lat, point.lng]}>
            <Popup className="font-sans rounded-xl">
              <div className="p-1 text-center">
                <p className="font-black text-[#FF8200] uppercase text-[10px] tracking-widest mb-1">Enlèvement en cours</p>
                <p className="font-bold text-slate-900">Mission #{point.id.slice(0, 8)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}
