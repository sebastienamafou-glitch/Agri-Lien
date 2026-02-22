"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

export async function processBagScan(orderId: string, qrCodeContent: string) {
  try {
    // 1. SÉCURITÉ ABSOLUE : Vérification de l'identité du chauffeur
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { error: "Non autorisé. Veuillez vous connecter." };
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber: session.user.email },
      include: { transporterProfile: true }
    });

    if (!user || !user.transporterProfile) {
      return { error: "Profil transporteur introuvable." };
    }

    const transporterId = user.transporterProfile.id;

    // 2. VERROUILLAGE : Vérifier que la mission lui appartient bien
    const order = await prisma.transportOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return { error: "Mission introuvable." };
    }

    if (order.transporterId !== transporterId) {
      return { error: "Accès refusé : Cette mission ne vous est pas assignée." };
    }

    // 3. Vérification du lot (Batch) via son QR Code
    const batch = await prisma.productBatch.findUnique({
      where: { qrCode: qrCodeContent }, 
    });

    if (!batch) {
      return { error: "QR Code non reconnu dans la base de données." };
    }

    if (batch.status === "IN_TRANSIT" || batch.status === "DELIVERED") {
      return { error: "Ce lot a déjà été scanné et chargé." };
    }

    // 4. OPÉRATION ATOMIQUE : Mise à jour Lot + Ordre + Création Événement Traçabilité
    await prisma.$transaction(async (tx) => {
      
      // A. Mettre à jour le statut du lot
      await tx.productBatch.update({
        where: { id: batch.id },
        data: { status: "IN_TRANSIT" }
      });

      // B. Mettre à jour le statut de la mission si ce n'est pas déjà fait
      await tx.transportOrder.update({
        where: { id: orderId },
        data: { status: "IN_PROGRESS" }
      });

      // C. Créer l'événement de traçabilité avec géolocalisation
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
