import { Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class AttendanceController {
  async recordJoin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { bookingId, device } = req.body;
      const attendance = await attendanceService.recordJoin(bookingId, userId, device, req.ip);
      return sendSuccess(res, attendance, 'Session join recorded', 201);
    } catch (error) {
      return next(error);
    }
  }

  async recordLeave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { attendanceId } = req.params;
      const attendance = await attendanceService.recordLeave(attendanceId);
      return sendSuccess(res, attendance, 'Session leave recorded');
    } catch (error) {
      return next(error);
    }
  }

  async getAttendance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const items = await attendanceService.getSessionAttendance(bookingId);
      return sendSuccess(res, items, 'Session attendance history retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const attendanceController = new AttendanceController();
