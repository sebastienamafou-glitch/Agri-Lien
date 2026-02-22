"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { dispatchTruck } from "@/app/actions/logistics/logistics";
import { CreateTransportOrderDTO } from "@/app/actions/logistics/schema";
import { Package, MapPin, Navigation, AlertCircle, Loader2, Send, Map as MapIcon, Info } from "lucide-react";

// Import dynamique de la carte avec un chargement moderne
const LogisticsMap = dynamic(() => import("./LogisticsMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-[450px] w-full bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-[#FF8200] mb-3" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        Initialisation de la Carte...
      </span>
    </div>
  )
});

export default function TransportOrderForm({ producers }: { producers: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour la synchronisation Carte <-> Formulaire
  const [pickup, setPickup] = useState<{lat: number, lng: number} | null>(null);
  const [dropoff, setDropoff] = useState<{lat: number, lng: number} | null>(null);

  /**
   * Met à jour les coordonnées depuis la carte avec précision PostGIS
   */
  const handleLocationSelect = (type: 'pickup' | 'dropoff', lat: number, lng: number) => {
    const coords = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
    if (type === 'pickup') {
      setPickup(coords);
    } else {
      setDropoff(coords);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // 1. Extraction et consolidation des données (Priorité à l'état local, sinon formulaire)
    const pickupLat = pickup?.lat ?? parseFloat(formData.get("pickupLat") as string);
    const pickupLng = pickup?.lng ?? parseFloat(formData.get("pickupLong") as string);
    const dropoffLat = dropoff?.lat ?? parseFloat(formData.get("dropoffLat") as string);
    const dropoffLng = dropoff?.lng ?? parseFloat(formData.get("dropoffLong") as string);

    // 2. VALIDATION STRICTE AVANT ENVOI (Correctif Bug Critique)
    // Empêche l'envoi de NaN ou de données incomplètes qui feraient planter l'insertion SQL
    if (isNaN(pickupLat) || isNaN(pickupLng) || isNaN(dropoffLat) || isNaN(dropoffLng)) {
      setError("Coordonnées GPS invalides. Veuillez cliquer sur la carte ou saisir des chiffres.");
      setLoading(false);
      return;
    }

    const payload: CreateTransportOrderDTO = {
      producerId: formData.get("producerId") as string,
      pickupLocation: {
        latitude: pickupLat,
        longitude: pickupLng,
      },
      dropoffLocation: {
        latitude: dropoffLat,
        longitude: dropoffLng,
      },
      status: "PENDING",
    };

    try {
      const result = await dispatchTruck(payload);

      if (result?.error) {
        setError(result.error);
      } else {
        // Succès
        alert("Ordre de transport créé avec succès !");
      }
    } catch (err) {
      setError("Une erreur technique est survenue lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* COLONNE GAUCHE : FORMULAIRE */}
      <div className="flex flex-col h-full">
        <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#009A44]/10 p-2 rounded-xl">
              <Package className="w-5 h-5 text-[#009A44]" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Détails de la Commande
            </h2>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 font-medium rounded-2xl shadow-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Sélection du Producteur */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
              Producteur Émetteur
            </label>
            <select 
              name="producerId" 
              required 
              className="w-full p-4 border-none rounded-2xl focus:ring-2 focus:ring-[#009A44]/20 bg-white font-bold text-slate-900 shadow-sm outline-none cursor-pointer appearance-none"
            >
              <option value="" className="text-slate-400">Choisir un producteur...</option>
              {producers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user.firstName} {p.user.lastName} ({p.user.phoneNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
            {/* COORDINATES: PICKUP */}
            <div className="space-y-4 p-5 bg-orange-50 rounded-3xl border border-orange-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <MapPin className="w-16 h-16 text-[#FF8200]" />
              </div>
              <h3 className="text-[10px] font-black text-[#FF8200] uppercase tracking-widest flex items-center gap-2 relative z-10">
                <MapPin className="w-4 h-4" /> Collecte
              </h3>
              <div className="space-y-3 relative z-10">
                <div>
                  <label className="text-[10px] font-bold text-orange-800 uppercase pl-1">Latitude</label>
                  <input 
                    name="pickupLat" type="number" step="any" value={pickup?.lat ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setPickup(prev => prev ? { ...prev, lat: val } : { lat: val, lng: 0 });
                    }}
                    required 
                    className="w-full p-3 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-orange-200 outline-none shadow-sm transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-orange-800 uppercase pl-1">Longitude</label>
                  <input 
                    name="pickupLong" type="number" step="any" value={pickup?.lng ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setPickup(prev => prev ? { ...prev, lng: val } : { lat: 0, lng: val });
                    }}
                    required 
                    className="w-full p-3 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-orange-200 outline-none shadow-sm transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* COORDINATES: DROPOFF */}
            <div className="space-y-4 p-5 bg-blue-50 rounded-3xl border border-blue-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Navigation className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 relative z-10">
                <Navigation className="w-4 h-4" /> Livraison
              </h3>
              <div className="space-y-3 relative z-10">
                <div>
                  <label className="text-[10px] font-bold text-blue-800 uppercase pl-1">Latitude</label>
                  <input 
                    name="dropoffLat" type="number" step="any" value={dropoff?.lat ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDropoff(prev => prev ? { ...prev, lat: val } : { lat: val, lng: 0 });
                    }}
                    required 
                    className="w-full p-3 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-800 uppercase pl-1">Longitude</label>
                  <input 
                    name="dropoffLong" type="number" step="any" value={dropoff?.lng ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDropoff(prev => prev ? { ...prev, lng: val } : { lat: 0, lng: val });
                    }}
                    required 
                    className="w-full p-3 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-200 outline-none shadow-sm transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 mt-auto ${
              loading 
                ? "bg-slate-400 cursor-not-allowed shadow-none" 
                : "bg-[#0f172a] hover:bg-slate-800 shadow-slate-900/20 active:scale-95"
            }`}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> SYNCHRONISATION...</>
            ) : (
              <><Send className="w-5 h-5" /> LANCER L'ORDRE DE TRANSPORT</>
            )}
          </button>
        </form>
      </div>

      {/* COLONNE DROITE : CARTE */}
      <div className="flex flex-col h-full bg-slate-50 p-2 md:p-3 rounded-[2.5rem] border border-slate-100 relative min-h-[500px]">
        
        {/* En-tête de carte intégré */}
        <div className="absolute top-6 left-6 right-6 z-10 pointer-events-none flex justify-between items-start gap-4">
           <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="bg-slate-100 p-2 rounded-lg">
                <MapIcon className="w-5 h-5 text-slate-600" />
             </div>
             <div>
               <p className="text-sm font-black text-slate-900 leading-none">Positionnement GPS</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Cliquez pour définir les points</p>
             </div>
           </div>
        </div>
        
        {/* Le composant Carte */}
        <div className="flex-grow w-full h-full rounded-[2rem] overflow-hidden shadow-inner border border-slate-200/50">
          <LogisticsMap 
            onLocationSelect={handleLocationSelect}
            pickup={pickup}
            dropoff={dropoff}
          />
        </div>

        {/* Légendes en bas */}
        <div className="mt-3 grid grid-cols-2 gap-3 px-2 pb-2">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
            <span className="w-3 h-3 bg-[#FF8200] rounded-full shadow-inner"></span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Collecte définie</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
            <span className="w-3 h-3 bg-[#009A44] rounded-full shadow-inner"></span>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Magasin défini</span>
          </div>
        </div>
      </div>
    </div>
  );
}
