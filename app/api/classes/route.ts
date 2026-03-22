import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { classService } from "@/services/class.service";
import { createClassSchema } from "@/validations/class.schema";
import { AppError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const schoolId = await getSchoolId();
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId") || undefined;
    const classes = await classService.listClasses(schoolId, teacherId);
    return NextResponse.json({ success: true, data: classes });
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
    const data = createClassSchema.parse(body);
    const classData = await classService.createClass(schoolId, data);
    return NextResponse.json({ success: true, data: classData });
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
