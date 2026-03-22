import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { paymentService } from "@/services/payment.service";
import { AppError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const schoolId = await getSchoolId();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || undefined;
    const studentId = searchParams.get("studentId") || undefined;

    const payments = await paymentService.listPaymentMonths(schoolId, {
      month,
      studentId,
    });

    return NextResponse.json({ success: true, data: payments });
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
