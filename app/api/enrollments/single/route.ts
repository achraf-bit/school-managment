import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { enrollmentService } from "@/services/enrollment.service";
import { enrollSingleClassSchema } from "@/validations/enrollment.schema";
import { AppError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const schoolId = await getSchoolId();
    const body = await req.json();
    const data = enrollSingleClassSchema.parse(body);

    const enrollment = await enrollmentService.enrollSingleClass(
      schoolId,
      data.studentId,
      data.classId,
      new Date(data.startDate),
      data.discountPercentage
    );

    return NextResponse.json({ success: true, data: enrollment });
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
