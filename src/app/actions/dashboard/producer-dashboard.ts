"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { redirect } from "next/navigation";

export async function getProducerDashboardData() {
  // 1. Sécurité : Qui est connecté ?
  const session = await getServerSession(authOptions);
  
  const userPhone = session?.user?.email; 

  if (!userPhone) {
    redirect("/auth/login");
  }

  // 2. Récupération optimisée (Une seule requête DB)
  const producer = await prisma.user.findUnique({
    where: { phoneNumber: userPhone },
    include: {
      producerProfile: {
        include: {
          score: true, 
          farmPlots: true, 
          // ✅ Traçabilité Multi-filières : On récupère les Lots (batches)
          harvests: {
            take: 3,
            orderBy: { declaredAt: 'desc' },
            include: {
              batches: true // Remplacement de batches
            }
          },
          transportOrders: {
            take: 1,
            orderBy: { requestedAt: 'desc' }
          }
        }
      },
      transactions: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!producer || !producer.producerProfile) {
    return null;
  }

  // 3. Calculs Métier
  const profile = producer.producerProfile;
  const totalArea = profile.farmPlots.reduce((sum, plot) => sum + plot.areaHectares, 0);
  const score = profile.score?.calculatedScore ?? 0;

  // Formater les données pour le Frontend
  return {
    identity: {
      firstName: producer.firstName,
      lastName: producer.lastName,
      role: "Producteur Agricole" // Plus générique que "Producteur de Cacao"
    },
    stats: {
      score: Math.round(score),
      totalArea: Number(totalArea.toFixed(2)),
      plotCount: profile.farmPlots.length
    },
    // ✅ Traçabilité mise à jour (quantity, unit, batches)
    lastTraceability: profile.harvests[0] ? {
      id: profile.harvests[0].id.substring(0, 8).toUpperCase(),
      quantity: profile.harvests[0].quantity, // Remplacement de quantityKg
      unit: profile.harvests[0].unit,         // Ex: "KG", "LITRE"
      batchCount: profile.harvests[0].batches.length, // Remplacement de bagCount
      status: profile.harvests[0].status,
      date: profile.harvests[0].declaredAt
    } : null,
    
    transactions: producer.transactions.map(tx => ({
      amount: tx.amount.toLocaleString('fr-CI'),
      provider: tx.provider,
      status: tx.status,
      date: tx.createdAt
    }))
  };
}
