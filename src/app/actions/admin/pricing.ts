"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CropType, MeasurementUnit } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

export async function updatePrice(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  // Extraction des données du formulaire
  const cropType = formData.get("cropType") as CropType;
  const pricePerUnit = parseFloat(formData.get("price") as string);
  const unit = formData.get("unit") as MeasurementUnit;

  if (!cropType || isNaN(pricePerUnit)) {
    return { success: false, message: "Données de tarification invalides." };
  }

  try {
    // 1. Mise à jour ou création du prix (Upsert)
    await prisma.cropPrice.upsert({
      where: { cropType },
      update: { pricePerUnit, unit },
      create: { cropType, pricePerUnit, unit }
    });

    // 2. Traçabilité d'Audit (Banque Mondiale)
    let auditUserId = "SYSTEM_ADMIN";
    if (session?.user?.email) {
      const u = await prisma.user.findUnique({ 
        where: { phoneNumber: session.user.email },
        select: { id: true }
      });
      if (u) auditUserId = u.id;
    }

    await prisma.auditLog.create({
      data: {
        userId: auditUserId,
        action: `UPDATE_PRICE_${cropType}_TO_${pricePerUnit}`,
        entityType: "CropPrice",
        entityId: cropType,
      }
    });

    // 3. Rafraîchissement du cache de la page
    revalidatePath("/admin/pricing");
    return { success: true };

  } catch (error) {
    console.error("Erreur mise à jour des prix:", error);
    return { success: false, message: "Erreur lors de la communication avec la base de données." };
  }
}
