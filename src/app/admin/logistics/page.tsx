import prisma from "@/lib/prisma";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sprout
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLogisticsPage() {
  // Récupération de tous les ordres de transport avec les acteurs impliqués
  const orders = await prisma.transportOrder.findMany({
    orderBy: { requestedAt: 'desc' },
    include: {
      producer: { include: { user: true } },
      transporter: { include: { user: true } }
    }
  });

  const activeOrders = orders.filter(o => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');

  // Utilitaire pour les badges de statut
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': 
        return { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock, label: 'En attente' };
      case 'ACCEPTED': 
        return { color: 'bg-orange-50 text-[#FF8200] border-orange-200', icon: AlertCircle, label: 'Assigné' };
      case 'IN_PROGRESS': 
        return { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Navigation, label: 'En transit' };
      case 'COMPLETED': 
        return { color: 'bg-green-50 text-[#009A44] border-green-200', icon: CheckCircle2, label: 'Livré' };
      case 'CANCELLED': 
        return { color: 'bg-red-50 text-red-600 border-red-200', icon: AlertCircle, label: 'Annulé' };
      default: 
        return { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: Clock, label: status };
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-[#FF8200]" /> Tour de Contrôle
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Supervision du fret et des expéditions en temps réel.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex flex-col items-center shadow-sm">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">En transit</span>
            <span className="text-blue-600 text-lg">{activeOrders.length}</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold flex flex-col items-center shadow-sm">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Livrées</span>
            <span className="text-[#009A44] text-lg">{completedOrders.length}</span>
          </div>
        </div>
      </div>

      {/* LISTE DES MISSIONS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide text-sm">
            <MapPin className="w-4 h-4 text-slate-400" /> Missions Logistiques
          </h2>
          <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#009A44]" /> Traceabilité EUDR
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {orders.length === 0 ? (
            <div className="p-10 text-center text-slate-400 font-medium">
              <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              Aucune mission de transport enregistrée.
            </div>
          ) : (
            orders.map((order) => {
              const Badge = getStatusBadge(order.status);
              const BadgeIcon = Badge.icon;

              return (
                <div key={order.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* INFOS MISSION & PRODUCTEUR */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${Badge.color}`}>
                          <BadgeIcon className="w-3 h-3" /> {Badge.label}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          ID: {order.id.slice(0,8)}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">
                        Collecte chez {order.producer.user.lastName} {order.producer.user.firstName}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Demandé le {new Date(order.requestedAt).toLocaleDateString('fr-FR')} à {new Date(order.requestedAt).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>

                    {/* TRAJET (Visuel) */}
                    <div className="flex-1 flex items-center justify-center gap-4 text-slate-400 opacity-70 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white">
                          <Sprout className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Bord Champ</span>
                      </div>
                      
                      <div className="flex-1 h-0.5 border-t-2 border-dashed border-slate-200 relative">
                        <ArrowRight className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 bg-white" />
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Magasin</span>
                      </div>
                    </div>

                    {/* TRANSPORTEUR ASSIGNÉ */}
                    <div className="flex-1 flex lg:justify-end">
                      {order.transporter ? (
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-3 min-w-[200px]">
                          <div className="w-10 h-10 bg-orange-50 text-[#FF8200] rounded-full flex items-center justify-center font-black uppercase border border-orange-100">
                            {order.transporter.user.firstName[0]}{order.transporter.user.lastName[0]}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transporteur</p>
                            <p className="text-sm font-bold text-slate-900">
                              {order.transporter.user.firstName} {order.transporter.user.lastName}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-200 p-3 rounded-2xl flex items-center gap-3 min-w-[200px] opacity-70">
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En attente</p>
                            <p className="text-sm font-bold text-slate-500">Aucun assigné</p>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
