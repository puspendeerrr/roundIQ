import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/join', (req, res, next) => attendanceController.recordJoin(req, res, next));
router.post('/leave/:attendanceId', (req, res, next) => attendanceController.recordLeave(req, res, next));
router.get('/:bookingId', (req, res, next) => attendanceController.getAttendance(req, res, next));

export default router;
