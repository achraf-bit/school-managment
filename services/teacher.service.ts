import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { CreateTeacherInput, UpdateTeacherInput } from "@/validations/teacher.schema";

export const teacherService = {
  async createTeacher(schoolId: string, data: CreateTeacherInput) {
    return await prisma.teacher.create({
      data: {
        schoolId,
        ...data,
      },
    });
  },

  async updateTeacher(schoolId: string, teacherId: string, data: UpdateTeacherInput) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, schoolId },
    });

    if (!teacher) {
      throw new AppError("Teacher not found", 404, "TEACHER_NOT_FOUND");
    }

    return await prisma.teacher.update({
      where: { id: teacherId },
      data,
    });
  },

  async getTeacher(schoolId: string, teacherId: string) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: teacherId, schoolId },
      include: { classes: true },
    });

    if (!teacher) {
      throw new AppError("Teacher not found", 404, "TEACHER_NOT_FOUND");
    }

    return teacher;
  },

  async listTeachers(schoolId: string) {
    return await prisma.teacher.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
    });
  },
};
