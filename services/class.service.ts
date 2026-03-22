import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { CreateClassInput, UpdateClassInput } from "@/validations/class.schema";

export const classService = {
  async createClass(schoolId: string, data: CreateClassInput) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: data.teacherId, schoolId },
    });

    if (!teacher) {
      throw new AppError("Teacher not found", 404, "TEACHER_NOT_FOUND");
    }

    return await prisma.class.create({
      data: {
        schoolId,
        ...data,
      },
    });
  },

  async updateClass(schoolId: string, classId: string, data: UpdateClassInput) {
    const classData = await prisma.class.findFirst({
      where: { id: classId, schoolId },
    });

    if (!classData) {
      throw new AppError("Class not found", 404, "CLASS_NOT_FOUND");
    }

    if (data.teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: { id: data.teacherId, schoolId },
      });

      if (!teacher) {
        throw new AppError("Teacher not found", 404, "TEACHER_NOT_FOUND");
      }
    }

    return await prisma.class.update({
      where: { id: classId },
      data,
    });
  },

  async getClass(schoolId: string, classId: string) {
    const classData = await prisma.class.findFirst({
      where: { id: classId, schoolId },
      include: {
        teacher: true,
        enrollments: {
          include: { student: true },
        },
      },
    });

    if (!classData) {
      throw new AppError("Class not found", 404, "CLASS_NOT_FOUND");
    }

    return classData;
  },

  async listClasses(schoolId: string, teacherId?: string) {
    return await prisma.class.findMany({
      where: { 
        schoolId,
        ...(teacherId && { teacherId }),
      },
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
