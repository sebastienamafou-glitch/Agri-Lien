-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PRODUCER', 'COOPERATIVE', 'TRANSPORTER', 'BANK', 'ADMIN');

-- CreateEnum
CREATE TYPE "HarvestStatus" AS ENUM ('DECLARED', 'VALIDATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BagStatus" AS ENUM ('CREATED', 'SCANNED', 'IN_TRANSIT', 'DELIVERED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "TransportStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INITIATED', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationalIdHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CooperativeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProducerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProducerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmPlot" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "areaHectares" DOUBLE PRECISION NOT NULL,
    "location" geometry(Polygon, 4326) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmPlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Harvest" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "farmPlotId" TEXT NOT NULL,
    "cropType" TEXT NOT NULL,
    "quantityKg" DOUBLE PRECISION NOT NULL,
    "status" "HarvestStatus" NOT NULL,
    "declaredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CocoaBag" (
    "id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "status" "BagStatus" NOT NULL,
    "scannedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "CocoaBag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BagEvent" (
    "id" TEXT NOT NULL,
    "bagId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "location" geometry(Point, 4326) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BagEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL,
    "externalRef" TEXT,
    "status" "TransactionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgriculturalScore" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "productionVolume" DOUBLE PRECISION NOT NULL,
    "deliveryRegularity" DOUBLE PRECISION NOT NULL,
    "creditHistory" DOUBLE PRECISION NOT NULL,
    "calculatedScore" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriculturalScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransporterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "capacityKg" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TransporterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportOrder" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "transporterId" TEXT,
    "pickupLocation" geometry(Point, 4326) NOT NULL,
    "dropoffLocation" geometry(Point, 4326) NOT NULL,
    "status" "TransportStatus" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TransportOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "approvedCredits" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BankProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeProfile_userId_key" ON "CooperativeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProducerProfile_userId_key" ON "ProducerProfile"("userId");

-- CreateIndex
CREATE INDEX "FarmPlot_producerId_idx" ON "FarmPlot"("producerId");

-- CreateIndex
CREATE INDEX "Harvest_producerId_idx" ON "Harvest"("producerId");

-- CreateIndex
CREATE INDEX "Harvest_farmPlotId_idx" ON "Harvest"("farmPlotId");

-- CreateIndex
CREATE UNIQUE INDEX "CocoaBag_qrCode_key" ON "CocoaBag"("qrCode");

-- CreateIndex
CREATE INDEX "CocoaBag_harvestId_idx" ON "CocoaBag"("harvestId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgriculturalScore_producerId_key" ON "AgriculturalScore"("producerId");

-- CreateIndex
CREATE UNIQUE INDEX "TransporterProfile_userId_key" ON "TransporterProfile"("userId");

-- CreateIndex
CREATE INDEX "TransportOrder_producerId_idx" ON "TransportOrder"("producerId");

-- CreateIndex
CREATE INDEX "TransportOrder_transporterId_idx" ON "TransportOrder"("transporterId");

-- CreateIndex
CREATE UNIQUE INDEX "BankProfile_userId_key" ON "BankProfile"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- AddForeignKey
ALTER TABLE "CooperativeProfile" ADD CONSTRAINT "CooperativeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducerProfile" ADD CONSTRAINT "ProducerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmPlot" ADD CONSTRAINT "FarmPlot_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "ProducerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "ProducerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_farmPlotId_fkey" FOREIGN KEY ("farmPlotId") REFERENCES "FarmPlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CocoaBag" ADD CONSTRAINT "CocoaBag_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "Harvest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagEvent" ADD CONSTRAINT "BagEvent_bagId_fkey" FOREIGN KEY ("bagId") REFERENCES "CocoaBag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgriculturalScore" ADD CONSTRAINT "AgriculturalScore_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "ProducerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransporterProfile" ADD CONSTRAINT "TransporterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "ProducerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportOrder" ADD CONSTRAINT "TransportOrder_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "TransporterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankProfile" ADD CONSTRAINT "BankProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
