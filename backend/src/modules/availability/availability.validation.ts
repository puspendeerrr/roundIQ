import { z } from 'zod';

export const availabilityRuleItemSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:MM required (e.g. 09:00)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:MM required (e.g. 17:00)'),
  slotDurationMins: z.number().refine((val) => [15, 30, 45, 60, 90].includes(val), {
    message: 'Slot duration must be 15, 30, 45, 60, or 90 minutes',
  }),
  bufferMins: z.number().min(0).max(120).default(15),
  timezone: z.string().default('Asia/Kolkata'),
});

export const setWeeklyAvailabilitySchema = z.object({
  rules: z.array(availabilityRuleItemSchema),
});

export const addExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  isUnavailable: z.boolean().default(true),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  reason: z.string().max(255).optional().nullable(),
});

export type SetWeeklyAvailabilityDTO = z.infer<typeof setWeeklyAvailabilitySchema>;
export type AddExceptionDTO = z.infer<typeof addExceptionSchema>;
