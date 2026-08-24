import { Response, NextFunction } from 'express';
import { jobService } from './job.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class JobController {
  async createJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recruiterUserId = req.user!.userId;
      const job = await jobService.createJob({
        recruiterUserId,
        ...req.body,
      });
      return sendSuccess(res, job, 'Job posting created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getMyJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recruiterUserId = req.user!.userId;
      const { page, limit } = req.query;
      const result = await jobService.getRecruiterJobs(
        recruiterUserId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Recruiter jobs retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async updateJobStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recruiterUserId = req.user!.userId;
      const { id } = req.params;
      const { status } = req.body;
      const job = await jobService.updateJobStatus(recruiterUserId, id, status);
      return sendSuccess(res, job, 'Job status updated');
    } catch (error) {
      return next(error);
    }
  }

  async getPublicJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, location, workMode, page, limit } = req.query;
      const result = await jobService.getPublicJobs(
        search as string,
        location as string,
        workMode as any,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Public job openings retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }
}

export const jobController = new JobController();
