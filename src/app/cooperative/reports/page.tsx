import prisma from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/infrastructure/auth/auth.config"; 

import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  PieChart, 
  FileSpreadsheet, 
  Wallet, 
  Scale,
  AlertCircle
} from "lucide-react";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // 1. Agrégation des données (Production)
  const validatedHarvests = await prisma.harvest.findMany({
    where: { status: "VALIDATED" },
    include: { producer: { include: { user: true } } }
  });

  // ✅ CORRECTION : Utilisation de quantity au lieu de quantityKg
  const totalVolume = validatedHarvests.reduce((acc, h) => acc + h.quantity, 0);
  
  // 2. Agrégation Financière
  const transactions = await prisma.transaction.findMany({
    where: { status: "SUCCESS" }
  });
  const totalPaid = transactions.reduce((acc, t) => acc + t.amount, 0);

  // 3. Calcul des "Top Producteurs"
  const producerStats = new Map<string, { name: string, volume: number, count: number }>();

  validatedHarvests.forEach(h => {
    const producerName = `${h.producer.user.lastName} ${h.producer.user.firstName}`;
    const current = producerStats.get(h.producerId) || { name: producerName, volume: 0, count: 0 };
    
    producerStats.set(h.producerId, {
      name: producerName,
      // ✅ CORRECTION : Utilisation de quantity au lieu de quantityKg
      volume: current.volume + h.quantity,
      count: current.count + 1
    });
  });

  const topProducers = Array.from(producerStats.values())
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  // 4. Stats Conformité (Traçabilité)
  // ✅ CORRECTION : productBatch au lieu de cocoaBag
  const batches = await prisma.productBatch.findMany();
  // ✅ CORRECTION : quantity au lieu de weightKg
  const totalBatchVolume = batches.reduce((acc, b) => acc + b.quantity, 0);
  const percentExportReady = totalVolume > 0 ? Math.round((totalBatchVolume / totalVolume) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-[#0f172a] p-2 rounded-xl text-white shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            Rapports & Analyses
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Bonjour {session.user?.name}, voici la consolidation globale de la campagne 2026.
          </p>
        </div>
        
        <a 
          href="/api/reports/global"
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-wider text-slate-700 hover:bg-slate-50 hover:text-[#009A44] hover:border-[#009A44]/30 shadow-sm transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          Exporter Global (CSV)
        </a>
      </div>

      {/* CARTES KPIs ANALYTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1 : Financier */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-[#009A44]/30 transition-colors">
          <div className="flex justify-between items-start mb-6">
             <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-[#009A44] group-hover:scale-110 transition-transform">
               <Wallet className="w-6 h-6" />
             </div>
             <span className="text-[10px] font-black tracking-wider text-[#009A44] bg-green-50 border border-green-100 px-3 py-1.5 rounded-full uppercase">
               +12% vs N-1
             </span>
          </div>
          <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Masse Salariale (Payée)</p>
             <h3 className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
               {new Intl.NumberFormat('fr-CI').format(totalPaid)} <span className="text-sm font-bold text-slate-400">FCFA</span>
             </h3>
          </div>
        </div>

        {/* KPI 2 : Taux de Transformation */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-blue-300 transition-colors">
          <div className="flex justify-between items-start mb-6">
             <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
               <PieChart className="w-6 h-6" />
             </div>
          </div>
          <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Traçabilité EUDR</p>
             <div className="flex items-end gap-2 mt-1">
               <h3 className="text-3xl font-black text-slate-900">{percentExportReady}%</h3>
               <p className="text-xs text-slate-500 mb-1.5 font-bold">du volume mis en lot</p>
             </div>
             <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full relative overflow-hidden" style={{ width: `${percentExportReady}%` }}>
                  <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
             </div>
          </div>
        </div>

        {/* KPI 3 : Volume Validé */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-[#FF8200]/30 transition-colors">
          <div className="flex justify-between items-start mb-6">
             <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-[#FF8200] group-hover:scale-110 transition-transform">
               <Scale className="w-6 h-6" />
             </div>
          </div>
          <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume Certifié & Acheté</p>
             <h3 className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
               {/* ✅ CORRECTION : Unités au lieu de Kg */}
               {new Intl.NumberFormat('fr-CI').format(totalVolume)} <span className="text-sm font-bold text-slate-400">Unités</span>
             </h3>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* SECTION GAUCHE : Top Producteurs */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg">
               <TrendingUp className="w-5 h-5 text-[#FF8200]" />
               Top Performers (Volume)
             </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rang</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producteur</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Apports</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topProducers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                       <Scale className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                       <p className="text-sm font-medium text-slate-400">Pas assez de données pour établir un classement.</p>
                    </td>
                  </tr>
                ) : (
                  topProducers.map((prod, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black shadow-sm ${
                          index === 0 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" : 
                          index === 1 ? "bg-slate-200 text-slate-700 border border-slate-300" :
                          index === 2 ? "bg-orange-100 text-orange-800 border border-orange-200" : 
                          "bg-slate-50 text-slate-500 border border-slate-100"
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">
                        {prod.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-slate-500">
                        {prod.count} décl.
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* ✅ CORRECTION : Unités au lieu de Kg */}
                        <span className="font-black text-[#009A44] bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                          {new Intl.NumberFormat('fr-CI').format(prod.volume)} Unités
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION DROITE : Exports Rapides */}
        <div className="space-y-6">
           <div className="bg-[#0f172a] rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
              
              <h3 className="font-black text-xl mb-2 relative z-10">Centre d'Exportation</h3>
              <p className="text-sm text-slate-400 mb-8 font-medium relative z-10">
                Générez les fichiers officiels pour l'audit EUDR et la comptabilité.
              </p>
              
              <div className="space-y-3 relative z-10">
                 <a href="/api/reports/producers" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10 group active:scale-95">
                    <div className="flex items-center gap-4">
                       <div className="bg-[#009A44]/20 p-2.5 rounded-xl border border-[#009A44]/30 text-[#009A44]">
                         <FileSpreadsheet className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-black text-white">Base Producteurs</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">CSV • Liste complète</p>
                       </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                 </a>

                 <a href="/api/reports/harvests" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10 group active:scale-95">
                    <div className="flex items-center gap-4">
                       <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30 text-blue-400">
                         <BarChart3 className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-black text-white">Journal des Récoltes</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">CSV • Détaillé</p>
                       </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                 </a>

                 <a href="/api/reports/finance" className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10 group active:scale-95">
                    <div className="flex items-center gap-4">
                       <div className="bg-[#FF8200]/20 p-2.5 rounded-xl border border-[#FF8200]/30 text-[#FF8200]">
                         <Wallet className="w-5 h-5" />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-black text-white">Relevé Financier</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">CSV • Justificatifs</p>
                       </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                 </a>
              </div>
           </div>

           <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF8200] shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-orange-900 leading-relaxed">
                <strong className="font-bold">Information :</strong> Les données sont agrégées en temps réel. Pour les rapports officiels d'audit de fin de campagne, assurez-vous que tous les paiements sont validés.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
