import { Response, NextFunction } from 'express';
import { refundService } from './refund.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';
import { CancelledBy } from '@prisma/client';

export class RefundController {
  async processRefund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { bookingId, cancelledBy, reason, overrideAmount } = req.body;
      const result = await refundService.processRefund({
        bookingId,
        requestedByUserId: userId,
        cancelledBy: cancelledBy || CancelledBy.STUDENT,
        reason,
        overrideAmount,
      });
      return sendSuccess(res, result, 'Refund request processed successfully', 200);
    } catch (error) {
      return next(error);
    }
  }

  async getMyRefunds(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { page, limit } = req.query;
      const result = await refundService.getUserRefunds(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Refund history retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }
}

export const refundController = new RefundController();
