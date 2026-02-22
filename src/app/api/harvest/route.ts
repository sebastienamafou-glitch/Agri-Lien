// src/app/api/harvest/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma'; // ✅ L'import corrigé !
import { authOptions } from "@/infrastructure/auth/auth.config";

// ✅ 1. Validation agnostique (Plus de "weightKg", on utilise "quantity" et "unit")
const harvestSchema = z.object({
  farmPlotId: z.string().uuid(),
  quantity: z.number().min(0.1),
  unit: z.enum(['KG', 'TONNE', 'LITRE', 'SAC']).default('KG'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ 2. Correction du nom du rôle (PRODUCER et non PRODUCTEUR)
    if (!session?.user?.email || session.user.role !== 'PRODUCER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = harvestSchema.parse(body);

    // 3. Récupération du profil producteur 
    const user = await prisma.user.findUnique({
      where: { phoneNumber: session.user.email },
      include: { producerProfile: true }
    });

    const producerProfileId = user?.producerProfile?.id;
    if (!producerProfileId) {
        return NextResponse.json({ error: 'Profil producteur introuvable' }, { status: 403 });
    }

    // 4. Vérification de la parcelle (La parcelle sait quelle est sa filière : CACAO, HEVEA...)
    const plot = await prisma.farmPlot.findUnique({
      where: { id: validatedData.farmPlotId },
    });

    if (!plot || plot.producerId !== producerProfileId) {
      return NextResponse.json({ error: 'Fraude détectée: Parcelle invalide' }, { status: 403 });
    }

    // 5. Transaction Atomique (ACID)
    const result = await prisma.$transaction(async (tx) => {
      
      // ✅ Création de la récolte générique
      const harvest = await tx.harvest.create({
        data: {
          producerId: producerProfileId,
          farmPlotId: validatedData.farmPlotId,
          cropType: plot.cropType, // Hérite de la filière de la parcelle
          quantity: validatedData.quantity,
          unit: validatedData.unit,
          status: "DECLARED",
        },
      });

      // ✅ Création des Lots (ProductBatch)
      let batchesData = [];
      
      // Logique métier : Si Cacao, on divise en sacs de 60kg. Sinon, un seul gros lot.
      if (plot.cropType === 'CACAO' && validatedData.unit === 'KG') {
          const bagsCount = Math.ceil(validatedData.quantity / 60);
          const weightPerBag = validatedData.quantity / bagsCount;
          
          batchesData = Array.from({ length: bagsCount }).map(() => ({
            harvestId: harvest.id,
            qrCode: `AL-${plot.cropType.substring(0,3)}-${Math.random().toString(36).substring(7)}`.toUpperCase(),
            quantity: weightPerBag,
            unit: 'KG' as const,
            status: "CREATED" as const,
          }));
      } else {
          batchesData = [{
              harvestId: harvest.id,
              qrCode: `AL-${plot.cropType.substring(0,3)}-${Math.random().toString(36).substring(7)}`.toUpperCase(),
              quantity: validatedData.quantity,
              unit: validatedData.unit,
              status: "CREATED" as const,
          }];
      }

      // ✅ Utilisation de productBatch au lieu de cocoaBag
      await tx.productBatch.createMany({ data: batchesData });

      return harvest;
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Harvest Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
