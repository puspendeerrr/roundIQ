import { Response, NextFunction } from 'express';
import { meetingService } from './meeting.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class MeetingController {
  async getMeeting(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { bookingId } = req.params;
      const meeting = await meetingService.getMeetingByBookingId(userId, bookingId);
      return sendSuccess(res, meeting, 'Meeting details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async updateMeetingStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;
      const meeting = await meetingService.updateMeetingStatus(bookingId, status);
      return sendSuccess(res, meeting, 'Meeting status updated');
    } catch (error) {
      return next(error);
    }
  }
}

export const meetingController = new MeetingController();
