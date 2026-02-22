"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CropType, MeasurementUnit } from "@prisma/client";

interface OfflineHarvestData {
  producerId: string;
  farmPlotId: string;
  weightKg: number; // On garde ce nom si votre base locale Dexie l'utilise encore
  scannedAt: Date;
}

export async function syncHarvest(data: OfflineHarvestData) {
  try {
    // Écriture dans la base de données distante
    await prisma.harvest.create({
      data: {
        producerId: data.producerId,
        farmPlotId: data.farmPlotId,
        
        // ✅ CORRECTION : Utilisation de quantity et unit
        quantity: data.weightKg,
        unit: "KG" as MeasurementUnit, 
        
        cropType: "CACAO" as CropType, // Par défaut pour la brousse
        status: "DECLARED",
        declaredAt: data.scannedAt || new Date(),
      },
    });

    // ✅ CORRECTION : Mise à jour des chemins
    revalidatePath("/cooperative/dashboard");
    revalidatePath("/producer/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Erreur de Synchronisation:", error);
    return { success: false, error: "Échec d'écriture dans la base de données" };
  }
}
