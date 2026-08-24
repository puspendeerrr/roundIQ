import { prisma } from '../../utils/prisma';

export class AdminExportService {
  async exportBookingsCSV(): Promise<string> {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: {
        student: { select: { email: true } },
        interviewer: { select: { fullName: true } },
      },
    });

    const headers = 'ReferenceCode,StudentEmail,InterviewerName,ScheduledStart,Status,DurationMins,CreatedAt\n';
    const rows = bookings
      .map(
        (b) =>
          `"${b.referenceCode}","${b.student?.email}","${b.interviewer?.fullName}","${b.scheduledStart.toISOString()}","${b.status}",${b.durationMinutes},"${b.createdAt.toISOString()}"`
      )
      .join('\n');

    return headers + rows;
  }

  async exportRevenueCSV(): Promise<string> {
    const payments = await prisma.payment.findMany({
      where: { status: 'CAPTURED' },
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: {
        payer: { select: { email: true } },
      },
    });

    const headers = 'PaymentRef,PayerEmail,TotalAmount,PlatformCommission,InterviewerPayout,Status,CreatedAt\n';
    const rows = payments
      .map(
        (p) =>
          `"${p.referenceCode}","${p.payer?.email}",${p.amount},${p.platformCommission},${p.interviewerAmount},"${p.status}","${p.createdAt.toISOString()}"`
      )
      .join('\n');

    return headers + rows;
  }
}

export const adminExportService = new AdminExportService();
