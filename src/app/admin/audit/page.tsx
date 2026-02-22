import prisma from "@/lib/prisma";
import { ShieldAlert, History, UserIcon, Database, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { firstName: true, lastName: true, role: true }
      }
    },
    take: 100 // On limite aux 100 dernières actions pour la performance
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" /> Registre d'Audit
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Traçabilité immuable des actions système (Exigence Banque Mondiale).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <th className="p-5">Horodatage</th>
                <th className="p-5">Acteur</th>
                <th className="p-5">Action</th>
                <th className="p-5">Entité Touchée</th>
                <th className="p-5 text-right">ID Référence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-medium text-sm">
                    Aucun historique enregistré.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">
                          {new Date(log.createdAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Système'}
                          </p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                            {log.user?.role || 'AUTO'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <Database className="w-4 h-4 text-slate-400" />
                        {log.entityType}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:border-slate-300 transition-colors">
                        {log.entityId.slice(0, 13)}...
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
