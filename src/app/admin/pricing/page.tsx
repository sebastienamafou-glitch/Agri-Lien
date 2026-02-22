import prisma from "@/lib/prisma";
import { CropType, MeasurementUnit } from "@prisma/client";
import { updatePrice } from "@/app/actions/admin/pricing"; // ✅ Import de notre Server Action
import { 
  Landmark, 
  Sprout, 
  Save, 
  ShieldCheck,
  History
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  // 1. Récupération des prix officiels actuels
  const currentPrices = await prisma.cropPrice.findMany();
  
  // 2. Liste de toutes les filières du schéma
  const crops = Object.values(CropType);
  const units = Object.values(MeasurementUnit);

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* EN-TÊTE OFFICIEL */}
      <div className="bg-gradient-to-br from-[#0f172a] to-slate-800 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Landmark className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
             <span className="bg-[#FF8200] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> Accès Restreint
             </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Cours Officiels & Tarification</h1>
          <p className="text-slate-300 font-medium text-sm leading-relaxed">
            Fixez les prix de rachat garantis par l'État pour chaque filière. Toute modification est historisée et impacte immédiatement les valorisations en attente.
          </p>
        </div>
      </div>

      {/* GRILLE DES PRIX (Multi-crops) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {crops.map((crop) => {
          const existingData = currentPrices.find(p => p.cropType === crop);
          const currentPrice = existingData?.pricePerUnit || 0;
          const currentUnit = existingData?.unit || 'KG';
          const lastUpdate = existingData?.updatedAt;

          return (
            <div key={crop} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:border-[#009A44]/30 transition-colors group">
              
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                  <Sprout className="w-5 h-5 text-[#009A44]" />
                  {crop}
                </h2>
                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-md">
                  Taux Actuel
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-baseline gap-2 mb-6">
                  <p className="text-4xl font-black text-slate-900 tracking-tight">
                    {currentPrice > 0 ? currentPrice.toLocaleString('fr-FR') : "---"}
                  </p>
                  <p className="text-sm font-bold text-slate-400">
                    FCFA / {currentUnit}
                  </p>
                </div>

                {/* ✅ CORRECTION : Le Wrapper "use server" pour satisfaire le typage strict de React */}
                <form action={async (formData) => {
                  "use server";
                  await updatePrice(formData);
                }} className="space-y-4">
                  <input type="hidden" name="cropType" value={crop} />
                  
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input 
                        type="number" 
                        name="price"
                        step="0.01"
                        defaultValue={currentPrice > 0 ? currentPrice : ""}
                        placeholder="Nouveau prix..."
                        required
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 focus:border-[#009A44] focus:ring-2 focus:ring-[#009A44]/20 outline-none transition-all"
                      />
                    </div>
                    
                    <select 
                      name="unit" 
                      defaultValue={currentUnit}
                      className="w-24 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-700 focus:border-[#009A44] outline-none cursor-pointer"
                    >
                      {units.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#0f172a] hover:bg-[#009A44] text-white p-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" /> Mettre à jour
                  </button>
                </form>
              </div>

              {/* FOOTER AUDIT */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <History className="w-3 h-3" /> Dernière Modif.
                </span>
                <span>
                  {lastUpdate ? new Date(lastUpdate).toLocaleDateString('fr-CI') : "Jamais"}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
