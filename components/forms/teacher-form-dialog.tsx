"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

type Teacher = {
  id: string;
  name: string;
  phone: string;
  subject: string;
  paymentPercentage?: number;
};

type TeacherFormProps = {
  teacher?: Teacher;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
};

export function TeacherFormDialog({ teacher, trigger, open: controlledOpen, onOpenChange, onSuccess }: TeacherFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    paymentPercentage: "70",
  });

  useEffect(() => {
    if (teacher && open) {
      setFormData({
        name: teacher.name,
        phone: teacher.phone,
        subject: teacher.subject,
        paymentPercentage: teacher.paymentPercentage?.toString() || "70",
      });
    }
  }, [teacher, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = teacher ? `/api/teachers/${teacher.id}` : "/api/teachers";
    const method = teacher ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        paymentPercentage: parseFloat(formData.paymentPercentage),
      }),
    });

    if (res.ok) {
      setOpen(false);
      if (!teacher) {
        setFormData({ name: "", phone: "", subject: "", paymentPercentage: "70" });
      }
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && !teacher && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{teacher ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Subject</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Payment Percentage (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.paymentPercentage}
              onChange={(e) => setFormData({ ...formData, paymentPercentage: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (teacher ? "Updating..." : "Creating...") : (teacher ? "Update Teacher" : "Create Teacher")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
