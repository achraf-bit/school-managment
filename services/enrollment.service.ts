import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const enrollmentService = {
  async enrollSingleClass(
    schoolId: string,
    studentId: string,
    classId: string,
    startDate: Date,
    manualDiscountPercentage?: number
  ) {
    const classData = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });

    if (!classData) {
      throw new AppError("Class not found", 404, "CLASS_NOT_FOUND");
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
    }

    const basePrice = classData.baseMonthlyPrice;
    const discountPercentage = manualDiscountPercentage || 0;
    const discountAmount = (basePrice * discountPercentage) / 100;
    const finalPrice = basePrice - discountAmount;

    const enrollment = await prisma.enrollment.create({
      data: {
        schoolId,
        studentId,
        classId,
        basePrice,
        discountPercentage: discountPercentage > 0 ? discountPercentage : null,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        finalPrice,
        startDate,
        status: "active",
      },
    });

    logger.info("Single class enrollment created", { enrollmentId: enrollment.id });

    return enrollment;
  },

  async enrollPack(schoolId: string, studentId: string, packId: string, startDate: Date) {
    const pack = await prisma.pack.findFirst({
      where: { id: packId, schoolId },
      include: {
        packClasses: {
          include: { class: true },
        },
      },
    });

    if (!pack) {
      throw new AppError("Pack not found", 404, "PACK_NOT_FOUND");
    }

    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
    }

    if (pack.packClasses.length === 0) {
      throw new AppError("Pack has no classes", 400, "PACK_EMPTY");
    }

    const enrollments = await prisma.$transaction(
      pack.packClasses.map((packClass) => {
        const basePrice = packClass.class.baseMonthlyPrice;
        const discountPercentage = pack.discountPercentage;
        const discountAmount = (basePrice * discountPercentage) / 100;
        const finalPrice = basePrice - discountAmount;

        return prisma.enrollment.create({
          data: {
            schoolId,
            studentId,
            classId: packClass.classId,
            packId,
            basePrice,
            discountPercentage,
            discountAmount,
            finalPrice,
            startDate,
            status: "active",
          },
        });
      })
    );

    logger.info("Pack enrollment created", { packId, enrollmentCount: enrollments.length });

    return enrollments;
  },

  async getEnrollment(schoolId: string, enrollmentId: string) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, schoolId },
      include: {
        student: true,
        class: true,
        pack: true,
      },
    });

    if (!enrollment) {
      throw new AppError("Enrollment not found", 404, "ENROLLMENT_NOT_FOUND");
    }

    return enrollment;
  },

  async listEnrollments(schoolId: string, filters?: { studentId?: string; classId?: string }) {
    return await prisma.enrollment.findMany({
      where: {
        schoolId,
        ...(filters?.studentId && { studentId: filters.studentId }),
        ...(filters?.classId && { classId: filters.classId }),
      },
      include: {
        student: true,
        class: true,
        pack: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
