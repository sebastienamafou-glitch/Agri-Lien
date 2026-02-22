"use client";

import { signOut } from "next-auth/react";

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center border-t-4 border-green-700">
        
        {/* Icône de sécurité (Cadenas) */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100">
          <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Textes explicatifs */}
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            Compte en attente
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            Votre inscription a bien été enregistrée sur le portail gouvernemental <strong>Agri-Lien CI</strong>.
          </p>
          
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left rounded-r-md">
            <p className="text-sm text-yellow-800 leading-relaxed">
              Pour des raisons de sécurité et de conformité à la norme EUDR, votre profil doit être vérifié par l'administration. 
              <br /><br />
              Vous recevrez une notification dès que votre accès sera activé par nos services.
            </p>
          </div>
        </div>

        {/* Bouton de déconnexion */}
        <div className="mt-8">
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
          >
            Se déconnecter et retourner à l'accueil
          </button>
        </div>
        
      </div>
    </div>
  );
}
