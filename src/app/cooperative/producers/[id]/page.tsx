import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import DownloadCardButton from "@/components/pdf/DownloadCardButton";
import ProducerMap from "@/components/maps/LazyProducerMap"; 
import { 
  User as UserIcon, 
  Map as MapIcon, 
  Phone, 
  ShieldCheck, 
  Sprout, 
  QrCode, 
  History, 
  Edit, 
  ArrowLeft,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

// Note: On pourrait utiliser le Singleton prisma ici aussi !
const prisma = new PrismaClient();

type Props = {
  params: Promise<{ id: string }>;
}

export default async function ProducerDetailPage(props: Props) {
  const params = await props.params;
  const id = params.id; 
  
  const producer = await prisma.user.findFirst({
    where: {
      producerProfile: {
        id: id 
      }
    },
    include: {
      producerProfile: {
        include: {
          farmPlots: true,
          harvests: {
             take: 5,
             orderBy: { declaredAt: 'desc' }
          }
        }
      }
    }
  });

  if (!producer) return notFound();

  const profile = producer.producerProfile;
  const plots = profile?.farmPlots || [];
  
  const totalArea = plots.reduce((acc, plot) => acc + (plot.areaHectares || 0), 0);
  const totalYield = plots.reduce((acc, plot) => acc + (plot.estimatedYield || 0), 0);
  
  const isVerified = producer.nationalIdHash && plots.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          {/* ✅ CORRECTION : Lien vers /cooperative au lieu de /admin */}
          <Link 
            href="/cooperative/producers" 
            className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {producer.lastName} {producer.firstName}
              {isVerified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Vérifié
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 uppercase tracking-wide">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Incomplet
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-3 mt-1 font-medium">
              <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" /> {producer.phoneNumber}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>Enrôlé le {new Date(producer.createdAt).toLocaleDateString('fr-CI')}</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <DownloadCardButton producer={producer as any} />
           {/* ✅ CORRECTION : Lien vers /cooperative au lieu de /admin */}
           <Link 
            href={`/cooperative/producers/${producer.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF8200] border border-[#e57600] rounded-lg text-sm font-bold text-white hover:bg-orange-700 transition-colors shadow-sm shadow-orange-100"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLONNE GAUCHE */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#009A44] to-[#007a36] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
             <div className="flex justify-between items-start relative z-10">
               <div>
                 <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Score de Crédibilité</p>
                 <h2 className="text-5xl font-extrabold mt-2 tracking-tighter">500</h2>
                 <p className="text-xs text-green-200 mt-1 font-medium">Points (Initial)</p>
               </div>
               <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                 <Sprout className="w-8 h-8 text-white" />
               </div>
             </div>
             <div className="mt-6">
               <div className="flex justify-between text-xs font-medium text-green-100 mb-1">
                 <span>Qualité</span>
                 <span>Standard</span>
               </div>
               <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                 <div className="bg-[#FF8200] h-full w-1/2 rounded-full shadow-[0_0_10px_rgba(255,130,0,0.5)]"></div>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center border-b border-gray-100 pb-2">
               <ShieldCheck className="w-4 h-4 mr-2 text-[#FF8200]" /> 
               Identité Numérique
            </h3>
            <div className="space-y-5">
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Identifiant Unique (UUID)</label>
                 <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1.5 rounded border border-gray-200 w-full truncate select-all">
                      {producer.id}
                    </code>
                 </div>
               </div>
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Empreinte CNI (Hash)</label>
                 {producer.nationalIdHash ? (
                   <code className="text-xs font-mono text-green-700 bg-green-50 px-2 py-1.5 rounded border border-green-100 w-full truncate block">
                     {producer.nationalIdHash}
                   </code>
                 ) : (
                   <span className="text-xs text-red-500 italic flex items-center">
                     <AlertTriangle className="w-3 h-3 mr-1" /> Non renseigné
                   </span>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-700 rounded-xl">
                  <MapIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Surface Totale</p>
                  <p className="text-2xl font-extrabold text-gray-900">{totalArea.toFixed(2)} <span className="text-sm font-medium text-gray-500">Ha</span></p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Potentiel An.</p>
                  <p className="text-2xl font-extrabold text-gray-900">{totalYield} <span className="text-sm font-medium text-gray-500">Tonnes</span></p>
                </div>
              </div>
           </div>

           {/* CARTE */}
           <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
              <div className="h-80 w-full relative rounded-xl overflow-hidden border border-gray-100">
                 <ProducerMap plots={plots as any} />
                 <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 shadow-sm z-[1000] border border-gray-200">
                    🌍 Vue Satellite • {plots.length} parcelle(s)
                 </div>
              </div>
           </div>

           {/* PARCELLES */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                 Parcelles Enregistrées ({plots.length})
               </h3>
             </div>
             <div className="divide-y divide-gray-100">
               {plots.map((plot) => (
                 <div key={plot.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                         <MapIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{plot.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <span className="font-medium text-gray-700">{plot.areaHectares} Ha</span>
                        </p>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
           </div>

           {/* HISTORIQUE RÉCOLTES */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
               <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center gap-2">
                 <History className="w-4 h-4 text-gray-400" /> Historique Récoltes
               </h3>
             </div>
             <div className="divide-y divide-gray-100">
               {profile?.harvests.map((harvest) => (
                 <div key={harvest.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       {/* ✅ CORRECTION : Utilisation de harvest.unit (LITRE, KG, etc) */}
                       <div className="h-10 w-10 bg-orange-50 text-[#FF8200] rounded-lg flex items-center justify-center font-bold text-xs">
                         {harvest.unit}
                       </div>
                       <div>
                          {/* ✅ CORRECTION : Utilisation de harvest.quantity et affichage dynamique de l'unité */}
                          <p className="text-sm font-bold text-gray-900">
                            {harvest.quantity} {harvest.unit.toLowerCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(harvest.declaredAt).toLocaleDateString('fr-CI')} • {harvest.cropType}
                          </p>
                       </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      harvest.status === 'VALIDATED' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                       {harvest.status}
                    </span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
