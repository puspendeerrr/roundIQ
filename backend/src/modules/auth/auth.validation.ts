import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum([Role.STUDENT, Role.INTERVIEWER], {
    errorMap: () => ({ message: 'Role must be STUDENT or INTERVIEWER' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const googleAuthSchema = z.object({
  googleId: z.string().min(1, 'Google ID is required'),
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  avatarUrl: z.string().url().optional(),
  role: z.enum([Role.STUDENT, Role.INTERVIEWER]).default(Role.STUDENT),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type GoogleAuthDTO = z.infer<typeof googleAuthSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;
