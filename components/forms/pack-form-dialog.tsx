"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

type PackData = {
  id: string;
  name: string;
  discountPercentage: number;
  packClasses: { class: { id: string } }[];
};

type PackFormProps = {
  pack?: PackData;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
};

export function PackFormDialog({ pack, open: controlledOpen, onOpenChange, onSuccess }: PackFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    discountPercentage: "",
    classIds: [] as string[],
  });

  useEffect(() => {
    if (pack && open) {
      setFormData({
        name: pack.name,
        discountPercentage: pack.discountPercentage.toString(),
        classIds: pack.packClasses.map(pc => pc.class.id),
      });
    }
  }, [pack, open]);

  useEffect(() => {
    if (open) {
      fetch("/api/classes")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setClasses(data.data.filter((c: any) => c.status === "active"));
        });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = pack ? `/api/packs/${pack.id}` : "/api/packs";
    const method = pack ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        discountPercentage: parseFloat(formData.discountPercentage),
      }),
    });

    if (res.ok) {
      setOpen(false);
      if (!pack) {
        setFormData({ name: "", discountPercentage: "", classIds: [] });
      }
      onSuccess();
    }
    setLoading(false);
  };

  const toggleClass = (classId: string) => {
    setFormData({
      ...formData,
      classIds: formData.classIds.includes(classId)
        ? formData.classIds.filter((id) => id !== classId)
        : [...formData.classIds, classId],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!pack && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Pack
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{pack ? "Edit Pack" : "Add New Pack"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Pack Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Discount Percentage</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Select Classes</Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded p-2">
              {classes.map((cls) => (
                <label key={cls.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.classIds.includes(cls.id)}
                    onChange={() => toggleClass(cls.id)}
                  />
                  <span>{cls.name}</span>
                </label>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading || formData.classIds.length === 0} className="w-full">
            {loading ? (pack ? "Updating..." : "Creating...") : (pack ? "Update Pack" : "Create Pack")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
