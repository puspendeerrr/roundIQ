import { Response, NextFunction } from 'express';
import { studentService } from './students.service';
import { sendSuccess } from '../../utils/api-response';
import { updateStudentProfileSchema } from './students.validation';
import { AuthRequest } from '../../middleware/auth';

export class StudentController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await studentService.getProfile(userId);
      return sendSuccess(res, profile, 'Student profile fetched successfully');
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = updateStudentProfileSchema.parse(req.body);
      const updatedProfile = await studentService.updateProfile(userId, validatedData);
      return sendSuccess(res, updatedProfile, 'Student profile updated successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const studentController = new StudentController();
