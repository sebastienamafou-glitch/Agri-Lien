import { getProducerDashboardData } from "@/app/actions/dashboard/producer-dashboard";
import LogoutButton from "@/components/dashboard/LogoutButton";
import VoiceAssistantButton from "@/components/dashboard/VoiceAssistantButton";
import { 
  LayoutDashboard, 
  Sprout, 
  QrCode, 
  Truck, 
  Star, 
  Map as MapIcon, 
  Wallet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Banknote
} from 'lucide-react';
import Link from "next/link";

export default async function ProducerDashboardPage() {
  const data = await getProducerDashboardData();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center max-w-sm w-full animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="font-black text-2xl text-slate-900 mb-2 tracking-tight">Profil incomplet</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
            Votre compte n'est pas encore lié à un profil producteur. Veuillez contacter votre coopérative.
          </p>
          <Link href="/auth/login" className="flex items-center justify-center gap-2 w-full py-4 bg-[#0f172a] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20">
            Retour <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-[#009A44] selection:text-white">
      
      {/* HEADER IMMERSIF (Style App Native) */}
      <header className="bg-gradient-to-b from-[#009A44] to-[#007A33] text-white pt-8 pb-20 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-10 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-green-100 text-[10px] font-black uppercase tracking-widest mb-1 opacity-90">Espace Producteur</p>
            <h1 className="text-3xl font-black tracking-tight leading-none">Salut, {data.identity.firstName} 👋</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-black/10 p-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <VoiceAssistantButton />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="px-5 -mt-12 space-y-6 relative z-20">
        
        {/* CARTE SCORE AGRICOLE */}
        <div className="bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
            <div className={`relative p-3.5 rounded-2xl transition-transform group-hover:scale-110 ${data.stats.score > 500 ? 'bg-gradient-to-br from-yellow-100 to-orange-50 text-[#FF8200] border border-orange-100' : 'bg-slate-100 text-slate-400'}`}>
              <Star className="w-7 h-7" fill="currentColor" />
              {data.stats.score > 500 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Score Agricole</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">{data.stats.score}</span>
                <span className="text-xs text-slate-400 font-bold">/ 1000</span>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-[#009A44] group-hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* ACTIONS RAPIDES */}
        <section className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <Link href="/producer/harvest/new" className="bg-gradient-to-br from-white to-green-50/50 p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-3 transition-all active:scale-95 hover:border-[#009A44]/30 hover:shadow-md group">
            <div className="bg-white p-4 rounded-2xl text-[#009A44] shadow-sm border border-green-100 group-hover:bg-[#009A44] group-hover:text-white transition-colors">
              <Sprout className="w-7 h-7" />
            </div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide text-center">Déclarer<br/>Récolte</span>
          </Link>
          
          <Link href="/producer/scan" className="bg-gradient-to-br from-white to-blue-50/50 p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center gap-3 transition-all active:scale-95 hover:border-blue-300 hover:shadow-md group">
            <div className="bg-white p-4 rounded-2xl text-blue-600 shadow-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <QrCode className="w-7 h-7" />
            </div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide text-center">Scanner<br/>Lot (QR)</span>
          </Link>
        </section>

        {/* EXPLOITATIONS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-slate-900 font-black text-lg tracking-tight">Mes Parcelles</h3>
             <span className="text-[9px] font-black text-[#009A44] bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-100 uppercase tracking-widest flex items-center gap-1">
               <CheckCircle2 className="w-3 h-3" /> Certifié
             </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                 <MapIcon className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Surface</span>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {data.stats.totalArea} <span className="text-xs font-bold text-slate-400">Ha</span>
              </p> 
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                 <LayoutDashboard className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Champs</span>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {data.stats.plotCount} <span className="text-xs font-bold text-slate-400">Total</span>
              </p>
            </div>
          </div>
        </section>

        {/* TRAÇABILITÉ */}
        <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex justify-between items-end px-2">
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Suivi logistique</h3>
            <button className="text-[#FF8200] text-[10px] font-black uppercase tracking-widest hover:underline">Voir tout</button>
          </div>
          
          {data.lastTraceability ? (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${data.lastTraceability.status === 'DECLARED' ? 'bg-blue-500' : 'bg-[#009A44]'}`}></div>
              
              <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-100">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Lot #{data.lastTraceability.id.slice(0, 8)}</p>
                    {/* ✅ CORRECTION : Remplacement de bagCount/weight/sacs/Kg par batchCount/quantity/lots/unité dynamique */}
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      {data.lastTraceability.batchCount} lots • {data.lastTraceability.quantity} {data.lastTraceability.unit.toLowerCase()}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                  data.lastTraceability.status === 'DECLARED' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-[#009A44]'
                }`}>
                  {data.lastTraceability.status === 'DECLARED' ? 'En attente' : data.lastTraceability.status}
                </span>
              </div>
              
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden ml-2">
                <div className={`h-full rounded-full relative overflow-hidden transition-all duration-1000 ${data.lastTraceability.status === 'DECLARED' ? 'w-1/3 bg-blue-500' : 'w-full bg-[#009A44]'}`}>
                  <div className="absolute top-0 bottom-0 left-0 right-0 bg-white/30 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          ) : (
             <div className="bg-white rounded-3xl p-8 text-center shadow-sm border-2 border-slate-100 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 font-bold">Aucune récolte en cours d'acheminement.</p>
            </div>
          )}
        </section>

        {/* PAIEMENTS */}
        <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 delay-300">
          <h3 className="font-black text-slate-900 text-lg tracking-tight px-2">Derniers Règlements</h3>
          
          {data.transactions.length > 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
              {data.transactions.map((tx, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#009A44]/10 p-3 rounded-2xl border border-[#009A44]/20 text-[#009A44]">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{tx.amount} FCFA</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {new Date(tx.date).toLocaleDateString('fr-FR')} • {tx.provider}
                      </p>
                    </div>
                  </div>
                  <div className="text-[#009A44] flex flex-col items-end">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border-2 border-slate-100 border-dashed">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 font-bold">Aucune transaction récente.</p>
            </div>
          )}
        </section>
      </main>

      {/* NAVIGATION BAS */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 px-6 py-4 flex justify-between items-center z-40 pb-safe shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.05)]">
        
        <Link href="/producer/dashboard" className="flex flex-col items-center gap-1.5 text-[#009A44] group">
          <div className="relative">
             <LayoutDashboard className="w-6 h-6 group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />
             <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#009A44] rounded-full"></div>
          </div>
          <span className="text-[9px] font-black tracking-widest uppercase">Accueil</span>
        </Link>
        
        <Link href="/producer/logistics" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#FF8200] transition group">
          <Truck className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Transport</span>
        </Link>
        
        <Link href="/producer/plots" className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#FF8200] transition group">
          <MapIcon className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Parcelles</span>
        </Link>
        
        <button className="flex flex-col items-center gap-1.5 text-slate-300 transition cursor-not-allowed">
          <Banknote className="w-6 h-6" />
          <span className="text-[9px] font-bold tracking-widest uppercase">Crédit</span>
        </button>

      </nav>
    </div>
  );
}
