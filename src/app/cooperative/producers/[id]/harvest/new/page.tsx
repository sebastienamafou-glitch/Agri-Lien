import prisma from "@/lib/prisma"; // ✅ Utilisation de notre Singleton DRY
import { notFound } from "next/navigation";
// ✅ CORRECTION : On pointe vers l'action de la Coopérative
import { createHarvest } from "@/app/actions/harvests/createHarvest"; 
import Link from "next/link";
import { ArrowLeft, Save, Scale, Sprout, MapPin } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
}

export default async function NewHarvestPage(props: Props) {
  const params = await props.params;
  const userId = params.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      producerProfile: {
        include: { farmPlots: true }
      }
    }
  });

  if (!user || !user.producerProfile) return notFound();

  const producer = user.producerProfile;
  const plots = producer.farmPlots;

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-8">
        {/* ✅ CORRECTION : Lien vers la coopérative */}
        <Link 
          href={`/cooperative/producers/${userId}`} 
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle Récolte</h1>
          <p className="text-sm text-gray-500">
            Enregistrement d'un lot pour <strong>{user.lastName} {user.firstName}</strong>.
          </p>
        </div>
      </div>

      {/* ✅ LA BEST PRACTICE : Le Wrapper Server Action */}
      <form 
        action={async (formData) => {
          "use server";
          await createHarvest(formData);
        }} 
        className="space-y-6"
      >
        <input type="hidden" name="producerId" value={producer.id} />
        <input type="hidden" name="userId" value={user.id} />

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
          
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">1. Parcelle d'Origine (Traçabilité)</label>
             <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select 
                  name="farmPlotId" 
                  required
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#FF8200] focus:border-[#FF8200] text-gray-900 appearance-none font-medium"
                >
                   <option value="">-- Choisir la parcelle --</option>
                   {plots.map(plot => (
                     <option key={plot.id} value={plot.id}>
                       {plot.name} ({plot.areaHectares} Ha)
                     </option>
                   ))}
                </select>
             </div>
             {plots.length === 0 && (
               <p className="text-xs text-red-500 mt-2">Attention : Ce producteur n'a pas de parcelle déclarée.</p>
             )}
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">2. Quantité Récoltée</label>
                <div className="relative">
                   <Scale className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                   <input 
                     type="number" 
                     name="weight" 
                     step="0.1" 
                     required
                     placeholder="0.0"
                     className="w-full pl-10 p-3 border border-gray-200 rounded-xl focus:ring-[#FF8200] focus:border-[#FF8200] text-xl font-bold text-gray-900" 
                   />
                   <span className="absolute right-4 top-4 text-xs font-bold text-gray-400">Unités</span>
                </div>
             </div>

             <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">3. Filière (Produit)</label>
                <div className="relative">
                   <Sprout className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                   <select 
                     name="type" 
                     className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#FF8200] focus:border-[#FF8200] font-medium"
                   >
                      {/* ✅ CORRECTION : Alignement strict avec l'Enum de la DB */}
                      <option value="CACAO">Cacao</option>
                      <option value="HEVEA">Hévéa</option>
                      <option value="ANACARDE">Anacarde</option>
                      <option value="RIZ">Riz</option>
                      <option value="MANIOC">Manioc</option>
                   </select>
                </div>
             </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-4 bg-[#FF8200] text-white rounded-xl font-bold uppercase tracking-wider shadow-lg hover:bg-orange-700 flex items-center transition-transform active:scale-95"
          >
            <Save className="w-5 h-5 mr-2" />
            Valider la Récolte
          </button>
        </div>

      </form>
    </div>
  );
}
