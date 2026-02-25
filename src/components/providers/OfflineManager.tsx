"use client";

import { useEffect } from "react";
// ✅ IMPORT CORRECT (Avec les accolades)
import { useSync } from "@/hooks/useSync";

export default function OfflineManager() {
  // 1. Active la surveillance réseau
  useSync(); 
  
  // 2. Enregistrement PWA
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker enregistré:", registration.scope);
        })
        .catch((error) => console.error("❌ Erreur Service Worker:", error));
    }
  }, []);

  return null; 
}
