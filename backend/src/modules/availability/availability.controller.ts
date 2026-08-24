import { Request, Response, NextFunction } from 'express';
import { availabilityService } from './availability.service';
import { sendSuccess } from '../../utils/api-response';
import { setWeeklyAvailabilitySchema, addExceptionSchema } from './availability.validation';
import { AuthRequest } from '../../middleware/auth';

export class AvailabilityController {
  async getMyAvailability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await availabilityService.getInterviewerAvailability(userId);
      return sendSuccess(res, data, 'Interviewer availability fetched successfully');
    } catch (error) {
      return next(error);
    }
  }

  async setWeeklyRules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = setWeeklyAvailabilitySchema.parse(req.body);
      const data = await availabilityService.setWeeklyRules(userId, validatedData);
      return sendSuccess(res, data, 'Weekly availability rules updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async addException(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = addExceptionSchema.parse(req.body);
      const exception = await availabilityService.addException(userId, validatedData);
      return sendSuccess(res, exception, 'Block date / exception added successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async deleteException(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await availabilityService.deleteException(userId, id);
      return sendSuccess(res, result, 'Exception removed successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getPublicAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { date, duration } = req.query;

      if (!date || typeof date !== 'string') {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_DATE', message: 'Query parameter date (YYYY-MM-DD) is required' },
        });
      }

      const durationMins = duration ? Number(duration) : 60;
      const slots = await availabilityService.getAvailableSlots(id, date, durationMins);
      return sendSuccess(res, slots, 'Available booking slots generated successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const availabilityController = new AvailabilityController();
