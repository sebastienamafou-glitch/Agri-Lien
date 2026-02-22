"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function verifyBag(qrCode: string) {
  try {
    const batch = await prisma.productBatch.findUnique({
      where: { qrCode },
      include: {
        harvest: {
          include: { producer: { include: { user: true } } }
        }
      }
    });

    if (!batch) return { success: false as const, message: "QR Code inconnu dans le système." };
    if (batch.status === 'DELIVERED') return { success: false as const, message: "⚠️ Ce lot a déjà été réceptionné !" };
    
    // ✅ BEST PRACTICE : On renvoie "batch" (et on met un message vide pour que TypeScript ne panique pas sur l'union de types)
    return { success: true as const, batch, message: "" }; 
  } catch (error) {
    console.error("Erreur vérification lot:", error);
    return { success: false as const, message: "Erreur de connexion au serveur." };
  }
}

export async function receiveBag(formData: FormData) {
  // ✅ CORRECTION : On cherche "batchId" et plus "bagId"
  const batchId = formData.get("batchId") as string; 
  const actualWeight = parseFloat(formData.get("actualWeight") as string);

  if (!batchId || isNaN(actualWeight)) {
    return { success: false as const, message: "Données invalides." };
  }

  try {
    await prisma.productBatch.update({
      where: { id: batchId },
      data: {
        quantity: actualWeight,
        status: "DELIVERED",
        deliveredAt: new Date(),
      }
    });

    await prisma.$executeRaw`
      INSERT INTO "BatchEvent" (id, "batchId", "eventType", "location", "timestamp")
      VALUES (
        gen_random_uuid(), 
        ${batchId}, 
        'RECEPTION_MAGASIN', 
        ST_SetSRID(ST_MakePoint(-4.1000, 5.4000), 4326), 
        NOW()
      )
    `;

    revalidatePath("/admin/reception");
    return { success: true as const, message: "Lot réceptionné et enregistré avec succès !" };
  } catch (error) {
    console.error("Erreur réception:", error);
    return { success: false as const, message: "Erreur lors de l'enregistrement." };
  }
}
