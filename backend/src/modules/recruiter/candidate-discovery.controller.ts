import { Response, NextFunction } from 'express';
import { candidateDiscoveryEngine } from './candidate-discovery.engine';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class CandidateDiscoveryController {
  async discoverCandidates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, verdict, minScore, minTrustScore, college, page, limit } = req.query;
      const result = await candidateDiscoveryEngine.discoverCandidates({
        search: search as string,
        verdict: verdict as any,
        minScore: minScore ? Number(minScore) : undefined,
        minTrustScore: minTrustScore ? Number(minTrustScore) : undefined,
        college: college as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });
      return sendSuccess(res, result.items, 'Candidates discovered successfully', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }
}

export const candidateDiscoveryController = new CandidateDiscoveryController();
