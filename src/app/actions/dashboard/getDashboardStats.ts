"use server";

import prisma from "@/lib/prisma"; 
import { CropType } from "@prisma/client";

export async function getDashboardStats(cropTypeFilter: CropType = "CACAO") {
  try {
    const [
      producersCount,
      plotsStats,
      harvestStats,
      recentActivity
    ] = await Promise.all([
      
      // 1. Compter les Producteurs
      prisma.user.count({
        where: { role: "PRODUCER" },
      }),

      // 2. Somme des surfaces des parcelles (filtrées par culture si besoin)
      prisma.farmPlot.aggregate({
        _sum: {
          areaHectares: true,
        },
        where: { cropType: cropTypeFilter } // ✅ Adapté pour la GIZ (Multi-filières)
      }),

      // 3. Somme des Récoltes VALIDÉES (Stock Réel)
      // ✅ Remplacement de weightEstim par "quantity" !
      prisma.harvest.aggregate({
        _sum: { quantity: true }, 
        where: { 
          status: "VALIDATED",
          cropType: cropTypeFilter // On additionne uniquement les kilos de cacao entre eux
        } 
      }),

      // 4. Activité Récente (Les 5 derniers inscrits)
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { role: "PRODUCER" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        }
      }),
    ]);

    const totalArea = plotsStats._sum.areaHectares || 0;

    return {
      producers: producersCount,
      totalArea: totalArea,
      // Calcul intelligent : on estime le potentiel (800 kg/Ha = Moyenne Cacao Ivoirienne)
      totalYield: cropTypeFilter === "CACAO" ? totalArea * 800 : totalArea * 1500, // Ex: Anacarde produit plus
      
      // ✅ Remplacement de weightEstim par quantity
      realStock: harvestStats._sum.quantity || 0, 
      
      recentActivity: recentActivity.map(user => ({
        id: user.id,
        description: `Nouveau producteur : ${user.lastName} ${user.firstName}`,
        date: user.createdAt,
        status: "Enrôlé",
        source: "Administration" 
      }))
    };

  } catch (error) {
    console.error("Erreur Dashboard Stats:", error);
    return {
      producers: 0,
      totalArea: 0,
      totalYield: 0,
      realStock: 0,
      recentActivity: []
    };
  }
}
