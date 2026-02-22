import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/infrastructure/auth/auth.config";
import Link from "next/link";
import LogoutButton from "@/components/dashboard/LogoutButton";
import { Truck, QrCode, User, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";

export default async function TransporterProfilePage() {
  // 1. SÉCURITÉ : Vérification via le "badge" (numéro de téléphone stocké dans email)
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  // 2. RÉCUPÉRATION BLINDÉE : On passe par le compte Utilisateur
  const user = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    include: {
      transporterProfile: {
        include: {
          transportOrders: {
            where: { status: 'COMPLETED' }
          }
        }
      }
    }
  });

  // 3. LOGIQUE : S'il n'a pas encore de profil de camion, on le renvoie au Dashboard 
  // car c'est là-bas que se trouve notre script "d'auto-création" magique.
  if (!user || !user.transporterProfile) {
    return redirect("/transporter/dashboard");
  }

  const transporterProfile = user.transporterProfile;
  const completedMissions = transporterProfile.transportOrders?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      
      {/* HEADER PROFIL */}
      <header className="bg-slate-900 text-white pt-12 pb-24 px-6 rounded-b-[2.5rem] relative">
        <div className="flex justify-between items-start relative z-10">
          <h1 className="text-2xl font-black tracking-tight">Mon Profil</h1>
          <LogoutButton />
        </div>
      </header>

      {/* CARTE D'IDENTITÉ FLOTTANTE */}
      <main className="flex-1 px-5 -mt-16 space-y-6 relative z-20">
        
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm text-3xl font-black uppercase">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">{user.phoneNumber}</p>
          
          <div className="flex justify-center mt-4">
            <span className="bg-green-50 text-[#009A44] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-100">
              <ShieldCheck className="w-3.5 h-3.5" /> Chauffeur Vérifié
            </span>
          </div>
        </div>

        {/* INFOS VÉHICULE */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-50 flex items-center gap-3">
             <div className="bg-orange-50 p-2 rounded-xl">
               <Truck className="w-5 h-5 text-[#FF8200]" />
             </div>
             <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">Véhicule & Capacité</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4 divide-x divide-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type de Camion</p>
              <p className="font-black text-slate-900 text-sm">{transporterProfile.vehicleType}</p>
            </div>
            <div className="pl-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capacité Max</p>
              <p className="font-black text-slate-900 text-sm">
                {transporterProfile.capacity} {transporterProfile.unit || "UNITÉS"}
              </p>
            </div>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-5 border-b border-slate-50 flex items-center gap-3">
             <div className="bg-blue-50 p-2 rounded-xl">
               <CheckCircle2 className="w-5 h-5 text-blue-600" />
             </div>
             <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">Historique</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-slate-700 text-sm">Missions terminées</span>
              </div>
              <span className="text-xl font-black text-blue-600">{completedMissions}</span>
            </div>
          </div>
        </div>

      </main>

      {/* NAVIGATION BAS */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-40 pb-safe">
        <Link href="/transporter/dashboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition">
          <Truck className="w-6 h-6" />
          <span className="text-[10px] font-black tracking-widest uppercase">Missions</span>
        </Link>
        
        <Link href="/transporter/scanner" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition">
          <QrCode className="w-6 h-6" />
          <span className="text-[10px] font-black tracking-widest uppercase">Scanner</span>
        </Link>
        
        <Link href="/transporter/profile" className="flex flex-col items-center gap-1 text-blue-600 transition">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-black tracking-widest uppercase">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
