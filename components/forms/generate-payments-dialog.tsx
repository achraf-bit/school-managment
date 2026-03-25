"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type GeneratePaymentsProps = {
  onSuccess: () => void;
};

const MONTHS = [
  { value: "01", en: "January", fr: "Janvier" },
  { value: "02", en: "February", fr: "Février" },
  { value: "03", en: "March", fr: "Mars" },
  { value: "04", en: "April", fr: "Avril" },
  { value: "05", en: "May", fr: "Mai" },
  { value: "06", en: "June", fr: "Juin" },
  { value: "07", en: "July", fr: "Juillet" },
  { value: "08", en: "August", fr: "Août" },
  { value: "09", en: "September", fr: "Septembre" },
  { value: "10", en: "October", fr: "Octobre" },
  { value: "11", en: "November", fr: "Novembre" },
  { value: "12", en: "December", fr: "Décembre" },
];

export function GeneratePaymentsDialog({ onSuccess }: GeneratePaymentsProps) {
  const { t, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({ year: currentYear.toString(), month: (new Date().getMonth() + 1).toString().padStart(2, "0") });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/payments/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month: `${formData.year}-${formData.month}` }) });
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
  const selectedMonth = MONTHS.find((m) => m.value === formData.month);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Calendar className="mr-2 h-4 w-4" />{t("generateMonth")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("generateMonthlyPayments")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t("year")}</Label>
            <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map((year) => <SelectItem key={year} value={year.toString()}>{year}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("month")}</Label>
            <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>{locale === "fr" ? month.fr : month.en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md bg-muted p-3 text-sm">
            <p>{t("generatePaymentsInfo")}</p>
            <p className="mt-1 font-semibold">{selectedMonth ? (locale === "fr" ? selectedMonth.fr : selectedMonth.en) : ""} {formData.year}</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("generating") : t("generatePayments")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
