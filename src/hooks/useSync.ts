"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks"; 
import { db } from "@/lib/db"; 
import { syncHarvest } from "@/app/actions/sync"; 
import { processScan } from "@/app/actions/traceability/scan"; // ✅ On importe l'action des scans
import { toast } from "sonner"; 

export function useSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Surveillance des objets "Non Synchronisés"
  const pendingHarvests = useLiveQuery(
    () => db.harvests.where("isSynced").equals(0).toArray()
  ) || []; // Valeur par défaut pour éviter les undefined

  // ✅ Surveillance des scans en attente
  const pendingScans = useLiveQuery(
    () => db.scans.where("isSynced").equals(0).toArray()
  ) || [];

  // 2. Détection Réseau
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync(); // Déclenche la synchro au retour du réseau
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 3. Fonction de Synchronisation Massive
  const triggerSync = async () => {
    const harvestsToSync = await db.harvests.where("isSynced").equals(0).toArray();
    const scansToSync = await db.scans.where("isSynced").equals(0).toArray();

    if (harvestsToSync.length === 0 && scansToSync.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;

    toast.info("Connexion rétablie : Synchronisation en cours...", {
      icon: "📶"
    });

    // A. Synchronisation des Récoltes
    for (const harvest of harvestsToSync) {
      const result = await syncHarvest({
        producerId: harvest.producerId,
        farmPlotId: harvest.farmPlotId,
        weightKg: harvest.weightKg,
        scannedAt: harvest.scannedAt
      });

      if (result.success && harvest.id) {
        await db.harvests.delete(harvest.id);
        successCount++;
      }
    }

    // B. ✅ Synchronisation des Scans de Sacs
    for (const scan of scansToSync) {
      const result = await processScan(scan.qrCode);

      // Si c'est un succès, ou si le serveur nous dit que le code est déjà utilisé
      // on supprime le scan local pour éviter qu'il ne bloque la file d'attente indéfiniment.
      if ((result.success || result.message?.includes("déjà")) && scan.id) {
        await db.scans.delete(scan.id);
        successCount++;
      }
    }

    setIsSyncing(false);
    if (successCount > 0) {
      toast.success(`${successCount} éléments synchronisés avec succès !`);
    }
  };

  return { 
    isOnline, 
    isSyncing, 
    // Le compteur total inclut maintenant les récoltes et les scans
    pendingCount: pendingHarvests.length + pendingScans.length 
  };
}
