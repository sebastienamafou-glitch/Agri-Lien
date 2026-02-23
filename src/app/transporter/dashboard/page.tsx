import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import Link from "next/link";
import { Truck, MapPin, Navigation, Package, QrCode, UserIcon, ArrowRight } from "lucide-react";
import LogoutButton from "@/components/dashboard/LogoutButton";
import { acceptOrder } from "@/app/actions/logistics/logistics";
import { redirect } from "next/navigation";
import { MeasurementUnit } from "@prisma/client"; // ✅ Import de l'enum pour éviter les erreurs

export default async function TransporterDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  // 1. Récupération du VRAI chauffeur connecté
  let user = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    include: { transporterProfile: true }
  });

  if (!user) redirect("/auth/login");

  // 🛠️ CORRECTION : On utilise le bon nom de modèle 'transporterProfile'
  if (!user.transporterProfile) {
    await prisma.transporterProfile.create({ // ✅ Correction ici (au lieu de prisma.transporter)
      data: {
        userId: user.id,
        vehicleType: "Camion Standard",
        capacity: 5,
        unit: "TONNE", // ✅ Correction ici (Singulier pour matcher l'Enum du schéma)
      }
    });
    
    // On recharge l'utilisateur pour avoir son nouvel ID
    user = await prisma.user.findUnique({
      where: { phoneNumber: session.user.email },
      include: { transporterProfile: true }
    });
  }

  const transporterId = user?.transporterProfile?.id;

  // 2. Ses missions assignées
  const activeMissions = await prisma.transportOrder.findMany({
    where: {
      transporterId: transporterId,
      status: { in: ["ACCEPTED", "IN_PROGRESS"] }
    },
    include: { producer: { include: { user: true } } },
    orderBy: { requestedAt: "desc" }
  });

  // 3. La Bourse de Fret
  const availableMissions = await prisma.transportOrder.findMany({
    where: { status: "PENDING" },
    include: { producer: { include: { user: true } } },
    orderBy: { requestedAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28">
      
      {/* HEADER CHAUFFEUR */}
      <header className="bg-slate-900 text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-12 -mt-12 blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              Salut, {user?.firstName} <Truck className="w-6 h-6 text-[#FF8200]" />
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {user?.transporterProfile?.vehicleType} • Capacité: {user?.transporterProfile?.capacity} {user?.transporterProfile?.unit?.toLowerCase()}
            </p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="px-4 -mt-6 relative z-20 space-y-8">
        
        {/* SECTION 1 : MISSIONS ACTIVES */}
        <section>
          <h2 className="text-lg font-black text-slate-900 mb-4 px-1">Mes Missions Actives</h2>
          <div className="space-y-4">
            {activeMissions.length === 0 ? (
              <div className="bg-white p-6 rounded-3xl border border-dashed border-slate-200 text-center shadow-sm">
                <Navigation className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-sm">Aucune mission en cours.</p>
              </div>
            ) : (
              activeMissions.map((mission) => (
                <Link 
                  href={`/transporter/missions/${mission.id}`} 
                  key={mission.id}
                  className="block bg-white p-5 rounded-3xl border border-blue-100 shadow-lg shadow-blue-900/5 active:scale-95 transition-all hover:border-blue-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  
                  <div className="flex justify-between items-start mb-4 pl-2">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      mission.status === 'ACCEPTED' ? 'bg-orange-50 text-[#FF8200]' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {mission.status === 'ACCEPTED' ? 'À RÉCUPÉRER' : 'EN ROUTE'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">#{mission.id.slice(0,8)}</span>
                  </div>

                  <div className="pl-2 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-600">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Producteur</p>
                        <p className="text-sm font-black text-slate-900">{mission.producer.user.firstName} {mission.producer.user.lastName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center pl-2">
                    <span className="text-xs font-black text-blue-600 tracking-wide flex items-center gap-1">
                      VOIR L'ITINÉRAIRE <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* SECTION 2 : BOURSE DE FRET */}
        <section>
          <h2 className="text-lg font-black text-slate-900 mb-4 px-1 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#FF8200]" />
            Bourse de Fret ({availableMissions.length})
          </h2>
          
          <div className="space-y-4">
            {availableMissions.length === 0 ? (
              <div className="bg-slate-100 p-6 rounded-3xl text-center">
                <p className="text-slate-500 font-medium text-sm">Aucune nouvelle demande d'enlèvement.</p>
              </div>
            ) : (
              availableMissions.map(order => (
                <div key={order.id} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-slate-900">{order.producer.user.lastName} {order.producer.user.firstName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Enlèvement bord champ</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#FF8200]"></div>
                      <div className="w-0.5 h-4 bg-slate-200 my-1"></div>
                      <MapPin className="w-4 h-4 text-[#009A44]" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-bold text-slate-700">Parcelle Producteur</p>
                      <p className="text-xs font-bold text-slate-700">Magasin Central</p>
                    </div>
                  </div>

                  <form action={async (formData) => {
                    "use server";
                    const orderId = formData.get("orderId") as string;
                    if (transporterId && orderId) {
                      await acceptOrder(orderId, transporterId);
                    }
                  }}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button type="submit" className="w-full bg-[#FF8200] text-white py-3.5 rounded-xl font-black uppercase tracking-wider text-xs hover:bg-orange-600 transition shadow-lg shadow-orange-500/20 active:scale-95">
                      Accepter la course
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* NAVIGATION BAS */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex justify-between items-center z-40 pb-safe shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <Link href="/transporter/dashboard" className="flex flex-col items-center gap-1 text-blue-600">
          <Truck size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-black tracking-wider uppercase mt-0.5">Missions</span>
        </Link>
        
        <Link href="/transporter/scanner" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition">
          <QrCode size={24} />
          <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5">Scanner</span>
        </Link>
        
        <Link href="/transporter/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition">
          <UserIcon size={24} />
          <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
