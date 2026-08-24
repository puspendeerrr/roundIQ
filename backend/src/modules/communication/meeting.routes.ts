import { Router } from 'express';
import { meetingController } from './meeting.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/:bookingId', (req, res, next) => meetingController.getMeeting(req, res, next));
router.patch('/:bookingId/status', (req, res, next) => meetingController.updateMeetingStatus(req, res, next));

export default router;
