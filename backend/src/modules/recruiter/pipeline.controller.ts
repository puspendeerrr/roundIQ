import { Response, NextFunction } from 'express';
import { pipelineService } from './pipeline.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class PipelineController {
  async addToPipeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobId, candidateId, stage, remarks } = req.body;
      const result = await pipelineService.addToPipeline(jobId, candidateId, stage, remarks);
      return sendSuccess(res, result, 'Candidate added to hiring pipeline', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateStage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { stage, remarks } = req.body;
      const result = await pipelineService.updateStage(id, stage, remarks);
      return sendSuccess(res, result, 'Pipeline stage updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getJobPipeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const result = await pipelineService.getJobPipeline(jobId);
      return sendSuccess(res, result, 'Job recruitment pipeline retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const pipelineController = new PipelineController();
