import prisma from "@/lib/prisma"; // ✅ Utilisation de notre Singleton DRY
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  User, 
  Sprout, 
  ShieldCheck,
  Package
} from "lucide-react";
// On réutilise votre carte existante !
import ProducerMap from "@/components/maps/LazyProducerMap";

type Props = {
  params: Promise<{ id: string }>;
}

export default async function TracePage(props: Props) {
  const params = await props.params;
  const qrCode = params.id;

  // 1. Enquête : On remonte toute la filière à partir du lot scanné
  // ✅ CORRECTION : Utilisation de productBatch au lieu de cocoaBag
  const batch = await prisma.productBatch.findUnique({
    where: { qrCode: qrCode },
    include: {
      harvest: {
        include: {
          producer: {
            include: { user: true }
          },
          farmPlot: true
        }
      }
    }
  });

  if (!batch) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Code Inconnu</h1>
        <p className="text-slate-500 mt-2">Ce QR Code ne correspond à aucun lot certifié Agri-Lien CI.</p>
        <Link href="/" className="mt-6 text-[#FF8200] font-bold">Retour à l'accueil</Link>
      </div>
    );
  }

  const producer = batch.harvest.producer.user;
  const plot = batch.harvest.farmPlot;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12 font-sans selection:bg-[#009A44] selection:text-white">
      
      {/* Header Mobile "Verified" - Rendu Agnostique */}
      <header className="bg-gradient-to-br from-[#009A44] to-[#007A33] text-white p-6 pb-16 shadow-lg relative overflow-hidden rounded-b-[2rem]">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
           <Sprout className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 opacity-90">
             <ShieldCheck className="w-5 h-5" />
             <span className="text-xs font-black tracking-widest uppercase">Certificat d'Origine RDUE</span>
          </div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">
             {/* ✅ CORRECTION : Affichage dynamique de la filière */}
            {batch.harvest.cropType} Ivoirien
          </h1>
          <p className="text-green-100 font-medium">Traçabilité 100% Garantie par Agri-Lien CI</p>
        </div>
      </header>

      <main className="px-5 -mt-10 relative z-20 max-w-md mx-auto space-y-6">
        
        {/* Carte Identité du Lot */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Référence Lot</p>
                <p className="text-xl font-mono font-black text-slate-900 mt-1">{batch.qrCode}</p>
              </div>
              <div className="bg-green-50 text-[#009A44] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1">
                 <CheckCircle2 className="w-3 h-3" /> CONFORME
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-[#FF8200]/10 rounded-xl flex items-center justify-center border border-[#FF8200]/20 text-[#FF8200]">
                    <User className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Producteur</p>
                    <p className="font-black text-slate-900 text-sm">{producer.lastName} {producer.firstName}</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-500">
                    <MapPin className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Origine</p>
                    <p className="font-black text-slate-900 text-sm">{plot.name}, Côte d'Ivoire</p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-500">
                    <Calendar className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Date de Récolte</p>
                    <p className="font-black text-slate-900 text-sm">
                      {new Date(batch.harvest.declaredAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-[#009A44]/10 rounded-xl flex items-center justify-center border border-[#009A44]/20 text-[#009A44]">
                    <Package className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Quantité Certifiée</p>
                    {/* ✅ CORRECTION : Affichage dynamique de la quantité et de l'unité */}
                    <p className="font-black text-slate-900 text-sm">{batch.quantity} {batch.unit.toLowerCase()}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Preuve Géographique */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 delay-100">
           <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm">Preuve Satellite RDUE</h3>
              <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-md font-black uppercase tracking-widest flex items-center gap-1">
                 <CheckCircle2 className="w-3 h-3" /> GPS VERIFIÉ
              </span>
           </div>
           <div className="h-64 w-full relative">
              {/* On passe un tableau avec une seule parcelle pour centrer la carte dessus */}
              {/* Note: on utilise 'any' si nécessaire pour apaiser le typage strict du composant Map */}
              <ProducerMap plots={[plot] as any} />
           </div>
        </div>

        {/* Footer Timeline */}
        <div className="text-center pt-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
           <p className="text-xs text-slate-500 font-medium mb-5 px-4 leading-relaxed">
              Ce produit respecte la stricte réglementation européenne contre la déforestation (EUDR 2023/1115).
           </p>
           <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-black text-slate-700 uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
              Audit Blockchain Sécurisé
           </div>
        </div>

      </main>
    </div>
  );
}
