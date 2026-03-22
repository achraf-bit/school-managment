import { z } from "zod";

export const createPackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  discountPercentage: z.number().min(0).max(100, "Discount must be between 0 and 100"),
  classIds: z.array(z.string()).min(1, "At least one class is required"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updatePackSchema = createPackSchema.partial();

export type CreatePackInput = z.infer<typeof createPackSchema>;
export type UpdatePackInput = z.infer<typeof updatePackSchema>;
