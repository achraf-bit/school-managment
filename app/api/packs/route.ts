import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { packService } from "@/services/pack.service";
import { createPackSchema } from "@/validations/pack.schema";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const schoolId = await getSchoolId();
    const packs = await packService.listPacks(schoolId);
    return NextResponse.json({ success: true, data: packs });
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
    const data = createPackSchema.parse(body);
    const pack = await packService.createPack(schoolId, data);
    return NextResponse.json({ success: true, data: pack });
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
