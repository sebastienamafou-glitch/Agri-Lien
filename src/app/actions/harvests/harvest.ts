"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config"; 
import { revalidatePath } from "next/cache";
import { CropType, MeasurementUnit } from "@prisma/client"; // ✅ Import des Enums

export async function createHarvest(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Utilisateur non connecté");
  }

  const producerProfile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!producerProfile) {
    throw new Error("Profil producteur introuvable");
  }

  const farmPlotId = formData.get("farmPlotId") as string;
  const cropTypeRaw = formData.get("cropType") as string; 
  const weight = parseFloat(formData.get("weight") as string);

  if (!farmPlotId || isNaN(weight) || weight <= 0) {
    throw new Error("Données invalides");
  }

  try {
    await prisma.harvest.create({
      data: {
        producerId: producerProfile.id,
        farmPlotId: farmPlotId,
        // ✅ CORRECTION : Adapté pour le multi-filières
        cropType: (cropTypeRaw || "CACAO") as CropType,
        quantity: weight, 
        unit: "KG" as MeasurementUnit, 
        status: "DECLARED", 
        declaredAt: new Date(),
      }
    });

  } catch (error) {
    console.error("Erreur lors de la déclaration:", error);
    throw new Error("Erreur technique base de données");
  }

  revalidatePath("/producer/dashboard");
  return { success: true };
}
