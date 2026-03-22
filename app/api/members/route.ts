import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSchoolId, getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { z } from "zod";

const createMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function GET() {
  try {
    const schoolId = await getSchoolId();
    const members = await prisma.user.findMany({
      where: { schoolId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.errorCode } },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const user = session.user as any;

    if (user.role !== "admin") {
      throw new AppError("Only admins can add members", 403, "FORBIDDEN");
    }

    const schoolId = user.schoolId;
    const body = await req.json();
    const data = createMemberSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError("Email already in use", 400, "EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const member = await prisma.user.create({
      data: { schoolId, name: data.name, email: data.email, passwordHash, role: "agent" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.errorCode } },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
