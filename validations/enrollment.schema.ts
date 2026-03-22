import { z } from "zod";

export const enrollSingleClassSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().min(1, "Class is required"),
  discountPercentage: z.number().min(0).max(100).optional(),
  startDate: z.string().or(z.date()),
});

export const enrollPackSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  packId: z.string().min(1, "Pack is required"),
  startDate: z.string().or(z.date()),
});

export type EnrollSingleClassInput = z.infer<typeof enrollSingleClassSchema>;
export type EnrollPackInput = z.infer<typeof enrollPackSchema>;
