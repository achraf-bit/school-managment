"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StudentFormDialog } from "@/components/forms/student-form-dialog";
import { MoreVertical, Pencil, Ban, CheckCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/language-provider";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  parentPhone: string;
  status: string;
};

export default function StudentsPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadStudents = () => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudents(data.data.students);
          setFilteredStudents(data.data.students);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    let result = students;
    if (searchTerm) result = result.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== "all") result = result.filter(s => s.status === statusFilter);
    setFilteredStudents(result);
  }, [searchTerm, statusFilter, students]);

  const toggleStatus = async (studentId: string, currentStatus: string) => {
    await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: currentStatus === "active" ? "inactive" : "active" }),
    });
    loadStudents();
  };

  useEffect(() => { loadStudents(); }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{t("students")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("manageStudents")}</p>
        </div>
        <StudentFormDialog onSuccess={loadStudents} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("allStudents")}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("searchStudents")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="inactive">{t("inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p>{t("loading")}</p> : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("phone")}</TableHead>
                      <TableHead>{t("parentPhone")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("noStudents")}</TableCell></TableRow>
                    ) : filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell>{student.parentPhone}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>{t(student.status as any)}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditStudent(student); setEditDialogOpen(true); }}>
                                <Pencil className="mr-2 h-4 w-4" />{t("edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleStatus(student.id, student.status)} className={student.status === "active" ? "text-red-600" : "text-green-600"}>
                                {student.status === "active" ? <><Ban className="mr-2 h-4 w-4" />{t("deactivate")}</> : <><CheckCircle className="mr-2 h-4 w-4" />{t("activate")}</>}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredStudents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">{t("noStudents")}</p>
                ) : filteredStudents.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-base">{student.firstName} {student.lastName}</h3>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p>{t("phone")}: {student.phone}</p>
                          <p>{t("parentPhone")}: {student.parentPhone}</p>
                        </div>
                        <div className="mt-2">
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>{t(student.status as any)}</Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditStudent(student); setEditDialogOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" />{t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(student.id, student.status)} className={student.status === "active" ? "text-red-600" : "text-green-600"}>
                            {student.status === "active" ? <><Ban className="mr-2 h-4 w-4" />{t("deactivate")}</> : <><CheckCircle className="mr-2 h-4 w-4" />{t("activate")}</>}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {editStudent && (
        <StudentFormDialog student={editStudent} open={editDialogOpen}
          onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditStudent(null); }}
          onSuccess={() => { loadStudents(); setEditDialogOpen(false); setEditStudent(null); }}
        />
      )}
    </div>
  );
}
