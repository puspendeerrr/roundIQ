import { z } from 'zod';

export const updateInterviewerProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  headline: z.string().max(150, 'Headline cannot exceed 150 characters').optional().nullable(),
  bio: z.string().max(2000, 'Bio cannot exceed 2000 characters').optional().nullable(),
  currentCompany: z.string().optional().nullable(),
  previousCompanies: z.array(z.string()).default([]),
  yearsOfExperience: z.number().min(0, 'Experience cannot be negative').default(0),
  languages: z.array(z.string()).default([]),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().nullable().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().nullable().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid Portfolio URL').optional().nullable().or(z.literal('')),
  resumeUrl: z.string().url('Invalid Resume URL').optional().nullable().or(z.literal('')),
  avatarUrl: z.string().url('Invalid Avatar URL').optional().nullable().or(z.literal('')),
  skillIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
});

export type UpdateInterviewerProfileDTO = z.infer<typeof updateInterviewerProfileSchema>;
