import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { classService } from "@/services/class.service";
import { updateClassSchema } from "@/validations/class.schema";
import { AppError } from "@/lib/errors";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const schoolId = await getSchoolId();
    const body = await req.json();
    const data = updateClassSchema.parse(body);

    const classData = await classService.updateClass(schoolId, id, data);

    return NextResponse.json({ success: true, data: classData });
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
