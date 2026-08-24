import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import {
  CreateBookingDTO,
  DeclineBookingDTO,
  CancelBookingDTO,
  CreateRescheduleDTO,
  RespondRescheduleDTO,
} from './bookings.validation';
import {
  BookingStatus,
  CancelledBy,
  RescheduleStatus,
  VerificationStatus,
  UserStatus,
  Role,
  Prisma,
} from '@prisma/client';

export class BookingService {
  // Helper to generate human-readable reference code
  private generateReferenceCode(sequence: number): string {
    const year = new Date().getFullYear();
    const padded = String(sequence).padStart(6, '0');
    return `RQ-${year}-${padded}`;
  }

  async createBooking(studentUserId: string, dto: CreateBookingDTO) {
    const start = new Date(dto.scheduledStart);
    const end = new Date(dto.scheduledEnd);
    const now = new Date();

    // 1. Authenticate & Verify Requester Account Status
    const studentUser = await prisma.user.findUnique({
      where: { id: studentUserId },
      include: { studentProfile: true },
    });

    if (!studentUser || studentUser.status !== UserStatus.ACTIVE) {
      throw new AppError('Student account is inactive or disabled', 403, 'USER_INACTIVE');
    }

    // 2. Verify Interviewer Status & Identity
    const interviewer = await prisma.interviewerProfile.findFirst({
      where: {
        id: dto.interviewerProfileId,
        verificationStatus: VerificationStatus.APPROVED,
        user: { status: UserStatus.ACTIVE },
      },
    });

    if (!interviewer) {
      throw new AppError('Interviewer is not verified or currently unavailable', 404, 'INTERVIEWER_UNAVAILABLE');
    }

    // Prevent student from booking themselves if user is also an interviewer
    if (interviewer.userId === studentUserId) {
      throw new AppError('You cannot book an interview session with yourself', 400, 'SELF_BOOKING_PROHIBITED');
    }

    // 3. Future Time Check
    if (start <= now) {
      throw new AppError('Booking start time must be strictly in the future', 400, 'PAST_TIME_PROHIBITED');
    }

    if (end <= start) {
      throw new AppError('Booking end time must be after start time', 400, 'INVALID_TIME_WINDOW');
    }

    // 4. Valid Duration Check
    const calcDurationMins = Math.round((end.getTime() - start.getTime()) / (60 * 1000));
    if (calcDurationMins !== dto.durationMinutes) {
      throw new AppError('Calculated slot time window does not match durationMinutes', 400, 'DURATION_MISMATCH');
    }

    // 5. Block Dates & Exceptions Check
    const startOfDay = new Date(start);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const exception = await prisma.availabilityException.findFirst({
      where: {
        interviewerId: interviewer.id,
        date: startOfDay,
      },
    });

    if (exception && exception.isUnavailable) {
      throw new AppError('Interviewer is not available on this date (Blocked/Holiday)', 400, 'DATE_BLOCKED');
    }

    // 6. Weekly Recurring Rules Check
    const dayOfWeek = start.getUTCDay();
    const rules = await prisma.availabilityRule.findMany({
      where: {
        interviewerId: interviewer.id,
        dayOfWeek,
        isActive: true,
      },
    });

    if (rules.length === 0) {
      throw new AppError('Interviewer does not have working hours configured for this day of week', 400, 'DAY_NOT_CONFIGURED');
    }

    // 7. Concurrency Lock & Transaction
    return prisma.$transaction(async (tx) => {
      // Check overlapping active bookings (REQUESTED or CONFIRMED)
      const existingOverlap = await tx.booking.findFirst({
        where: {
          interviewerId: interviewer.id,
          status: { in: [BookingStatus.REQUESTED, BookingStatus.CONFIRMED] },
          OR: [
            {
              scheduledStart: { lt: end },
              scheduledEnd: { gt: start },
            },
          ],
        },
      });

      if (existingOverlap) {
        throw new AppError('This time slot has already been reserved by another student', 409, 'SLOT_ALREADY_BOOKED');
      }

      // Generate next reference sequence
      const count = await tx.booking.count();
      const refCode = this.generateReferenceCode(count + 1);

      const resumeUrlToUse = dto.studentResumeUrl || studentUser.studentProfile?.resumeUrl || null;

      const booking = await tx.booking.create({
        data: {
          referenceCode: refCode,
          studentId: studentUserId,
          interviewerId: interviewer.id,
          categoryId: dto.categoryId || null,
          scheduledStart: start,
          scheduledEnd: end,
          durationMinutes: dto.durationMinutes,
          timezone: dto.timezone || studentUser.timezone || 'Asia/Kolkata',
          studentNotes: dto.studentNotes || null,
          studentResumeUrl: resumeUrlToUse,
          status: BookingStatus.REQUESTED,
          bookingSource: dto.bookingSource,
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: BookingStatus.REQUESTED,
              changedById: studentUserId,
              reason: 'Initial session booking request created by student',
            },
          },
        },
        include: {
          student: { select: { id: true, email: true, studentProfile: true } },
          interviewer: { select: { id: true, fullName: true, currentCompany: true, user: { select: { email: true, avatarUrl: true } } } },
          category: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      return booking;
    });
  }

  async confirmBooking(interviewerUserId: string, bookingId: string) {
    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { userId: interviewerUserId },
    });

