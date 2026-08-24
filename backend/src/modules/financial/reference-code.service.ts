import { prisma } from '../../utils/prisma';

export class ReferenceCodeService {
  async generateTransactionReferenceCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.walletTransaction.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `TXN-${year}-${sequence}`;
  }

  async generateInvoiceNumber(prefix = 'INV'): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `${prefix}-${year}-${sequence}`;
  }
}

export const referenceCodeService = new ReferenceCodeService();
