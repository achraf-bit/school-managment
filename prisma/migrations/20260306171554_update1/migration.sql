-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "payment_percentage" DOUBLE PRECISION NOT NULL DEFAULT 70.0;

-- CreateTable
CREATE TABLE "teacher_payments" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "total_collected" DOUBLE PRECISION NOT NULL,
    "teacher_share" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacher_payments_school_id_idx" ON "teacher_payments"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_payments_teacher_id_month_key" ON "teacher_payments"("teacher_id", "month");

-- AddForeignKey
ALTER TABLE "teacher_payments" ADD CONSTRAINT "teacher_payments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_payments" ADD CONSTRAINT "teacher_payments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
