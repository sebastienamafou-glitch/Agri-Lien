import prisma from "@/lib/prisma"; // ✅ CORRECTION : Singleton
import TransportOrderForm from "@/components/logistics/TransportOrderForm";
import Link from "next/link";
import { ArrowLeft, Truck, Info } from "lucide-react";

export default async function NewTransportOrderPage() {
  // Récupération des producteurs pour le menu déroulant
  const producers = await prisma.producerProfile.findMany({
    include: { user: true },
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-screen animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/logistics" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-[#FF8200] p-2 rounded-xl text-white shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            Nouvel Ordre de Transport
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Module Logistique • Enregistrement PostGIS (Souveraineté des données)
          </p>
        </div>
      </div>
      
      {/* FORMULAIRE CLIENT COMPONENT */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <TransportOrderForm producers={producers} />
      </div>
      
      {/* NOTE D'AIDE */}
      <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
        <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-blue-900 leading-relaxed">
          <strong>Géolocalisation requise :</strong> Assurez-vous que les coordonnées GPS (Point de collecte et Magasin) sont capturées avec précision pour garantir le bon fonctionnement du moteur de matching et du calcul des distances.
        </p>
      </div>
      
    </div>
  );
}
