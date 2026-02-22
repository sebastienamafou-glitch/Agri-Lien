"use server";

import prisma from "@/lib/prisma"; // ✅ Singleton
import { revalidatePath } from "next/cache";

export async function validateHarvest(formData: FormData) {
  const harvestId = formData.get("harvestId") as string;

  try {
    await prisma.harvest.update({
      where: { id: harvestId },
      data: {
        status: "VALIDATED",
      },
    });

    revalidatePath("/admin/harvests");
    return { success: true };
    
  } catch (error) {
    console.error("Erreur Validation:", error);
    return { error: "Impossible de valider cette récolte." };
  }
}
