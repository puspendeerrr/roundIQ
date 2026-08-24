import { Response, NextFunction } from 'express';
import { prisma } from '../../utils/prisma';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class ReputationController {
  async getMyReputation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const reputation = await prisma.reputation.findUnique({
        where: { userId },
      });
      const achievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      });

      return sendSuccess(res, { reputation, achievements }, 'User reputation and badges retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getPublicReputation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const reputation = await prisma.reputation.findUnique({
        where: { userId },
      });
      const achievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
      });

      return sendSuccess(res, { reputation, achievements }, 'Public reputation and badges retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const reputationController = new ReputationController();
