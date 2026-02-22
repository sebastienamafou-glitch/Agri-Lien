import prisma from "@/lib/prisma";
import { Users, Phone, Calendar, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Fonction utilitaire pour les couleurs des rôles
  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-red-50 text-red-600 border-red-100';
      case 'COOPERATIVE': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'PRODUCER': return 'bg-green-50 text-[#009A44] border-green-100';
      case 'TRANSPORTER': return 'bg-orange-50 text-[#FF8200] border-orange-100';
      case 'BANK': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" /> Utilisateurs
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Annuaire centralisé de tous les acteurs du réseau Agri-Lien CI.
          </p>
        </div>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          Total: {users.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((u) => (
          <div key={u.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg uppercase border ${getRoleBadge(u.role)}`}>
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">
                    {u.lastName} {u.firstName}
                  </h3>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${getRoleBadge(u.role)}`}>
                    {u.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                {u.phoneNumber}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#009A44]" />
                  <span className="font-mono text-xs text-slate-400">UUID vérifié</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {new Date(u.createdAt).toLocaleDateString('fr-CI')}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
