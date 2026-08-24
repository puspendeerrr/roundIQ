import { Response, NextFunction } from 'express';
import { complianceService } from './compliance.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class ComplianceController {
  async exportUserData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await complianceService.exportUserData(userId);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=roundiq_user_data_${userId}.json`);
      return res.status(200).send(JSON.stringify(data, null, 2));
    } catch (error) {
      return next(error);
    }
  }

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await complianceService.deleteAccount(userId);
      return sendSuccess(res, result, 'Account deletion processed');
    } catch (error) {
      return next(error);
    }
  }

  async getLoginHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const history = await complianceService.getLoginHistory(userId);
      return sendSuccess(res, history, 'Security login history retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const complianceController = new ComplianceController();
