"use client";

import { createProducer } from "@/app/actions/producers/createProducer";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { User, Phone, MapPin, Sprout, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white uppercase tracking-wider shadow-md
      ${pending ? "bg-gray-400 cursor-not-allowed" : "bg-[#FF8200] hover:bg-orange-600 focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"}
      transition-all`}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
          Enregistrement...
        </>
      ) : (
        <>
          <Save className="w-5 h-5 mr-2" />
          Enregistrer le Producteur
        </>
      )}
    </button>
  );
}

export default function NewProducerPage() {
  const [error, setError] = useState("");

  async function clientAction(formData: FormData) {
    // ✅ LA BEST PRACTICE : On précise le type attendu pour éviter le "never"
    const result = (await createProducer(formData)) as unknown as { error?: string };
    if (result?.error) setError(result.error);
  }

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Header avec Retour */}
      <div className="flex items-center gap-4 mb-8">
        {/* ✅ CORRECTION : Lien vers /cooperative au lieu de /admin */}
        <Link href="/cooperative/producers" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvel Enrôlement</h1>
          <p className="text-sm text-gray-500">Ajouter un producteur et sa première parcelle.</p>
        </div>
      </div>

      <form action={clientAction} className="space-y-6">
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center">
            <AlertCircle className="text-red-500 mr-3" />
            <p className="text-red-700 font-bold text-sm">{error}</p>
          </div>
        )}

        {/* Section 1 : Identité */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-[#009A44]" />
            Identité du Producteur
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prénoms</label>
              <input type="text" name="firstName" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#FF8200] focus:border-[#FF8200]" placeholder="Ex: Kouamé" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom</label>
              <input type="text" name="lastName" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#FF8200] focus:border-[#FF8200]" placeholder="Ex: Konan" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Téléphone Mobile</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 font-bold">+225</span>
                <input type="tel" name="phoneNumber" required className="w-full p-3 pl-14 border border-gray-300 rounded-lg focus:ring-[#FF8200] focus:border-[#FF8200]" placeholder="07 07 07 07 07" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 : Parcelle Initiale */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Sprout className="w-5 h-5 mr-2 text-[#009A44]" />
            Parcelle & Production
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom de la parcelle (Optionnel)</label>
              <input type="text" name="plotName" className="w-full p-3 border border-gray-300 rounded-lg" placeholder="Ex: Champ du bas-fond" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Superficie (Déclarée)</label>
              <div className="relative">
                <input type="number" step="0.1" name="area" required className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-[#FF8200] focus:border-[#FF8200]" placeholder="0.0" />
                <span className="absolute right-3 top-3 text-gray-400 font-bold text-sm">Ha</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estimation Récolte</label>
              <div className="relative">
                <input type="number" step="0.1" name="yield" required className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-[#FF8200] focus:border-[#FF8200]" placeholder="0.0" />
                <span className="absolute right-3 top-3 text-gray-400 font-bold text-sm">Tonnes</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg flex items-start">
             <MapPin className="w-4 h-4 mr-2 mt-0.5" />
             <p>Note : Le tracé GPS de la parcelle pourra être ajouté ultérieurement sur la carte interactive.</p>
          </div>
        </div>

        {/* Bouton Action */}
        <div className="flex justify-end">
          <SubmitButton />
        </div>

      </form>
    </div>
  );
}
