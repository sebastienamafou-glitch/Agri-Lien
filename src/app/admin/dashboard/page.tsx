import prisma from "@/lib/prisma";
import { 
  Users, 
  Sprout, 
  Wallet, 
  Truck, 
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic"; // Force le rechargement en temps réel

export default async function AdminDashboardPage() {
  // 1. Récupération des statistiques Utilisateurs
  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
  });

  const totalProducers = usersByRole.find(u => u.role === 'PRODUCER')?._count.id || 0;
  const totalCooperatives = usersByRole.find(u => u.role === 'COOPERATIVE')?._count.id || 0;
  const totalTransporters = usersByRole.find(u => u.role === 'TRANSPORTER')?._count.id || 0;

  // 2. Volumes déclarés par filière (Multi-crops)
  const volumesByCrop = await prisma.harvest.groupBy({
    by: ['cropType', 'unit'],
    _sum: { quantity: true },
    where: { status: 'VALIDATED' }
  });

  // 3. Flux financiers (Mobile Money / Banque)
  const financial = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { status: 'SUCCESS' }
  });

  // 4. Logistique en cours
  const activeTransports = await prisma.transportOrder.count({
    where: { status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] } }
  });

  // 5. Derniers logs d'audit (Sécurité)
  const recentAudits = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      
      {/* EN-TÊTE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vue d'ensemble</h1>
          <p className="text-slate-500 font-medium mt-1">
            Supervision nationale des filières agricoles (Norme EUDR).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-[#009A44] px-4 py-2 rounded-xl border border-green-100 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" /> Système Sécurisé
        </div>
      </div>

      {/* KPI GLOBAUX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between group">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Acteurs Réseau</p>
            <p className="text-3xl font-black text-slate-900">{totalProducers + totalCooperatives + totalTransporters}</p>
            <p className="text-xs font-bold text-blue-500 mt-2 flex items-center gap-1">
              <Users className="w-3 h-3" /> {totalProducers} Producteurs
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between group">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transports Actifs</p>
            <p className="text-3xl font-black text-slate-900">{activeTransports}</p>
            <Link href="/admin/logistics" className="text-xs font-bold text-[#FF8200] mt-2 flex items-center gap-1 hover:underline">
              Voir la carte <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-3 bg-orange-50 text-[#FF8200] rounded-2xl group-hover:scale-110 transition-transform">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start justify-between group lg:col-span-2">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Financier (Succès)</p>
            <p className="text-3xl font-black text-slate-900 flex items-baseline gap-2">
              {(financial._sum.amount || 0).toLocaleString('fr-FR')} <span className="text-sm text-slate-400">FCFA</span>
            </p>
            <p className="text-xs font-bold text-[#009A44] mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Paiements garantis
            </p>
          </div>
          <div className="p-3 bg-green-50 text-[#009A44] rounded-2xl group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* VOLUMES PAR FILIÈRE */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-black text-slate-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#009A44]" /> Volumes Certifiés par Filière
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {volumesByCrop.length === 0 ? (
              <p className="text-slate-400 text-sm col-span-full text-center py-8 font-medium">Aucun volume validé pour le moment.</p>
            ) : (
              volumesByCrop.map((v, i) => (
                <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{v.cropType}</p>
                  <p className="text-2xl font-black text-slate-900">
                    {v._sum.quantity || 0} <span className="text-xs text-slate-400 uppercase">{v.unit}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* REGISTRE D'AUDIT RAPIDE */}
        <div className="bg-[#0f172a] rounded-3xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" /> Logs Sécurité
            </h2>
            <Link href="/admin/audit" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            {recentAudits.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">Aucune activité récente.</p>
            ) : (
              recentAudits.map((audit) => (
                <div key={audit.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                  <div>
                    <p className="text-xs font-bold text-white">{audit.action}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {audit.user.firstName} • {new Date(audit.createdAt).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
