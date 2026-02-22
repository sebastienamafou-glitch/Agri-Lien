import prisma from "@/lib/prisma";
import { payProducer } from "@/app/actions/finance/payProducer";
import { 
  Banknote, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  Package,
  Send
} from "lucide-react";

// Note : Pour l'affichage UI, on garde ce prix fixe comme base de calcul visuelle. 
// Le backend (payProducer) recalculera de toute façon avec le vrai prix dynamique de la DB.
const PRICE_PER_KG = 1000;

export default async function FinancePage() {
  // 1. Récupérer toutes les récoltes avec leurs lots livrés
  const harvests = await prisma.harvest.findMany({
    where: {
      // ✅ CORRECTION : Utilisation de batches au lieu de batches
      batches: { some: { status: "DELIVERED" } }
    },
    include: {
      producer: { include: { user: true } },
      // ✅ CORRECTION : On inclut les batches
      batches: { where: { status: "DELIVERED" } } 
    },
    orderBy: { declaredAt: "desc" }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-[#0f172a] p-2 rounded-xl text-white shadow-sm">
              <Banknote className="w-6 h-6" />
            </div>
            Finance & Paiements
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Règlements producteurs (Prix ref: <strong className="text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md">{PRICE_PER_KG} FCFA/unité</strong>)
          </p>
        </div>
        
        {/* CARTE SOLDE COOPÉRATIVE */}
        <div className="bg-gradient-to-br from-[#009A44] to-green-700 text-white px-8 py-4 rounded-3xl shadow-xl shadow-green-900/20 flex items-center gap-5 border border-green-600">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-green-100 mb-1">Solde Coopérative</p>
             <p className="text-3xl font-black tracking-tight leading-none">
               25.000.000 <span className="text-sm font-bold text-green-200">FCFA</span>
             </p>
          </div>
        </div>
      </div>

      {/* LISTE DES PAIEMENTS */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
           <Banknote className="w-5 h-5 text-[#FF8200]" />
           <h3 className="font-black text-slate-900 text-sm tracking-wide">ORDRES DE PAIEMENT</h3>
        </div>

        {harvests.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-bold text-lg text-slate-500">Aucun lot en attente.</p>
            <p className="text-sm">Veuillez réceptionner des lots au magasin pour initier un paiement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-6">Producteur</th>
                  <th className="p-6 text-right">Quantité Validée</th>
                  <th className="p-6 text-right">Montant estimé (FCFA)</th>
                  <th className="p-6 text-center">Action / Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {harvests.map((harvest) => {
                  // ✅ CORRECTION : batches et quantity
                  const verifiedQuantity = harvest.batches.reduce((acc, batch) => acc + batch.quantity, 0);
                  const amount = verifiedQuantity * PRICE_PER_KG;
                  const isPaid = harvest.status === "VALIDATED";
                  
                  return (
                    <tr key={harvest.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-6">
                        <div className="font-black text-slate-900 text-sm">
                          {harvest.producer.user.lastName} {harvest.producer.user.firstName}
                        </div>
                        <div className="text-xs font-bold text-slate-400 mt-1">
                          {harvest.producer.user.phoneNumber}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <span className="inline-flex items-center justify-end gap-1.5 font-bold text-slate-700">
                          <Package className="w-4 h-4 text-slate-400" /> 
                          {verifiedQuantity} {harvest.cropType === "HEVEA" ? "L" : "kg"}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <span className="text-lg font-black text-[#009A44]">
                          {new Intl.NumberFormat('fr-CI').format(amount)}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            PAYÉ
                          </span>
                        ) : (
                          <form 
                            action={async (formData) => {
                              "use server";
                              await payProducer(formData);
      }} 
                            className="flex justify-center"
 >
                            <input type="hidden" name="harvestId" value={harvest.id} />
                            
                            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm group-hover:border-orange-300 transition-colors">
                              <select 
                                name="provider" 
                                className="pl-3 pr-8 py-2 text-xs font-black text-slate-700 border-none bg-transparent focus:ring-0 cursor-pointer outline-none appearance-none"
                              >
                                <option value="ORANGE">Orange Money</option>
                                <option value="MTN">MTN MoMo</option>
                                <option value="WAVE">Wave</option>
                              </select>
                              <button 
                                type="submit"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] hover:bg-[#FF8200] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-95"
                              >
                                Payer <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 p-5 bg-orange-50 border border-orange-100 rounded-3xl text-sm">
        <AlertCircle className="w-5 h-5 text-[#FF8200] shrink-0 mt-0.5" />
        <p className="text-orange-900 leading-relaxed">
          <strong className="font-black text-[#FF8200]">Simulation Mobile Money :</strong> Le clic sur "Payer" valide la transaction avec le prix dynamique du jour, sécurise l'enregistrement, et augmente instantanément le <strong>Score Agricole</strong> du producteur.
        </p>
      </div>

    </div>
  );
}
