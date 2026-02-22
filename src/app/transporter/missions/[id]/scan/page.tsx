import QRScanner from "@/components/logistics/QRScanner";
import Link from "next/link";
import { X, Camera, ScanLine, QrCode } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function TransporterScanPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 1. SÉCURITÉ : Vérification de la session
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  // 2. SÉCURITÉ : Récupération du profil Transporteur
  const user = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    include: { transporterProfile: true }
  });

  if (!user || !user.transporterProfile) {
    redirect("/transporter/dashboard");
  }

  const transporterId = user.transporterProfile.id;

  // 3. LE CADENAS : On vérifie que la mission lui appartient bien
  const order = await prisma.transportOrder.findFirst({
    where: { 
      id: id,
      transporterId: transporterId 
    },
  });

  // Si la mission n'est pas à lui ou n'existe pas, on bloque !
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans flex flex-col">
      
      {/* HEADER CAMERA (Mode sombre) */}
      <header className="p-6 flex items-center justify-between relative z-20">
        <Link 
          href={`/transporter/missions/${id}`} 
          className="p-3 bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition active:scale-95"
        >
          <X className="w-6 h-6 text-white" />
        </Link>
        
        <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full backdrop-blur-md">
          <Camera className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">
            Mode Chargement
          </span>
        </div>
        
        <div className="w-12"></div> {/* Spacer pour centrer */}
      </header>

      {/* ZONE D'INSTRUCTIONS */}
      <div className="px-6 py-2 relative z-20 text-center">
        <h1 className="text-2xl font-black tracking-tight mb-2">Scanner le sac</h1>
        <p className="text-slate-400 text-sm font-medium inline-flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-lg">
          Mission <span className="text-white font-bold">#{id.slice(0, 8)}</span>
        </p>
      </div>

      {/* ZONE DU SCANNER */}
      <div className="flex-1 relative flex flex-col items-center justify-start p-6 mt-4">
         
         {/* Conteneur de la caméra avec effet "Viseur" */}
         <div className="w-full max-w-sm aspect-[4/5] relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 border-4 border-slate-800 bg-black">
           
           {/* Le composant Client qui gère le flux vidéo */}
           <QRScanner orderId={id} />

           {/* Calque esthétique par-dessus la vidéo (Viseur) */}
           <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="w-48 h-48 border-2 border-blue-500/50 rounded-xl relative">
                {/* Ligne de scan animée */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
             </div>
           </div>
           
           <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
             <ScanLine className="w-8 h-8 text-white/50 animate-pulse" />
           </div>
         </div>

         {/* Note technique en bas de l'écran */}
         <div className="mt-8 bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700 flex items-start gap-4 max-w-sm">
            <div className="bg-blue-500/20 p-2 rounded-full shrink-0">
              <QrCode className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Placez le QR Code dans le cadre. Le sac sera lié à ce camion et sa position sera enregistrée (EUDR).
            </p>
         </div>
         
      </div>

      {/* Animation CSS injectée pour la ligne de scan */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
