import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const teacherPaymentService = {
  async calculateTeacherPayment(schoolId: string, teacherId: string, month: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, schoolId },
      include: { classes: true },
    });

    if (!teacher) {
      throw new AppError("Teacher not found", 404, "TEACHER_NOT_FOUND");
    }

    const classIds = teacher.classes.map((c) => c.id);

    const monthStart = new Date(`${month}-01`);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const enrollments = await prisma.enrollment.findMany({
      where: {
        schoolId,
        classId: { in: classIds },
        startDate: { lte: monthEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: monthStart } },
        ],
      },
      include: {
        student: true,
        class: true,
      },
    });

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

    const paymentMonths = await prisma.paymentMonth.findMany({
      where: {
        schoolId,
        studentId: { in: studentIds },
        month,
      },
      include: { student: true },
    });

    const allEnrollments = await prisma.enrollment.findMany({
      where: {
        schoolId,
        studentId: { in: studentIds },
        startDate: { lte: monthEnd },
        OR: [
          { endDate: null },
          { endDate: { gte: monthStart } },
        ],
      },
    });

    const studentBreakdown = enrollments.map((enrollment) => {
      const pm = paymentMonths.find((p) => p.studentId === enrollment.studentId);
      if (!pm) return null;

      const studentEnrollments = allEnrollments.filter((e) => e.studentId === enrollment.studentId);
      const totalPrice = studentEnrollments.reduce((sum, e) => sum + e.finalPrice, 0);
      const priceRatio = totalPrice > 0 ? enrollment.finalPrice / totalPrice : 0;
      
      const classPaidAmount = pm.paidAmount * priceRatio;
      const teacherShare = classPaidAmount * (teacher.paymentPercentage / 100);

      return {
        studentId: pm.studentId,
        studentName: `${pm.student.firstName} ${pm.student.lastName}`,
        className: enrollment.class.name,
        expectedAmount: pm.expectedAmount * priceRatio,
        paidAmount: classPaidAmount,
        teacherShare,
      };
    }).filter(Boolean);

    const totalCollected = studentBreakdown.reduce((sum, s) => sum + s.paidAmount, 0);
    const teacherShare = studentBreakdown.reduce((sum, s) => sum + s.teacherShare, 0);
    const schoolShare = totalCollected - teacherShare;

    return {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        paymentPercentage: teacher.paymentPercentage,
      },
      month,
      studentBreakdown,
      summary: {
        totalCollected,
        teacherShare,
        schoolShare,
      },
    };
  },

  async generateTeacherPayment(schoolId: string, teacherId: string, month: string) {
    const calculation = await this.calculateTeacherPayment(schoolId, teacherId, month);

    const existing = await prisma.teacherPayment.findUnique({
      where: {
        teacherId_month: {
          teacherId,
          month,
        },
      },
    });

    if (existing) {
      return await prisma.teacherPayment.update({
        where: { id: existing.id },
        data: {
          totalCollected: calculation.summary.totalCollected,
          teacherShare: calculation.summary.teacherShare,
        },
      });
    }

    const payment = await prisma.teacherPayment.create({
      data: {
        schoolId,
        teacherId,
        month,
        totalCollected: calculation.summary.totalCollected,
        teacherShare: calculation.summary.teacherShare,
        status: "pending",
      },
    });

    logger.info("Teacher payment generated", { teacherId, month });

    return payment;
  },

  async markTeacherPaymentAsPaid(schoolId: string, paymentId: string) {
    const payment = await prisma.teacherPayment.findFirst({
      where: { id: paymentId, schoolId },
    });

    if (!payment) {
      throw new AppError("Teacher payment not found", 404, "PAYMENT_NOT_FOUND");
    }

    return await prisma.teacherPayment.update({
      where: { id: paymentId },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });
  },

  async listTeacherPayments(schoolId: string, filters?: { teacherId?: string; month?: string }) {
    return await prisma.teacherPayment.findMany({
      where: {
        schoolId,
        ...(filters?.teacherId && { teacherId: filters.teacherId }),
        ...(filters?.month && { month: filters.month }),
      },
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
