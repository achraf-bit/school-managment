import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { enrollmentService } from "@/services/enrollment.service";
import { AppError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const schoolId = await getSchoolId();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId") || undefined;
    const classId = searchParams.get("classId") || undefined;

    const enrollments = await enrollmentService.listEnrollments(schoolId, {
      studentId,
      classId,
    });

    return NextResponse.json({ success: true, data: enrollments });
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
