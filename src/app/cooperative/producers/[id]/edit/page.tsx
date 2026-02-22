import prisma from "@/lib/prisma"; // ✅ Utilisation de notre Singleton DRY
import { notFound } from "next/navigation";
import { updateProducer } from "@/app/actions/producers/updateProducer";
import Link from "next/link";
import { ArrowLeft, Save, User, Phone, ShieldAlert } from "lucide-react";

// Définition du type pour Next.js 15+
type Props = {
  params: Promise<{ id: string }>;
}

export default async function EditProducerPage(props: Props) {
  const params = await props.params;
  const id = params.id;

  // 1. On récupère les infos actuelles pour pré-remplir le formulaire
  const producer = await prisma.user.findUnique({
    where: { id },
  });

  if (!producer) return notFound();

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* En-tête */}
      <div className="flex items-center gap-4 mb-8">
        {/* ✅ CORRECTION : Lien vers la coopérative */}
        <Link 
          href={`/cooperative/producers/${id}`} 
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier le dossier</h1>
          <p className="text-sm text-gray-500">Correction des informations d'identité.</p>
        </div>
      </div>

      {/* ✅ LA BEST PRACTICE : Le Wrapper Server Action */}
      <form 
        action={async (formData) => {
          "use server";
          await updateProducer(formData);
        }} 
        className="space-y-6"
      >
        {/* ID caché indispensable pour savoir QUI on modifie */}
        <input type="hidden" name="id" value={producer.id} />

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
          
          {/* Alerte Sécurité */}
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-3 items-start">
            <ShieldAlert className="w-5 h-5 text-[#FF8200] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-orange-900">Zone de modification restreinte</h4>
              <p className="text-xs text-orange-800 mt-1">
                Pour des raisons de sécurité, le <strong>Hash CNI</strong> et l'<strong>ID Unique</strong> ne peuvent pas être modifiés ici. Contactez l'administrateur système pour ces changements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Prénoms</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  name="firstName" 
                  defaultValue={producer.firstName}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-[#FF8200] focus:border-[#FF8200]" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Nom</label>
              <input 
                type="text" 
                name="lastName" 
                defaultValue={producer.lastName}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#FF8200] focus:border-[#FF8200]" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Téléphone Mobile</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="tel" 
                name="phoneNumber" 
                defaultValue={producer.phoneNumber.replace('+225', '')} // On enlève le +225 pour l'affichage
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-[#FF8200] focus:border-[#FF8200]" 
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3">
          {/* ✅ CORRECTION : Lien vers la coopérative */}
          <Link 
            href="/cooperative/producers" 
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50"
  >
            Annuler
          </Link>
          <button
            type="submit"
            className="px-6 py-3 bg-[#FF8200] text-white rounded-xl font-bold uppercase tracking-wider shadow-md hover:bg-orange-700 flex items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            Enregistrer les modifications
          </button>
        </div>

      </form>
    </div>
  );
}
