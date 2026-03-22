import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validations/auth.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingSchool = await prisma.school.findUnique({
      where: { email: data.schoolEmail },
    });

    if (existingSchool) {
      return NextResponse.json(
        { success: false, error: { message: "School email already exists", code: "EMAIL_EXISTS" } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const school = await prisma.school.create({
      data: {
        name: data.schoolName,
        email: data.schoolEmail,
        phone: data.schoolPhone,
        address: data.schoolAddress,
      },
    });

    const user = await prisma.user.create({
      data: {
        schoolId: school.id,
        name: data.adminName,
        email: data.adminEmail,
        passwordHash,
        role: "admin",
      },
    });

    return NextResponse.json({
      success: true,
      data: { schoolId: school.id, userId: user.id },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
