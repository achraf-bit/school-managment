import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  baseMonthlyPrice: z.number().positive("Price must be positive"),
  teacherId: z.string().min(1, "Teacher is required"),
  status: z.enum(["active", "archived"]).default("active"),
});

export const updateClassSchema = createClassSchema.partial();

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
