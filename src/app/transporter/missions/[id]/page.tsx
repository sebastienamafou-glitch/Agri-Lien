import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateOrderStatus } from "@/app/actions/logistics/logistics";
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Navigation, 
  QrCode, 
  CheckCircle2, 
  Truck,
  PhoneCall
} from "lucide-react";

export default async function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 1. Récupération de la commande
  const order = await prisma.transportOrder.findUnique({
    where: { id },
    include: {
      producer: { include: { user: true } },
    },
  });

  if (!order) notFound();

  // 2. Extraction des coordonnées GPS (PostGIS)
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
    <div className="min-h-screen bg-slate-50 font-sans pb-28">
      
      {/* HEADER MISSION */}
      <header className="bg-slate-900 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 opacity-20 rounded-full -mr-12 -mt-12 blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10 mb-6">
          <Link href="/transporter/dashboard" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              Mission <span className="text-blue-400">#{order.id.slice(0, 8)}</span>
            </h1>
          </div>
        </div>

        {/* BADGE STATUT */}
        <div className="relative z-10 bg-white/10 border border-white/20 p-4 rounded-2xl backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            {order.status === 'ACCEPTED' && <Truck className="w-6 h-6 text-[#FF8200]" />}
            {order.status === 'IN_PROGRESS' && <Navigation className="w-6 h-6 text-blue-400" />}
            {order.status === 'COMPLETED' && <CheckCircle2 className="w-6 h-6 text-[#009A44]" />}
            
            <div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Statut actuel</p>
              <p className="text-lg font-black text-white">
                {order.status === 'ACCEPTED' ? 'En route vers le champ' : 
                 order.status === 'IN_PROGRESS' ? 'En route vers le magasin' : 
                 'Livraison terminée'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-4 relative z-20 space-y-6">
        
        {/* ACTIONS PRINCIPALES (Boutons flottants) */}
        {order.status !== 'COMPLETED' && (
          <div className="grid grid-cols-1 gap-4">
            
            {/* Si la mission vient d'être acceptée, on doit scanner pour charger */}
            {order.status === 'ACCEPTED' && (
              <Link 
                href={`/transporter/missions/${order.id}/scan`}
                className="bg-[#009A44] text-white p-5 rounded-2xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-3 font-black text-lg active:scale-95 transition-transform"
              >
                <QrCode className="w-6 h-6" />
                Scanner le chargement
              </Link>
            )}

            {/* ✅ LA BEST PRACTICE : Le Wrapper Server Action avec arguments corrects */}
            {order.status === 'IN_PROGRESS' && (
              <form action={async (formData) => {
                "use server";
                const orderId = formData.get("orderId") as string;
                await updateOrderStatus(orderId, "COMPLETED");
              }} className="w-full">
                <input type="hidden" name="orderId" value={order.id} />
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white p-5 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 font-black text-lg active:scale-95 transition-transform"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Valider la livraison (Magasin)
                </button>
              </form>
            )}
          </div>
        )}

        {/* CARTE PRODUCTEUR */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mt-4">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> Contact Producteur
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-orange-50 text-[#FF8200] rounded-full flex items-center justify-center font-black text-xl border border-orange-100">
                {order.producer.user.firstName[0]}{order.producer.user.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-black text-slate-900">
                  {order.producer.user.firstName} {order.producer.user.lastName}
                </p>
                <p className="text-sm text-slate-500 font-mono mt-0.5">{order.producer.user.phoneNumber}</p>
              </div>
            </div>
            <a href={`tel:${order.producer.user.phoneNumber}`} className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition">
              <PhoneCall className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* FEUILLE DE ROUTE (GPS) */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Feuille de route
          </h2>
          
          <div className="space-y-8 relative ml-2">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200 border-dashed border-l-2"></div>
            
            <div className="relative flex items-start gap-4">
              <div className={`z-10 h-8 w-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white text-xs font-black ${order.status === 'ACCEPTED' ? 'bg-[#FF8200] animate-pulse' : 'bg-slate-400'}`}>
                A
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">1. Collecte (Bord Champ)</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{pickup.lat.toFixed(5)}, {pickup.lng.toFixed(5)}</p>
                <a href={`https://maps.google.com/?q=${pickup.lat},${pickup.lng}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 mt-2 inline-block hover:underline">
                  Ouvrir dans GPS
                </a>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className={`z-10 h-8 w-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white text-xs font-black ${order.status === 'IN_PROGRESS' ? 'bg-blue-600 animate-pulse' : 'bg-slate-400'}`}>
                B
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">2. Livraison (Magasin Central)</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{dropoff.lat.toFixed(5)}, {dropoff.lng.toFixed(5)}</p>
                <a href={`https://maps.google.com/?q=${dropoff.lat},${dropoff.lng}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 mt-2 inline-block hover:underline">
                  Ouvrir dans GPS
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* MESSAGE DE SUCCÈS */}
        {order.status === 'COMPLETED' && (
          <div className="bg-green-50 border border-green-200 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in">
            <div className="bg-[#009A44] text-white p-3 rounded-full shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-green-900">Mission accomplie !</p>
              <p className="text-sm text-green-700 font-medium">Les lots ont été livrés et enregistrés dans le système de la coopérative.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
