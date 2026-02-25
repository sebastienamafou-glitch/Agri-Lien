"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CropType, MeasurementUnit, HarvestStatus } from "@prisma/client";

// ✅ Mise à jour de l'interface pour accepter les données du téléphone
type OfflineHarvestData = {
  producerId: string;
  farmPlotId: string;
  quantity: number; // Remplace weightKg
  cropType: string; // La valeur textuelle envoyée par le formulaire (ex: "HEVEA")
  unit: string;     // La valeur textuelle (ex: "TONNE")
  scannedAt: Date;
};

export async function syncHarvest(data: OfflineHarvestData) {
  try {
    // 1. Validation des données obligatoires
    if (!data.producerId || !data.farmPlotId || data.quantity === undefined) {
      console.error("Données de synchronisation incomplètes:", data);
      return { success: false, message: "Données incomplètes" };
    }

    // 2. Conversion sécurisée des chaînes vers les Enums Prisma
    // Si la valeur reçue n'est pas connue (ex: bug ou ancienne version), on met une valeur par défaut.
    const cropTypeEnum = (Object.values(CropType).includes(data.cropType as CropType) 
      ? data.cropType 
      : CropType.CACAO) as CropType;

    const unitEnum = (Object.values(MeasurementUnit).includes(data.unit as MeasurementUnit)
      ? data.unit
      : MeasurementUnit.KG) as MeasurementUnit;

    // 3. Enregistrement en base de données
    await prisma.harvest.create({
      data: {
        producerId: data.producerId,
        farmPlotId: data.farmPlotId,
        quantity: data.quantity, // ✅ On utilise enfin la bonne propriété
        cropType: cropTypeEnum,  // ✅ On respecte le choix du producteur
        unit: unitEnum,          // ✅ On respecte l'unité choisie
        status: HarvestStatus.DECLARED,
        declaredAt: data.scannedAt || new Date(),
      },
    });

    // 4. Rafraîchissement des tableaux de bord
    revalidatePath("/cooperative/dashboard");
    revalidatePath("/producer/dashboard");
    
    return { success: true };

  } catch (error) {
    console.error("Erreur critique de Synchronisation:", error);
    return { success: false, message: "Échec d'écriture dans la base de données" };
  }
}
