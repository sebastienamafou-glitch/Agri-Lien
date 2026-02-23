import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, ShieldCheck } from "lucide-react";
import { UserRole } from "@prisma/client";

export default function CreateUserPage() {
  
  // ✅ ACTION SERVEUR : Création directe par l'Admin
  async function createUserAction(formData: FormData) {
    "use server";
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    let phoneNumber = formData.get("phoneNumber") as string;
    const role = formData.get("role") as UserRole;

    if (!firstName || !lastName || !phoneNumber || !role) return;

    // Normalisation du numéro
    phoneNumber = phoneNumber.replace(/\s/g, '');
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+225${phoneNumber}`;
    }

    try {
      await prisma.user.create({
        data: {
          firstName,
          lastName,
          phoneNumber,
          role: role, // On lui donne directement son rôle officiel
          nationalIdHash: "CERTIFIÉ_PAR_ADMIN", 
        }
      });
    } catch (error) {
      console.error("Erreur de création:", error);
      // Gérer l'erreur (ex: numéro déjà existant)
    }

    // Redirection vers le tableau des utilisateurs une fois terminé
    redirect("/admin/users");
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#009A44]" />
            Ajouter un acteur certifié
          </h1>
          <p className="text-slate-500 text-sm mt-1">Créez un profil officiel. L'utilisateur pourra se connecter immédiatement avec son numéro.</p>
        </div>
      </div>

      {/* Formulaire */}
      <form action={createUserAction} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-green-50/50 border-b border-slate-100 p-6 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-[#009A44] shrink-0" />
          <p className="text-sm text-green-800 font-medium">
            Les comptes créés depuis cette interface sont automatiquement validés et contournent le processus de vérification publique.
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prénom</label>
              <input type="text" name="firstName" required className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-[#009A44] focus:border-transparent outline-none transition" placeholder="Ex: Jean" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nom de famille</label>
              <input type="text" name="lastName" required className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-[#009A44] focus:border-transparent outline-none transition" placeholder="Ex: Kouassi" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Numéro de téléphone (Connexion)</label>
            <input type="tel" name="phoneNumber" required className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:ring-2 focus:ring-[#009A44] focus:border-transparent outline-none transition font-mono" placeholder="Ex: 0102030405" />
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-6">
            <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Rôle officiel à attribuer</label>
            <select name="role" required className="w-full bg-white border-2 border-slate-200 text-slate-900 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-bold cursor-pointer appearance-none">
              <option value="">-- Sélectionner le rôle du profil --</option>
              <option value="COOPERATIVE">🏢 Coopérative (Gestionnaire)</option>
              <option value="TRANSPORTER">🚛 Transporteur (Chauffeur Logistique)</option>
              <option value="BANK">🏦 Banque / Agent Financier</option>
              <option value="ADMIN">🛡️ Administrateur Système</option>
            </select>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-black tracking-wide transition-colors flex items-center gap-2 active:scale-95 shadow-lg shadow-slate-900/20">
            <UserPlus className="w-5 h-5" />
            Créer et Activer le compte
          </button>
        </div>
      </form>
    </div>
  );
}
