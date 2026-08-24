import { Response, NextFunction } from 'express';
import { interviewPackageService } from './interview-package.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class InterviewPackageController {
  async createPackage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const interviewerUserId = req.user!.userId;
      const { title, description, durationMinutes, price, preparationInstructions } = req.body;
      const pkg = await interviewPackageService.createPackage({
        interviewerUserId,
        title,
        description,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        preparationInstructions,
      });
      return sendSuccess(res, pkg, 'Interview package created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getInterviewerPackages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { interviewerId } = req.params;
      const packages = await interviewPackageService.getInterviewerPackages(interviewerId);
      return sendSuccess(res, packages, 'Interviewer packages retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const interviewPackageController = new InterviewPackageController();
