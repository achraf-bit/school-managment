import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { paymentService } from "@/services/payment.service";
import { generateMonthlyPaymentsSchema } from "@/validations/payment.schema";
import { AppError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const schoolId = await getSchoolId();
    const body = await req.json();
    const data = generateMonthlyPaymentsSchema.parse(body);

    const paymentMonths = await paymentService.generateMonthlyPayments(schoolId, data.month);

    return NextResponse.json({ success: true, data: paymentMonths });
  } catch (error: any) {
    console.log(error);
    
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
