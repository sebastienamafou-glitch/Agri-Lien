"use client";

import { useState, useRef } from "react";
import { receiveBag } from "@/app/actions/traceability/reception"; 
import { Scale, QrCode, CheckCircle2, AlertTriangle, Package, User, MapPin, Sprout } from "lucide-react";

export default function ReceptionPage() {
  const [lastResult, setLastResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gestion de la soumission (Scan ou Entrée)
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setLastResult(null); // Reset de l'affichage précédent

    const result = await receiveBag(formData);
    
    setLastResult(result);
    setIsLoading(false);

    // UX : Si succès, on vide le champ et on remet le focus pour le sac suivant
    if (result.success && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER DE LA PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-[#FF8200] p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
              <Scale className="w-8 h-8" />
            </div>
            Réception & Pesage
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Validez l'entrée en stock par scan des sacs.
          </p>
        </div>
        
        {/* Indicateur de statut magasin (Visuel) */}
        <div className="bg-green-50 px-4 py-2 rounded-full border border-green-100 flex items-center gap-2 text-green-700 text-sm font-bold">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Magasin Connecté
        </div>
      </div>

      {/* CONSOLE DE SCAN (Zone principale) */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        {/* Fond décoratif */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-transparent rounded-full -mr-20 -mt-20 opacity-50 blur-3xl pointer-events-none"></div>

        <form action={handleSubmit} className="relative z-10 max-w-xl mx-auto">
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
            Scanner le Code QR du sac
          </label>
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <QrCode className="absolute left-4 top-4 text-slate-400 w-6 h-6 group-focus-within:text-[#FF8200] transition-colors" />
              <input 
                ref={inputRef}
                name="qrCode"
                type="text" 
                autoFocus
                autoComplete="off"
                placeholder="AGRI-BAG-..." 
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xl font-bold text-slate-900 focus:outline-none focus:border-[#FF8200] focus:ring-4 focus:ring-orange-500/10 transition-all uppercase placeholder-slate-300"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-8 py-4 bg-[#009A44] hover:bg-green-700 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 active:scale-95"
            >
              {isLoading ? "..." : "OK"}
            </button>
          </div>
          <p className="text-center text-slate-400 text-sm mt-4">
            Utilisez une douchette ou tapez le code manuellement.
          </p>
        </form>
      </div>

      {/* FEEDBACK RÉSULTAT (Apparaît après scan) */}
      {lastResult && (
        <div className={`p-6 rounded-2xl border-l-8 shadow-sm animate-in slide-in-from-top-4 ${
          lastResult.success ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${
              lastResult.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
              {lastResult.success ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-xl font-black ${
                lastResult.success ? "text-green-800" : "text-red-800"
              }`}>
                {lastResult.message}
              </h3>

              {/* Détails de la réception réussie */}
              {lastResult.success && lastResult.data && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Carte Producteur */}
                  <div className="bg-white/80 p-4 rounded-xl border border-green-100">
                    <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1 mb-2">
                      <User className="w-3 h-3" /> Producteur
                    </p>
                    <p className="font-bold text-slate-800 leading-tight">{lastResult.data.producerName}</p>
                  </div>
                  
                  {/* Carte Poids */}
                  <div className="bg-white/80 p-4 rounded-xl border border-green-100">
                    <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1 mb-2">
                      <Package className="w-3 h-3" /> Poids Validé
                    </p>
                    <p className="font-black text-slate-800 text-2xl">{lastResult.data.weight} <span className="text-sm font-medium text-slate-500">kg</span></p>
                  </div>

                  {/* Carte Origine */}
                  <div className="bg-white/80 p-4 rounded-xl border border-green-100">
                    <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" /> Origine
                    </p>
                    <p className="font-bold text-slate-800 leading-tight mb-1">{lastResult.data.plot}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-200 text-green-800 text-[10px] font-bold rounded">
                       <Sprout className="w-3 h-3" /> {lastResult.data.campaign}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
