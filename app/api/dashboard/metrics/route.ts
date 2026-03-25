import { NextResponse } from "next/server";
import { getSchoolId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const schoolId = await getSchoolId();

    const [students, teachers, classes, enrollments, paymentMonths] = await Promise.all([
      prisma.student.findMany({ where: { schoolId }, select: { status: true } }),
      prisma.teacher.findMany({ where: { schoolId }, select: { status: true } }),
      prisma.class.findMany({ where: { schoolId }, select: { status: true } }),
      prisma.enrollment.findMany({ where: { schoolId }, select: { status: true } }),
      prisma.paymentMonth.findMany({
        where: { schoolId },
        select: { expectedAmount: true, paidAmount: true, remainingAmount: true, status: true },
      }),
    ]);

    const totalRevenue = paymentMonths.reduce((sum, pm) => sum + pm.expectedAmount, 0);
    const collectedRevenue = paymentMonths.reduce((sum, pm) => sum + pm.paidAmount, 0);
    const pendingRevenue = paymentMonths.reduce((sum, pm) => sum + pm.remainingAmount, 0);
    const collectionRate = totalRevenue > 0 ? (collectedRevenue / totalRevenue) * 100 : 0;

    const paymentStatusCounts = paymentMonths.reduce(
      (acc, pm) => {
        acc[pm.status] = (acc[pm.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      success: true,
      data: {
        students: {
          total: students.length,
          active: students.filter((s) => s.status === "active").length,
          inactive: students.filter((s) => s.status !== "active").length,
        },
        teachers: {
          total: teachers.length,
          active: teachers.filter((t) => t.status === "active").length,
          inactive: teachers.filter((t) => t.status !== "active").length,
        },
        classes: {
          total: classes.length,
          active: classes.filter((c) => c.status === "active").length,
          inactive: classes.filter((c) => c.status !== "active").length,
        },
        enrollments: {
          total: enrollments.length,
          active: enrollments.filter((e) => e.status === "active").length,
          inactive: enrollments.filter((e) => e.status !== "active").length,
        },
        revenue: {
          total: totalRevenue,
          collected: collectedRevenue,
          pending: pendingRevenue,
          collectionRate: Math.round(collectionRate * 100) / 100,
        },
        payments: {
          paid: paymentStatusCounts.paid || 0,
          partial: paymentStatusCounts.partial || 0,
          unpaid: paymentStatusCounts.unpaid || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: 500 }
    );
  }
}
