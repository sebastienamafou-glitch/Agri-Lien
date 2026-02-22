import prisma from "@/lib/prisma";
import { 
  Package, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  Truck
} from "lucide-react";

export default async function TraceabilityPage() {
  
  const harvests = await prisma.harvest.findMany({
    where: { 
      status: "DECLARED" 
    },
    include: {
      producer: { 
        include: { user: true } 
      },
      farmPlot: true, 
      // ✅ CORRECTION 1 : batches au lieu de cocoaBags
      batches: true, 
    },
    orderBy: { declaredAt: "desc" }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900">Traçabilité & Export</h1>
        <p className="text-slate-500 mt-1">
          Suivi des lots RDUE (Règlement Déforestation Union Européenne).
        </p>
      </div>

      <div className="grid gap-6">
        {harvests.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune récolte déclarée pour le moment.</p>
          </div>
        ) : (
          harvests.map((harvest) => {
            // ✅ CORRECTION 2 : quantity au lieu de weightKg
            const scannedVolume = harvest.batches.reduce((acc, batch) => acc + batch.quantity, 0);
            const batchCount = harvest.batches.length;
            // ✅ CORRECTION 3 : Utilisation de harvest.quantity au lieu de weightEstim
            const progress = harvest.quantity > 0 ? Math.min((scannedVolume / harvest.quantity) * 100, 100) : 0;

            return (
              <div key={harvest.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#FF8200] font-black shadow-sm text-lg">
                        {harvest.producer.user.lastName[0]}
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          {harvest.producer.user.lastName} {harvest.producer.user.firstName}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(harvest.declaredAt).toLocaleDateString('fr-CI')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {harvest.farmPlot.name}
                          </span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="text-right">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Volume Déclaré</p>
                     <p className="text-2xl font-black text-slate-900">
                        {/* ✅ CORRECTION 4 : Unité dynamique */}
                        {harvest.quantity} <span className="text-sm text-slate-500 uppercase">{harvest.unit.toLowerCase()}</span>
                     </p>
                  </div>
                </div>

                <div className="p-6 grid lg:grid-cols-3 gap-8">
                  
                  <div className="lg:col-span-1 space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-slate-700">Conditionnement</span>
                        <span className="text-[#009A44]">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-[#009A44] h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                         {/* ✅ CORRECTION 5 : Vocabulaire agnostique */}
                        {scannedVolume} {harvest.unit.toLowerCase()} scannés sur {harvest.quantity} {harvest.unit.toLowerCase()} attendus.
                      </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                      <h4 className="font-bold text-[#FF8200] text-sm mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Statut Logistique
                      </h4>
                      <p className="text-sm text-orange-900">
                         {/* ✅ CORRECTION 6 : Vocabulaire "lots" */}
                        {batchCount} lots identifiés par QR Code.
                        <br/>
                        En attente de réception au magasin central.
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 border-l border-slate-100 pl-0 lg:pl-8">
                     <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-slate-400" />
                        Détail des Lots ({batchCount})
                     </h4>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {harvest.batches.map((batch) => (
                           <div key={batch.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl text-sm hover:border-[#FF8200] transition-colors group">
                              <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${batch.status === 'DELIVERED' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                                <span className="font-mono font-bold text-slate-700 group-hover:text-[#FF8200]">
                                  {batch.qrCode}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {/* ✅ CORRECTION 7 : quantity et unit */}
                                <span className="font-bold text-slate-900 uppercase text-xs">{batch.quantity} {batch.unit.toLowerCase()}</span>
                                {batch.status === 'DELIVERED' && (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                           </div>
                        ))}
                        
                        {harvest.batches.length === 0 && (
                          <div className="col-span-full text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-sm">Le producteur n'a encore scanné aucun lot.</p>
                          </div>
                        )}
                     </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
