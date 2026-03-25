"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentFormDialog } from "@/components/forms/payment-form-dialog";
import { GeneratePaymentsDialog } from "@/components/forms/generate-payments-dialog";
import { Pencil, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function PaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<PaymentMonth[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPayment, setEditPayment] = useState<PaymentMonth | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  const uniqueMonths = Array.from(new Set(payments.map(p => p.month))).sort();

  const loadPayments = () => {
    fetch("/api/payments/months").then((res) => res.json()).then((data) => {
      if (data.success) { setPayments(data.data); setFilteredPayments(data.data); }
      setLoading(false);
    });
  };

  useEffect(() => {
    let result = payments;
    if (searchTerm) result = result.filter(p => `${p.student.firstName} ${p.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== "all") result = result.filter(p => p.status === statusFilter);
    if (monthFilter !== "all") result = result.filter(p => p.month === monthFilter);
    setFilteredPayments(result);
  }, [searchTerm, statusFilter, monthFilter, payments]);

  useEffect(() => { loadPayments(); }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{t("payments")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("managePayments")}</p>
        </div>
        <GeneratePaymentsDialog onSuccess={loadPayments} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("paymentRecords")}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("searchPayments")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t("filterByMonth")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allMonths")}</SelectItem>
                {uniqueMonths.map((month) => <SelectItem key={month} value={month}>{month}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t("filterByStatus")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="paid">{t("paid")}</SelectItem>
                <SelectItem value="partial">{t("partial")}</SelectItem>
                <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p>{t("loading")}</p> : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("student")}</TableHead>
                      <TableHead>{t("month")}</TableHead>
                      <TableHead>{t("expected")}</TableHead>
                      <TableHead>{t("paid")}</TableHead>
                      <TableHead>{t("remaining")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t("noPaymentRecords")}</TableCell></TableRow>
                    ) : filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.student.firstName} {payment.student.lastName}</TableCell>
                        <TableCell>{payment.month}</TableCell>
                        <TableCell>${payment.expectedAmount}</TableCell>
                        <TableCell>${payment.paidAmount}</TableCell>
                        <TableCell>${payment.remainingAmount}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === "paid" ? "default" : payment.status === "partial" ? "secondary" : "destructive"}>
                            {t(payment.status as any)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => { setEditPayment(payment); setEditDialogOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredPayments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">{t("noPaymentRecords")}</p>
                ) : filteredPayments.map((payment) => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-base">{payment.student.firstName} {payment.student.lastName}</h3>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p>{t("month")}: {payment.month}</p>
                          <p>{t("expected")}: ${payment.expectedAmount}</p>
                          <p>{t("paid")}: ${payment.paidAmount}</p>
                          <p>{t("remaining")}: ${payment.remainingAmount}</p>
                        </div>
                        <div className="mt-2">
                          <Badge variant={payment.status === "paid" ? "default" : payment.status === "partial" ? "secondary" : "destructive"}>
                            {t(payment.status as any)}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { setEditPayment(payment); setEditDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {editPayment && (
        <PaymentFormDialog payment={editPayment} open={editDialogOpen} onOpenChange={setEditDialogOpen}
          onSuccess={() => { loadPayments(); setEditDialogOpen(false); setEditPayment(null); }}
        />
      )}
    </div>
  );
}
