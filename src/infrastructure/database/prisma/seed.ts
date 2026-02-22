import { PrismaClient, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 DÉBUT DU SEED (PROD READY)...');

  // 1. Validation de sécurité
  if (!process.env.AES_SECRET_KEY || process.env.AES_SECRET_KEY.length !== 44) {
    throw new Error("❌ ERREUR SÉCURITÉ : AES_SECRET_KEY manquante ou invalide !");
  }

  // Assurez-vous que ce chemin correspond bien à votre architecture
  const { encryptData } = require('../../security/encryption'); 

  // 2. Nettoyage (Ordre STRICT pour éviter les erreurs de clés étrangères)
  console.log('🧹 Nettoyage des données existantes...');
  
  await prisma.auditLog.deleteMany();
  // ✅ CORRECTION : Nouveaux noms de tables GIZ (batch au lieu de bag)
  await prisma.batchEvent.deleteMany();
  await prisma.productBatch.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.transportOrder.deleteMany(); 
  await prisma.harvest.deleteMany();
  await prisma.agriculturalScore.deleteMany();
  await prisma.farmPlot.deleteMany();
  await prisma.producerProfile.deleteMany();
  await prisma.cooperativeProfile.deleteMany();
  await prisma.transporterProfile.deleteMany();
  await prisma.bankProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✨ Base de données vide et propre.');

  // ==========================================
  // 3. CRÉATION DES PROFILS UTILISATEURS
  // ==========================================

  // ---> ADMIN
  await prisma.user.create({
    data: {
      phoneNumber: "+2250707070707",
      role: UserRole.ADMIN,
      firstName: "Admin",
      lastName: "Systeme",
      nationalIdHash: encryptData("ADMIN-001-CI"),
    },
  });
  console.log('👤 Admin créé (+2250707070707)');

  // ---> COOPÉRATIVE
  await prisma.user.create({
    data: {
      phoneNumber: "+2250505050505",
      role: UserRole.COOPERATIVE,
      firstName: "Responsable",
      lastName: "Coopérative",
      nationalIdHash: encryptData("CNI-COOP-999"),
      cooperativeProfile: {
        create: { name: "Coop-Espoir Soubré", region: "Nawa" },
      },
    },
  });
  console.log('🏢 Coopérative créée (+2250505050505)');

  // ---> BANQUE (Préparation pour le futur module Crédit)
  await prisma.user.create({
    data: {
      phoneNumber: "+2250808080808",
      role: UserRole.BANK,
      firstName: "Agent",
      lastName: "Bancaire",
      nationalIdHash: encryptData("BANK-111-222"),
      bankProfile: {
        create: { approvedCredits: 50000000 }, // 50 Millions FCFA d'enveloppe
      },
    },
  });
  console.log('🏦 Banque créée (+2250808080808)');

  // ---> PRODUCTEUR
  const producerUser = await prisma.user.create({
    data: {
      phoneNumber: "+2250102030405",
      role: UserRole.PRODUCER,
      firstName: "Kouamé",
      lastName: "Konan",
      nationalIdHash: encryptData("CI-0011-2233-4455"),
      producerProfile: {
        create: {
          score: { create: { productionVolume: 0, deliveryRegularity: 100, creditHistory: 100, calculatedScore: 500 } }
        },
      },
    },
    include: { producerProfile: true }
  });
  console.log('🌾 Producteur créé (+2250102030405)');

  // ---> TRANSPORTEUR
  const transporterUser = await prisma.user.create({
    data: {
      phoneNumber: "+2250909090909",
      role: UserRole.TRANSPORTER,
      firstName: "Mamadou",
      lastName: "Traoré",
      nationalIdHash: encryptData("TR-9988-7766"),
    },
  });
  
  // Création du profil transporteur avec PostGIS pour la géolocalisation
  const transporterProfileId = randomUUID();
  // ✅ CORRECTION : Utilisation de "capacity" et "unit" au lieu de "capacityKg"
  await prisma.$executeRaw`
    INSERT INTO "TransporterProfile" (id, "userId", "vehicleType", "capacity", "unit", "currentLocation")
    VALUES (${transporterProfileId}, ${transporterUser.id}, 'Camion Kia (10 Tonnes)', 10, 'TONNE'::"MeasurementUnit", ST_SetSRID(ST_MakePoint(-5.2767, 6.8276), 4326));
  `;
  console.log('🚚 Transporteur créé (+2250909090909)');

  // ==========================================
  // 4. CRÉATION DES DONNÉES GÉOGRAPHIQUES ET MÉTIERS
  // ==========================================

  // ---> PARCELLE DU PRODUCTEUR
  const plotId = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "FarmPlot" (id, "producerId", name, "areaHectares", location, "createdAt")
    VALUES (${plotId}, ${producerUser.producerProfile!.id}, 'Parcelle Campement 1', 2.5, ST_GeomFromText('POLYGON((-6.60 5.78, -6.61 5.79, -6.59 5.79, -6.60 5.78))', 4326), NOW());
  `;
  console.log('🗺️ Parcelle PostGIS générée');

  // ---> ORDRE DE TRANSPORT EN ATTENTE (Pour peupler la Bourse de Fret)
  const orderId = randomUUID();
  await prisma.$executeRaw`
    INSERT INTO "TransportOrder" (id, "producerId", "pickupLocation", "dropoffLocation", status, "requestedAt")
    VALUES (
      ${orderId}, 
      ${producerUser.producerProfile!.id}, 
      ST_SetSRID(ST_MakePoint(-4.0083, 5.3096), 4326), 
      ST_SetSRID(ST_MakePoint(-4.1000, 5.4000), 4326), 
      'PENDING'::"TransportStatus", 
      NOW()
    );
  `;
  console.log('📦 Ordre de transport (Bourse de fret) généré');

  console.log('🚀 SEED TERMINÉ AVEC SUCCÈS !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
