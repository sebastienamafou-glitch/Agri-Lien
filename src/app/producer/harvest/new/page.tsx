import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import prisma from "@/lib/prisma";
import { ArrowLeft, Sprout, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import HarvestForm from "./HarvestForm";

export default async function NewHarvestPage() {
  // 1. SÉCURITÉ : On vérifie la session
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  // 2. RÉCUPÉRATION ROBUSTE : On passe par le numéro de téléphone (Badge)
  const user = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    include: { 
      producerProfile: {
        include: { farmPlots: true }
      }
    } 
  });

  const producerProfile = user?.producerProfile;

  if (!producerProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Info className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Profil Producteur introuvable</h2>
        <p className="text-slate-500 mt-2 text-sm">Votre compte n'est pas encore lié à une exploitation.</p>
        <Link href="/producer/dashboard" className="mt-6 inline-block text-blue-600 font-bold text-sm">
          Retour au tableau de bord
        </Link>
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

        {/* Formulaire Client */}
        <HarvestForm plots={producerProfile.farmPlots} producerId={producerProfile.id} />
        
      </main>
    </div>
  );
}
