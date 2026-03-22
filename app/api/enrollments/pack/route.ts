import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { enrollmentService } from "@/services/enrollment.service";
import { enrollPackSchema } from "@/validations/enrollment.schema";
import { AppError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const schoolId = await getSchoolId();
    const body = await req.json();
    const data = enrollPackSchema.parse(body);

    const enrollments = await enrollmentService.enrollPack(
      schoolId,
      data.studentId,
      data.packId,
      new Date(data.startDate)
    );

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
