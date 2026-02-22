"use server";

import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateProducer(formData: FormData) {
  const id = formData.get("id") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  let phoneNumber = formData.get("phoneNumber") as string;

  // 1. Nettoyage du téléphone (comme à la création)
  phoneNumber = phoneNumber.replace(/\s/g, '');
  if (!phoneNumber.startsWith('+')) {
     phoneNumber = `+225${phoneNumber}`;
  }

  try {
    // 2. Mise à jour en base
    await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phoneNumber,
        // On ne touche PAS au nationalIdHash (Sécurité)
      },
    });

    // 3. On dit à Next.js de rafraîchir les pages concernées
    revalidatePath(`/cooperative/producers/${id}`);
    revalidatePath("/cooperative/producers");

  } catch (error) {
    console.error("Erreur Update:", error);
    return { error: "Erreur lors de la modification. Vérifiez le numéro." };
  }

  // 4. Retour à la fiche détail
  redirect("/cooperative/producers");
}
