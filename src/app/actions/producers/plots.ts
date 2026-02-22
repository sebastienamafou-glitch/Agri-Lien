"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPlot(formData: FormData) {
  // 1. Vérification de l'identité
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Non connecté");

  // 2. Récupération du profil producteur
  const user = await prisma.user.findUnique({
    where: { phoneNumber: session.user.email },
    include: { producerProfile: true }
  });

  if (!user?.producerProfile) throw new Error("Profil producteur introuvable");

  // 3. Extraction des données
  const name = formData.get("name") as string;
  const areaRaw = formData.get("area") as string;
  const yieldRaw = formData.get("yield") as string;

  const area = parseFloat(areaRaw);
  const estimatedYield = parseFloat(yieldRaw) || 0;

  // 4. Validation
  if (!name || isNaN(area) || area <= 0) {
    console.error("Données invalides pour la parcelle");
    return; // On pourrait renvoyer une erreur ici
  }

  // 5. Création (Sans GPS pour l'instant, c'est optionnel dans le schema)
  await prisma.farmPlot.create({
    data: {
      producerId: user.producerProfile.id,
      name: name,
      areaHectares: area,
      estimatedYield: estimatedYield,
    }
  });

  // 6. Rafraîchissement des données
  revalidatePath("/producer/plots");
  revalidatePath("/producer/dashboard"); // Important pour mettre à jour la surface totale
  redirect("/producer/plots");
}
