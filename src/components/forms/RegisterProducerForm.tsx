"use client";

import { useFormStatus } from "react-dom";
import { registerProducer } from "@/app/actions/producers/register-producer";
import { useState, useRef } from "react";
import { CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react";

// --- Sous-composant pour le bouton "Submit" ---
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white uppercase tracking-wide
      ${pending ? "bg-orange-300 cursor-not-allowed" : "bg-[#FF8200] hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"} 
      transition-all duration-200`}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
          Traitement...
        </>
      ) : (
        "Enregistrer le Producteur"
      )}
    </button>
  );
}

// --- Composant Principal ---
export default function RegisterProducerForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function clientAction(formData: FormData) {
    setMessage(null);
    const result = await registerProducer(formData);

    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else if (result?.success) {
      setMessage({ type: 'success', text: result.success as string });
      formRef.current?.reset();
    }
  }

  return (
    <div className="bg-white shadow-2xl rounded-xl overflow-hidden max-w-md w-full mx-auto border border-gray-200">
      {/* En-tête Haute Visibilité */}
      <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xl font-extrabold text-[#009A44] tracking-tight">
          Nouveau Producteur
        </h3>
        {/* Indicateur visuel Drapeau CI */}
        <div className="flex space-x-1">
          <div className="w-4 h-4 rounded-full bg-[#FF8200] shadow-sm"></div>
          <div className="w-4 h-4 rounded-full bg-white border border-gray-300 shadow-sm"></div>
          <div className="w-4 h-4 rounded-full bg-[#009A44] shadow-sm"></div>
        </div>
      </div>

      <div className="p-6">
        {/* Message de Feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center border-l-4 shadow-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border-[#009A44] text-[#006837]' 
              : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-6 h-6 mr-3" /> : <AlertCircle className="w-6 h-6 mr-3" />}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        <form ref={formRef} action={clientAction} className="space-y-6">
          
          {/* Prénom & Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-bold text-gray-900 mb-1">
                Prénoms
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                className="block w-full rounded-lg border-gray-400 text-gray-900 placeholder:text-gray-500 focus:border-[#FF8200] focus:ring-[#FF8200] sm:text-base p-2.5 border bg-gray-50 focus:bg-white transition-colors"
                placeholder="Ex: Kouamé"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-bold text-gray-900 mb-1">
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                className="block w-full rounded-lg border-gray-400 text-gray-900 placeholder:text-gray-500 focus:border-[#FF8200] focus:ring-[#FF8200] sm:text-base p-2.5 border bg-gray-50 focus:bg-white transition-colors"
                placeholder="Ex: Konan"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-900 mb-1">
              Téléphone (Mobile Money)
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-900 font-bold sm:text-base">+225</span>
              </div>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                required
                className="block w-full pl-14 rounded-lg border-gray-400 text-gray-900 placeholder:text-gray-500 focus:border-[#FF8200] focus:ring-[#FF8200] sm:text-base p-2.5 border bg-gray-50 focus:bg-white"
                placeholder="07 07 07 07 07"
              />
            </div>
          </div>

          {/* ID National (Sera chiffré) */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <label htmlFor="nationalId" className="block text-sm font-bold text-gray-900 mb-1 flex items-center">
              <Lock className="w-4 h-4 mr-1 text-[#FF8200]" />
              N° CNI / CMU (Confidentiel)
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                name="nationalId"
                id="nationalId"
                required
                className="block w-full rounded-lg border-gray-400 text-gray-900 placeholder:text-gray-500 focus:border-[#FF8200] focus:ring-[#FF8200] sm:text-base p-2.5 border bg-white"
                placeholder="CI-000-111-222"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-xs font-bold text-[#009A44] bg-green-100 px-2 py-0.5 rounded">AES-256</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600 font-medium">
              Donnée chiffrée militairement avant stockage.
            </p>
          </div>

          <SubmitButton />
        </form>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-100 px-6 py-4 border-t border-gray-300 text-center">
        <p className="text-xs font-semibold text-gray-600">Agri-Lien CI • Souveraineté Numérique</p>
      </div>
    </div>
  );
}
