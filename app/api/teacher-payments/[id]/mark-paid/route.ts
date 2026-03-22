import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { teacherPaymentService } from "@/services/teacher-payment.service";
import { AppError } from "@/lib/errors";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const schoolId = await getSchoolId();
    const { id } = await params;

    const payment = await teacherPaymentService.markTeacherPaymentAsPaid(schoolId, id);

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
