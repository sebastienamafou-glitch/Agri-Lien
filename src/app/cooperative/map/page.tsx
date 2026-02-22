import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/infrastructure/auth/auth.config"; 
import { Map as MapIcon, Maximize, Layers, Truck } from "lucide-react";
import dynamic from "next/dynamic";

// ✅ LE SECRET EST ICI : Chargement dynamique sans SSR
const AdminGlobalMap = dynamic(() => import("@/components/maps/AdminGlobalMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-[2.5rem] animate-pulse">
      <MapIcon className="w-10 h-10 text-slate-300 mb-4" />
      <p className="text-sm font-bold text-slate-400">Chargement des données satellites...</p>
    </div>
  )
});

export default async function AdminMapPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  // 1. Extraction Magique PostGIS : On convertit les polygones en GeoJSON
  const rawPlots: any[] = await prisma.$queryRaw`
    SELECT 
      f.id, 
      f.name, 
      f."areaHectares", 
      u."firstName", 
      u."lastName",
      ST_AsGeoJSON(f.location)::json as geojson
    FROM "FarmPlot" f
    JOIN "ProducerProfile" p ON f."producerId" = p.id
    JOIN "User" u ON p."userId" = u.id
    WHERE f.location IS NOT NULL
  `;

  const mappedPlots = rawPlots.map(p => ({
    id: p.id,
    name: p.name,
    areaHectares: p.areaHectares,
    producerName: `${p.lastName} ${p.firstName}`,
    geojson: typeof p.geojson === 'string' ? JSON.parse(p.geojson) : p.geojson
  }));

  // 2. Récupération des points de transports en cours (Camions sur le terrain)
  const activeTransports: any[] = await prisma.$queryRaw`
    SELECT 
      id,
      ST_Y("pickupLocation"::geometry) as lat, 
      ST_X("pickupLocation"::geometry) as lng
    FROM "TransportOrder"
    WHERE status IN ('PENDING', 'IN_PROGRESS')
  `;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-6rem)] flex flex-col pb-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-[#009A44] p-2 rounded-xl text-white shadow-sm shadow-green-900/20">
              <MapIcon className="w-6 h-6" />
            </div>
            Carte & Parcelles
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-sm">
            Supervision géospatiale (EUDR) et suivi de la flotte en temps réel.
          </p>
        </div>

        {/* Légendes / KPIs rapides */}
        <div className="flex gap-3">
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Layers className="w-6 h-6 text-[#009A44]" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Polygones</p>
              <p className="text-xl font-black leading-none text-slate-900">{mappedPlots.length}</p>
            </div>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Truck className="w-6 h-6 text-[#FF8200]" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En mouvement</p>
              <p className="text-xl font-black leading-none text-slate-900">{activeTransports.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE DE CARTE */}
      <div className="flex-1 bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 relative">
        <div className="absolute top-6 right-6 z-10">
          <button className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-sm text-slate-600 hover:text-[#009A44] hover:border-green-200 transition-colors active:scale-95">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
        
        {/* Affichage de la carte dynamique */}
        <AdminGlobalMap plots={mappedPlots} transportPoints={activeTransports} />
      </div>

    </div>
  );
}
