import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { CreateStudentInput, UpdateStudentInput } from "@/validations/student.schema";

export const studentService = {
  async createStudent(schoolId: string, data: CreateStudentInput) {
    return await prisma.student.create({
      data: {
        schoolId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        parentPhone: data.parentPhone,
        status: data.status || "active",
      },
    });
  },

  async updateStudent(schoolId: string, studentId: string, data: UpdateStudentInput) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
    }

    return await prisma.student.update({
      where: { id: studentId },
      data,
    });
  },

  async getStudent(schoolId: string, studentId: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: {
        enrollments: {
          include: { class: true },
        },
      },
    });

    if (!student) {
      throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
    }

    return student;
  },

  async listStudents(schoolId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: { schoolId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where: { schoolId } }),
    ]);

    return { students, total, page, limit };
  },

  async deleteStudent(schoolId: string, studentId: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
    });

    if (!student) {
      throw new AppError("Student not found", 404, "STUDENT_NOT_FOUND");
    }

    return await prisma.student.update({
      where: { id: studentId },
      data: { status: "inactive" },
    });
  },
};
