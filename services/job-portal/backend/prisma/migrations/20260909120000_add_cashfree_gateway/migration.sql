-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('RAZORPAY', 'CASHFREE');

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "cashfreeRefundId" TEXT,
ALTER COLUMN "razorpayRefundId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cashfreeOrderId" TEXT,
ADD COLUMN     "cfOrderStatus" TEXT,
ADD COLUMN     "cfPaymentId" TEXT,
ADD COLUMN     "gateway" "PaymentGateway" NOT NULL DEFAULT 'CASHFREE',
ADD COLUMN     "paymentSessionId" TEXT,
ALTER COLUMN "razorpayOrderId" DROP NOT NULL;

-- Backfill: existing payments were all made through Razorpay
UPDATE "Payment" SET "gateway" = 'RAZORPAY' WHERE "razorpayOrderId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Refund_cashfreeRefundId_key" ON "Refund"("cashfreeRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_cashfreeOrderId_key" ON "Payment"("cashfreeOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_cfPaymentId_key" ON "Payment"("cfPaymentId");
