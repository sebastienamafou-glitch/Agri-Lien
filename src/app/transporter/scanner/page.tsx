import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/infrastructure/auth/auth.config";
import QRScanner from "@/components/logistics/QRScanner";
import Link from "next/link";
import { Truck, QrCode, User, PackageX } from "lucide-react";

export default async function TransporterScannerPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  // On cherche si le chauffeur a une mission en cours
  const activeOrder = await prisma.transportOrder.findFirst({
    where: {
      transporter: { userId: session.user.id },
      status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } // Statuts valides pour un enlèvement
    },
    include: {
      producer: { include: { user: true } }
    }
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans selection:bg-blue-500 selection:text-white pb-20">
      
      {/* HEADER SOMBRE */}
      <header className="p-6 relative z-10">
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <QrCode className="w-6 h-6 text-blue-400" /> Scanner de Fret
        </h1>
        {activeOrder ? (
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Mission : Récupération chez <strong className="text-white">{activeOrder.producer.user.lastName}</strong>
          </p>
        ) : (
          <p className="text-slate-400 text-sm mt-1 font-medium">Aucune mission active.</p>
        )}
      </header>

      {/* ZONE CENTRALE : CAMÉRA OU MESSAGE */}
      <main className="flex-1 relative flex flex-col">
        {activeOrder ? (
          <div className="flex-1 relative rounded-t-3xl overflow-hidden bg-black">
            {/* Composant Caméra (Déjà créé précédemment) */}
            <QRScanner orderId={activeOrder.id} />
            
            {/* Masque de visée (Design par-dessus la caméra) */}
            <div className="absolute inset-0 pointer-events-none border-[40px] border-[#0f172a]/80 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-dashed border-blue-400/50 rounded-3xl relative">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
              </div>
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 text-center z-10">
              <p className="bg-black/60 backdrop-blur-md inline-block px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-white/80 border border-white/10">
                Pointez le QR Code du sac
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900 rounded-t-[3rem]">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <PackageX className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Aucun sac à scanner</h2>
            <p className="text-sm text-slate-400 mb-8">
              Vous devez d'abord accepter une mission dans l'onglet "Missions" avant de pouvoir scanner des sacs.
            </p>
            <Link href="/transporter/dashboard" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-colors active:scale-95">
              Voir les missions
            </Link>
          </div>
        )}
      </main>

      {/* NAVIGATION BAS (Identique au dashboard) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-40 pb-safe">
        <Link href="/transporter/dashboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition">
          <Truck className="w-6 h-6" />
          <span className="text-[10px] font-black tracking-widest uppercase">Missions</span>
        </Link>
        
        <Link href="/transporter/scanner" className="flex flex-col items-center gap-1 text-blue-600 transition">
          <QrCode className="w-6 h-6" />
          <span className="text-[10px] font-black tracking-widest uppercase">Scanner</span>
        </Link>
        
        <Link href="/transporter/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition">
          <User className="w-6 h-6" />
          <span className="text-[10px] font-black tracking-widest uppercase">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
