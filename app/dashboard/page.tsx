"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, UserPlus, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

type DashboardMetrics = {
  students: { total: number; active: number; inactive: number };
  teachers: { total: number; active: number; inactive: number };
  classes: { total: number; active: number; inactive: number };
  enrollments: { total: number; active: number; inactive: number };
  revenue: { total: number; collected: number; pending: number; collectionRate: number };
  payments: { paid: number; partial: number; unpaid: number };
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!metrics) {
    return <div>Failed to load metrics</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your school management system</p>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.students.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.students.active} active, {metrics.students.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.teachers.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.teachers.active} active, {metrics.teachers.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.classes.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.classes.total} total classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.enrollments.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.enrollments.total} total enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.revenue.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Expected revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collected Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${metrics.revenue.collected.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.revenue.collectionRate}% collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${metrics.revenue.pending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.revenue.collectionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Payment efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.payments.paid}</div>
            <p className="text-xs text-muted-foreground mt-1">Fully paid months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Partial Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.payments.partial}</div>
            <p className="text-xs text-muted-foreground mt-1">Partially paid months</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.payments.unpaid}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpaid months</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Student-Teacher Ratio</span>
              <span className="font-semibold">
                {metrics.teachers.active > 0 
                  ? (metrics.students.active / metrics.teachers.active).toFixed(1) 
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Students per Class</span>
              <span className="font-semibold">
                {metrics.classes.active > 0 
                  ? (metrics.enrollments.active / metrics.classes.active).toFixed(1) 
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Enrollment Rate</span>
              <span className="font-semibold">
                {metrics.students.active > 0 
                  ? ((metrics.enrollments.active / metrics.students.active) * 100).toFixed(1) 
                  : "0"}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Revenue per Student</span>
              <span className="font-semibold">
                ${metrics.students.active > 0 
                  ? (metrics.revenue.total / metrics.students.active).toFixed(2) 
                  : "0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Revenue per Enrollment</span>
              <span className="font-semibold">
                ${metrics.enrollments.active > 0 
                  ? (metrics.revenue.total / metrics.enrollments.active).toFixed(2) 
                  : "0.00"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Success Rate</span>
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
