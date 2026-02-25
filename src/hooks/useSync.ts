"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks"; 
import { db } from "@/lib/db"; 
import { syncHarvest } from "@/app/actions/sync"; 
import { processScan } from "@/app/actions/traceability/scan"; 
import { toast } from "sonner"; 

export function useSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Surveillance des objets "Non Synchronisés"
  const pendingHarvests = useLiveQuery(
    () => db.harvests.where("isSynced").equals(0).toArray()
  ) || [];

  const pendingScans = useLiveQuery(
    () => db.scans.where("isSynced").equals(0).toArray()
  ) || [];

  // 2. Détection Réseau
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync(); 
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
      icon: "📶",
      id: "sync-toast"
    });

    for (const harvest of harvestsToSync) {
      const result = await syncHarvest({
        producerId: harvest.producerId,
        farmPlotId: harvest.farmPlotId,
        quantity: harvest.quantity,
        cropType: harvest.cropType,
        unit: harvest.unit,
        scannedAt: harvest.scannedAt
      });

      if (result.success && harvest.id) {
        await db.harvests.delete(harvest.id);
        successCount++;
      }
    }

    for (const scan of scansToSync) {
      const result = await processScan(scan.qrCode);
      if ((result.success || result.message?.includes("déjà")) && scan.id) {
        await db.scans.delete(scan.id);
        successCount++;
      }
    }

    setIsSyncing(false);
    if (successCount > 0) {
      toast.success(`${successCount} éléments synchronisés !`, { id: "sync-toast" });
    }
  };

  return { isOnline, isSyncing };
}
