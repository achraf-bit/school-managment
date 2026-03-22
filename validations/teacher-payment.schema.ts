import { z } from "zod";

export const generateTeacherPaymentSchema = z.object({
  teacherId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
});

export const markTeacherPaymentPaidSchema = z.object({
  paidAt: z.string().datetime().optional(),
});

export type GenerateTeacherPaymentInput = z.infer<typeof generateTeacherPaymentSchema>;
export type MarkTeacherPaymentPaidInput = z.infer<typeof markTeacherPaymentPaidSchema>;
