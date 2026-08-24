import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { referenceCodeService } from './reference-code.service';
import { WalletTransactionType, Prisma } from '@prisma/client';

export interface LedgerEntryParams {
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
  createdBy?: string;
}

export class LedgerService {
  async entry(params: LedgerEntryParams) {
    if (params.amount <= 0) {
      throw new AppError('Ledger transaction amount must be greater than zero', 400, 'INVALID_AMOUNT');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Fetch current wallet balance
      const wallet = await tx.wallet.findUnique({
        where: { id: params.walletId },
      });

      if (!wallet) {
        throw new AppError('Wallet not found for ledger entry', 404, 'WALLET_NOT_FOUND');
      }

      const balanceBefore = wallet.balance;
      let balanceAfter = balanceBefore;
      let pendingAfter = wallet.pendingBalance;
      let withdrawableAfter = wallet.withdrawableBalance;
      let lifetimeCreditsAfter = wallet.lifetimeCredits;
      let lifetimeDebitsAfter = wallet.lifetimeDebits;
      let totalRefundsAfter = wallet.totalRefunds;

      switch (params.type) {
        case WalletTransactionType.CREDIT:
        case WalletTransactionType.BONUS:
          balanceAfter = balanceBefore + params.amount;
          lifetimeCreditsAfter += params.amount;
          break;

        case WalletTransactionType.DEBIT:
          if (balanceBefore < params.amount) {
            throw new AppError('Insufficient wallet balance', 400, 'INSUFFICIENT_BALANCE');
          }
          balanceAfter = balanceBefore - params.amount;
          lifetimeDebitsAfter += params.amount;
          break;

        case WalletTransactionType.REFUND:
          balanceAfter = balanceBefore + params.amount;
          totalRefundsAfter += params.amount;
          break;

        case WalletTransactionType.COMMISSION:
          // Platform fee deduction
          balanceAfter = balanceBefore - params.amount;
          break;

        case WalletTransactionType.SETTLEMENT:
          // Interviewer session completed settlement: pending -> withdrawable
          pendingAfter = Math.max(0, wallet.pendingBalance - params.amount);
          withdrawableAfter = wallet.withdrawableBalance + params.amount;
          balanceAfter = balanceBefore + params.amount;
          lifetimeCreditsAfter += params.amount;
          break;

        case WalletTransactionType.ADJUSTMENT:
        case WalletTransactionType.REVERSAL:
          balanceAfter = balanceBefore + params.amount;
          break;

        default:
          throw new AppError(`Unsupported ledger transaction type: ${params.type}`, 400, 'UNSUPPORTED_TYPE');
      }

      // 2. Generate unique reference code
      const refCode = await referenceCodeService.generateTransactionReferenceCode();

      // 3. Update Wallet Balances
      await tx.wallet.update({
        where: { id: params.walletId },
        data: {
          balance: balanceAfter,
          pendingBalance: pendingAfter,
          withdrawableBalance: withdrawableAfter,
          lifetimeCredits: lifetimeCreditsAfter,
          lifetimeDebits: lifetimeDebitsAfter,
          totalRefunds: totalRefundsAfter,
        },
      });

      // 4. Create Immutable Ledger Entry (INSERT ONLY)
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: params.walletId,
          referenceCode: refCode,
          type: params.type,
          amount: params.amount,
          balanceBefore,
          balanceAfter,
          description: params.description || null,
          metadata: params.metadata || Prisma.JsonNull,
          createdBy: params.createdBy || null,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: params.createdBy || null,
          action: `LEDGER_${params.type}`,
          entity: 'WalletTransaction',
          entityId: transaction.id,
          details: {
            walletId: params.walletId,
            referenceCode: refCode,
            amount: params.amount,
            balanceBefore,
            balanceAfter,
          },
        },
      });

      return transaction;
    });
  }

  // Convenience methods
  async credit(walletId: string, amount: number, description?: string, metadata?: any, createdBy?: string) {
    return this.entry({ walletId, type: WalletTransactionType.CREDIT, amount, description, metadata, createdBy });
  }

  async debit(walletId: string, amount: number, description?: string, metadata?: any, createdBy?: string) {
    return this.entry({ walletId, type: WalletTransactionType.DEBIT, amount, description, metadata, createdBy });
  }

  async refund(walletId: string, amount: number, description?: string, metadata?: any, createdBy?: string) {
    return this.entry({ walletId, type: WalletTransactionType.REFUND, amount, description, metadata, createdBy });
  }

  async settlement(walletId: string, amount: number, description?: string, metadata?: any, createdBy?: string) {
    return this.entry({ walletId, type: WalletTransactionType.SETTLEMENT, amount, description, metadata, createdBy });
  }

  async adjust(walletId: string, amount: number, description?: string, metadata?: any, createdBy?: string) {
    return this.entry({ walletId, type: WalletTransactionType.ADJUSTMENT, amount, description, metadata, createdBy });
  }
}

export const ledgerService = new LedgerService();
