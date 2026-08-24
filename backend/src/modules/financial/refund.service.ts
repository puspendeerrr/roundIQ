import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { ledgerService } from './ledger.service';
import { cancellationPolicyService } from './cancellation-policy.service';
import { RefundStatus, CancelledBy, Prisma } from '@prisma/client';

export interface ProcessRefundParams {
  bookingId: string;
  requestedByUserId: string;
  cancelledBy: CancelledBy;
  reason?: string;
  overrideAmount?: number;
}

export class RefundService {
  private async generateRefundReferenceCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.refund.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `RF-${year}-${sequence}`;
  }

  async processRefund(params: ProcessRefundParams) {
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { payments: { where: { status: 'CAPTURED' } } },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    const capturedPayment = booking.payments[0];
    const totalPaid = capturedPayment ? capturedPayment.amount : 1000;

    // Calculate refund using Cancellation Policy Engine
    const policy = cancellationPolicyService.calculateRefund(
      params.cancelledBy,
      booking.scheduledStart,
      totalPaid
    );

    const finalRefundAmount =
      params.overrideAmount !== undefined ? params.overrideAmount : policy.refundAmount;

    if (finalRefundAmount <= 0) {
      return {
        refunded: false,
        amount: 0,
        message: 'No refund applicable based on cancellation policy timing.',
      };
    }

    const referenceCode = await this.generateRefundReferenceCode();

    return prisma.$transaction(async (tx) => {
      // 1. Create Refund Record
      const refund = await tx.refund.create({
        data: {
          referenceCode,
          bookingId: booking.id,
          paymentId: capturedPayment ? capturedPayment.id : null,
          amount: finalRefundAmount,
          reason: params.reason || policy.policyDescription,
          status: RefundStatus.COMPLETED,
          requestedById: params.requestedByUserId,
          processedById: params.requestedByUserId,
          processedAt: new Date(),
        },
      });

      // 2. Fetch or create Student Wallet
      let studentWallet = await tx.wallet.findUnique({
        where: { userId: booking.studentId },
      });

      if (!studentWallet) {
        studentWallet = await tx.wallet.create({
          data: { userId: booking.studentId },
        });
      }

      // 3. Credit Refund through Centralized Ledger Engine
      await ledgerService.refund(
        studentWallet.id,
        finalRefundAmount,
        `Refund credited for booking ${booking.referenceCode}. Reason: ${params.reason || 'Cancellation policy'}`,
        { refundId: refund.id, bookingId: booking.id, referenceCode },
        params.requestedByUserId
      );

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: params.requestedByUserId,
          action: 'REFUND_PROCESSED',
          entity: 'Refund',
          entityId: refund.id,
          details: {
            referenceCode,
            bookingId: booking.id,
            amount: finalRefundAmount,
            cancelledBy: params.cancelledBy,
          },
        },
      });

      return {
        refunded: true,
        refund,
        amount: finalRefundAmount,
        policy,
      };
    });
  }

  async getUserRefunds(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.refund.findMany({
        where: { requestedById: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: { select: { id: true, referenceCode: true, scheduledStart: true } },
        },
      }),
      prisma.refund.count({ where: { requestedById: userId } }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAdminRefunds(status?: RefundStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: Prisma.RefundWhereInput = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.refund.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          requestedBy: { select: { id: true, email: true } },
          booking: { select: { id: true, referenceCode: true } },
        },
      }),
      prisma.refund.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const refundService = new RefundService();
