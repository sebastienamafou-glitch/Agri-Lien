"use server";

import { PrismaClient, UserRole } from "@prisma/client";
import { encryptData } from "@/infrastructure/security/encryption";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function registerProducer(formData: FormData) {
  try {
    // 1. Extraction des données du formulaire
    const phoneNumber = formData.get("phoneNumber") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const nationalId = formData.get("nationalId") as string;

    // 2. Validation de base
    if (!phoneNumber || !firstName || !nationalId) {
      return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    // 3. Chiffrement de l'ID National (Exigence de souveraineté)
    // On utilise la fonction qui a été validée lors du Seed
    const encryptedNationalId = encryptData(nationalId);

    // 4. Transaction de création
    const newUser = await prisma.$transaction(async (tx) => {
      // Création de l'utilisateur
      const user = await tx.user.create({
        data: {
          phoneNumber,
          firstName,
          lastName,
          role: UserRole.PRODUCER,
          nationalIdHash: encryptedNationalId,
          // Création automatique du profil producteur et du score initial
          producerProfile: {
            create: {
              score: {
                create: {
                  productionVolume: 0,
                  deliveryRegularity: 100,
                  creditHistory: 100,
                  calculatedScore: 500, // Score de confiance par défaut
                },
              },
            },
          },
        },
      });
      return user;
    });

    // 5. Mise à jour du cache de l'interface
    revalidatePath("/cooperative/producers");
    
    return { success: `Le producteur ${newUser.firstName} a été enregistré.` };

  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Ce numéro de téléphone est déjà utilisé." };
    }
    return { error: "Une erreur est survenue lors de l'enregistrement." };
  }
}
