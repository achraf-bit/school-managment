import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const schoolId = await getSchoolId();
    const { id } = await params;
    const body = await req.json();

    const pack = await prisma.pack.findFirst({
      where: { id, schoolId },
    });

    if (!pack) {
      throw new AppError("Pack not found", 404, "PACK_NOT_FOUND");
    }

    const updated = await prisma.pack.update({
      where: { id },
      data: { status: body.status },
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

    const pack = await prisma.pack.findFirst({
      where: { id, schoolId },
    });

    if (!pack) {
      throw new AppError("Pack not found", 404, "PACK_NOT_FOUND");
    }

    await prisma.pack.delete({ where: { id } });

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
