"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EnrollmentFormDialog } from "@/components/forms/enrollment-form-dialog";
import { MoreVertical, Ban, CheckCircle, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Enrollment = {
  id: string;
  finalPrice: number;
  status: string;
  startDate: string;
  student: { firstName: string; lastName: string };
  class: { name: string };
  pack?: { name: string };
};

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadEnrollments = () => {
    fetch("/api/enrollments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEnrollments(data.data);
          setFilteredEnrollments(data.data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    let result = enrollments;
    if (searchTerm) {
      result = result.filter(enrollment => 
        `${enrollment.student.firstName} ${enrollment.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(enrollment => enrollment.status === statusFilter);
    }
    setFilteredEnrollments(result);
  }, [searchTerm, statusFilter, enrollments]);

  const toggleStatus = async (enrollmentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await fetch(`/api/enrollments/${enrollmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadEnrollments();
  };

  const deleteEnrollment = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to delete this enrollment?")) return;
    await fetch(`/api/enrollments/${enrollmentId}`, { method: "DELETE" });
    loadEnrollments();
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Enrollments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage student enrollments</p>
        </div>
        <EnrollmentFormDialog onSuccess={loadEnrollments} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Enrollments</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name..."
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
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Pack</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No enrollments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.student.firstName} {enrollment.student.lastName}
                          </TableCell>
                          <TableCell>{enrollment.class.name}</TableCell>
                          <TableCell>{enrollment.pack?.name || "-"}</TableCell>
                          <TableCell>{new Date(enrollment.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>${enrollment.finalPrice}</TableCell>
                          <TableCell>
                            <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                              {enrollment.status}
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
                                  onClick={() => toggleStatus(enrollment.id, enrollment.status)}
                                  className={enrollment.status === "active" ? "text-red-600" : "text-green-600"}
                                >
                                  {enrollment.status === "active" ? (
                                    <>
                                      <Ban className="mr-2 h-4 w-4" />
                                      Cancel Enrollment
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Reactivate Enrollment
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteEnrollment(enrollment.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
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

              <div className="md:hidden space-y-3">
                {filteredEnrollments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No enrollments found</p>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">
                            {enrollment.student.firstName} {enrollment.student.lastName}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Class: {enrollment.class.name}</p>
                            <p>Pack: {enrollment.pack?.name || "-"}</p>
                            <p>Start Date: {new Date(enrollment.startDate).toLocaleDateString()}</p>
                            <p>Price: ${enrollment.finalPrice}</p>
                          </div>
                          <div className="mt-2">
                            <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                              {enrollment.status}
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
                              onClick={() => toggleStatus(enrollment.id, enrollment.status)}
                              className={enrollment.status === "active" ? "text-red-600" : "text-green-600"}
                            >
                              {enrollment.status === "active" ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Cancel Enrollment
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Reactivate Enrollment
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteEnrollment(enrollment.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
    </div>
  );
}
