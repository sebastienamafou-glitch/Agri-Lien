"use client";

import { useEffect } from "react";
import { useSync } from "@/hooks/useSync";

export default function OfflineManager() {
  // 1. Active la surveillance réseau et la synchronisation automatique Dexie -> Prisma
  useSync(); 
  
  // 2. ✅ Enregistrement du Service Worker pour transformer le site en PWA
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker enregistré avec succès (Portée:", registration.scope, ")");
        })
        .catch((error) => {
          console.error("❌ Erreur lors de l'enregistrement du Service Worker:", error);
        });
    }
  }, []);

  // Il ne retourne rien visuellement (composant "fantôme")
  return null; 
}
