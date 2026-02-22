"use server";

import prisma from "@/lib/prisma"; // ✅ On passe au Singleton
import { revalidatePath } from "next/cache";

export async function createBags(formData: FormData) {
  const harvestId = formData.get("harvestId") as string;
  const numberOfBags = parseInt(formData.get("numberOfBags") as string);
  const weightPerBag = parseFloat(formData.get("weightPerBag") as string);

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < numberOfBags; i++) {
        const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const qrCodeString = `LOT-2026-${uniqueSuffix}-${i+1}`; // ✅ "LOT" au lieu de "BAG"

        // ✅ CORRECTION : productBatch, quantity, unit
        await tx.productBatch.create({
          data: {
            harvestId: harvestId,
            quantity: weightPerBag,
            unit: "KG",
            status: "CREATED", 
            qrCode: qrCodeString, 
          }
        });
      }
    });

    revalidatePath("/admin/traceability");
    
  } catch (error) {
    console.error("Erreur Création Lots:", error);
    return { error: "Impossible de générer les lots." };
  }
}