    if (!interviewer) {
      throw new AppError('Interviewer profile not found', 404, 'INTERVIEWER_NOT_FOUND');
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, interviewerId: interviewer.id },
    });

    if (!booking) {
      throw new AppError('Booking not found or ownership mismatch', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.status !== BookingStatus.REQUESTED) {
      throw new AppError(`Cannot confirm booking in state: ${booking.status}`, 400, 'INVALID_STATE_TRANSITION');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CONFIRMED,
        statusHistory: {
          create: {
            fromStatus: BookingStatus.REQUESTED,
            toStatus: BookingStatus.CONFIRMED,
            changedById: interviewerUserId,
            reason: 'Booking request confirmed by interviewer',
          },
        },
      },
      include: {
        student: { select: { id: true, email: true, studentProfile: true } },
        interviewer: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    return updatedBooking;
  }

  async declineBooking(interviewerUserId: string, bookingId: string, dto: DeclineBookingDTO) {
    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { userId: interviewerUserId },
    });

    if (!interviewer) {
      throw new AppError('Interviewer profile not found', 404, 'INTERVIEWER_NOT_FOUND');
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, interviewerId: interviewer.id },
    });

    if (!booking) {
      throw new AppError('Booking not found or ownership mismatch', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.status !== BookingStatus.REQUESTED) {
      throw new AppError(`Cannot decline booking in state: ${booking.status}`, 400, 'INVALID_STATE_TRANSITION');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.DECLINED,
        declineReason: dto.reason || 'Declined by interviewer',
        statusHistory: {
          create: {
            fromStatus: BookingStatus.REQUESTED,
            toStatus: BookingStatus.DECLINED,
            changedById: interviewerUserId,
            reason: dto.reason || 'Booking request declined by interviewer',
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    return updatedBooking;
  }

  async cancelBooking(userId: string, userRole: Role, bookingId: string, dto: CancelBookingDTO) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { interviewer: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    // Ownership check
    if (userRole === Role.STUDENT && booking.studentId !== userId) {
      throw new AppError('You are not authorized to cancel this booking', 403, 'FORBIDDEN');
    }
    if (userRole === Role.INTERVIEWER && booking.interviewer.userId !== userId) {
      throw new AppError('You are not authorized to cancel this booking', 403, 'FORBIDDEN');
    }

    if (([BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.DECLINED, BookingStatus.EXPIRED] as BookingStatus[]).includes(booking.status)) {
      throw new AppError(`Cannot cancel booking in state: ${booking.status}`, 400, 'INVALID_STATE_TRANSITION');
    }

    let cancelledBy: CancelledBy = CancelledBy.STUDENT;
    if (userRole === Role.INTERVIEWER) cancelledBy = CancelledBy.INTERVIEWER;
    if (userRole === Role.ADMIN) cancelledBy = CancelledBy.ADMIN;

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledBy,
        cancellationReason: dto.reason,
        statusHistory: {
          create: {
            fromStatus: booking.status,
            toStatus: BookingStatus.CANCELLED,
            changedById: userId,
            reason: `Cancelled by ${cancelledBy}: ${dto.reason}`,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    return updatedBooking;
  }

  async completeBooking(interviewerUserId: string, bookingId: string) {
    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { userId: interviewerUserId },
    });

    if (!interviewer) {
      throw new AppError('Interviewer profile not found', 404, 'INTERVIEWER_NOT_FOUND');
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, interviewerId: interviewer.id },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new AppError('Only confirmed bookings can be marked completed', 400, 'INVALID_STATE_TRANSITION');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.COMPLETED,
        statusHistory: {
          create: {
            fromStatus: BookingStatus.CONFIRMED,
            toStatus: BookingStatus.COMPLETED,
            changedById: interviewerUserId,
            reason: 'Session completed successfully',
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    return updatedBooking;
  }

  // AUTO-EXPIRE REQUESTED BOOKINGS PAST TIMEOUT (DEFAULT 24 HOURS)
  async checkAndExpireBookings(timeoutHours = 24) {
    const cutoffTime = new Date(Date.now() - timeoutHours * 60 * 60 * 1000);

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.REQUESTED,
        createdAt: { lt: cutoffTime },
      },
    });

    for (const b of expiredBookings) {
      await prisma.booking.update({
        where: { id: b.id },
        data: {
          status: BookingStatus.EXPIRED,
          statusHistory: {
            create: {
              fromStatus: BookingStatus.REQUESTED,
              toStatus: BookingStatus.EXPIRED,
              reason: `Automatically expired after ${timeoutHours} hours without interviewer response`,
            },
          },
        },
      });
    }

    return { expiredCount: expiredBookings.length };
  }

  // DEDICATED RESCHEDULING WORKFLOW
  async requestReschedule(userId: string, bookingId: string, dto: CreateRescheduleDTO) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { interviewer: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.REQUESTED) {
      throw new AppError('Rescheduling is only permitted for active requests or confirmed bookings', 400, 'INVALID_STATE_TRANSITION');
    }

    const reqStart = new Date(dto.requestedStart);
    const reqEnd = new Date(dto.requestedEnd);

    if (reqStart <= new Date()) {
      throw new AppError('Requested reschedule start time must be in the future', 400, 'PAST_TIME');
    }

    const rescheduleReq = await prisma.bookingRescheduleRequest.create({
      data: {
        bookingId: booking.id,
        requesterId: userId,
        oldStart: booking.scheduledStart,
        oldEnd: booking.scheduledEnd,
        requestedStart: reqStart,
        requestedEnd: reqEnd,
        reason: dto.reason || null,
        status: RescheduleStatus.PENDING,
      },
    });

    return rescheduleReq;
  }

  async respondReschedule(userId: string, rescheduleId: string, dto: RespondRescheduleDTO) {
    const req = await prisma.bookingRescheduleRequest.findUnique({
      where: { id: rescheduleId },
      include: { booking: true },
    });

    if (!req || req.status !== RescheduleStatus.PENDING) {
      throw new AppError('Reschedule request not found or no longer pending', 404, 'REQUEST_INVALID');
    }

    if (dto.accept) {
      // Update original booking dates
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: req.bookingId },
          data: {
            scheduledStart: req.requestedStart,
            scheduledEnd: req.requestedEnd,
            statusHistory: {
              create: {
                fromStatus: req.booking.status,
                toStatus: req.booking.status,
                changedById: userId,
                reason: `Reschedule request accepted. Slot updated to ${req.requestedStart.toISOString()}`,
              },
            },
          },
        }),
        prisma.bookingRescheduleRequest.update({
          where: { id: req.id },
          data: { status: RescheduleStatus.ACCEPTED },
        }),
      ]);
    } else {
      await prisma.bookingRescheduleRequest.update({
        where: { id: req.id },
        data: { status: RescheduleStatus.DECLINED },
      });
    }

    return { success: true, status: dto.accept ? 'ACCEPTED' : 'DECLINED' };
  }

  async getStudentBookings(studentUserId: string, status?: BookingStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.BookingWhereInput = { studentId: studentUserId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledStart: 'desc' },
        include: {
          interviewer: {
            include: { user: { select: { avatarUrl: true } } },
          },
          category: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          rescheduleRequests: { orderBy: { createdAt: 'desc' } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getInterviewerBookings(interviewerUserId: string, status?: BookingStatus, page = 1, limit = 10) {
    const interviewer = await prisma.interviewerProfile.findUnique({
      where: { userId: interviewerUserId },
    });

    if (!interviewer) {
      throw new AppError('Interviewer profile not found', 404, 'INTERVIEWER_NOT_FOUND');
    }

    const skip = (page - 1) * limit;
    const where: Prisma.BookingWhereInput = { interviewerId: interviewer.id };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledStart: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              email: true,
              studentProfile: true,
            },
          },
          category: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
          rescheduleRequests: { orderBy: { createdAt: 'desc' } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getBookingDetails(userId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: { select: { id: true, email: true, studentProfile: true } },
        interviewer: { include: { user: { select: { email: true, avatarUrl: true } } } },
        category: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { id: true, email: true, role: true } } },
        },
        rescheduleRequests: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    return booking;
  }
}

export const bookingService = new BookingService();
