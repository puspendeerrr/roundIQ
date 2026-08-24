import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { referenceCodeService } from './reference-code.service';
import { financialSettingsService } from './financial-settings.service';
import { InvoiceStatus, Currency } from '@prisma/client';

export interface CreateInvoiceParams {
  userId: string;
  bookingId?: string;
  subtotal: number;
  tax: number;
  total: number;
  currency?: Currency;
}

export class InvoiceService {
  async generateInvoice(params: CreateInvoiceParams) {
    const settings = await financialSettingsService.getSettings();
    const invoiceNumber = await referenceCodeService.generateInvoiceNumber(settings.invoicePrefix);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId: params.userId,
        bookingId: params.bookingId || null,
        subtotal: params.subtotal,
        tax: params.tax,
        total: params.total,
        currency: params.currency || settings.currency,
        status: InvoiceStatus.GENERATED,
        pdfPath: null, // Placeholder for PDF rendering service
      },
      include: {
        user: { select: { id: true, email: true } },
        booking: { select: { id: true, referenceCode: true, scheduledStart: true } },
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: params.userId,
        action: 'INVOICE_GENERATED',
        entity: 'Invoice',
        entityId: invoice.id,
        details: {
          invoiceNumber,
          total: params.total,
          currency: invoice.currency,
        },
      },
    });

    return invoice;
  }

  async getInvoiceById(userId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: {
        user: { select: { id: true, email: true } },
        booking: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
    }

    return invoice;
  }

  async getUserInvoices(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: { select: { id: true, referenceCode: true } },
        },
      }),
      prisma.invoice.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const invoiceService = new InvoiceService();
