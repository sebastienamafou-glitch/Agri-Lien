"use server";

import prisma from "@/lib/prisma"; 
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { CropType, MeasurementUnit } from "@prisma/client"; // ✅ Import des Enums

export async function createHarvest(formData: FormData) {
  const producerId = formData.get("producerId") as string;
  const userId = formData.get("userId") as string; 
  const farmPlotId = formData.get("farmPlotId") as string;
  const weight = parseFloat(formData.get("weight") as string);
  const typeRaw = formData.get("type") as string; 
  
  if (!farmPlotId || isNaN(weight) || weight <= 0) {
    return { error: "Veuillez sélectionner une parcelle et un poids valide." };
  }

  try {
    await prisma.harvest.create({
      data: {
        producerId: producerId,
        farmPlotId: farmPlotId,
        // ✅ CORRECTION : Adapté pour le multi-filières
        cropType: (typeRaw || "CACAO") as CropType,
        quantity: weight, 
        unit: "KG" as MeasurementUnit,
        status: "DECLARED",
        declaredAt: new Date(),
      },
    });

    // ✅ CORRECTION : Les redirections pointent désormais vers la coopérative
    revalidatePath("/cooperative/dashboard");
    revalidatePath(`/cooperative/producers/${userId}`);

  } catch (error) {
    console.error("Erreur Création Récolte:", error);
    return { error: "Erreur technique lors de l'enregistrement." };
  }

  redirect(`/cooperative/producers/${userId}`);
}
