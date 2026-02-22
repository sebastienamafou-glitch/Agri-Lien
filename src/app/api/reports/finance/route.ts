import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

export async function GET() {
  // 🔒 SÉCURITÉ : Vérification de la session Admin
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Non autorisé - Accès refusé", { status: 401 });
  }

  try {
    const transactions = await prisma.transaction.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });

    // En-têtes avec de vrais accents grâce au BOM
    const csvRows = [
      ["Date_Transaction", "Bénéficiaire", "Opérateur", "Montant_FCFA", "Référence_Interne", "Statut"]
    ];

    transactions.forEach(t => {
      csvRows.push([
        t.createdAt.toISOString().split('T')[0],
        `${t.user.lastName} ${t.user.firstName}`,
        t.provider,
        t.amount.toString(),
        t.externalRef || "N/A",
        t.status
      ]);
    });

    const csvString = csvRows.map(row => row.join(";")).join("\n");
    
    // Ajout du BOM UTF-8 pour la compatibilité Microsoft Excel
    const bom = "\uFEFF";

    return new NextResponse(bom + csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="finance_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'export CSV Financier :", error);
    return new NextResponse("Erreur lors de la génération de l'export", { status: 500 });
  }
}
