"use server";

import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma"; 

export async function signupAdmin(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  let phoneNumber = formData.get("phoneNumber") as string;

  if (!firstName || !lastName || !phoneNumber) {
    return { error: "Tous les champs sont requis." };
  }

  // 1. Formatage strict du téléphone (+225...)
  phoneNumber = phoneNumber.replace(/\s/g, '');
  if (!phoneNumber.startsWith('+')) {
    phoneNumber = `+225${phoneNumber}`;
  }

  try {
    // 2. Création de l'utilisateur avec un rôle RESTREINT (Moindre privilège)
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
        // ✅ CORRECTION : Le compte est mis "en attente" par défaut.
        role: "PENDING" as UserRole, 
        nationalIdHash: "EN_ATTENTE_DE_VERIFICATION", 
      },
    });

    // 3. Retour de succès pour déclencher l'auto-login vers la page /auth/pending
    return { success: true };

  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Ce numéro de téléphone est déjà inscrit." };
    }
    return { error: "Erreur lors de l'inscription : " + error.message };
  }
}
