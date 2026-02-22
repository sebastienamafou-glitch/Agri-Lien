"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config"; 
import { revalidatePath } from "next/cache";

export async function processScan(qrCode: string) {
  // ✅ CORRECTION : On ajoute "as any" pour forcer TypeScript à accepter nos champs personnalisés
  const session = await getServerSession(authOptions) as any;
  
  // ✅ CORRECTION : Plus besoin de tester session.role, la vérification DB suffit
  if (!session?.user?.id) {
    return { success: false, message: "Non autorisé" };
  }

  // La sécurité ultime : Si l'utilisateur n'a pas de profil, il n'est pas producteur !
  const producerProfile = await prisma.producerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!producerProfile) return { success: false, message: "Profil introuvable ou vous n'êtes pas producteur." };

  const lastHarvest = await prisma.harvest.findFirst({
    where: { 
      producerId: producerProfile.id,
      status: "DECLARED"
    },
    orderBy: { declaredAt: "desc" }
  });

  if (!lastHarvest) {
    return { success: false, message: "Aucune récolte en cours à lier. Veuillez d'abord déclarer une récolte." };
  }

  const existingBatch = await prisma.productBatch.findUnique({
    where: { qrCode: qrCode }
  });

  if (existingBatch) {
    return { success: false, message: "Ce QR Code a déjà été scanné !" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const batch = await tx.productBatch.create({
        data: {
          qrCode: qrCode,
          harvestId: lastHarvest.id,
          quantity: 65, // Poids standard
          unit: "KG",
          status: "SCANNED",
          scannedAt: new Date(),
        }
      });
      
      await tx.$executeRaw`
        INSERT INTO "BatchEvent" (id, "batchId", "eventType", "location", "timestamp")
        VALUES (
          gen_random_uuid(), 
          ${batch.id}, 
          'SCAN_PRODUCER', 
          ST_SetSRID(ST_MakePoint(-6.60, 5.78), 4326), 
          NOW()
        )
      `;
    });
    
    revalidatePath("/producer/dashboard");
    return { success: true, message: `Lot ${qrCode} ajouté avec succès !` };

  } catch (error) {
    console.error("Erreur Scan:", error);
    return { success: false, message: "Erreur technique lors de l'enregistrement." };
  }
}
