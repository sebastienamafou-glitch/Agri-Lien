"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getNearbyTransporters(orderId: string, radiusKm: number = 50) {
  try {
    // REQUÊTE UNIFIÉE & SÉCURISÉE
    // On joint directement la table des transporteurs à celle de l'ordre spécifique.
    // Plus de manipulation de texte "POINT(x y)" côté serveur.
    const suggestedTransporters: any[] = await prisma.$queryRaw`
      SELECT 
        tp.id, 
        u."firstName", 
        u."lastName", 
        tp."vehicleType", 
        tp."capacityKg",
        -- Calcul de distance direct entre les deux colonnes Geometry
        ST_DistanceSphere(tp."currentLocation", ord."pickupLocation") / 1000 as distance_km
      FROM "TransporterProfile" tp
      JOIN "User" u ON tp."userId" = u.id
      -- On cible l'ordre spécifique pour récupérer son point de départ
      CROSS JOIN "TransportOrder" ord 
      WHERE ord.id = ${orderId}
      AND tp."currentLocation" IS NOT NULL
      -- Filtre géospatial natif
      AND ST_DistanceSphere(tp."currentLocation", ord."pickupLocation") <= ${radiusKm * 1000}
      ORDER BY distance_km ASC
      LIMIT 5
    `;

    return { success: true, transporters: suggestedTransporters };
  } catch (error) {
    console.error("Erreur Matching Engine:", error);
    return { error: "Échec de la recherche de proximité." };
  }
}
