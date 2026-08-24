import { Request, Response, NextFunction } from 'express';
import { interviewerService } from './interviewers.service';
import { sendSuccess } from '../../utils/api-response';
import { updateInterviewerProfileSchema } from './interviewers.validation';
import { AuthRequest } from '../../middleware/auth';

export class InterviewerController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await interviewerService.getProfile(userId);
      return sendSuccess(res, profile, 'Interviewer profile fetched successfully');
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = updateInterviewerProfileSchema.parse(req.body);
      const updatedProfile = await interviewerService.updateProfile(userId, validatedData);
      return sendSuccess(res, updatedProfile, 'Interviewer profile updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async applyForVerification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updatedProfile = await interviewerService.applyForVerification(userId);
      return sendSuccess(
        res,
        updatedProfile,
        'Profile submitted for verification successfully. Admins will review your request shortly.'
      );
    } catch (error) {
      return next(error);
    }
  }

  async searchDirectory(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, category, skills, company, minExperience, maxExperience, page, limit, sortBy } = req.query;

      let parsedSkills: string[] | undefined = undefined;
      if (skills) {
        parsedSkills = typeof skills === 'string' ? skills.split(',') : (skills as string[]);
      }

      const result = await interviewerService.searchDirectory({
        search: search as string,
        category: category as string,
        skills: parsedSkills,
        company: company as string,
        minExperience: minExperience ? Number(minExperience) : undefined,
        maxExperience: maxExperience ? Number(maxExperience) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
        sortBy: sortBy as any,
      });

      return sendSuccess(res, result.items, 'Public directory retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getPublicProfileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const profile = await interviewerService.getPublicProfileById(id);
      return sendSuccess(res, profile, 'Public interviewer profile retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const interviewerController = new InterviewerController();
