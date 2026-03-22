import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { teacherPaymentService } from "@/services/teacher-payment.service";
import { AppError } from "@/lib/errors";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const schoolId = await getSchoolId();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json(
        { success: false, error: { message: "Month is required", code: "MONTH_REQUIRED" } },
        { status: 400 }
      );
    }

    const report = await teacherPaymentService.calculateTeacherPayment(schoolId, id, month);

    return NextResponse.json({ success: true, data: report });
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
