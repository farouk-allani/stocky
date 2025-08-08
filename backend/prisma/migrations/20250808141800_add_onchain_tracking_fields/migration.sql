-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "supplyChainCompleteTxHash" TEXT,
ADD COLUMN     "supplyChainTransactionId" TEXT,
ADD COLUMN     "supplyChainTxHash" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "productOnChainId" TEXT,
ADD COLUMN     "productOnChainTxHash" TEXT;
