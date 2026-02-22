"use client";

import { useState, useEffect } from "react";
import { getNearbyTransporters } from "@/app/actions/logistics/matching";
// ✅ CORRECTION 1 : On importe la bonne fonction unifiée (acceptOrder)
import { acceptOrder } from "@/app/actions/logistics/logistics"; 
import { Truck, MapPin, Loader2, Navigation } from "lucide-react";

export default function TransporterMatchingList({ orderId }: { orderId: string }) {
  const [transporters, setTransporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getNearbyTransporters(orderId);
      if (result.success) setTransporters(result.transporters);
      setLoading(false);
    }
    load();
  }, [orderId]);

  const handleAssign = async (transporterId: string) => {
    if (!confirm("Voulez-vous confirmer l'assignation de ce transporteur ?")) return;

    setIsAssigning(transporterId);
    
    // ✅ CORRECTION 2 : Utilisation de acceptOrder
    const result = await acceptOrder(orderId, transporterId);

    if (result.success) {
      alert("Transporteur assigné avec succès.");
      window.location.reload(); // Force le rafraîchissement côté client pour voir le nouveau statut
    } else {
      alert(result.error || "Une erreur est survenue.");
      setIsAssigning(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center gap-3 p-8 text-slate-400 font-medium">
      <Loader2 className="w-5 h-5 animate-spin text-[#FF8200]" />
      <span className="text-sm">Recherche des transporteurs à proximité (PostGIS)...</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-orange-100">
        <h3 className="text-[10px] font-black text-orange-900 uppercase tracking-widest flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#FF8200]" />
          Suggestions de transport
        </h3>
        <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
          Rayon 50km
        </span>
      </div>
      
      {transporters.length === 0 ? (
        <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
          <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">Aucun transporteur trouvé à proximité.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {transporters.map((t) => (
            <div 
              key={t.id} 
              className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-orange-50 text-[#FF8200] rounded-full flex items-center justify-center font-black text-sm uppercase border border-orange-100">
                  {t.firstName[0]}{t.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{t.firstName} {t.lastName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#009A44]" /> {t.distance_km.toFixed(1)} KM
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      {/* ✅ CORRECTION 3 : capacity et unit GIZ */}
                      <Truck className="w-3 h-3 text-blue-500" /> {t.capacity} {t.unit || 'UNITÉS'}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleAssign(t.id)}
                disabled={isAssigning !== null}
                className={`text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                  isAssigning === t.id
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-[#0f172a] text-white hover:bg-[#FF8200] active:scale-95"
                }`}
              >
                {isAssigning === t.id ? <><Loader2 className="w-3 h-3 animate-spin"/> Assignation</> : "Assigner"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
