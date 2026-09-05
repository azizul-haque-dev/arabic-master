import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const passwordRules = {
  minLength: 8,
  specialChar: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]/;']/,
};

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(
      passwordRules.minLength,
      `Password must be at least ${passwordRules.minLength} characters`,
    )
    .regex(
      passwordRules.specialChar,
      "Password must include at least one special character",
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;
