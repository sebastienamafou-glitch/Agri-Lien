"use server";

// 1. IMPORT DU SINGLETON (Au lieu de new PrismaClient())
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createProducer(formData: FormData) {
  // 2. Récupération des données
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phoneRaw = formData.get("phoneNumber") as string;
  const plotName = formData.get("plotName") as string;
  
  // 3. Conversion Sécurisée (Anti-Crash NaN)
  const areaRaw = formData.get("area");
  const yieldRaw = formData.get("yield");
  
  // On s'assure que c'est bien un nombre, sinon on met 0 par défaut
  const area = (areaRaw && !isNaN(Number(areaRaw))) ? Number(areaRaw) : 0;
  const yieldEst = (yieldRaw && !isNaN(Number(yieldRaw))) ? Number(yieldRaw) : 0;

  // 4. Formatage du téléphone (+225...)
  let phoneNumber = phoneRaw ? phoneRaw.replace(/\s/g, '') : "";
  if (phoneNumber && !phoneNumber.startsWith('+')) {
    phoneNumber = `+225${phoneNumber}`;
  }

  try {
    // 5. Création en base avec Nested Write (Écriture imbriquée)
    // Prisma gère la transaction automatiquement ici pas besoin de $transaction explicite pour un seul create
    await prisma.user.create({
      data: {
        firstName: firstName || "Inconnu", // Valeur par défaut si vide
        lastName: lastName || "",
        phoneNumber,
        role: "PRODUCER",
        // Hash temporaire obligatoire selon le schéma
        nationalIdHash: `TEMP_${Date.now()}_${Math.floor(Math.random() * 1000)}`, 
        
        // Création automatique du Profil Producteur...
        producerProfile: {
          create: {
            // ...et de sa première Parcelle
            farmPlots: {
              create: {
                name: plotName || "Parcelle Principale",
                areaHectares: area,
                estimatedYield: yieldEst
              }
            }
          }
        }
      }
    });

    console.log("✅ Producteur créé avec succès :", phoneNumber);

    // 6. Rafraîchissement du cache
    revalidatePath("/cooperative/producers");
    revalidatePath("/admin/dashboard");

  } catch (error: any) {
    // Gestion des doublons (Code erreur Prisma P2002)
    if (error.code === 'P2002') {
      console.error("❌ Doublon détecté pour le téléphone");
      // Note: Dans une Server Action, on ne peut pas facilement renvoyer un objet erreur sans useFormState.
      // Pour l'instant, cela affichera l'erreur dans les logs serveur.
    } else {
      console.error("❌ Erreur création producteur:", error);
    }
    // En cas d'erreur grave, on peut rediriger vers une page d'erreur ou ne rien faire
    return; 
  }

  // 7. Redirection finale (Uniquement si succès)
  redirect("/cooperative/producers");
}
