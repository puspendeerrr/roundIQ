import { Router } from 'express';
import { bookingController } from './bookings.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Student Routes
router.post('/', authenticate, authorize([Role.STUDENT]), (req, res, next) =>
  bookingController.createBooking(req, res, next)
);

router.get('/student', authenticate, authorize([Role.STUDENT]), (req, res, next) =>
  bookingController.getStudentBookings(req, res, next)
);

// Interviewer Routes
router.get('/interviewer', authenticate, authorize([Role.INTERVIEWER]), (req, res, next) =>
  bookingController.getInterviewerBookings(req, res, next)
);

router.post('/:id/confirm', authenticate, authorize([Role.INTERVIEWER]), (req, res, next) =>
  bookingController.confirmBooking(req, res, next)
);

router.post('/:id/decline', authenticate, authorize([Role.INTERVIEWER]), (req, res, next) =>
  bookingController.declineBooking(req, res, next)
);

router.post('/:id/complete', authenticate, authorize([Role.INTERVIEWER, Role.ADMIN]), (req, res, next) =>
  bookingController.completeBooking(req, res, next)
);

// Shared Routes (Student / Interviewer / Admin)
router.get('/:id', authenticate, (req, res, next) =>
  bookingController.getBookingDetails(req, res, next)
);

router.post('/:id/cancel', authenticate, (req, res, next) =>
  bookingController.cancelBooking(req, res, next)
);

router.post('/:id/reschedule', authenticate, (req, res, next) =>
  bookingController.requestReschedule(req, res, next)
);

router.post('/reschedule/:rescheduleId/respond', authenticate, (req, res, next) =>
  bookingController.respondReschedule(req, res, next)
);

// Expiration trigger endpoint (Admin or Cron)
router.post('/expire-check', authenticate, authorize([Role.ADMIN]), (req, res, next) =>
  bookingController.runExpirationCheck(req, res, next)
);

export default router;
