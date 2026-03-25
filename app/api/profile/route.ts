import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    const userId = (session.user as any).id;
    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

    const updateData: any = {};

    if (data.name) updateData.name = data.name;

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new AppError("Current password is required", 400, "CURRENT_PASSWORD_REQUIRED");
      }
      const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!valid) throw new AppError("Current password is incorrect", 400, "INVALID_PASSWORD");
      updateData.passwordHash = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
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
