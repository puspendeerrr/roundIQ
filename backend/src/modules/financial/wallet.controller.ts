import { Response, NextFunction } from 'express';
import { walletService } from './wallet.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';
import { WalletTransactionType } from '@prisma/client';

export class WalletController {
  async getMyWallet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const wallet = await walletService.getOrCreateWallet(userId);
      return sendSuccess(res, wallet, 'Wallet details retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getMyTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { type, page, limit } = req.query;
      const result = await walletService.getWalletTransactions(
        userId,
        type as WalletTransactionType | undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Wallet ledger transactions retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async getMySummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const summary = await walletService.getWalletSummary(userId);
      return sendSuccess(res, summary, 'Wallet summary metrics retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const walletController = new WalletController();
