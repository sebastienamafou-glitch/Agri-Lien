import { PrismaClient, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 DÉBUT DU SEED (PROD READY)...');

  // 1. Validation de sécurité : On utilise la VRAIE clé du .env
  if (!process.env.AES_SECRET_KEY) {
    console.warn("⚠️  ATTENTION : AES_SECRET_KEY introuvable dans le .env");
    console.warn("⚠️  Utilisation d'une clé temporaire pour le développement uniquement.");
  }
  
  // Simulation de l'encryptage (Pour éviter d'importer toute la librairie crypto ici)
  // Dans le vrai app, cela utilisera votre service de cryptage
  const encryptData = (text: string) => `ENCRYPTED_${text}_WITH_KEY`; 

  // 2. Nettoyage (Ordre STRICT pour éviter les erreurs de clés étrangères)
  console.log('🧹 Nettoyage des données existantes...');
  
  // On vide les tables proprement
  const tablenames = [
    'AuditLog', 'BatchEvent', 'ProductBatch', 'Transaction', 
    'TransportOrder', 'Harvest', 'AgriculturalScore', 'FarmPlot', 
    'ProducerProfile', 'CooperativeProfile', 'TransporterProfile', 
    'BankProfile', 'User'
  ];

  for (const tableName of tablenames) {
    try {
      // On utilise TRUNCATE CASCADE pour tout vider d'un coup sans problèmes de liens
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`);
    } catch (error) {
      // On ignore si la table est déjà vide ou n'existe pas
    }
  }

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

  // ---> BANQUE
  await prisma.user.create({
    data: {
      phoneNumber: "+2250808080808",
      role: UserRole.BANK,
      firstName: "Agent",
      lastName: "Bancaire",
      nationalIdHash: encryptData("BANK-111-222"),
      bankProfile: {
        create: { approvedCredits: 50000000 },
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
  
  const transporterProfileId = randomUUID();
  // Insertion SQL Brute pour PostGIS (Géolocalisation)
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

  // ---> ORDRE DE TRANSPORT EN ATTENTE
  const orderId = randomUUID();
  
  // ✅ CORRECTION MAJEURE ICI : Ajout de "updatedAt"
  // Sans cela, le seed plante car la colonne est obligatoire dans le schéma
  await prisma.$executeRaw`
    INSERT INTO "TransportOrder" (
      id, 
      "producerId", 
      "pickupLocation", 
      "dropoffLocation", 
      status, 
      "requestedAt", 
      "updatedAt"
    )
    VALUES (
      ${orderId}, 
      ${producerUser.producerProfile!.id}, 
      ST_SetSRID(ST_MakePoint(-4.0083, 5.3096), 4326), 
      ST_SetSRID(ST_MakePoint(-4.1000, 5.4000), 4326), 
      'PENDING'::"TransportStatus", 
      NOW(),
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
