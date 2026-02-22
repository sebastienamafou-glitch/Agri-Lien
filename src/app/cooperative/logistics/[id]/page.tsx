import prisma from "@/lib/prisma"; // ✅ CORRECTION : Singleton
import { notFound } from "next/navigation";
import Link from "next/link";
import LogisticsMapDetail from "@/components/logistics/LogisticsMapDetail";
import TransporterMatchingList from "@/components/logistics/TransporterMatchingList";
import { ArrowLeft, MapPin, Truck, User, Clock, CheckCircle2, Navigation } from "lucide-react";

export default async function TransportOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const order = await prisma.transportOrder.findUnique({
    where: { id },
    include: {
      producer: { include: { user: true } },
      transporter: { include: { user: true } },
    },
  });

  if (!order) notFound();

  // Extraction PostGIS sécurisée
  const coords: any[] = await prisma.$queryRaw`
    SELECT 
      ST_Y("pickupLocation"::geometry) as pickup_lat, 
      ST_X("pickupLocation"::geometry) as pickup_lng,
      ST_Y("dropoffLocation"::geometry) as dropoff_lat, 
      ST_X("dropoffLocation"::geometry) as dropoff_lng
    FROM "TransportOrder"
    WHERE id = ${id}
  `;

  const loc = coords[0];
  const pickup = { lat: loc.pickup_lat, lng: loc.pickup_lng };
  const dropoff = { lat: loc.dropoff_lat, lng: loc.dropoff_lng };

  return (
    <div className="p-6 md:p-8 min-h-screen animate-in fade-in duration-500 font-sans bg-slate-50">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/logistics" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Ordre <span className="text-slate-400">#{order.id.slice(0, 8)}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date(order.requestedAt).toLocaleDateString('fr-FR')} à {new Date(order.requestedAt).toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
        
        {/* BADGE STATUT DYNAMIQUE */}
        <div className={`px-4 py-2.5 rounded-xl border text-sm font-black uppercase tracking-wider shadow-sm flex items-center gap-2 ${
          order.status === 'PENDING' ? 'bg-orange-50 text-[#FF8200] border-orange-200' :
          order.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-200' :
          'bg-green-50 text-[#009A44] border-green-200'
        }`}>
          {order.status === 'PENDING' && <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF8200]"></span></span>}
          {order.status === 'IN_PROGRESS' && <Navigation className="w-4 h-4" />}
          {order.status === 'COMPLETED' && <CheckCircle2 className="w-4 h-4" />}
          {order.status === 'PENDING' ? 'En attente' : order.status === 'IN_PROGRESS' ? 'En route' : order.status}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : INFOS */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Carte Producteur */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Émetteur
            </h2>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-50 border border-green-100 text-[#009A44] rounded-full flex items-center justify-center font-black text-xl shadow-inner">
                {order.producer.user.firstName[0]}{order.producer.user.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 leading-tight">
                  {order.producer.user.firstName} {order.producer.user.lastName}
                </p>
                <p className="text-sm text-slate-500 font-mono mt-0.5">{order.producer.user.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Itinéraire */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Parcours PostGIS
            </h2>
            <div className="space-y-8 relative ml-2">
              {/* Ligne pointillée décorative */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 border-dashed border-l-2"></div>
              
              <div className="relative flex items-start gap-4">
                <div className="z-10 bg-[#FF8200] h-8 w-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white text-xs font-black">A</div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Collecte (Bord Champ)</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{pickup.lat.toFixed(5)}, {pickup.lng.toFixed(5)}</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="z-10 bg-[#009A44] h-8 w-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white text-xs font-black">B</div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Livraison (Magasin)</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{dropoff.lat.toFixed(5)}, {dropoff.lng.toFixed(5)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Moteur de Matching / Transporteur Assigné */}
          {/* ✅ LA BEST PRACTICE : On vérifie l'objet entier, pas juste son ID */}
          {!order.transporter ? (
            <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-orange-200 shadow-sm">
               {/* Ce composant client affiche la liste des transporteurs dispos */}
              <TransporterMatchingList orderId={order.id} />
            </div>
          ) : (
            <div className="bg-[#0f172a] p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                <Truck className="w-4 h-4" /> Transporteur Assigné
              </h2>
              
              <div className="relative z-10">
                {/* TypeScript ne râlera plus ici car il SAIT que transporter existe ! */}
                <p className="text-2xl font-black">{order.transporter.user.firstName} {order.transporter.user.lastName}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    Capacité: <strong className="text-white">{order.transporter.capacity} {order.transporter.unit.toLowerCase()}</strong>
                  </span>
                  <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Vérifié
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE : CARTE INTERACTIVE */}
        <div className="xl:col-span-2 bg-slate-200 border border-slate-200 rounded-3xl overflow-hidden shadow-sm min-h-[400px] xl:h-[calc(100vh-12rem)] relative">
          <LogisticsMapDetail pickup={pickup} dropoff={dropoff} />
        </div>
        
      </div>
    </div>
  );
}
