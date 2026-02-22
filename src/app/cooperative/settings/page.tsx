import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { redirect } from "next/navigation";
import { updateCooperativeSettings } from "@/app/actions/cooperative/settings";
import { 
  Settings, 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Save 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CooperativeSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  // Récupération des données actuelles de la coopérative
  const user = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    include: { cooperativeProfile: true }
  });

  if (!user || !user.cooperativeProfile) {
    redirect("/auth/login?error=ProfileNotFound");
  }

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-slate-400" /> Paramètres
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gérez les informations de votre coopérative et de votre compte.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-[#009A44] px-4 py-2 rounded-xl border border-green-100 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" /> Compte Vérifié
        </div>
      </div>

      {/* FORMULAIRE DE PARAMÈTRES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-900 flex items-center gap-2 text-lg uppercase tracking-wide">
            <Building2 className="w-5 h-5 text-[#FF8200]" /> Profil de la Coopérative
          </h2>
        </div>

        <div className="p-8">
          <form action={async (formData) => {
            "use server";
            await updateCooperativeSettings(formData);
          }} className="space-y-8">
            
            {/* SECTION: Identifiants (Lecture Seule) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Identifiant de Connexion</h3>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Numéro de Téléphone (Fixe)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    disabled 
                    defaultValue={user.phoneNumber}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Ce numéro est votre identifiant unique, il ne peut être modifié que par l'État.</p>
              </div>
            </div>

            {/* SECTION: Informations Coopérative */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Entité Juridique</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nom de la Coopérative</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      name="coopName"
                      required
                      defaultValue={user.cooperativeProfile.name}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:border-[#FF8200] focus:ring-2 focus:ring-[#FF8200]/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Région d'Opération</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      name="region"
                      required
                      defaultValue={user.cooperativeProfile.region}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:border-[#FF8200] focus:ring-2 focus:ring-[#FF8200]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: Informations Responsable */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Représentant Légal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nom</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      name="lastName"
                      required
                      defaultValue={user.lastName}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:border-[#FF8200] focus:ring-2 focus:ring-[#FF8200]/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Prénoms</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      name="firstName"
                      required
                      defaultValue={user.firstName}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:border-[#FF8200] focus:ring-2 focus:ring-[#FF8200]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOUTON DE SOUMISSION */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit"
                className="bg-[#0f172a] hover:bg-[#FF8200] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 transition-colors active:scale-95 shadow-lg"
              >
                <Save className="w-5 h-5" />
                Enregistrer les modifications
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}
