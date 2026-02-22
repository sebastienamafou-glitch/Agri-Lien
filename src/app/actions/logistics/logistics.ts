"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { TransportStatus } from "@prisma/client";
import { createTransportOrderSchema, CreateTransportOrderDTO } from "./schema";

// ============================================================================
// 1. PRODUCTEUR : Demander un camion (Création avec PostGIS simulé)
// ============================================================================
export async function requestTransport() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { success: false, message: "Non connecté" };

  try {
    const user = await prisma.user.findUnique({
      where: { phoneNumber: session.user.email },
      include: { producerProfile: true }
    });

    if (!user?.producerProfile) return { success: false, message: "Profil introuvable" };

    await prisma.$executeRaw`
      INSERT INTO "TransportOrder" (
        "id", 
        "producerId", 
        "pickupLocation", 
        "dropoffLocation", 
        "status", 
        "requestedAt"
      )
      VALUES (
        gen_random_uuid(), 
        ${user.producerProfile.id}, 
        ST_SetSRID(ST_MakePoint(-4.0083, 5.3096), 4326), 
        ST_SetSRID(ST_MakePoint(-4.1000, 5.4000), 4326), 
        'PENDING'::"TransportStatus", 
        NOW()
      )
    `;

    revalidatePath("/producer/logistics");
    return { success: true, message: "Demande de camion envoyée !" };
  } catch (error) {
    console.error("Erreur Logistique:", error);
    return { success: false, message: "Impossible de créer la demande." };
  }
}

// ============================================================================
// 2. COOPÉRATIVE : Déployer un camion manuel (PostGIS Réel EUDR)
// ============================================================================
export async function dispatchTruck(data: CreateTransportOrderDTO) {
  const validated = createTransportOrderSchema.safeParse(data);
  if (!validated.success) return { error: "Données de localisation invalides." };

  const { producerId, pickupLocation, dropoffLocation, status } = validated.data;

  try {
    const newOrderId = randomUUID();
    await prisma.$queryRaw`
      INSERT INTO "TransportOrder" (
        "id", "producerId", "status", "pickupLocation", "dropoffLocation", "requestedAt"
      ) VALUES (
        ${newOrderId}, ${producerId}, ${status}::"TransportStatus", 
        ST_SetSRID(ST_MakePoint(${pickupLocation.longitude}, ${pickupLocation.latitude}), 4326),
        ST_SetSRID(ST_MakePoint(${dropoffLocation.longitude}, ${dropoffLocation.latitude}), 4326),
        NOW()
      )
    `;
    revalidatePath("/cooperative/logistics");
    return { success: true };
  } catch (error) {
    console.error("Erreur Dispatch Logistique:", error);
    return { error: "Impossible de créer l'ordre." };
  }
}

// ============================================================================
// 3. TRANSPORTEUR / ADMIN : Assigner une course + AUDIT BANQUE MONDIALE
// ============================================================================
export async function acceptOrder(orderId: string, transporterId: string) {
  try {
    // A. Assigner le transporteur
    await prisma.transportOrder.update({
      where: { id: orderId },
      data: {
        status: "ACCEPTED",
        transporterId: transporterId
      }
    });

    // B. Création du log d'audit (Hérité de l'ancien assign.ts)
    const session = await getServerSession(authOptions);
    let auditUserId = "SYSTEM_ADMIN";
    
    if (session?.user?.email) {
      const u = await prisma.user.findUnique({ where: { phoneNumber: session.user.email }});
      if (u) auditUserId = u.id;
    }

    await prisma.auditLog.create({
      data: {
        userId: auditUserId,
        action: "ASSIGN_TRANSPORTER",
        entityType: "TransportOrder",
        entityId: orderId,
      },
    });

    revalidatePath("/transporter/dashboard");
    revalidatePath("/cooperative/logistics");
    return { success: true };
  } catch (error) {
    console.error("Erreur Assignation Transporteur:", error);
    return { error: "Impossible d'accepter la commande." };
  }
}

// ============================================================================
// 4. TRANSPORTEUR : Mettre à jour le statut (En route, Livré...)
// ============================================================================
export async function updateOrderStatus(orderId: string, status: TransportStatus) {
  try {
    await prisma.transportOrder.update({
      where: { id: orderId },
      data: {
        status: status,
        completedAt: status === "COMPLETED" ? new Date() : null
      }
    });
    revalidatePath(`/transporter/missions/${orderId}`);
    revalidatePath("/cooperative/logistics");
    return { success: true };
  } catch (error) {
    return { error: "Impossible de mettre à jour le statut." };
  }
}

// ============================================================================
// 5. TRANSPORTEUR : Tracking GPS Temps Réel
// ============================================================================
export async function updateTransporterLocation(transporterId: string, lat: number, lng: number) {
  try {
    await prisma.$queryRaw`
      UPDATE "TransporterProfile"
      SET "currentLocation" = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      WHERE "id" = ${transporterId}
    `;
    return { success: true };
  } catch (error) {
    return { error: "Impossible de mettre à jour la position." };
  }
}
