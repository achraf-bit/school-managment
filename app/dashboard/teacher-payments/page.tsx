"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

type Teacher = {
  id: string;
  name: string;
  paymentPercentage: number;
};

type Class = {
  id: string;
  name: string;
};

type StudentBreakdown = {
  studentId: string;
  studentName: string;
  className: string;
  expectedAmount: number;
  paidAmount: number;
  teacherShare: number;
};

type PaymentReport = {
  teacher: Teacher;
  month: string;
  studentBreakdown: StudentBreakdown[];
  summary: {
    totalCollected: number;
    teacherShare: number;
    schoolShare: number;
  };
};

type TeacherPayment = {
  id: string;
  status: string;
  paidAt: string | null;
};

export default function TeacherPaymentsPage() {
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
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTeachers(data.data.filter((t: any) => t.status === "active"));
      });

    fetch("/api/payments/months")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const uniqueMonths = Array.from(new Set(data.data.map((p: any) => p.month))).sort();
          setMonths(uniqueMonths as string[]);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetch(`/api/classes?teacherId=${selectedTeacher}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setClasses(data.data.filter((c: any) => c.status === "active"));
        });
    }
  }, [selectedTeacher]);

  const loadReport = () => {
    if (!selectedTeacher || !selectedMonth) return;

    setLoading(true);
    fetch(`/api/teachers/${selectedTeacher}/payment-report?month=${selectedMonth}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReport(data.data);
        setLoading(false);
      });

    fetch(`/api/teacher-payments?teacherId=${selectedTeacher}&month=${selectedMonth}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success && data.data.length > 0) {
          setPaymentRecord(data.data[0]);
        } else {
          const res = await fetch("/api/teacher-payments/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ teacherId: selectedTeacher, month: selectedMonth }),
          });
          const created = await res.json();
          if (created.success) setPaymentRecord(created.data);
        }
      });
  };

  const markAsPaid = async () => {
    if (!paymentRecord) return;

    const res = await fetch(`/api/teacher-payments/${paymentRecord.id}/mark-paid`, {
      method: "PATCH",
    });

    if (res.ok) {
      alert("Payment marked as paid!");
      loadReport();
    }
  };

  useEffect(() => {
    if (selectedTeacher && selectedMonth) {
      loadReport();
    }
  }, [selectedTeacher, selectedMonth]);

  const filteredStudents = report?.studentBreakdown.filter((student) => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = !selectedClass || student.className === classes.find(c => c.id === selectedClass)?.name;
    return matchesSearch && matchesClass;
  }) || [];

  const isCurrentMonth = selectedMonth === currentMonth;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Teacher Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Calculate and track teacher payments</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Select Teacher & Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.paymentPercentage}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && <p>Loading report...</p>}

      {report && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold">${report.summary.totalCollected.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teacher Share ({report.teacher.paymentPercentage}%)</p>
                  <p className="text-2xl font-bold text-green-600">${report.summary.teacherShare.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">School Share</p>
                  <p className="text-2xl font-bold text-blue-600">${report.summary.schoolShare.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 items-center">
                <Badge variant={paymentRecord?.status === "paid" ? "default" : "secondary"} className="text-sm">
                  {paymentRecord?.status === "paid" ? "Paid" : "Pending"}
                </Badge>
                {paymentRecord?.paidAt && (
                  <span className="text-sm text-muted-foreground">
                    Paid on: {new Date(paymentRecord.paidAt).toLocaleDateString()}
                  </span>
                )}
                {paymentRecord?.status === "pending" && (
                  <Button onClick={markAsPaid} size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {isCurrentMonth && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Breakdown</CardTitle>
                <div className="mt-4 flex flex-col md:flex-row gap-3">
                  <Input
                    placeholder="Search by student name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="md:w-64"
                  />
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="md:w-48">
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Expected</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Teacher Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No students found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map((student) => (
                          <TableRow key={student.studentId}>
                            <TableCell className="font-medium">{student.studentName}</TableCell>
                            <TableCell>{student.className}</TableCell>
                            <TableCell>${student.expectedAmount.toFixed(2)}</TableCell>
                            <TableCell>${student.paidAmount.toFixed(2)}</TableCell>
                            <TableCell className="font-semibold text-green-600">
                              ${student.teacherShare.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="md:hidden space-y-3">
                  {filteredStudents.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No students found</p>
                  ) : (
                    filteredStudents.map((student) => (
                      <Card key={student.studentId} className="p-4">
                        <h3 className="font-medium text-base">{student.studentName}</h3>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p>Class: {student.className}</p>
                          <p>Expected: ${student.expectedAmount.toFixed(2)}</p>
                          <p>Paid: ${student.paidAmount.toFixed(2)}</p>
                        </div>
                        <div className="mt-2">
                          <Badge className="bg-green-600">
                            Teacher Share: ${student.teacherShare.toFixed(2)}
                          </Badge>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
