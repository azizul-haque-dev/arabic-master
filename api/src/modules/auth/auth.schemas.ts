import { z } from 'zod';

const email = z.string().trim().toLowerCase().pipe(z.email());

export const registerSchema = z.strictObject({
  email,
  fullName: z.string().min(2).max(50),
  password: z.string().min(8).max(128),
});
export const loginSchema = z.strictObject({
  email,
  password: z.string().min(1).max(128),
});
export const forgotPasswordSchema = z.strictObject({ email });
export const resetPasswordSchema = z.strictObject({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128), // max limit: prevents DoS via overly long input to argon2
});

export const googleAuthSchema = z
  .strictObject({
    idToken: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    codeVerifier: z.string().min(1).optional(),
    redirectUri: z.string().min(1).optional(),
  })
  .refine((data) => data.idToken || data.code, {
    message: 'Either idToken or code must be provided',
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
