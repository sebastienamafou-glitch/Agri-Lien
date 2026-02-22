"use server";

import prisma from "@/lib/prisma"; // ✅ Utilisation de notre Singleton DRY
import { revalidatePath } from "next/cache";

export async function processBagScan(orderId: string, qrCodeContent: string) {
  try {
    // 1. Vérification du lot (Batch) via son QR Code
    // ✅ Remplacement de cocoaBag par productBatch
    const batch = await prisma.productBatch.findUnique({
      where: { qrCode: qrCodeContent }, 
    });

    if (!batch) {
      return { error: "QR Code non reconnu dans la base de données." };
    }

    if (batch.status === "IN_TRANSIT" || batch.status === "DELIVERED") {
      return { error: "Ce lot a déjà été scanné et chargé." };
    }

    // 2. OPÉRATION ATOMIQUE : Mise à jour Lot + Ordre + Création Événement Traçabilité
    await prisma.$transaction(async (tx) => {
      
      // A. Mettre à jour le statut du lot
      // ✅ Remplacement de cocoaBag par productBatch
      await tx.productBatch.update({
        where: { id: batch.id },
        data: { status: "IN_TRANSIT" }
      });

      // B. Mettre à jour le statut du camion si ce n'est pas déjà fait
      await tx.transportOrder.update({
        where: { id: orderId },
        data: { status: "IN_PROGRESS" }
      });

      // C. Créer l'événement de traçabilité avec géolocalisation
      // ✅ Remplacement de BagEvent par BatchEvent et bagId par batchId
      await tx.$queryRaw`
        INSERT INTO "BatchEvent" ("id", "batchId", "eventType", "location", "timestamp")
        SELECT 
          gen_random_uuid(), 
          ${batch.id}, 
          'LOADED_ON_TRUCK', 
          t."pickupLocation", 
          NOW()
        FROM "TransportOrder" t
        WHERE t.id = ${orderId}
      `;
    });

    revalidatePath(`/transporter/missions/${orderId}`);
    return { success: true, message: `Lot ${batch.qrCode.substring(0, 6)}... chargé avec succès.` };

  } catch (error) {
    console.error("Erreur Scan:", error);
    return { error: "Erreur technique : Impossible de valider le chargement." };
  }
}
