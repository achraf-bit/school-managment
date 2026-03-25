"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type Teacher = { id: string; name: string; paymentPercentage: number };
type Class = { id: string; name: string };
type StudentBreakdown = { studentId: string; studentName: string; className: string; expectedAmount: number; paidAmount: number; teacherShare: number };
type PaymentReport = { teacher: Teacher; month: string; studentBreakdown: StudentBreakdown[]; summary: { totalCollected: number; teacherShare: number; schoolShare: number } };
type TeacherPayment = { id: string; status: string; paidAt: string | null };

export default function TeacherPaymentsPage() {
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [report, setReport] = useState<PaymentReport | null>(null);
  const [paymentRecord, setPaymentRecord] = useState<TeacherPayment | null>(null);
  const [loading, setLoading] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetch("/api/teachers").then((res) => res.json()).then((data) => {
      if (data.success) setTeachers(data.data.filter((t: any) => t.status === "active"));
    });
    fetch("/api/payments/months").then((res) => res.json()).then((data) => {
      if (data.success) {
        const uniqueMonths = Array.from(new Set(data.data.map((p: any) => p.month))).sort();
        setMonths(uniqueMonths as string[]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetch(`/api/classes?teacherId=${selectedTeacher}`).then((res) => res.json()).then((data) => {
        if (data.success) setClasses(data.data.filter((c: any) => c.status === "active"));
      });
    }
  }, [selectedTeacher]);

  const loadReport = () => {
    if (!selectedTeacher || !selectedMonth) return;
    setLoading(true);
    fetch(`/api/teachers/${selectedTeacher}/payment-report?month=${selectedMonth}`)
      .then((res) => res.json()).then((data) => {
        if (data.success) setReport(data.data);
        setLoading(false);
      });

    fetch(`/api/teacher-payments?teacherId=${selectedTeacher}&month=${selectedMonth}`)
      .then((res) => res.json()).then(async (data) => {
        if (data.success && data.data.length > 0) {
          setPaymentRecord(data.data[0]);
        } else {
          const res = await fetch("/api/teacher-payments/generate", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teacherId: selectedTeacher, month: selectedMonth }),
          });
          const created = await res.json();
          if (created.success) setPaymentRecord(created.data);
        }
      });
  };

  const markAsPaid = async () => {
    if (!paymentRecord) return;
    const res = await fetch(`/api/teacher-payments/${paymentRecord.id}/mark-paid`, { method: "PATCH" });
    if (res.ok) loadReport();
  };

  useEffect(() => {
    if (selectedTeacher && selectedMonth) loadReport();
  }, [selectedTeacher, selectedMonth]);

  const filteredStudents = report?.studentBreakdown.filter((student) => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = !selectedClass || selectedClass === "all" || student.className === classes.find(c => c.id === selectedClass)?.name;
    return matchesSearch && matchesClass;
  }) || [];

  const isCurrentMonth = selectedMonth === currentMonth;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">{t("teacherPayments")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("manageTeacherPayments")}</p>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-lg">{t("selectTeacherMonth")}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger><SelectValue placeholder={t("selectTeacher")} /></SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.paymentPercentage}%)</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger><SelectValue placeholder={t("selectMonth")} /></SelectTrigger>
              <SelectContent>
                {months.map((month) => <SelectItem key={month} value={month}>{month}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading && <p>{t("loadingReport")}</p>}

      {report && (
        <>
          <Card className="mb-6">
            <CardHeader><CardTitle className="text-lg">{t("paymentSummary")}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">{t("totalCollected")}</p>
                  <p className="text-2xl font-bold">${report.summary.totalCollected.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("teacherShare")} ({report.teacher.paymentPercentage}%)</p>
                  <p className="text-2xl font-bold text-green-600">${report.summary.teacherShare.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("schoolShare")}</p>
                  <p className="text-2xl font-bold text-blue-600">${report.summary.schoolShare.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <Badge variant={paymentRecord?.status === "paid" ? "default" : "secondary"} className="text-sm">
                  {paymentRecord?.status === "paid" ? t("paid") : t("pending")}
                </Badge>
                {paymentRecord?.paidAt && (
                  <span className="text-sm text-muted-foreground">{t("paidOn")} {new Date(paymentRecord.paidAt).toLocaleDateString()}</span>
                )}
                {paymentRecord?.status === "pending" && (
                  <Button onClick={markAsPaid} size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />{t("markAsPaid")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {isCurrentMonth && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("studentBreakdown")}</CardTitle>
                <div className="mt-4 flex flex-col md:flex-row gap-3">
                  <Input placeholder={t("searchStudents")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="md:w-64" />
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="md:w-48"><SelectValue placeholder={t("allClasses")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("allClasses")}</SelectItem>
                      {classes.map((cls) => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("student")}</TableHead>
                        <TableHead>{t("class")}</TableHead>
                        <TableHead>{t("expected")}</TableHead>
                        <TableHead>{t("paid")}</TableHead>
                        <TableHead>{t("teacherShare")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("noStudentsFound")}</TableCell></TableRow>
                      ) : filteredStudents.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell className="font-medium">{student.studentName}</TableCell>
                          <TableCell>{student.className}</TableCell>
                          <TableCell>${student.expectedAmount.toFixed(2)}</TableCell>
                          <TableCell>${student.paidAmount.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold text-green-600">${student.teacherShare.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden space-y-3">
                  {filteredStudents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">{t("noStudentsFound")}</p>
                  ) : filteredStudents.map((student) => (
                    <Card key={student.studentId} className="p-4">
                      <h3 className="font-medium text-base">{student.studentName}</h3>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>{t("class")}: {student.className}</p>
                        <p>{t("expected")}: ${student.expectedAmount.toFixed(2)}</p>
                        <p>{t("paid")}: ${student.paidAmount.toFixed(2)}</p>
                      </div>
                      <div className="mt-2">
                        <Badge className="bg-green-600">{t("teacherShare")}: ${student.teacherShare.toFixed(2)}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
