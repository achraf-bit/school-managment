import { z } from "zod";

export const registerSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  schoolEmail: z.string().email("Invalid email"),
  schoolPhone: z.string().min(1, "Phone is required"),
  schoolAddress: z.string().min(1, "Address is required"),
  adminName: z.string().min(1, "Admin name is required"),
  adminEmail: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
