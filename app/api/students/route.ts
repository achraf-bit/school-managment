import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { studentService } from "@/services/student.service";
import { createStudentSchema } from "@/validations/student.schema";
import { AppError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const schoolId = await getSchoolId();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await studentService.listStudents(schoolId, page, limit);

    return NextResponse.json({ success: true, data: result });
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
    const data = createStudentSchema.parse(body);

    const student = await studentService.createStudent(schoolId, data);

    return NextResponse.json({ success: true, data: student });
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
