import { Response, NextFunction } from 'express';
import { auditCenterService } from './audit-center.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class AuditController {
  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { action, entity, page, limit } = req.query;
      const result = await auditCenterService.getAuditLogs(
        action as string,
        entity as string,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      return sendSuccess(res, result.items, 'Admin audit logs retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }
}

export const auditController = new AuditController();
