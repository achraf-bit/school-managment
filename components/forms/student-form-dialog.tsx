"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  parentPhone: string;
};

type StudentFormProps = {
  student?: Student;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
};

export function StudentFormDialog({ student, trigger, open: controlledOpen, onOpenChange, onSuccess }: StudentFormProps) {
  const { t } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", parentPhone: "" });

  useEffect(() => {
    if (student && open) {
      setFormData({ firstName: student.firstName, lastName: student.lastName, phone: student.phone, parentPhone: student.parentPhone });
    }
  }, [student, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = student ? `/api/students/${student.id}` : "/api/students";
    const res = await fetch(url, { method: student ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (res.ok) {
      setOpen(false);
      if (!student) setFormData({ firstName: "", lastName: "", phone: "", parentPhone: "" });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && !student && (
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" />{t("addStudent")}</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student ? t("editStudent") : t("addNewStudent")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t("firstName")}</Label>
            <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
          </div>
          <div>
            <Label>{t("lastName")}</Label>
            <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
          </div>
          <div>
            <Label>{t("phone")}</Label>
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
          </div>
          <div>
            <Label>{t("parentPhone")}</Label>
            <Input value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (student ? t("updating") : t("creating")) : (student ? t("updateStudent") : t("createStudent"))}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
