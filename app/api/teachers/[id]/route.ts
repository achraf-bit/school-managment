import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { teacherService } from "@/services/teacher.service";
import { updateTeacherSchema } from "@/validations/teacher.schema";
import { AppError } from "@/lib/errors";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const schoolId = await getSchoolId();
    const body = await req.json();
    const data = updateTeacherSchema.parse(body);

    const teacher = await teacherService.updateTeacher(schoolId, params.id, data);

    return NextResponse.json({ success: true, data: teacher });
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
