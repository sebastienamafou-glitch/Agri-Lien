"use client";

import { useRouter } from "next/navigation";
import { executeWithOfflineFallback } from "@/lib/offlineHelper";
import { createHarvest } from "@/app/actions/harvests/harvest";
import { db } from "@/lib/db";
import { Scale, MapPin, Save } from "lucide-react";

export default function HarvestForm({ plots, producerId }: { plots: any[], producerId: string }) {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const quantity = parseFloat(formData.get("quantity") as string);
    const farmPlotId = formData.get("farmPlotId") as string;
    const cropType = formData.get("cropType") as string;

    await executeWithOfflineFallback(
      "Déclaration de récolte",
      
      // 1. EN LIGNE
      async () => {
        await createHarvest(formData);
        router.push("/producer/scan");
      },
      
      // 2. HORS-LIGNE
      async () => {
        await db.harvests.add({
          producerId: producerId,
          farmPlotId: farmPlotId,
          quantity: quantity,
          cropType: cropType,
          unit: "KG", // ✅ CORRECTION : Une seule valeur valide (Enum)
          scannedAt: new Date(),
          isSynced: 0
        });
        router.push("/producer/scan");
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. CHOIX DE LA CULTURE (5 FILIÈRES) */}
      <div className="bg-white p-1 rounded-3xl shadow-sm border border-slate-100">
        <div className="p-4 pb-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Type de Culture
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 pt-0">
          
          {/* CACAO (Vert) */}
          <label className="cursor-pointer group">
            <input type="radio" name="cropType" value="CACAO" defaultChecked className="peer sr-only" />
            <div className="flex flex-col items-center justify-center py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-[#009A44] peer-checked:bg-green-50 peer-checked:text-[#009A44] transition-all group-active:scale-95">
              <span className="font-black">CACAO</span>
            </div>
          </label>

          {/* HÉVÉA (Orange) */}
          <label className="cursor-pointer group">
            <input type="radio" name="cropType" value="HEVEA" className="peer sr-only" />
            <div className="flex flex-col items-center justify-center py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-[#FF8200] peer-checked:bg-orange-50 peer-checked:text-[#FF8200] transition-all group-active:scale-95">
              <span className="font-black">HÉVÉA</span>
            </div>
          </label>

          {/* ANACARDE (Jaune) */}
          <label className="cursor-pointer group">
            <input type="radio" name="cropType" value="ANACARDE" className="peer sr-only" />
            <div className="flex flex-col items-center justify-center py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-yellow-500 peer-checked:bg-yellow-50 peer-checked:text-yellow-600 transition-all group-active:scale-95">
              <span className="font-black">ANACARDE</span>
            </div>
          </label>

          {/* RIZ (Bleu Ciel) */}
          <label className="cursor-pointer group">
            <input type="radio" name="cropType" value="RIZ" className="peer sr-only" />
            <div className="flex flex-col items-center justify-center py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-600 transition-all group-active:scale-95">
              <span className="font-black">RIZ</span>
            </div>
          </label>

          {/* MANIOC (Marron/Pierre) */}
          <label className="cursor-pointer group col-span-2">
            <input type="radio" name="cropType" value="MANIOC" className="peer sr-only" />
            <div className="flex flex-col items-center justify-center py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-stone-500 peer-checked:bg-stone-50 peer-checked:text-stone-600 transition-all group-active:scale-95">
              <span className="font-black">MANIOC</span>
            </div>
          </label>

        </div>
      </div>

      {/* 2. CHOIX DE LA PARCELLE */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-[#009A44]" /> Parcelle d'origine
        </label>
        {plots.length > 0 ? (
          <div className="relative mt-2">
            <select name="farmPlotId" required className="w-full appearance-none bg-slate-50 border-2 border-slate-100 text-slate-900 text-base font-bold rounded-2xl p-4 pr-12 focus:ring-4 focus:ring-green-500/10 focus:border-[#009A44] outline-none transition-all">
              {plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.name} ({plot.areaHectares} Ha)
                </option>
              ))}
            </select>
            {/* Petite flèche personnalisée en CSS si besoin, sinon le navigateur gère */}
          </div>
        ) : (
          <div className="text-center p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 mt-2">
            Aucune parcelle trouvée.
          </div>
        )}
      </div>

      {/* 3. POIDS / QUANTITÉ */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Scale size={16} className="text-blue-500" /> Poids Total
        </label>
        <div className="relative mt-2">
          <input type="number" name="quantity" placeholder="Ex: 450" step="0.1" min="1" required className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-3xl font-black rounded-2xl p-4 pl-5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none placeholder-slate-300 transition-all"/>
          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
            <span className="text-slate-400 font-black text-lg">Kg</span>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full p-5 mt-4 bg-[#0f172a] hover:bg-[#009A44] text-white font-black text-base uppercase tracking-widest rounded-3xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 group">
        Créer et Scanner
        <div className="bg-white/20 p-1.5 rounded-full group-hover:translate-x-1 transition-transform">
          <Save className="w-5 h-5" />
        </div>
      </button>
    </form>
  );
}
