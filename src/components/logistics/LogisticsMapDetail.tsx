"use client";

import dynamic from "next/dynamic";
import { Loader2, Map as MapIcon } from "lucide-react";

const Map = dynamic(() => import("./LogisticsMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-slate-400">
      <div className="relative mb-4">
        <MapIcon className="w-12 h-12 opacity-20" />
        <Loader2 className="w-6 h-6 animate-spin absolute bottom-0 right-0 text-[#FF8200]" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Initialisation PostGIS...
      </span>
    </div>
  )
});

interface Props {
  pickup: { lat: number; lng: number };
  dropoff: { lat: number; lng: number };
}

export default function LogisticsMapDetail({ pickup, dropoff }: Props) {
  return (
    <div className="w-full h-full relative">
      {/* On empêche le clic car c'est une vue de détail (readonly) */}
      <div className="absolute inset-0 z-[500] cursor-default"></div>
      
      <Map 
        onLocationSelect={() => {}} 
        pickup={pickup}
        dropoff={dropoff}
      />
    </div>
  );
}
