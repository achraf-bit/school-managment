"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TeacherFormDialog } from "@/components/forms/teacher-form-dialog";
import { MoreVertical, Pencil, Ban, CheckCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Teacher = {
  id: string;
  name: string;
  phone: string;
  subject: string;
  paymentPercentage: number;
  status: string;
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadTeachers = () => {
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTeachers(data.data);
          setFilteredTeachers(data.data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    let result = teachers;
    if (searchTerm) {
      result = result.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(teacher => teacher.status === statusFilter);
    }
    setFilteredTeachers(result);
  }, [searchTerm, statusFilter, teachers]);

  const toggleStatus = async (teacherId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await fetch(`/api/teachers/${teacherId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadTeachers();
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Teachers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your teachers</p>
        </div>
        <TeacherFormDialog onSuccess={loadTeachers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Teachers</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by teacher name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Payment %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No teachers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTeachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                          <TableCell className="font-medium">{teacher.name}</TableCell>
                          <TableCell>{teacher.phone}</TableCell>
                          <TableCell>{teacher.subject}</TableCell>
                          <TableCell>{teacher.paymentPercentage}%</TableCell>
                          <TableCell>
                            <Badge variant={teacher.status === "active" ? "default" : "secondary"}>
                              {teacher.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditTeacher(teacher);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleStatus(teacher.id, teacher.status)}
                                  className={teacher.status === "active" ? "text-red-600" : "text-green-600"}
                                >
                                  {teacher.status === "active" ? (
                                    <>
                                      <Ban className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredTeachers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No teachers found</p>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <Card key={teacher.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">{teacher.name}</h3>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Phone: {teacher.phone}</p>
                            <p>Subject: {teacher.subject}</p>
                            <p>Payment: {teacher.paymentPercentage}%</p>
                          </div>
                          <div className="mt-2">
                            <Badge variant={teacher.status === "active" ? "default" : "secondary"}>
                              {teacher.status}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditTeacher(teacher);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleStatus(teacher.id, teacher.status)}
                              className={teacher.status === "active" ? "text-red-600" : "text-green-600"}
                            >
                              {teacher.status === "active" ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {editTeacher && (
        <TeacherFormDialog
          teacher={editTeacher}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditTeacher(null);
          }}
          onSuccess={() => {
            loadTeachers();
            setEditDialogOpen(false);
            setEditTeacher(null);
          }}
        />
      )}
    </div>
  );
}
