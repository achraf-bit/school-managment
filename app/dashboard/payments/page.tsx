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
    fetch("/api/payments/months")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPayments(data.data);
          setFilteredPayments(data.data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    let result = payments;
    if (searchTerm) {
      result = result.filter(payment => 
        `${payment.student.firstName} ${payment.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(payment => payment.status === statusFilter);
    }
    if (monthFilter !== "all") {
      result = result.filter(payment => payment.month === monthFilter);
    }
    setFilteredPayments(result);
  }, [searchTerm, statusFilter, monthFilter, payments]);

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage monthly payments</p>
        </div>
        <div className="flex gap-2">
          <GeneratePaymentsDialog onSuccess={loadPayments} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Records</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {uniqueMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
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
                      <TableHead>Student</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No payment records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.student.firstName} {payment.student.lastName}
                          </TableCell>
                          <TableCell>{payment.month}</TableCell>
                          <TableCell>${payment.expectedAmount}</TableCell>
                          <TableCell>${payment.paidAmount}</TableCell>
                          <TableCell>${payment.remainingAmount}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === "paid"
                                  ? "default"
                                  : payment.status === "partial"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditPayment(payment);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredPayments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No payment records found</p>
                ) : (
                  filteredPayments.map((payment) => (
                    <Card key={payment.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">
                            {payment.student.firstName} {payment.student.lastName}
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Month: {payment.month}</p>
                            <p>Expected: ${payment.expectedAmount}</p>
                            <p>Paid: ${payment.paidAmount}</p>
                            <p>Remaining: ${payment.remainingAmount}</p>
                          </div>
                          <div className="mt-2">
                            <Badge
                              variant={
                                payment.status === "paid"
                                  ? "default"
                                  : payment.status === "partial"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditPayment(payment);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {editPayment && (
        <PaymentFormDialog
          payment={editPayment}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            loadPayments();
            setEditDialogOpen(false);
            setEditPayment(null);
          }}
        />
      )}
    </div>
  );
}
