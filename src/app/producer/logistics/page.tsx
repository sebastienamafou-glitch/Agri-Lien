import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { Truck, MapPin, Clock, Navigation, CheckCircle2, ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { requestTransport } from "@/app/actions/logistics/logistics";
import { redirect } from "next/navigation";

export default async function ProducerLogisticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) redirect("/auth/login");

  // Récupérer les demandes de transport de ce producteur
  const user = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    include: {
      producerProfile: {
        include: {
          transportOrders: {
            // ✅ MAINTENANT CELA FONCTIONNE : On trie par la dernière mise à jour
            orderBy: { updatedAt: 'desc' }, 
            include: { transporter: { include: { user: true } } }
          }
        }
      }
    }
  });

  const orders = user?.producerProfile?.transportOrders || [];
  
  // On cherche s'il y a une commande active (Pas encore finie ou annulée)
  const activeOrder = orders.find(o => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(o.status));

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-sans">
      
      {/* HEADER TYPE "UBER" */}
      <div className="bg-[#0f172a] text-white p-6 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between mb-8">
          <Link href="/producer/dashboard" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-black tracking-tight">Logistique</h1>
          <div className="w-10"></div> 
        </div>

        <div className="relative z-10 text-center mb-4">
          <div className="w-20 h-20 bg-[#FF8200] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,130,0,0.3)]">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black">Besoin d'un camion ?</h2>
          <p className="text-slate-400 text-sm mt-1">
            Faites enlever vos lots scannés directement sur votre parcelle.
          </p>
        </div>
      </div>

      <main className="px-4 -mt-6 relative z-20 space-y-6">
        
        {/* BOUTON D'APPEL */}
        {!activeOrder ? (
          <form action={async () => {
            "use server";
            await requestTransport();
          }}>
            <button 
              type="submit"
              className="w-full bg-[#009A44] text-white p-5 rounded-2xl shadow-xl shadow-green-900/20 font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <Navigation className="w-6 h-6" />
              Demander un Enlèvement
            </button>
          </form>
        ) : (
          <div className="bg-orange-50 border border-[#FF8200]/30 p-5 rounded-2xl shadow-sm flex items-center gap-4 animate-pulse">
            <div className="bg-[#FF8200] p-3 rounded-full text-white shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-orange-900">Demande en cours</p>
              <p className="text-sm text-orange-700">
                {activeOrder.status === 'PENDING' ? "Recherche d'un transporteur..." : 
                 activeOrder.status === 'ACCEPTED' ? "Camion en approche !" : 
                 "Transport vers le magasin."}
              </p>
            </div>
          </div>
        )}

        {/* HISTORIQUE DES COURSES */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-black text-slate-900 text-lg mb-4">Vos Transports</h3>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Truck className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Aucun historique de transport.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-slate-100 p-4 rounded-2xl flex flex-col gap-3 hover:border-slate-200 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {/* On affiche la date de dernière mise à jour */}
                        {new Date(order.updatedAt).toLocaleDateString('fr-CI', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    {/* BADGE DE STATUT */}
                    {order.status === 'PENDING' && <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-md uppercase">En recherche</span>}
                    {order.status === 'ACCEPTED' && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md uppercase">Accepté</span>}
                    {order.status === 'IN_PROGRESS' && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md uppercase animate-pulse">En route</span>}
                    {order.status === 'COMPLETED' && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Livré</span>}
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#FF8200]"></div>
                      <div className="w-0.5 h-6 bg-slate-200 my-1"></div>
                      <MapPin className="w-4 h-4 text-[#009A44]" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Départ</p>
                        <p className="text-sm font-bold text-slate-900">Votre Parcelle</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Arrivée</p>
                        <p className="text-sm font-bold text-slate-900">Magasin Coopérative</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Affichage du transporteur si assigné */}
                  {order.transporter && (
                    <div className="mt-2 pt-3 border-t border-slate-50 flex items-center gap-2">
                       <Truck className="w-3.5 h-3.5 text-slate-400" />
                       <span className="text-xs font-medium text-slate-600">
                         Chauffeur : <span className="text-slate-900 font-bold">{order.transporter.user.lastName}</span> ({order.transporter.vehicleType})
                       </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
