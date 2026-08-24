import { z } from 'zod';
import { BookingSource, CancelledBy } from '@prisma/client';

export const createBookingSchema = z.object({
  interviewerProfileId: z.string().min(1, 'Interviewer profile ID is required'),
  categoryId: z.string().optional().nullable(),
  scheduledStart: z.string().datetime('ISO 8601 UTC date string required'),
  scheduledEnd: z.string().datetime('ISO 8601 UTC date string required'),
  durationMinutes: z.number().refine((val) => [15, 30, 45, 60, 90].includes(val), {
    message: 'Duration must be 15, 30, 45, 60, or 90 minutes',
  }),
  timezone: z.string().default('Asia/Kolkata'),
  studentNotes: z.string().max(1000).optional().nullable(),
  studentResumeUrl: z.string().url('Invalid resume URL').optional().nullable().or(z.literal('')),
  bookingSource: z.enum([BookingSource.WEB, BookingSource.ANDROID, BookingSource.IOS, BookingSource.ADMIN]).default(BookingSource.WEB),
});

export const declineBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required'),
});

export const createRescheduleSchema = z.object({
  requestedStart: z.string().datetime('ISO 8601 UTC date string required'),
  requestedEnd: z.string().datetime('ISO 8601 UTC date string required'),
  reason: z.string().max(500).optional(),
});

export const respondRescheduleSchema = z.object({
  accept: z.boolean(),
  reason: z.string().max(500).optional(),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;
export type DeclineBookingDTO = z.infer<typeof declineBookingSchema>;
export type CancelBookingDTO = z.infer<typeof cancelBookingSchema>;
export type CreateRescheduleDTO = z.infer<typeof createRescheduleSchema>;
export type RespondRescheduleDTO = z.infer<typeof respondRescheduleSchema>;
