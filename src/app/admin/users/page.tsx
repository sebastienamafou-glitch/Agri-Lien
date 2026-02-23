import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { ShieldAlert, CheckCircle, UserPlus, Clock } from "lucide-react";
import Link from "next/link"; // ✅ Import correct pour la navigation

// ✅ ACTION SERVEUR : Modifie le rôle dans la base de données
async function validateUserAction(formData: FormData) {
  "use server";
  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as UserRole;

  if (userId && newRole) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    // Rafraîchit la page instantanément après la mise à jour
    revalidatePath("/admin/users");
  }
}

export default async function AdminUsersPage() {
  // Récupération des utilisateurs en attente
  const pendingUsers = await prisma.user.findMany({
    where: { role: "PENDING" as UserRole },
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* En-tête de la page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Accès</h1>
          <p className="text-slate-500 mt-1">Validez et attribuez les rôles aux nouveaux inscrits.</p>
        </div>
        
        {/* ✅ Bouton activé pour créer un utilisateur manuellement */}
        <Link 
          href="/admin/users/create" 
          className="flex items-center gap-2 bg-[#009A44] hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          <span>Créer un acteur certifié</span>
        </Link>
      </div>

      {/* Section des comptes en attente */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-yellow-50 border-b border-yellow-100 p-5 flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-yellow-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-yellow-900">Comptes en attente de validation</h2>
            <p className="text-sm text-yellow-700">Ces utilisateurs n'ont actuellement aucun accès au système.</p>
          </div>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-medium text-lg">Aucun compte en attente</p>
            <p className="text-sm">Votre système est à jour.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-bold">Utilisateur</th>
                  <th className="p-4 font-bold">Téléphone</th>
                  <th className="p-4 font-bold">Statut Actuel</th>
                  <th className="p-4 font-bold">Action (Assigner un rôle)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                    </td>
                    <td className="p-4 font-mono text-sm text-slate-600">{user.phoneNumber}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                        <Clock className="w-3.5 h-3.5" />
                        En attente
                      </span>
                    </td>
                    <td className="p-4">
                      {/* Formulaire d'action direct */}
                      <form action={validateUserAction} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <select 
                          name="role" 
                          required
                          className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-[#009A44] focus:border-[#009A44] block w-full p-2"
                        >
                          <option value="">-- Choisir un rôle --</option>
                          <option value="COOPERATIVE">Coopérative</option>
                          <option value="TRANSPORTER">Transporteur</option>
                          <option value="BANK">Banque</option>
                          <option value="ADMIN">Administrateur</option>
                        </select>
                        <button 
                          type="submit" 
                          className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg transition-colors"
                          title="Valider"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
