import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { teacherService } from "@/services/teacher.service";
import { createTeacherSchema } from "@/validations/teacher.schema";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const schoolId = await getSchoolId();
    const teachers = await teacherService.listTeachers(schoolId);
    return NextResponse.json({ success: true, data: teachers });
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
    const schoolId = await getSchoolId();
    const body = await req.json();
    const data = createTeacherSchema.parse(body);
    const teacher = await teacherService.createTeacher(schoolId, data);
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
