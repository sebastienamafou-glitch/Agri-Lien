"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link"; // ✅ CORRECTION : Le bon import pour le lien !
import { Loader2, AlertCircle, Phone, Lock, Sprout } from "lucide-react"; // (Link retiré d'ici)

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const phone = formData.get("phoneNumber") as string;
    const otp = formData.get("otp") as string;

    try {
      const result = await signIn("credentials", {
        phone,
        otp,
        redirect: false,
      });

      if (result?.error) {
        setError("Numéro ou code incorrect.");
        setLoading(false);
      } else {
        window.location.href = "/onboarding";
      }
    } catch (err) {
      setError("Erreur technique lors de la connexion.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Section Formulaire (Gauche) */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        
        <div className="mx-auto w-full max-w-sm lg:w-96 flex-1 flex flex-col justify-center">
          
          {/* === HEADER === */}
          <div className="mb-12 text-center sm:text-left animate-in slide-in-from-top-4 duration-700">
            <div className="mb-8 flex justify-center sm:justify-start">
               <img 
                 src="/logo-agrilien.png" 
                 alt="Logo Agri-Lien CI" 
                 className="h-24 w-auto object-contain drop-shadow-sm" 
               />
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Connexion Sécurisée
            </h2>
            <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
              Veuillez saisir vos identifiants pour accéder à votre espace de gestion.
            </p>
          </div>

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit} className="space-y-7 animate-in slide-in-from-bottom-4 duration-700 delay-150">
            
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start animate-in zoom-in">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-red-800">Erreur d'identification</h3>
                  <p className="text-xs text-red-600 mt-1 font-bold">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Numéro de Téléphone</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-slate-200 pr-3 bg-slate-50 text-slate-500 group-focus-within:bg-white group-focus-within:text-[#009A44] transition-colors rounded-l-2xl">
                   <Phone className="h-5 w-5 mr-2" />
                   <span className="font-black sm:text-sm tracking-tight">+225</span>
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  className="block w-full pl-[110px] pr-4 py-4 border-2 border-slate-100 rounded-2xl focus:border-[#009A44] focus:ring-4 focus:ring-[#009A44]/10 sm:text-lg font-black text-slate-900 outline-none transition-all bg-slate-50/50 focus:bg-white placeholder:text-slate-300 placeholder:font-medium"
                  placeholder="07 07 07 07 07"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Code Secret (OTP)</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#FF8200] transition-colors">
                   <Lock className="h-5 w-5" />
                 </div>
                <input
                  type="password"
                  name="otp"
                  required
                  className="block w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl focus:border-[#FF8200] focus:ring-4 focus:ring-[#FF8200]/10 sm:text-xl tracking-[0.5em] font-black text-slate-900 outline-none transition-all bg-slate-50/50 focus:bg-white placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-medium"
                  placeholder="••••••"
                />
              </div>
            </div>

            {/* ✅ CORRECTION : Structure des balises corrigée */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-xl text-sm font-black text-white uppercase tracking-widest
                ${loading ? "bg-slate-800 cursor-not-allowed opacity-80" : "bg-gradient-to-r from-slate-900 to-slate-800 hover:from-[#FF8200] hover:to-orange-600 active:scale-95 hover:shadow-orange-200"}
                transition-all duration-300 ease-out`}
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Accéder à mon espace"}
              </button>

              <p className="text-center text-sm text-slate-500 font-medium pt-2">
                Vous n'avez pas encore de compte ?{" "}
                <Link href="/auth/signup" className="text-[#009A44] font-black hover:text-[#FF8200] transition-colors underline-offset-4 hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>

          {/* === FOOTER : WEBAPPCI.COM === */}
          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center sm:items-start animate-in fade-in delay-300 duration-700">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Conçu et propulsé par
            </p>
            <a 
              href="https://www.webappci.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-2 -ml-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <img 
                src="/logo-webappci.png" 
                alt="Logo WebAppCI" 
                className="h-12 w-12 rounded-xl object-contain shadow-sm group-hover:scale-110 transition-transform" 
              />
              <div>
                <span className="block font-black text-xl text-slate-900 tracking-tight leading-none group-hover:text-[#FF8200] transition-colors">
                  webappci.com
                </span>
                <span className="text-[10px] text-slate-500 font-bold">Solutions Numériques Innovantes</span>
              </div>
            </a>
            <p className="text-[10px] text-slate-400 mt-6 font-medium mx-auto sm:mx-0">
             © {new Date().getFullYear()} Agri-Lien CI. Tous droits réservés.
            </p>
          </div>
          
        </div>
      </div>
      
      {/* Section Image de fond (Desktop) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#009A44]/80 to-slate-900/80 mix-blend-multiply z-10" />
        <img 
          src="/hero-bg2.jpg"
          alt="Producteur de Cacao Ivoirien"
          className="absolute inset-0 w-full h-full object-cover animate-in zoom-in duration-[2s]"
       />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-20 text-white">
          <div className="bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl max-w-xl animate-in slide-in-from-right duration-700 delay-200">
            <Sprout className="w-12 h-12 text-[#FF8200] mb-6" />
            <h3 className="text-4xl font-black tracking-tight leading-tight mb-4">
              Traçabilité et Transparence <br/>de la Terre au Port.
            </h3>
            <p className="text-lg text-slate-200 font-medium leading-relaxed">
              La plateforme officielle pour sécuriser les revenus des producteurs et garantir la conformité des filières agricoles ivoiriennes aux standards internationaux (EUDR).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
