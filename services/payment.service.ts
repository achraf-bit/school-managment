import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const paymentService = {
  async generateMonthlyPayments(schoolId: string, month: string) {
    const monthStart = new Date(`${month}-01`);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const students = await prisma.student.findMany({
      where: {
        schoolId,
        status: "active",
        enrollments: {
          some: {
            startDate: { lte: monthEnd },
            OR: [
              { endDate: null },
              { endDate: { gte: monthStart } },
            ],
          },
        },
      },
      include: {
        enrollments: {
          where: {
            startDate: { lte: monthEnd },
            OR: [
              { endDate: null },
              { endDate: { gte: monthStart } },
            ],
          },
        },
      },
    });

    const paymentMonths = await prisma.$transaction(async (tx) => {
      const results = [];
      
      for (const student of students) {
        const expectedAmount = student.enrollments.reduce(
          (sum, enrollment) => sum + enrollment.finalPrice,
          0
        );

        const existing = await tx.paymentMonth.findUnique({
          where: {
            studentId_month: {
              studentId: student.id,
              month,
            },
          },
        });

        if (existing) {
          if (existing.expectedAmount !== expectedAmount) {
            const updated = await tx.paymentMonth.update({
              where: { id: existing.id },
              data: {
                expectedAmount,
                remainingAmount: expectedAmount - existing.paidAmount,
                status:
                  existing.paidAmount >= expectedAmount
                    ? "paid"
                    : existing.paidAmount > 0
                    ? "partial"
                    : "unpaid",
              },
            });
            results.push(updated);
          } else {
            results.push(existing);
          }
        } else {
          const created = await tx.paymentMonth.create({
            data: {
              schoolId,
              studentId: student.id,
              month,
              expectedAmount,
              paidAmount: 0,
              remainingAmount: expectedAmount,
              status: "unpaid",
            },
          });
          results.push(created);
        }
      }
      
      return results;
    });

    logger.info("Monthly payments generated", { month, count: paymentMonths.length });

    return paymentMonths;
  },

  async recordPayment(
    schoolId: string,
    paymentMonthId: string,
    amount: number,
    paymentDate: Date,
    note?: string
  ) {
    const paymentMonth = await prisma.paymentMonth.findFirst({
      where: { id: paymentMonthId, schoolId },
    });

    if (!paymentMonth) {
      throw new AppError("Payment month not found", 404, "PAYMENT_MONTH_NOT_FOUND");
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.paymentTransaction.create({
        data: {
          schoolId,
          paymentMonthId,
          amount,
          paymentDate,
          note,
        },
      });

      const newPaidAmount = paymentMonth.paidAmount + amount;
      const newRemainingAmount = paymentMonth.expectedAmount - newPaidAmount;

      let status = "unpaid";
      if (newRemainingAmount <= 0) {
        status = "paid";
      } else if (newPaidAmount > 0) {
        status = "partial";
      }

      const updatedPaymentMonth = await tx.paymentMonth.update({
        where: { id: paymentMonthId },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status,
        },
      });

      return { transaction, paymentMonth: updatedPaymentMonth };
    });

    logger.info("Payment recorded", { paymentMonthId, amount });

    return result;
  },

  async getPaymentMonth(schoolId: string, paymentMonthId: string) {
    const paymentMonth = await prisma.paymentMonth.findFirst({
      where: { id: paymentMonthId, schoolId },
      include: {
        student: true,
        transactions: true,
      },
    });

    if (!paymentMonth) {
      throw new AppError("Payment month not found", 404, "PAYMENT_MONTH_NOT_FOUND");
    }

    return paymentMonth;
  },

  async listPaymentMonths(schoolId: string, filters?: { month?: string; studentId?: string }) {
    return await prisma.paymentMonth.findMany({
      where: {
        schoolId,
        ...(filters?.month && { month: filters.month }),
        ...(filters?.studentId && { studentId: filters.studentId }),
      },
      include: {
        student: true,
        transactions: true,
      },
      orderBy: { generatedAt: "desc" },
    });
  },

  async getStudentPaymentHistory(schoolId: string, studentId: string) {
    return await prisma.paymentMonth.findMany({
      where: { schoolId, studentId },
      include: { transactions: true },
      orderBy: { month: "desc" },
    });
  },
};
