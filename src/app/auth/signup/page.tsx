"use client";

import { useFormStatus } from "react-dom";
import { signupAdmin } from "@/app/actions/auth/signup";
import { useState } from "react";
import { Loader2, AlertCircle, User, CheckCircle, Phone, Sprout, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

// Bouton Submit (Amélioré)
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg text-sm font-black text-white uppercase tracking-wider
      ${pending ? "bg-[#FF8200]/70 cursor-not-allowed" : "bg-[#FF8200] hover:bg-orange-600 active:scale-95"}
      transition-all duration-200 group`}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          Finalisation...
        </>
      ) : (
        <>
          Créer mon compte
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}

export default function SignupPage() {
  const [error, setError] = useState("");

  async function clientAction(formData: FormData) {
    setError("");
    const result = await signupAdmin(formData);
    
    if (result?.error) {
      setError(result.error);
      return; 
    }

    const rawPhone = formData.get("phoneNumber") as string;
    const cleanPhone = rawPhone.replace(/\s/g, '');

    try {
      const signInResult = await signIn("credentials", {
        phone: cleanPhone,
        otp: "123456",
        redirect: false,
        callbackUrl: "/onboarding"
      });

      if (signInResult?.error) {
        setError("Erreur de connexion automatique : " + signInResult.error);
      } else if (signInResult?.url) {
         window.location.href = signInResult.url;
      }
    } catch (err) {
      setError("Erreur technique lors de la connexion.");
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Section Formulaire (Droite sur desktop, pleine page sur mobile) */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative z-10 shadow-2xl md:shadow-none">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          <div className="mb-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-[#009A44] mb-6">
               <Sprout size={24} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Rejoignez le réseau <br/> Agri-Lien CI.
            </h2>
            <p className="mt-4 text-base text-slate-600 font-medium">
              Créez votre compte Administrateur pour superviser la traçabilité et les acteurs de la filière.
            </p>
          </div>

          <form action={clientAction} className="space-y-8">
            
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border-l-4 border-red-500 flex items-start animate-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                <span className="text-sm text-red-700 font-bold">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Prénoms</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="h-5 w-5 text-slate-400" />
                   </div>
                   <input type="text" name="firstName" required className="block w-full pl-12 pr-4 py-4 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200]/20 focus:border-[#FF8200] sm:text-sm font-bold text-slate-900 bg-slate-50 focus:bg-white transition-colors" placeholder="Jean" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Nom</label>
                <input type="text" name="lastName" required className="block w-full px-4 py-4 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200]/20 focus:border-[#FF8200] sm:text-sm font-bold text-slate-900 bg-slate-50 focus:bg-white transition-colors" placeholder="Kouassi" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Téléphone Mobile</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-slate-200 pr-3 bg-slate-100 rounded-l-xl text-slate-500">
                   <Phone className="h-5 w-5 mr-2" />
                   <span className="font-black sm:text-sm">+225</span>
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  className="block w-full pl-[110px] pr-4 py-4 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF8200]/20 focus:border-[#FF8200] sm:text-lg font-black text-slate-900 bg-slate-50 focus:bg-white transition-colors placeholder:text-slate-400"
                  placeholder="01 02 03 04 05"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 font-medium ml-1">
                Ce numéro sera votre identifiant de connexion unique.
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#FF8200] mt-0.5 mr-3 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-orange-900">Mode Développement Activé</h4>
                    <p className="text-xs text-orange-800 mt-1 font-medium leading-relaxed">
                      Pour les tests, le code OTP sera automatiquement <strong>123456</strong>. Aucun SMS ne sera envoyé.
                    </p>
                  </div>
            </div>

            <SubmitButton />
            
            <p className="text-center text-sm text-slate-600 font-medium">
              Vous avez déjà un compte ?{" "}
              <Link href="/auth/login" className="font-black text-[#FF8200] hover:text-orange-700 transition-colors">
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Section Image Hero (Gauche sur desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-900">
         {/* Image de fond haute qualité (Unsplash) */}
         <img 
            src="https://images.unsplash.com/photo-1600336153113-d66c6c4bd935?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Plantation de Cacao Côte d'Ivoire" 
            className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-110"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#009A44]/90 to-transparent mix-blend-multiply"></div>
         
         <div className="relative z-10 h-full flex flex-col justify-end p-20 text-white">
            <div className="mb-6">
               <Sprout size={48} className="text-[#FF8200]" />
            </div>
            <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">
              La Souveraineté <br/> Numérique et Alimentaire.
            </h1>
            <p className="text-xl text-green-50 font-medium max-w-md leading-relaxed">
              Agri-Lien CI est la plateforme nationale pour sécuriser les revenus des producteurs et garantir la traçabilité de nos filières.
            </p>
            <div className="mt-12 flex items-center gap-4">
              <div className="h-1 w-20 bg-[#FF8200] rounded-full"></div>
              <span className="uppercase tracking-[0.2em] text-xs font-black text-green-200">Initiative Gouvernementale</span>
            </div>
         </div>
      </div>
    </div>
  );
}
