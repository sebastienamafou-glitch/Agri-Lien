import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import prisma from "@/lib/prisma";
import { ArrowLeft, Sprout, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import HarvestForm from "./HarvestForm"; // ✅ On importe le formulaire

export default async function NewHarvestPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const producerProfile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id },
    include: { farmPlots: true } 
  });

  if (!producerProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <Info className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-black text-slate-900">Profil introuvable</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 selection:bg-[#009A44] selection:text-white">
      <div className="bg-white/80 backdrop-blur-md p-5 flex items-center gap-4 shadow-sm sticky top-0 z-30 border-b border-slate-100">
        <Link href="/producer/dashboard" className="p-2.5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition active:scale-95 border border-slate-200 text-slate-600">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Nouvelle Récolte</h1>
      </div>

      <main className="p-5 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 mt-2">
          <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center text-[#009A44] mb-4 shadow-inner border border-green-200/50">
            <Sprout size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Déclarer un<br/>nouveau lot</h2>
          <p className="text-slate-500 text-sm font-medium">Saisissez les informations de votre production avant l'ensachage.</p>
        </div>

        {/* ✅ On appelle notre formulaire Client et on lui passe les données du Serveur */}
        <HarvestForm plots={producerProfile.farmPlots} producerId={producerProfile.id} />
        
      </main>
    </div>
  );
}
