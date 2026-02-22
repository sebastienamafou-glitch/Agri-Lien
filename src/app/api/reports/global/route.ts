import prisma from "@/lib/prisma"; 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Non autorisé - Veuillez vous connecter", { status: 401 });
  }

  try {
    // 1. Extraction Massive : Récoltes + Producteur + Parcelle + Lots (Traçabilité)
    // ✅ CORRECTION : Utilisation de batches au lieu de batches
    const harvests = await prisma.harvest.findMany({
      include: {
        producer: { include: { user: true } },
        farmPlot: true,
        batches: true 
      },
      orderBy: { declaredAt: "desc" }
    });

    // 2. En-têtes du CSV Master (Totalement agnostique pour la GIZ)
    const csvRows = [
      [
        "ID_Recolte", 
        "Date", 
        "Statut", 
        "Producteur_Nom", 
        "Producteur_Tel", 
        "Parcelle", 
        "Quantite_Total", // ✅ Modifié
        "Nb_Lots_Generes", // ✅ Modifié
        "Lots_Refs"        // ✅ Modifié
      ]
    ];

    // 3. Remplissage minutieux
    harvests.forEach(h => {
      // ✅ CORRECTION : Utilisation de batches
      const batchRefs = h.batches.map(b => b.qrCode).join(", ");
      
      csvRows.push([
        h.id,
        h.declaredAt.toISOString().split('T')[0],
        h.status,
        `${h.producer.user.lastName} ${h.producer.user.firstName}`,
        h.producer.user.phoneNumber,
        h.farmPlot.name,
        h.quantity.toString().replace('.', ','), // ✅ CORRECTION : quantity au lieu de quantityKg
        h.batches.length.toString(), // ✅ CORRECTION : batches
        `"${batchRefs}"` 
      ]);
    });

    const csvString = csvRows.map(row => row.join(";")).join("\n");
    const bom = "\uFEFF";

    return new NextResponse(bom + csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="MASTER_AGRILIEN_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error("Erreur Export API Global:", error);
    return new NextResponse("Erreur lors de la génération du Master Export", { status: 500 });
  }
}
