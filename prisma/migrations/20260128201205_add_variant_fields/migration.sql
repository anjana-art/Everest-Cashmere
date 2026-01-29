-- AlterTable
ALTER TABLE "products" ADD COLUMN     "availableColors" TEXT[],
ADD COLUMN     "availableSizes" TEXT[],
ADD COLUMN     "defaultColor" TEXT,
ADD COLUMN     "defaultSize" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "stripeId" DROP NOT NULL;
