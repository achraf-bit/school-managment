"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

type ClassData = {
  id: string;
  name: string;
  baseMonthlyPrice: number;
  teacherId: string;
};

type ClassFormProps = {
  classData?: ClassData;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
};

export function ClassFormDialog({ classData, open: controlledOpen, onOpenChange, onSuccess }: ClassFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    baseMonthlyPrice: "",
    teacherId: "",
  });

  useEffect(() => {
    if (classData && open) {
      setFormData({
        name: classData.name,
        baseMonthlyPrice: classData.baseMonthlyPrice.toString(),
        teacherId: classData.teacherId,
      });
    }
  }, [classData, open]);

  useEffect(() => {
    if (open) {
      fetch("/api/teachers")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setTeachers(data.data.filter((t: any) => t.status === "active"));
        });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = classData ? `/api/classes/${classData.id}` : "/api/classes";
    const method = classData ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        baseMonthlyPrice: parseFloat(formData.baseMonthlyPrice),
      }),
    });

    if (res.ok) {
      setOpen(false);
      if (!classData) {
        setFormData({ name: "", baseMonthlyPrice: "", teacherId: "" });
      }
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!classData && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{classData ? "Edit Class" : "Add New Class"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Class Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Monthly Price</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.baseMonthlyPrice}
              onChange={(e) => setFormData({ ...formData, baseMonthlyPrice: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Teacher</Label>
            <Select value={formData.teacherId} onValueChange={(value) => setFormData({ ...formData, teacherId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (classData ? "Updating..." : "Creating...") : (classData ? "Update Class" : "Create Class")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
