import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { ledgerService } from './ledger.service';
import { financialSettingsService } from './financial-settings.service';
import { WithdrawalStatus, PayoutMethod, Prisma } from '@prisma/client';

export interface RequestWithdrawalParams {
  userId: string;
  amount: number;
  method: PayoutMethod;
  accountDetails: Record<string, any>;
}

export class WithdrawalService {
  private async generateWithdrawalReferenceCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.withdrawal.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `WD-${year}-${sequence}`;
  }

  async requestWithdrawal(params: RequestWithdrawalParams) {
    const settings = await financialSettingsService.getSettings();

    if (params.amount < settings.minWithdrawalAmount) {
      throw new AppError(
        `Minimum withdrawal amount is ₹${settings.minWithdrawalAmount}`,
        400,
        'MINIMUM_WITHDRAWAL_UNMET'
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: params.userId },
    });

    if (!wallet) {
      throw new AppError('Wallet not found for user', 404, 'WALLET_NOT_FOUND');
    }

    if (wallet.withdrawableBalance < params.amount) {
      throw new AppError(
        `Insufficient withdrawable balance. Available: ₹${wallet.withdrawableBalance.toFixed(2)}`,
        400,
        'INSUFFICIENT_WITHDRAWABLE_BALANCE'
      );
    }

    const referenceCode = await this.generateWithdrawalReferenceCode();

    const withdrawal = await prisma.withdrawal.create({
      data: {
        referenceCode,
        walletId: wallet.id,
        amount: params.amount,
        method: params.method,
        accountDetails: params.accountDetails,
        status: WithdrawalStatus.PENDING,
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: params.userId,
        action: 'WITHDRAWAL_REQUESTED',
        entity: 'Withdrawal',
        entityId: withdrawal.id,
        details: {
          referenceCode,
          amount: params.amount,
          method: params.method,
        },
      },
    });

    return withdrawal;
  }

  async getUserWithdrawals(userId: string, page = 1, limit = 10) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { walletId: wallet.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.withdrawal.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getWithdrawalById(userId: string, withdrawalId: string) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { wallet: true },
    });

    if (!withdrawal || withdrawal.wallet.userId !== userId) {
      throw new AppError('Withdrawal request not found', 404, 'WITHDRAWAL_NOT_FOUND');
    }

    return withdrawal;
  }

  async adminProcessWithdrawal(
    adminUserId: string,
    withdrawalId: string,
    status: WithdrawalStatus,
    adminRemarks?: string
  ) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { wallet: true },
    });

    if (!withdrawal) {
      throw new AppError('Withdrawal record not found', 404, 'WITHDRAWAL_NOT_FOUND');
    }

    if (withdrawal.status === WithdrawalStatus.COMPLETED || withdrawal.status === WithdrawalStatus.REJECTED) {
      throw new AppError(`Cannot update withdrawal already in final status: ${withdrawal.status}`, 400, 'FINAL_STATUS_REACHED');
    }

    return prisma.$transaction(async (tx) => {
      // If marking COMPLETED, process debit through Ledger Service
      if (status === WithdrawalStatus.COMPLETED) {
        // Enforce ledger debit
        await ledgerService.debit(
          withdrawal.walletId,
          withdrawal.amount,
          `Withdrawal payout completed. Reference: ${withdrawal.referenceCode}`,
          { withdrawalId: withdrawal.id, referenceCode: withdrawal.referenceCode },
          adminUserId
        );

        // Deduct from withdrawableBalance
        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: {
            withdrawableBalance: Math.max(0, withdrawal.wallet.withdrawableBalance - withdrawal.amount),
          },
        });
      }

      const updated = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status,
          adminRemarks: adminRemarks || null,
          processedById: adminUserId,
          processedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminUserId,
          action: `WITHDRAWAL_${status}`,
          entity: 'Withdrawal',
          entityId: withdrawalId,
          details: {
            withdrawalId,
            referenceCode: withdrawal.referenceCode,
            status,
            amount: withdrawal.amount,
          },
        },
      });

      return updated;
    });
  }

  async getAdminWithdrawals(status?: WithdrawalStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.WithdrawalWhereInput = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: {
            include: { user: { select: { id: true, email: true } } },
          },
        },
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const withdrawalService = new WithdrawalService();
