"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassFormDialog } from "@/components/forms/class-form-dialog";
import { Pencil, Search, MoreVertical, Ban, CheckCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Class = {
  id: string;
  name: string;
  baseMonthlyPrice: number;
  status: string;
  teacherId: string;
  teacher: {
    name: string;
  };
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadClasses = () => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClasses(data.data);
          setFilteredClasses(data.data);
        }
        setLoading(false);
      });
  };

  const toggleStatus = async (classId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await fetch(`/api/classes/${classId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadClasses();
  };

  const deleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    await fetch(`/api/classes/${classId}`, { method: "DELETE" });
    loadClasses();
  };

  useEffect(() => {
    let result = classes;
    if (searchTerm) {
      result = result.filter(cls => 
        cls.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(cls => cls.status === statusFilter);
    }
    setFilteredClasses(result);
  }, [searchTerm, statusFilter, classes]);

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Classes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your classes</p>
        </div>
        <ClassFormDialog onSuccess={loadClasses} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Classes</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by class name..."
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
                      <TableHead>Name</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Monthly Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No classes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClasses.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{cls.name}</TableCell>
                          <TableCell>{cls.teacher.name}</TableCell>
                          <TableCell>${cls.baseMonthlyPrice}</TableCell>
                          <TableCell>
                            <Badge variant={cls.status === "active" ? "default" : "secondary"}>
                              {cls.status}
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
                                <DropdownMenuItem onClick={() => { setEditClass(cls); setEditDialogOpen(true); }}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleStatus(cls.id, cls.status)} className={cls.status === "active" ? "text-red-600" : "text-green-600"}>
                                  {cls.status === "active" ? <><Ban className="mr-2 h-4 w-4" />Deactivate</> : <><CheckCircle className="mr-2 h-4 w-4" />Activate</>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteClass(cls.id)} className="text-red-600">
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
                {filteredClasses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No classes found</p>
                ) : (
                  filteredClasses.map((cls) => (
                    <Card key={cls.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">{cls.name}</h3>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Teacher: {cls.teacher.name}</p>
                            <p>Price: ${cls.baseMonthlyPrice}/month</p>
                          </div>
                          <div className="mt-2">
                            <Badge variant={cls.status === "active" ? "default" : "secondary"}>
                              {cls.status}
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
                            <DropdownMenuItem onClick={() => { setEditClass(cls); setEditDialogOpen(true); }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(cls.id, cls.status)} className={cls.status === "active" ? "text-red-600" : "text-green-600"}>
                              {cls.status === "active" ? <><Ban className="mr-2 h-4 w-4" />Deactivate</> : <><CheckCircle className="mr-2 h-4 w-4" />Activate</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteClass(cls.id)} className="text-red-600">
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
      {editClass && (
        <ClassFormDialog
          classData={editClass}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditClass(null);
          }}
          onSuccess={() => {
            loadClasses();
            setEditDialogOpen(false);
            setEditClass(null);
          }}
        />
      )}
    </div>
  );
}
