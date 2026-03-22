import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { teacherPaymentService } from "@/services/teacher-payment.service";
import { generateTeacherPaymentSchema } from "@/validations/teacher-payment.schema";
import { AppError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const schoolId = await getSchoolId();
    const body = await req.json();
    const data = generateTeacherPaymentSchema.parse(body);

    const payment = await teacherPaymentService.generateTeacherPayment(
      schoolId,
      data.teacherId,
      data.month
    );

    return NextResponse.json({ success: true, data: payment });
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
