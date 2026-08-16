import { VALIDATION } from "@/shared/constants.js";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(VALIDATION.NAME.MIN_LENGTH).max(VALIDATION.NAME.MAX_LENGTH),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(VALIDATION.PASSWORD.MIN_LENGTH).max(VALIDATION.PASSWORD.MAX_LENGTH),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(VALIDATION.PASSWORD.MIN_LENGTH).max(VALIDATION.PASSWORD.MAX_LENGTH),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
