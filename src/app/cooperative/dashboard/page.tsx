import { getDashboardStats } from "@/app/actions/dashboard/getDashboardStats";
import { 
  Users, 
  Map, 
  Trees, 
  PackageCheck, 
  Sprout,
  CalendarClock
} from "lucide-react";

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-CI').format(num);
};

export default async function cooperativeDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vue d'ensemble</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Données temps réel • Campagne 2026
          </p>
        </div>
        <div className="text-[10px] font-black tracking-widest uppercase text-slate-400 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#009A44] animate-pulse"></span>
          LIVE: {new Date().toLocaleTimeString('fr-CI')}
        </div>
      </div>

      {/* Les 4 Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 : Producteurs */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Producteurs</p>
              <h3 className="text-4xl font-black text-slate-900 mt-2 leading-none">
                {formatNumber(stats.producers)}
              </h3>
              <p className="text-xs text-green-600 font-bold mt-2 bg-green-50 inline-flex px-2 py-1 rounded-lg">Actifs sur la plateforme</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <Users className="w-6 h-6 text-[#FF8200]" />
            </div>
          </div>
        </div>

        {/* KPI 2 : Superficie */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hectares (Ha)</p>
              <h3 className="text-4xl font-black text-slate-900 mt-2 leading-none">
                {formatNumber(stats.totalArea)}
              </h3>
              <p className="text-xs text-[#009A44] font-bold mt-2 bg-green-50 inline-flex px-2 py-1 rounded-lg">Cartographiés GPS</p>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
              <Map className="w-6 h-6 text-[#009A44]" />
            </div>
          </div>
        </div>

        {/* KPI 3 : Potentiel */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Potentiel (Kg)</p>
              <h3 className="text-4xl font-black text-slate-900 mt-2 leading-none">
                {formatNumber(stats.totalYield)}
              </h3>
              <p className="text-xs text-blue-600 font-bold mt-2 bg-blue-50 inline-flex px-2 py-1 rounded-lg">Prévisions Récolte</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <Trees className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* KPI 4 : STOCK RÉEL */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 z-0"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Magasin</p>
              <h3 className="text-4xl font-black text-slate-900 mt-2 leading-none">
                {formatNumber(stats.realStock)} <span className="text-xl text-slate-400">kg</span>
              </h3>
              <p className="text-xs text-purple-600 font-bold mt-2 bg-purple-50 inline-flex px-2 py-1 rounded-lg border border-purple-100">Pesé & Validé</p>
            </div>
            <div className="p-4 bg-purple-100 rounded-2xl border border-purple-200">
              <PackageCheck className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Activité Récente */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-slate-400" />
            Dernières Activités
          </h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {stats.recentActivity.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              Aucune activité récente.
            </div>
          ) : (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100">
                    <Sprout className="w-6 h-6 text-[#009A44]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{activity.description}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {activity.source} • {new Date(activity.date).toLocaleDateString('fr-CI')}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-50 text-[#009A44] border border-green-100">
                  {activity.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
