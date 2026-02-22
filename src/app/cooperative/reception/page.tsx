import prisma from "@/lib/prisma";
import WeighingScanner from "@/components/reception/WeighingScanner";
import { Scale, PackageCheck, Clock, CheckCircle2 } from "lucide-react";

export default async function ReceptionPage() {
  // Récupérer les lots réceptionnés aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ✅ CORRECTION : productBatch au lieu de cocoaBag
  const deliveredBatches = await prisma.productBatch.findMany({
    where: { 
      status: 'DELIVERED',
      deliveredAt: { gte: today }
    },
    include: { harvest: { include: { producer: { include: { user: true } } } } },
    orderBy: { deliveredAt: 'desc' }
  });

  // ✅ CORRECTION : quantity au lieu de weightKg
  const totalVolumeToday = deliveredBatches.reduce((acc, batch) => acc + batch.quantity, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-[#0f172a] p-2 rounded-xl text-white shadow-sm">
              <Scale className="w-6 h-6" />
            </div>
            Réception & Pesage
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Point de contrôle à l'entrée du magasin coopérative.
          </p>
        </div>
        
        {/* Résumé du jour */}
        <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 flex items-center gap-4">
          <div className="bg-[#009A44] p-2.5 rounded-xl text-white">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            {/* ✅ CORRECTION : "Unités" au lieu de "Kg" pour être agnostique */}
            <p className="text-2xl font-black text-green-900 leading-none">{totalVolumeToday.toFixed(1)} <span className="text-sm">Unités</span></p>
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mt-0.5">Réceptionnés ce jour</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* COLONNE GAUCHE : LE SCANNER */}
        <div>
          <WeighingScanner />
        </div>

        {/* COLONNE DROITE : HISTORIQUE DU JOUR */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Entrées du jour ({deliveredBatches.length})
            </h3>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto max-h-[600px] space-y-3">
            {deliveredBatches.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <PackageCheck className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Aucun lot réceptionné aujourd'hui.</p>
              </div>
            ) : (
              deliveredBatches.map((batch) => (
                <div key={batch.id} className="border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-[#009A44]/30 transition-colors group">
                  <div>
                    <p className="font-black text-slate-900 text-sm">
                      {batch.harvest.producer.user.lastName} {batch.harvest.producer.user.firstName}
                    </p>
                    <p className="text-xs font-mono text-slate-400 mt-1">{batch.qrCode}</p>
                  </div>
                  <div className="text-right">
                    {/* ✅ CORRECTION : quantity et unit dynamique */}
                    <span className="bg-green-50 text-[#009A44] font-black px-3 py-1.5 rounded-lg border border-green-100 uppercase text-xs">
                      {batch.quantity} {batch.unit.toLowerCase()}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 flex items-center justify-end gap-1">
                      {new Date(batch.deliveredAt!).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
