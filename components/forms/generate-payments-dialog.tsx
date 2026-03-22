"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

type GeneratePaymentsProps = {
  onSuccess: () => void;
};

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function GeneratePaymentsDialog({ onSuccess }: GeneratePaymentsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear.toString(),
    month: (new Date().getMonth() + 1).toString().padStart(2, "0"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const monthString = `${formData.year}-${formData.month}`;

    const res = await fetch("/api/payments/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: monthString }),
    });

    if (res.ok) {
      setOpen(false);
      onSuccess();
    } else {
      const data = await res.json();
      alert(data.error?.message || "Failed to generate payments");
    }
    setLoading(false);
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Generate Month
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Monthly Payments</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Year</Label>
            <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Month</Label>
            <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <p>This will generate payment records for all active students for:</p>
            <p className="mt-1 font-semibold">
              {MONTHS.find((m) => m.value === formData.month)?.label} {formData.year}
            </p>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Payments"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
