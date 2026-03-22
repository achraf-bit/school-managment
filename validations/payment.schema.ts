import { z } from "zod";

export const generateMonthlyPaymentsSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
});

export const recordPaymentSchema = z.object({
  paymentMonthId: z.string().min(1, "Payment month is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z.string().or(z.date()),
  note: z.string().optional(),
});

export type GenerateMonthlyPaymentsInput = z.infer<typeof generateMonthlyPaymentsSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
