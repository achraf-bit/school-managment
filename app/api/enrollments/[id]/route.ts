import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const schoolId = await getSchoolId();
    const { id } = await params;
    const body = await req.json();

    const enrollment = await prisma.enrollment.findFirst({
      where: { id, schoolId },
    });

    if (!enrollment) {
      throw new AppError("Enrollment not found", 404, "ENROLLMENT_NOT_FOUND");
    }

    const updated = await prisma.enrollment.update({
      where: { id },
      data: { 
        status: body.status,
        ...(body.status === "inactive" && !enrollment.endDate && { endDate: new Date() }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const schoolId = await getSchoolId();
    const { id } = await params;

    const enrollment = await prisma.enrollment.findFirst({
      where: { id, schoolId },
    });

    if (!enrollment) {
      throw new AppError("Enrollment not found", 404, "ENROLLMENT_NOT_FOUND");
    }

    await prisma.enrollment.delete({ where: { id } });

    return NextResponse.json({ success: true });
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
