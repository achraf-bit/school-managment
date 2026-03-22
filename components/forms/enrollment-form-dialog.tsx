"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

type EnrollmentFormProps = {
  onSuccess: () => void;
};

export function EnrollmentFormDialog({ onSuccess }: EnrollmentFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState<"single" | "pack">("single");
  const [students, setStudents] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [packs, setPacks] = useState<{ id: string; name: string; discountPercentage: number }[]>([]);
  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    packId: "",
    discountPercentage: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (open) {
      fetch("/api/students")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setStudents(data.data.students.filter((s: any) => s.status === "active"));
        });
      fetch("/api/classes")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setClasses(data.data.filter((c: any) => c.status === "active"));
        });
      fetch("/api/packs")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setPacks(data.data.filter((p: any) => p.status === "active"));
        });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = enrollmentType === "single" ? "/api/enrollments/single" : "/api/enrollments/pack";
    const payload = enrollmentType === "single"
      ? {
          studentId: formData.studentId,
          classId: formData.classId,
          discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined,
          startDate: formData.startDate,
        }
      : {
          studentId: formData.studentId,
          packId: formData.packId,
          startDate: formData.startDate,
        };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setOpen(false);
      setFormData({ studentId: "", classId: "", packId: "", discountPercentage: "", startDate: new Date().toISOString().split("T")[0] });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Enrollment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Enrollment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Enrollment Type</Label>
            <Select value={enrollmentType} onValueChange={(value: "single" | "pack") => setEnrollmentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Class</SelectItem>
                <SelectItem value="pack">Pack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Student</Label>
            <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {enrollmentType === "single" ? (
            <>
              <div>
                <Label>Class</Label>
                <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount % (Optional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                />
              </div>
            </>
          ) : (
            <div>
              <Label>Pack</Label>
              <Select value={formData.packId} onValueChange={(value) => setFormData({ ...formData, packId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pack" />
                </SelectTrigger>
                <SelectContent>
                  {packs.map((pack) => (
                    <SelectItem key={pack.id} value={pack.id}>
                      {pack.name} ({pack.discountPercentage}% discount)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Enrollment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
