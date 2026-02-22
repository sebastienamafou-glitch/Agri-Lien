import { ArrowLeft, MapPin, Ruler, TrendingUp, Save } from "lucide-react";
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

      <main className="p-4 max-w-lg mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <MapPin size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Ajouter une terre</h2>
          </div>
          <p className="text-slate-500 text-sm">
            Enregistrez une nouvelle exploitation pour augmenter votre surface certifiée.
          </p>
        </div>

        <form action={createPlot} className="space-y-6">
          
          {/* 1. NOM */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Nom de la parcelle
            </label>
            <input 
              type="text" 
              name="name" 
              placeholder="Ex: Campement Nord" 
              required
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-bold rounded-xl p-4 focus:ring-2 focus:ring-[#009A44] focus:border-transparent outline-none"
            />
          </div>

          {/* 2. SURFACE & RENDEMENT */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Ruler size={14} /> Surface
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="area" 
                  placeholder="0.0" 
                  step="0.1"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xl font-black rounded-xl p-3 focus:ring-2 focus:ring-[#009A44] outline-none"
                />
                <span className="absolute right-3 top-4 text-xs font-bold text-slate-400">Ha</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp size={14} /> Rendement
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="yield" 
                  placeholder="0" 
                  step="0.1"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xl font-black rounded-xl p-3 focus:ring-2 focus:ring-[#009A44] outline-none"
                />
                <span className="absolute right-3 top-4 text-xs font-bold text-slate-400">T</span>
              </div>
            </div>
          </div>

          {/* INFO GPS */}
          <div className="p-4 bg-blue-50 rounded-xl flex gap-3 items-start">
            <MapPin className="text-blue-600 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Note :</strong> Le tracé GPS précis devra être effectué par un agent de la coopérative pour valider la conformité EUDR.
            </p>
          </div>

          {/* BOUTON */}
          <button 
            type="submit" 
            className="w-full py-4 bg-[#009A44] hover:bg-green-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-900/20 transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-6 h-6" />
            Enregistrer la Parcelle
          </button>

        </form>
      </main>
    </div>
  );
}
