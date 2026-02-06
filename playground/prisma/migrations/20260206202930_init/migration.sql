-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('product', 'discount', 'lost');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "suggestedColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL,
    "type" "PrizeType" NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "probability" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "discountValue" INTEGER,
    "productId" TEXT,
    "wheelConfigId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WheelConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "availableSpins" INTEGER NOT NULL DEFAULT 3,
    "spinDuration" INTEGER NOT NULL DEFAULT 4000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WheelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prize_wheelConfigId_idx" ON "Prize"("wheelConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "WheelConfig_name_key" ON "WheelConfig"("name");

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_wheelConfigId_fkey" FOREIGN KEY ("wheelConfigId") REFERENCES "WheelConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
