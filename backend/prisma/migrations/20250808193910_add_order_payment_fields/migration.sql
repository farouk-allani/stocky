-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "walletAddress" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentEscrowTxHash" TEXT,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentStatus" TEXT;
