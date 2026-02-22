import prisma from "@/lib/prisma"; 
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  try {
    const harvests = await prisma.harvest.findMany({
      include: { 
        producer: { include: { user: true } }, 
        farmPlot: true 
      },
      orderBy: { declaredAt: "desc" }
    });

    // ✅ CORRECTION : En-têtes multi-filières ("Filière" et "Quantité")
    const csvRows = [
      ["Date", "Producteur", "Parcelle", "Filière", "Quantité", "Statut"]
    ];

    harvests.forEach(h => {
      csvRows.push([
        h.declaredAt.toISOString().split('T')[0],
        `${h.producer.user.lastName} ${h.producer.user.firstName}`,
        h.farmPlot.name,
        h.cropType,
        // ✅ CORRECTION : Utilisation de "quantity" (exactement ce que demandait TypeScript !)
        h.quantity.toString().replace('.', ','), 
        h.status
      ]);
    });

    const csvString = csvRows.map(row => row.join(";")).join("\n");
    const bom = "\uFEFF";

    return new NextResponse(bom + csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="journal_recoltes_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error("Erreur Export API Harvests:", error);
    return new NextResponse("Erreur lors de la génération du journal des récoltes", { status: 500 });
  }
}
