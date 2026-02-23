import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Map, Sprout, TrendingUp, Navigation, Leaf, Wheat } from "lucide-react";

// Helper pour les couleurs et labels selon la culture
const getCropStyle = (type: string) => {
  switch (type) {
    case 'CACAO': return { color: 'text-[#009A44]', bg: 'bg-green-50', border: 'bg-[#009A44]', label: 'Cacao' };
    case 'HEVEA': return { color: 'text-[#FF8200]', bg: 'bg-orange-50', border: 'bg-[#FF8200]', label: 'Hévéa' };
    case 'ANACARDE': return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'bg-yellow-500', label: 'Anacarde' };
    case 'RIZ': return { color: 'text-sky-600', bg: 'bg-sky-50', border: 'bg-sky-500', label: 'Riz' };
    case 'MANIOC': return { color: 'text-stone-600', bg: 'bg-stone-50', border: 'bg-stone-500', label: 'Manioc' };
    default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'bg-slate-500', label: type };
  }
};

export default async function ProducerPlotsPage() {
  // 1. Récupération sécurisée
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const producer = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    include: {
      producerProfile: {
        include: { farmPlots: true }
      }
    }
  });

  if (!producer?.producerProfile) return <div>Profil introuvable</div>;

  const plots = producer.producerProfile.farmPlots;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      
      {/* HEADER AVEC BOUTON AJOUTER */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/producer/dashboard" className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Mes Parcelles</h1>
        </div>
        {/* BOUTON D'AJOUT */}
        <Link href="/producer/plots/new" className="flex items-center gap-2 bg-[#009A44] text-white px-4 py-2 rounded-full font-bold text-sm shadow-md hover:bg-green-700 transition">
          <span>+ Ajouter</span>
        </Link>
      </div>

      <main className="p-4 space-y-6">
        
        {/* RÉSUMÉ */}
        <div className="bg-[#009A44] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <h2 className="text-sm font-medium opacity-90 mb-1">Surface Totale Certifiée</h2>
          <p className="text-4xl font-black">
            {plots.reduce((acc, p) => acc + p.areaHectares, 0).toFixed(1)} <span className="text-lg font-medium">Ha</span>
          </p>
          <div className="mt-4 flex gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg text-xs font-bold">
              <Map size={12} /> {plots.length} polygones
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg text-xs font-bold">
              <Navigation size={12} /> GPS Actif
            </span>
          </div>
        </div>

        {/* LISTE DES PARCELLES */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 px-1">Détails des exploitations</h3>
          
          {plots.length > 0 ? plots.map((plot) => {
            const style = getCropStyle(plot.cropType);
            
            return (
              <div key={plot.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition">
                {/* Petite barre latérale de couleur dynamique */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.border}`}></div>
                
                <div className="flex justify-between items-start mb-4 pl-2">
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{plot.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">ID: {plot.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div className={`${style.bg} ${style.color} p-2 rounded-lg flex items-center gap-1 font-black text-xs uppercase tracking-wide`}>
                    <Sprout size={16} /> {style.label}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pl-2 border-t border-slate-50 pt-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Superficie</p>
                    <p className="text-xl font-black text-slate-800">{plot.areaHectares} <span className="text-sm text-slate-400">Ha</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                      <TrendingUp size={10} /> Rendement Est.
                    </p>
                    <p className="text-xl font-black text-slate-800">{plot.estimatedYield ?? 0} <span className="text-sm text-slate-400">T</span></p>
                  </div>
                </div>
                
                {/* Bouton Voir sur la carte */}
                <button className="w-full mt-4 py-2 bg-slate-50 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-2">
                  <Map size={16} />
                  Voir le tracé GPS
                </button>
              </div>
            );
          }) : (
            <div className="text-center p-8 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <p>Aucune parcelle enregistrée.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
