import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  subject: z.string().min(1, "Subject is required"),
  paymentPercentage: z.number().min(0).max(100).default(70),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
