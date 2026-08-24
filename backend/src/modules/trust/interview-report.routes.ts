import { Router } from 'express';
import { interviewReportController } from './interview-report.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', authorize([Role.INTERVIEWER]), (req, res, next) =>
  interviewReportController.createReport(req, res, next)
);

router.get('/me', authorize([Role.STUDENT]), (req, res, next) =>
  interviewReportController.getMyReports(req, res, next)
);

router.get('/booking/:bookingId', (req, res, next) =>
  interviewReportController.getReportByBooking(req, res, next)
);

export default router;
