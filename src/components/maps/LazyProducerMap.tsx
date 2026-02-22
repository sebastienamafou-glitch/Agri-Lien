"use client"; // 👈 C'est ce mot-clé qui résout le problème

import dynamic from "next/dynamic";
import { Map as MapIcon } from "lucide-react";

// On configure l'import ici, dans un contexte Client
const ProducerMap = dynamic(() => import("./ProducerMap"), {
  ssr: false, // Maintenant c'est autorisé ici !
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400 rounded-xl">
      <MapIcon className="w-8 h-8 mb-2 opacity-50" />
      <span className="text-xs font-medium">Chargement cartographie...</span>
    </div>
  ),
});

export default ProducerMap;
