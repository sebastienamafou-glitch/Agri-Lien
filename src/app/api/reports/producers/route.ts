import prisma from "@/lib/prisma"; // ✅ CORRECTION : Utilisation du Singleton
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config"; 

export async function GET() {
  // 🔒 SÉCURITÉ : On vérifie que l'appelant est authentifié 
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  try {
    // 1. Extraction selon le schéma : User -> ProducerProfile -> FarmPlot
    const producers = await prisma.user.findMany({
      where: { role: "PRODUCER" }, 
      include: { 
        producerProfile: { 
          include: { farmPlots: true } 
        } 
      },
      orderBy: { createdAt: "desc" } // Optionnel : les plus récents en premier
    });

    // 2. Préparation du CSV (En-têtes)
    const csvRows = [
      ["ID_Unique", "Nom", "Prenoms", "Telephone", "Nb_Parcelles", "Surface_Totale_Ha", "Date_Inscription"]
    ];

    // 3. Mapping des données
    producers.forEach(p => {
      const profile = p.producerProfile;
      const farmPlots = profile?.farmPlots || [];
      // Somme des hectares pour ce producteur
      const totalArea = farmPlots.reduce((acc, plot) => acc + plot.areaHectares, 0);

      csvRows.push([
        p.id,
        p.lastName,
        p.firstName,
        p.phoneNumber,
        farmPlots.length.toString(),
        totalArea.toFixed(2).replace('.', ','), // Virgule pour Excel FR
        p.createdAt.toISOString().split('T')[0]
      ]);
    });

    // 4. Formatage CSV (Point-virgule pour compatibilité Excel FR)
    const csvString = csvRows.map(row => row.join(";")).join("\n");
    
    // 5. Ajout du BOM UTF-8 pour forcer Excel à bien lire les accents
    const bom = "\uFEFF";

    // 6. Réponse avec en-têtes de téléchargement
    return new NextResponse(bom + csvString, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="base_producteurs_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error("Erreur Export API:", error);
    return new NextResponse("Erreur lors de la génération du rapport", { status: 500 });
  }
}
