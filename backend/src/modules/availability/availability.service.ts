import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { SetWeeklyAvailabilityDTO, AddExceptionDTO } from './availability.validation';
import { BookingStatus, VerificationStatus } from '@prisma/client';

export class AvailabilityService {
  async getInterviewerAvailability(userId: string) {
    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { userId },
    });

    if (!interviewer) {
      throw new AppError('Interviewer profile not found', 404, 'INTERVIEWER_NOT_FOUND');
    }

    const [rules, exceptions] = await Promise.all([
      prisma.availabilityRule.findMany({
        where: { interviewerId: interviewer.id, isActive: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      }),
      prisma.availabilityException.findMany({
        where: {
          interviewerId: interviewer.id,
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    return { rules, exceptions };
  }

  async setWeeklyRules(userId: string, dto: SetWeeklyAvailabilityDTO) {
    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { userId },
    });

    if (!interviewer) {
      throw new AppError('Interviewer profile not found', 404, 'INTERVIEWER_NOT_FOUND');
    }

    // Validate rules: startTime < endTime
    for (const rule of dto.rules) {
      if (rule.startTime >= rule.endTime) {
        throw new AppError(
          `Invalid time range on day ${rule.dayOfWeek}: Start time (${rule.startTime}) must be before End time (${rule.endTime})`,
          400,
          'INVALID_TIME_RANGE'
        );
      }
    }

    // Replace rules inside transaction
    await prisma.$transaction(async (tx) => {
      await tx.availabilityRule.deleteMany({
        where: { interviewerId: interviewer.id },
      });

      if (dto.rules.length > 0) {
        await tx.availabilityRule.createMany({
          data: dto.rules.map((rule) => ({
            interviewerId: interviewer.id,
            dayOfWeek: rule.dayOfWeek,
            startTime: rule.startTime,
            endTime: rule.endTime,
            slotDurationMins: rule.slotDurationMins,
            bufferMins: rule.bufferMins,
            timezone: rule.timezone,
            isActive: true,
          })),
        });
      }
    });

    return this.getInterviewerAvailability(userId);
  }

  async addException(userId: string, dto: AddExceptionDTO) {
    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { userId },
    });

    if (!interviewer) {
      throw new AppError('Interviewer profile not found', 404, 'INTERVIEWER_NOT_FOUND');
    }

    const exceptionDate = new Date(dto.date);

    const exception = await prisma.availabilityException.create({
      data: {
        interviewerId: interviewer.id,
        date: exceptionDate,
        isUnavailable: dto.isUnavailable,
        startTime: dto.startTime || null,
        endTime: dto.endTime || null,
        reason: dto.reason || null,
      },
    });

    return exception;
  }

  async deleteException(userId: string, exceptionId: string) {
    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { userId },
    });

    if (!interviewer) {
      throw new AppError('Interviewer profile not found', 404, 'INTERVIEWER_NOT_FOUND');
    }

    const exception = await prisma.availabilityException.findFirst({
      where: { id: exceptionId, interviewerId: interviewer.id },
    });

    if (!exception) {
      throw new AppError('Exception not found', 404, 'EXCEPTION_NOT_FOUND');
    }

    await prisma.availabilityException.delete({
      where: { id: exceptionId },
    });

    return { success: true };
  }

  // DYNAMIC SLOT GENERATOR FOR A SPECIFIC INTERVIEWER AND DATE
  async getAvailableSlots(interviewerProfileId: string, dateStr: string, durationMins = 60) {
    const interviewer = await prisma.interviewerProfile.findFirst({
      where: {
        id: interviewerProfileId,
        verificationStatus: VerificationStatus.APPROVED,
        user: { status: 'ACTIVE' },
      },
    });

    if (!interviewer) {
      throw new AppError('Interviewer is not verified or currently unavailable', 404, 'INTERVIEWER_UNAVAILABLE');
    }

    const targetDate = new Date(dateStr);
    if (isNaN(targetDate.getTime())) {
      throw new AppError('Invalid date format. Use YYYY-MM-DD', 400, 'INVALID_DATE');
    }

    const dayOfWeek = targetDate.getUTCDay();

    // 1. Check for Block Date Exception
    const exception = await prisma.availabilityException.findFirst({
      where: {
        interviewerId: interviewer.id,
        date: targetDate,
      },
    });

    if (exception && exception.isUnavailable) {
      return []; // Fully blocked date / holiday
    }

    // 2. Fetch Active Availability Rules for this Day of Week
    const rules = await prisma.availabilityRule.findMany({
      where: {
        interviewerId: interviewer.id,
        dayOfWeek,
        isActive: true,
      },
    });

    if (rules.length === 0) {
      return []; // No working hours configured for this day
    }

    // 3. Fetch Existing Bookings on this Date
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        interviewerId: interviewer.id,
        status: { in: [BookingStatus.REQUESTED, BookingStatus.CONFIRMED] },
        scheduledStart: { gte: startOfDay, lte: endOfDay },
      },
      select: { scheduledStart: true, scheduledEnd: true },
    });

    const now = new Date();
    const availableSlots: {
      startTime: string;
      endTime: string;
      formattedStart: string;
      formattedEnd: string;
      durationMinutes: number;
    }[] = [];

    // 4. Generate Slots Window by Window
    for (const rule of rules) {
      const [startHour, startMin] = rule.startTime.split(':').map(Number);
      const [endHour, endMin] = rule.endTime.split(':').map(Number);

      const windowStart = new Date(targetDate);
      windowStart.setUTCHours(startHour, startMin, 0, 0);

      const windowEnd = new Date(targetDate);
      windowEnd.setUTCHours(endHour, endMin, 0, 0);

      let currentSlotStart = new Date(windowStart);

      while (currentSlotStart.getTime() + durationMins * 60 * 1000 <= windowEnd.getTime()) {
        const currentSlotEnd = new Date(currentSlotStart.getTime() + durationMins * 60 * 1000);

        // Filter out past slots
        if (currentSlotStart > now) {
          // Check overlapping existing bookings
          const hasConflict = existingBookings.some((b) => {
            const bStart = new Date(b.scheduledStart).getTime();
            const bEnd = new Date(b.scheduledEnd).getTime();
            const sStart = currentSlotStart.getTime();
            const sEnd = currentSlotEnd.getTime();
            return sStart < bEnd && sEnd > bStart;
          });

          if (!hasConflict) {
            const formatTime = (d: Date) =>
              d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'UTC',
              });

            availableSlots.push({
              startTime: currentSlotStart.toISOString(),
              endTime: currentSlotEnd.toISOString(),
              formattedStart: formatTime(currentSlotStart),
              formattedEnd: formatTime(currentSlotEnd),
              durationMinutes: durationMins,
            });
          }
        }

        // Increment by slot duration + buffer minutes
        currentSlotStart = new Date(
          currentSlotStart.getTime() + (durationMins + rule.bufferMins) * 60 * 1000
        );
      }
    }

    return availableSlots;
  }
}

export const availabilityService = new AvailabilityService();
