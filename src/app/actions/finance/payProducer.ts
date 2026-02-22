"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function payProducer(formData: FormData) {
  const harvestId = formData.get("harvestId") as string;
  const provider = formData.get("provider") as string; 

  if (!harvestId || !provider) {
    throw new Error("Données de paiement manquantes.");
  }

  try {
    const harvest = await prisma.harvest.findUnique({
      where: { id: harvestId },
      include: {
        producer: true,
        batches: { where: { status: "DELIVERED" } } 
      }
    });

    if (!harvest) throw new Error("Récolte introuvable.");
    if (harvest.status === "VALIDATED") throw new Error("Cette récolte a déjà été payée.");

    const verifiedQuantity = harvest.batches.reduce((acc, batch) => acc + batch.quantity, 0);
    
    if (verifiedQuantity <= 0) {
      throw new Error("Aucun lot validé pour cette récolte. Paiement impossible.");
    }

    const userId = harvest.producer.userId;

    // ⚡ TRANSACTION ATOMIQUE
    await prisma.$transaction(async (tx) => {
      
      // ✅ NOUVEAU : On interroge la base de données pour le prix EN TEMPS RÉEL !
      const currentPrice = await tx.cropPrice.findUnique({
        where: { cropType: harvest.cropType }
      });

      if (!currentPrice) {
        throw new Error(`Le prix officiel pour la filière ${harvest.cropType} n'a pas encore été configuré par l'Administrateur.`);
      }

      // Le serveur calcule le montant final avec le VRAI prix du jour
      const amount = verifiedQuantity * currentPrice.pricePerUnit;

      // 1. Enregistrement de la transaction Mobile Money
      await tx.transaction.create({
        data: {
          userId: userId,
          amount: amount,
          provider: provider,
          status: "SUCCESS", 
          externalRef: `PAY_${harvestId.substring(0, 8).toUpperCase()}`, 
        },
      });

      // 2. Mise à jour de la Récolte
      await tx.harvest.update({
        where: { id: harvestId },
        data: { status: "VALIDATED" }
      });

      // 3. Récompense : Augmentation du Score Agricole
      await tx.agriculturalScore.updateMany({
        where: { producerId: harvest.producerId },
        data: {
          calculatedScore: { increment: 15 },
          deliveryRegularity: { increment: 5 }
        }
      });
    });

    revalidatePath("/admin/finance");
    revalidatePath("/producer/dashboard");
    
    return { success: true };

  } catch (error: any) {
    console.error("Erreur Paiement:", error);
    // On renvoie l'erreur exacte pour que l'interface puisse afficher "Prix non configuré" si besoin
    return { error: error.message || "Échec de la transaction Mobile Money." };
  }
}
