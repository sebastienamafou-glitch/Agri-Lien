import { ArrowLeft, MapPin, Ruler, TrendingUp, Save, Sprout } from "lucide-react";
import Link from "next/link";
import { createPlot } from "@/app/actions/producers/plots";

export default function NewPlotPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      
      {/* HEADER */}
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <Link href="/producer/plots" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Nouvelle Parcelle</h1>
      </div>

      <main className="p-4 max-w-lg mx-auto space-y-6">
        <div className="mb-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-full text-[#009A44]">
              <MapPin size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Ajouter une terre</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Enregistrez une nouvelle exploitation pour augmenter votre surface certifiée.
          </p>
        </div>

        <form action={createPlot} className="space-y-6">
          
          {/* 1. NOM DE LA PARCELLE */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              Nom de la parcelle
            </label>
            <input 
              type="text" 
              name="name" 
              placeholder="Ex: Campement Nord" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 font-bold rounded-2xl p-4 focus:ring-4 focus:ring-green-500/10 focus:border-[#009A44] outline-none transition-all"
            />
          </div>

          {/* 2. TYPE DE CULTURE (AJOUTÉ ✅) */}
          <div className="bg-white p-1 rounded-3xl shadow-sm border border-slate-100">
            <div className="p-4 pb-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sprout size={14} className="text-[#009A44]" /> Type de Culture
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2 pt-0">
              {/* CACAO */}
              <label className="cursor-pointer group">
                <input type="radio" name="cropType" value="CACAO" defaultChecked className="peer sr-only" />
                <div className="flex flex-col items-center justify-center py-3 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-[#009A44] peer-checked:bg-green-50 peer-checked:text-[#009A44] transition-all">
                  <span className="font-black text-xs">CACAO</span>
                </div>
              </label>

              {/* HÉVÉA */}
              <label className="cursor-pointer group">
                <input type="radio" name="cropType" value="HEVEA" className="peer sr-only" />
                <div className="flex flex-col items-center justify-center py-3 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-[#FF8200] peer-checked:bg-orange-50 peer-checked:text-[#FF8200] transition-all">
                  <span className="font-black text-xs">HÉVÉA</span>
                </div>
              </label>

              {/* ANACARDE */}
              <label className="cursor-pointer group">
                <input type="radio" name="cropType" value="ANACARDE" className="peer sr-only" />
                <div className="flex flex-col items-center justify-center py-3 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-yellow-500 peer-checked:bg-yellow-50 peer-checked:text-yellow-600 transition-all">
                  <span className="font-black text-xs">ANACARDE</span>
                </div>
              </label>

              {/* RIZ */}
              <label className="cursor-pointer group">
                <input type="radio" name="cropType" value="RIZ" className="peer sr-only" />
                <div className="flex flex-col items-center justify-center py-3 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-sky-500 peer-checked:bg-sky-50 peer-checked:text-sky-600 transition-all">
                  <span className="font-black text-xs">RIZ</span>
                </div>
              </label>

              {/* MANIOC */}
              <label className="cursor-pointer group col-span-2">
                <input type="radio" name="cropType" value="MANIOC" className="peer sr-only" />
                <div className="flex flex-col items-center justify-center py-3 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 peer-checked:border-stone-500 peer-checked:bg-stone-50 peer-checked:text-stone-600 transition-all">
                  <span className="font-black text-xs">MANIOC</span>
                </div>
              </label>
            </div>
          </div>

          {/* 3. SURFACE & RENDEMENT */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Ruler size={14} className="text-blue-500" /> Surface
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="area" 
                  placeholder="0.0" 
                  step="0.1"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-xl font-black rounded-2xl p-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                />
                <span className="absolute right-3 top-4 text-xs font-bold text-slate-400">Ha</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp size={14} className="text-purple-500" /> Rendement
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="yield" 
                  placeholder="0" 
                  step="0.1"
                  className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-xl font-black rounded-2xl p-3 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all"
                />
                <span className="absolute right-3 top-4 text-xs font-bold text-slate-400">T</span>
              </div>
            </div>
          </div>

          {/* INFO GPS */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 items-start">
            <MapPin className="text-blue-600 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              <strong>Note :</strong> Le tracé GPS précis devra être effectué par un agent de la coopérative pour valider la conformité EUDR.
            </p>
          </div>

          {/* BOUTON */}
          <button 
            type="submit" 
            className="w-full py-5 bg-[#0f172a] hover:bg-[#009A44] text-white font-black text-base uppercase tracking-widest rounded-3xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Save className="w-5 h-5" />
            Enregistrer la Parcelle
          </button>

        </form>
      </main>
    </div>
  );
}
