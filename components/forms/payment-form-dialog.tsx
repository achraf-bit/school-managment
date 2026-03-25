"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type PaymentMonth = {
  id: string;
  month: string;
  expectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  student: { firstName: string; lastName: string };
};

type PaymentFormProps = {
  payment?: PaymentMonth;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
};

export function PaymentFormDialog({ payment, open: controlledOpen, onOpenChange, onSuccess }: PaymentFormProps) {
  const { t } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [paymentMonths, setPaymentMonths] = useState<{ id: string; month: string; student: { firstName: string; lastName: string }; remainingAmount: number }[]>([]);
  const [formData, setFormData] = useState({ paymentMonthId: "", amount: "", paymentDate: new Date().toISOString().split("T")[0], note: "" });

  useEffect(() => {
    if (payment) {
      setFormData({ paymentMonthId: payment.id, amount: payment.remainingAmount.toString(), paymentDate: new Date().toISOString().split("T")[0], note: "" });
    }
  }, [payment]);

  useEffect(() => {
    if (open && !payment) {
      fetch("/api/payments/months").then((res) => res.json()).then((data) => {
        if (data.success) setPaymentMonths(data.data.filter((pm: any) => pm.status !== "paid"));
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/payments/record", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) }) });
    if (res.ok) {
      setOpen(false);
      setFormData({ paymentMonthId: "", amount: "", paymentDate: new Date().toISOString().split("T")[0], note: "" });
      onSuccess();
    } else {
      const error = await res.json();
      alert(error.error?.message || "Failed to record payment");
    }
    setLoading(false);
  };

  const remaining = payment ? payment.remainingAmount : paymentMonths.find(pm => pm.id === formData.paymentMonthId)?.remainingAmount || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!payment && (
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" />{t("recordPayment")}</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payment ? t("editPaymentTitle") : t("recordPaymentTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!payment && (
            <div>
              <Label>{t("paymentMonth")}</Label>
              <Select value={formData.paymentMonthId} onValueChange={(value) => setFormData({ ...formData, paymentMonthId: value })}>
                <SelectTrigger><SelectValue placeholder={t("selectPaymentMonth")} /></SelectTrigger>
                <SelectContent>
                  {paymentMonths.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.student.firstName} {pm.student.lastName} - {pm.month} (${pm.remainingAmount} {t("remaining2")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {payment && (
            <div>
              <Label>{t("paymentMonth")}</Label>
              <Input value={`${payment.student.firstName} ${payment.student.lastName} - ${payment.month}`} disabled />
            </div>
          )}
          <div>
            <Label>{t("amount")} ({t("remaining")}: ${remaining})</Label>
            <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
          </div>
          <div>
            <Label>{t("paymentDate")}</Label>
            <Input type="date" value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} required />
          </div>
          <div>
            <Label>{t("noteOptional")}</Label>
            <Input value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t("recording") : t("recordPayment")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
