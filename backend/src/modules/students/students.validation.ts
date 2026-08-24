import { z } from 'zod';

export const updateStudentProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  college: z.string().optional().nullable(),
  degree: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional().nullable(),
  resumeUrl: z.string().url('Invalid resume URL').optional().nullable().or(z.literal('')),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable().or(z.literal('')),
});

export type UpdateStudentProfileDTO = z.infer<typeof updateStudentProfileSchema>;
