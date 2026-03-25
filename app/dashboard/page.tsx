"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, UserPlus, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type DashboardMetrics = {
  students: { total: number; active: number; inactive: number };
  teachers: { total: number; active: number; inactive: number };
  classes: { total: number; active: number; inactive: number };
  enrollments: { total: number; active: number; inactive: number };
  revenue: { total: number; collected: number; pending: number; collectionRate: number };
  payments: { paid: number; partial: number; unpaid: number };
};

export default function DashboardPage() {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMetrics(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>{t("loading")}</div>;
  if (!metrics) return <div>Failed to load metrics</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">{t("dashboard")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("overview")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("totalStudents")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.students.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{metrics.students.active} {t("active")}, {metrics.students.inactive} {t("inactive")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("totalTeachers")}</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.teachers.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{metrics.teachers.active} {t("active")}, {metrics.teachers.inactive} {t("inactive")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("activeClasses")}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.classes.active}</div>
            <p className="text-xs text-muted-foreground mt-1">{metrics.classes.total} {t("totalClasses2")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("activeEnrollments")}</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.enrollments.active}</div>
            <p className="text-xs text-muted-foreground mt-1">{metrics.enrollments.total} {t("totalEnrollments")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("expectedRevenue")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("collectedRevenue")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${metrics.revenue.collected.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{metrics.revenue.collectionRate}% {t("collectionRate")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("pendingRevenue")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${metrics.revenue.pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("outstandingPayments")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("collectionRate")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.revenue.collectionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{t("paymentEfficiency")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("paidPayments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.payments.paid}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("fullyPaidMonths")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("partialPayments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.payments.partial}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("partiallyPaidMonths")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("unpaidPayments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.payments.unpaid}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("unpaidMonths")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("quickStats")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("studentTeacherRatio")}</span>
              <span className="font-semibold">{metrics.teachers.active > 0 ? (metrics.students.active / metrics.teachers.active).toFixed(1) : "N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("avgStudentsPerClass")}</span>
              <span className="font-semibold">{metrics.classes.active > 0 ? (metrics.enrollments.active / metrics.classes.active).toFixed(1) : "N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("enrollmentRate")}</span>
              <span className="font-semibold">{metrics.students.active > 0 ? ((metrics.enrollments.active / metrics.students.active) * 100).toFixed(1) : "0"}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("financialSummary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("avgRevenuePerStudent")}</span>
              <span className="font-semibold">${metrics.students.active > 0 ? (metrics.revenue.total / metrics.students.active).toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("avgRevenuePerEnrollment")}</span>
              <span className="font-semibold">${metrics.enrollments.active > 0 ? (metrics.revenue.total / metrics.enrollments.active).toFixed(2) : "0.00"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("paymentSuccessRate")}</span>
              <span className="font-semibold">
                {(metrics.payments.paid + metrics.payments.partial + metrics.payments.unpaid) > 0
                  ? ((metrics.payments.paid / (metrics.payments.paid + metrics.payments.partial + metrics.payments.unpaid)) * 100).toFixed(1)
                  : "0"}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
