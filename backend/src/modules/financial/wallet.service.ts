import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { WalletTransactionType, Prisma } from '@prisma/client';

export class WalletService {
  async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
      });
    }

    return wallet;
  }

  async getWalletTransactions(userId: string, type?: WalletTransactionType, page = 1, limit = 10) {
    const wallet = await this.getOrCreateWallet(userId);
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = {
      walletId: wallet.id,
    };

    if (type) {
      where.type = type;
    }

    const [items, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWalletSummary(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const transactionCount = await prisma.walletTransaction.count({
      where: { walletId: wallet.id },
    });

    return {
      walletId: wallet.id,
      balance: wallet.balance,
      pendingBalance: wallet.pendingBalance,
      withdrawableBalance: wallet.withdrawableBalance,
      lifetimeCredits: wallet.lifetimeCredits,
      lifetimeDebits: wallet.lifetimeDebits,
      totalRefunds: wallet.totalRefunds,
      transactionCount,
      updatedAt: wallet.updatedAt,
    };
  }
}

export const walletService = new WalletService();
