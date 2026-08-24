import { Response, NextFunction } from 'express';
import { bookingService } from './bookings.service';
import { sendSuccess } from '../../utils/api-response';
import {
  createBookingSchema,
  declineBookingSchema,
  cancelBookingSchema,
  createRescheduleSchema,
  respondRescheduleSchema,
} from './bookings.validation';
import { AuthRequest } from '../../middleware/auth';
import { BookingStatus, Role } from '@prisma/client';

export class BookingController {
  async createBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentUserId = req.user!.userId;
      const validatedData = createBookingSchema.parse(req.body);
      const booking = await bookingService.createBooking(studentUserId, validatedData);
      return sendSuccess(res, booking, 'Booking request submitted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async confirmBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interviewerUserId = req.user!.userId;
      const { id } = req.params;
      const booking = await bookingService.confirmBooking(interviewerUserId, id);
      return sendSuccess(res, booking, 'Booking confirmed successfully');
    } catch (error) {
      return next(error);
    }
  }

  async declineBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interviewerUserId = req.user!.userId;
      const { id } = req.params;
      const validatedData = declineBookingSchema.parse(req.body);
      const booking = await bookingService.declineBooking(interviewerUserId, id, validatedData);
      return sendSuccess(res, booking, 'Booking request declined');
    } catch (error) {
      return next(error);
    }
  }

  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { id } = req.params;
      const validatedData = cancelBookingSchema.parse(req.body);
      const booking = await bookingService.cancelBooking(userId, userRole, id, validatedData);
      return sendSuccess(res, booking, 'Booking cancelled successfully');
    } catch (error) {
      return next(error);
    }
  }

  async completeBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interviewerUserId = req.user!.userId;
      const { id } = req.params;
      const booking = await bookingService.completeBooking(interviewerUserId, id);
      return sendSuccess(res, booking, 'Session marked as completed');
    } catch (error) {
      return next(error);
    }
  }

  async requestReschedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const validatedData = createRescheduleSchema.parse(req.body);
      const rescheduleReq = await bookingService.requestReschedule(userId, id, validatedData);
      return sendSuccess(res, rescheduleReq, 'Reschedule request submitted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async respondReschedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { rescheduleId } = req.params;
      const validatedData = respondRescheduleSchema.parse(req.body);
      const result = await bookingService.respondReschedule(userId, rescheduleId, validatedData);
      return sendSuccess(res, result, `Reschedule request ${result.status.toLowerCase()}`);
    } catch (error) {
      return next(error);
    }
  }

  async getStudentBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const studentUserId = req.user!.userId;
      const { status, page, limit } = req.query;
      const result = await bookingService.getStudentBookings(
        studentUserId,
        status as BookingStatus | undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Student bookings retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getInterviewerBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interviewerUserId = req.user!.userId;
      const { status, page, limit } = req.query;
      const result = await bookingService.getInterviewerBookings(
        interviewerUserId,
        status as BookingStatus | undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Interviewer bookings retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getBookingDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const booking = await bookingService.getBookingDetails(userId, id);
      return sendSuccess(res, booking, 'Booking details fetched successfully');
    } catch (error) {
      return next(error);
    }
  }

  async runExpirationCheck(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await bookingService.checkAndExpireBookings(24);
      return sendSuccess(res, result, `Processed expired bookings. ${result.expiredCount} bookings updated.`);
    } catch (error) {
      return next(error);
    }
  }
}

export const bookingController = new BookingController();
