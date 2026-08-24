import { Response, NextFunction } from 'express';
import { withdrawalService } from './withdrawal.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';
import { requestWithdrawalSchema } from './withdrawal.validation';

export class WithdrawalController {
  async requestWithdrawal(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validatedData = requestWithdrawalSchema.parse(req.body);
      const result = await withdrawalService.requestWithdrawal({
        userId,
        amount: validatedData.amount,
        method: validatedData.method,
        accountDetails: validatedData.accountDetails,
      });
      return sendSuccess(res, result, 'Withdrawal request submitted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getMyWithdrawals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { page, limit } = req.query;
      const result = await withdrawalService.getUserWithdrawals(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Withdrawal history retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getWithdrawalById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await withdrawalService.getWithdrawalById(userId, id);
      return sendSuccess(res, result, 'Withdrawal details retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const withdrawalController = new WithdrawalController();
