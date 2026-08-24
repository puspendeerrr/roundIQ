import { Response, NextFunction } from 'express';
import { businessReportService } from './business-report.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class BusinessReportsController {
  async getExecutiveReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await businessReportService.getExecutiveBusinessReport();
      return sendSuccess(res, report, 'Executive business report generated');
    } catch (error) {
      return next(error);
    }
  }
}

export const businessReportsController = new BusinessReportsController();
