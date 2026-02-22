"use server";

import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma"; // ✅ Utilisation du Singleton DRY

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
    // 2. Création de l'utilisateur ADMIN
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
        role: UserRole.ADMIN,
        // ✅ CORRECTION : On fournit le champ obligatoire manquant
        // Dans une version future, ce sera le hash réel de leur carte d'identité
        nationalIdHash: "EN_ATTENTE_DE_VERIFICATION", 
      },
    });

    // ✅ CORRECTION : On retourne un objet de succès au lieu d'utiliser redirect()
    // Cela permet au composant client (page.tsx) de prendre le relais et de lancer l'auto-login !
    return { success: true };

  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Ce numéro de téléphone est déjà inscrit." };
    }
    return { error: "Erreur lors de l'inscription : " + error.message };
  }
}
