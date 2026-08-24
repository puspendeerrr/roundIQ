import crypto from 'crypto';
import { prisma } from '../../utils/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error-handler';
import { commissionService } from '../financial/commission.service';
import { ledgerService } from '../financial/ledger.service';
import { invoiceService } from '../financial/invoice.service';
import { referenceCodeService } from '../financial/reference-code.service';
import { CreatePaymentOrderDTO, VerifyPaymentSignatureDTO } from './payments.validation';
import {
  PaymentStatus,
  PaymentMethod,
  BookingStatus,
  WalletTransactionType,
  Currency,
} from '@prisma/client';

export class PaymentsService {
  // Helper to generate reference code PAY-2026-000001
  private async generatePaymentReferenceCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.payment.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `PAY-${year}-${sequence}`;
  }

  // 1. CREATE RAZORPAY ORDER
  async createPaymentOrder(studentUserId: string, dto: CreatePaymentOrderDTO) {
    const booking = await prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { interviewer: true },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    if (booking.studentId !== studentUserId) {
      throw new AppError('Unauthorized to pay for this booking', 403, 'FORBIDDEN');
    }

    if (booking.status !== BookingStatus.REQUESTED) {
      throw new AppError(`Only REQUESTED bookings may be paid. Current status: ${booking.status}`, 400, 'INVALID_BOOKING_STATUS');
    }

    // Calculate booking fee dynamically
    // Default base fee per hour e.g. ₹1000 for 60 min session
    const baseFee = (booking.durationMinutes / 60) * 1000;
    const calc = await commissionService.calculate(baseFee);

    // Mock/Real Razorpay Order Generation
    const razorpayOrderId = `order_${crypto.randomBytes(12).toString('hex')}`;
    const referenceCode = await this.generatePaymentReferenceCode();

    const payment = await prisma.payment.create({
      data: {
        referenceCode,
        bookingId: booking.id,
        payerId: studentUserId,
        amount: calc.totalWithTax,
        currency: Currency.INR,
        platformCommission: calc.platformCommissionAmount,
        interviewerAmount: calc.interviewerEarningAmount,
        razorpayOrderId,
        status: PaymentStatus.PENDING,
        metadata: {
          calculation: JSON.parse(JSON.stringify(calc)),
        },
      },
    });

    return {
      paymentId: payment.id,
      referenceCode: payment.referenceCode,
      razorpayOrderId,
      amount: Math.round(calc.totalWithTax * 100), // Amount in paise
      amountFormatted: calc.totalWithTax,
      currency: 'INR',
      key: env.RAZORPAY_KEY_ID,
      calculation: calc,
    };
  }

  // 2. VERIFY HMAC SIGNATURE (CLIENT FALLBACK)
  async verifyPayment(studentUserId: string, dto: VerifyPaymentSignatureDTO) {
    const payment = await prisma.payment.findFirst({
      where: {
        razorpayOrderId: dto.razorpayOrderId,
        bookingId: dto.bookingId,
      },
    });

    if (!payment) {
      throw new AppError('Payment record not found', 404, 'PAYMENT_NOT_FOUND');
    }

    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    const isValid = generatedSignature === dto.razorpaySignature;

    if (!isValid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      throw new AppError('Invalid payment signature', 400, 'INVALID_SIGNATURE');
    }

    return { success: true, paymentId: payment.id, referenceCode: payment.referenceCode };
  }

  // 3. SECURE WEBHOOK HANDLER (SINGLE SOURCE OF TRUTH)
  async handleWebhook(rawBody: string, signatureHeader: string | undefined, body: any) {
    if (!signatureHeader) {
      throw new AppError('Missing Razorpay webhook signature header', 400, 'MISSING_SIGNATURE');
    }

    // Verify Webhook HMAC Signature
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signatureHeader) {
      throw new AppError('Invalid webhook signature', 400, 'INVALID_WEBHOOK_SIGNATURE');
    }

    const eventId = body?.event_id || body?.id || `evt_${crypto.randomBytes(8).toString('hex')}`;
    const eventType = body?.event || 'payment.captured';

    // Idempotency check in PaymentWebhookEvent table
    const existingEvent = await prisma.paymentWebhookEvent.findUnique({
      where: { eventId },
    });

    if (existingEvent && existingEvent.processed) {
      return { success: true, duplicate: true, eventId };
    }

    // Record webhook event
    const webhookRecord = await prisma.paymentWebhookEvent.upsert({
      where: { eventId },
      update: { payload: body, signature: signatureHeader },
      create: {
        eventId,
        eventType,
        payload: body,
        signature: signatureHeader,
        processed: false,
      },
    });

    // Handle payment.captured or payment.failed event
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const entity = body?.payload?.payment?.entity || body?.payload?.order?.entity;
      const razorpayOrderId = entity?.order_id || entity?.id;
      const razorpayPaymentId = entity?.id;

      if (razorpayOrderId) {
        const payment = await prisma.payment.findFirst({
          where: { razorpayOrderId },
          include: { booking: { include: { interviewer: true } } },
        });

        if (payment && payment.status === PaymentStatus.PENDING) {
          // EXECUTE EVERYTHING INSIDE ONE ATOMIC DATABASE TRANSACTION
          await prisma.$transaction(async (tx) => {
            // A. Update Payment status to CAPTURED
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.CAPTURED,
                razorpayPaymentId: razorpayPaymentId || `pay_${crypto.randomBytes(8).toString('hex')}`,
                paymentMethod: PaymentMethod.CARD,
                gatewayResponse: entity,
              },
            });

            // B. Confirm Booking
            if (payment.bookingId) {
              await tx.booking.update({
                where: { id: payment.bookingId },
                data: {
                  status: BookingStatus.CONFIRMED,
                  statusHistory: {
                    create: {
                      fromStatus: BookingStatus.REQUESTED,
                      toStatus: BookingStatus.CONFIRMED,
                      changedById: payment.payerId,
                      reason: `Booking payment confirmed via Razorpay. Reference: ${payment.referenceCode}`,
                    },
                  },
                },
              });
            }

            // C. Update Interviewer Wallet Pending Balance
            const interviewerUser = await tx.interviewerProfile.findUnique({
              where: { id: payment.booking!.interviewerId },
            });

            if (interviewerUser) {
              const interviewerWallet = await tx.wallet.findUnique({
                where: { userId: interviewerUser.userId },
              });

              if (interviewerWallet) {
                await tx.wallet.update({
                  where: { id: interviewerWallet.id },
                  data: {
                    pendingBalance: interviewerWallet.pendingBalance + payment.interviewerAmount,
                  },
                });
              }
            }

            // D. Generate Invoice
            const calc = await commissionService.calculate(payment.amount);
            const invoiceNumber = await referenceCodeService.generateInvoiceNumber('INV');

            await tx.invoice.create({
              data: {
                invoiceNumber,
                userId: payment.payerId,
                bookingId: payment.bookingId,
                paymentId: payment.id,
                subtotal: payment.amount - calc.gstAmount,
                tax: calc.gstAmount,
                total: payment.amount,
                status: 'GENERATED',
              },
            });

            // E. Mark Webhook Processed
            await tx.paymentWebhookEvent.update({
              where: { id: webhookRecord.id },
              data: { processed: true, processedAt: new Date() },
            });
          });
        }
      }
    }

    return { success: true, processed: true, eventId };
  }

  async getStudentPayments(studentUserId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where: { payerId: studentUserId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: { select: { id: true, referenceCode: true, scheduledStart: true } },
          invoices: true,
        },
      }),
      prisma.payment.count({ where: { payerId: studentUserId } }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAdminPayments(search?: string, status?: PaymentStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { referenceCode: { contains: search.trim(), mode: 'insensitive' } },
        { razorpayOrderId: { contains: search.trim(), mode: 'insensitive' } },
        { razorpayPaymentId: { contains: search.trim(), mode: 'insensitive' } },
        { payer: { email: { contains: search.trim(), mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          payer: { select: { id: true, email: true } },
          booking: { select: { id: true, referenceCode: true, scheduledStart: true } },
          invoices: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const paymentsService = new PaymentsService();
