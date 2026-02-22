"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

export async function updateCooperativeSettings(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, message: "Session expirée. Veuillez vous reconnecter." };
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const coopName = formData.get("coopName") as string;
  const region = formData.get("region") as string;

  if (!firstName || !lastName || !coopName || !region) {
    return { success: false, message: "Veuillez remplir tous les champs obligatoires." };
  }

  try {
    // Mise à jour de l'utilisateur ET de son profil coopérative en une seule transaction
    await prisma.user.update({
      where: { phoneNumber: session.user.email },
      data: {
        firstName,
        lastName,
        cooperativeProfile: {
          update: {
            name: coopName,
            region: region,
          }
        }
      }
    });

    // Rafraîchissement du cache pour afficher les nouvelles données instantanément
    revalidatePath("/cooperative/settings");
    return { success: true, message: "Paramètres mis à jour avec succès !" };

  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres:", error);
    return { success: false, message: "Erreur lors de la communication avec la base de données." };
  }
}
